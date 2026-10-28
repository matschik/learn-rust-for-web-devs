// Construit le site statique (GitHub Pages) dans _site/ : la page de présentation,
// et le dashboard en lecture seule avec les fiches de cours et de pratique, sans tests ni progression.
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { listModules, roadmap } from "../dashboard/content.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "_site");

await rm(OUT, { recursive: true, force: true });
await mkdir(join(OUT, "cours"), { recursive: true });

const modules = await listModules(ROOT);
for (const m of modules) {
  await mkdir(join(OUT, dirname(m.readme)), { recursive: true });
  await cp(join(ROOT, m.readme), join(OUT, m.readme));
  m.exercises = m.exercises.map(({ dir, ...ex }) => ({
    ...ex,
    status: "todo",
    tests: { compiles: true, passed: 0, total: 0, output: "" },
    validated: null,
  }));
  for (const ex of m.exercises) {
    const base = dirname(ex.readme);
    for (const name of ["COURS.md", "README.md", "cours.svg"]) {
      await mkdir(join(OUT, base), { recursive: true });
      await cp(join(ROOT, base, name), join(OUT, base, name)).catch(() => {});
    }
  }
}
const state = { roadmap: roadmap(modules), modules, current: [], review: [], mistakes: [], taskr: [] };
await writeFile(join(OUT, "cours", "state.json"), JSON.stringify(state));

const dashboard = await readFile(join(ROOT, "dashboard", "index.html"), "utf8");
await writeFile(join(OUT, "cours", "index.html"), dashboard.replace("<script>", "<script>window.LEARN_RUST_STATIC = true;</script>\n<script>"));
await cp(join(ROOT, "site", "index.html"), join(OUT, "index.html"));
await cp(join(ROOT, "site", "ferris.svg"), join(OUT, "ferris.svg"));
await writeFile(join(OUT, ".nojekyll"), "");

const count = modules.reduce((n, m) => n + m.exercises.length, 0);
console.log(`Site construit dans _site/ : ${modules.length} modules, ${count} exercices.`);
