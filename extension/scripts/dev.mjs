// `pnpm dev <dossier>` : compile, ouvre <dossier> dans une fenêtre VS Code avec l'extension
// chargée depuis ce repo, puis recompile à chaque modification. Après un changement de
// code, Cmd+R (Developer: Reload Window) dans cette fenêtre recharge l'extension.
import { execSync, spawn } from "node:child_process";
import { resolve } from "node:path";

const folder = process.argv[2];
if (!folder) {
  console.error("Usage : pnpm dev <dossier de ton workspace Rust>, par exemple pnpm dev ~/Code/learn-rust-for-me");
  process.exit(1);
}
const extension = resolve(import.meta.dirname, "..");
const code = process.env.CODE_CLI ?? "code";

execSync("pnpm build", { cwd: extension, stdio: "inherit" });
try {
  execSync(`${code} --new-window --extensionDevelopmentPath="${extension}" "${resolve(folder)}"`, { stdio: "inherit" });
} catch {
  console.error(
    `\nImpossible de lancer « ${code} ». Dans VS Code : Cmd+Shift+P, « Shell Command: Install 'code' command in PATH ».` +
      "\nPour Cursor, relance avec CODE_CLI=cursor.",
  );
  process.exit(1);
}
console.log("\nFenêtre ouverte. Recompilation à chaque modification (Ctrl+C pour arrêter).\n");
spawn("node", ["esbuild.mjs", "--watch"], { cwd: extension, stdio: "inherit" });
