// Retire cette ligne une fois l'exercice terminé : elle masque les avertissements des paramètres pas encore utilisés.
#![allow(unused_variables)]

/// Longueur du titre en octets, sans prendre possession du titre.
pub fn title_len(title: &String) -> usize {
    todo!()
}

/// Ajoute `prefix` au début du titre, en place : "Deploy" + "[urgent] " -> "[urgent] Deploy".
pub fn add_prefix(title: &mut String, prefix: &str) {
    todo!()
}

/// Échange le contenu des deux titres.
pub fn swap_titles(a: &mut String, b: &mut String) {
    todo!()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn measures_title() {
        assert_eq!(title_len(&String::from("Deploy")), 6);
    }

    #[test]
    fn title_is_still_usable() {
        let title = String::from("Deploy");
        let len = title_len(&title);
        assert_eq!(title, "Deploy");
        assert_eq!(len, 6);
    }

    #[test]
    fn adds_prefix_in_place() {
        let mut title = String::from("Deploy");
        add_prefix(&mut title, "[urgent] ");
        assert_eq!(title, "[urgent] Deploy");
    }

    #[test]
    fn swaps_titles() {
        let mut a = String::from("A");
        let mut b = String::from("B");
        swap_titles(&mut a, &mut b);
        assert_eq!((a.as_str(), b.as_str()), ("B", "A"));
    }
}
