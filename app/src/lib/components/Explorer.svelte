<script lang="ts">
  import type { Api, Entry } from "$lib/api";
  import { load, save } from "$lib/storage";
  import ContextMenu, { type MenuItem } from "./ContextMenu.svelte";
  import FileTree, { type Editing } from "./FileTree.svelte";

  let { api, workspace, selected, refresh, onOpen, onRenamed, onDeleted, onError }: {
    api: Api;
    workspace: string;
    selected: string | null;
    /** Augmente à chaque changement sur le disque : l'arbre se relit. */
    refresh: number;
    onOpen: (path: string) => void;
    onRenamed: (from: string, to: string) => void;
    onDeleted: (path: string) => void;
    onError: (message: string) => void;
  } = $props();

  let expanded = $state<Record<string, boolean>>(load("expanded", {}));
  let editing = $state<Editing | null>(null);
  let menu = $state<{ x: number; y: number; items: MenuItem[] } | null>(null);
  let bump = $state(0);

  const name = $derived(workspace.split(/[\\/]/).filter(Boolean).pop() ?? workspace);
  const dirname = (path: string) => (path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "");
  const join = (parent: string, child: string) => (parent ? `${parent}/${child}` : child);

  function setExpanded(path: string, open: boolean) {
    expanded = { ...expanded, [path]: open };
    save("expanded", expanded);
  }

  // Le fichier ouvert reste visible : on déplie ses dossiers parents.
  $effect(() => {
    if (!selected) return;
    const parts = selected.split("/").slice(0, -1);
    const missing = parts.map((_, i) => parts.slice(0, i + 1).join("/")).filter((p) => !expanded[p]);
    if (missing.length) {
      expanded = { ...expanded, ...Object.fromEntries(missing.map((p) => [p, true])) };
      save("expanded", expanded);
    }
  });

  /** Le dossier où créer : celui sélectionné dans le menu, ou celui du fichier ouvert. */
  function startCreate(mode: "new-file" | "new-dir", parent = selected ? dirname(selected) : "") {
    if (parent) setExpanded(parent, true);
    editing = { mode, parent };
  }

  async function commit(input: string) {
    const current = editing;
    editing = null;
    if (!current) return;
    try {
      if (current.mode === "rename") {
        const to = join(dirname(current.target), input);
        if (to === current.target) return;
        await api.renamePath(workspace, current.target, to);
        onRenamed(current.target, to);
      } else {
        const path = join(current.parent, input);
        if (current.mode === "new-dir") {
          await api.createDir(workspace, path);
          setExpanded(path, true);
        } else {
          await api.createFile(workspace, path);
          onOpen(path);
        }
      }
    } catch (e) {
      onError((e as Error).message);
    } finally {
      bump++;
    }
  }

  async function remove(entry: Entry) {
    const what = entry.is_dir ? `le dossier « ${entry.name} » et tout son contenu` : `« ${entry.name} »`;
    if (!(await api.ask(`Mettre ${what} à la corbeille ?`))) return;
    try {
      await api.deletePath(workspace, entry.path);
      onDeleted(entry.path);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      bump++;
    }
  }

  function openMenu(event: MouseEvent, entry: Entry | null) {
    event.preventDefault();
    event.stopPropagation();
    const parent = entry ? (entry.is_dir ? entry.path : dirname(entry.path)) : "";
    const items: MenuItem[] = [
      { label: "Nouveau fichier…", action: () => startCreate("new-file", parent) },
      { label: "Nouveau dossier…", action: () => startCreate("new-dir", parent) },
    ];
    if (entry) {
      items.push(
        "separator",
        { label: "Copier le chemin relatif", action: () => navigator.clipboard?.writeText(entry.path) },
        "separator",
        { label: "Renommer…", action: () => (editing = { mode: "rename", target: entry.path }) },
        { label: "Supprimer", danger: true, action: () => remove(entry) },
      );
    }
    menu = { x: event.clientX, y: event.clientY, items };
  }

  function collapseAll() {
    expanded = {};
    save("expanded", expanded);
  }
</script>

<div class="explorer">
  <header>
    <span class="title" title={workspace}>{name}</span>
    <button title="Nouveau fichier" aria-label="Nouveau fichier" onclick={() => startCreate("new-file")}>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9.5 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5zM9.5 1.5V5H13M8 7.5v5M5.5 10h5" /></svg>
    </button>
    <button title="Nouveau dossier" aria-label="Nouveau dossier" onclick={() => startCreate("new-dir")}>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 4a1 1 0 0 1 1-1h3.6l1.4 1.5h6a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM8 7v4M6 9h4" /></svg>
    </button>
    <button title="Actualiser" aria-label="Actualiser" onclick={() => bump++}>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 8A5.5 5.5 0 1 1 11.9 4.1M13.5 2v3h-3" /></svg>
    </button>
    <button title="Tout replier" aria-label="Tout replier" onclick={collapseAll}>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5l4-3 4 3M4 12.5l4-3 4 3" /></svg>
    </button>
  </header>
  <div class="body" role="presentation" oncontextmenu={(e) => openMenu(e, null)}>
    <FileTree
      {api}
      {workspace}
      {selected}
      {expanded}
      {editing}
      refresh={refresh + bump}
      {onOpen}
      onToggle={(p) => setExpanded(p, !expanded[p])}
      onContext={openMenu}
      onCommit={commit}
      onCancel={() => (editing = null)}
    />
  </div>
</div>

{#if menu}<ContextMenu {...menu} onClose={() => (menu = null)} />{/if}

<style>
  .explorer { height: 100%; display: flex; flex-direction: column; }
  header { display: flex; align-items: center; gap: 2px; height: 32px; padding: 0 6px 0 14px; flex: none; }
  .title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
  header button { display: grid; place-items: center; width: 24px; height: 24px; padding: 0; border: none; border-radius: 4px; background: none; color: var(--muted); cursor: pointer; opacity: 0; transition: opacity 0.1s; }
  .explorer:hover header button, header button:focus-visible { opacity: 1; }
  header button:hover { background: var(--panel); color: var(--text); }
  svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
  .body { flex: 1; overflow: auto; padding-bottom: 24px; }
</style>
