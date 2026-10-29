<script lang="ts">
  import { fuzzyFilter } from "$lib/fuzzy";
  import { fileIcon } from "$lib/icons";

  let { files, onPick, onClose }: { files: string[]; onPick: (path: string) => void; onClose: () => void } = $props();

  let query = $state("");
  let index = $state(0);
  const results = $derived(fuzzyFilter(query, files));

  $effect(() => {
    void query;
    index = 0;
  });

  function keydown(event: KeyboardEvent) {
    if (event.key === "Escape") onClose();
    else if (event.key === "ArrowDown") index = Math.min(index + 1, results.length - 1);
    else if (event.key === "ArrowUp") index = Math.max(index - 1, 0);
    else if (event.key === "Enter" && results[index]) pick(results[index]);
    else return;
    event.preventDefault();
  }

  function pick(path: string) {
    onClose();
    onPick(path);
  }

  // Monaco ou xterm gardent le focus tant qu'on ne le prend pas explicitement.
  function focus(node: HTMLInputElement) {
    requestAnimationFrame(() => node.focus());
  }

  const split = (path: string) => {
    const i = path.lastIndexOf("/");
    return i < 0 ? { name: path, dir: "" } : { name: path.slice(i + 1), dir: path.slice(0, i) };
  };
</script>

<div class="backdrop" role="presentation" onpointerdown={onClose}></div>
<div class="palette" role="dialog" aria-label="Ouvrir un fichier">
  <input bind:value={query} use:focus onkeydown={keydown} placeholder="Chercher un fichier par son nom" aria-label="Nom du fichier" />
  <ul role="listbox">
    {#each results as path, i (path)}
      {@const { name, dir } = split(path)}
      {@const icon = fileIcon(name)}
      <li role="option" aria-selected={i === index}>
        <button class:on={i === index} onpointerenter={() => (index = i)} onclick={() => pick(path)}>
          <span class="icon" style:color={icon.color} aria-hidden="true">{icon.glyph}</span>
          <span class="name">{name}</span>
          <span class="dir">{dir}</span>
        </button>
      </li>
    {:else}
      <li class="none">Aucun fichier ne correspond.</li>
    {/each}
  </ul>
</div>

<style>
  .backdrop { position: fixed; inset: 0; z-index: 50; background: rgb(0 0 0 / 0.12); }
  .palette { position: fixed; z-index: 51; top: 56px; left: 50%; transform: translateX(-50%); width: min(600px, calc(100vw - 32px)); border: 1px solid var(--line); border-radius: 10px; background: var(--bg); box-shadow: 0 16px 48px rgb(0 0 0 / 0.25); overflow: hidden; }
  input { width: 100%; box-sizing: border-box; padding: 12px 14px; border: none; border-bottom: 1px solid var(--line); background: none; color: var(--text); font: inherit; font-size: 14px; outline: none; }
  ul { list-style: none; margin: 0; padding: 4px; max-height: 360px; overflow: auto; }
  button { display: flex; align-items: baseline; gap: 8px; width: 100%; padding: 6px 10px; border: none; border-radius: 6px; background: none; color: var(--text); font: inherit; font-size: 13px; text-align: left; cursor: pointer; }
  button.on { background: var(--accent-soft); }
  .icon { width: 16px; font: 600 10px var(--mono); text-align: center; }
  .dir { color: var(--muted); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .none { padding: 10px; color: var(--muted); font-size: 13px; }
</style>
