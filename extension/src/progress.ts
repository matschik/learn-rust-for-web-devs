// La progression de l'apprenant, rangée dans son workspace (`.learn-rust/progress.json`) :
// elle suit ses projets d'une machine à l'autre, et son outil d'IA peut la lire.

export type Progress = {
  /** La leçon ouverte, `<module>/<leçon>`. */
  lesson: string | null;
  /** Les étapes cochées des fiches, par clé `<module>/<leçon>#<étape>`. */
  checks: Record<string, boolean>;
};

export const PROGRESS_FILE = ".learn-rust/progress.json";

export const empty = (): Progress => ({ lesson: null, checks: {} });

/** Un fichier abîmé ou d'une ancienne version ne doit pas empêcher d'apprendre. */
export function parse(text: string): Progress {
  try {
    const data = JSON.parse(text) as Partial<Progress>;
    return {
      lesson: typeof data.lesson === "string" ? data.lesson : null,
      checks: data.checks && typeof data.checks === "object" ? Object.fromEntries(Object.entries(data.checks).filter(([, v]) => v === true)) : {},
    };
  } catch {
    return empty();
  }
}

/** Trié et indenté : un diff lisible si l'apprenant versionne son workspace. */
export function serialize(progress: Progress): string {
  const checks = Object.fromEntries(Object.entries(progress.checks).filter(([, v]) => v).sort(([a], [b]) => a.localeCompare(b)));
  return `${JSON.stringify({ lesson: progress.lesson, checks }, null, 2)}\n`;
}
