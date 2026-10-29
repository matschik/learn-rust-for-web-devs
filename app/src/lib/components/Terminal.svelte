<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Terminal } from "@xterm/xterm";
  import { FitAddon } from "@xterm/addon-fit";
  import "@xterm/xterm/css/xterm.css";
  import type { Api } from "$lib/api";

  let { api, workspace }: { api: Api; workspace: string } = $props();

  let host: HTMLDivElement;
  let term: Terminal | undefined;
  let id: number | undefined;
  let observer: ResizeObserver | undefined;

  onMount(async () => {
    const styles = getComputedStyle(document.documentElement);
    term = new Terminal({
      fontFamily: "JetBrains Mono, SF Mono, Menlo, monospace",
      fontSize: 13,
      cursorBlink: true,
      theme: {
        background: styles.getPropertyValue("--term-bg").trim(),
        foreground: styles.getPropertyValue("--term-text").trim(),
        cursor: "#f97316",
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(host);
    fit.fit();
    id = await api.terminalOpen(workspace, term.cols, term.rows, (text) => term?.write(text));
    term.onData((data) => id !== undefined && api.terminalWrite(id, data));
    observer = new ResizeObserver(() => {
      fit.fit();
      if (id !== undefined && term) api.terminalResize(id, term.cols, term.rows);
    });
    observer.observe(host);
  });

  onDestroy(() => {
    observer?.disconnect();
    if (id !== undefined) api.terminalClose(id);
    term?.dispose();
  });
</script>

<div class="terminal" bind:this={host}></div>

<style>
  .terminal { position: absolute; inset: 8px 0 0 14px; }
</style>
