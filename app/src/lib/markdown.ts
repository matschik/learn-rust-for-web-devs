// Rendu markdown minimal des leçons, repris du dashboard du repo (dashboard/index.html) :
// titres, paragraphes, listes, tableaux, citations, blocs de code colorés.

export function esc(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
}

export function inline(s: string): string {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

const KEYWORDS: Record<string, string> = {
  rust: "as break const continue crate else enum false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while dyn async await",
  ts: "as async await break class const continue else export extends false for from function if implements import in interface let new null of private public readonly return static this true type undefined var while",
};
const TYPES = /^(i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|string|number|boolean|void|[A-Z]\w*)$/;

/** Coloration des blocs ```rust et ```ts, et des messages de rustc. */
export function highlight(code: string, lang: string): string {
  if (lang === "rust" || lang === "ts") {
    const keywords = new Set(KEYWORDS[lang].split(" "));
    // En Rust, 'a est une lifetime et 'x' un caractère ; en TS, '…' et `…` sont des chaînes.
    const strings =
      lang === "rust"
        ? String.raw`"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\\n])'`
        : String.raw`"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\\n])*'|` + "`(?:\\\\.|[^`\\\\])*`";
    const token = new RegExp(
      String.raw`(\/\/[^\n]*)|(${strings})|('[a-z_]\w*)|(#!?\[[^\]\n]*\])|(\b\d[\d_]*(?:\.\d+)?(?:[iuf]\d+|usize|isize)?\b)|(\b\w+!)|(\b[A-Za-z_]\w*\b)`,
      "g",
    );
    let html = "";
    let last = 0;
    for (const m of code.matchAll(token)) {
      html += esc(code.slice(last, m.index));
      last = (m.index ?? 0) + m[0].length;
      const [t, comment, str, lifetime, attr, num, mac, word] = m;
      const cls = comment ? "c" : str ? "s" : lifetime ? "m" : attr ? "a" : num ? "n" : mac ? "m"
        : keywords.has(word) ? "k" : TYPES.test(word ?? "") ? "t" : "";
      html += cls ? `<span class="hl-${cls}">${esc(t)}</span>` : esc(t);
    }
    return html + esc(code.slice(last));
  }
  if (/^(error|warning|thread)/m.test(code)) return highlightCompiler(code);
  return esc(code);
}

/** Sortie du compilateur : l'erreur en rouge, l'aide en vert, la marge et les flèches en retrait. */
export function highlightCompiler(code: string): string {
  return code
    .split("\n")
    .map((l) => {
      let m: RegExpMatchArray | null;
      if ((m = l.match(/^(error(?:\[E\d+\])?|warning)(:.*)$/))) return `<span class="hl-err">${esc(m[1])}</span>${esc(m[2])}`;
      if ((m = l.match(/^(thread .*panicked.*)$/))) return `<span class="hl-err">${esc(m[1])}</span>`;
      if ((m = l.match(/^(test .* \.\.\. )(ok|FAILED)$/)))
        return `${esc(m[1])}<span class="${m[2] === "ok" ? "hl-ok" : "hl-err"}">${m[2]}</span>`;
      if ((m = l.match(/^(\s*(?:= )?)(help|note)(:.*)$/))) return `${esc(m[1])}<span class="hl-help">${esc(m[2])}</span>${esc(m[3])}`;
      if ((m = l.match(/^(\s*-->.*|\s*\d*\s*\||\s*\.\.\.)(.*)$/))) {
        // Les ^^^ et +++ ne sont des repères que sous une ligne de code, dans une marge sans numéro.
        const rest = /\d/.test(m[1])
          ? esc(m[2])
          : esc(m[2]).replace(/(\^+)/g, '<span class="hl-err">$1</span>').replace(/(\++)/g, '<span class="hl-help">$1</span>');
        return `<span class="hl-dim">${esc(m[1])}</span>${rest}`;
      }
      return esc(l);
    })
    .join("\n");
}

/** Une case à cocher d'étape : sa clé (leçon + texte) et son état. */
export type CheckState = { key: (text: string) => string; checked: (key: string) => boolean };

export function markdown(md: string, checks?: CheckState): string {
  const lines = md.replace(/\r/g, "").split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; ) {
    const line = lines[i];
    if (/^!\[[^\]]*\]\([^)]+\)\s*$/.test(line)) {
      // Les schémas SVG des leçons viendront avec le contenu embarqué dans l'app.
      i++;
    } else if (line.startsWith("```")) {
      const code: string[] = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) code.push(lines[i]);
      out.push(`<pre><code>${highlight(code.join("\n"), line.slice(3).trim())}</code></pre>`);
      i++;
    } else if (/^#{1,6} /.test(line)) {
      const level = (line.match(/^#+/) ?? [""])[0].length;
      out.push(`<h${level}>${inline(line.slice(level + 1))}</h${level}>`);
      i++;
    } else if (line.startsWith("|")) {
      const rows: string[] = [];
      for (; i < lines.length && lines[i].startsWith("|"); i++) rows.push(lines[i]);
      const cells = (r: string) => r.slice(1, r.endsWith("|") ? -1 : undefined).split("|").map((c) => c.trim());
      const body = rows.slice(2).map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("");
      out.push(`<table><thead><tr>${cells(rows[0]).map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>`);
    } else if (/^\s*([-*]|\d+\.) /.test(line)) {
      const ordered = /^\s*\d+\. /.test(line);
      const items: string[] = [];
      for (; i < lines.length && /^\s*([-*]|\d+\.) /.test(lines[i]); i++) items.push(lines[i].replace(/^\s*([-*]|\d+\.) /, ""));
      if (!ordered && items.every((it) => /^\[[ x]\] /.test(it))) {
        out.push(`<ul class="checks">${items.map((it) => checkbox(it.slice(4), checks)).join("")}</ul>`);
      } else {
        const tag = ordered ? "ol" : "ul";
        out.push(`<${tag}>${items.map((it) => `<li>${inline(it)}</li>`).join("")}</${tag}>`);
      }
    } else if (line.startsWith(">")) {
      // Un bloc « > **Réponses** » se replie, pour répondre de tête avant de lire.
      const quote: string[] = [];
      for (; i < lines.length && lines[i].startsWith(">"); i++) quote.push(lines[i].replace(/^> ?/, ""));
      const answer = quote[0].match(/^\*\*(Réponses?)\*\*\s*$/);
      out.push(
        answer
          ? `<details class="answer"><summary>Voir les ${answer[1] === "Réponse" ? "réponse" : "réponses"}</summary>${markdown(quote.slice(1).join("\n"))}</details>`
          : `<div class="callout">${markdown(quote.join("\n"))}</div>`,
      );
    } else if (line.trim() === "") {
      i++;
    } else {
      const para: string[] = [];
      for (; i < lines.length && lines[i].trim() !== "" && !/^(#|```|\||!\[|>|\s*([-*]|\d+\.) )/.test(lines[i]); i++) para.push(lines[i]);
      out.push(`<p>${inline(para.join(" "))}</p>`);
    }
  }
  return out.join("\n");
}

function checkbox(text: string, checks?: CheckState): string {
  if (!checks) return `<li>${inline(text)}</li>`;
  const key = checks.key(text);
  const on = checks.checked(key);
  return `<li class="${on ? "on" : ""}"><label><input type="checkbox" data-key="${esc(key)}"${on ? " checked" : ""}><span>${inline(text)}</span></label></li>`;
}

/** Retire le titre `# …` d'une fiche : l'app l'affiche à part. */
export function withoutTitle(md: string): string {
  return md.replace(/^# .*\n+/, "");
}
