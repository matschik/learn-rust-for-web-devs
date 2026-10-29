// Ce que l'app retient d'une séance à l'autre, dans le navigateur de la webview.

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`learn-rust:${key}`);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(`learn-rust:${key}`, JSON.stringify(value));
  } catch {
    // Stockage indisponible : l'app marche quand même, elle oubliera juste au prochain lancement.
  }
}
