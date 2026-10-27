/// Compte les tâches terminées dans une liste de statuts.
pub fn count_done(statuses: [bool; 5]) -> u32 {
    let count = 0;
    for done in statuses {
        if done {
            count += 1;
        }
    }
    count
}

/// Renvoie la longueur du titre une fois les espaces autour retirés.
/// Utilise le shadowing : la variable `title` change de type en route.
pub fn trimmed_title_len(title: &str) -> usize {
    let title = title.trim();
    let title: usize = title;
    title
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn counts_done_tasks() {
        assert_eq!(count_done([true, false, true, true, false]), 3);
    }

    #[test]
    fn trims_before_counting() {
        assert_eq!(trimmed_title_len("  Écrire la doc  "), "Écrire la doc".len());
    }
}
