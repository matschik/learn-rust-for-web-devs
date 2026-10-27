// Retire cette ligne une fois l'exercice terminé : elle masque les avertissements des paramètres pas encore utilisés.
#![allow(unused_variables)]

/// Convertit une estimation en minutes en heures (ex : 90 -> 1.5).
pub fn minutes_to_hours(minutes: u32) -> f64 {
    todo!()
}

/// Somme des estimations de trois tâches, en minutes.
pub fn total_estimate(estimates: [u32; 3]) -> u32 {
    todo!()
}

/// Moyenne des estimations, en minutes.
pub fn average_estimate(estimates: [u32; 3]) -> f64 {
    todo!()
}

/// Nombre de jours de retard : `today - due` si la tâche est en retard, 0 sinon.
/// Les jours sont des numéros de jour (ex : jour 300 de l'année).
/// Attention : que se passe-t-il si tu soustrais deux `u32` et que le résultat est négatif ?
pub fn days_late(due: u32, today: u32) -> u32 {
    todo!()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn converts_minutes() {
        assert_eq!(minutes_to_hours(90), 1.5);
        assert_eq!(minutes_to_hours(0), 0.0);
    }

    #[test]
    fn sums_estimates() {
        assert_eq!(total_estimate([30, 45, 15]), 90);
    }

    #[test]
    fn averages_estimates() {
        assert_eq!(average_estimate([30, 45, 15]), 30.0);
        assert_eq!(average_estimate([10, 10, 11]), 31.0 / 3.0);
    }

    #[test]
    fn late_task() {
        assert_eq!(days_late(300, 305), 5);
    }

    #[test]
    fn task_not_late() {
        assert_eq!(days_late(305, 300), 0);
    }
}
