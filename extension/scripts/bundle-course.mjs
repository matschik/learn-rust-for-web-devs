// Copie le contenu du cours (../modules) dans l'extension, qui doit être autonome une fois
// publiée : les leçons (COURS.md, README.md), leurs schémas et la présentation des modules.
// Le code des exercices n'est pas copié : l'apprenant crée ses propres projets.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const from = new URL("../../modules/", import.meta.url).pathname;
const to = new URL("../course/", import.meta.url).pathname;
const KEEP = new Set(["COURS.md", "README.md", "cours.svg"]);

rmSync(to, { recursive: true, force: true });
let lessons = 0;
for (const mod of readdirSync(from).sort()) {
  const modDir = join(from, mod);
  if (!statSync(modDir).isDirectory()) continue;
  mkdirSync(join(to, mod), { recursive: true });
  if (existsSync(join(modDir, "README.md"))) cpSync(join(modDir, "README.md"), join(to, mod, "README.md"));
  for (const lesson of readdirSync(modDir).sort()) {
    const lessonDir = join(modDir, lesson);
    if (!statSync(lessonDir).isDirectory() || !existsSync(join(lessonDir, "COURS.md"))) continue;
    mkdirSync(join(to, mod, lesson), { recursive: true });
    for (const file of readdirSync(lessonDir)) {
      if (KEEP.has(file)) cpSync(join(lessonDir, file), join(to, mod, lesson, file));
    }
    lessons++;
  }
}
// La licence du repo accompagne l'extension publiée.
cpSync(new URL("../../LICENSE", import.meta.url).pathname, new URL("../LICENSE", import.meta.url).pathname);
console.log(`cours copié : ${lessons} leçons dans course/`);
