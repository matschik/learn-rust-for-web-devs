// Retire cette ligne une fois l'exercice terminé : elle masque les avertissements des paramètres pas encore utilisés.
#![allow(unused_variables)]

/// Renvoie le message d'accueil de Taskr : "Bonjour, Rust!"
pub fn greeting() -> String {
    // `todo!()` fait paniquer le programme : remplace-le par ton code.
    todo!()
}

/// Renvoie "Bonjour, <name>!"
/// Indice : regarde la macro `format!`, l'équivalent des template strings.
pub fn greet(name: &str) -> String {
    todo!()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn says_hello() {
        assert_eq!(greeting(), "Bonjour, Rust!");
    }

    #[test]
    fn greets_by_name() {
        assert_eq!(greet("Mathieu"), "Bonjour, Mathieu!");
    }
}
