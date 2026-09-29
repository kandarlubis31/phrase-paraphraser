// src/utils/slang.ts — Slang protection system (collision-proof tokens)

export const SLANG_PREFIX = '__SP_';

export interface SlangRule {
  readonly slang: string;
  readonly id: number;
}

export const SLANG_RULES: readonly SlangRule[] = [
  { slang: "wkwk",   id: 900 },
  { slang: "bro",    id: 901 },
  { slang: "lu",     id: 902 },
  { slang: "gw",     id: 903 },
  { slang: "sikat",  id: 904 },
  { slang: "kocak",  id: 905 },
  { slang: "gan",    id: 906 },
] as const;

/** Convert slang id to collision-proof token: __SP_900__, __SP_901__, etc. */
export function makeToken(id: number): string {
  return `${SLANG_PREFIX}${id}__`;
}

/** Replace slang words in text with collision-proof tokens before sending to API */
export function lockSlang(text: string): string {
  let result = text;
  SLANG_RULES.forEach(rule => {
    const regex = new RegExp(`\\b${rule.slang}\\b`, "gi");
    result = result.replace(regex, makeToken(rule.id));
  });
  return result;
}

/** Clean up API leakage wrapper patterns and restore tokens to original slang */
export function unlockSlang(text: string): string {
  let result = text;

  // Catch wrapper patterns that may have survived translation
  result = result.replace(/___BRUSH___|___BORSTEL___|___SIKAT___/gi, makeToken(904));
  result = result.replace(/___BRO___/gi, makeToken(901));
  result = result.replace(/___LU___|___GW___/gi, match =>
    match === "___LU___" ? makeToken(902) : makeToken(903)
  );

  // Restore tokens to original words
  SLANG_RULES.forEach(rule => {
    const token = makeToken(rule.id);
    const regex = new RegExp(token, "g");
    const replacement = rule.slang === "gan" ? "bro" : rule.slang;
    result = result.replace(regex, replacement);
  });

  return result;
}
