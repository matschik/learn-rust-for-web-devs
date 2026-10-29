<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  // Seulement l'éditeur et les langages utiles, pas tout Monaco : l'app reste légère.
  import * as monaco from "monaco-editor/editor/editor.api";
  import "monaco-editor/languages/definitions/rust/register";
  import "monaco-editor/languages/definitions/markdown/register";
  import "monaco-editor/languages/definitions/ini/register";
  import EditorWorker from "monaco-editor/editor/editor.worker?worker";
  import type { Diagnostic } from "$lib/diagnostics";

  // Un modèle Monaco par fichier ouvert, comme les onglets de VS Code : chacun garde son
  // historique d'annulation et sait s'il diffère de ce qui est sur le disque.
  let { active, diagnostics = [], onSave, onDirty }: {
    /** Le fichier affiché ; il doit avoir été ouvert avec `open`. */
    active: string | null;
    /** Les erreurs de cargo, avec des chemins relatifs au workspace. */
    diagnostics?: Diagnostic[];
    onSave: (path: string, content: string) => void;
    /** Appelé à chaque changement de la liste des fichiers non enregistrés. */
    onDirty: (dirty: string[]) => void;
  } = $props();

  let host: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor | undefined;
  const models = new Map<string, { model: monaco.editor.ITextModel; savedVersion: number; view?: monaco.editor.ICodeEditorViewState | null }>();

  const isDirty = (path: string) => {
    const entry = models.get(path);
    return entry ? entry.model.getAlternativeVersionId() !== entry.savedVersion : false;
  };
  const reportDirty = () => onDirty([...models.keys()].filter(isDirty));

  self.MonacoEnvironment = { getWorker: () => new EditorWorker() };

  // Les couleurs du site, pour que l'éditeur ait l'air de faire partie de la leçon.
  monaco.editor.defineTheme("learn-rust-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "b8430f" },
      { token: "string", foreground: "3f7a2f" },
      { token: "comment", foreground: "8a8073", fontStyle: "italic" },
      { token: "number", foreground: "9a5b00" },
      { token: "type", foreground: "2a6f8f" },
    ],
    colors: { "editor.background": "#fffdf9", "editorLineNumber.foreground": "#b5ada1", "editor.lineHighlightBackground": "#f7f2ea" },
  });
  monaco.editor.defineTheme("learn-rust-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "f59a62" },
      { token: "string", foreground: "9ad3a8" },
      { token: "comment", foreground: "8b8173", fontStyle: "italic" },
      { token: "number", foreground: "f2c46d" },
      { token: "type", foreground: "7cc4e0" },
    ],
    colors: { "editor.background": "#181715" },
  });

  function language(file: string): string {
    if (file.endsWith(".rs")) return "rust";
    if (file.endsWith(".md")) return "markdown";
    if (file.endsWith(".toml")) return "ini";
    return "plaintext";
  }

  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  const theme = () => (dark.matches ? "learn-rust-dark" : "learn-rust-light");
  const onScheme = () => monaco.editor.setTheme(theme());

  onMount(() => {
    editor = monaco.editor.create(host, {
      model: null,
      theme: theme(),
      automaticLayout: true,
      fontFamily: "JetBrains Mono, SF Mono, Menlo, monospace",
      fontSize: 13.5,
      lineHeight: 22,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      tabSize: 4,
      renderLineHighlight: "line",
      padding: { top: 12 },
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => save());
    dark.addEventListener("change", onScheme);
    show(active);
  });

  onDestroy(() => {
    dark.removeEventListener("change", onScheme);
    editor?.dispose();
    for (const { model } of models.values()) model.dispose();
  });

  /** Ouvre `path` avec le contenu lu sur le disque ; ne fait rien s'il est déjà ouvert. */
  export function open(path: string, text: string) {
    if (models.has(path)) return;
    const model = monaco.editor.createModel(text, language(path), monaco.Uri.file(`/${path}`));
    models.set(path, { model, savedVersion: model.getAlternativeVersionId() });
    model.onDidChangeContent(reportDirty);
    applyMarkers();
    if (path === active) show(path);
  }

  export function isOpen(path: string) {
    return models.has(path);
  }

  export function dirty(path: string) {
    return isDirty(path);
  }

  /** Le fichier a changé sur le disque : on suit, sauf s'il a des modifications non enregistrées. */
  export function reload(path: string, text: string) {
    const entry = models.get(path);
    if (!entry || isDirty(path) || entry.model.getValue() === text) return;
    entry.model.pushEditOperations([], [{ range: entry.model.getFullModelRange(), text }], () => null);
    entry.savedVersion = entry.model.getAlternativeVersionId();
    reportDirty();
  }

  /** Le fichier a été renommé : on garde son contenu, même non enregistré. */
  export function rename(from: string, to: string) {
    const entry = models.get(from);
    if (!entry || models.has(to)) return;
    const wasDirty = isDirty(from);
    const model = monaco.editor.createModel(entry.model.getValue(), language(to), monaco.Uri.file(`/${to}`));
    models.set(to, { model, savedVersion: wasDirty ? -1 : model.getAlternativeVersionId() });
    model.onDidChangeContent(reportDirty);
    if (shown === from) shown = null;
    entry.model.dispose();
    models.delete(from);
    reportDirty();
    if (to === active) show(to);
  }

  export function close(path: string) {
    if (shown === path) {
      editor?.setModel(null);
      shown = null;
    }
    models.get(path)?.model.dispose();
    models.delete(path);
    reportDirty();
  }

  export function save(path = active) {
    const entry = path ? models.get(path) : undefined;
    if (!path || !entry) return;
    entry.savedVersion = entry.model.getAlternativeVersionId();
    onSave(path, entry.model.getValue());
    reportDirty();
  }

  export function saveAll() {
    for (const path of models.keys()) if (isDirty(path)) save(path);
  }

  export function focus() {
    editor?.focus();
  }

  let shown: string | null = null;
  function show(path: string | null) {
    if (!editor) return;
    if (shown && models.has(shown)) models.get(shown)!.view = editor.saveViewState();
    const entry = path ? models.get(path) : undefined;
    editor.setModel(entry?.model ?? null);
    if (entry?.view) editor.restoreViewState(entry.view);
    shown = entry ? path : null;
  }

  $effect(() => {
    show(active);
  });

  /** Souligne les erreurs de cargo dans chaque fichier ouvert. */
  function applyMarkers() {
    for (const [path, { model }] of models) {
      monaco.editor.setModelMarkers(
        model,
        "cargo",
        diagnostics
          .filter((d) => d.file === path)
          .map((d) => ({
            severity: d.severity === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
            message: d.code ? `${d.code} : ${d.message}` : d.message,
            startLineNumber: d.line,
            startColumn: d.column,
            endLineNumber: d.line,
            endColumn: model.getLineMaxColumn(Math.min(d.line, model.getLineCount())),
          })),
      );
    }
  }

  $effect(() => {
    void diagnostics;
    applyMarkers();
  });
</script>

<div class="editor" bind:this={host}></div>

<style>
  .editor { position: absolute; inset: 0; }
</style>
