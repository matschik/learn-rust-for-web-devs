// Le cours embarqué dans l'extension (dossier `course/`, copié depuis ../modules au build).
// Rien ici ne dépend de VS Code : c'est testé avec vitest.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export type LessonRef = { id: string; title: string };
export type Module = { id: string; title: string; lessons: LessonRef[] };
export type Lesson = {
  moduleId: string;
  id: string;
  title: string;
  /** Le `COURS.md`. */
  cours: string;
  /** Le `README.md`, la fiche pratique. */
  pratique: string;
  /** Le dossier de la leçon, pour ses images (`cours.svg`). */
  dir: string;
};

/** « # 02 - Variables · let, mut » devient « Variables » ; « # Module 01 : Prise en main », « Prise en main ». */
export function titleOf(md: string, fallback: string): string {
  const first = md.split("\n").find((l) => l.startsWith("# "));
  if (!first) return fallback;
  return first
    .slice(2)
    .split(" · ")[0]
    .replace(/^\d+ - /, "")
    .replace(/^Module \d+ : /, "")
    .trim();
}

const dirs = (dir: string) =>
  readdirSync(dir)
    .filter((name) => statSync(join(dir, name)).isDirectory())
    .sort();

const read = (file: string) => (existsSync(file) ? readFileSync(file, "utf8") : "");

export function listModules(root: string): Module[] {
  return dirs(root).map((id) => ({
    id,
    title: titleOf(read(join(root, id, "README.md")), id),
    lessons: dirs(join(root, id))
      .filter((l) => existsSync(join(root, id, l, "COURS.md")))
      .map((l) => ({ id: l, title: titleOf(read(join(root, id, l, "COURS.md")), l) })),
  }));
}

/** Les identifiants viennent du panneau ou de la progression : on refuse tout ce qui sortirait du cours. */
const safe = (id: string) => /^[\w-]+$/.test(id);

export function readLesson(root: string, moduleId: string, lessonId: string): Lesson | undefined {
  if (!safe(moduleId) || !safe(lessonId)) return undefined;
  const dir = join(root, moduleId, lessonId);
  const cours = read(join(dir, "COURS.md"));
  if (!cours) return undefined;
  return { moduleId, id: lessonId, title: titleOf(cours, lessonId), cours, pratique: read(join(dir, "README.md")), dir };
}

/** Les étapes à cocher de la fiche pratique, par clé `<module>/<leçon>#<texte>`. */
export function stepKeys(lesson: Pick<Lesson, "moduleId" | "id" | "pratique">): string[] {
  return [...lesson.pratique.matchAll(/^- \[[ x]\] (.*)$/gm)].map((m) => `${lesson.moduleId}/${lesson.id}#${m[1]}`);
}

/** La leçon qui suit (ou précède) dans le parcours, modules enchaînés. */
export function neighbour(modules: Module[], ref: string, step: 1 | -1): string | undefined {
  const all = modules.flatMap((m) => m.lessons.map((l) => `${m.id}/${l.id}`));
  const i = all.indexOf(ref);
  return i < 0 ? undefined : all[i + step];
}
