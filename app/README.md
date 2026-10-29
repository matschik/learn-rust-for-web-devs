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

Pour travailler sur l'interface sans l'app : `pnpm dev`, puis http://127.0.0.1:1420. Les leçons sont les vraies, le workspace, `cargo` et le terminal sont simulés.

Les conventions de développement sont dans [AGENTS.md](AGENTS.md).
