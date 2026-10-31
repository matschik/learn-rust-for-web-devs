# Learn Rust, l'extension VS Code

L'extension affiche les leçons du repo (`../modules`) dans un panneau à côté du code. L'apprenant crée ses propres projets avec `cargo` dans son workspace ; « Vérifier » lance `cargo test`. Elle marche aussi dans Cursor, Windsurf et VSCodium.

## Commandes

Toutes depuis `extension/`.

| But | Commande |
| --- | --- |
| Tout vérifier avant de rendre la main | `pnpm verify` (tsc, vitest, build) |
| Essayer l'extension sur un workspace | `pnpm dev <dossier>` (ouvre une fenêtre VS Code avec l'extension, recompile en continu ; Cmd+R pour recharger) |
| Déboguer avec des points d'arrêt | F5 dans VS Code ouvert sur le repo (config « Extension Learn Rust ») |
| Tests | `pnpm test` |
| Fabriquer le `.vsix` | `pnpm package` |

## Architecture

```
src/
  extension.ts     activation : sommaire, panneau, Vérifier, barre d'état
  course.ts        lit les leçons (course/ une fois publiée, ../modules en développement)
  markdown.ts      rendu des fiches (repris de dashboard/index.html)
  progress.ts      format de .learn-rust/progress.json
  store.ts         la progression du workspace, relue si le fichier change
  tree.ts          le sommaire dans la barre latérale
  lessonPanel.ts   le panneau de la leçon (webview) et ses styles
  verify.ts        cargo test dans une tâche VS Code
  cargo.ts         trouver le projet cargo d'un fichier
  webview/lesson.ts  le script du panneau : onglets, cases, boutons
scripts/bundle-course.mjs  copie ../modules dans course/ au build
```

## Règles

- **La logique testable ne dépend pas de `vscode`.** `course.ts`, `progress.ts`, `markdown.ts` et `cargo.ts` se testent avec vitest. Ce qui touche à l'API VS Code reste mince.
- **Le panneau n'a pas d'accès direct.** Il envoie des messages typés (`FromPanel`) ; l'extension lit, écrit et lance cargo. CSP stricte avec un nonce : pas de script inline, pas de ressource distante.
- **Les couleurs viennent du thème.** Pas de couleur en dur hors du repli et de l'accent Rust : le panneau doit rester lisible en clair, en sombre et en contraste élevé.
- **Le workspace appartient à l'apprenant.** L'extension n'y écrit que `.learn-rust/progress.json`.
- **Le contenu vient de `../modules`.** On ne modifie pas une leçon ici ; on corrige la fiche dans `modules/`.

## Vérifier l'interface

Le téléchargement de VS Code peut être bloqué dans un environnement isolé. code-server (npm, Node 24) fait l'affaire : installe le `.vsix` avec `--install-extension`, ouvre un workspace avec un projet `cargo new`, et pilote la page avec Playwright. Le panneau est dans deux iframes imbriquées (`iframe.webview` puis `iframe#active-frame`).

## Pièges connus

- `extensionDependencies` impose rust-analyzer : sans lui, VS Code n'active pas l'extension. Pour un test sans réseau, une extension vide `rust-lang.rust-analyzer` suffit.
- rust-analyzer trouve les projets cargo à la racine du workspace et un niveau en dessous : c'est là que `cargo new` les crée.
