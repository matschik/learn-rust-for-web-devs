<script lang="ts">
  import { onMount, tick, untrack } from "svelte";
  import { getApi, type Api, type CheckResult, type Lesson as LessonData, type Module } from "$lib/api";
  import { parseDiagnostics } from "$lib/diagnostics";
  import { highlightCompiler } from "$lib/markdown";
  import { load, save } from "$lib/storage";
  import Lesson from "$lib/components/Lesson.svelte";
  import Explorer from "$lib/components/Explorer.svelte";
  import Editor from "$lib/components/Editor.svelte";
  import Tabs from "$lib/components/Tabs.svelte";
  import QuickOpen from "$lib/components/QuickOpen.svelte";
  import Splitter from "$lib/components/Splitter.svelte";
  import Terminal from "$lib/components/Terminal.svelte";

  let api = $state<Api>();
  let modules = $state<Module[]>([]);
  let current = $state(load("lesson", ""));
  let lesson = $state<LessonData>();
  let workspace = $state<string | null>(load("workspace", null));
  let checked = $state<Record<string, boolean>>(load("checks", {}));

  // Les onglets ouverts et celui qu'on regarde, retrouvés au prochain lancement.
  const savedTabs = load<string[]>("tabs", []);
  const savedActive = load<string | null>("file", null);
  let tabs = $state(savedTabs);
  let active = $state(savedActive && savedTabs.includes(savedActive) ? savedActive : null);
  let dirty = $state<string[]>([]);
  let treeRefresh = $state(0);
  let editor = $state<ReturnType<typeof Editor>>();
  let quickOpen = $state<string[] | null>(null);

  // La disposition, réglable à la souris comme dans VS Code.
  let lessonWidth = $state(load("layout.lesson", 400));
  let treeWidth = $state(load("layout.tree", 220));
  let panelHeight = $state(load("layout.panel", 280));
  let treeOpen = $state(load("layout.treeOpen", true));
  let panelOpen = $state(load("layout.panelOpen", true));
  let panel = $state<"terminal" | "check">("terminal");

  let checking = $state(false);
  let result = $state<CheckResult & { project: string }>();
  let error = $state("");

  const workspaceName = $derived(workspace?.split(/[\\/]/).filter(Boolean).pop() ?? "");
  /** Le projet cargo du fichier affiché : son premier dossier dans le workspace. */
  const project = $derived(active?.includes("/") ? active.split("/")[0] : null);
  /** cargo donne des chemins relatifs au projet ; l'éditeur les veut relatifs au workspace. */
  const diagnostics = $derived(
    result ? parseDiagnostics(result.output).map((d) => ({ ...d, file: `${result!.project}/${d.file}` })) : [],
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

  // À l'ouverture d'un workspace : on rouvre ses onglets et on surveille ses fichiers.
  $effect(() => {
    if (!api || !workspace || !editor) return;
    const ws = workspace;
    untrack(() => tabs.forEach(loadTab));
    api.watchWorkspace(ws, onDiskChange).catch((e) => (error = (e as Error).message));
  });

  $effect(() => save("tabs", tabs));
  $effect(() => save("file", active));

  /** Lit le fichier et le donne à l'éditeur ; s'il n'existe plus, son onglet disparaît. */
  async function loadTab(path: string) {
    if (!api || !workspace || !editor || editor.isOpen(path)) return;
    try {
      editor.open(path, await api.readFile(workspace, path));
    } catch {
      dropTab(path);
    }
  }

  async function openFile(path: string) {
    if (!tabs.includes(path)) tabs = [...tabs, path];
    active = path;
    await loadTab(path);
    await tick();
    editor?.focus();
  }

  function dropTab(path: string) {
    const i = tabs.indexOf(path);
    if (i < 0) return;
    tabs = tabs.filter((t) => t !== path);
    editor?.close(path);
    if (active === path) active = tabs[Math.min(i, tabs.length - 1)] ?? null;
  }

  async function closeTab(path: string) {
    if (editor?.dirty(path)) {
      const name = path.slice(path.lastIndexOf("/") + 1);
      if (!(await api?.ask(`« ${name} » a des modifications non enregistrées. Fermer quand même et les perdre ?`))) return;
    }
    dropTab(path);
  }

  const under = (path: string, dir: string) => path === dir || path.startsWith(`${dir}/`);

  /** Le terminal, cargo ou une IA a touché au workspace : l'arbre et les onglets suivent. */
  async function onDiskChange(paths: string[]) {
    treeRefresh++;
    if (!api || !workspace || !editor) return;
    for (const tab of tabs) {
      if (!paths.some((p) => under(tab, p))) continue;
      try {
        editor.reload(tab, await api.readFile(workspace, tab));
      } catch {
        if (!editor.dirty(tab)) dropTab(tab);
      }
    }
  }

  function onRenamed(from: string, to: string) {
    tabs = tabs.map((tab) => {
      if (!under(tab, from)) return tab;
      const moved = to + tab.slice(from.length);
      editor?.rename(tab, moved);
      if (active === tab) active = moved;
      return moved;
    });
  }

  function onDeleted(path: string) {
    for (const tab of tabs.filter((t) => under(t, path))) dropTab(tab);
  }

  async function chooseWorkspace() {
    const dir = await api?.pickWorkspace();
    if (!dir) return;
    for (const tab of tabs) editor?.close(tab);
    tabs = [];
    active = null;
    workspace = dir;
    save("workspace", dir);
  }

  function toggle(key: string, on: boolean) {
    checked = { ...checked, [key]: on };
    save("checks", checked);
  }

  async function saveFile(path: string, text: string) {
    if (!api || !workspace) return;
    try {
      await api.writeFile(workspace, path, text);
    } catch (e) {
      error = `Impossible d'enregistrer : ${(e as Error).message}`;
    }
  }

  async function verify() {
    if (!api || !workspace || !project) return;
    editor?.saveAll();
    checking = true;
    panel = "check";
    panelOpen = true;
    const target = project;
    try {
      result = { ...(await api.checkProject(workspace, target)), project: target };
    } catch (e) {
      result = { success: false, command: "cargo build", output: (e as Error).message, project: target };
    } finally {
      checking = false;
    }
  }

  async function openQuick() {
    if (!api || !workspace) return;
    quickOpen = await api.listFiles(workspace).catch(() => []);
  }

  function saveLayout() {
    save("layout.lesson", lessonWidth);
    save("layout.tree", treeWidth);
    save("layout.panel", panelHeight);
    save("layout.treeOpen", treeOpen);
    save("layout.panelOpen", panelOpen);
  }

  function togglePanel(which?: "terminal" | "check") {
    if (which && (!panelOpen || panel !== which)) {
      panel = which;
      panelOpen = true;
    } else {
      panelOpen = !panelOpen;
    }
    saveLayout();
  }

  // Cmd sur macOS, Ctrl ailleurs : sur Mac, Ctrl+P ou Ctrl+W restent au shell du terminal.
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  const kbd = (key: string) => (isMac ? `⌘${key}` : `Ctrl+${key}`);

  // Les raccourcis de VS Code qu'on utilise vraiment en apprenant. Écoutés avant Monaco et
  // xterm (phase de capture), sinon l'éditeur les garde pour lui.
  function shortcuts(event: KeyboardEvent) {
    const mod = isMac ? event.metaKey : event.ctrlKey;
    if (!workspace) return;
    const key = event.key.toLowerCase();
    if (mod && key === "p") openQuick();
    else if (mod && key === "s") editor?.save();
    else if (mod && key === "b") (treeOpen = !treeOpen), saveLayout();
    else if (mod && key === "j") togglePanel();
    else if (event.ctrlKey && event.key === "`") togglePanel("terminal");
    else if (mod && key === "w" && active) closeTab(active);
    else if (mod && event.key === "Enter") verify();
    else return;
    event.preventDefault();
    event.stopPropagation();
  }
</script>

<svelte:window onkeydowncapture={shortcuts} />

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
  <div
    class="app"
    class:no-tree={!treeOpen}
    class:no-panel={!panelOpen}
    style:--lesson-w="{lessonWidth}px"
    style:--tree-w="{treeOpen ? treeWidth : 0}px"
    style:--panel-h="{panelOpen ? panelHeight : 36}px"
  >
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
      <button class="search" onclick={openQuick}>
        <span>Ouvrir un fichier</span><kbd>{kbd("P")}</kbd>
      </button>
      <span class="spacer"></span>
      <button class="ws" onclick={chooseWorkspace} title="{workspace} (cliquer pour changer de workspace)">{workspaceName}</button>
    </header>

    <aside class="left">
      {#if lesson}<Lesson {lesson} {checked} onToggle={toggle} />{/if}
      <Splitter axis="x" bind:value={lessonWidth} min={280} max={720} onEnd={saveLayout} />
    </aside>

    <nav class="tree" aria-label="Explorateur">
      {#if api && treeOpen}
        <Explorer
          {api}
          {workspace}
          selected={active}
          refresh={treeRefresh}
          onOpen={openFile}
          {onRenamed}
          {onDeleted}
          onError={(m) => (error = m)}
        />
        <Splitter axis="x" bind:value={treeWidth} min={140} max={480} onEnd={saveLayout} />
      {/if}
    </nav>

    <section class="code">
      <div class="tabbar">
        <Tabs {tabs} {active} {dirty} onSelect={(p) => (active = p)} onClose={closeTab} />
        <span class="spacer"></span>
        <button class="btn primary verify" onclick={verify} disabled={!project || checking} title="Compiler et lancer les tests ({kbd('Entrée')})">
          {checking ? "Vérification…" : "Vérifier"}
        </button>
      </div>
      {#if active && project}
        <nav class="crumbs" aria-label="Chemin du fichier">
          {#each active.split("/") as part, i (i)}{#if i > 0}<span class="sep">›</span>{/if}<span>{part}</span>{/each}
        </nav>
      {/if}
      <div class="editor-host">
        <Editor bind:this={editor} {active} {diagnostics} onSave={saveFile} onDirty={(d) => (dirty = d)} />
        {#if !active}
          <div class="empty">
            <p>Crée ton projet dans le terminal avec <code>cargo new</code>, puis ouvre un fichier dans l'arbre.</p>
            <dl>
              <dt>Ouvrir un fichier</dt><dd><kbd>{kbd("P")}</kbd></dd>
              <dt>Enregistrer</dt><dd><kbd>{kbd("S")}</kbd></dd>
              <dt>Vérifier</dt><dd><kbd>{kbd("Entrée")}</kbd></dd>
              <dt>Afficher le terminal</dt><dd><kbd>{kbd("J")}</kbd></dd>
              <dt>Afficher l'explorateur</dt><dd><kbd>{kbd("B")}</kbd></dd>
            </dl>
          </div>
        {/if}
      </div>
    </section>

    <section class="panel">
      {#if panelOpen}<Splitter axis="y" invert bind:value={panelHeight} min={120} max={900} onEnd={saveLayout} />{/if}
      <div class="panel-tabs">
        <button class:on={panelOpen && panel === "terminal"} onclick={() => togglePanel("terminal")}>Terminal</button>
        <button class:on={panelOpen && panel === "check"} onclick={() => togglePanel("check")}>
          Vérification
          {#if result}<span class="pill" class:ok={result.success}>{result.success ? "OK" : "Erreur"}</span>{/if}
        </button>
        <span class="spacer"></span>
        <button aria-label={panelOpen ? "Replier le panneau" : "Déplier le panneau"} title={kbd("J")} onclick={() => togglePanel()}>{panelOpen ? "▾" : "▴"}</button>
      </div>
      <div class="panel-body">
        <div class="pane" hidden={panel !== "terminal"}>
          {#if api}{#key workspace}<Terminal {api} {workspace} />{/key}{/if}
        </div>
        <div class="pane check" hidden={panel !== "check"}>
          {#if checking}
            <p class="muted">cargo travaille…</p>
          {:else if result}
            <p class="muted">$ {result.command} <span class="where">dans {result.project}/</span></p>
            <pre>{@html highlightCompiler(result.output)}</pre>
          {:else}
            <p class="muted">Appuie sur « Vérifier » pour compiler ton projet et lancer ses tests.</p>
          {/if}
        </div>
      </div>
    </section>
    {#if error}<div class="toast" role="alert">{error} <button onclick={() => (error = "")} aria-label="Fermer">×</button></div>{/if}
  </div>
  {#if quickOpen}<QuickOpen files={quickOpen} onPick={openFile} onClose={() => (quickOpen = null)} />{/if}
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
    grid-template-columns: var(--lesson-w) var(--tree-w) minmax(0, 1fr);
    grid-template-rows: 44px minmax(0, 1fr) var(--panel-h);
    grid-template-areas: "bar bar bar" "left tree code" "left panel panel";
  }
  .bar { grid-area: bar; display: flex; align-items: center; gap: 12px; padding: 0 16px; border-bottom: 1px solid var(--line); background: var(--panel-2); }
  .picker select { font: inherit; height: 30px; border-radius: 8px; border: 1px solid var(--line); background: var(--panel); color: var(--text); padding: 0 8px; max-width: 320px; }
  .search { display: flex; align-items: center; justify-content: space-between; gap: 24px; width: min(360px, 32vw); height: 28px; padding: 0 10px; border: 1px solid var(--line); border-radius: 7px; background: var(--panel); color: var(--muted); font: inherit; font-size: 12.5px; cursor: pointer; }
  .search:hover { border-color: var(--accent); }
  kbd { font: 11.5px var(--sans); color: var(--muted); padding: 1px 6px; border: 1px solid var(--line); border-radius: 4px; background: var(--bg); }
  .ws { border: none; background: none; color: var(--muted); font-family: var(--mono); font-size: 12px; cursor: pointer; max-width: 30vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ws:hover { color: var(--accent); }
  .spacer { flex: 1; }
  .sr { position: absolute; left: -9999px; }

  .left { grid-area: left; position: relative; border-right: 1px solid var(--line); min-height: 0; overflow: hidden; }
  .tree { grid-area: tree; position: relative; border-right: 1px solid var(--line); background: var(--panel-2); min-height: 0; }
  .no-tree .tree { border-right: none; }
  .code { grid-area: code; display: flex; flex-direction: column; min-width: 0; min-height: 0; background: var(--editor); }
  .tabbar { display: flex; align-items: stretch; height: 36px; flex: none; border-bottom: 1px solid var(--line); background: var(--panel-2); }
  .verify { align-self: center; margin: 0 8px; height: 26px; padding: 0 14px; }
  .crumbs { display: flex; gap: 6px; padding: 4px 16px; font-size: 12px; color: var(--muted); flex: none; }
  .crumbs span:last-child { color: var(--text); }
  .sep { opacity: 0.6; }
  .editor-host { position: relative; flex: 1; min-height: 0; }
  .empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; padding: 24px; background: var(--editor); color: var(--muted); text-align: center; }
  .empty p { margin: 0; max-width: 420px; line-height: 1.5; }
  .empty dl { display: grid; grid-template-columns: auto auto; gap: 8px 16px; margin: 0; font-size: 13px; }
  .empty dt { text-align: right; }
  .empty dd { margin: 0; text-align: left; }

  .panel { grid-area: panel; position: relative; display: flex; flex-direction: column; min-height: 0; border-top: 1px solid var(--line); background: var(--term-bg); color: var(--term-text); }
  .where { opacity: 0.7; }
  .panel-tabs { display: flex; align-items: center; gap: 4px; padding: 0 10px; height: 35px; flex: none; border-bottom: 1px solid #34302b; }
  .panel-tabs button { border: none; background: transparent; color: #9c968c; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12.5px; }
  .panel-tabs button.on { background: #34302b; color: var(--term-text); }
  .pill { margin-left: 6px; font-size: 11px; padding: 1px 7px; border-radius: 99px; background: #5b1d1d; color: #fecaca; }
  .pill.ok { background: #14532d; color: #bbf7d0; }
  .panel-body { position: relative; flex: 1; min-height: 0; }
  .no-panel .panel-body { display: none; }
  .pane { position: absolute; inset: 0; }
  .pane[hidden] { display: none; }
  .check { overflow: auto; padding: 10px 18px; font-family: var(--mono); font-size: 12.5px; }
  .check pre { margin: 0; line-height: 1.55; }
  .check .muted { color: #9c968c; margin: 4px 0 8px; }
  .muted { color: var(--muted); }
  .toast { position: fixed; z-index: 60; bottom: 16px; left: 50%; transform: translateX(-50%); background: var(--err-soft); color: var(--err); border-radius: 10px; padding: 10px 14px; }
  .toast button { border: none; background: none; cursor: pointer; color: inherit; }
</style>
