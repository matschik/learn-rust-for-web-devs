// De petites pastilles par type de fichier, pour repérer d'un coup d'œil le code, la config
// et la doc dans l'arbre et les onglets.

export function fileIcon(name: string): { glyph: string; color: string } {
  if (name.endsWith(".rs")) return { glyph: "rs", color: "var(--accent)" };
  if (name === "Cargo.toml" || name === "Cargo.lock") return { glyph: "⚙", color: "var(--hl-t)" };
  if (name.endsWith(".toml")) return { glyph: "⚙", color: "var(--muted)" };
  if (name.endsWith(".md")) return { glyph: "M", color: "var(--hl-n)" };
  if (name.endsWith(".json")) return { glyph: "{}", color: "var(--hl-s)" };
  return { glyph: "·", color: "var(--muted)" };
}
