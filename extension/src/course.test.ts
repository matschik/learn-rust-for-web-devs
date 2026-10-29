import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { listModules, neighbour, readLesson, stepKeys, titleOf } from "./course";

// Les vraies leçons du repo : le test casse si une fiche perd son titre ou ses étapes.
const root = fileURLToPath(new URL("../../modules", import.meta.url));

describe("titleOf", () => {
  it("garde le nom de la leçon ou du module", () => {
    expect(titleOf("# 02 - Variables · let, mut\n", "x")).toBe("Variables");
    expect(titleOf("# Module 01 : Prise en main\n", "x")).toBe("Prise en main");
    expect(titleOf("pas de titre", "repli")).toBe("repli");
  });
});

describe("le cours", () => {
  const modules = listModules(root);

  it("liste les modules et leurs leçons dans l'ordre", () => {
    expect(modules[0].id).toBe("01-prise-en-main");
    expect(modules[0].lessons[0]).toEqual({ id: "01-cargo", title: "Hello, cargo" });
    expect(modules.every((m) => m.lessons.length > 0)).toBe(true);
  });

  it("lit une leçon et ses étapes", () => {
    const lesson = readLesson(root, "01-prise-en-main", "01-cargo");
    expect(lesson?.title).toBe("Hello, cargo");
    expect(stepKeys(lesson!).length).toBeGreaterThan(3);
    expect(stepKeys(lesson!)[0]).toMatch(/^01-prise-en-main\/01-cargo#/);
  });

  it("refuse de sortir du cours", () => {
    expect(readLesson(root, "..", "01-cargo")).toBeUndefined();
    expect(readLesson(root, "01-prise-en-main", "../../etc")).toBeUndefined();
  });

  it("enchaîne les leçons d'un module à l'autre", () => {
    const lastOfFirst = `${modules[0].id}/${modules[0].lessons.at(-1)!.id}`;
    expect(neighbour(modules, lastOfFirst, 1)).toBe(`${modules[1].id}/${modules[1].lessons[0].id}`);
    expect(neighbour(modules, "01-prise-en-main/01-cargo", -1)).toBeUndefined();
  });
});
