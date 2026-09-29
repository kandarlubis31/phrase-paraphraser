// src/client/pipeline.ts — Paraphrase pipeline execution logic

import {
  translate,
  highlightDifferences,
  initializeCooldown,
} from '../utils/paraphraseEngine';
import { saveResults, setCooldown } from './storage';
import type { DOMElements } from './dom';
import { streamText } from './streamRenderer';
import { COOLDOWN_MS, COOLDOWN_SECS } from './constants';

type BadgeStatus = 'loading' | 'done' | 'error';

// ── State shared with controller ────────────────────────────────────

export let abortController: AbortController | null = null;

export function getAbortController(): AbortController | null { return abortController; }

// ── Badge helpers ───────────────────────────────────────────────────

function updateBadge(stepIdx: number, status: BadgeStatus): void {
  const badge = document.getElementById(`badge-${stepIdx}`);
  const statusSpan = document.getElementById(`status-${stepIdx}`);
  if (!badge || !statusSpan) return;
  badge.classList.remove('loading', 'done', 'error');
  badge.classList.add(status);
  if (status === 'loading') { statusSpan.textContent = ' ..'; statusSpan.style.color = ''; }
  else if (status === 'done') { statusSpan.textContent = ' OK'; statusSpan.style.color = '#10b981'; }
  else { statusSpan.textContent = ' ERR'; statusSpan.style.color = '#ef4444'; }
}

function resetProcessingNodes(dom: DOMElements): void {
  dom.nodeNl?.classList.remove('processing');
  dom.nodeEn?.classList.remove('processing');
  dom.nodeFinal?.classList.remove('processing');
}

function markFailedBadges(): void {
  [1, 2, 3].forEach((i) => {
    const badge = document.getElementById(`badge-${i}`);
    if (badge?.classList.contains('loading')) updateBadge(i, 'error');
  });
}

// ── Status line helpers ─────────────────────────────────────────────

function setStatus(el: HTMLElement | null, text: string, color: string): void {
  if (!el) return;
  el.textContent = text;
  el.style.color = color;
}

// ── Pipeline execution ──────────────────────────────────────────────

export async function executePipeline(
  dom: DOMElements,
  helpers: {
    setLoading: (on: boolean) => void;
    hideError: () => void;
    showError: (msg: string) => void;
    showSkeleton: () => void;
    hideSkeleton: () => void;
    showResults: () => void;
    hideResults: () => void;
    hideEmptyState: () => void;
    showEmptyState: () => void;
    resetBadges: () => void;
    onComplete: () => void;
  },
): Promise<void> {
  const text = dom.textarea.value.trim();

  abortController = new AbortController();
  const signal = abortController.signal;
  const pipelineStartTime = Date.now();

  helpers.setLoading(true);
  helpers.hideError();
  helpers.resetBadges();
  helpers.hideResults();
  helpers.hideEmptyState();
  helpers.showSkeleton();

  if (dom.dropdown) dom.dropdown.open = false;

  const status3 = document.getElementById('status-3');

  try {
    const text0 = document.getElementById('progress-text-0');
    if (text0) text0.textContent = text;

    helpers.showResults();
    helpers.hideSkeleton();
    setTimeout(() => dom.results?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);

    // ── Step 1: ID → NL ──
    setStatus(status3, ':: FETCH_PIPELINE (1/3) [nl]', '#a3a3a3');
    updateBadge(1, 'loading');
    dom.nodeNl?.classList.add('processing');
    const nlText = await translate(text, 'id', 'nl', signal);
    const text1 = document.getElementById('progress-text-1');
    if (text1) text1.textContent = nlText;
    updateBadge(1, 'done');
    dom.nodeNl?.classList.remove('processing');

    // ── Step 2: NL → EN ──
    setStatus(status3, ':: FETCH_PIPELINE (2/3) [en]', '#a3a3a3');
    updateBadge(2, 'loading');
    dom.nodeEn?.classList.add('processing');
    const enText = await translate(nlText, 'nl', 'en', signal);
    const text2 = document.getElementById('progress-text-2');
    if (text2) text2.textContent = enText;
    updateBadge(2, 'done');
    dom.nodeEn?.classList.remove('processing');

    // ── Step 3: EN → ID ──
    setStatus(status3, ':: INTEGRATE_PIPELINE (3/3) [id_final]', '#a3a3a3');
    updateBadge(3, 'loading');
    dom.nodeFinal?.classList.add('processing');
    const idText = await translate(enText, 'en', 'id', signal);
    const text3 = document.getElementById('progress-text-3');

    const diffObject = highlightDifferences(text, idText, pipelineStartTime);
    updateBadge(3, 'done');
    dom.nodeFinal?.classList.remove('processing');

    saveResults({ input: text, nl: nlText, en: enText, output: idText });

    if (text3) streamText(text3, status3, diffObject.html, diffObject.metrics, signal);

    setCooldown(COOLDOWN_MS);
    initializeCooldown(dom.btn, dom.btnLabel!, COOLDOWN_SECS, () => {
      helpers.onComplete();
    });

    setTimeout(() => dom.results?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') return;

    helpers.setLoading(false);
    helpers.showError(err instanceof Error ? err.message : String(err));
    if (dom.dropdown) dom.dropdown.open = true;
    setStatus(status3, '// EVAL_FAILED', '#ef4444');
    markFailedBadges();
    resetProcessingNodes(dom);
  } finally {
    abortController = null;
  }
}
