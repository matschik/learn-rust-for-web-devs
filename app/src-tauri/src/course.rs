//! Le contenu du cours : les modules et leurs leçons, lus depuis le dossier `modules/` du repo.
//!
//! Chaque leçon est un dossier `modules/<module>/<leçon>/` avec un `COURS.md` (la leçon)
//! et un `README.md` (la fiche pratique). Le titre vient de la première ligne `# ...`.

use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Serialize, specta::Type, PartialEq)]
pub struct Module {
    pub id: String,
    pub title: String,
    pub lessons: Vec<LessonRef>,
}

#[derive(Debug, Clone, Serialize, specta::Type, PartialEq)]
pub struct LessonRef {
    pub id: String,
    pub title: String,
}

#[derive(Debug, Clone, Serialize, specta::Type, PartialEq)]
pub struct Lesson {
    pub module_id: String,
    pub id: String,
    pub title: String,
    /// Le `COURS.md`, en markdown.
    pub cours: String,
    /// Le `README.md`, la fiche pratique, en markdown.
    pub pratique: String,
}

/// « # 02 - Variables · cours » devient « Variables » ; « # Module 01 : Prise en main » devient « Prise en main ».
pub fn title_of(markdown: &str, fallback: &str) -> String {
    let Some(first) = markdown.lines().find(|l| l.starts_with("# ")) else {
        return fallback.to_string();
    };
    let title = first.trim_start_matches("# ");
    let title = title.split(" · ").next().unwrap_or(title);
    let title = match title.split_once(" - ") {
        Some((num, rest)) if num.chars().all(|c| c.is_ascii_digit()) => rest,
        _ => title,
    };
    let title = match title.split_once(" : ") {
        Some((head, rest)) if head.starts_with("Module ") => rest,
        _ => title,
    };
    title.trim().to_string()
}

fn sorted_dirs(dir: &Path) -> AppResult<Vec<PathBuf>> {
    let mut dirs: Vec<PathBuf> = fs::read_dir(dir)?
        .filter_map(Result::ok)
        .map(|e| e.path())
        .filter(|p| p.is_dir())
        .collect();
    dirs.sort();
    Ok(dirs)
}

fn name(path: &Path) -> String {
    path.file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_default()
}

/// Les modules du cours, dans l'ordre des dossiers. Une leçon sans `COURS.md` est ignorée.
pub fn list_modules(root: &Path) -> AppResult<Vec<Module>> {
    let mut modules = Vec::new();
    for dir in sorted_dirs(root)? {
        let id = name(&dir);
        let readme = fs::read_to_string(dir.join("README.md")).unwrap_or_default();
        let mut lessons = Vec::new();
        for lesson in sorted_dirs(&dir)? {
            let Ok(cours) = fs::read_to_string(lesson.join("COURS.md")) else {
                continue;
            };
            let lesson_id = name(&lesson);
            lessons.push(LessonRef {
                title: title_of(&cours, &lesson_id),
                id: lesson_id,
            });
        }
        if !lessons.is_empty() {
            modules.push(Module {
                title: title_of(&readme, &id),
                id,
                lessons,
            });
        }
    }
    Ok(modules)
}

/// Un identifiant de dossier : des lettres, des chiffres, `-` et `_`, rien qui sorte du cours.
fn check_id(id: &str) -> AppResult<()> {
    let ok = !id.is_empty()
        && id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_');
    if ok {
        Ok(())
    } else {
        Err(AppError::ForbiddenPath(id.to_string()))
    }
}

pub fn read_lesson(root: &Path, module_id: &str, lesson_id: &str) -> AppResult<Lesson> {
    check_id(module_id)?;
    check_id(lesson_id)?;
    let dir = root.join(module_id).join(lesson_id);
    let cours = fs::read_to_string(dir.join("COURS.md"))?;
    let pratique = fs::read_to_string(dir.join("README.md")).unwrap_or_default();
    Ok(Lesson {
        title: title_of(&cours, lesson_id),
        module_id: module_id.to_string(),
        id: lesson_id.to_string(),
        cours,
        pratique,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn write(root: &Path, rel: &str, text: &str) {
        let path = root.join(rel);
        fs::create_dir_all(path.parent().expect("parent")).expect("mkdir");
        fs::write(path, text).expect("write");
    }

    #[test]
    fn titles_drop_numbers_and_suffixes() {
        assert_eq!(title_of("# 02 - Variables · cours\n", "x"), "Variables");
        assert_eq!(title_of("# 01 - Hello, cargo · cours", "x"), "Hello, cargo");
        assert_eq!(
            title_of("# Module 01 : Prise en main", "x"),
            "Prise en main"
        );
        assert_eq!(
            title_of("# 07 - Capstone : un sprint · cours", "x"),
            "Capstone : un sprint"
        );
        assert_eq!(title_of("pas de titre", "fallback"), "fallback");
    }

    #[test]
    fn lists_modules_in_folder_order() {
        let tmp = tempfile::tempdir().expect("tempdir");
        let root = tmp.path();
        write(root, "02-b/README.md", "# Module 02 : Deux");
        write(root, "02-b/01-x/COURS.md", "# 01 - X · cours");
        write(root, "01-a/README.md", "# Module 01 : Un");
        write(root, "01-a/02-z/COURS.md", "# 02 - Z · cours");
        write(root, "01-a/01-y/COURS.md", "# 01 - Y · cours");
        write(root, "01-a/03-sans-cours/README.md", "# rien");

        let modules = list_modules(root).expect("list");
        let ids: Vec<_> = modules.iter().map(|m| m.id.as_str()).collect();
        assert_eq!(ids, ["01-a", "02-b"]);
        assert_eq!(modules[0].title, "Un");
        let lessons: Vec<_> = modules[0]
            .lessons
            .iter()
            .map(|l| l.title.as_str())
            .collect();
        assert_eq!(lessons, ["Y", "Z"]);
    }

    #[test]
    fn reads_a_lesson_and_refuses_escapes() {
        let tmp = tempfile::tempdir().expect("tempdir");
        write(
            tmp.path(),
            "01-a/01-y/COURS.md",
            "# 01 - Y · cours\n\nTexte",
        );
        write(tmp.path(), "01-a/01-y/README.md", "# 01 - Y · pratique");

        let lesson = read_lesson(tmp.path(), "01-a", "01-y").expect("read");
        assert_eq!(lesson.title, "Y");
        assert!(lesson.cours.contains("Texte"));
        assert!(lesson.pratique.contains("pratique"));

        assert!(matches!(
            read_lesson(tmp.path(), "..", "01-y"),
            Err(AppError::ForbiddenPath(_))
        ));
        assert!(matches!(
            read_lesson(tmp.path(), "01-a", "../x"),
            Err(AppError::ForbiddenPath(_))
        ));
    }
}
