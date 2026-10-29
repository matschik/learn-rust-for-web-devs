// Repère les erreurs et warnings de rustc dans la sortie de cargo, pour les souligner dans l'éditeur.

export type Diagnostic = {
  severity: "error" | "warning";
  code?: string;
  message: string;
  /** Chemin relatif au projet, tel que cargo l'écrit (`src/lib.rs`). */
  file: string;
  line: number;
  column: number;
};

export function parseDiagnostics(output: string): Diagnostic[] {
  const lines = output.split("\n");
  const found: Diagnostic[] = [];
  for (let i = 0; i < lines.length; i++) {
    const head = lines[i].match(/^(error|warning)(?:\[(E\d+)\])?: (.*)$/);
    if (!head) continue;
    const at = lines[i + 1]?.match(/^\s*--> (.+):(\d+):(\d+)$/);
    if (!at) continue;
    found.push({
      severity: head[1] as "error" | "warning",
      code: head[2],
      message: head[3],
      file: at[1],
      line: Number(at[2]),
      column: Number(at[3]),
    });
  }
  return found;
}
