// src/utils/paraphraseEngine.ts

const WORKER_URL = "https://phrase-proxy.kandarlubis31.workers.dev";

// ✅ KAPSUL ANGKA UNIK SIMBOLIS: Dibuat unik per kata agar pemulihan data presisi
const SLANG_RULES = [
  { slang: "wkwk", token: "[#900]" },
  { slang: "bro", token: "[#901]" },
  { slang: "lu", token: "[#902]" },
  { slang: "gw", token: "[#903]" },
  { slang: "sikat", token: "[#904]" },
  { slang: "kocak", token: "[#905]" },
  { slang: "gan", token: "[#906]" }
];

export async function translate(text: string, src: string, tgt: string): Promise<string> {
  let processedText = text;

  // 1. Kunci kata slang menjadi Kapsul Angka saat berangkat dari stasiun Indonesia
  if (src === "id") {
    SLANG_RULES.forEach(rule => {
      const regex = new RegExp(`\\b${rule.slang}\\b`, "gi");
      processedText = processedText.replace(regex, rule.token);
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(`${WORKER_URL}?t=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: processedText, src, tgt }),
      signal: controller.signal,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    
    let resultText = data.result;

    // 2. Bongkar kembali kapsul angka saat mendarat di stasiun akhir Indonesia
    if (tgt === "id") {
      // Sapu bersih sisa sampah kebocoran interpolasi mesin asing jika sempat lolos atau berubah huruf
      resultText = resultText.replace(/___BRUSH___|___BORSTEL___|___SIKAT___|brush|borstel/gi, "[#904]");
      resultText = resultText.replace(/___BRO___|brother|broer/gi, "[#901]");
      resultText = resultText.replace(/___LU___|___GW___/gi, (match) => {
        return match === "___LU___" ? "[#902]" : "[#903]";
      });

      // Kembalikan token angka ke bentuk teks aslinya secara global dengan escape regex aman
      SLANG_RULES.forEach(rule => {
        // Amankan karakter [ dan ] agar dibaca sebagai string literal di constructor RegExp
        const safeToken = rule.token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(safeToken, "g");
        
        // Atur konversi balik khusus: 'gan' otomatis dipulihkan menjadi 'bro' sesuai kebutuhan UI lu
        const replacement = rule.slang === "gan" ? "bro" : rule.slang;
        resultText = resultText.replace(regex, replacement);
      });
    }

    return resultText;
  } finally {
    clearTimeout(timer);
  }
}

type TokenType = 'word' | 'whitespace' | 'punctuation';

interface Token {
  value: string;
  type: TokenType;
  lowerValue: string;
}

function tokenizeText(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < text.length) {
    const char = text[i];
    
    if (/\s/.test(char)) {
      let ws = '';
      while (i < text.length && /\s/.test(text[i])) {
        ws += text[i];
        i++;
      }
      tokens.push({ value: ws, type: 'whitespace', lowerValue: ws });
    }
    else if (/[.,\/#!$%\^&\*;:{}=\-_`~()?"'—\[\]<>!’]/.test(char)) {
      tokens.push({ value: char, type: 'punctuation', lowerValue: char });
      i++;
    }
    else {
      let word = '';
      while (i < text.length && !/\s/.test(text[i]) && !/[.,\/#!$%\^&\*;:{}=\-_`~()?"'—\[\]<>!’]/.test(text[i])) {
        word += text[i];
        i++;
      }
      tokens.push({ value: word, type: 'word', lowerValue: word.toLowerCase() });
    }
  }
  return tokens;
}

function computeLCSTable(origWords: Token[], finalWords: Token[]): number[][] {
  const m = origWords.length;
  const n = finalWords.length;
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&' + 'amp;')
    .replace(/</g, '&' + 'lt;')
    .replace(/>/g, '&' + 'gt;')
    .replace(/"/g, '&' + 'quot;')
    .replace(/'/g, '&' + '#039;');
}

export function validateInputText(text: string): { valid: boolean; error?: string } {
  const trimmed = text.trim();
  if (!trimmed) return { valid: false, error: "Teks sumber tidak boleh kosong." };

  const words = trimmed.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'—\[\]<>!’]/g, " ").split(/\s+/).filter(w => w.length > 0);
  
  if (words.length < 2) {
    return { valid: false, error: "VALIDATION_FAILED: Input terlalu pendek. Masukkan minimal 2 kata." };
  }

  const hasVowels = /[aeiouyAEIOUY]/i.test(trimmed);
  if (!hasVowels && trimmed.length > 10) {
    return { valid: false, error: "VALIDATION_FAILED: Deteksi payload tidak valid (Karakter Acak)." };
  }

  return { valid: true };
}

interface HighlightOutput {
  html: string;
  metrics: {
    sizeBytes: number;
    durationMs: number;
  };
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
  const matchedFinalWords = new Set<Token>();
  
  let i = origWords.length;
  let j = finalWords.length;
  
  while (i > 0 && j > 0) {
    if (origWords[i - 1].lowerValue === finalWords[j - 1].lowerValue) {
      matchedFinalWords.add(finalWords[j - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  let html = '';
  for (const token of allFinalTokens) {
    if (token.type === 'word') {
      if (!matchedFinalWords.has(token)) {
        html += `<span class="diff-highlight">${escapeHtml(token.value)}</span>`;
      } else {
        html += escapeHtml(token.value);
      }
    } else {
      html += escapeHtml(token.value);
    }
  }
  
  return { html, metrics: { sizeBytes, durationMs } };
}

export function initializeCooldown(
  buttonEl: HTMLButtonElement, 
  labelEl: HTMLSpanElement, 
  duration: number,
  onComplete: () => void
) {
  let timeLeft = duration;
  buttonEl.disabled = true;
  if (labelEl) labelEl.textContent = `COOLDOWN_${timeLeft.toString().padStart(2, '0')}s`;
  
  const interval = setInterval(() => {
    timeLeft--;
    if (labelEl) labelEl.textContent = `COOLDOWN_${timeLeft.toString().padStart(2, '0')}s`;
    
    if (timeLeft <= 0) {
      clearInterval(interval);
      if (labelEl) labelEl.textContent = "EXECUTE PARAPHRASE";
      buttonEl.disabled = false;
      sessionStorage.removeItem("paraphrase_cooldown");
      onComplete();
    }
  }, 1000);
}