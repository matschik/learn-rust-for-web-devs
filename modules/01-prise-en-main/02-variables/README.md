# 02 - Variables

En Rust, `let` est immuable par défaut : c'est le `const` de TS. Pour qu'une variable puisse changer, il faut `let mut`.

```ts
const done = 0;      // let done = 0;      en Rust
let todo = 3;        // let mut todo = 3;  en Rust
```

Le **shadowing** permet de redéclarer une variable du même nom, même avec un autre type. Ce n'est pas une mutation : c'est une nouvelle variable.

## À faire

Cet exercice **ne compile pas** : c'est voulu. Lance `cargo test -p m01_e02_variables`, **lis l'erreur en entier**, puis corrige le code en changeant le moins de choses possible. Ne touche pas aux tests.

Avant de lancer : prédis l'erreur que tu vas avoir.
