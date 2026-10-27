# 01 - cargo

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

## À faire

Fais passer les tests : `cargo test -p m01_e01_cargo`.

Remarque : en Rust, la dernière expression d'un bloc **sans point-virgule** est sa valeur de retour.
