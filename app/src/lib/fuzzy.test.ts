import { describe, expect, it } from "vitest";
import { fuzzyFilter } from "./fuzzy";

const files = ["hello/Cargo.toml", "hello/src/main.rs", "variables/src/lib.rs", "variables/Cargo.toml", "AGENTS.md"];

describe("fuzzyFilter", () => {
  it("garde les chemins qui contiennent les lettres dans l'ordre", () => {
    expect(fuzzyFilter("vlib", files)).toEqual(["variables/src/lib.rs"]);
    expect(fuzzyFilter("xyz", files)).toEqual([]);
  });

  it("met un nom de fichier qui correspond devant", () => {
    expect(fuzzyFilter("main", files)[0]).toBe("hello/src/main.rs");
    expect(fuzzyFilter("cargo", files).slice(0, 2).sort()).toEqual(["hello/Cargo.toml", "variables/Cargo.toml"]);
  });

  it("renvoie tout sans requête", () => {
    expect(fuzzyFilter("  ", files)).toEqual(files);
  });
});
