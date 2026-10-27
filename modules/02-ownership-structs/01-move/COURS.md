# 01 - Move · cours

## À lire dans le Rust Book

- [Rust Book 4.1 · What is Ownership?](https://rust-book.cs.brown.edu/ch04-01-what-is-ownership.html) (fais les quiz de la page)
- [Erreur E0382 · use of moved value](https://doc.rust-lang.org/error_codes/E0382.html)

## L'idée

![01 - Move](cours.svg)

En JS, passer un objet à une fonction partage une référence : l'appelant et l'appelé voient le même objet, et le GC libère la mémoire plus tard.

```ts
const title = "Deploy";
describe(title);
title.length; // aucun souci
```

En Rust, une `String` a **un seul propriétaire**. La passer par valeur à une fonction la **déplace** (move) : l'appelant perd sa permission de la lire. Quand le propriétaire sort de son scope, la mémoire est libérée tout de suite, sans GC.

Avec le modèle de permissions du Rust Book : avant l'appel, `title` a les permissions R et O. Après `describe(title)`, `title` les a perdues.

## À retenir

- Chaque valeur a **un seul propriétaire**.
- Passer une `String` par valeur la **déplace** : l'ancien nom perd ses permissions R et O.
- Les types simples (`i32`, `bool`…) sont `Copy` : ils sont copiés, pas déplacés.
- Quand le propriétaire sort du scope, la valeur est libérée (`drop`). Pas de GC.
