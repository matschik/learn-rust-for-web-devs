import * as path from "node:path";

/** Le dossier du `Cargo.toml` le plus proche du fichier, sans sortir du workspace. */
export function cargoRootOf(file: string, workspace: string, exists: (p: string) => boolean): string | undefined {
  let dir = path.dirname(file);
  while (dir === workspace || dir.startsWith(workspace + path.sep)) {
    if (exists(path.join(dir, "Cargo.toml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}
