// Retire cette ligne une fois l'exercice terminé : elle masque les avertissements des paramètres pas encore utilisés.
#![allow(unused_variables)]

#[derive(Debug, PartialEq)]
pub struct Task {
    pub id: u64,
    // TODO : ajoute les champs dont les tests ont besoin.
}

/// Crée une tâche non terminée, sans estimation (0 minute).
/// Utilise la syntaxe d'init raccourcie quand le nom du paramètre = le nom du champ.
pub fn new_task(id: u64, title: &str) -> Task {
    todo!()
}

/// Renvoie une copie de `template` avec un nouvel id et un nouveau titre.
/// Utilise la syntaxe de mise à jour `..`.
pub fn duplicate(template: Task, id: u64, title: &str) -> Task {
    todo!()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_a_task() {
        let task = new_task(1, "Écrire la doc");
        assert_eq!(task.id, 1);
        assert_eq!(task.title, "Écrire la doc");
        assert!(!task.done);
        assert_eq!(task.estimate_minutes, 0);
    }

    #[test]
    fn duplicates_a_task() {
        let template = Task {
            id: 1,
            title: String::from("Template"),
            done: true,
            estimate_minutes: 45,
        };
        let copy = duplicate(template, 2, "Copie");
        assert_eq!(
            copy,
            Task {
                id: 2,
                title: String::from("Copie"),
                done: true,
                estimate_minutes: 45,
            }
        );
    }
}
