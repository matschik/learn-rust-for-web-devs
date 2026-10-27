/// Titre par défaut d'une nouvelle tâche.
pub fn default_title() -> &String {
    let title = String::from("Sans titre");
    &title
}

/// Ajoute une tâche à la liste, puis renvoie la longueur du titre de la première tâche.
pub fn push_and_first_len(titles: &mut Vec<String>, new_title: String) -> usize {
    let first = &titles[0];
    titles.push(new_title);
    first.len()
}

/// Le titre de la première tâche, en majuscules.
pub fn first_title_upper(titles: &Vec<String>) -> String {
    let first = titles[0];
    first.to_uppercase()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn has_a_default_title() {
        assert_eq!(default_title(), "Sans titre");
    }

    #[test]
    fn pushes_then_measures_first() {
        let mut titles = vec![String::from("ab"), String::from("c")];
        assert_eq!(push_and_first_len(&mut titles, String::from("xyz")), 2);
        assert_eq!(titles.len(), 3);
    }

    #[test]
    fn uppercases_first_title() {
        let titles = vec![String::from("deploy"), String::from("test")];
        assert_eq!(first_title_upper(&titles), "DEPLOY");
        assert_eq!(titles.len(), 2);
    }
}
