//! Le workspace de l'apprenant : son dossier à lui, où il crée ses projets avec cargo.
//!
//! Toutes les fonctions prennent la racine du workspace et un chemin relatif, et refusent
//! tout chemin qui en sortirait. L'app n'écrit que ce que l'apprenant tape dans l'éditeur.

use std::fs;
use std::path::{Component, Path, PathBuf};

use serde::Serialize;

use crate::error::{AppError, AppResult};

/// Dossiers qu'on ne montre pas dans l'arbre : générés, ou internes à git.
pub(crate) const HIDDEN: &[&str] = &[".git", "target", "node_modules", ".DS_Store"];

#[derive(Debug, Clone, Serialize, specta::Type, PartialEq)]
pub struct Entry {
    pub name: String,
    /// Le chemin relatif à la racine du workspace, avec des `/`.
    pub path: String,
    pub is_dir: bool,
}

/// Résout `rel` sous `root`, sans jamais en sortir : pas de chemin absolu, pas de `..`.
pub fn resolve(root: &Path, rel: &str) -> AppResult<PathBuf> {
    let mut path = root.to_path_buf();
    for part in Path::new(rel).components() {
        match part {
            Component::Normal(p) => path.push(p),
            Component::CurDir => {}
            _ => return Err(AppError::ForbiddenPath(rel.to_string())),
        }
    }
    Ok(path)
}

fn join_rel(parent: &str, name: &str) -> String {
    if parent.is_empty() || parent == "." {
        name.to_string()
    } else {
        format!("{parent}/{name}")
    }
}

/// Le contenu d'un dossier : les sous-dossiers d'abord, puis les fichiers, par ordre alphabétique.
pub fn list_dir(root: &Path, rel: &str) -> AppResult<Vec<Entry>> {
    let dir = resolve(root, rel)?;
    let mut entries: Vec<Entry> = fs::read_dir(&dir)?
        .filter_map(Result::ok)
        .filter_map(|e| {
            let name = e.file_name().to_string_lossy().into_owned();
            if HIDDEN.contains(&name.as_str()) {
                return None;
            }
            let is_dir = e.file_type().ok()?.is_dir();
            Some(Entry {
                path: join_rel(rel, &name),
                name,
                is_dir,
            })
        })
        .collect();
    entries.sort_by(|a, b| b.is_dir.cmp(&a.is_dir).then_with(|| a.name.cmp(&b.name)));
    Ok(entries)
}

/// Au-delà, on arrête de chercher : un workspace d'apprentissage n'en a jamais autant.
const MAX_FILES: usize = 5000;

/// Tous les fichiers du workspace, pour l'ouverture rapide (Cmd+P). Mêmes exclusions que l'arbre.
pub fn list_files(root: &Path) -> AppResult<Vec<String>> {
    let mut files = Vec::new();
    let mut stack = vec![String::new()];
    while let Some(dir) = stack.pop() {
        for entry in list_dir(root, &dir)? {
            if files.len() >= MAX_FILES {
                break;
            }
            if entry.is_dir {
                stack.push(entry.path);
            } else {
                files.push(entry.path);
            }
        }
    }
    files.sort();
    Ok(files)
}

pub fn read_file(root: &Path, rel: &str) -> AppResult<String> {
    Ok(fs::read_to_string(resolve(root, rel)?)?)
}

/// Comme `resolve`, mais refuse la racine elle-même : on ne l'écrase, ne la renomme ni ne la supprime.
fn resolve_inner(root: &Path, rel: &str) -> AppResult<PathBuf> {
    let path = resolve(root, rel)?;
    if path == root {
        return Err(AppError::ForbiddenPath(rel.to_string()));
    }
    Ok(path)
}

fn ensure_free(path: &Path, rel: &str) -> AppResult<()> {
    if path.exists() {
        return Err(AppError::Io(format!("{rel} existe déjà")));
    }
    Ok(())
}

/// Écrit un fichier existant ou nouveau ; les dossiers parents doivent déjà exister,
/// comme dans un vrai éditeur (c'est `cargo new` qui les crée).
pub fn write_file(root: &Path, rel: &str, content: &str) -> AppResult<()> {
    Ok(fs::write(resolve_inner(root, rel)?, content)?)
}

/// Crée un fichier vide, et ses dossiers parents s'il en faut (`src/models/task.rs`).
pub fn create_file(root: &Path, rel: &str) -> AppResult<()> {
    let path = resolve_inner(root, rel)?;
    ensure_free(&path, rel)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::File::create_new(path)?;
    Ok(())
}

pub fn create_dir(root: &Path, rel: &str) -> AppResult<()> {
    let path = resolve_inner(root, rel)?;
    ensure_free(&path, rel)?;
    Ok(fs::create_dir_all(path)?)
}

pub fn rename(root: &Path, from: &str, to: &str) -> AppResult<()> {
    let src = resolve_inner(root, from)?;
    let dst = resolve_inner(root, to)?;
    ensure_free(&dst, to)?;
    Ok(fs::rename(src, dst)?)
}

/// Envoie à la corbeille plutôt que d'effacer : une fausse manip se rattrape.
pub fn delete(root: &Path, rel: &str) -> AppResult<()> {
    let path = resolve_inner(root, rel)?;
    if !path.exists() {
        return Err(AppError::NotFound(rel.to_string()));
    }
    trash::delete(path).map_err(|e| AppError::Io(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolve_stays_inside_the_workspace() {
        let root = Path::new("/ws");
        assert_eq!(
            resolve(root, "variables/src/lib.rs").expect("ok"),
            Path::new("/ws/variables/src/lib.rs")
        );
        assert_eq!(resolve(root, "./a").expect("ok"), Path::new("/ws/a"));
        assert!(resolve(root, "../etc/passwd").is_err());
        assert!(resolve(root, "a/../../b").is_err());
        assert!(resolve(root, "/etc/passwd").is_err());
    }

    #[test]
    fn lists_dirs_first_and_hides_target() {
        let tmp = tempfile::tempdir().expect("tempdir");
        let root = tmp.path();
        fs::create_dir_all(root.join("variables/src")).expect("mkdir");
        fs::create_dir_all(root.join("variables/target")).expect("mkdir");
        fs::write(root.join("variables/Cargo.toml"), "").expect("write");
        fs::write(root.join("AGENTS.md"), "").expect("write");

        let top = list_dir(root, "").expect("list");
        let names: Vec<_> = top.iter().map(|e| e.name.as_str()).collect();
        assert_eq!(names, ["variables", "AGENTS.md"]);

        let inner = list_dir(root, "variables").expect("list");
        let paths: Vec<_> = inner.iter().map(|e| e.path.as_str()).collect();
        assert_eq!(paths, ["variables/src", "variables/Cargo.toml"]);
    }

    #[test]
    fn writes_and_reads_back() {
        let tmp = tempfile::tempdir().expect("tempdir");
        fs::create_dir_all(tmp.path().join("p/src")).expect("mkdir");
        write_file(tmp.path(), "p/src/lib.rs", "pub fn f() {}").expect("write");
        assert_eq!(
            read_file(tmp.path(), "p/src/lib.rs").expect("read"),
            "pub fn f() {}"
        );
        assert!(write_file(tmp.path(), "../evil.rs", "").is_err());
        assert!(write_file(tmp.path(), "", "").is_err());
    }

    #[test]
    fn create_rename_and_refuse_overwrites() {
        let tmp = tempfile::tempdir().expect("tempdir");
        let root = tmp.path();
        create_file(root, "hello/src/models/task.rs").expect("create");
        assert!(root.join("hello/src/models/task.rs").is_file());
        assert!(create_file(root, "hello/src/models/task.rs").is_err());

        create_dir(root, "hello/tests").expect("mkdir");
        assert!(create_dir(root, "hello/tests").is_err());

        rename(root, "hello/src/models/task.rs", "hello/src/models/todo.rs").expect("rename");
        assert!(root.join("hello/src/models/todo.rs").is_file());
        create_file(root, "hello/a.rs").expect("create");
        assert!(rename(root, "hello/a.rs", "hello/src/models/todo.rs").is_err());

        assert!(rename(root, "", "ailleurs").is_err());
        assert!(delete(root, ".").is_err());
        assert!(matches!(
            delete(root, "absent.rs"),
            Err(AppError::NotFound(_))
        ));
    }

    #[test]
    fn list_files_walks_the_tree_without_target() {
        let tmp = tempfile::tempdir().expect("tempdir");
        let root = tmp.path();
        create_file(root, "hello/src/main.rs").expect("create");
        create_file(root, "hello/Cargo.toml").expect("create");
        create_file(root, "hello/target/debug/hello").expect("create");
        assert_eq!(
            list_files(root).expect("list"),
            vec!["hello/Cargo.toml", "hello/src/main.rs"]
        );
    }
}
