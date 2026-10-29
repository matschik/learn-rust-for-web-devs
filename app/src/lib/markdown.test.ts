import { describe, expect, it } from "vitest";
import { highlight, highlightCompiler, inline, markdown, withoutTitle } from "./markdown";

describe("markdown", () => {
  it("rend le code en ligne, le gras et les liens", () => {
    expect(inline("`let` **mut** [doc](https://doc.rust-lang.org)")).toBe(
      '<code>let</code> <strong>mut</strong> <a href="https://doc.rust-lang.org" target="_blank" rel="noopener">doc</a>',
    );
  });

  it("échappe le HTML", () => {
    expect(inline("<script>")).toBe("&lt;script&gt;");
  });

  it("replie le bloc Réponses", () => {
    const html = markdown("> **Réponses**\n> 1. Oui");
    expect(html).toContain('<details class="answer"><summary>Voir les réponses</summary>');
  });

  it("transforme les étapes en cases à cocher", () => {
    const html = markdown("- [ ] Lance `cargo new`", { key: (t) => `l#${t}`, checked: () => true });
    expect(html).toContain('data-key="l#Lance `cargo new`"');
    expect(html).toContain("checked");
  });

  it("colore les mots-clés Rust", () => {
    expect(highlight("let mut n = 1;", "rust")).toContain('<span class="hl-k">let</span>');
  });

  it("colore la sortie de cargo test", () => {
    const html = highlightCompiler("error[E0384]: cannot assign twice\ntest one ... ok");
    expect(html).toContain('<span class="hl-err">error[E0384]</span>');
    expect(html).toContain('<span class="hl-ok">ok</span>');
  });

  it("retire le titre de la fiche", () => {
    expect(withoutTitle("# 02 - Variables · cours\n\nIntro")).toBe("Intro");
  });
});
