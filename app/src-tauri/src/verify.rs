//! « Vérifier » : lance cargo sur un projet du workspace et renvoie sa sortie.
//!
//! Première version : `cargo build`, puis `cargo test` si le build passe. Les tests de la leçon,
//! lancés depuis un crate de vérification à part, viendront avec les leçons réécrites.

use std::path::Path;
use std::process::Command;

use serde::Serialize;

use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Serialize, specta::Type, PartialEq)]
pub struct CheckResult {
    pub success: bool,
    /// La commande lancée, pour l'afficher telle quelle à l'apprenant.
    pub command: String,
    /// stdout puis stderr, sans couleurs ANSI.
    pub output: String,
}

fn cargo(project: &Path, args: &[&str]) -> AppResult<CheckResult> {
    let out = Command::new("cargo")
        .args(args)
        .current_dir(project)
        .env("CARGO_TERM_COLOR", "never")
        .output()
        .map_err(|e| AppError::Io(format!("impossible de lancer cargo : {e}")))?;
    Ok(CheckResult {
        success: out.status.success(),
        command: format!("cargo {}", args.join(" ")),
        output: format!(
            "{}{}",
            String::from_utf8_lossy(&out.stdout),
            String::from_utf8_lossy(&out.stderr)
        ),
    })
}

pub fn check_project(project: &Path) -> AppResult<CheckResult> {
    if !project.join("Cargo.toml").is_file() {
        return Err(AppError::NotFound(format!(
            "pas de Cargo.toml dans {}",
            project.display()
        )));
    }
    let build = cargo(project, &["build"])?;
    if !build.success {
        return Ok(build);
    }
    cargo(project, &["test"])
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn project(code: &str) -> tempfile::TempDir {
        let tmp = tempfile::tempdir().expect("tempdir");
        fs::create_dir_all(tmp.path().join("src")).expect("mkdir");
        fs::write(
            tmp.path().join("Cargo.toml"),
            "[package]\nname = \"demo\"\nversion = \"0.1.0\"\nedition = \"2024\"\n\n[workspace]\n",
        )
        .expect("write");
        fs::write(tmp.path().join("src/lib.rs"), code).expect("write");
        tmp
    }

    #[test]
    fn reports_a_compile_error() {
        let tmp = project("pub fn f() -> u32 { let n = 0; n += 1; n }");
        let result = check_project(tmp.path()).expect("cargo runs");
        assert!(!result.success);
        assert_eq!(result.command, "cargo build");
        assert!(result.output.contains("E0384"), "{}", result.output);
    }

    #[test]
    fn runs_tests_when_it_builds() {
        let tmp = project("pub fn f() -> u32 { 1 }\n#[test]\nfn one() { assert_eq!(f(), 1); }\n");
        let result = check_project(tmp.path()).expect("cargo runs");
        assert!(result.success, "{}", result.output);
        assert_eq!(result.command, "cargo test");
        assert!(
            result.output.contains("test one ... ok"),
            "{}",
            result.output
        );
    }

    #[test]
    fn needs_a_cargo_project() {
        let tmp = tempfile::tempdir().expect("tempdir");
        assert!(matches!(
            check_project(tmp.path()),
            Err(AppError::NotFound(_))
        ));
    }
}
