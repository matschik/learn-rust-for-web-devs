# 02 - Références et borrowing · cours

Dans la leçon précédente, passer une `String` à une fonction la faisait disparaître. Pas très pratique quand la fonction veut juste la lire ! Heureusement, Rust te permet de la prêter. On appelle ça un **emprunt** (borrow), et tu récupères ta valeur juste après. Compte une vingtaine de minutes.

## Ce que tu vas apprendre

- Prêter une valeur en lecture avec `&`, et en écriture avec `&mut`.
- La règle d'or : plusieurs lecteurs **ou** un seul écrivain.
- Suivre les permissions R, W, O pendant un emprunt.
- Lire la signature d'une méthode dans la doc std pour savoir ce qu'elle emprunte.

## Emprunter, c'est prêter sans donner

Une référence `&T` donne accès à une valeur sans en prendre possession. Le propriétaire reste propriétaire :

```rust
pub fn count_words(text: &String) -> usize {
    text.split(' ').count()
}

let note = String::from("à relire demain");
let n = count_words(&note);   // on prête note
println!("{note}");           // note est toujours là
```

Remarque deux choses. La fonction annonce dans sa signature qu'elle veut juste lire, avec `&String` et pas `String`. Et l'appelant l'écrit aussi, avec `&note`. Tu vois à l'appel que la valeur est seulement prêtée.

En TS, rien de tout ça ne se voit. La fonction pourrait garder l'objet, le modifier, le stocker. Ici, la signature est un contrat.

![02 - Références et borrowing](cours.svg)

## Emprunter pour modifier : `&mut`

Si la fonction doit modifier la valeur, il faut une référence mutable, `&mut T` :

```ts
function shout(note: { text: string }) {
  note.text += " !";
}
```

```rust
pub fn shout(text: &mut String) {
    text.push_str(" !");
}

let mut note = String::from("à relire");
shout(&mut note);
// note vaut maintenant "à relire !"
```

Pour pouvoir prêter en écriture, la variable doit être `mut`, et l'appelant écrit `&mut note`. En lisant l'appel, tu sais que `note` va changer. En TS, tu ne le saurais qu'en allant lire `shout`.

## Plusieurs lecteurs ou un seul écrivain

Voici la règle qui fait la force de Rust. À un instant donné, une valeur peut avoir :

- autant de références `&T` que tu veux, **ou**
- une seule référence `&mut T`, et aucune autre.

Jamais les deux à la fois. Essaie de prêter deux fois en écriture :

```rust
let mut note = String::from("x");
let a = &mut note;
let b = &mut note;
a.push('!');
```

```
error[E0499]: cannot borrow `note` as mutable more than once at a time
  --> src/lib.rs:3:13
   |
2  |     let a = &mut note;
   |             --------- first mutable borrow occurs here
3  |     let b = &mut note;
   |             ^^^^^^^^^ second mutable borrow occurs here
4  |     a.push('!');
   |     - first borrow later used here
```

Pourquoi si strict ? Parce que c'est la source d'une famille entière de bugs. Pense à une liste qu'on modifie pendant qu'on la parcourt, deux requêtes qui écrivent dans le même objet, un cache qui change sous tes pieds. En TS, tu les trouves en prod. En Rust, ils ne compilent pas.

## Les permissions pendant un emprunt

Reprenons le modèle R, W, O de la leçon précédente. Quand tu crées une référence, le propriétaire **perd** des permissions, le temps que la référence est utilisée :

| Ligne | `note` | La référence |
| --- | --- | --- |
| `let mut note = String::from("à relire");` | R W O | |
| `let r = &note;` | R | `r` peut lire |
| `println!("{r}");` | R W O, rendues après ce dernier usage de `r` | `r` n'existe plus |
| `note.push_str("!");` | R W O | |

Pendant que `r` existe, `note` garde le droit de lire, mais perd W et O. C'est logique, car si `note` pouvait changer ou être libérée, `r` pointerait sur une donnée périmée.

Avec `&mut`, c'est encore plus net. Le propriétaire perd **tout**, même R, tant que la référence mutable est utilisée. L'emprunteur a l'exclusivité.

Retiens surtout que les permissions reviennent dès le **dernier usage** de la référence, pas à la fin du bloc. C'est pour ça que l'exemple ci-dessus compile.

## Ce qu'on fait avec une référence

La plupart du temps, une référence s'utilise comme la valeur elle-même. Les méthodes marchent directement :

```rust
let text: &String = &note;
text.len()     // pas besoin d'écrire (*text).len()
```

Le `*` sert à **déréférencer**, c'est-à-dire à suivre la référence jusqu'à la valeur. Tu en auras besoin pour lire un nombre derrière une référence (`*count + 1`) ou pour remplacer toute la valeur pointée (`*text = String::new()`).

## Lire la doc std pour savoir ce qu'une méthode emprunte

Dans l'exercice, tu vas chercher des méthodes dans la doc de la bibliothèque standard. Voici comment lire une signature, par exemple celle de `push_str` sur la [page de String](https://doc.rust-lang.org/std/string/struct.String.html) :

```rust
pub fn push_str(&mut self, string: &str)
```

- `&mut self` : la méthode modifie la `String` sur laquelle tu l'appelles. Il te faut donc un accès en écriture.
- `string: &str` : elle lit le texte à ajouter, sans le prendre.
- Pas de `->` : elle ne renvoie rien, elle modifie en place.

À l'inverse, `pub fn len(&self) -> usize` prend `&self`, c'est une simple lecture. La page de `String` liste des dizaines de méthodes. Le module `std::mem` contient aussi des outils qui travaillent sur des `&mut`, comme `swap`, qui échange deux valeurs.

## Teste-toi

1. Une fonction a la signature `fn rename(task: &mut String)`. Qu'écris-tu à l'appel, et à quelle condition sur la variable ?
2. Ce code compile-t-il ? `let s = String::from("a"); let r1 = &s; let r2 = &s; println!("{r1}{r2}");`
3. Et celui-ci ? `let mut s = String::from("a"); let r = &s; s.push('b'); println!("{r}");`
4. D'après sa signature `pub fn clear(&mut self)`, que fait `clear` à la `String` ?

> **Réponses**
> 1. `rename(&mut task)`, et la variable doit avoir été déclarée avec `let mut`.
> 2. Oui : deux lecteurs en même temps, c'est permis.
> 3. Non, erreur E0502 : `r` est encore utilisée après `push`, donc `s` n'a pas retrouvé sa permission W au moment du `push`.
> 4. Elle la modifie en place (`&mut self`) et ne renvoie rien. Ici, elle la vide.

## À retenir

- `&T` emprunte en lecture, `&mut T` en écriture. L'appelant l'écrit aussi : la mutation se voit à l'appel.
- Plusieurs `&T` **ou** une seule `&mut T`, jamais les deux en même temps.
- Pendant un emprunt, le propriétaire perd des permissions, et les récupère au dernier usage de la référence.
- La signature d'une méthode (`&self`, `&mut self`, `self`) te dit ce qu'elle fait de la valeur.

## Pour aller plus loin

Tu as déjà tout ce qu'il faut pour l'exercice. Si tu as envie de creuser, voici quelques lectures, en anglais et complètement facultatives.

- [Rust Book 4.2 · References and Borrowing](https://rust-book.cs.brown.edu/ch04-02-references-and-borrowing.html) : avec ses quiz et les schémas de permissions ligne par ligne.
- [std · String](https://doc.rust-lang.org/std/string/struct.String.html) : toutes les méthodes de `String`.
- [std · mem::swap](https://doc.rust-lang.org/std/mem/fn.swap.html)
