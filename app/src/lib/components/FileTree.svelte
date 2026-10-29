<script lang="ts">
  import type { Api, Entry } from "$lib/api";
  import FileTree from "./FileTree.svelte";

  let { api, workspace, path = "", depth = 0, selected, onOpen, refresh = 0 }: {
    api: Api;
    workspace: string;
    path?: string;
    depth?: number;
    selected: string | null;
    onOpen: (path: string) => void;
    refresh?: number;
  } = $props();

  let entries = $state<Entry[]>([]);
  let open = $state<Record<string, boolean>>({});

  $effect(() => {
    void refresh;
    api.listDir(workspace, path).then((e) => (entries = e)).catch(() => (entries = []));
  });
</script>

<ul role={depth === 0 ? "tree" : "group"} aria-label={depth === 0 ? "Fichiers du workspace" : undefined}>
  {#each entries as entry (entry.path)}
    <li role="treeitem" aria-selected={entry.path === selected} aria-expanded={entry.is_dir ? Boolean(open[entry.path]) : undefined}>
      <button
        style:padding-left="{12 + depth * 14}px"
        class:selected={entry.path === selected}
        onclick={() => (entry.is_dir ? (open[entry.path] = !open[entry.path]) : onOpen(entry.path))}
      >
        <span class="chev" aria-hidden="true">{entry.is_dir ? (open[entry.path] ? "▾" : "▸") : ""}</span>{entry.name}
      </button>
      {#if entry.is_dir && open[entry.path]}
        <FileTree {api} {workspace} path={entry.path} depth={depth + 1} {selected} {onOpen} {refresh} />
      {/if}
    </li>
  {/each}
</ul>

<style>
  ul { list-style: none; margin: 0; padding: 0; }
  button { display: flex; gap: 4px; width: 100%; border: none; background: none; text-align: left; padding: 3px 12px; font-size: 13px; cursor: pointer; white-space: nowrap; }
  button:hover { background: var(--panel); }
  button.selected { background: var(--accent-soft); color: var(--accent-strong); font-weight: 500; }
  .chev { width: 12px; color: var(--muted); }
</style>
