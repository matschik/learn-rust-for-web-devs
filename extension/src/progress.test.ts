import { describe, expect, it } from "vitest";
import { parse, serialize } from "./progress";

describe("progress.json", () => {
  it("fait l'aller-retour, trié et sans cases décochées", () => {
    const text = serialize({ lesson: "a/b", checks: { "a/b#z": true, "a/b#a": true, "a/b#off": false } });
    expect(text).toBe('{\n  "lesson": "a/b",\n  "checks": {\n    "a/b#a": true,\n    "a/b#z": true\n  }\n}\n');
    expect(parse(text)).toEqual({ lesson: "a/b", checks: { "a/b#a": true, "a/b#z": true } });
  });

  it("repart de zéro sur un fichier abîmé", () => {
    expect(parse("{oups")).toEqual({ lesson: null, checks: {} });
    expect(parse('{"lesson": 3, "checks": "non"}')).toEqual({ lesson: null, checks: {} });
  });
});
