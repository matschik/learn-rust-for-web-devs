<script lang="ts">
  import type { Lesson } from "$lib/api";
  import { isTauri } from "$lib/api";
  import { markdown, withoutTitle } from "$lib/markdown";

  let { lesson, checked, onToggle }: {
    lesson: Lesson;
    checked: Record<string, boolean>;
    onToggle: (key: string, on: boolean) => void;
  } = $props();

  let tab = $state<"cours" | "pratique">("cours");

  const checks = $derived({
    key: (text: string) => `${lesson.module_id}/${lesson.id}#${text}`,
    checked: (key: string) => Boolean(checked[key]),
  });
  const html = $derived(markdown(withoutTitle(tab === "cours" ? lesson.cours : lesson.pratique), checks));
  const steps = $derived([...lesson.pratique.matchAll(/^- \[[ x]\] (.*)$/gm)].map((m) => checks.key(m[1])));
  const done = $derived(steps.filter((k) => checked[k]).length);

  // Les liens des leçons (Rust Book, doc std) s'ouvrent dans le navigateur de l'apprenant.
  async function onClick(event: MouseEvent) {
    const link = (event.target as HTMLElement).closest("a");
    if (!link || !isTauri || !/^https?:/.test(link.href)) return;
    event.preventDefault();
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(link.href);
  }

  function onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.type === "checkbox" && input.dataset.key) onToggle(input.dataset.key, input.checked);
  }
</script>

<section class="lesson" aria-label="Leçon">
  <header>
    <h1>{lesson.title}</h1>
    <div class="tabs" role="tablist">
      <button role="tab" aria-selected={tab === "cours"} class:on={tab === "cours"} onclick={() => (tab = "cours")}>Cours</button>
      <button role="tab" aria-selected={tab === "pratique"} class:on={tab === "pratique"} onclick={() => (tab = "pratique")}>
        Pratique {#if steps.length}<span class="count">{done}/{steps.length}</span>{/if}
      </button>
    </div>
  </header>
  <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
  <div class="doc" onchange={onChange} onclick={onClick}>{@html html}</div>
</section>

<style>
  .lesson { display: flex; flex-direction: column; min-height: 0; height: 100%; }
  header { padding: 20px 26px 0; border-bottom: 1px solid var(--line); }
  h1 { margin: 0 0 10px; font-family: var(--serif); font-size: 28px; font-weight: 650; }
  .tabs { display: flex; gap: 4px; }
  .tabs button { border: none; background: none; padding: 9px 12px; color: var(--muted); border-bottom: 2px solid transparent; cursor: pointer; }
  .tabs button.on { color: var(--text); font-weight: 600; border-bottom-color: var(--accent); }
  .count { font-size: 12px; color: var(--muted); font-weight: 400; margin-left: 4px; }
  .doc { flex: 1; overflow: auto; padding: 8px 26px 40px; line-height: 1.6; font-size: 14.5px; }
  .doc :global(h2) { font-size: 17px; margin: 26px 0 8px; }
  .doc :global(h3) { font-size: 15px; margin: 20px 0 6px; }
  .doc :global(p) { margin: 10px 0; }
  .doc :global(code) { background: var(--code); padding: 1px 5px; border-radius: 4px; }
  .doc :global(pre) { background: var(--code); padding: 12px 14px; border-radius: 10px; overflow-x: auto; font-size: 12.5px; line-height: 1.5; }
  .doc :global(pre code) { background: none; padding: 0; }
  .doc :global(table) { border-collapse: collapse; width: 100%; font-size: 13px; }
  .doc :global(th), .doc :global(td) { border-bottom: 1px solid var(--line); padding: 6px 8px; text-align: left; }
  .doc :global(a) { color: var(--accent); }
  .doc :global(.callout) { background: var(--accent-soft); border-radius: 10px; padding: 2px 14px; }
  .doc :global(details.answer) { border: 1px dashed var(--line); border-radius: 10px; padding: 8px 14px; }
  .doc :global(details.answer summary) { cursor: pointer; color: var(--accent); font-weight: 600; font-size: 13px; }
  .doc :global(ul.checks) { list-style: none; padding: 0; }
  .doc :global(ul.checks li) { margin: 6px 0; }
  .doc :global(ul.checks label) { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; }
  .doc :global(ul.checks input) { margin-top: 4px; accent-color: var(--accent); }
  .doc :global(ul.checks li.on span) { color: var(--muted); text-decoration: line-through; }
</style>
