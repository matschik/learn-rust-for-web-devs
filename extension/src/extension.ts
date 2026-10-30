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

  // Au démarrage d'un workspace d'apprentissage, on remet tout en place : la leçon à droite
  // (là où VS Code l'avait laissée, sinon dans la 2e colonne), le sommaire et un terminal.
  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer(LessonPanel.viewType, {
      async deserializeWebviewPanel(webviewPanel, state: { ref?: string } | undefined) {
        panel.restore(webviewPanel, state?.ref);
      },
    }),
  );
  const isLearningWorkspace = Boolean(store.current.lesson);
  const openOnStartup = vscode.workspace.getConfiguration("learnRust").get("openOnStartup", true);
  if (isLearningWorkspace && openOnStartup) {
    // Laisse à VS Code le temps de restaurer le panneau de la dernière séance.
    setTimeout(async () => {
      // Le code à gauche : le fichier du projet modifié en dernier, si aucun n'est ouvert.
      if (!vscode.window.visibleTextEditors.length && folder) {
        const recent = await latestSource(folder);
        if (recent) await vscode.window.showTextDocument(recent, { viewColumn: vscode.ViewColumn.One, preview: false });
      }
      if (!panel.isOpen && store.current.lesson) panel.show(store.current.lesson, { focus: false });
      vscode.commands.executeCommand("workbench.view.extension.learnRust");
      if (!vscode.window.terminals.length) terminal();
    }, 1500);
  }

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

/** Le `main.rs` ou `lib.rs` modifié en dernier dans les projets du workspace. */
async function latestSource(folder: vscode.WorkspaceFolder): Promise<vscode.Uri | undefined> {
  const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, "*/src/{main,lib}.rs"), "**/target/**", 50);
  const dated = await Promise.all(files.map(async (uri) => ({ uri, mtime: (await vscode.workspace.fs.stat(uri)).mtime })));
  return dated.sort((a, b) => b.mtime - a.mtime)[0]?.uri;
}

export function deactivate() {}
