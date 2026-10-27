# 04 - Slices · cours

## À lire dans le Rust Book

- [Rust Book 4.4 · The Slice Type](https://rust-book.cs.brown.edu/ch04-04-slices.html)
- [std · str](https://doc.rust-lang.org/std/primitive.str.html) : regarde `find`, `split_once`, `trim`, `split_whitespace`
- [std · slice](https://doc.rust-lang.org/std/primitive.slice.html)

## L'idée

![04 - Slices](cours.svg)

Une slice est une **vue empruntée** sur une partie d'une collection, sans copie :

- `&str` : une vue sur du texte (une `String`, ou un littéral `"..."` qui vit dans le binaire).
- `&[T]` : une vue sur une partie d'un tableau ou d'un `Vec<T>`.

```ts
const id = line.slice(0, line.indexOf(":")); // nouvelle chaîne, copiée
```
```rust
let id = &line[..line.find(':').unwrap()];   // vue sur line, aucune copie
```

La slice emprunte la donnée : tant qu'elle vit, impossible de modifier ou de détruire la `String` d'origine. C'est ce qui rend la vue sûre.

Pourquoi les fonctions prennent `&str` et pas `&String` : relis la fin de la section 4.4.

## À retenir

- `&str` et `&[T]` sont des vues (pointeur + longueur), sans copie.
- Une fonction qui lit du texte prend `&str` : elle accepte alors `&String` et les littéraux.
- Les index d'une `&str` sont des **octets** : attention aux caractères accentués.
