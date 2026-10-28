# 05 - Structs · cours

Jusqu'ici, tu as manipulé des valeurs isolées. Pour décrire un utilisateur ou une tâche, il te faut un type qui regroupe plusieurs champs, et en Rust, c'est la `struct`. Elle ressemble beaucoup à une `interface` TS, à une grosse différence près : en Rust, la struct est à la fois le type **et** la donnée. Prévois un quart d'heure.

## Ce que tu vas apprendre

- Déclarer une struct et créer une instance.
- Écrire moins avec l'initialisation raccourcie et la mise à jour `..`.
- Savoir ce que `..` déplace, et ce qu'il copie.
- Choisir entre `String` et `&str` pour un champ.
- Afficher et comparer une struct avec `#[derive(Debug, PartialEq)]`.

## Une interface et un objet en même temps

En TS, tu décris une forme avec une `interface`, puis n'importe quel objet qui a cette forme fait l'affaire. En Rust, tu déclares une struct, et chaque valeur est créée **à partir de ce type**, par son nom :

```ts
interface User {
  email: string;
  name: string;
  active: boolean;
  loginCount: number;
}
const ada: User = { email: "ada@taskr.dev", name: "Ada", active: true, loginCount: 0 };
```

```rust
struct User {
    email: String,
    name: String,
    active: bool,
    login_count: u32,
}

let ada = User {
    email: String::from("ada@taskr.dev"),
    name: String::from("Ada"),
    active: true,
    login_count: 0,
};
```

Rust n'a pas d'objet littéral anonyme. Tu écris toujours `User { ... }`, et tous les champs doivent être remplis. On lit un champ avec un point, `ada.email`, comme en TS. Les noms suivent la convention Rust, en `snake_case`.

![05 - Structs](cours.svg)

## Tout ou rien pour `mut`

Pour modifier un champ, toute l'instance doit être `mut`. Rust ne permet pas de marquer un seul champ comme modifiable :

```rust
let user = User { /* ... */ };
user.active = false;
```

```
error[E0594]: cannot assign to `user.active`, as `user` is not declared as mutable
```

La correction, tu la connais déjà, c'est `let mut user`. Et tu retrouves le modèle des permissions, puisque W s'applique à la variable entière, donc à tous ses champs.

## Le champ possède sa donnée : `String` plutôt que `&str`

Pourquoi `email: String` et pas `email: &str` ? Parce qu'une struct qui possède ses champs est autonome. Quand elle est libérée, ses `String` le sont avec elle. Avec un `&str`, la struct emprunterait du texte qui appartient à quelqu'un d'autre, et il faudrait prouver au compilateur que ce texte vit assez longtemps. Ça demande des lifetimes, un sujet pour plus tard.

En pratique, tes fonctions reçoivent souvent du `&str` et le transforment en `String` pour le stocker :

```rust
let email: &str = "ada@taskr.dev";
let owned = String::from(email);   // ou email.to_string()
```

## Écrire moins : l'initialisation raccourcie

Quand une variable a le même nom qu'un champ, tu peux ne l'écrire qu'une fois, comme en TS :

```ts
const user = { email, name, active: true, loginCount: 0 };
```

```rust
let user = User { email, name, active: true, login_count: 0 };
```

Ça ne marche que si `email` et `name` ont déjà le bon type, ici `String`.

## La mise à jour avec `..`, le spread de Rust

Pour créer une instance à partir d'une autre en changeant quelques champs, TS a le spread. Rust a `..` :

```ts
const grace = { ...ada, email: "grace@taskr.dev" };
```

```rust
let grace = User {
    email: String::from("grace@taskr.dev"),
    ..ada
};
```

Deux différences avec TS. D'abord, `..ada` se met **à la fin**, et les champs écrits explicitement l'emportent. Ensuite, et c'est le plus important, `..` ne fait pas de copie : il **déplace** les champs repris.

## Ce que `..` déplace

Dans l'exemple, `grace` reprend `name`, `active` et `login_count` de `ada`. `active` et `login_count` sont `Copy`, donc copiés. Mais `name` est une `String`, elle est donc déplacée de `ada` vers `grace`. Du coup, `ada` est **partiellement déplacée** :

```rust
println!("{}", ada.email);    // ok : email n'a pas été repris
println!("{:?}", ada);        // erreur : ada.name est parti
```

```
error[E0382]: borrow of partially moved value: `ada`
 --> src/main.rs:9:22
  |
6 |     let grace = User { email: String::from("grace@taskr.dev"), ..ada };
  |                 ------------------------------------------------------ value partially moved here
...
9 |     println!("{:?}", ada);
  |                      ^^^ value borrowed here after partial move
  |
  = note: partial move occurs because `ada.name` has type `String`, which does not implement the `Copy` trait
```

C'est la règle des moves de la leçon 01, appliquée champ par champ. Si une fonction prend une struct par valeur pour en fabriquer une autre avec `..`, c'est exactement ce qu'on veut, puisque l'ancienne ne sert plus.

## `derive` : afficher et comparer

Par défaut, une struct ne sait ni s'afficher ni se comparer. Tu demandes au compilateur de générer ce code avec un attribut :

```rust
#[derive(Debug, PartialEq)]
struct User { /* ... */ }
```

- `Debug` permet `println!("{:?}", user)`, qui affiche `User { email: "grace@taskr.dev", name: "Ada", active: true, login_count: 0 }`. Avec `{:#?}`, tu obtiens une version sur plusieurs lignes.
- `PartialEq` permet `==` entre deux `User`, champ par champ.

Les deux ensemble rendent possible `assert_eq!` sur des structs dans les tests. Il compare avec `==`, et affiche les deux valeurs avec `Debug` si elles diffèrent.

En TS, `===` sur deux objets compare les références. En Rust, `==` avec `PartialEq` compare le contenu.

## Teste-toi

1. Peut-on créer un `User` sans donner `login_count` ?
2. `let u = User { /* ... */ }; u.name.push('!');` compile-t-il ?
3. Après `let b = User { name: String::from("B"), ..a };`, peut-on encore lire `a.email` ? Et `a.name` ?
4. Sans `#[derive(PartialEq)]`, que se passe-t-il avec `assert_eq!(user1, user2)` ?

> **Réponses**
> 1. Non, tous les champs sont obligatoires, sauf si tu complètes avec `..autre_instance`.
> 2. Non : `u` n'est pas `mut`, donc aucun de ses champs ne peut être modifié.
> 3. Pas `a.email` : c'est une `String` reprise par `..a`, donc déplacée dans `b`. Mais `a.name` oui, car `b` a reçu son propre `name` et n'a pas touché celui de `a`.
> 4. Ça ne compile pas : `assert_eq!` a besoin de `==`, que `PartialEq` fournit.

## À retenir

- Une struct nomme toujours son type : pas d'objet littéral anonyme, tous les champs sont remplis.
- `mut` s'applique à toute l'instance, pas à un champ.
- Une struct qui possède ses champs (`String`) les libère avec elle. Les `&str` dans une struct attendront les lifetimes.
- `..autre` reprend les champs restants, et **déplace** ceux qui ne sont pas `Copy`.
- `#[derive(Debug, PartialEq)]` génère l'affichage `{:?}` et la comparaison `==`.

## Pour aller plus loin

Tu as déjà tout ce qu'il faut pour l'exercice. Si tu as envie de creuser, voici quelques lectures, en anglais et complètement facultatives.

- [Rust Book 5.1 · Defining and Instantiating Structs](https://rust-book.cs.brown.edu/ch05-01-defining-structs.html) : avec ses quiz, dont un sur les permissions des champs.
- [Rust Book 5.2 · An Example Program Using Structs](https://rust-book.cs.brown.edu/ch05-02-example-structs.html) : `#[derive(Debug)]` en action.
