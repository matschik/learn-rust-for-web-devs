// Retire cette ligne une fois l'exercice terminé : elle masque les avertissements des paramètres pas encore utilisés.
#![allow(unused_variables)]

/// Label de priorité selon un score de 0 à 10 :
/// 0..=3 -> "basse", 4..=7 -> "normale", 8..=10 -> "haute", au-delà -> "invalide".
pub fn priority_label(score: u8) -> &'static str {
    todo!()
}

/// Nombre de tâches en retard : un délai négatif signifie que la tâche est en retard.
pub fn count_overdue(days_left: [i32; 5]) -> usize {
    todo!()
}

/// Nombre de sprints de `sprint_capacity` minutes nécessaires pour finir `total_minutes`.
/// Écris-le avec `loop` et `break <valeur>`, même si une division ferait l'affaire.
pub fn sprints_needed(total_minutes: u32, sprint_capacity: u32) -> u32 {
    todo!()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn labels_priorities() {
        assert_eq!(priority_label(0), "basse");
        assert_eq!(priority_label(3), "basse");
        assert_eq!(priority_label(4), "normale");
        assert_eq!(priority_label(7), "normale");
        assert_eq!(priority_label(8), "haute");
        assert_eq!(priority_label(10), "haute");
        assert_eq!(priority_label(11), "invalide");
    }

    #[test]
    fn counts_overdue_tasks() {
        assert_eq!(count_overdue([3, -1, 0, -5, 2]), 2);
        assert_eq!(count_overdue([1, 2, 3, 4, 5]), 0);
    }

    #[test]
    fn computes_sprints() {
        assert_eq!(sprints_needed(0, 600), 0);
        assert_eq!(sprints_needed(600, 600), 1);
        assert_eq!(sprints_needed(601, 600), 2);
        assert_eq!(sprints_needed(1500, 600), 3);
    }
}
