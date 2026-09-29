// src/client/paraphraseController.ts — Main orchestrator for the paraphrase UI

import {
  highlightDifferences,
  initializeCooldown,
  validateInputText,
} from '../utils/paraphraseEngine';
import {
  saveInput,
  loadInput,
  loadResults,
  clearAll,
  getCooldownRemaining,
} from './storage';
import { getDOMElements, type DOMElements } from './dom';
import { executePipeline, getAbortController } from './pipeline';
import { DAYS, MAX_INPUT_LENGTH, TOAST_DURATION_MS, CLOCK_INTERVAL_MS } from './constants';

// ── Module‑level state ───────────────────────────────────────────────

let initialized = false;
let isProcessing = false;
let dom: DOMElements;
let scrollHandler: (() => void) | null = null;
let clockInterval: ReturnType<typeof setInterval> | null = null;
let cancelTimer: ReturnType<typeof setTimeout> | null = null;

// ── UI helpers (exported for pipeline access) ─────────────────────────

function showToast(message: string): void {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  const newToast = toast.cloneNode(true) as HTMLDivElement;
  newToast.textContent = message;
  newToast.classList.remove('hidden');
  toast.parentNode?.replaceChild(newToast, toast);
  setTimeout(() => newToast.classList.add('hidden'), TOAST_DURATION_MS);
}

function toggleElement(id: string, show: boolean): void {
  document.getElementById(id)?.classList.toggle('hidden', !show);
}

const showEmptyState = () => toggleElement('emptyState', true);
const hideEmptyState = () => toggleElement('emptyState', false);
const showSkeleton    = () => { const el = document.getElementById('skeletonLoading'); el?.classList.remove('hidden'); el?.setAttribute('aria-busy', 'true'); };
const hideSkeleton    = () => { const el = document.getElementById('skeletonLoading'); el?.classList.add('hidden'); el?.setAttribute('aria-busy', 'false'); };

function setLoading(on: boolean): void {
  if (isProcessing === on) return;
  isProcessing = on;
  if (on) {
    dom.btn.classList.add('cancelling');
    if (dom.btnLabel) dom.btnLabel.textContent = 'CANCEL PIPELINE';
    dom.btnSpinner?.classList.add('hidden');
    dom.linearProgress?.classList.remove('hidden');
  } else {
    dom.btn.classList.remove('cancelling');
    if (dom.btnLabel) dom.btnLabel.textContent = 'EXECUTE PARAPHRASE';
    dom.btn.disabled = false;
    dom.btnSpinner?.classList.add('hidden');
    dom.linearProgress?.classList.add('hidden');
  }
}

function showError(msg: string): void {
  if (dom.errorBox) {
    const isSafe = msg.startsWith('VALIDATION_FAILED') || msg.startsWith('Teks sumber');
    dom.errorBox.textContent = `[ERROR] ${isSafe ? msg : 'Gagal menghubungi server. Coba lagi nanti.'}`;
    dom.errorBox.classList.remove('hidden');
  }
  hideResults();
}
const hideError  = () => dom.errorBox?.classList.add('hidden');
const showResults = () => { if (dom.results) dom.results.style.setProperty('display', 'flex', 'important'); hideEmptyState(); };
const hideResults = () => { if (dom.results) dom.results.style.setProperty('display', 'none', 'important'); };

function resetBadges(): void {
  [1, 2, 3].forEach((i) => {
    const badge = document.getElementById(`badge-${i}`);
    const statusSpan = document.getElementById(`status-${i}`);
    const textSpan = document.getElementById(`progress-text-${i}`);
    badge?.classList.remove('loading', 'done', 'error');
    if (statusSpan) { statusSpan.textContent = ''; statusSpan.style.animation = 'none'; statusSpan.style.color = ''; }
    if (textSpan) textSpan.textContent = '';
  });
  dom.nodeNl?.classList.remove('processing');
  dom.nodeEn?.classList.remove('processing');
  dom.nodeFinal?.classList.remove('processing');
}

function handleCharCount(): void {
  if (dom.charCount) dom.charCount.textContent = `${dom.textarea.value.length} / ${MAX_INPUT_LENGTH} EOF`;
  saveInput(dom.textarea.value);
}

// ── Cancel pipeline ──────────────────────────────────────────────────

function cancelPipeline(): void {
  if (cancelTimer) clearTimeout(cancelTimer);

  const ac = getAbortController();
  if (ac) { ac.abort(); }

  // Brief feedback before resetting UI so the user sees acknowledgement
  if (dom.btnLabel) dom.btnLabel.textContent = 'CANCELLED...';
  showToast('✕ PIPELINE CANCELLED');
  const status3 = document.getElementById('status-3');
  if (status3) { status3.textContent = '// CANCELLED'; status3.style.color = '#737373'; }
  if (dom.dropdown) dom.dropdown.open = true;

  cancelTimer = setTimeout(() => {
    cancelTimer = null;
    setLoading(false);
    hideSkeleton();
    hideResults();
    showEmptyState();
    resetBadges();
  }, 600);
}

// ── Restore saved state ──────────────────────────────────────────────

function restoreSavedState(): void {
  const saved = loadResults();
  if (!saved) return;
  showResults();
  const t0 = document.getElementById('progress-text-0');
  const t1 = document.getElementById('progress-text-1');
  const t2 = document.getElementById('progress-text-2');
  const t3 = document.getElementById('progress-text-3');
  const s3 = document.getElementById('status-3');
  if (t0) t0.textContent = saved.input;
  if (t1) t1.textContent = saved.nl;
  if (t2) t2.textContent = saved.en;
  if (t3) {
    const resObj = highlightDifferences(saved.input, saved.output, Date.now() - 450);
    t3.innerHTML = resObj.html;
    if (s3) {
      s3.textContent = `// EVAL_SUCCESS [${DAYS[new Date().getDay()]}] [SIZE: ${resObj.metrics.sizeBytes}B] [LATENCY: ${resObj.metrics.durationMs}ms]`;
      s3.style.color = '#10b981';
    }
  }
  [1, 2, 3].forEach((i) => document.getElementById(`badge-${i}`)?.classList.add('done'));
}

// ── Live clock ───────────────────────────────────────────────────────

function startClock(): void {
  if (!dom.liveClockEl) return;
  const updateClock = () => {
    const now = new Date();
    dom.liveClockEl!.textContent = `${DAYS[now.getDay()]} ${now.toTimeString().split(' ')[0]}`;
  };
  updateClock();
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(updateClock, CLOCK_INTERVAL_MS);
}

// ── Handle execute / cancel ──────────────────────────────────────────

async function handleParaphrase(): Promise<void> {
  if (isProcessing) { cancelPipeline(); return; }

  const cooldownRemaining = getCooldownRemaining();
  if (cooldownRemaining > 0) {
    showToast(`✕ ANTRIAN PADAT: COOLDOWN_${cooldownRemaining.toString().padStart(2, '0')}s`);
    return;
  }

  const text = dom.textarea.value.trim();
  const validation = validateInputText(text);
  if (!validation.valid) { showError(validation.error ?? 'Input tidak valid.'); return; }

  await executePipeline(dom, {
    setLoading, hideError, showError, showSkeleton, hideSkeleton,
    showResults, hideResults, hideEmptyState, showEmptyState, resetBadges,
    onComplete: () => { isProcessing = false; },
  });
}

// ── Initialisation ───────────────────────────────────────────────────

export function initParaphraser(): void {
  if (initialized) return;
  initialized = true;

  const elements = getDOMElements();
  if (!elements) return;
  dom = elements;

  hideResults();
  startClock();

  const savedInput = loadInput();
  if (savedInput) { dom.textarea.value = savedInput; handleCharCount(); }

  const saved = loadResults();
  saved ? restoreSavedState() : showEmptyState();

  const cooldownRemaining = getCooldownRemaining();
  if (cooldownRemaining > 0) {
    isProcessing = true;
    initializeCooldown(dom.btn, dom.btnLabel!, cooldownRemaining, () => { isProcessing = false; });
  }

  // ── Event wiring ──
  dom.textarea.addEventListener('input', handleCharCount);
  dom.textarea.addEventListener('paste', () => {
    setTimeout(() => { handleCharCount(); showToast('✓ TEKS BERHASIL DITEMPEL'); }, 50);
  });
  dom.textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); dom.btn.click(); }
  });
  dom.btn.addEventListener('click', handleParaphrase);
  dom.clearBtn?.addEventListener('click', () => {
    dom.textarea.value = ''; handleCharCount(); hideError(); resetBadges();
    clearAll(); hideSkeleton(); showEmptyState(); showToast('✕ KALIMAT DIBERSIHKAN'); hideResults();
  });
  dom.pasteBtn?.addEventListener('click', async () => {
    try { dom.textarea.value = await navigator.clipboard.readText(); handleCharCount(); showToast('✓ TEKS BERHASIL DITEMPEL'); } catch { /* denied */ }
  });
  dom.goUpBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
  scrollHandler = () => { const scrolled = document.body.scrollTop > 400 || document.documentElement.scrollTop > 400; dom.goUpBtn?.classList.toggle('hidden', !scrolled); };
  window.addEventListener('scroll', scrollHandler);
  if (dom.copyBtn) {
    dom.copyBtn.replaceWith(dom.copyBtn.cloneNode(true));
    const freshCopyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
    freshCopyBtn?.addEventListener('click', () => {
      const resultText = document.getElementById('progress-text-3');
      if (!resultText?.textContent) return;
      navigator.clipboard.writeText(resultText.textContent);
      const orig = freshCopyBtn.textContent;
      freshCopyBtn.textContent = 'COPIED';
      setTimeout(() => { freshCopyBtn.textContent = orig; }, 2000);
    });
  }
}
