// Le sommaire dans la barre latérale : les modules et leurs leçons, avec l'avancement.

import * as vscode from "vscode";
import { readLesson, stepKeys, type Module } from "./course";
import type { ProgressStore } from "./store";

type Node = { kind: "module"; module: Module } | { kind: "lesson"; module: Module; id: string; title: string };

export class LessonsTree implements vscode.TreeDataProvider<Node> {
  private readonly changed = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.changed.event;

  constructor(
    private readonly root: string,
    private readonly modules: Module[],
    private readonly store: ProgressStore,
  ) {
    store.onDidChange(() => this.changed.fire());
  }

  getChildren(node?: Node): Node[] {
    if (!node) return this.modules.map((module) => ({ kind: "module", module }));
    if (node.kind === "module") return node.module.lessons.map((l) => ({ kind: "lesson", module: node.module, id: l.id, title: l.title }));
    return [];
  }

  getTreeItem(node: Node): vscode.TreeItem {
    const { lesson: current, checks } = this.store.current;
    if (node.kind === "module") {
      const number = node.module.id.slice(0, 2);
      const item = new vscode.TreeItem(`${number} · ${node.module.title}`, vscode.TreeItemCollapsibleState.Expanded);
      const inside = current?.startsWith(`${node.module.id}/`);
      item.collapsibleState = inside || !current ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed;
      return item;
    }
    const ref = `${node.module.id}/${node.id}`;
    const lesson = readLesson(this.root, node.module.id, node.id);
    const steps = lesson ? stepKeys(lesson) : [];
    const done = steps.filter((k) => checks[k]).length;
    const item = new vscode.TreeItem(`${node.id.slice(0, 2)} · ${node.title}`);
    item.id = ref;
    item.description = steps.length ? `${done}/${steps.length}` : undefined;
    item.iconPath =
      steps.length && done === steps.length
        ? new vscode.ThemeIcon("pass-filled", new vscode.ThemeColor("testing.iconPassed"))
        : ref === current
          ? new vscode.ThemeIcon("circle-filled", new vscode.ThemeColor("charts.orange"))
          : new vscode.ThemeIcon("circle-outline");
    item.command = { command: "learnRust.openLesson", title: "Ouvrir la leçon", arguments: [ref] };
    item.tooltip = ref === current ? `${node.title} (en cours)` : node.title;
    return item;
  }
}
