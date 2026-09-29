// src/client/streamRenderer.ts — Token-based text streaming to DOM
// Uses requestAnimationFrame with a 16ms throttle to deliver consistent
// ~200 tokens/sec streaming speed regardless of monitor refresh rate,
// while staying synced with the browser paint cycle for smooth visuals.

import { DAYS } from './constants';

export interface StreamMetrics {
  sizeBytes: number;
  durationMs: number;
}

const BATCH_SIZE = 3;
/** Throttle to ~60 fps so streaming speed is identical on 60/120/144Hz displays. */
const TICK_MS = 16;

/**
 * Stream HTML tokens into a target element character-by-character.
 * Each tick inserts up to BATCH_SIZE tokens via a single insertAdjacentHTML
 * call. rAF keeps DOM mutations aligned with the paint cycle; the 16ms
 * throttle ensures identical visual speed on any refresh rate.
 *
 * Accepts an optional AbortSignal to cancel streaming mid-flight.
 */
export function streamText(
  target: HTMLElement,
  statusEl: HTMLElement | null,
  html: string,
  metrics: StreamMetrics,
  signal?: AbortSignal,
): void {
  target.replaceChildren();

  const tokens = html.split(
    /(<span class="diff-highlight">.*?<\/span>|\s+)/g,
  );
  let tokenIdx = 0;
  let lastTick = 0;

  if (statusEl) {
    statusEl.textContent = `:: STREAMING_OUTPUT [SIZE: ${metrics.sizeBytes}B]`;
    statusEl.style.color = '#f59e0b';
  }

  function step(now: number): void {
    // Abort if signal fired or target detached from DOM
    if (signal?.aborted || !target.isConnected) return;

    // Throttle: only process tokens every TICK_MS, regardless of refresh rate
    if (now - lastTick < TICK_MS) {
      requestAnimationFrame(step);
      return;
    }
    lastTick = now;

    let chunk = '';
    for (let b = 0; b < BATCH_SIZE && tokenIdx < tokens.length; b++) {
      chunk += tokens[tokenIdx++];
    }

    if (chunk) {
      target.insertAdjacentHTML('beforeend', chunk);
    }

    if (tokenIdx < tokens.length) {
      requestAnimationFrame(step);
    } else if (statusEl) {
      const d = new Date();
      statusEl.textContent = `// EVAL_SUCCESS [${DAYS[d.getDay()]}] [SIZE: ${metrics.sizeBytes}B] [LATENCY: ${metrics.durationMs}ms]`;
      statusEl.style.color = '#10b981';
    }
  }

  requestAnimationFrame(step);
}
