// Retire cette ligne une fois l'exercice terminé : elle masque les avertissements des paramètres pas encore utilisés.
#![allow(unused_variables)]

#[derive(Debug, PartialEq)]
pub struct Task {
    pub id: u64,
    pub title: String,
    pub done: bool,
    pub estimate_minutes: u32,
}

impl Task {
    /// Tâche non terminée, sans estimation.
    pub fn new(id: u64, title: &str) -> Self {
        todo!()
    }

    pub fn is_done(&self) -> bool {
        todo!()
    }

    pub fn complete(&mut self) {
        todo!()
    }

    /// Change le titre. Un titre vide (ou fait seulement d'espaces) est ignoré.
    pub fn rename(&mut self, title: &str) {
        todo!()
    }

    /// Ajoute du temps à l'estimation.
    pub fn add_estimate(&mut self, minutes: u32) {
        todo!()
    }

    /// Résumé lisible, par exemple "[x] #3 Écrire la doc (45 min)" ou "[ ] #4 Relire (0 min)".
    pub fn summary(&self) -> String {
        todo!()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_task_is_not_done() {
        let task = Task::new(1, "Écrire la doc");
        assert!(!task.is_done());
        assert_eq!(task.estimate_minutes, 0);
    }

    #[test]
    fn completes_a_task() {
        let mut task = Task::new(1, "Écrire la doc");
        task.complete();
        assert!(task.is_done());
    }

    #[test]
    fn renames_a_task() {
        let mut task = Task::new(1, "Brouillon");
        task.rename("Version finale");
        assert_eq!(task.title, "Version finale");
    }

    #[test]
    fn ignores_blank_titles() {
        let mut task = Task::new(1, "Brouillon");
        task.rename("   ");
        assert_eq!(task.title, "Brouillon");
    }

    #[test]
    fn adds_estimates() {
        let mut task = Task::new(1, "Écrire la doc");
        task.add_estimate(30);
        task.add_estimate(15);
        assert_eq!(task.estimate_minutes, 45);
    }

    #[test]
    fn summarizes() {
        let mut task = Task::new(3, "Écrire la doc");
        task.add_estimate(45);
        task.complete();
        assert_eq!(task.summary(), "[x] #3 Écrire la doc (45 min)");
        assert_eq!(Task::new(4, "Relire").summary(), "[ ] #4 Relire (0 min)");
    }
}
