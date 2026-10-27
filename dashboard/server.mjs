// Dashboard de progression : `PORT=4400 node dashboard/server.mjs`, puis http://localhost:4400
// Aucune dépendance npm. Lance `cargo test` sur chaque exercice modifié et lit PROGRESS.md.
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { listModules, roadmap } from "./content.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT ?? 4400);
// Un target dir séparé pour ne pas bloquer le cargo (ou bacon) de l'apprenant.
const CARGO_ENV = { ...process.env, CARGO_TARGET_DIR: join(ROOT, "target", "dashboard") };


function run(cmd, args) {
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd: ROOT, env: CARGO_ENV, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({ code: error ? (error.code ?? 1) : 0, output: `${stdout}${stderr}` });
    });
  });
}

async function latestMtime(dir) {
  let latest = 0;
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) latest = Math.max(latest, (await stat(join(entry.parentPath, entry.name))).mtimeMs);
  }
  return latest;
}

// Résultats de tests, recalculés seulement quand les sources d'un exercice changent.
const testCache = new Map();

async function testExercise(dir, pkg) {
  const mtime = await latestMtime(join(dir, "src"));
  const cached = testCache.get(pkg);
  if (cached && cached.mtime === mtime) return cached.result;

  const { output } = await run("cargo", ["test", "-q", "-p", pkg, "--color", "never"]);
  const summary = output.match(/test result: \w+\. (\d+) passed; (\d+) failed/);
  let result;
  if (summary) {
    const passed = Number(summary[1]);
    const total = passed + Number(summary[2]);
    result = { compiles: true, passed, total, output };
  } else {
    result = { compiles: false, passed: 0, total: null, output };
  }
  testCache.set(pkg, { mtime, result });
  return result;
}

async function isUntouched(dir) {
  const { code } = await run("git", ["diff", "--quiet", "HEAD", "--", relative(ROOT, join(dir, "src"))]);
  return code === 0;
}

function section(markdown, title) {
  const match = markdown.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, "m"));
  return match ? match[1].trim() : "";
}

async function readProgress() {
  // PROGRESS.md est propre à l'apprenant (ignoré par git) ; avant la première séance, on lit le modèle.
  const md = await readFile(join(ROOT, "PROGRESS.md"), "utf8")
    .catch(() => readFile(join(ROOT, "PROGRESS.template.md"), "utf8"))
    .catch(() => "");
  const validated = new Map();
  for (const line of section(md, "Validés").split("\n")) {
    const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
    const name = cells[0]?.replaceAll("`", "");
    if (!name || name === "Exercice" || /^-+$/.test(name)) continue;
    validated.set(name, { date: cells[1] ?? "", hints: Number(cells[2]) || 0, notes: cells[3] ?? "" });
  }
  const bullets = (text) =>
    text.split("\n").filter((l) => /^\s*[-*] /.test(l)).map((l) => l.replace(/^\s*[-*] /, "").trim());
  return {
    current: bullets(section(md, "En cours")),
    validated,
    review: bullets(section(md, "À réviser")),
    mistakes: bullets(section(md, "Erreurs récurrentes")),
    taskr: bullets(section(md, "Fil rouge Taskr")),
  };
}

async function buildState() {
  const progress = await readProgress();
  const modules = await listModules(ROOT);
  // Un exercice après l'autre : les cargo test se partagent le même target dir.
  for (const m of modules) {
    const exercises = [];
    for (const { dir, ...ex } of m.exercises) {
      const [tests, untouched] = await Promise.all([testExercise(dir, ex.pkg), isUntouched(dir)]);
      const validated = progress.validated.get(ex.id) ?? progress.validated.get(ex.pkg) ?? null;
      let status;
      if (validated) status = "validated";
      else if (tests.compiles && tests.total > 0 && tests.passed === tests.total) status = "green";
      else if (untouched) status = "todo";
      else status = "in-progress";
      exercises.push({ ...ex, status, tests, validated });
    }
    m.exercises = exercises;
  }
  return {
    roadmap: roadmap(modules),
    modules,
    current: progress.current,
    review: progress.review,
    mistakes: progress.mistakes,
    taskr: progress.taskr,
    updatedAt: new Date().toISOString(),
  };
}

// Un seul calcul à la fois : les requêtes qui arrivent pendant un calcul attendent le même résultat.
let pending = null;
function state() {
  pending ??= buildState().finally(() => (pending = null));
  return pending;
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(body);
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname === "/") {
      send(res, 200, await readFile(join(ROOT, "dashboard", "index.html")), "text/html; charset=utf-8");
    } else if (url.pathname === "/api/state") {
      send(res, 200, JSON.stringify(await state()));
    } else if (url.pathname === "/api/file") {
      // Seuls les fiches markdown et les diagrammes SVG du repo sont servis.
      const path = url.searchParams.get("path") ?? "";
      const full = join(ROOT, path);
      const type = path.endsWith(".md") ? "text/markdown; charset=utf-8" : path.endsWith(".svg") ? "image/svg+xml" : null;
      if (!type || relative(ROOT, full).startsWith("..")) return send(res, 400, "{}");
      send(res, 200, await readFile(full), type);
    } else {
      send(res, 404, "{}");
    }
  } catch (error) {
    send(res, 500, JSON.stringify({ error: String(error) }));
  }
})
  .on("error", (error) => {
    if (error.code !== "EADDRINUSE") throw error;
    console.error(`Le port ${PORT} est déjà pris par une autre app. Relance avec un autre port, par exemple : PORT=4401 node dashboard/server.mjs`);
    process.exit(1);
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(`Dashboard : http://localhost:${PORT}`);
  });
