// Point d'entrée de l'extension : le sommaire, le panneau de la leçon, « Vérifier », et la
// barre d'état qui ramène à la leçon en cours.

import * as vscode from "vscode";
import { listModules } from "./course";
import { LessonPanel } from "./lessonPanel";
import { ProgressStore } from "./store";
import { LessonsTree } from "./tree";
import { verify } from "./verify";

export async function activate(context: vscode.ExtensionContext) {
  // En développement (F5 depuis le repo), on lit les leçons de ../modules directement :
  // une fiche modifiée s'affiche en rouvrant la leçon, sans rebuild.
  const courseRoot =
    context.extensionMode === vscode.ExtensionMode.Development
      ? vscode.Uri.joinPath(context.extensionUri, "..", "modules").fsPath
      : vscode.Uri.joinPath(context.extensionUri, "course").fsPath;
  const modules = listModules(courseRoot);
  const first = modules[0] && modules[0].lessons[0] ? `${modules[0].id}/${modules[0].lessons[0].id}` : undefined;
  const folder = vscode.workspace.workspaceFolders?.[0];

  const store = new ProgressStore(folder);
  await store.load();

  const terminal = () => {
    const existing = vscode.window.terminals.find((t) => t.name === "Learn Rust");
    (existing ?? vscode.window.createTerminal({ name: "Learn Rust", cwd: folder?.uri })).show();
  };

  let panel: LessonPanel;
  const runVerify = async () => {
    panel.post({ type: "verify", state: "running" });
    const result = await verify();
    panel.post({ type: "verify", state: result ? (result.success ? "ok" : "fail") : "idle" });
  };
  panel = new LessonPanel(context.extensionUri, courseRoot, modules, store, { verify: runVerify, terminal });

  const tree = new LessonsTree(courseRoot, modules, store);

  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
  status.command = "learnRust.continue";
  const refreshStatus = () => {
    const ref = store.current.lesson;
    const [m, l] = (ref ?? "").split("/");
    const title = modules.find((x) => x.id === m)?.lessons.find((x) => x.id === l)?.title;
    status.text = `$(mortar-board) ${title ? `Rust : ${title}` : "Apprendre Rust"}`;
    status.tooltip = title ? "Reprendre la leçon" : "Commencer le parcours Learn Rust";
    status.show();
  };
  refreshStatus();

  context.subscriptions.push(
    store,
    panel,
    status,
    store.onDidChange(refreshStatus),
    vscode.window.registerTreeDataProvider("learnRust.lessons", tree),
    vscode.commands.registerCommand("learnRust.openLesson", (ref: string) => panel.show(ref)),
    vscode.commands.registerCommand("learnRust.continue", () => {
      const ref = store.current.lesson ?? first;
      if (ref) panel.show(ref);
    }),
    vscode.commands.registerCommand("learnRust.verify", runVerify),
  );
}

export function deactivate() {}
