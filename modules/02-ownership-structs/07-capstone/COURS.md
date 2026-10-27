# 07 - Capstone : un sprint · cours

## À lire dans le Rust Book

- [Rust Book 5.3 · Methods](https://rust-book.cs.brown.edu/ch05-03-method-syntax.html)
- [Rust Book 6.3 · if let](https://rust-book.cs.brown.edu/ch06-03-if-let.html) : en avance, juste pour `Option`
- [std · Option](https://doc.rust-lang.org/std/option/enum.Option.html)
- [std · slice::iter_mut](https://doc.rust-lang.org/std/primitive.slice.html#method.iter_mut)

## L'idée

![07 - Capstone : un sprint](cours.svg)

Tout le module ensemble : une `struct Sprint` avec une capacité en minutes et jusqu'à 5 tâches, stockées dans un tableau de taille fixe `[Option<Task>; 5]`.

`Option<T>` est l'équivalent de `T | null`, en mieux : on ne peut pas utiliser la valeur sans avoir vérifié qu'elle est là. C'est le chapitre 6, au module 03 ; ici, tu as juste besoin de :

```rust
match slot {
    Some(task) => { /* il y a une tâche */ }
    None => { /* case vide */ }
}
// ou, plus court :
if let Some(task) = slot { /* ... */ }
```

Ici, `Task` est définie pour toi, avec ce que tu as écrit à l'exercice 06.

## À retenir

- `Option<T>` remplace `T | null` : impossible d'oublier le cas vide.
- Itérer en `&mut` pour modifier les éléments en place.
- Un tableau `[T; N]` a une taille fixe ; un `Vec<T>` grandit (chapitre 8).
