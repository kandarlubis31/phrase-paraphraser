// src/client/storage.ts — localStorage & sessionStorage helpers

const KEYS = {
  input: 'paraphrase_input',
  output: 'paraphrase_output',
  nl: 'paraphrase_nl',
  en: 'paraphrase_en',
  cooldown: 'paraphrase_cooldown',
} as const;

export interface SavedState {
  input: string;
  nl: string;
  en: string;
  output: string;
}

/** Persist current input text to localStorage */
export function saveInput(text: string): void {
  localStorage.setItem(KEYS.input, text);
}

/** Retrieve saved input text */
export function loadInput(): string | null {
  return localStorage.getItem(KEYS.input);
}

/** Persist full paraphrase pipeline results */
export function saveResults(state: SavedState): void {
  localStorage.setItem(KEYS.input, state.input);
  localStorage.setItem(KEYS.nl, state.nl);
  localStorage.setItem(KEYS.en, state.en);
  localStorage.setItem(KEYS.output, state.output);
}

/** Retrieve saved paraphrase results. Returns null if no saved output. */
export function loadResults(): SavedState | null {
  const output = localStorage.getItem(KEYS.output);
  if (!output) return null;
  return {
    input: localStorage.getItem(KEYS.input) ?? '',
    nl: localStorage.getItem(KEYS.nl) ?? '',
    en: localStorage.getItem(KEYS.en) ?? '',
    output,
  };
}

/** Clear only paraphrase-related keys from localStorage */
export function clearAll(): void {
  localStorage.removeItem(KEYS.input);
  localStorage.removeItem(KEYS.output);
  localStorage.removeItem(KEYS.nl);
  localStorage.removeItem(KEYS.en);
}

/** Get remaining cooldown seconds. Returns 0 if expired, not set, or corrupted. */
export function getCooldownRemaining(): number {
  const expiry = sessionStorage.getItem(KEYS.cooldown);
  if (!expiry) return 0;
  const parsed = parseInt(expiry, 10);
  if (isNaN(parsed)) return 0;
  return Math.max(0, Math.ceil((parsed - Date.now()) / 1000));
}

/** Set cooldown expiry timestamp (duration in ms from now) */
export function setCooldown(durationMs: number): void {
  sessionStorage.setItem(KEYS.cooldown, (Date.now() + durationMs).toString());
}

