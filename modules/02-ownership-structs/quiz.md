# Inspiration pour /quiz (module 02)

Pistes de questions « est-ce que ça compile ? », à expliquer avec les permissions R / W / O :

- Utiliser une `String` après l'avoir passée par valeur à une fonction.
- Utiliser un `i32` après l'avoir passé par valeur (Copy : ça compile).
- Prendre `&v[0]` puis faire `v.push(...)`, puis lire la référence.
- Deux `&mut` sur la même variable en même temps.
- Une `&T` créée puis plus jamais utilisée avant un `&mut` : ça compile (la référence est morte).
- Renvoyer `&String` depuis une fonction qui crée la `String`.
- `let s = v[0];` avec `v: Vec<String>`.
- Slice `&s[0..2]` sur `"Écrire"` : compile ? panique ?
- Appeler une méthode `&mut self` sur une variable non `mut`.
- Appeler une méthode `self` deux fois sur la même valeur.
