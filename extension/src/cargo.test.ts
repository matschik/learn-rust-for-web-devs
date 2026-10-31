import { describe, expect, it } from "vitest";
import { cargoRootOf } from "./cargo";

describe("cargoRootOf", () => {
  const manifests = new Set(["/ws/hello/Cargo.toml", "/ws/taskr/Cargo.toml"]);
  const exists = (p: string) => manifests.has(p);

  it("trouve le projet du fichier ouvert", () => {
    expect(cargoRootOf("/ws/hello/src/main.rs", "/ws", exists)).toBe("/ws/hello");
    expect(cargoRootOf("/ws/taskr/src/models/task.rs", "/ws", exists)).toBe("/ws/taskr");
  });

  it("ne sort pas du workspace", () => {
    expect(cargoRootOf("/ws/notes.md", "/ws", exists)).toBeUndefined();
    expect(cargoRootOf("/ws2/hello/src/main.rs", "/ws", exists)).toBeUndefined();
  });
});
