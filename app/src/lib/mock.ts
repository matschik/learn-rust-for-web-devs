// Le monde simulé du mode navigateur : le vrai contenu du cours (lu par Vite depuis le repo),
// un petit workspace en mémoire, un faux `cargo` et un faux terminal.

import type { Api, CheckResult, Entry, Lesson, Module } from "./api";
import { ApiError } from "./api";

const files = import.meta.glob("../../../modules/*/*/{COURS,README}.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const moduleReadmes = import.meta.glob("../../../modules/*/README.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function titleOf(md: string, fallback: string): string {
  const first = md.split("\n").find((l) => l.startsWith("# "));
  if (!first) return fallback;
  return first
    .slice(2)
    .split(" · ")[0]
    .replace(/^\d+ - /, "")
    .replace(/^Module \d+ : /, "")
    .trim();
}

function modules(): Module[] {
  const byModule = new Map<string, Module>();
  for (const path of Object.keys(files).sort()) {
    const [, , , , moduleId, lessonId, file] = path.split("/");
    if (file !== "COURS.md") continue;
    const readme = moduleReadmes[`../../../modules/${moduleId}/README.md`] ?? "";
    const mod = byModule.get(moduleId) ?? { id: moduleId, title: titleOf(readme, moduleId), lessons: [] };
    mod.lessons.push({ id: lessonId, title: titleOf(files[path], lessonId) });
    byModule.set(moduleId, mod);
  }
  return [...byModule.values()];
}

const STARTER = `/// Compte les tâches terminées.
pub fn count_done(statuses: [bool; 5]) -> u32 {
    let count = 0;
    for done in statuses {
        if done {
            count += 1;
        }
    }
    count
}
`;

const workspace = new Map<string, string>([
  ["hello/Cargo.toml", '[package]\nname = "hello"\nversion = "0.1.0"\nedition = "2024"\n'],
  ["hello/src/main.rs", 'fn main() {\n    println!("Hello, world!");\n}\n'],
  ["variables/Cargo.toml", '[package]\nname = "variables"\nversion = "0.1.0"\nedition = "2024"\n'],
  ["variables/src/lib.rs", STARTER],
  ["AGENTS.md", "# Règles du tuteur\n\nTu coaches un apprenant Rust. Ne donne jamais la solution.\n"],
]);

let listener: ((paths: string[]) => void) | undefined;
const changed = (paths: string[]) => setTimeout(() => listener?.(paths), 30);
const exists = (path: string) => [...workspace.keys()].some((f) => f === path || f.startsWith(`${path}/`));

function listDir(path: string): Entry[] {
  const prefix = path ? `${path}/` : "";
  const seen = new Map<string, Entry>();
  for (const file of workspace.keys()) {
    if (!file.startsWith(prefix)) continue;
    const [name, ...rest] = file.slice(prefix.length).split("/");
    if (name === ".keep") continue;
    seen.set(name, { name, path: prefix + name, is_dir: rest.length > 0 });
  }
  return [...seen.values()].sort((a, b) => Number(b.is_dir) - Number(a.is_dir) || a.name.localeCompare(b.name));
}

const E0384 = `error[E0384]: cannot assign twice to immutable variable \`count\`
 --> src/lib.rs:6:13
  |
3 |     let count = 0;
  |         ----- first assignment to \`count\`
...
6 |             count += 1;
  |             ^^^^^^^^^^ cannot assign twice to immutable variable
  |
help: consider making this binding mutable
  |
3 |     let mut count = 0;
  |         +++

For more information about this error, try \`rustc --explain E0384\`.
error: could not compile \`variables\` (lib) due to 1 previous error`;

function check(project: string): CheckResult {
  const lib = workspace.get(`${project}/src/lib.rs`) ?? "";
  if (/let count = 0/.test(lib)) return { success: false, command: "cargo build", output: E0384 };
  return {
    success: true,
    command: "cargo test",
    output: `running 1 test\ntest tests::counts_done ... ok\n\ntest result: ok. 1 passed; 0 failed`,
  };
}

const PROMPT = "\x1b[38;5;208m~/rust-workspace\x1b[0m $ ";

export function mockApi(): Api {
  const lessons = modules();
  return {
    listModules: async () => lessons,
    readLesson: async (moduleId, lessonId): Promise<Lesson> => {
      const base = `../../../modules/${moduleId}/${lessonId}`;
      const cours = files[`${base}/COURS.md`];
      if (cours === undefined) throw new ApiError({ kind: "NotFound", message: `${moduleId}/${lessonId}` });
      return { module_id: moduleId, id: lessonId, title: titleOf(cours, lessonId), cours, pratique: files[`${base}/README.md`] ?? "" };
    },
    defaultWorkspace: async () => null,
    listDir: async (_ws, path) => listDir(path),
    readFile: async (_ws, path) => {
      const text = workspace.get(path);
      if (text === undefined) throw new ApiError({ kind: "NotFound", message: path });
      return text;
    },
    writeFile: async (_ws, path, content) => {
      workspace.set(path, content);
      changed([path]);
    },
    listFiles: async () => [...workspace.keys()].filter((f) => !f.endsWith("/.keep")).sort(),
    createFile: async (_ws, path) => {
      if (exists(path)) throw new ApiError({ kind: "Io", message: `${path} existe déjà` });
      workspace.set(path, "");
      changed([path]);
    },
    createDir: async (_ws, path) => {
      if (exists(path)) throw new ApiError({ kind: "Io", message: `${path} existe déjà` });
      workspace.set(`${path}/.keep`, "");
      changed([path]);
    },
    renamePath: async (_ws, from, to) => {
      if (exists(to)) throw new ApiError({ kind: "Io", message: `${to} existe déjà` });
      for (const [file, text] of [...workspace]) {
        if (file === from || file.startsWith(`${from}/`)) {
          workspace.delete(file);
          workspace.set(to + file.slice(from.length), text);
        }
      }
      changed([from, to]);
    },
    deletePath: async (_ws, path) => {
      for (const file of [...workspace.keys()]) {
        if (file === path || file.startsWith(`${path}/`)) workspace.delete(file);
      }
      changed([path]);
    },
    watchWorkspace: async (_ws, onChange) => void (listener = onChange),
    ask: async (message) => window.confirm(message),
    checkProject: async (_ws, project) => {
      await new Promise((r) => setTimeout(r, 400));
      return check(project);
    },
    terminalOpen: async (_ws, _cols, _rows, onOutput) => {
      let line = "";
      terminals.set(1, (data) => {
        for (const ch of data) {
          if (ch === "\r") {
            onOutput(`\r\n${line ? `(mode navigateur : « ${line} » n'est pas exécuté)\r\n` : ""}${PROMPT}`);
            line = "";
          } else if (ch === "\x7f") {
            if (line) {
              line = line.slice(0, -1);
              onOutput("\b \b");
            }
          } else {
            line += ch;
            onOutput(ch);
          }
        }
      });
      setTimeout(() => onOutput(`Terminal simulé : lance l'app pour un vrai shell.\r\n${PROMPT}`), 50);
      return 1;
    },
    terminalWrite: async (id, data) => terminals.get(id)?.(data),
    terminalResize: async () => {},
    terminalClose: async (id) => void terminals.delete(id),
    pickWorkspace: async () => "~/rust-workspace",
  };
}

const terminals = new Map<number, (data: string) => void>();
