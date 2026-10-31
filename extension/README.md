# Learn Rust for web devs

Apprendre Rust dans ton éditeur quand tu viens de TypeScript. La leçon s'ouvre à côté de ton code, tu crées tes propres projets avec `cargo`, et le compilateur te sert de prof.

En français, avec les termes techniques en anglais (ownership, borrow checker, trait, crate). Le parcours suit la [version Brown du Rust Book](https://rust-book.cs.brown.edu/) et compare chaque notion à ce que tu fais déjà en TS.

## Comment ça marche

1. Ouvre un dossier vide : ce sera ton workspace, celui de tes projets Rust.
2. Clique sur l'icône Learn Rust dans la barre d'activité, puis sur la première leçon.
3. Lis le cours, réponds à « Teste-toi », puis passe à la pratique : crée ton projet dans le terminal avec `cargo new`, et coche les étapes au fur et à mesure.
4. **Vérifier** lance `cargo test` sur ton projet. Les erreurs du compilateur s'affichent dans l'onglet Problèmes, grâce à rust-analyzer, installé avec l'extension.

Ta progression est enregistrée dans `.learn-rust/progress.json`, dans ton workspace : elle te suit si tu changes de machine, et ton outil d'IA peut la lire.

Quand tu rouvres ce workspace, tout se remet en place : ton code à gauche, la leçon en cours à droite, le sommaire et un terminal. Tu peux couper ce comportement avec le réglage `learnRust.openOnStartup`.

## Avec ton IA

L'extension n'embarque pas d'IA. Utilise celle que tu as déjà (Claude Code, Copilot, Cursor, Codex…) comme un tuteur : demande-lui d'expliquer une erreur ou de te donner un indice, pas d'écrire le code à ta place.

## Prérequis

- [rustup](https://rustup.rs/), pour `cargo` et `rustc`.
- rust-analyzer, installé automatiquement avec l'extension.

## Commandes

| Commande | Raccourci |
| --- | --- |
| Learn Rust : Reprendre là où j'en étais | clic sur la barre d'état |
| Learn Rust : Vérifier mon projet (cargo test) | Cmd+Alt+Entrée (Ctrl+Alt+Entrée) |

## Licence

Le code est sous licence MIT, les leçons sous licence CC BY 4.0. Sources : [matschik/learn-rust-for-web-devs](https://github.com/matschik/learn-rust-for-web-devs).
