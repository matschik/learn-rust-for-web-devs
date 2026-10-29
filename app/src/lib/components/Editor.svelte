<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  // Seulement l'éditeur et les langages utiles, pas tout Monaco : l'app reste légère.
  import * as monaco from "monaco-editor/editor/editor.api";
  import "monaco-editor/languages/definitions/rust/register";
  import "monaco-editor/languages/definitions/markdown/register";
  import "monaco-editor/languages/definitions/ini/register";
  import EditorWorker from "monaco-editor/editor/editor.worker?worker";
  import type { Diagnostic } from "$lib/diagnostics";

  let { path, value, diagnostics = [], onSave, onDirty }: {
    path: string;
    value: string;
    /** Les erreurs de cargo pour ce fichier, soulignées dans le code. */
    diagnostics?: Diagnostic[];
    onSave: (content: string) => void;
    onDirty: (dirty: boolean) => void;
  } = $props();

  let host: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor | undefined;
  let saved = "";

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
      value,
      language: language(path),
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
    saved = value;
    editor.onDidChangeModelContent(() => onDirty(editor?.getValue() !== saved));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, save);
    dark.addEventListener("change", onScheme);
  });

  onDestroy(() => {
    dark.removeEventListener("change", onScheme);
    editor?.dispose();
  });

  export function save() {
    if (!editor) return;
    saved = editor.getValue();
    onSave(saved);
    onDirty(false);
  }

  // Un autre fichier ouvert : on remplace le modèle.
  $effect(() => {
    const model = editor?.getModel();
    if (!editor || !model) return;
    if (model.getValue() !== value) {
      model.setValue(value);
      saved = value;
      onDirty(false);
    }
    monaco.editor.setModelLanguage(model, language(path));
  });

  $effect(() => {
    const model = editor?.getModel();
    if (!model) return;
    monaco.editor.setModelMarkers(
      model,
      "cargo",
      diagnostics.map((d) => ({
        severity: d.severity === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
        message: d.code ? `${d.code} : ${d.message}` : d.message,
        startLineNumber: d.line,
        startColumn: d.column,
        endLineNumber: d.line,
        endColumn: model.getLineMaxColumn(Math.min(d.line, model.getLineCount())),
      })),
    );
  });
</script>

<div class="editor" bind:this={host}></div>

<style>
  .editor { position: absolute; inset: 0; }
</style>
