# Learn Rust, l'app desktop

App Tauri 2 : la leçon, l'éditeur de code et un terminal dans une seule fenêtre. L'apprenant code dans son propre workspace ; l'app n'embarque pas d'IA (il lance la sienne dans le terminal). Spec et choix produits : voir la PR qui a créé ce dossier.

## Commandes

Toutes depuis `app/`.

| But | Commande |
| --- | --- |
| Tout vérifier avant de rendre la main | `pnpm verify` (svelte-check, vitest, rustfmt, clippy `-D warnings`, cargo test) |
| Lancer l'app | `pnpm tauri dev` |
| Développer l'interface sans l'app | `pnpm dev`, puis http://127.0.0.1:1420 |
| Tests du front | `pnpm test` |
| Tests du cœur Rust | `cd src-tauri && cargo test` |

`pnpm verify` doit passer avant chaque commit.

## Architecture

```
src-tauri/src/
  lib.rs        les commandes Tauri, fines : elles appellent les modules
  course.rs     les leçons, lues dans ../modules (ou $LEARN_RUST_COURSE)
  workspace.rs  arbre, lecture, écriture, création, renommage, corbeille, sans jamais sortir du workspace
  watcher.rs    surveille le workspace (notify) : l'arbre et les onglets suivent le terminal et les IA
  verify.rs     « Vérifier » : cargo build puis cargo test
  terminal.rs   les shells dans un pty (portable-pty), sortie par Channel
  error.rs      AppError, l'erreur unique renvoyée au front
src/lib/
  bindings.ts   GÉNÉRÉ par tauri-specta, ne pas éditer
  api.ts        la seule porte vers le cœur ; bascule sur mock.ts hors de Tauri
  mock.ts       le monde simulé du mode navigateur
  markdown.ts   rendu des leçons (repris de dashboard/index.html)
  diagnostics.ts  erreurs de cargo → soulignés dans l'éditeur
  fuzzy.ts      la recherche de l'ouverture rapide (Cmd+P)
  components/   Lesson, Explorer + FileTree + ContextMenu, Tabs, Editor (Monaco, un modèle
                par onglet), QuickOpen, Splitter, Terminal (xterm.js)
src/routes/+page.svelte  l'écran principal : disposition, onglets, raccourcis
```

## Règles

- **Une commande = une ligne.** La logique va dans un module de `src-tauri/src/`, avec ses tests unitaires (dossiers temporaires via `tempfile`). Une commande ne fait que convertir ses arguments et appeler ce module.
- **Les types du front sont générés.** Après tout changement de commande ou de type exposé, lance `cargo test` dans `src-tauri` : il régénère `src/lib/bindings.ts`. Commite le fichier régénéré. N'écris jamais de `invoke("…")` à la main : passe par `api.ts`.
- **Chaque commande existe aussi dans `mock.ts`.** `Api` est une interface TypeScript : `pnpm check` échoue si le mock oublie une méthode. Le mode navigateur doit rester utilisable.
- **Le workspace appartient à l'apprenant.** Tout chemin passe par `workspace::resolve`, qui refuse `..` et les chemins absolus. L'app ne fait que ce que l'apprenant demande (enregistrer, créer, renommer) et une suppression va à la corbeille.
- **Comme VS Code, pas plus.** L'éditeur reprend les gestes de VS Code utiles pour apprendre (onglets, Cmd+P, clic droit dans l'arbre, Cmd+B, Cmd+J). Garde les mêmes raccourcis et les mêmes comportements ; n'invente pas les tiens.
- **Permissions au plus juste.** `src-tauri/capabilities/default.json` n'ouvre que ce qui sert. Ajouter un plugin, c'est ajouter la permission précise, jamais un `*:default` par confort.
- **Erreurs lisibles.** Les messages vus par l'apprenant sont en français, sans jargon interne. Pas de `unwrap()` hors des tests (clippy le signale).

## Vérifier l'interface

Après un changement d'interface, regarde le résultat au lieu de le supposer :

1. `pnpm dev` (mode navigateur, données simulées), puis une capture avec Playwright à 1440×900 : choisis le workspace, ouvre `variables/src/lib.rs`, clique sur « Vérifier ».
2. Pour l'app réelle sous Linux sans écran : `pnpm tauri build --debug --no-bundle`, puis lance `src-tauri/target/debug/learn-rust-app` sous `xvfb-run` avec `LEARN_RUST_WORKSPACE=<un dossier>` (évite le sélecteur de dossier), et capture avec `import -window root`.

## Pièges connus

- `src-tauri` a son propre `[workspace]` cargo : il ne fait pas partie du workspace des exercices à la racine du repo.
- Monaco est importé langage par langage (`monaco-editor/languages/definitions/<lang>/register`) pour garder l'app légère ; ajoute un langage de la même façon.
- Sur macOS, le menu natif capte ses raccourcis avant la page : `macos_menu` dans `lib.rs` n'en garde que le strict nécessaire, pour que Cmd+W et Cmd+Z arrivent à l'éditeur. Les raccourcis de l'app sont écoutés en phase de capture, avant Monaco et xterm.
- Avec inotify (Linux), un fichier créé dans un dossier tout neuf peut arriver avant que le dossier soit surveillé : on ne reçoit que le dossier. Le front relit tout l'arbre à chaque changement, donc rien ne manque à l'écran.
- `tauri-specta` et `specta` sont en release candidate : leurs versions sont épinglées (`=`) ensemble dans `Cargo.toml`. Monte-les ensemble, jamais l'une sans l'autre.
