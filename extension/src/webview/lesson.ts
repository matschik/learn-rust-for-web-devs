// Le script du panneau de la leçon : onglets, cases à cocher, boutons. Tout le reste
// (lire le cours, enregistrer la progression, lancer cargo) se fait côté extension.

import type { FromPanel, ToPanel } from "../lessonPanel";

/** L'onglet ouvert, retenu pour la leçon affichée seulement. */
type State = { ref: string; tab: string };

declare function acquireVsCodeApi(): {
  postMessage(message: FromPanel): void;
  getState(): State | undefined;
  setState(state: State): void;
};

const vscode = acquireVsCodeApi();
const ref = document.body.dataset.ref ?? "";
const $$ = <T extends Element>(selector: string) => [...document.querySelectorAll<T>(selector)];

function showTab(tab: string) {
  for (const b of $$<HTMLButtonElement>("[data-tab]")) b.setAttribute("aria-selected", String(b.dataset.tab === tab));
  for (const pane of $$<HTMLElement>("[data-pane]")) pane.hidden = pane.dataset.pane !== tab;
  vscode.setState({ ref, tab });
  window.scrollTo(0, 0);
}

function updateCount() {
  const count = document.querySelector<HTMLElement>(".count");
  if (!count) return;
  const done = $$<HTMLInputElement>("ul.checks input:checked").length;
  count.textContent = `${done}/${count.dataset.total}`;
}

document.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>("button");
  if (!target) return;
  if (target.dataset.tab) showTab(target.dataset.tab);
  else if (target.dataset.tabGo) showTab(target.dataset.tabGo);
  else if (target.dataset.open) vscode.postMessage({ type: "open", ref: target.dataset.open });
  else if (target.dataset.action === "verify") vscode.postMessage({ type: "verify" });
  else if (target.dataset.action === "terminal") vscode.postMessage({ type: "terminal" });
});

document.addEventListener("change", (event) => {
  const input = event.target as HTMLInputElement;
  if (input.type !== "checkbox" || !input.dataset.key) return;
  input.closest("li")?.classList.toggle("on", input.checked);
  updateCount();
  vscode.postMessage({ type: "check", key: input.dataset.key, on: input.checked });
});

window.addEventListener("message", (event: MessageEvent<ToPanel>) => {
  const message = event.data;
  if (message.type === "checks") {
    for (const input of $$<HTMLInputElement>("ul.checks input")) {
      const on = Boolean(message.checks[input.dataset.key ?? ""]);
      input.checked = on;
      input.closest("li")?.classList.toggle("on", on);
    }
    updateCount();
  } else if (message.type === "verify") {
    const button = document.querySelector<HTMLButtonElement>('[data-action="verify"]');
    if (!button) return;
    button.dataset.state = message.state;
    button.textContent = { running: "cargo test…", ok: "Ça passe ✓", fail: "Pas encore", idle: "Vérifier" }[message.state];
  }
});

const saved = vscode.getState();
if (saved?.ref === ref && saved.tab !== "cours") showTab(saved.tab);
