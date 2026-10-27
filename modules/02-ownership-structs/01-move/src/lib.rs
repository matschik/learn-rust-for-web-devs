pub fn describe(title: String) -> String {
    format!("Tâche : {title}")
}

/// Renvoie la description de la tâche et la longueur de son titre (en octets).
pub fn describe_and_measure(title: String) -> (String, usize) {
    let description = describe(title);
    let len = title.len();
    (description, len)
}

/// Écrit deux fois le même message dans un journal.
pub fn log_twice(message: String) -> Vec<String> {
    let mut log = Vec::new();
    log.push(message);
    log.push(message);
    log
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn describes_and_measures() {
        let (description, len) = describe_and_measure(String::from("Deploy"));
        assert_eq!(description, "Tâche : Deploy");
        assert_eq!(len, 6);
    }

    #[test]
    fn logs_twice() {
        assert_eq!(log_twice(String::from("ping")), vec!["ping", "ping"]);
    }
}
