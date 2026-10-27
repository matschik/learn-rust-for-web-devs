// Le contenu du parcours (modules, exercices, fiches), partagé par le dashboard et le site statique.
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

// Les modules suivent l'ordre des chapitres du Rust Book (version Brown).
export const ROADMAP = [
  { title: "Prise en main", chapters: "ch. 1 à 3" },
  { title: "Ownership et structs", chapters: "ch. 4 et 5" },
  { title: "Enums, collections, erreurs", chapters: "ch. 6, 8, 9" },
  { title: "Modules, génériques, traits, tests", chapters: "ch. 7, 10, 11" },
  { title: "Closures, itérateurs, smart pointers", chapters: "ch. 13, 15" },
  { title: "Concurrence et async", chapters: "ch. 16 et 17" },
  { title: "API avec Axum et sqlx", chapters: "après le livre" },
  { title: "Production", chapters: "après le livre" },
];

async function listDirs(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

async function readTitle(file, fallback) {
  const md = await readFile(file, "utf8").catch(() => "");
  return md.match(/^# (.+)$/m)?.[1]?.replace(/ · (cours|pratique)$/, "") ?? fallback;
}

// Les modules et leurs exercices, dans l'ordre des dossiers. `dir` est le chemin absolu de l'exercice.
export async function listModules(root) {
  const modules = [];
  for (const moduleDir of await listDirs(join(root, "modules"))) {
    const modulePath = join(root, "modules", moduleDir);
    const exercises = [];
    for (const exDir of await listDirs(modulePath)) {
      const dir = join(modulePath, exDir);
      const cargo = await readFile(join(dir, "Cargo.toml"), "utf8").catch(() => null);
      if (!cargo) continue;
      exercises.push({
        id: exDir,
        dir,
        pkg: cargo.match(/^name\s*=\s*"(.+)"/m)?.[1],
        title: await readTitle(join(dir, "README.md"), exDir),
        readme: relative(root, join(dir, "README.md")),
        cours: relative(root, join(dir, "COURS.md")),
      });
    }
    const number = Number(moduleDir.slice(0, 2));
    modules.push({ id: moduleDir, number, title: ROADMAP[number - 1]?.title ?? moduleDir, readme: `modules/${moduleDir}/README.md`, exercises });
  }
  return modules;
}

export function roadmap(modules) {
  const available = new Set(modules.map((m) => m.number));
  return ROADMAP.map((step, i) => ({ number: i + 1, ...step, available: available.has(i + 1) }));
}
