# 02 - Variables · cours

## À lire dans le Rust Book

- [Rust Book 3.1 · Variables and Mutability](https://rust-book.cs.brown.edu/ch03-01-variables-and-mutability.html) (shadowing compris)
- [Erreur E0384 · cannot assign twice to immutable variable](https://doc.rust-lang.org/error_codes/E0384.html)
- [Erreur E0308 · mismatched types](https://doc.rust-lang.org/error_codes/E0308.html)

## L'idée

![02 - Variables](cours.svg)

En Rust, `let` est immuable par défaut : c'est le `const` de TS. Pour qu'une variable puisse changer, il faut `let mut`.

```ts
const done = 0;      // let done = 0;      en Rust
let todo = 3;        // let mut todo = 3;  en Rust
```

Le **shadowing** permet de redéclarer une variable du même nom, même avec un autre type. Ce n'est pas une mutation : c'est une nouvelle variable.

## À retenir

- `let` est immuable par défaut : c'est ton `const`.
- `let mut` pour une variable qui change ; le compilateur te le rappelle (E0384).
- Le shadowing crée une **nouvelle** variable, qui peut changer de type.
