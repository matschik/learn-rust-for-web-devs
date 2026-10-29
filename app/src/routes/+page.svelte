<script lang="ts">
  import { onMount } from "svelte";
  import { getApi, type Api, type CheckResult, type Lesson as LessonData, type Module } from "$lib/api";
  import { parseDiagnostics } from "$lib/diagnostics";
  import { highlightCompiler } from "$lib/markdown";
  import { load, save } from "$lib/storage";
  import Lesson from "$lib/components/Lesson.svelte";
  import FileTree from "$lib/components/FileTree.svelte";
  import Editor from "$lib/components/Editor.svelte";
  import Terminal from "$lib/components/Terminal.svelte";

  let api = $state<Api>();
  let modules = $state<Module[]>([]);
  let current = $state(load("lesson", ""));
  let lesson = $state<LessonData>();
  let workspace = $state<string | null>(load("workspace", null));
  let checked = $state<Record<string, boolean>>(load("checks", {}));

  let file = $state<string | null>(load("file", null));
  let content = $state("");
  let dirty = $state(false);
  let treeRefresh = $state(0);
  let editor = $state<ReturnType<typeof Editor>>();

  let panel = $state<"terminal" | "check">("terminal");
  let panelOpen = $state(true);
  let checking = $state(false);
  let result = $state<CheckResult>();
  let error = $state("");

  /** Le projet cargo du fichier ouvert : son premier dossier dans le workspace. */
  const project = $derived(file?.includes("/") ? file.split("/")[0] : null);
  const diagnostics = $derived(
    result && file && project ? parseDiagnostics(result.output).filter((d) => `${project}/${d.file}` === file) : [],
  );

  onMount(async () => {
    api = await getApi();
    workspace ??= await api.defaultWorkspace();
    modules = await api.listModules();
    if (!current && modules[0]) current = `${modules[0].id}/${modules[0].lessons[0].id}`;
  });

  $effect(() => {
    const [m, l] = current.split("/");
    if (!api || !m || !l) return;
    save("lesson", current);
    api.readLesson(m, l).then((data) => (lesson = data)).catch((e) => (error = String(e.message ?? e)));
  });

  $effect(() => {
    if (!api || !workspace || !file) return;
    save("file", file);
    api.readFile(workspace, file).then((text) => (content = text)).catch(() => (file = null));
  });

  async function chooseWorkspace() {
    const dir = await api?.pickWorkspace();
    if (!dir) return;
    workspace = dir;
    file = null;
    save("workspace", dir);
  }

  function toggle(key: string, on: boolean) {
    checked = { ...checked, [key]: on };
    save("checks", checked);
  }

  async function saveFile(text: string) {
    if (!api || !workspace || !file) return;
    try {
      await api.writeFile(workspace, file, text);
      content = text;
    } catch (e) {
      error = `Impossible d'enregistrer : ${(e as Error).message}`;
    }
  }

  async function verify() {
    if (!api || !workspace || !project) return;
    editor?.save();
    checking = true;
    panel = "check";
    panelOpen = true;
    try {
      result = await api.checkProject(workspace, project);
    } catch (e) {
      result = { success: false, command: "cargo build", output: (e as Error).message };
    } finally {
      checking = false;
      treeRefresh++;
    }
  }
</script>

{#if !workspace}
  <main class="welcome">
    <div class="card">
      <p class="eyebrow">Bienvenue</p>
      <h1>On prépare ton coin pour apprendre Rust</h1>
      <p>Choisis le dossier où tu vas créer tes projets avec <code>cargo new</code>. Il reste à toi : l'app n'y écrit que ce que tu tapes.</p>
      <button class="btn primary" onclick={chooseWorkspace}>Choisir mon workspace</button>
    </div>
  </main>
{:else}
  <div class="app">
    <header class="bar">
      <label class="picker">
        <span class="sr">Leçon</span>
        <select bind:value={current}>
          {#each modules as mod (mod.id)}
            <optgroup label={mod.title}>
              {#each mod.lessons as l (l.id)}
                <option value="{mod.id}/{l.id}">{l.id.slice(0, 2)} · {l.title}</option>
              {/each}
            </optgroup>
          {/each}
        </select>
      </label>
      <span class="spacer"></span>
      <button class="ws" onclick={chooseWorkspace} title="Changer de workspace">{workspace}</button>
    </header>

    <aside class="left">
      {#if lesson}<Lesson {lesson} {checked} onToggle={toggle} />{/if}
    </aside>

    <nav class="tree">
      {#if api}<FileTree {api} {workspace} selected={file} onOpen={(p) => (file = p)} refresh={treeRefresh} />{/if}
    </nav>

    <section class="code">
      <div class="tabbar">
        {#if file}<span class="tab">{file}{#if dirty}<span class="dot" aria-label="non enregistré"> ●</span>{/if}</span>{/if}
        <span class="spacer"></span>
        <button class="btn primary" onclick={verify} disabled={!project || checking}>
          {checking ? "Vérification…" : "Vérifier"}
        </button>
      </div>
      <div class="editor-host">
        {#if file}
          <Editor bind:this={editor} path={file} value={content} {diagnostics} onSave={saveFile} onDirty={(d) => (dirty = d)} />
        {:else}
          <p class="empty">Crée ton projet dans le terminal avec <code>cargo new</code>, puis ouvre un fichier dans l'arbre.</p>
        {/if}
      </div>
    </section>

    <section class="panel" class:closed={!panelOpen}>
      <div class="panel-tabs">
        <button class:on={panel === "terminal"} onclick={() => ((panel = "terminal"), (panelOpen = true))}>Terminal</button>
        <button class:on={panel === "check"} onclick={() => ((panel = "check"), (panelOpen = true))}>
          Vérification
          {#if result}<span class="pill" class:ok={result.success}>{result.success ? "OK" : "Erreur"}</span>{/if}
        </button>
        <span class="spacer"></span>
        <button aria-label={panelOpen ? "Replier le panneau" : "Déplier le panneau"} onclick={() => (panelOpen = !panelOpen)}>{panelOpen ? "▾" : "▴"}</button>
      </div>
      <div class="panel-body">
        <div class="pane" hidden={panel !== "terminal"}>
          {#if api}{#key workspace}<Terminal {api} {workspace} />{/key}{/if}
        </div>
        <div class="pane check" hidden={panel !== "check"}>
          {#if checking}
            <p class="muted">cargo travaille…</p>
          {:else if result}
            <p class="muted">$ {result.command}</p>
            <pre>{@html highlightCompiler(result.output)}</pre>
          {:else}
            <p class="muted">Appuie sur « Vérifier » pour compiler ton projet et lancer ses tests.</p>
          {/if}
        </div>
      </div>
    </section>
    {#if error}<div class="toast" role="alert">{error} <button onclick={() => (error = "")} aria-label="Fermer">×</button></div>{/if}
  </div>
{/if}

<style>
  .welcome { height: 100vh; display: grid; place-items: center; padding: 24px; }
  .card { max-width: 520px; display: flex; flex-direction: column; gap: 14px; }
  .card h1 { margin: 0; font-family: var(--serif); font-size: 36px; line-height: 1.15; }
  .card p { margin: 0; color: var(--muted); font-size: 16px; line-height: 1.5; }
  .card .btn { align-self: flex-start; height: 44px; padding: 0 22px; }
  .eyebrow { color: var(--accent) !important; font-weight: 600; font-size: 13px !important; }

  .app {
    height: 100vh;
    display: grid;
    grid-template-columns: minmax(340px, 420px) 210px 1fr;
    grid-template-rows: 44px 1fr auto;
    grid-template-areas: "bar bar bar" "left tree code" "left panel panel";
  }
  .bar { grid-area: bar; display: flex; align-items: center; gap: 12px; padding: 0 16px; border-bottom: 1px solid var(--line); background: var(--panel-2); }
  .picker select { font: inherit; height: 30px; border-radius: 8px; border: 1px solid var(--line); background: var(--panel); color: var(--text); padding: 0 8px; }
  .ws { border: none; background: none; color: var(--muted); font-family: var(--mono); font-size: 12px; cursor: pointer; }
  .ws:hover { color: var(--accent); }
  .spacer { flex: 1; }
  .sr { position: absolute; left: -9999px; }

  .left { grid-area: left; border-right: 1px solid var(--line); min-height: 0; overflow: hidden; }
  .tree { grid-area: tree; border-right: 1px solid var(--line); background: var(--panel-2); overflow: auto; padding: 8px 0; }
  .code { grid-area: code; display: flex; flex-direction: column; min-width: 0; min-height: 0; background: var(--editor); }
  .tabbar { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-bottom: 1px solid var(--line); background: var(--panel-2); }
  .tab { font-family: var(--mono); font-size: 12.5px; padding: 4px 10px; background: var(--editor); border: 1px solid var(--line); border-radius: 7px; }
  .dot { color: var(--accent); }
  .editor-host { position: relative; flex: 1; min-height: 0; }
  .empty { margin: 40px; color: var(--muted); }

  .panel { grid-area: panel; height: 300px; display: flex; flex-direction: column; border-top: 1px solid var(--line); background: var(--term-bg); color: var(--term-text); }
  .panel.closed { height: 38px; }
  .panel-tabs { display: flex; align-items: center; gap: 4px; padding: 0 10px; height: 38px; flex: none; border-bottom: 1px solid #34302b; }
  .panel-tabs button { border: none; background: transparent; color: #9c968c; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12.5px; }
  .panel-tabs button.on { background: #34302b; color: var(--term-text); }
  .pill { margin-left: 6px; font-size: 11px; padding: 1px 7px; border-radius: 99px; background: #5b1d1d; color: #fecaca; }
  .pill.ok { background: #14532d; color: #bbf7d0; }
  .panel-body { position: relative; flex: 1; min-height: 0; }
  .panel.closed .panel-body { display: none; }
  .pane { position: absolute; inset: 0; }
  .pane[hidden] { display: none; }
  .check { overflow: auto; padding: 10px 18px; font-family: var(--mono); font-size: 12.5px; }
  .check pre { margin: 0; line-height: 1.55; }
  .check .muted { color: #9c968c; margin: 4px 0 8px; }
  .muted { color: var(--muted); }
  .toast { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); background: var(--err-soft); color: var(--err); border-radius: 10px; padding: 10px 14px; }
  .toast button { border: none; background: none; cursor: pointer; color: inherit; }
</style>
