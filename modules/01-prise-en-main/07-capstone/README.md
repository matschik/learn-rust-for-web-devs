# 07 - Capstone : un sprint

Tout le module ensemble : une `struct Sprint` avec une capacité en minutes et jusqu'à 5 tâches, stockées dans un tableau de taille fixe `[Option<Task>; 5]`.

`Option<T>` est l'équivalent de `T | null`, en mieux : on ne peut pas utiliser la valeur sans avoir vérifié qu'elle est là. On le creuse au module 03 ; ici, tu as juste besoin de :

```rust
match slot {
    Some(task) => { /* il y a une tâche */ }
    None => { /* case vide */ }
}
// ou, plus court :
if let Some(task) = slot { /* ... */ }
```

Ici, `Task` est définie pour toi, avec ce que tu as écrit à l'exercice 06.

## À faire

`cargo test -p m01_e07_capstone`. Les tests vont du plus simple au plus dur : fais-les passer dans l'ordre.

Piège : pour modifier une tâche dans le tableau, il faudra itérer en `&mut`. Si le compilateur râle, c'est un avant-goût du module 02 : lance `/explain-error`.
