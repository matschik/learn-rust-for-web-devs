// Dashboard de progression : `node dashboard/server.mjs`, puis http://localhost:4321
// Aucune dépendance npm. Lance `cargo test` sur chaque exercice modifié et lit PROGRESS.md.
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT ?? 4321);
// Un target dir séparé pour ne pas bloquer le cargo (ou bacon) de l'apprenant.
const CARGO_ENV = { ...process.env, CARGO_TARGET_DIR: join(ROOT, "target", "dashboard") };

const ROADMAP = [
  "Prise en main",
  "Ownership et borrowing",
  "Enums et erreurs",
  "Traits, génériques, serde",
  "Async et Tokio",
  "HTTP avec Axum",
  "Postgres avec sqlx",
  "Production",
];

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

async function listDirs(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
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
  const md = await readFile(join(ROOT, "PROGRESS.md"), "utf8").catch(() => "");
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

async function readTitle(file, fallback) {
  const md = await readFile(file, "utf8").catch(() => "");
  return md.match(/^# (.+)$/m)?.[1] ?? fallback;
}

async function buildState() {
  const progress = await readProgress();
  const modules = [];
  for (const moduleDir of await listDirs(join(ROOT, "modules"))) {
    const modulePath = join(ROOT, "modules", moduleDir);
    const exercises = [];
    for (const exDir of await listDirs(modulePath)) {
      const dir = join(modulePath, exDir);
      const cargo = await readFile(join(dir, "Cargo.toml"), "utf8").catch(() => null);
      if (!cargo) continue;
      const pkg = cargo.match(/^name\s*=\s*"(.+)"/m)?.[1];
      const [tests, untouched] = await Promise.all([testExercise(dir, pkg), isUntouched(dir)]);
      const validated = progress.validated.get(exDir) ?? progress.validated.get(pkg) ?? null;
      let status;
      if (validated) status = "validated";
      else if (tests.compiles && tests.total > 0 && tests.passed === tests.total) status = "green";
      else if (untouched) status = "todo";
      else status = "in-progress";
      exercises.push({
        id: exDir,
        pkg,
        title: await readTitle(join(dir, "README.md"), exDir),
        readme: relative(ROOT, join(dir, "README.md")),
        status,
        tests,
        validated,
      });
    }
    const number = Number(moduleDir.slice(0, 2));
    modules.push({ id: moduleDir, number, title: ROADMAP[number - 1] ?? moduleDir, readme: `modules/${moduleDir}/README.md`, exercises });
  }
  const available = new Set(modules.map((m) => m.number));
  const roadmap = ROADMAP.map((title, i) => ({ number: i + 1, title, available: available.has(i + 1) }));
  return {
    roadmap,
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
      // Seuls les fichiers markdown du repo sont servis.
      const path = url.searchParams.get("path") ?? "";
      const full = join(ROOT, path);
      if (!path.endsWith(".md") || relative(ROOT, full).startsWith("..")) return send(res, 400, "{}");
      send(res, 200, await readFile(full), "text/markdown; charset=utf-8");
    } else {
      send(res, 404, "{}");
    }
  } catch (error) {
    send(res, 500, JSON.stringify({ error: String(error) }));
  }
}).listen(PORT, "127.0.0.1", () => {
  console.log(`Dashboard : http://localhost:${PORT}`);
});
