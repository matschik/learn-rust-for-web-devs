# Module 02 : Ownership et structs

L'ownership, puis les structs. C'est le module le plus important du parcours : tout le reste de Rust repose sur l'ownership. Les leçons suivent les [chapitres 4](https://rust-book.cs.brown.edu/ch04-00-understanding-ownership.html) et [5](https://rust-book.cs.brown.edu/ch05-00-structs.html) du Rust Book, qui reste facultatif.

Les leçons expliquent le borrow checker avec des **permissions** (R lire, W écrire, O posséder), que chaque variable gagne et perd au fil du code. C'est le modèle de la version Brown du Rust Book, et le tuteur raisonne avec lui : apprends-le, pas des recettes.

| Exercice | Rust Book | Concept | Ce qui change par rapport à TS |
| --- | --- | --- | --- |
| `01-move` | 4.1 | ownership, move, `Drop` | pas de GC : un seul propriétaire, libération déterministe |
| `02-borrowing` | 4.2 | `&T`, `&mut T`, permissions | plusieurs lecteurs **ou** un seul écrivain, vérifié à la compilation |
| `03-fixing-errors` | 4.3 | les erreurs d'ownership classiques et leur bonne correction | le compilateur refuse ce que JS laisserait passer |
| `04-slices` | 4.4 | `&str`, `&[T]` | des vues sans copie, là où `.slice()` copie |
| `05-structs` | 5.1, 5.2 | `struct`, init raccourcie, mise à jour `..` | `interface` + objet littéral, spread |
| `06-methods` | 5.3 | `impl`, `&self`, `&mut self`, `self` | `class` avec méthodes |
| `07-capstone` | 4, 5 | tout ensemble | une petite classe métier |

## Avant de commencer

- [ ] Lance `/next` dans Claude Code : il te pose d'abord quelques questions de rappel sur le module 01.

## Fin de module

- [ ] Lance `/quiz` dans Claude Code.
- [ ] Facultatif, en anglais : lis le [récapitulatif de l'ownership (4.5)](https://rust-book.cs.brown.edu/ch04-05-ownership-recap.html), qui compare Rust au GC de JS, et fais l'[Ownership Inventory #1](https://rust-book.cs.brown.edu/ch06-04-inventory.html), un quiz de synthèse sur le chapitre 4.
- [ ] Démarre l'étape 1 de Taskr : passe Claude Code en style de sortie Learning (`/output-style`) et dis « on démarre l'étape 1 de Taskr ». Le brief est dans `projects/taskr/README.md`.
