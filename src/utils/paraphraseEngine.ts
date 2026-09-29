// src/utils/paraphraseEngine.ts — Translation engine + LCS diff + validation + cooldown

import { lockSlang, unlockSlang } from './slang';

// ── Configuration ─────────────────────────────────────────────────────

const API_MODE = import.meta.env.PUBLIC_API_MODE || "on";
const WORKER_URL = import.meta.env.PUBLIC_WORKER_URL || "https://phrase-proxy.kandarlubis31.workers.dev";
const LIBRETRANSLATE_URL = import.meta.env.PUBLIC_LIBRETRANSLATE_URL || "http://localhost:5000";

// ── Shared fetch helpers ──────────────────────────────────────────────

async function safeParseJSON(res: Response): Promise<any> {
  const text = await res.text();
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error(`Unexpected response (${res.status}): ${text.slice(0, 200)}`);
  }
  try { return JSON.parse(text); } catch {
    throw new Error(`Invalid JSON (${res.status}): ${text.slice(0, 200)}`);
  }
}

function createAbortController(signal?: AbortSignal): { controller: AbortController; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  // Store handler ref so cleanup() can deregister it (prevents listener leak
  // across the pipeline's 3 sequential translate() calls sharing one signal).
  const onAbort = () => controller.abort(signal?.reason);

  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason);
    } else {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  }

  return {
    controller,
    cleanup: () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    },
  };
}

// ── API Adapters ──────────────────────────────────────────────────────

async function fetchViaLibreTranslate(text: string, src: string, tgt: string, signal?: AbortSignal, retries = 1): Promise<string> {
  const { controller, cleanup } = createAbortController(signal);
  try {
    const res = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: src, target: tgt, format: "text" }),
      signal: controller.signal,
    });
    const data = await safeParseJSON(res);
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data.translatedText;
  } catch (err: unknown) {
    // Retry once on transient network errors (DNS blip, connection reset).
    // TypeError is thrown by fetch() for network failures only.
    // Don't retry on AbortError (user cancel / timeout) or HTTP errors.
    if (retries > 0 && err instanceof TypeError) {
      return fetchViaLibreTranslate(text, src, tgt, signal, retries - 1);
    }
    throw err;
  } finally {
    cleanup();
  }
}

async function fetchViaWorker(text: string, src: string, tgt: string, signal?: AbortSignal, retries = 1): Promise<string> {
  const { controller, cleanup } = createAbortController(signal);
  try {
    // POST requests are not cached by browsers or standard HTTP intermediaries,
    // so no cache-busting query parameter is needed.
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, src, tgt }),
      signal: controller.signal,
    });
    const data = await safeParseJSON(res);
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data.result;
  } catch (err: unknown) {
    // Retry once on transient network errors only (fetch() throws TypeError).
    if (retries > 0 && err instanceof TypeError) {
      return fetchViaWorker(text, src, tgt, signal, retries - 1);
    }
    throw err;
  } finally {
    cleanup();
  }
}

// ── translate() — Orchestrator ───────────────────────────────────────

export async function translate(text: string, src: string, tgt: string, signal?: AbortSignal): Promise<string> {
  const processedText = src === "id" ? lockSlang(text) : text;
  const resultText = API_MODE === "off"
    ? await fetchViaLibreTranslate(processedText, src, tgt, signal)
    : await fetchViaWorker(processedText, src, tgt, signal);
  return tgt === "id" ? unlockSlang(resultText) : resultText;
}

// ── Tokenizer ─────────────────────────────────────────────────────────

type TokenType = 'word' | 'whitespace' | 'punctuation';

interface Token {
  value: string;
  type: TokenType;
  lowerValue: string;
}

const PUNCT_REGEX = /[.,\/#!$%\^&\*;:{}=\-_`~()?"'—\[\]<>!’]/;

function tokenizeText(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (/\s/.test(char)) {
      let ws = '';
      while (i < text.length && /\s/.test(text[i])) ws += text[i++];
      tokens.push({ value: ws, type: 'whitespace', lowerValue: ws });
    } else if (PUNCT_REGEX.test(char)) {
      tokens.push({ value: char, type: 'punctuation', lowerValue: char });
      i++;
    } else {
      let word = '';
      while (i < text.length && !/\s/.test(text[i]) && !PUNCT_REGEX.test(text[i])) word += text[i++];
      tokens.push({ value: word, type: 'word', lowerValue: word.toLowerCase() });
    }
  }
  return tokens;
}

// ── HTML Escape (idempotent) ──────────────────────────────────────────

function escapeHtml(text: string): string {
  const unescaped = text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'");
  return unescaped
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ── LCS Diff ──────────────────────────────────────────────────────────

const MAX_LCS_CELLS = 50_000;

function computeLCSTable(origWords: Token[], finalWords: Token[]): number[][] {
  const m = origWords.length;
  const n = finalWords.length;
  if (m * n > MAX_LCS_CELLS) return [];

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origWords[i - 1].lowerValue === finalWords[j - 1].lowerValue) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

// ── Highlight output ──────────────────────────────────────────────────

interface HighlightOutput {
  html: string;
  metrics: { sizeBytes: number; durationMs: number };
}

function buildHighlightedHTML(tokens: Token[], highlightSet: Set<Token> | null): string {
  let html = '';
  for (const token of tokens) {
    const escaped = escapeHtml(token.value);
    html += (token.type === 'word' && highlightSet && !highlightSet.has(token))
      ? `<span class="diff-highlight">${escaped}</span>`
      : escaped;
  }
  return html;
}

export function highlightDifferences(originalText: string, finalText: string, startTime: number): HighlightOutput {
  const durationMs = Date.now() - startTime;
  const sizeBytes = new Blob([finalText]).size;

  if (!originalText && !finalText) return { html: '', metrics: { sizeBytes, durationMs } };
  if (!originalText) return { html: `<span class="diff-highlight">${escapeHtml(finalText)}</span>`, metrics: { sizeBytes, durationMs } };

  const allOrigTokens = tokenizeText(originalText);
  const allFinalTokens = tokenizeText(finalText);
  const origWords = allOrigTokens.filter(t => t.type === 'word');
  const finalWords = allFinalTokens.filter(t => t.type === 'word');
  const dp = computeLCSTable(origWords, finalWords);

  if (dp.length === 0) {
    return { html: buildHighlightedHTML(allFinalTokens, new Set()), metrics: { sizeBytes, durationMs } };
  }

  const matched = new Set<Token>();
  let i = origWords.length, j = finalWords.length;
  while (i > 0 && j > 0) {
    if (origWords[i - 1].lowerValue === finalWords[j - 1].lowerValue) {
      matched.add(finalWords[--j]);
      i--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return { html: buildHighlightedHTML(allFinalTokens, matched), metrics: { sizeBytes, durationMs } };
}

// ── Input Validation ──────────────────────────────────────────────────

export function validateInputText(text: string): { valid: boolean; error?: string } {
  const trimmed = text.trim();
  if (!trimmed) return { valid: false, error: "Teks sumber tidak boleh kosong." };
  if (trimmed.length > 3000) return { valid: false, error: "VALIDATION_FAILED: Input terlalu panjang. Maksimal 3000 karakter." };

  const words = trimmed.replace(PUNCT_REGEX, " ").split(/\s+/).filter(w => w.length > 0);
  if (words.length < 2) return { valid: false, error: "VALIDATION_FAILED: Input terlalu pendek. Masukkan minimal 2 kata." };

  const hasLetters = /\p{L}/u.test(trimmed);
  if (!hasLetters && trimmed.length > 10) return { valid: false, error: "VALIDATION_FAILED: Deteksi payload tidak valid (Karakter Acak)." };

  return { valid: true };
}

// ── Cooldown ──────────────────────────────────────────────────────────

export function initializeCooldown(
  buttonEl: HTMLButtonElement | null,
  labelEl: HTMLSpanElement | null,
  duration: number,
  onComplete: () => void
): () => void {
  if (!buttonEl || !labelEl || duration <= 0) { onComplete(); return () => {}; }

  let timeLeft = duration;
  buttonEl.disabled = true;
  labelEl.textContent = `COOLDOWN_${timeLeft.toString().padStart(2, '0')}s`;

  const interval = setInterval(() => {
    timeLeft--;
    labelEl.textContent = `COOLDOWN_${timeLeft.toString().padStart(2, '0')}s`;

    // Urgency pulse in last 3 seconds
    if (timeLeft <= 3 && timeLeft > 0) {
      labelEl.style.color = '#ef4444';
      labelEl.style.opacity = (timeLeft % 2 === 0) ? '0.6' : '1';
    }

    if (timeLeft <= 0) {
      clearInterval(interval);
      labelEl.textContent = "EXECUTE PARAPHRASE";
      labelEl.style.color = '';
      labelEl.style.opacity = '';
      buttonEl!.disabled = false;
      sessionStorage.removeItem("paraphrase_cooldown");
      onComplete();
    }
  }, 1000);

  return () => clearInterval(interval);
}
