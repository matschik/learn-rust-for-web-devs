# Module 02 : Ownership et structs

C'est le module le plus important du parcours. L'ownership, c'est la façon dont Rust gère la mémoire sans garbage collector, et presque tout le reste du langage en découle. C'est aussi là que la plupart des gens bloquent au début. Prends ton temps, c'est normal de relire une leçon deux fois.

Pour t'aider, on va raisonner avec des **permissions** : à chaque ligne, une variable a le droit de lire (R), d'écrire (W) ou de posséder (O) sa donnée, et elle gagne ou perd ces droits au fil du code. Une fois que tu vois le code comme ça, les erreurs du compilateur deviennent beaucoup plus claires. Le tuteur raisonne de la même façon, plutôt qu'avec des recettes toutes faites.

On finit avec les structs, l'équivalent de tes interfaces et de tes classes. Si tu veux creuser, les leçons suivent les [chapitres 4](https://rust-book.cs.brown.edu/ch04-00-understanding-ownership.html) et [5](https://rust-book.cs.brown.edu/ch05-00-structs.html) du Rust Book, en anglais et facultatifs.

## Sommaire

1. [Move](01-move/) : chaque valeur a un seul propriétaire, et la mémoire est libérée dès qu'il disparaît. *En TS : le garbage collector s'en occupe.*
2. [Références et borrowing](02-borrowing/) : prêter une valeur en lecture avec `&`, ou en écriture avec `&mut`. *En TS : tout objet est partagé, sans contrôle.*
3. [Corriger les erreurs d'ownership](03-fixing-errors/) : les erreurs d'ownership classiques, et la bonne façon de les corriger. *En TS : ces bugs partent en prod.*
4. [Slices](04-slices/) : `&str` et `&[T]`, des vues sur une donnée, sans copie. *En TS : `.slice()`, qui copie.*
5. [Structs](05-structs/) : regrouper des champs dans un type, et la mise à jour avec `..`. *En TS : une `interface` et le spread.*
6. [Méthodes](06-methods/) : `impl`, et le choix entre `&self`, `&mut self` et `self`. *En TS : une `class` avec ses méthodes.*
7. [Capstone : un sprint](07-capstone/) : tout le module dans une petite struct métier, avec `Option`. *En TS : une petite classe métier.*

## Avant de commencer

- [ ] Lance `/next` dans Claude Code : il te pose d'abord quelques questions de rappel sur le module 01.

## À la fin du module

Tu sauras :

- dire qui possède une valeur, et ce qui se passe quand elle est déplacée ;
- prêter une valeur en lecture ou en écriture, et lire une erreur du borrow checker ;
- travailler avec des slices et des `&str` ;
- modéliser des données avec des structs et leur donner des méthodes.
