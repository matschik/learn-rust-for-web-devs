// La recherche de l'ouverture rapide (Cmd+P) : les lettres tapées doivent apparaître dans
// l'ordre dans le chemin. Un nom de fichier qui correspond passe devant un dossier qui correspond.

function score(query: string, path: string): number | null {
  const q = query.toLowerCase();
  const p = path.toLowerCase();
  const base = p.slice(p.lastIndexOf("/") + 1);
  let i = 0;
  let total = 0;
  let last = -2;
  for (let j = 0; j < p.length && i < q.length; j++) {
    if (p[j] !== q[i]) continue;
    total += j === last + 1 ? 3 : 1; // des lettres qui se suivent valent plus
    if (j === 0 || p[j - 1] === "/" || p[j - 1] === "_" || p[j - 1] === ".") total += 2;
    last = j;
    i++;
  }
  if (i < q.length) return null;
  if (base.includes(q)) total += 20;
  if (base.startsWith(q)) total += 10;
  return total - path.length * 0.01;
}

export function fuzzyFilter(query: string, paths: string[], limit = 50): string[] {
  if (!query.trim()) return paths.slice(0, limit);
  return paths
    .map((path) => ({ path, s: score(query.trim(), path) }))
    .filter((r): r is { path: string; s: number } => r.s !== null)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((r) => r.path);
}
