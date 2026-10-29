<script lang="ts" module>
  /** Une saisie en cours dans l'arbre : nouveau fichier, nouveau dossier, ou renommage. */
  export type Editing = { mode: "new-file" | "new-dir"; parent: string } | { mode: "rename"; target: string };
</script>

<script lang="ts">
  import type { Api, Entry } from "$lib/api";
  import { fileIcon } from "$lib/icons";
  import FileTree from "./FileTree.svelte";

  let { api, workspace, path = "", depth = 0, selected, expanded, refresh = 0, editing, onOpen, onToggle, onContext, onCommit, onCancel }: {
    api: Api;
    workspace: string;
    path?: string;
    depth?: number;
    selected: string | null;
    /** Les dossiers dépliés, partagés par tout l'arbre. */
    expanded: Record<string, boolean>;
    refresh?: number;
    editing: Editing | null;
    onOpen: (path: string) => void;
    onToggle: (path: string) => void;
    onContext: (event: MouseEvent, entry: Entry) => void;
    onCommit: (name: string) => void;
    onCancel: () => void;
  } = $props();

  let entries = $state<Entry[]>([]);

  $effect(() => {
    void refresh;
    api.listDir(workspace, path).then((e) => (entries = e)).catch(() => (entries = []));
  });

  const creating = $derived(editing && editing.mode !== "rename" && editing.parent === path ? editing.mode : null);
  const indent = (d: number) => `${10 + d * 14}px`;

  /** Entrée valide, Échap ou clic ailleurs sans nom annule, comme dans VS Code. */
  function keydown(event: KeyboardEvent) {
    const input = event.currentTarget as HTMLInputElement;
    if (event.key === "Enter") {
      event.preventDefault();
      input.value.trim() ? onCommit(input.value.trim()) : onCancel();
    } else if (event.key === "Escape") {
      onCancel();
    }
  }

  function blur(event: FocusEvent) {
    const value = (event.currentTarget as HTMLInputElement).value.trim();
    value ? onCommit(value) : onCancel();
  }

  function autofocus(node: HTMLInputElement) {
    node.focus();
    // Au renommage, on sélectionne le nom sans l'extension.
    const dot = node.value.lastIndexOf(".");
    node.setSelectionRange(0, dot > 0 ? dot : node.value.length);
  }
</script>

<ul role={depth === 0 ? "tree" : "group"} aria-label={depth === 0 ? "Fichiers du workspace" : undefined}>
  {#if creating}
    <li class="row-input" style:padding-left={indent(depth)}>
      <span class="chev" aria-hidden="true">{creating === "new-dir" ? "▸" : ""}</span>
      <input
        use:autofocus
        aria-label={creating === "new-dir" ? "Nom du nouveau dossier" : "Nom du nouveau fichier"}
        placeholder={creating === "new-dir" ? "nom-du-dossier" : "fichier.rs"}
        onkeydown={keydown}
        onblur={blur}
      />
    </li>
  {/if}
  {#each entries as entry (entry.path)}
    <li role="treeitem" aria-selected={entry.path === selected} aria-expanded={entry.is_dir ? Boolean(expanded[entry.path]) : undefined}>
      {#if editing?.mode === "rename" && editing.target === entry.path}
        <div class="row-input" style:padding-left={indent(depth)}>
          <span class="chev" aria-hidden="true"></span>
          <input use:autofocus value={entry.name} aria-label="Nouveau nom" onkeydown={keydown} onblur={blur} />
        </div>
      {:else}
        <button
          style:padding-left={indent(depth)}
          class:selected={entry.path === selected}
          onclick={() => (entry.is_dir ? onToggle(entry.path) : onOpen(entry.path))}
          oncontextmenu={(e) => onContext(e, entry)}
        >
          <span class="chev" aria-hidden="true">{entry.is_dir ? (expanded[entry.path] ? "▾" : "▸") : ""}</span>
          {#if !entry.is_dir}
            {@const icon = fileIcon(entry.name)}
            <span class="icon" style:color={icon.color} aria-hidden="true">{icon.glyph}</span>
          {/if}
          <span class="name">{entry.name}</span>
        </button>
      {/if}
      {#if entry.is_dir && (expanded[entry.path] || (editing?.mode !== "rename" && editing?.parent === entry.path))}
        <FileTree {api} {workspace} path={entry.path} depth={depth + 1} {selected} {expanded} {refresh} {editing} {onOpen} {onToggle} {onContext} {onCommit} {onCancel} />
      {/if}
    </li>
  {/each}
</ul>

<style>
  ul { list-style: none; margin: 0; padding: 0; }
  button, .row-input { display: flex; align-items: center; gap: 4px; width: 100%; border: none; background: none; text-align: left; padding: 2px 10px; font-size: 13px; line-height: 20px; cursor: pointer; white-space: nowrap; color: inherit; }
  button:hover { background: var(--panel); }
  button.selected { background: var(--accent-soft); color: var(--accent-strong); font-weight: 500; }
  .chev { width: 12px; flex: none; color: var(--muted); font-size: 11px; }
  .icon { width: 16px; flex: none; font: 600 10px/1 var(--mono); text-align: center; }
  .name { overflow: hidden; text-overflow: ellipsis; }
  .row-input input { flex: 1; min-width: 0; font: inherit; font-size: 13px; padding: 1px 4px; border: 1px solid var(--accent); border-radius: 3px; background: var(--bg); color: var(--text); outline: none; }
</style>
