//! Le terminal intégré : un vrai shell dans un pseudo-terminal, ouvert dans le workspace.
//!
//! Le front (xterm.js) envoie les touches avec `terminal_write` et reçoit la sortie par un
//! `Channel`. Chaque terminal a un identifiant ; on peut en ouvrir plusieurs.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::path::Path;
use std::sync::Mutex;
use std::sync::atomic::{AtomicU32, Ordering};

use portable_pty::{CommandBuilder, MasterPty, PtySize, native_pty_system};

use crate::error::{AppError, AppResult};

struct Session {
    master: Box<dyn MasterPty + Send>,
    writer: Box<dyn Write + Send>,
}

#[derive(Default)]
pub struct Terminals {
    next_id: AtomicU32,
    sessions: Mutex<HashMap<u32, Session>>,
}

fn pty_err(err: impl std::fmt::Display) -> AppError {
    AppError::Terminal(err.to_string())
}

/// Le shell de l'apprenant : `$SHELL` sur macOS et Linux, PowerShell sur Windows.
fn default_shell() -> CommandBuilder {
    if cfg!(windows) {
        CommandBuilder::new("powershell.exe")
    } else {
        let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".into());
        let mut cmd = CommandBuilder::new(shell);
        cmd.arg("-l");
        cmd
    }
}

impl Terminals {
    /// Ouvre un shell dans `cwd` ; `on_output` reçoit la sortie, déjà découpée en texte UTF-8 valide.
    pub fn spawn(
        &self,
        cwd: &Path,
        cols: u16,
        rows: u16,
        on_output: impl Fn(String) + Send + 'static,
    ) -> AppResult<u32> {
        let pair = native_pty_system()
            .openpty(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(pty_err)?;
        let mut cmd = default_shell();
        cmd.cwd(cwd);
        cmd.env("TERM", "xterm-256color");
        let mut child = pair.slave.spawn_command(cmd).map_err(pty_err)?;
        drop(pair.slave);

        let mut reader = pair.master.try_clone_reader().map_err(pty_err)?;
        let writer = pair.master.take_writer().map_err(pty_err)?;
        std::thread::spawn(move || {
            let mut decoder = Utf8Chunks::default();
            let mut buf = [0u8; 8192];
            while let Ok(n) = reader.read(&mut buf) {
                if n == 0 {
                    break;
                }
                let text = decoder.push(&buf[..n]);
                if !text.is_empty() {
                    on_output(text);
                }
            }
            let _ = child.wait();
        });

        let id = self.next_id.fetch_add(1, Ordering::Relaxed);
        self.sessions.lock().map_err(pty_err)?.insert(
            id,
            Session {
                master: pair.master,
                writer,
            },
        );
        Ok(id)
    }

    pub fn write(&self, id: u32, data: &str) -> AppResult<()> {
        let mut sessions = self.sessions.lock().map_err(pty_err)?;
        let session = sessions
            .get_mut(&id)
            .ok_or_else(|| pty_err(format!("terminal {id} fermé")))?;
        session.writer.write_all(data.as_bytes())?;
        Ok(session.writer.flush()?)
    }

    pub fn resize(&self, id: u32, cols: u16, rows: u16) -> AppResult<()> {
        let sessions = self.sessions.lock().map_err(pty_err)?;
        let session = sessions
            .get(&id)
            .ok_or_else(|| pty_err(format!("terminal {id} fermé")))?;
        session
            .master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(pty_err)
    }

    /// Fermer le maître envoie SIGHUP au shell, qui s'arrête.
    pub fn close(&self, id: u32) -> AppResult<()> {
        self.sessions.lock().map_err(pty_err)?.remove(&id);
        Ok(())
    }
}

/// Recolle les caractères UTF-8 coupés entre deux lectures du pty.
#[derive(Default)]
struct Utf8Chunks {
    pending: Vec<u8>,
}

impl Utf8Chunks {
    fn push(&mut self, bytes: &[u8]) -> String {
        self.pending.extend_from_slice(bytes);
        let valid = match std::str::from_utf8(&self.pending) {
            Ok(_) => self.pending.len(),
            // Une séquence incomplète en fin de tampon attend la lecture suivante ;
            // un octet vraiment invalide est remplacé.
            Err(e) if e.error_len().is_none() => e.valid_up_to(),
            Err(_) => {
                let text = String::from_utf8_lossy(&self.pending).into_owned();
                self.pending.clear();
                return text;
            }
        };
        let rest = self.pending.split_off(valid);
        String::from_utf8(std::mem::replace(&mut self.pending, rest)).unwrap_or_default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn utf8_split_across_reads_is_glued_back() {
        let mut chunks = Utf8Chunks::default();
        let bytes = "leçon".as_bytes();
        // « ç » tient sur deux octets : on coupe entre les deux.
        let cut = 3;
        assert_eq!(chunks.push(&bytes[..cut]), "le");
        assert_eq!(chunks.push(&bytes[cut..]), "çon");
    }

    #[test]
    fn invalid_bytes_are_replaced() {
        let mut chunks = Utf8Chunks::default();
        assert_eq!(chunks.push(&[b'a', 0xff, b'b']), "a\u{fffd}b");
    }

    #[cfg(unix)]
    #[test]
    fn runs_a_command_in_the_workspace() {
        use std::sync::mpsc;
        use std::time::{Duration, Instant};

        let tmp = tempfile::tempdir().expect("tempdir");
        let terminals = Terminals::default();
        let (tx, rx) = mpsc::channel();
        let id = terminals
            .spawn(tmp.path(), 80, 24, move |text| {
                let _ = tx.send(text);
            })
            .expect("spawn");
        terminals
            .write(id, "echo bonjour-$((40+2))\n")
            .expect("write");

        let deadline = Instant::now() + Duration::from_secs(10);
        let mut seen = String::new();
        while !seen.contains("bonjour-42") && Instant::now() < deadline {
            if let Ok(text) = rx.recv_timeout(Duration::from_millis(200)) {
                seen.push_str(&text);
            }
        }
        terminals.close(id).expect("close");
        assert!(seen.contains("bonjour-42"), "sortie : {seen:?}");
    }
}
