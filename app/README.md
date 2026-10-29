# Learn Rust, l'app desktop

La leçon, l'éditeur de code et un terminal dans une seule fenêtre. L'apprenant crée ses projets avec `cargo` dans son propre workspace, et l'app vérifie son travail. Pour se faire coacher, il lance l'IA de son choix (Claude Code, Codex, opencode…) dans le terminal intégré.

Statut : premier jet. Les leçons affichées sont encore celles du repo, écrites pour les exercices tout prêts.

## Lancer l'app

Il faut Rust, Node 22 et pnpm, plus les [prérequis Tauri](https://tauri.app/start/prerequisites/) de ton système.

```
cd app
pnpm install
pnpm tauri dev
```

## Raccourcis

Les mêmes que dans VS Code (Ctrl au lieu de Cmd sous Windows et Linux) :

| Raccourci | Action |
| --- | --- |
| Cmd+P | Ouvrir un fichier par son nom |
| Cmd+S | Enregistrer |
| Cmd+W | Fermer l'onglet |
| Cmd+Entrée | Vérifier (cargo build, puis cargo test) |
| Cmd+B | Afficher ou masquer l'explorateur |
| Cmd+J | Afficher ou masquer le terminal |

Clic droit dans l'arbre : nouveau fichier, nouveau dossier, renommer, supprimer (à la corbeille).

Pour travailler sur l'interface sans l'app : `pnpm dev`, puis http://127.0.0.1:1420. Les leçons sont les vraies, le workspace, `cargo` et le terminal sont simulés.

Les conventions de développement sont dans [AGENTS.md](AGENTS.md).
