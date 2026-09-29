// src/client/dom.ts — DOM element cache (lazy singleton)

export interface DOMElements {
  textarea: HTMLTextAreaElement;
  btn: HTMLButtonElement;
  // Non-critical elements below — may be null if HTML template changes
  btnLabel: HTMLSpanElement | null;
  btnSpinner: HTMLSpanElement | null;
  charCount: HTMLSpanElement | null;
  errorBox: HTMLDivElement | null;
  results: HTMLDivElement | null;
  copyBtn: HTMLButtonElement | null;
  dropdown: HTMLDetailsElement | null;
  linearProgress: HTMLDivElement | null;
  pasteBtn: HTMLButtonElement | null;
  clearBtn: HTMLButtonElement | null;
  goUpBtn: HTMLButtonElement | null;
  nodeNl: Element | null;
  nodeEn: Element | null;
  nodeFinal: Element | null;
  liveClockEl: HTMLElement | null;
}

/**
 * Get all DOM element references needed by the paraphraser.
 * Returns null if critical elements (textarea, button) are missing.
 */
export function getDOMElements(): DOMElements | null {
  const textarea = document.getElementById('inputText') as HTMLTextAreaElement | null;
  const btn = document.getElementById('paraphraseBtn') as HTMLButtonElement | null;

  if (!textarea || !btn) return null;

  return {
    textarea,
    btn,
    btnLabel: document.getElementById('btnLabel') as HTMLSpanElement | null,
    btnSpinner: document.getElementById('btnSpinner') as HTMLSpanElement | null,
    charCount: document.getElementById('charCount') as HTMLSpanElement | null,
    errorBox: document.getElementById('errorBox') as HTMLDivElement | null,
    results: document.getElementById('results') as HTMLDivElement | null,
    copyBtn: document.getElementById('copyBtn') as HTMLButtonElement | null,
    dropdown: document.querySelector('.process-dropdown') as HTMLDetailsElement | null,
    linearProgress: document.getElementById('linearProgress') as HTMLDivElement | null,
    pasteBtn: document.getElementById('pasteBtn') as HTMLButtonElement | null,
    clearBtn: document.getElementById('clearBtn') as HTMLButtonElement | null,
    goUpBtn: document.getElementById('goUpBtn') as HTMLButtonElement | null,
    nodeNl: document.querySelector('.node-nl'),
    nodeEn: document.querySelector('.node-en'),
    nodeFinal: document.querySelector('.node-final'),
    liveClockEl: document.getElementById('liveClock'),
  };
}
