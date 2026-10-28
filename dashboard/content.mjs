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

// La clé d'une case à cocher : le chemin de la fiche et le texte de l'étape, sans liens, accents ni ponctuation.
// C'est sous cette clé que PROGRESS.checks.json retient les étapes faites.
export const stepKey = (file, text) =>
  `${file}#${text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80).replace(/^-|-$/g, "")}`;

// Les étapes « - [ ] » d'une fiche, avec le titre (## ou ###) sous lequel elles sont rangées.
export async function readSteps(root, file) {
  const md = await readFile(join(root, file), "utf8").catch(() => "");
  const steps = [];
  let group = "";
  for (const line of md.split("\n")) {
    const title = line.match(/^#{2,3} (.+)$/);
    const step = line.match(/^- \[[ x]\] (.+)$/);
    if (title) group = title[1].trim();
    else if (step) steps.push({ key: stepKey(file, step[1]), text: step[1], group });
  }
  return steps;
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
        steps: await readSteps(root, relative(root, join(dir, "README.md"))),
      });
    }
    const number = Number(moduleDir.slice(0, 2));
    const readme = `modules/${moduleDir}/README.md`;
    modules.push({ id: moduleDir, number, title: ROADMAP[number - 1]?.title ?? moduleDir, readme, steps: await readSteps(root, readme), exercises });
  }
  return modules;
}

export function roadmap(modules) {
  const available = new Set(modules.map((m) => m.number));
  return ROADMAP.map((step, i) => ({ number: i + 1, ...step, available: available.has(i + 1) }));
}
