# 01 - cargo · cours

## À lire dans le Rust Book

- [Rust Book 1.2 · Hello, World!](https://rust-book.cs.brown.edu/ch01-02-hello-world.html)
- [Rust Book 1.3 · Hello, Cargo!](https://rust-book.cs.brown.edu/ch01-03-hello-cargo.html)
- [Rust Book 3.3 · Functions](https://rust-book.cs.brown.edu/ch03-03-how-functions-work.html) : la partie « Functions with Return Values »
- [std · format!](https://doc.rust-lang.org/std/macro.format.html)
- [The Cargo Book](https://doc.rust-lang.org/cargo/)

## L'idée

![01 - cargo](cours.svg)

`cargo` est ton `npm` + `tsc` + `vitest` en un seul outil.

| npm | cargo |
| --- | --- |
| `npm init` | `cargo new mon-projet` (binaire) / `cargo new --lib` |
| `package.json` | `Cargo.toml` |
| `npm install zod` | `cargo add serde` |
| `npm run build` | `cargo build` |
| `npm test` | `cargo test` |
| `node index.js` | `cargo run` |

Ce dossier est un crate de type bibliothèque (`src/lib.rs`). Les tests sont dans le même fichier, sous `#[cfg(test)]`.

## À retenir

- `cargo test -p <package>` compile puis lance les tests : une erreur de type bloque tout.
- La dernière expression d'un bloc, **sans point-virgule**, est sa valeur de retour.
- `format!` construit une `String`, comme une template string.
