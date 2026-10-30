// Le panneau de la leçon, ouvert à côté du code : le cours, puis la fiche pratique avec ses
// étapes à cocher. Le markdown est rendu ici ; le script du panneau (webview/lesson.ts) ne
// fait que les onglets, les cases et les boutons.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as vscode from "vscode";
import { neighbour, readLesson, stepKeys, type Lesson, type Module } from "./course";
import { esc, markdown, withoutTitle } from "./markdown";
import type { ProgressStore } from "./store";

/** Ce que le panneau envoie à l'extension. */
export type FromPanel =
  | { type: "check"; key: string; on: boolean }
  | { type: "open"; ref: string }
  | { type: "verify" }
  | { type: "terminal" };

/** Ce que l'extension envoie au panneau. */
export type ToPanel = { type: "checks"; checks: Record<string, boolean> } | { type: "verify"; state: "running" | "ok" | "fail" | "idle" };

export class LessonPanel implements vscode.Disposable {
  static readonly viewType = "learnRust.lesson";
  private panel: vscode.WebviewPanel | undefined;
  private lesson: Lesson | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly courseRoot: string,
    private readonly modules: Module[],
    private readonly store: ProgressStore,
    private readonly actions: { verify: () => void; terminal: () => void },
  ) {
    this.disposables.push(store.onDidChange((p) => this.post({ type: "checks", checks: p.checks })));
  }

  get ref(): string | undefined {
    return this.lesson && `${this.lesson.moduleId}/${this.lesson.id}`;
  }

  get isOpen(): boolean {
    return Boolean(this.panel);
  }

  /** Les options du panneau, partagées avec la restauration au démarrage. */
  options(): vscode.WebviewPanelOptions & vscode.WebviewOptions {
    return {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "dist")],
    };
  }

  /** VS Code rouvre le panneau là où l'apprenant l'avait laissé : on le reprend tel quel. */
  restore(panel: vscode.WebviewPanel, ref: string | undefined) {
    this.adopt(panel);
    const target = ref ?? this.store.current.lesson;
    if (target) this.show(target);
    else panel.dispose();
  }

  private adopt(panel: vscode.WebviewPanel) {
    this.panel = panel;
    panel.webview.options = this.options();
    panel.iconPath = vscode.Uri.joinPath(this.extensionUri, "media", "icon.svg");
    panel.onDidDispose(() => (this.panel = undefined), null, this.disposables);
    panel.webview.onDidReceiveMessage((m: FromPanel) => this.receive(m), null, this.disposables);
  }

  /** Ouvre la leçon ; la première fois, dans la colonne de droite, le code restant à gauche. */
  show(ref: string, options: { focus?: boolean } = {}) {
    const [moduleId, lessonId] = ref.split("/");
    const lesson = readLesson(this.courseRoot, moduleId ?? "", lessonId ?? "");
    if (!lesson) {
      vscode.window.showErrorMessage(`Leçon introuvable : ${ref}`);
      return;
    }
    this.lesson = lesson;
    if (!this.panel) {
      this.adopt(
        vscode.window.createWebviewPanel(
          LessonPanel.viewType,
          lesson.title,
          { viewColumn: vscode.ViewColumn.Two, preserveFocus: !options.focus },
          this.options(),
        ),
      );
    } else if (options.focus !== false) {
      this.panel.reveal(undefined, !options.focus);
    }
    const panel = this.panel!;
    panel.title = lesson.title;
    panel.webview.html = this.html(panel.webview, lesson);
    if (this.store.current.lesson !== ref) this.store.update((p) => ({ ...p, lesson: ref }));
  }

  post(message: ToPanel) {
    this.panel?.webview.postMessage(message);
  }

  private receive(message: FromPanel) {
    if (message.type === "check") this.store.update((p) => ({ ...p, checks: { ...p.checks, [message.key]: message.on } }));
    else if (message.type === "open") this.show(message.ref);
    else if (message.type === "verify") this.actions.verify();
    else if (message.type === "terminal") this.actions.terminal();
  }

  private html(webview: vscode.Webview, lesson: Lesson): string {
    const { checks } = this.store.current;
    const state = { key: (text: string) => `${lesson.moduleId}/${lesson.id}#${text}`, checked: (key: string) => Boolean(checks[key]) };
    // Les schémas sont insérés tels quels : ils prennent les couleurs du thème par leurs variables CSS.
    const image = (src: string, alt: string) => {
      if (!/^[\w-]+\.svg$/.test(src)) return "";
      try {
        return readFileSync(join(lesson.dir, src), "utf8");
      } catch {
        return `<p class="muted">${esc(alt)}</p>`;
      }
    };
    const cours = markdown(withoutTitle(lesson.cours), { image });
    const pratique = markdown(withoutTitle(lesson.pratique), { checks: state, image });
    const steps = stepKeys(lesson);
    const ref = `${lesson.moduleId}/${lesson.id}`;
    const prev = neighbour(this.modules, ref, -1);
    const next = neighbour(this.modules, ref, 1);
    const module = this.modules.find((m) => m.id === lesson.moduleId);
    const title = (r: string | undefined) => {
      const [m, l] = (r ?? "").split("/");
      return this.modules.find((x) => x.id === m)?.lessons.find((x) => x.id === l)?.title ?? "";
    };
    const nonce = Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join("");
    const script = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "dist", "lesson.js"));
    const done = steps.filter((k) => checks[k]).length;

    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${STYLES}</style>
</head>
<body data-ref="${esc(ref)}">
<header>
  <p class="eyebrow">${esc(module ? `Module ${module.id.slice(0, 2)} · ${module.title}` : "")}</p>
  <h1>${esc(lesson.title)}</h1>
  <div class="bar">
    <div class="tabs" role="tablist">
      <button role="tab" data-tab="cours" aria-selected="true">Cours</button>
      <button role="tab" data-tab="pratique" aria-selected="false">Pratique${steps.length ? ` <span class="count" data-total="${steps.length}">${done}/${steps.length}</span>` : ""}</button>
    </div>
    <span class="spacer"></span>
    <button class="ghost" data-action="terminal" title="Ouvrir un terminal dans ton workspace">Terminal</button>
    <button class="primary" data-action="verify" title="Lancer cargo test sur ton projet">Vérifier</button>
  </div>
</header>
<main>
  <article class="doc" data-pane="cours">${cours}
    <p class="next-step"><button class="primary" data-tab-go="pratique">Passer à la pratique →</button></p>
  </article>
  <article class="doc" data-pane="pratique" hidden>${pratique}</article>
  <nav class="pager">
    ${prev ? `<button class="ghost" data-open="${esc(prev)}">← ${esc(title(prev))}</button>` : "<span></span>"}
    ${next ? `<button class="ghost" data-open="${esc(next)}">${esc(title(next))} →</button>` : "<span></span>"}
  </nav>
</main>
<script nonce="${nonce}" src="${script}"></script>
</body>
</html>`;
  }

  dispose() {
    this.panel?.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}

// Les couleurs viennent du thème de VS Code ; les schémas des leçons utilisent les mêmes
// variables que le dashboard du repo (--text, --muted, --accent…), redéfinies ici.
const STYLES = `
:root {
  --text: var(--vscode-editor-foreground);
  --muted: var(--vscode-descriptionForeground);
  --line: var(--vscode-widget-border, var(--vscode-panel-border, rgba(128,128,128,.35)));
  --panel: var(--vscode-sideBar-background, var(--vscode-editor-background));
  --code: var(--vscode-textCodeBlock-background, rgba(128,128,128,.12));
  --accent: #c2410c;
  --ok: var(--vscode-testing-iconPassed, #3f7a2f);
  --err: var(--vscode-errorForeground, #b91c1c);
  --warn: var(--vscode-editorWarning-foreground, #a16207);
  --accent-soft: color-mix(in srgb, var(--accent) 14%, transparent);
  --ok-soft: color-mix(in srgb, var(--ok) 16%, transparent);
  --err-soft: color-mix(in srgb, var(--err) 14%, transparent);
  --warn-soft: color-mix(in srgb, var(--warn) 16%, transparent);
}
body.vscode-dark, body.vscode-high-contrast { --accent: #f28c4f; }
body { margin: 0; padding: 0; color: var(--text); background: var(--vscode-editor-background); font-family: var(--vscode-font-family); font-size: 14px; line-height: 1.6; }
header { position: sticky; top: 0; z-index: 2; padding: 18px 28px 0; background: var(--vscode-editor-background); border-bottom: 1px solid var(--line); }
.eyebrow { margin: 0; color: var(--muted); font-size: 12px; }
h1 { margin: 2px 0 8px; font-size: 24px; font-weight: 650; letter-spacing: -0.01em; }
.bar { display: flex; align-items: center; gap: 8px; }
.spacer { flex: 1; }
.tabs { display: flex; gap: 2px; }
.tabs button { border: none; background: none; color: var(--muted); padding: 8px 10px; font: inherit; cursor: pointer; border-bottom: 2px solid transparent; }
.tabs button[aria-selected="true"] { color: var(--text); font-weight: 600; border-bottom-color: var(--accent); }
.count { font-size: 12px; font-weight: 400; color: var(--muted); margin-left: 2px; }
button.primary, button.ghost { font: inherit; font-size: 13px; padding: 4px 12px; border-radius: 4px; cursor: pointer; }
button.primary { border: none; background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
button.primary:hover { background: var(--vscode-button-hoverBackground); }
button.ghost { border: 1px solid var(--line); background: none; color: var(--text); }
button.ghost:hover { background: var(--vscode-toolbar-hoverBackground, var(--code)); }
button[data-state="running"] { opacity: .7; }
button[data-state="ok"] { background: var(--ok); }
button[data-state="fail"] { background: var(--err); }
main { max-width: 760px; padding: 4px 28px 40px; }
.doc h2 { font-size: 17px; margin: 28px 0 8px; }
.doc h3 { font-size: 15px; margin: 20px 0 6px; }
.doc p { margin: 10px 0; }
.doc code { font-family: var(--vscode-editor-font-family); font-size: .92em; background: var(--code); padding: 1px 5px; border-radius: 4px; }
.doc pre { background: var(--code); padding: 12px 14px; border-radius: 6px; overflow-x: auto; font-size: 12.5px; line-height: 1.5; }
.doc pre code { background: none; padding: 0; font-size: inherit; }
.doc table { border-collapse: collapse; width: 100%; font-size: 13px; }
.doc th, .doc td { border-bottom: 1px solid var(--line); padding: 6px 8px; text-align: left; }
.doc a { color: var(--vscode-textLink-foreground); }
.doc figure { margin: 18px 0; }
.doc figure svg { max-width: 100%; height: auto; }
.doc .callout { background: var(--accent-soft); border-radius: 6px; padding: 2px 14px; }
.doc details.answer { border: 1px dashed var(--line); border-radius: 6px; padding: 8px 14px; }
.doc details.answer summary { cursor: pointer; color: var(--accent); font-weight: 600; font-size: 13px; }
.doc ul.checks { list-style: none; padding: 0; }
.doc ul.checks li { margin: 6px 0; }
.doc ul.checks label { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; }
.doc ul.checks input { margin-top: 5px; accent-color: var(--accent); }
.doc ul.checks li.on span { color: var(--muted); text-decoration: line-through; }
.hl-k { color: var(--vscode-symbolIcon-keywordForeground, #b8430f); }
.hl-s { color: var(--vscode-debugTokenExpression-string, #3f7a2f); }
.hl-c { color: var(--muted); font-style: italic; }
.hl-n { color: var(--vscode-debugTokenExpression-number, #9a5b00); }
.hl-t { color: var(--vscode-symbolIcon-classForeground, #2a6f8f); }
.hl-m, .hl-a { color: var(--vscode-symbolIcon-functionForeground, #7c3aed); }
.hl-err { color: var(--err); font-weight: 600; }
.hl-ok { color: var(--ok); font-weight: 600; }
.hl-help { color: var(--ok); }
.hl-dim { color: var(--muted); }
.next-step { margin-top: 28px; }
.pager { display: flex; justify-content: space-between; gap: 12px; margin-top: 36px; padding-top: 16px; border-top: 1px solid var(--line); }
.muted { color: var(--muted); }
`;
