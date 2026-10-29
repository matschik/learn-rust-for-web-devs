// La progression du workspace ouvert, lue et écrite dans `.learn-rust/progress.json`.
// Si le fichier change sur le disque (l'apprenant, son IA, git), on le relit.

import * as vscode from "vscode";
import { empty, parse, PROGRESS_FILE, serialize, type Progress } from "./progress";

export class ProgressStore implements vscode.Disposable {
  private progress: Progress = empty();
  private lastWritten = "";
  private readonly changed = new vscode.EventEmitter<Progress>();
  readonly onDidChange = this.changed.event;
  private readonly disposables: vscode.Disposable[] = [this.changed];

  constructor(private readonly folder: vscode.WorkspaceFolder | undefined) {
    if (!folder) return;
    const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folder, PROGRESS_FILE));
    watcher.onDidChange(() => this.load());
    watcher.onDidCreate(() => this.load());
    watcher.onDidDelete(() => this.set(empty(), false));
    this.disposables.push(watcher);
  }

  get current(): Progress {
    return this.progress;
  }

  /** Sans dossier ouvert, la progression vit le temps de la session. */
  get persistent(): boolean {
    return Boolean(this.folder);
  }

  private get uri(): vscode.Uri | undefined {
    return this.folder && vscode.Uri.joinPath(this.folder.uri, PROGRESS_FILE);
  }

  async load(): Promise<void> {
    if (!this.uri) return;
    try {
      const text = new TextDecoder().decode(await vscode.workspace.fs.readFile(this.uri));
      // Notre propre écriture qui revient par le watcher : rien de neuf.
      if (text === this.lastWritten) return;
      this.set(parse(text), false);
    } catch {
      this.set(empty(), false);
    }
  }

  async update(change: (p: Progress) => Progress): Promise<void> {
    this.set(change(structuredClone(this.progress)), true);
  }

  private set(progress: Progress, write: boolean) {
    this.progress = progress;
    this.changed.fire(progress);
    if (write && this.uri) {
      this.lastWritten = serialize(progress);
      vscode.workspace.fs.writeFile(this.uri, new TextEncoder().encode(this.lastWritten)).then(undefined, (e) => {
        vscode.window.showErrorMessage(`Learn Rust : progression non enregistrée (${e})`);
      });
    }
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
