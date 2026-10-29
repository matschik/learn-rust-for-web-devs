<script lang="ts" module>
  export type MenuItem = { label: string; shortcut?: string; danger?: boolean; action: () => void } | "separator";
</script>

<script lang="ts">
  let { x, y, items, onClose }: { x: number; y: number; items: MenuItem[]; onClose: () => void } = $props();

  let menu: HTMLDivElement;

  // Le menu reste dans la fenêtre même ouvert près d'un bord.
  const left = $derived(Math.min(x, window.innerWidth - 220));
  const top = $derived(Math.min(y, window.innerHeight - items.length * 30 - 12));

  $effect(() => {
    menu.querySelector("button")?.focus();
  });

  function keydown(event: KeyboardEvent) {
    if (event.key === "Escape") onClose();
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const buttons = [...menu.querySelectorAll("button")];
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "ArrowDown" ? (i + 1) % buttons.length : (i - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }
</script>

<svelte:window onkeydown={keydown} onblur={onClose} />

<div class="backdrop" role="presentation" onpointerdown={onClose} oncontextmenu={(e) => (e.preventDefault(), onClose())}></div>
<div class="menu" role="menu" bind:this={menu} style:left="{left}px" style:top="{top}px">
  {#each items as item, i (i)}
    {#if item === "separator"}
      <hr />
    {:else}
      <button role="menuitem" class:danger={item.danger} onclick={() => (onClose(), item.action())}>
        <span>{item.label}</span>
        {#if item.shortcut}<kbd>{item.shortcut}</kbd>{/if}
      </button>
    {/if}
  {/each}
</div>

<style>
  .backdrop { position: fixed; inset: 0; z-index: 40; }
  .menu { position: fixed; z-index: 41; min-width: 200px; padding: 4px; border: 1px solid var(--line); border-radius: 8px; background: var(--bg); box-shadow: 0 8px 28px rgb(0 0 0 / 0.18); }
  button { display: flex; justify-content: space-between; gap: 16px; width: 100%; padding: 5px 10px; border: none; border-radius: 4px; background: none; color: var(--text); font: inherit; font-size: 13px; text-align: left; cursor: pointer; }
  button:hover, button:focus-visible { background: var(--accent); color: var(--on-accent); outline: none; }
  button.danger { color: var(--err); }
  button.danger:hover, button.danger:focus-visible { background: var(--err); color: var(--on-accent); }
  kbd { font: 12px var(--sans); opacity: 0.7; }
  hr { margin: 4px 6px; border: none; border-top: 1px solid var(--line); }
</style>
