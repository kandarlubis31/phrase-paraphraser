# CONTEXT.md — Phrase Paraphraser

> Ringkasan project biar nggak perlu baca ulang semua file. Update terakhir: 22 Juli 2026.

---

## 🎯 Inti Project

**Phrase Paraphraser** — engine parafrase teks Indonesia via pipeline translasi 3-hop:

```
Input (ID) → Belanda (NL) → Inggris (EN) → Final (ID)
```

Gunanya: ubah struktur kalimat drastis tanpa ngubah makna. Cocok buat anti-plagiarisme, rewrite konten, atau eksperimen NLP.

Live demo: [phrase-paraphraser.vercel.app](https://phrase-paraphraser.vercel.app)

---

## 🧱 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Astro 4.16 (SSR, Vercel serverless adapter) |
| Styling | Tailwind CSS 3.4 + custom `terminal` color palette |
| Language | TypeScript (strict mode) |
| Package Manager | pnpm |
| Translation API (Cloud) | MyMemory (free, no auth) via Cloudflare Worker proxy |
| Translation API (Local) | LibreTranslate (self-hosted Docker, unlimited) |
| Hosting | Vercel (serverless) atau self-hosted (VPS/homeserver) |

**Dual API Mode:** `PUBLIC_API_MODE=on` (Cloud Worker) atau `off` (LibreTranslate lokal).

**Scripts:** `pnpm dev` | `pnpm build` | `pnpm preview` | `pnpm deploy`

---

## 📁 Struktur File

```
phrase-paraphraser/
├── CONTEXT.md                      ← LO LAGI DI SINI
├── README.md                       ← Overview + scaling guide (bilingual ID/EN)
├── DEPLOY.md                       ← 📖 Panduan deploy lengkap (Cloud vs Local, Docker, VPS, Vercel)
├── CONTRIBUTING.md                 ← Panduan kontribusi lengkap (bilingual)
├── LICENSE                         ← MIT
├── .env.example                    ← Template env vars (API_MODE, WORKER_URL, LIBRETRANSLATE_URL)
├── astro.config.mjs                ← Konfig Astro + Vercel adapter
├── tailwind.config.mjs             ← Konfig Tailwind + terminal color palette (11 shade)
├── tsconfig.json                   ← Astro strict tsconfig
├── vercel.json                     ← Vercel deploy config
├── package.json                    ← Dependencies
│
└── src/
    ├── client/                     ⭐ CLIENT MODULES — logic UI TypeScript terpisah
    │   ├── paraphraseController.ts     Orchestrator utama (init, pipeline, cancel, state)
    │   ├── streamRenderer.ts           Token streaming → DOM via insertAdjacentHTML
    │   ├── dom.ts                      Cache 18 DOM reference dalam 1 objek typed
    │   └── storage.ts                  localStorage/sessionStorage helpers (8 fungsi)
    │
    ├── utils/
    │   └── paraphraseEngine.ts     ⭐ ENGINE UTAMA — translate, diff, validasi, cooldown
    │
    ├── components/
    │   ├── TranslateBox.astro      ⭐ KOMPONEN UTAMA — sekarang cuma 5 baris script!
    │   ├── AppHeader.astro             Header + live clock + mode badge (LOCAL/CLOUD)
    │   ├── EditorialFeatures.astro     Highlight 3 fitur utama
    │   ├── FlowVisual.astro            Visualisasi pipeline ID→NL→EN→ID
    │   └── ResultProgress.astro        Panel hasil + skeleton loading + empty state
    │
    ├── pages/
    │   └── index.astro                 Halaman utama + background orbs + OG meta tags
    │
    └── styles/
        └── global.css                  Tailwind import + scrollbar + selection + theme()
```

⭐ = Active & critical

---

## 🔧 paraphraseEngine.ts — THE BRAIN

**`translate(text, src, tgt, signal?)`** — Dual-mode translation
- **API_MODE branching:** `import.meta.env.PUBLIC_API_MODE === "off"` → LibreTranslate `/translate` endpoint, else → Cloudflare Worker proxy
- **LibreTranslate path:** POST `{ q, source, target, format: "text" }` → read `data.translatedText`
- **Worker path:** POST ke `WORKER_URL?t=${Date.now()}` → read `data.result`
- **AbortSignal support:** Optional `signal?: AbortSignal` — forward external abort ke internal AbortController
- `src === "id"`: Amankan slang (wkwk, bro, lu, gw, sikat, kocak, gan) jadi token numerik `[#900]`...`[#906]`
- `tgt === "id"`: Pulihkan token + cleanup kebocoran interpolasi asing
- WORKER_URL: `import.meta.env.PUBLIC_WORKER_URL || default_worker`
- LIBRETRANSLATE_URL: `import.meta.env.PUBLIC_LIBRETRANSLATE_URL || "http://localhost:5000"`
- 30s timeout (AbortController internal)

**`validateInputText(text)`** — Validasi input
- Minimal 2 kata
- Harus mengandung vokal (anti random string > 10 char)

**`highlightDifferences(orig, final, startTime)`** — Diff highlighting
- Tokenisasi → LCS (Longest Common Subsequence) → `<span class="diff-highlight">` untuk kata yang berubah
- Return: `{ html, metrics: { sizeBytes, durationMs } }`

**`initializeCooldown(button, label, duration, onComplete)`** — Cooldown 10 detik
- Disable button + countdown di label
- Simpan cooldown expiry di `sessionStorage`

---

## 🖥️ TranslateBox.astro — THE BODY (sekarang super tipis!)

Komponen Astro dengan `<script>` tag **cuma 5 baris**: import `initParaphraser` + 2 event listener.

Semua logic udah dipindah ke `src/client/`:
- **`paraphraseController.ts`** (~300 baris) — orchestrator: init, event wiring, pipeline execute, cancel, state management
- **`streamRenderer.ts`** (40 baris) — tokenisasi HTML → streaming batch per 15ms ke DOM
- **`dom.ts`** (35 baris) — cache 18 DOM reference dalam objek typed; return `null` jika elemen kritis hilang
- **`storage.ts`** (65 baris) — 8 fungsi localStorage/sessionStorage: save/load/clear input, results, cooldown

**Flow:**
1. Input text → validasi (`validateInputText`)
2. Klik "EXECUTE PARAPHRASE" (atau `Ctrl+Enter`)
3. Button berubah jadi "CANCEL PIPELINE" (merah)
4. Skeleton loading muncul (3 baris shimmer animation)
5. Pipeline: `translate(id→nl)` → `translate(nl→en)` → `translate(en→id)` — semua support AbortSignal
6. Klik "CANCEL" kapan aja → AbortController.abort() → semua fetch dibatalkan → UI reset + toast
7. `highlightDifferences(original, result)` → streaming output karakter-per-karakter
8. Cooldown 10 detik → simpan state ke `localStorage`

**UI States:**
- **Empty State** — `> READY_AWAITING_INPUT` saat belum ada hasil
- **Loading Skeleton** — 3 baris shimmer saat pipeline berjalan
- **Results** — Output final + intermediate logs (ID, NL, EN) + metrics
- **Error** — Error box merah dengan pesan user-friendly
- **Cancel** — Toast "PIPELINE CANCELLED" + dropdown log terbuka otomatis

---

## 🎨 Tailwind Color System

Semua warna hardcoded sudah dikonversi ke Tailwind utility classes + `theme()`.

**Palet `terminal` (11 shade):**
```
terminal-deep (#060c18)     → bg halaman
terminal-bg (#0a0a0a)       → bg utama
terminal-surface (#171717)  → cards
terminal-border (#262626)   → borders
terminal-border-hover       → hover state
terminal-muted (#525252)    → text redup
terminal-dim (#737373)      → text sekunder
terminal-body (#a3a3a3)     → text body
terminal-light (#d4d4d4)    → text terang
terminal-bright (#e5e5e5)   → text utama
terminal-white (#f8fafc)    → pure white
```

**Aksen & status:** `accent` (#f59e0b amber), `accent-dark`, `accent-blue`, `success` (#10b981), `error` (#ef4444).

---

## 🌐 Arsitektur Data Flow

```
Browser → Astro SSR (Vercel / Self-Hosted)
              │
              ▼ paraphraseEngine.ts
         ┌──── API_MODE branch ────┐
         │                         │
    API_MODE=on               API_MODE=off
         │                         │
         ▼                         ▼
  Cloudflare Worker          LibreTranslate
         │                  (Docker, self-hosted)
         ▼                         │
  MyMemory API                     │
  (free, shared)                   │
         │                         │
         └─────────┬───────────────┘
                   ▼
         paraphraseEngine.ts (diff + slang restore)
                   │
                   ▼
         Browser (streaming output + diff highlight)
```

---

## 🔑 Environment Variables

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `PUBLIC_API_MODE` | `on` | `on` = Cloud Worker, `off` = LibreTranslate lokal |
| `PUBLIC_WORKER_URL` | `https://phrase-proxy.kandarlubis31.workers.dev` | URL Worker proxy (Mode Cloud) |
| `PUBLIC_LIBRETRANSLATE_URL` | `http://localhost:5000` | URL LibreTranslate (Mode Local) |

---

## 📝 Perubahan Terakhir

| Tanggal | Perubahan |
|---------|-----------|
| 22 Jul 2026 | Buat `DEPLOY.md` — panduan deploy bilingual (Cloud vs Local, Docker, VPS, Vercel, troubleshooting) |
| 22 Jul 2026 | API Mode Toggle: `PUBLIC_API_MODE` + LibreTranslate branch di `paraphraseEngine.ts` + mode badge di header |
| 22 Jul 2026 | UX improvements: loading skeleton (3-bar shimmer), empty state, cancel pipeline button + AbortSignal support |
| 21 Jul 2026 | Refactor `TranslateBox.astro`: pisahin ~400 baris script → 4 modul `src/client/` (controller, DOM, storage, stream). Script block sekarang cuma 5 baris! |
| 21 Jul 2026 | Tailwind color conversion: semua hex hardcoded → `theme()` + utility classes. Palet `terminal` 11 shade di config. |
| 20 Jul 2026 | Sprint 1 cleanup: hapus legacy files, fix XSS (`insertAdjacentHTML`), OG meta tags, update semua docs |
| 13 Jul 2026 | README: badges, arsitektur diagram, quick start, scaling guide 3 level |
| 13 Jul 2026 | CONTRIBUTING.md bilingual — first-timer guide, issue labels, workflow, PR checklist |
| 13 Jul 2026 | `paraphraseEngine.ts`: WORKER_URL pake `import.meta.env.PUBLIC_WORKER_URL` |

---

## 🗺️ Rencana Ke Depan (Roadmap)

**✅ Sudah selesai:**
- Self-hosted pipeline (LibreTranslate + API_MODE=off)
- Pisahkan client logic (src/client/ modules)
- Tailwind color system
- Loading skeleton + empty state + cancel button

**⏳ Belum:**
- Additional intermediate languages (JP, KR, FR, dll)
- Batch mode (multiple texts parallel)
- Export PDF/TXT
- Unit testing (Vitest)
- Dark/Light toggle, PWA, social share
