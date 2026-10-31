// « Vérifier » : lance `cargo test` sur le projet de l'apprenant, dans un vrai terminal de
// VS Code. Les erreurs de compilation arrivent déjà dans l'onglet Problèmes par rust-analyzer ;
// ici, on montre la vraie sortie de cargo et on dit si c'est vert.

import { existsSync } from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { cargoRootOf } from "./cargo";

export type VerifyResult = { project: string; success: boolean };

/** Le projet du fichier ouvert ; sinon on demande, parmi les projets du workspace. */
async function pickProject(folder: vscode.WorkspaceFolder): Promise<string | undefined> {
  const active = vscode.window.activeTextEditor?.document.uri;
  const root = active?.scheme === "file" ? cargoRootOf(active.fsPath, folder.uri.fsPath, existsSync) : undefined;
  if (root) return root;
  const manifests = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, "**/Cargo.toml"), "**/target/**", 50);
  const projects = manifests.map((m) => path.dirname(m.fsPath)).sort();
  if (projects.length <= 1) return projects[0];
  const picked = await vscode.window.showQuickPick(
    projects.map((p) => ({ label: path.relative(folder.uri.fsPath, p) || ".", project: p })),
    { placeHolder: "Quel projet vérifier ?" },
  );
  return picked?.project;
}

export async function verify(): Promise<VerifyResult | undefined> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    vscode.window.showWarningMessage("Ouvre d'abord le dossier où tu ranges tes projets Rust.");
    return undefined;
  }
  await vscode.workspace.saveAll(false);
  const project = await pickProject(folder);
  if (!project) {
    vscode.window.showInformationMessage("Aucun projet cargo ici. Crée-en un dans le terminal avec `cargo new`.");
    return undefined;
  }
  const name = path.relative(folder.uri.fsPath, project) || path.basename(project);
  const task = new vscode.Task(
    { type: "learn-rust", project: name },
    folder,
    `cargo test (${name})`,
    "Learn Rust",
    new vscode.ShellExecution("cargo test", { cwd: project }),
    [],
  );
  task.presentationOptions = { reveal: vscode.TaskRevealKind.Always, clear: true, focus: false, panel: vscode.TaskPanelKind.Dedicated };
  const execution = await vscode.tasks.executeTask(task);
  const exitCode = await new Promise<number | undefined>((resolve) => {
    const sub = vscode.tasks.onDidEndTaskProcess((e) => {
      if (e.execution !== execution) return;
      sub.dispose();
      resolve(e.exitCode);
    });
  });
  const success = exitCode === 0;
  if (success) vscode.window.showInformationMessage(`${name} : ça compile et les tests passent.`);
  else vscode.window.showWarningMessage(`${name} : ça ne passe pas encore. Lis la sortie de cargo dans le terminal, et l'onglet Problèmes.`);
  return { project: name, success };
}
