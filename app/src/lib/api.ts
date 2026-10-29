// La seule porte entre le front et le reste du monde.
//
// Dans l'app, chaque appel passe par une commande Tauri typée (`bindings.ts`, généré par
// tauri-specta). Dans un simple navigateur (`pnpm dev`), `mock.ts` répond à la place : on
// peut ainsi développer et tester l'interface sans lancer l'app, y compris avec Playwright.

import { Channel } from "@tauri-apps/api/core";
import { commands, type AppError, type CheckResult, type Entry, type Lesson, type Module } from "./bindings";

export type { CheckResult, Entry, Lesson, Module };

export interface Api {
  listModules(): Promise<Module[]>;
  readLesson(moduleId: string, lessonId: string): Promise<Lesson>;
  listDir(workspace: string, path: string): Promise<Entry[]>;
  readFile(workspace: string, path: string): Promise<string>;
  writeFile(workspace: string, path: string, content: string): Promise<void>;
  /** Tous les fichiers, pour l'ouverture rapide. */
  listFiles(workspace: string): Promise<string[]>;
  createFile(workspace: string, path: string): Promise<void>;
  createDir(workspace: string, path: string): Promise<void>;
  renamePath(workspace: string, from: string, to: string): Promise<void>;
  /** Envoie à la corbeille. */
  deletePath(workspace: string, path: string): Promise<void>;
  /** `onChange` reçoit les chemins modifiés dans le workspace, par l'app, le terminal ou une IA. */
  watchWorkspace(workspace: string, onChange: (paths: string[]) => void): Promise<void>;
  /** Une question oui/non, dans une vraie boîte de dialogue. */
  ask(message: string): Promise<boolean>;
  checkProject(workspace: string, project: string): Promise<CheckResult>;
  terminalOpen(workspace: string, cols: number, rows: number, onOutput: (text: string) => void): Promise<number>;
  terminalWrite(id: number, data: string): Promise<void>;
  terminalResize(id: number, cols: number, rows: number): Promise<void>;
  terminalClose(id: number): Promise<void>;
  /** Le workspace imposé par `LEARN_RUST_WORKSPACE`, s'il y en a un. */
  defaultWorkspace(): Promise<string | null>;
  /** Ouvre le sélecteur de dossier ; `null` si l'apprenant annule. */
  pickWorkspace(): Promise<string | null>;
}

export class ApiError extends Error {
  constructor(readonly error: AppError) {
    super(error.message);
  }
}

async function unwrap<T>(call: Promise<{ status: "ok"; data: T } | { status: "error"; error: AppError }>): Promise<T> {
  const result = await call;
  if (result.status === "error") throw new ApiError(result.error);
  return result.data;
}

const tauriApi: Api = {
  listModules: () => unwrap(commands.listModules()),
  readLesson: (m, l) => unwrap(commands.readLesson(m, l)),
  defaultWorkspace: () => commands.defaultWorkspace(),
  listDir: (ws, path) => unwrap(commands.listDir(ws, path)),
  readFile: (ws, path) => unwrap(commands.readFile(ws, path)),
  writeFile: async (ws, path, content) => void (await unwrap(commands.writeFile(ws, path, content))),
  listFiles: (ws) => unwrap(commands.listFiles(ws)),
  createFile: async (ws, path) => void (await unwrap(commands.createFile(ws, path))),
  createDir: async (ws, path) => void (await unwrap(commands.createDir(ws, path))),
  renamePath: async (ws, from, to) => void (await unwrap(commands.renamePath(ws, from, to))),
  deletePath: async (ws, path) => void (await unwrap(commands.deletePath(ws, path))),
  watchWorkspace: async (ws, onChange) => {
    const channel = new Channel<string[]>();
    channel.onmessage = onChange;
    await unwrap(commands.watchWorkspace(ws, channel));
  },
  ask: async (message) => {
    const { ask } = await import("@tauri-apps/plugin-dialog");
    return ask(message, { title: "Learn Rust", kind: "warning" });
  },
  checkProject: (ws, project) => unwrap(commands.checkProject(ws, project)),
  terminalOpen: (ws, cols, rows, onOutput) => {
    const channel = new Channel<string>();
    channel.onmessage = onOutput;
    return unwrap(commands.terminalOpen(ws, cols, rows, channel));
  },
  terminalWrite: async (id, data) => void (await unwrap(commands.terminalWrite(id, data))),
  terminalResize: async (id, cols, rows) => void (await unwrap(commands.terminalResize(id, cols, rows))),
  terminalClose: async (id) => void (await unwrap(commands.terminalClose(id))),
  pickWorkspace: async () => {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const dir = await open({ directory: true, title: "Choisis ton workspace Rust" });
    return typeof dir === "string" ? dir : null;
  },
};

export const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

let api: Promise<Api> | undefined;
export function getApi(): Promise<Api> {
  api ??= isTauri ? Promise.resolve(tauriApi) : import("./mock").then((m) => m.mockApi());
  return api;
}
