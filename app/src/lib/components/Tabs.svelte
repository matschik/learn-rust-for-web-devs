<script lang="ts">
  import { fileIcon } from "$lib/icons";

  let { tabs, active, dirty, onSelect, onClose }: {
    tabs: string[];
    active: string | null;
    dirty: string[];
    onSelect: (path: string) => void;
    onClose: (path: string) => void;
  } = $props();

  const name = (path: string) => path.slice(path.lastIndexOf("/") + 1);
  /** Deux onglets du même nom (deux `main.rs`) : on ajoute leur dossier pour les distinguer. */
  const hint = (path: string) => {
    if (tabs.filter((t) => name(t) === name(path)).length < 2) return "";
    const parts = path.split("/");
    return parts.length > 1 ? parts[0] : "";
  };
</script>

<div class="tabs" role="tablist" aria-label="Fichiers ouverts">
  {#each tabs as path (path)}
    {@const icon = fileIcon(name(path))}
    {@const isDirty = dirty.includes(path)}
    <div class="tab" class:on={path === active} role="tab" aria-selected={path === active} title={path}>
      <button class="label" onclick={() => onSelect(path)} onauxclick={(e) => e.button === 1 && onClose(path)}>
        <span class="icon" style:color={icon.color} aria-hidden="true">{icon.glyph}</span>
        {name(path)}
        {#if hint(path)}<span class="hint">{hint(path)}</span>{/if}
      </button>
      <button class="close" class:dirty={isDirty} aria-label={isDirty ? `Fermer ${name(path)} (non enregistré)` : `Fermer ${name(path)}`} onclick={() => onClose(path)}>
        <span class="x" aria-hidden="true">×</span><span class="dot" aria-hidden="true">●</span>
      </button>
    </div>
  {/each}
</div>

<style>
  .tabs { display: flex; min-width: 0; overflow-x: auto; scrollbar-width: none; }
  .tab { display: flex; align-items: center; height: 100%; border-right: 1px solid var(--line); background: var(--panel-2); color: var(--muted); flex: none; }
  .tab.on { background: var(--editor); color: var(--text); box-shadow: inset 0 2px 0 var(--accent); }
  button { border: none; background: none; color: inherit; font: inherit; cursor: pointer; }
  .label { display: flex; align-items: center; gap: 6px; height: 100%; padding: 0 4px 0 12px; font-size: 13px; white-space: nowrap; }
  .icon { font: 600 10px var(--mono); }
  .hint { color: var(--muted); font-size: 11px; }
  .close { display: grid; place-items: center; width: 22px; height: 22px; margin-right: 6px; border-radius: 4px; font-size: 15px; }
  .close:hover { background: var(--panel); }
  .close .dot { display: none; font-size: 9px; }
  .close .x { visibility: hidden; }
  .tab.on .close .x, .tab:hover .close .x { visibility: visible; }
  .close.dirty .dot { display: block; }
  .close.dirty .x { display: none; }
  .close.dirty:hover .dot { display: none; }
  .close.dirty:hover .x { display: block; visibility: visible; }
</style>
