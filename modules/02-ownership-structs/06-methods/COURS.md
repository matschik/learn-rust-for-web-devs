# 06 - Méthodes · cours

## À lire dans le Rust Book

- [Rust Book 5.3 · Methods](https://rust-book.cs.brown.edu/ch05-03-method-syntax.html)
- [std · str::trim](https://doc.rust-lang.org/std/primitive.str.html#method.trim)

## L'idée

![06 - Méthodes](cours.svg)

Rust n'a pas de `class`. On sépare la donnée (`struct`) du comportement (`impl`).

```ts
class Task {
  constructor(public title: string, public done = false) {}
  static create(title: string) { return new Task(title); }
  complete() { this.done = true; }
  isDone() { return this.done; }
}
```
```rust
impl Task {
    pub fn new(title: &str) -> Self { /* ... */ }   // fonction associée : Task::new(...)
    pub fn complete(&mut self) { /* ... */ }        // méthode qui modifie : t.complete()
    pub fn is_done(&self) -> bool { /* ... */ }     // méthode qui lit : t.is_done()
}
```

`new` n'a rien de magique : c'est une convention. Le premier paramètre dit ce que la méthode a le droit de faire :
- `&self` : lire
- `&mut self` : lire et modifier
- `self` : prendre possession (l'objet n'est plus utilisable après), comme à l'exercice 01.

## À retenir

- Données dans `struct`, comportement dans `impl`.
- `&self` lit, `&mut self` modifie, `self` consomme.
- `Task::new(...)` est une fonction associée, par convention le constructeur.
