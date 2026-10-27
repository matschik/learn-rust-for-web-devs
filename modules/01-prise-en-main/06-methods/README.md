# 06 - Méthodes

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
- `self` : prendre possession (l'objet n'est plus utilisable après). Ce sera le cœur du module 02.

## À faire

`cargo test -p m01_e06_methods`. Puis, avant `/review`, demande-toi : pourquoi `rename` prend `&mut self` et pas `self` ?
