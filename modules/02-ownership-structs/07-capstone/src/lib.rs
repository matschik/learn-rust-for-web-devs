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
    pub fn new(id: u64, title: &str, estimate_minutes: u32) -> Self {
        Task {
            id,
            title: title.to_string(),
            done: false,
            estimate_minutes,
        }
    }
}

pub const MAX_TASKS: usize = 5;

#[derive(Debug)]
pub struct Sprint {
    pub capacity_minutes: u32,
    pub tasks: [Option<Task>; MAX_TASKS],
}

impl Sprint {
    /// Sprint vide.
    pub fn new(capacity_minutes: u32) -> Self {
        Sprint {
            capacity_minutes,
            tasks: [None, None, None, None, None],
        }
    }

    /// Nombre de tâches dans le sprint.
    pub fn len(&self) -> usize {
        todo!()
    }

    /// Somme des estimations de toutes les tâches.
    pub fn planned_minutes(&self) -> u32 {
        todo!()
    }

    /// Ajoute une tâche dans la première case libre.
    /// Renvoie `false` (sans rien ajouter) si le sprint est plein
    /// ou si la tâche ferait dépasser la capacité.
    pub fn add(&mut self, task: Task) -> bool {
        todo!()
    }

    /// Marque la tâche `id` comme terminée. Renvoie `false` si elle n'existe pas.
    pub fn complete(&mut self, id: u64) -> bool {
        todo!()
    }

    /// Pourcentage de minutes terminées, arrondi à l'entier inférieur (0 si le sprint est vide).
    pub fn progress_percent(&self) -> u32 {
        todo!()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_sprint() {
        let sprint = Sprint::new(600);
        assert_eq!(sprint.len(), 0);
        assert_eq!(sprint.planned_minutes(), 0);
        assert_eq!(sprint.progress_percent(), 0);
    }

    #[test]
    fn adds_tasks() {
        let mut sprint = Sprint::new(600);
        assert!(sprint.add(Task::new(1, "API", 120)));
        assert!(sprint.add(Task::new(2, "Tests", 60)));
        assert_eq!(sprint.len(), 2);
        assert_eq!(sprint.planned_minutes(), 180);
    }

    #[test]
    fn refuses_over_capacity() {
        let mut sprint = Sprint::new(100);
        assert!(sprint.add(Task::new(1, "API", 80)));
        assert!(!sprint.add(Task::new(2, "Tests", 30)));
        assert_eq!(sprint.len(), 1);
    }

    #[test]
    fn refuses_when_full() {
        let mut sprint = Sprint::new(1000);
        for id in 1..=5 {
            assert!(sprint.add(Task::new(id, "Petite tâche", 10)));
        }
        assert!(!sprint.add(Task::new(6, "Une de trop", 10)));
        assert_eq!(sprint.len(), 5);
    }

    #[test]
    fn completes_tasks() {
        let mut sprint = Sprint::new(600);
        sprint.add(Task::new(1, "API", 120));
        assert!(sprint.complete(1));
        assert!(!sprint.complete(42));
    }

    #[test]
    fn computes_progress() {
        let mut sprint = Sprint::new(600);
        sprint.add(Task::new(1, "API", 120));
        sprint.add(Task::new(2, "Tests", 60));
        sprint.add(Task::new(3, "Doc", 120));
        sprint.complete(2);
        assert_eq!(sprint.progress_percent(), 20);
        sprint.complete(1);
        assert_eq!(sprint.progress_percent(), 60);
    }
}
