# Phrase Paraphraser

<div align="center">

**Multi-Language Recursive Paraphrase Engine** · `ID → NL → EN → ID`

[![Astro](https://img.shields.io/badge/Astro-4.16.19-%23BC52EE?logo=astro)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-%233178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-%2306B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-%23000000?logo=vercel)](https://vercel.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-%23f59e0b?logo=github)](https://github.com/kandarlubis31/phrase-paraphraser/pulls)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-ready-%23ff6b35)](https://hacktoberfest.com)

> **Open source. Open to all. Let's build together!**

[ Bahasa Indonesia](#-bahasa-indonesia) · [ English](#-english)

</div>

---

<a id="-bahasa-indonesia"></a>
## Bahasa Indonesia

### Coba Langsung

 **[phrase-paraphraser.vercel.app](https://phrase-paraphraser.vercel.app)** — Live demo, no install needed!

Langsung terjun ke kode? Loncat ke [ Instalasi](#-instalasi).

---

### Tentang

**Phrase Paraphraser** adalah engine parafrase teks Indonesia yang bekerja melalui pipeline translasi 3-hop rekursif:

```
Input (ID)  →  Belanda (NL)  →  Inggris (EN)  →  Final (ID)
```

Dengan melewatkan teks melalui **dua bahasa perantara** sebelum kembali ke Indonesia, struktur kalimat berubah drastis sementara makna inti tetap terjaga. Cocok untuk menghindari plagiarisme, menulis ulang konten, atau eksperimen NLP ringan.

### Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                   USER BROWSER                        │
│  Input teks ID  ──────────────────────▶  Hasil (ID)   │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              ASTRO SSR (Vercel / Self-Hosted)          │
│                                                       │
│  paraphraseEngine.ts  ← API_MODE branch               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐        │
│  │ ID → NL  │───▶│ NL → EN  │───▶│ EN → ID  │        │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘        │
│       │               │               │               │
└───────┼───────────────┼───────────────┼───────────────┘
        │               │               │
        ▼               ▼               ▼
┌──────────────────────────────────────────────────────┐
│  PUBLIC_API_MODE=on  →  Cloudflare Worker + MyMemory  │
│  PUBLIC_API_MODE=off →  LibreTranslate (Docker, self) │
└──────────────────────────────────────────────────────┘
```

### Cara Kerja

| Tahap | Proses | Keterangan |
|-------|--------|------------|
| **1. ID → NL** | Indonesia ke Belanda | Diterjemahkan via API (Cloudflare Worker / LibreTranslate) |
| **2. NL → EN** | Belanda ke Inggris | Restrukturisasi tata bahasa Eropa |
| **3. EN → ID** | Inggris ke Indonesia | Hasil akhir parafrase + diff highlight |

**Fitur tambahan:**
- **Dual API Mode** — Pilih Cloud (Worker proxy, gratis) atau Local (LibreTranslate Docker, unlimited) via env var
- **Slang Protection** — Kata slang Indonesia (bro, gw, lu, wkwk, dll) diamankan sebagai token numerik agar tidak hilang saat translasi
- **Diff Highlighting** — Kata-kata yang berubah di-highlight menggunakan algoritma LCS (Longest Common Subsequence)
- **Streaming Output** — Hasil parafrase ditampilkan bertahap (karakter per karakter) seperti terminal
- **Cancel Pipeline** — Batalkan eksekusi kapan aja dengan klik "CANCEL PIPELINE"
- **Loading Skeleton** — Shimmer placeholder saat pipeline berjalan
- **Empty State** — Placeholder terminal-style saat belum ada hasil
- **Cooldown System** — Cooldown 10 detik antar request untuk menghormati batas rate-limit API gratis
- **State Persistence** — Input dan hasil disimpan ke `localStorage` biar nggak hilang saat refresh
- **Keyboard Shortcut** — `Ctrl+Enter` buat langsung eksekusi dari textarea

### Teknologi

| Teknologi | Penggunaan |
|-----------|------------|
| [Astro 4](https://astro.build) | Framework SSR (Server-Side Rendering) |
| [Tailwind CSS 3](https://tailwindcss.com) | Utility-first CSS framework |
| TypeScript | Type safety di seluruh codebase |
| Cloudflare Workers | Proxy API translasi (eksternal, Mode Cloud) |
| [LibreTranslate](https://libretranslate.com) | Engine translasi lokal (Mode Local, via Docker) |
| [Vercel](https://vercel.com) | Hosting & deployment (serverless) |
| pnpm | Package manager |

### Prasyarat

- **Node.js** `>= 20.x`
- **pnpm** (recommended) — `npm install -g pnpm`

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/kandarlubis31/phrase-paraphraser.git
cd phrase-paraphraser

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env

# 4. Jalankan development server
pnpm dev
```

Buka `http://localhost:4321` di browser.

> **Panduan deploy lengkap (Cloud vs Lokal, Docker, VPS, Vercel):** → **[DEPLOY.md](./DEPLOY.md)**

### Environment Variables

| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `PUBLIC_API_MODE` | Mode API: `on` (cloud) atau `off` (lokal) | `on` |
| `PUBLIC_WORKER_URL` | URL Cloudflare Worker proxy | `https://phrase-proxy.kandarlubis31.workers.dev` |
| `PUBLIC_LIBRETRANSLATE_URL` | URL LibreTranslate self-hosted | `http://localhost:5000` |

> ℹ **Dua mode tersedia:** `on` = pakai Cloudflare Worker (gratis, shared), `off` = LibreTranslate self-hosted via Docker (unlimited, lokal). Detail setup → **[DEPLOY.md](./DEPLOY.md)**.

### Batasan API Gratis & Cara Scaling

Project ini pakai **MyMemory API** (gratis, tanpa authentication) lewat Cloudflare Worker sebagai proxy. Kerennya? Bisa langsung dipakai tanpa daftar apa pun. Tapi ada batasannya:

| Aspek | Limit Anonim | Limit dengan API Key (gratis) |
|-------|-------------|------------------------------|
| **Request / hari** | ~1000 kata | ~5000 kata |
| **Rate limit** | ~1 req/detik | ~5 req/detik |
| **Daftar** | Tidak perlu | [Daftar gratis](https://mymemory.translated.net/doc/spec.php) |

> **Demo live di [phrase-paraphraser.vercel.app](https://phrase-paraphraser.vercel.app)** pakai shared worker + akses anonim. Kalau tiba-tiba error pas rame-rame, itu karena limit barengan habis. Sabar ya!

#### Mau Bebas Limit? Ini Jalurnya:

**1. Deploy Cloudflare Worker Sendiri (30 menit, GRATIS)**

Ini step paling penting! Dengan deploy worker sendiri, kamu nggak sharing kuota sama pengguna lain:

1. Minta source code worker via [issue](https://github.com/kandarlubis31/phrase-paraphraser/issues) atau bikin sendiri (simple kok — cuma proxy fetch ke MyMemory API)
2. Deploy ke [Cloudflare Workers](https://workers.cloudflare.com) (free tier: **100.000 request/hari** — lebih dari cukup!)
3. **Opsional:** Tambahin MyMemory API key (daftar gratis di [sini](https://mymemory.translated.net/doc/spec.php)) sebagai environment variable di dashboard Cloudflare Worker — limit naik 5× lipat!
4. Ganti `PUBLIC_WORKER_URL` di `.env` ke URL worker kamu

```bash
# .env setelah deploy worker sendiri
PUBLIC_WORKER_URL=https://phrase-proxy-pribadi.namakamu.workers.dev
```

Udah! Sekarang kamu punya dedicated quota + nggak ganggu pengguna lain.

**2. Self-Host di VPS (1-2 jam, $0-$5/bulan)**

Mau full control tanpa batas? Deploy semuanya di server sendiri — udah termasuk worker + frontend:

| Opsi Hosting | Harga | Cocok Buat |
|-------------|-------|------------|
| [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/) | $0/bln | VPS ARM 4 core, 24GB RAM — overpowered gratisan! |
| [Railway](https://railway.app) | ~$5/bln | Deploy Astro langsung dari GitHub, UI gampang |
| [Fly.io](https://fly.io) | ~$0/bln (free tier) | Deploy container, 3 shared VMs gratis |
| [Hetzner VPS](https://www.hetzner.com/cloud) | ~$4/bln | VPS dedicated, performa kencang |
| [Vercel](https://vercel.com) | $0/bln (hobby) | Tetap di Vercel tapi arahkan ke worker sendiri |

**3. Ganti Provider Translasi (advance)**

Mau lebih ngebut atau kualitas lebih oke? Ganti backend translasi di `src/utils/paraphraseEngine.ts`:

| Provider | Free Tier | Setup |
|----------|-----------|-------|
| [Google Translate API](https://cloud.google.com/translate) | 500.000 karakter/bln | Butuh GCP account + billing (aman, nggak bakal ditagih selama di bawah limit) |
| [DeepL API](https://www.deepl.com/pro-api) | 500.000 karakter/bln | Kualitas terjemahan terbaik, butuh kartu kredit |
| MyMemory (default) | ~1000-5000 kata/hari | Tanpa daftar, paling gampang |

> **Atau langsung pakai mode built-in!** Setting `PUBLIC_API_MODE=off` di `.env` + LibreTranslate Docker = **unlimited, tanpa ganti kode.** Panduan lengkap → **[DEPLOY.md](./DEPLOY.md)**.

> **Rekomendasi:** Mulai dari deploy Worker sendiri (Level 1 — gratis, 30 menit). Udah cukup buat personal use bahkan rame user. Kalau butuh lebih, lompat ke VPS atau ganti provider.

### Struktur Project

```
phrase-paraphraser/
├── src/
│   ├── client/                     # ⭐ Client-side modules (TypeScript)
│   │   ├── paraphraseController.ts    # Orchestrator utama UI
│   │   ├── streamRenderer.ts          # Streaming output (token → DOM)
│   │   ├── dom.ts                     # DOM element cache
│   │   └── storage.ts                 # localStorage/sessionStorage helpers
│   ├── components/                 # Komponen Astro UI
│   │   ├── AppHeader.astro            # Header + live clock + mode badge
│   │   ├── EditorialFeatures.astro    # Highlight fitur utama
│   │   ├── FlowVisual.astro           # Visualisasi pipeline ID→NL→EN→ID
│   │   ├── ResultProgress.astro       # Panel hasil + skeleton + empty state
│   │   └── TranslateBox.astro         # ⭐ Komponen utama (5 baris script!)
│   ├── pages/
│   │   └── index.astro                # Halaman utama
│   ├── styles/
│   │   └── global.css                 # Global styles + Tailwind
│   └── utils/
│       └── paraphraseEngine.ts        # ⭐ Engine utama (translate, diff, validasi, cooldown)
├── DEPLOY.md                      # 📖 Panduan deploy lengkap
├── .env.example                   # Template environment variables
├── astro.config.mjs               # Konfigurasi Astro + Vercel adapter
├── tailwind.config.mjs            # Konfigurasi Tailwind (terminal palette)
├── tsconfig.json                  # Konfigurasi TypeScript (strict mode)
├── vercel.json                    # Konfigurasi Vercel deployment
└── package.json                   # Dependencies & scripts
```

> **Info buat contributor baru:** Kodebase modular — 1 engine utility + 4 client modules + 5 komponen Astro. Mulai dari baca `paraphraseEngine.ts` buat ngerti core logic, `paraphraseController.ts` buat UI orchestrator, terus `TranslateBox.astro` yang sekarang cuma 5 baris script. Panduan deploy lengkap → **[DEPLOY.md](./DEPLOY.md)**.

### Scripts

| Command | Deskripsi |
|---------|-----------|
| `pnpm dev` | Dev server di `localhost:4321` (hot reload) |
| `pnpm build` | Build production ke `.astro/output/` |
| `pnpm preview` | Preview build production |
| `pnpm deploy` | Deploy ke Vercel — butuh [Vercel CLI](https://vercel.com/docs/cli) |

### Mau Kontribusi?

Semua detail ada di **[CONTRIBUTING.md](./CONTRIBUTING.md)**!

Dari first-timer guide, issue labels, alur kontribusi, PR checklist, dev workflow, sampai code style — semuanya lengkap di sana. Cus langsung cek!

### Roadmap

> **Mau bantu salah satu ini? Langsung eksekusi aja — atau buka issue dulu buat diskusi!**

- [x] **Self-hosted pipeline** — LibreTranslate via Docker, `API_MODE=off` ( DONE!)
- [x] **Pisahkan client logic** — `src/client/` modules (controller, DOM, storage, stream) ( DONE!)
- [ ] **Dukungan bahasa perantara tambahan** (Jepang, Korea, Prancis, dll) (`help wanted`)
- [ ] **Mode batch** — input banyak teks sekaligus, output paralel (`good first issue` — bisa mulai dari UI dulu)
- [ ] **Export hasil** ke PDF / TXT / Markdown (`good first issue`)
- [ ] **Unit testing** pake Vitest (`help wanted` — setup dari nol)
- [ ] **Dark/Light mode toggle** (`good first issue`)
- [ ] **PWA support** — offline capability + install prompt (`enhancement`)
- [ ] **Share hasil ke Twitter/WA** — social share button (`enhancement`)

### Contributors

Terima kasih buat semua yang udah kontribusi!

> _Belum ada contributor selain author? Jangan ragu buat jadi yang pertama! Dan jangan lupa tambahin nama kamu sendiri di sini pas bikin PR ya! _

<a href="https://github.com/kandarlubis31/phrase-paraphraser/graphs/contributors">
 <img src="https://contrib.rocks/image?repo=kandarlubis31/phrase-paraphraser" alt="Contributors" />
</a>

### Lisensi

[MIT License](./LICENSE) © 2025 [Kandar Lubis](https://github.com/kandarlubis31)

---

<a id="-english"></a>
## English

### Quick Start

 **[phrase-paraphraser.vercel.app](https://phrase-paraphraser.vercel.app)** — Live demo, no install needed!

Ready to jump into the code? Skip to [ Installation](#-installation).

---

### About

**Phrase Paraphraser** is an Indonesian text paraphrase engine that works through a 3-hop recursive translation pipeline:

```
Input (ID)  →  Dutch (NL)  →  English (EN)  →  Final (ID)
```

By routing text through **two intermediate languages** before returning to Indonesian, sentence structures are drastically altered while core meaning is preserved. Ideal for plagiarism avoidance, content rewriting, or lightweight NLP experiments.

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   USER BROWSER                        │
│  Input text (ID)  ──────────────────▶  Result (ID)    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              ASTRO SSR (Vercel / Self-Hosted)          │
│                                                       │
│  paraphraseEngine.ts  ← API_MODE branch               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐        │
│  │ ID → NL  │───▶│ NL → EN  │───▶│ EN → ID  │        │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘        │
│       │               │               │               │
└───────┼───────────────┼───────────────┼───────────────┘
        │               │               │
        ▼               ▼               ▼
┌──────────────────────────────────────────────────────┐
│  PUBLIC_API_MODE=on  →  Cloudflare Worker + MyMemory  │
│  PUBLIC_API_MODE=off →  LibreTranslate (Docker, self) │
└──────────────────────────────────────────────────────┘
```

### How It Works

| Stage | Process | Notes |
|-------|---------|-------|
| **1. ID → NL** | Indonesian to Dutch | Translated via API (Cloudflare Worker / LibreTranslate) |
| **2. NL → EN** | Dutch to English | European grammar restructuring |
| **3. EN → ID** | English to Indonesian | Final paraphrased output + diff highlight |

**Additional features:**
- **Dual API Mode** — Choose Cloud (Worker proxy, free) or Local (LibreTranslate Docker, unlimited) via env var
- **Slang Protection** — Indonesian slang words (bro, gw, lu, wkwk, etc.) are secured as numeric tokens to prevent loss during translation
- **Diff Highlighting** — Changed words are highlighted using LCS (Longest Common Subsequence) algorithm
- **Streaming Output** — Paraphrased results are displayed character by character, terminal-style
- **Cancel Pipeline** — Cancel execution anytime by clicking "CANCEL PIPELINE"
- **Loading Skeleton** — Shimmer placeholder while the pipeline runs
- **Empty State** — Terminal-style placeholder when no results yet
- **Cooldown System** — 10-second cooldown between requests to respect free API rate limits
- **State Persistence** — Input and results are saved to `localStorage` so nothing is lost on refresh
- **Keyboard Shortcut** — `Ctrl+Enter` to execute directly from the textarea

### Tech Stack

| Technology | Usage |
|------------|-------|
| [Astro 4](https://astro.build) | SSR Framework (Server-Side Rendering) |
| [Tailwind CSS 3](https://tailwindcss.com) | Utility-first CSS framework |
| TypeScript | Type safety across the codebase |
| Cloudflare Workers | Translation API proxy (external, Cloud Mode) |
| [LibreTranslate](https://libretranslate.com) | Local translation engine (Local Mode, via Docker) |
| [Vercel](https://vercel.com) | Hosting & deployment (serverless) |
| pnpm | Package manager |

### Prerequisites

- **Node.js** `>= 20.x`
- **pnpm** (recommended) — `npm install -g pnpm`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/kandarlubis31/phrase-paraphraser.git
cd phrase-paraphraser

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start development server
pnpm dev
```

Open `http://localhost:4321` in your browser.

> **Full deployment guide (Cloud vs Local, Docker, VPS, Vercel):** → **[DEPLOY.md](./DEPLOY.md)**

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_API_MODE` | API mode: `on` (cloud) or `off` (local) | `on` |
| `PUBLIC_WORKER_URL` | Cloudflare Worker proxy URL | `https://phrase-proxy.kandarlubis31.workers.dev` |
| `PUBLIC_LIBRETRANSLATE_URL` | LibreTranslate self-hosted URL | `http://localhost:5000` |

> ℹ **Two modes available:** `on` = Cloudflare Worker (free, shared), `off` = LibreTranslate self-hosted via Docker (unlimited, local). Setup details → **[DEPLOY.md](./DEPLOY.md)**.

### Free API Limits & How to Scale

This project uses the **MyMemory API** (free, no authentication required) via a Cloudflare Worker proxy. The cool part? It works out of the box with zero registration. But there are limits:

| Aspect | Anonymous Limit | With API Key (free) |
|--------|----------------|---------------------|
| **Requests / day** | ~1000 words | ~5000 words |
| **Rate limit** | ~1 req/sec | ~5 req/sec |
| **Registration** | Not needed | [Sign up free](https://mymemory.translated.net/doc/spec.php) |

> **The live demo at [phrase-paraphraser.vercel.app](https://phrase-paraphraser.vercel.app)** uses a shared worker + anonymous access. If it suddenly errors out during peak usage, that's the shared quota running dry. Hang tight!

#### Want Unlimited? Here's Your Path:

**1. Deploy Your Own Cloudflare Worker (30 minutes, FREE)**

This is the single most impactful step! Deploy your own worker and stop sharing quotas:

1. Request the worker source code via [issue](https://github.com/kandarlubis31/phrase-paraphraser/issues) or build your own (it's simple — just a fetch proxy to MyMemory API)
2. Deploy to [Cloudflare Workers](https://workers.cloudflare.com) (free tier: **100,000 requests/day** — more than enough!)
3. **Optional:** Add a MyMemory API key (free signup [here](https://mymemory.translated.net/doc/spec.php)) as an environment variable in the Cloudflare Worker dashboard — your limit jumps 5×!
4. Update `PUBLIC_WORKER_URL` in `.env` to your worker URL

```bash
# .env after deploying your own worker
PUBLIC_WORKER_URL=https://phrase-proxy-personal.yourname.workers.dev
```

Done! You now have a dedicated quota + you're not affecting other users.

**2. Self-Host on a VPS (1-2 hours, $0-$5/month)**

Want full control with zero limits? Deploy everything on your own server — worker + frontend:

| Hosting Option | Price | Best For |
|---------------|-------|----------|
| [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/) | $0/mo | ARM VPS 4 core, 24GB RAM — overpowered and free! |
| [Railway](https://railway.app) | ~$5/mo | Deploy Astro directly from GitHub, easy UI |
| [Fly.io](https://fly.io) | ~$0/mo (free tier) | Deploy containers, 3 free shared VMs |
| [Hetzner VPS](https://www.hetzner.com/cloud) | ~$4/mo | Dedicated VPS, great performance |
| [Vercel](https://vercel.com) | $0/mo (hobby) | Stay on Vercel but point to your own worker |

**3. Switch Translation Provider (advanced)**

Want even more speed or quality? Swap out the translation backend in `src/utils/paraphraseEngine.ts`:

| Provider | Free Tier | Setup |
|----------|-----------|-------|
| [Google Translate API](https://cloud.google.com/translate) | 500K chars/month | Requires GCP account + billing (safe — won't charge under limit) |
| [DeepL API](https://www.deepl.com/pro-api) | 500K chars/month | Best translation quality, requires credit card |
| MyMemory (default) | ~1000-5000 words/day | No registration, simplest setup |

> **Or use the built-in mode!** Set `PUBLIC_API_MODE=off` in `.env` + LibreTranslate Docker = **unlimited, no code changes.** Full guide → **[DEPLOY.md](./DEPLOY.md)**.

> **Recommendation:** Start by deploying your own Worker (Level 1 — free, 30 minutes). Plenty for personal use even with many users. Need more? Jump to a VPS or switch providers.

### Project Structure

```
phrase-paraphraser/
├── src/
│   ├── client/                     # ⭐ Client-side modules (TypeScript)
│   │   ├── paraphraseController.ts    # Main UI orchestrator
│   │   ├── streamRenderer.ts          # Streaming output (token → DOM)
│   │   ├── dom.ts                     # DOM element cache
│   │   └── storage.ts                 # localStorage/sessionStorage helpers
│   ├── components/                 # Astro UI Components
│   │   ├── AppHeader.astro            # Header + live clock + mode badge
│   │   ├── EditorialFeatures.astro    # Feature highlights
│   │   ├── FlowVisual.astro           # ID→NL→EN→ID pipeline visualization
│   │   ├── ResultProgress.astro       # Results panel + skeleton + empty state
│   │   └── TranslateBox.astro         # ⭐ Main component (only 5 lines of script!)
│   ├── pages/
│   │   └── index.astro                # Main page
│   ├── styles/
│   │   └── global.css                 # Global styles + Tailwind
│   └── utils/
│       └── paraphraseEngine.ts        # ⭐ Core engine (translate, diff, validation, cooldown)
├── DEPLOY.md                      # 📖 Full deployment guide
├── .env.example                   # Environment variables template
├── astro.config.mjs               # Astro + Vercel adapter config
├── tailwind.config.mjs            # Tailwind config (terminal palette)
├── tsconfig.json                  # TypeScript config (strict mode)
├── vercel.json                    # Vercel deployment config
└── package.json                   # Dependencies & scripts
```

> **Heads up for new contributors:** The codebase is modular — 1 engine utility + 4 client modules + 5 Astro components. Start with `paraphraseEngine.ts` for core logic, `paraphraseController.ts` for the UI orchestrator, then `TranslateBox.astro` which is now just 5 lines of script. Full deploy guide → **[DEPLOY.md](./DEPLOY.md)**.

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server at `localhost:4321` (hot reload) |
| `pnpm build` | Build for production to `.astro/output/` |
| `pnpm preview` | Preview production build |
| `pnpm deploy` | Deploy to Vercel — requires [Vercel CLI](https://vercel.com/docs/cli) |

### Want to Contribute?

Everything you need is in **[CONTRIBUTING.md](./CONTRIBUTING.md)**!

First-timer guide, issue labels, contribution workflow, PR checklist, dev workflow, code style — it's all there. Go check it out!

### Roadmap

> **Wanna help with one of these? Just go for it — or open an issue to discuss first!**

- [x] **Self-hosted pipeline** — LibreTranslate via Docker, `API_MODE=off` ( DONE!)
- [x] **Separate client logic** — `src/client/` modules (controller, DOM, storage, stream) ( DONE!)
- [ ] **Additional intermediate languages** (Japanese, Korean, French, etc.) (`help wanted`)
- [ ] **Batch mode** — multiple texts at once, parallel output (`good first issue` — UI first!)
- [ ] **Export results** to PDF / TXT / Markdown (`good first issue`)
- [ ] **Unit testing** with Vitest (`help wanted` — greenfield setup!)
- [ ] **Dark/Light mode toggle** (`good first issue`)
- [ ] **PWA support** — offline capability + install prompt (`enhancement`)
- [ ] **Share to Twitter/WhatsApp** — social share button (`enhancement`)

### Contributors

Shoutout to everyone who's contributed!

> _No contributors besides the author yet? Don't be shy — be the first! And don't forget to add your name here when you open a PR! _

<a href="https://github.com/kandarlubis31/phrase-paraphraser/graphs/contributors">
 <img src="https://contrib.rocks/image?repo=kandarlubis31/phrase-paraphraser" alt="Contributors" />
</a>

### License

[MIT License](./LICENSE) © 2025 [Kandar Lubis](https://github.com/kandarlubis31)

---

<div align="center">

### Found this useful? Drop a star and make someone's day!

**Built with by [Kandar Lubis](https://www.instagram.com/kandar.lubis31)**

[![Instagram](https://img.shields.io/badge/Instagram-@kandar.lubis31-%23E4405F?logo=instagram)](https://www.instagram.com/kandar.lubis31)
[![GitHub](https://img.shields.io/badge/GitHub-kandarlubis31-%23181717?logo=github)](https://github.com/kandarlubis31)
[![Website](https://img.shields.io/badge/Website-paklubis.my.id-%23000000)](https://www.paklubis.my.id)

</div>
