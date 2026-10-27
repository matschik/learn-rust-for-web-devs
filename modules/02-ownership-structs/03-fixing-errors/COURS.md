# 03 - Corriger les erreurs d'ownership · cours

## À lire dans le Rust Book

- [Rust Book 4.3 · Fixing Ownership Errors](https://rust-book.cs.brown.edu/ch04-03-fixing-ownership-errors.html) : le chapitre que la version Brown a ajouté, exactement pour cet exercice
- [Erreur E0106 · missing lifetime specifier](https://doc.rust-lang.org/error_codes/E0106.html)
- [Erreur E0502 · cannot borrow as mutable because it is also borrowed as immutable](https://doc.rust-lang.org/error_codes/E0502.html)
- [Erreur E0507 · cannot move out of borrowed content](https://doc.rust-lang.org/error_codes/E0507.html)

## L'idée

![03 - Corriger les erreurs d'ownership](cours.svg)

Trois erreurs classiques, une par fonction. Chacune a une version « qui compile » mauvaise (souvent avec `.clone()` ou `'static`) et une bonne. Le chapitre 4.3 explique comment choisir : se demander **ce que le programme essaie de faire**, pas seulement comment faire taire le compilateur.

## À retenir

- Une erreur d'ownership se lit en permissions : laquelle manque, sur quel chemin, depuis quelle ligne.
- Ne pas renvoyer de référence vers une valeur locale : renvoie la valeur elle-même.
- `.clone()` fait taire le compilateur mais copie la donnée : il faut une vraie raison de copier.
