// Retire cette ligne une fois l'exercice terminé : elle masque les avertissements des paramètres pas encore utilisés.
#![allow(unused_variables)]

/// Identifiant d'un ticket : "TASK-42: Corriger le login" -> "TASK-42".
/// Sans ':', la ligne entière (sans espaces autour) est l'identifiant.
pub fn ticket_id(line: &str) -> &str {
    todo!()
}

/// Titre d'un ticket : "TASK-42: Corriger le login" -> "Corriger le login" (sans espaces autour).
/// Sans ':', le titre est vide.
pub fn ticket_title(line: &str) -> &str {
    todo!()
}

/// Premier mot d'un titre : "Écrire la doc" -> "Écrire". Un titre vide donne "".
pub fn first_word(title: &str) -> &str {
    todo!()
}

/// Somme des estimations d'une slice de tâches.
pub fn total(estimates: &[u32]) -> u32 {
    todo!()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_ticket_id() {
        assert_eq!(ticket_id("TASK-42: Corriger le login"), "TASK-42");
        assert_eq!(ticket_id("  TASK-7  "), "TASK-7");
    }

    #[test]
    fn extracts_ticket_title() {
        assert_eq!(ticket_title("TASK-42:   Corriger le login "), "Corriger le login");
        assert_eq!(ticket_title("TASK-7"), "");
    }

    #[test]
    fn works_on_a_string_too() {
        let line = String::from("TASK-1: Écrire la doc");
        assert_eq!(ticket_id(&line), "TASK-1");
        assert_eq!(first_word(ticket_title(&line)), "Écrire");
    }

    #[test]
    fn finds_first_word() {
        assert_eq!(first_word("Écrire la doc"), "Écrire");
        assert_eq!(first_word("Deploy"), "Deploy");
        assert_eq!(first_word(""), "");
    }

    #[test]
    fn sums_slices() {
        let estimates = vec![30, 45, 15, 60];
        assert_eq!(total(&estimates), 150);
        assert_eq!(total(&estimates[1..3]), 60);
        assert_eq!(total(&[10, 20]), 30);
        assert_eq!(total(&[]), 0);
    }
}
