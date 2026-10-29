//! Surveille le workspace : l'arbre et l'éditeur suivent ce que l'apprenant fait dans le
//! terminal (`cargo new`, `touch`…) ou ce que son outil d'IA modifie.
//!
//! Un seul workspace est surveillé à la fois : en surveiller un autre remplace le précédent.

use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;

use notify_debouncer_mini::notify::{RecommendedWatcher, RecursiveMode};
use notify_debouncer_mini::{DebounceEventResult, Debouncer, new_debouncer};

use crate::error::{AppError, AppResult};
use crate::workspace::HIDDEN;

#[derive(Default)]
pub struct Watcher {
    current: Mutex<Option<Debouncer<RecommendedWatcher>>>,
}

fn watch_err(err: impl std::fmt::Display) -> AppError {
    AppError::Io(format!("surveillance du workspace : {err}"))
}

impl Watcher {
    /// `on_change` reçoit les chemins modifiés, relatifs au workspace, sans `target/` ni `.git/`.
    pub fn watch(
        &self,
        root: &Path,
        on_change: impl Fn(Vec<String>) + Send + 'static,
    ) -> AppResult<()> {
        // macOS renvoie des chemins canoniques (`/private/var/…`) : on compare avec la même forme.
        let canonical = root.canonicalize()?;
        let roots = [canonical.clone(), root.to_path_buf()];
        let mut debouncer = new_debouncer(
            Duration::from_millis(150),
            move |res: DebounceEventResult| {
                let Ok(events) = res else { return };
                let changed = visible_changes(&roots, events.into_iter().map(|e| e.path));
                if !changed.is_empty() {
                    on_change(changed);
                }
            },
        )
        .map_err(watch_err)?;
        debouncer
            .watcher()
            .watch(&canonical, RecursiveMode::Recursive)
            .map_err(watch_err)?;
        *self.current.lock().map_err(watch_err)? = Some(debouncer);
        Ok(())
    }
}

/// Garde les chemins visibles dans l'arbre, relatifs au workspace, triés et sans doublon.
fn visible_changes(roots: &[PathBuf], paths: impl Iterator<Item = PathBuf>) -> Vec<String> {
    let mut changed: Vec<String> = paths
        .filter_map(|path| {
            let rel = roots.iter().find_map(|r| path.strip_prefix(r).ok())?;
            let parts: Vec<&str> = rel.iter().filter_map(|p| p.to_str()).collect();
            if parts.is_empty() || parts.iter().any(|p| HIDDEN.contains(p)) {
                return None;
            }
            Some(parts.join("/"))
        })
        .collect();
    changed.sort();
    changed.dedup();
    changed
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::mpsc;

    #[test]
    fn ignores_build_output_and_git() {
        let root = PathBuf::from("/ws");
        let paths = [
            "/ws/hello/src/main.rs",
            "/ws/hello/target/debug/hello",
            "/ws/.git/index",
            "/ws/hello/src/main.rs",
            "/ailleurs/x.rs",
            "/ws",
        ]
        .map(PathBuf::from);
        assert_eq!(
            visible_changes(&[root], paths.into_iter()),
            vec!["hello/src/main.rs"]
        );
    }

    #[test]
    fn reports_a_file_created_in_the_workspace() {
        let tmp = tempfile::tempdir().expect("tempdir");
        std::fs::create_dir_all(tmp.path().join("hello/src")).expect("mkdir");
        let watcher = Watcher::default();
        let (tx, rx) = mpsc::channel();
        watcher
            .watch(tmp.path(), move |paths| {
                let _ = tx.send(paths);
            })
            .expect("watch");

        std::fs::write(tmp.path().join("hello/src/main.rs"), "fn main() {}").expect("write");

        let deadline = std::time::Instant::now() + Duration::from_secs(10);
        let mut seen = Vec::new();
        while !seen.iter().any(|p: &String| p == "hello/src/main.rs")
            && std::time::Instant::now() < deadline
        {
            if let Ok(paths) = rx.recv_timeout(Duration::from_millis(200)) {
                seen.extend(paths);
            }
        }
        assert!(
            seen.contains(&"hello/src/main.rs".to_string()),
            "vu : {seen:?}"
        );
    }
}
