use serde::Serialize;

/// L'erreur renvoyée au front par toutes les commandes : un message lisible, en français.
#[derive(Debug, thiserror::Error, Serialize, specta::Type)]
#[serde(tag = "kind", content = "message")]
pub enum AppError {
    #[error("chemin refusé : {0}")]
    ForbiddenPath(String),
    #[error("introuvable : {0}")]
    NotFound(String),
    #[error("{0}")]
    Io(String),
    #[error("terminal : {0}")]
    Terminal(String),
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        if err.kind() == std::io::ErrorKind::NotFound {
            AppError::NotFound(err.to_string())
        } else {
            AppError::Io(err.to_string())
        }
    }
}

pub type AppResult<T> = Result<T, AppError>;
