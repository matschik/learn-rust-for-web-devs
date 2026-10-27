# 05 - Structs

Une `struct` Rust, c'est une `interface` TS **et** la donnée en même temps. Il n'y a pas d'objet littéral anonyme : on nomme toujours le type.

```ts
interface Task { id: number; title: string; done: boolean }
const t: Task = { id: 1, title: "Écrire la doc", done: false };
const t2 = { ...t, id: 2 };
```
```rust
struct Task { id: u64, title: String, done: bool }
let t = Task { id: 1, title: String::from("Écrire la doc"), done: false };
let t2 = Task { id: 2, ..t };
```

Deux choses à remarquer :
- `String` (chaîne qui possède ses données) vs `&str` (vue empruntée sur une chaîne). On creuse au module 02 ; pour l'instant, convertis avec `String::from(...)` ou `.to_string()`.
- `#[derive(Debug, PartialEq)]` génère l'affichage debug et la comparaison `==`. C'est ce qui permet `assert_eq!` sur une struct.

## À faire

1. Complète la struct `Task` pour que les tests compilent (regarde quels champs ils utilisent).
2. Écris les fonctions. `cargo test -p m01_e05_structs`.
