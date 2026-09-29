# 🚀 DEPLOY.md — Phrase Paraphraser

> Panduan lengkap deploy & setup dari nol. Pilih mode yang cocok buat kamu!

[🇮🇩 Bahasa Indonesia](#-bahasa-indonesia) · [🇬🇧 English](#-english)

---

<a id="-bahasa-indonesia"></a>
## 🇮🇩 Bahasa Indonesia

### 📋 Daftar Isi

- [Prasyarat](#-prasyarat)
- [Mode 1: Cloud (pakai Worker Proxy)](#-mode-1-cloud-pakai-worker-proxy)
- [Mode 2: Lokal Unlimited (LibreTranslate + Docker)](#-mode-2-lokal-unlimited-libretranslate--docker)
- [Deploy ke Vercel (Production)](#-deploy-ke-vercel-production)
- [Deploy ke VPS / Homeserver](#-deploy-ke-vps--homeserver)
- [Struktur File Penting](#-struktur-file-penting)
- [Troubleshooting](#-troubleshooting)

---

### 📦 Prasyarat

| Tools | Versi | Cara Install |
|-------|-------|--------------|
| **Node.js** | ≥ 20.x | [nodejs.org](https://nodejs.org) |
| **pnpm** | latest | `npm install -g pnpm` |
| **Git** | any | [git-scm.com](https://git-scm.com) |
| **Docker** _(opsional)_ | latest | [docker.com](https://docker.com) — hanya buat Mode 2 |

---

### 🚀 Quick Start (Semua Mode)

```bash
# 1. Clone
git clone https://github.com/kandarlubis31/phrase-paraphraser.git
cd phrase-paraphraser

# 2. Install
pnpm install

# 3. Setup env
cp .env.example .env

# 4. Pilih mode di .env (buka file .env, edit sesuai mode di bawah)

# 5. Jalanin!
pnpm dev
# → buka http://localhost:4321
```

---

### ☁️ Mode 1: Cloud (pakai Worker Proxy)

**Cocok buat:** development, testing, atau kalau kamu nggak mau setup apa-apa.

**Cara kerja:** Request translasi diteruskan ke Cloudflare Worker proxy (gratis, shared quota).

```env
# .env
PUBLIC_API_MODE=on
PUBLIC_WORKER_URL=https://phrase-proxy.kandarlubis31.workers.dev

```

```bash
pnpm dev
# → http://localhost:4321
```

**Batasannya:**
- Shared quota (barengan user lain)
- Butuh internet
- Rate-limited (~1 req/detik)

> 💡 **Biar dedicated:** Deploy Worker sendiri di [Cloudflare Workers](https://workers.cloudflare.com) (free tier: 100K req/hari), terus ganti `PUBLIC_WORKER_URL` ke URL worker kamu.

---

### 🏠 Mode 2: Lokal Unlimited (LibreTranslate + Docker)

**Cocok buat:** homeserver, full offline, zero rate limit, unlimited usage.

**Cara kerja:** Translasi 100% lokal via LibreTranslate Docker container.

#### Step 1: Jalankan LibreTranslate

```bash
# Pull & run LibreTranslate container
docker run -d \
  --name libretranslate \
  -p 5000:5000 \
  --restart unless-stopped \
  libretranslate/libretranslate

# Verifikasi berjalan
curl http://localhost:5000/languages
# → harus muncul JSON daftar bahasa
```

> ⚡ **First run bakal download model bahasa (~2-4 GB).** Sabar ya, ini cuma sekali. Setelah itu instant.

> 🔧 **Opsional — hemat RAM:** Kalau cuma butuh ID, NL, EN:
> ```bash
> docker run -d --name libretranslate -p 5000:5000 \
>   -e LT_LOAD_ONLY="id,nl,en" \
>   libretranslate/libretranslate
> ```

#### Step 2: Konfigurasi .env

```env
# .env
PUBLIC_API_MODE=off
PUBLIC_LIBRETRANSLATE_URL=http://localhost:5000

```

#### Step 3: Jalanin!

```bash
pnpm dev
# → http://localhost:4321
```

**Header bakal nampilin badge `LOCAL` warna hijau** — artinya semua translasi jalan di mesin kamu sendiri.

#### Akses dari Device Lain (LAN)

```env
# Ganti localhost ke IP lokal homeserver lu
PUBLIC_LIBRETRANSLATE_URL=http://192.168.1.100:5000
```

Catatan: LibreTranslate container harus listen di `0.0.0.0` (default udah bener). Pastiin firewall ngebolehin port 5000.

---

### ▲ Deploy ke Vercel (Production)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
pnpm deploy
# atau:
vercel --prod
```

**Environment Variables di Vercel Dashboard:**
1. Buka dashboard project → Settings → Environment Variables
2. Tambahin:
   - `PUBLIC_API_MODE` = `on` (atau `off` kalau LibreTranslate lu expose ke internet)
   - `PUBLIC_WORKER_URL` = URL worker kamu

> ⚠️ **Mode `off` di Vercel:** LibreTranslate harus bisa diakses dari internet. Pakai tunnel (Cloudflare Tunnel, ngrok, Tailscale Funnel) atau VPS dengan public IP.

---

### 🖥️ Deploy ke VPS / Homeserver

#### Opsi A: Static Export + Nginx

```bash
# Build static
pnpm build

# Serve folder output dengan Nginx / Caddy / Python
# Contoh pake Python:
python3 -m http.server 8080 --directory dist/
```

#### Opsi B: Node Server (SSR)

```bash
# Di VPS:
git clone https://github.com/kandarlubis31/phrase-paraphraser.git
cd phrase-paraphraser
pnpm install
cp .env.example .env
# edit .env sesuai mode

pnpm build
pnpm preview --host 0.0.0.0 --port 4321
# → akses di http://ip-vps:4321
```

Buat process manager biar tetap jalan:

```bash
# Pakai PM2
npm install -g pm2
pm2 start "pnpm preview --host 0.0.0.0 --port 4321" --name phrase-paraphraser
pm2 save
pm2 startup
```

---

### 📁 Struktur File Penting

```
phrase-paraphraser/
├── .env                    ← SETTING KAMU DI SINI (copy dari .env.example)
├── .env.example            ← Template (jangan diedit, commit aja)
├── DEPLOY.md               ← LO LAGI DI SINI
├── README.md               ← Overview project
│
├── src/
│   ├── utils/
│   │   └── paraphraseEngine.ts   ← Logic translasi + branch API_MODE
│   ├── client/
│   │   ├── paraphraseController.ts  ← Orchestrator UI
│   │   ├── streamRenderer.ts        ← Streaming output
│   │   ├── dom.ts                   ← DOM cache
│   │   └── storage.ts               ← localStorage helpers
│   ├── components/              ← Komponen UI Astro
│   └── pages/
│       └── index.astro          ← Halaman utama
│
├── astro.config.mjs
├── tailwind.config.mjs
└── vercel.json
```

---

### 🔧 Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| **"Failed to fetch" di console** | LibreTranslate belum jalan / URL salah | Cek `docker ps`, pastiin container running. Test: `curl http://localhost:5000/languages` |
| **Badge header masih "CLOUD"** | `.env` belum direstart | `Ctrl+C` → `pnpm dev` lagi (Astro perlu restart baca `.env`) |
| **Translasi lemot di Mode 2** | LibreTranslate download model pas first request | Tunggu aja ~10-30 detik. Request kedua dst bakal instant |
| **Docker container LibreTranslate mati sendiri** | RAM kurang | Kasih `-e LT_LOAD_ONLY="id,nl,en"` buat hemat RAM, atau upgrade RAM |
| **Port 5000 udah kepakai** | Aplikasi lain pake port 5000 | Ganti port: `-p 5050:5000`, terus update `LIBRETRANSLATE_URL` |
| **Rate-limit di Mode 1** | Shared Worker quota abis | Deploy Worker sendiri di Cloudflare (gratis, 30 menit) atau pindah ke Mode 2 |
| **"API Worker Error" di toast** | Worker down / timeout | Cek koneksi internet, coba lagi beberapa saat |

---

### 🎯 Rekomendasi Setup

```
┌─────────────────────────────────────────────────────────┐
│  Buat development / coba-coba                           │
│  → Mode 1 (Cloud)                                       │
│  → gak perlu setup apa-apa, langsung pnpm dev           │
├─────────────────────────────────────────────────────────┤
│  Buat daily driver / homeserver                         │
│  → Mode 2 (Lokal)                                       │
│  → Docker LibreTranslate + API_MODE=off                 │
│  → unlimited, no rate limit, full offline               │
├─────────────────────────────────────────────────────────┤
│  Buat production / public-facing                        │
│  → Mode 1 + Worker sendiri + Deploy Vercel              │
│  → atau Mode 2 + VPS + public IP                       │
└─────────────────────────────────────────────────────────┘
```

---

<a id="-english"></a>
## 🇬🇧 English

### 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Mode 1: Cloud (Worker Proxy)](#-mode-1-cloud-worker-proxy)
- [Mode 2: Local Unlimited (LibreTranslate + Docker)](#-mode-2-local-unlimited-libretranslate--docker)
- [Deploy to Vercel (Production)](#-deploy-to-vercel-production)
- [Deploy to VPS / Homeserver](#-deploy-to-vps--homeserver-1)
- [Key File Structure](#-key-file-structure)
- [Troubleshooting](#-troubleshooting-1)

---

### 📦 Prerequisites

| Tools | Version | How to Install |
|-------|---------|----------------|
| **Node.js** | ≥ 20.x | [nodejs.org](https://nodejs.org) |
| **pnpm** | latest | `npm install -g pnpm` |
| **Git** | any | [git-scm.com](https://git-scm.com) |
| **Docker** _(optional)_ | latest | [docker.com](https://docker.com) — for Mode 2 only |

---

### 🚀 Quick Start (All Modes)

```bash
# 1. Clone
git clone https://github.com/kandarlubis31/phrase-paraphraser.git
cd phrase-paraphraser

# 2. Install
pnpm install

# 3. Setup env
cp .env.example .env

# 4. Choose mode in .env (open .env, edit based on mode below)

# 5. Run!
pnpm dev
# → open http://localhost:4321
```

---

### ☁️ Mode 1: Cloud (Worker Proxy)

**Best for:** development, testing, or if you don't want any extra setup.

**How it works:** Translation requests are forwarded through a Cloudflare Worker proxy (free, shared quota).

```env
# .env
PUBLIC_API_MODE=on
PUBLIC_WORKER_URL=https://phrase-proxy.kandarlubis31.workers.dev

```

```bash
pnpm dev
# → http://localhost:4321
```

**Limitations:**
- Shared quota (with other users)
- Requires internet
- Rate-limited (~1 req/sec)

> 💡 **Go dedicated:** Deploy your own Worker on [Cloudflare Workers](https://workers.cloudflare.com) (free tier: 100K req/day), then update `PUBLIC_WORKER_URL` to your worker URL.

---

### 🏠 Mode 2: Local Unlimited (LibreTranslate + Docker)

**Best for:** homeserver, full offline, zero rate limits, unlimited usage.

**How it works:** 100% local translation via a LibreTranslate Docker container.

#### Step 1: Run LibreTranslate

```bash
# Pull & run LibreTranslate container
docker run -d \
  --name libretranslate \
  -p 5000:5000 \
  --restart unless-stopped \
  libretranslate/libretranslate

# Verify it's running
curl http://localhost:5000/languages
# → should return JSON list of languages
```

> ⚡ **First run downloads language models (~2-4 GB).** This only happens once. Subsequent runs are instant.

> 🔧 **Optional — save RAM:** If you only need ID, NL, EN:
> ```bash
> docker run -d --name libretranslate -p 5000:5000 \
>   -e LT_LOAD_ONLY="id,nl,en" \
>   libretranslate/libretranslate
> ```

#### Step 2: Configure .env

```env
# .env
PUBLIC_API_MODE=off
PUBLIC_LIBRETRANSLATE_URL=http://localhost:5000

```

#### Step 3: Run!

```bash
pnpm dev
# → http://localhost:4321
```

**Header will show a green `LOCAL` badge** — meaning all translations run on your own machine.

#### Access from Other Devices (LAN)

```env
# Replace localhost with your homeserver's LAN IP
PUBLIC_LIBRETRANSLATE_URL=http://192.168.1.100:5000
```

Note: The LibreTranslate container must listen on `0.0.0.0` (default behavior). Make sure your firewall allows port 5000.

---

### ▲ Deploy to Vercel (Production)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
pnpm deploy
# or:
vercel --prod
```

**Environment Variables in Vercel Dashboard:**
1. Open project dashboard → Settings → Environment Variables
2. Add:
   - `PUBLIC_API_MODE` = `on` (or `off` if your LibreTranslate is publicly accessible)
   - `PUBLIC_WORKER_URL` = your worker URL

> ⚠️ **Mode `off` on Vercel:** LibreTranslate must be reachable from the internet. Use a tunnel (Cloudflare Tunnel, ngrok, Tailscale Funnel) or a VPS with a public IP.

---

### 🖥️ Deploy to VPS / Homeserver

#### Option A: Static Export + Nginx

```bash
# Build static
pnpm build

# Serve output folder with Nginx / Caddy / Python
# Example using Python:
python3 -m http.server 8080 --directory dist/
```

#### Option B: Node Server (SSR)

```bash
# On your VPS:
git clone https://github.com/kandarlubis31/phrase-paraphraser.git
cd phrase-paraphraser
pnpm install
cp .env.example .env
# edit .env based on your mode

pnpm build
pnpm preview --host 0.0.0.0 --port 4321
# → access at http://your-vps-ip:4321
```

Use a process manager to keep it alive:

```bash
# Using PM2
npm install -g pm2
pm2 start "pnpm preview --host 0.0.0.0 --port 4321" --name phrase-paraphraser
pm2 save
pm2 startup
```

---

### 📁 Key File Structure

```
phrase-paraphraser/
├── .env                    ← YOUR SETTINGS HERE (copy from .env.example)
├── .env.example            ← Template (don't edit, commit as-is)
├── DEPLOY.md               ← YOU ARE HERE
├── README.md               ← Project overview
│
├── src/
│   ├── utils/
│   │   └── paraphraseEngine.ts   ← Translation logic + API_MODE branch
│   ├── client/
│   │   ├── paraphraseController.ts  ← UI orchestrator
│   │   ├── streamRenderer.ts        ← Streaming output
│   │   ├── dom.ts                   ← DOM cache
│   │   └── storage.ts               ← localStorage helpers
│   ├── components/              ← Astro UI components
│   └── pages/
│       └── index.astro          ← Main page
│
├── astro.config.mjs
├── tailwind.config.mjs
└── vercel.json
```

---

### 🔧 Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| **"Failed to fetch" in console** | LibreTranslate not running / wrong URL | Check `docker ps`, make sure container is running. Test: `curl http://localhost:5000/languages` |
| **Header badge still shows "CLOUD"** | `.env` not restarted | `Ctrl+C` → `pnpm dev` again (Astro needs restart to pick up `.env`) |
| **Translation slow in Mode 2** | LibreTranslate downloading models on first request | Wait ~10-30 secs. Subsequent requests are instant |
| **LibreTranslate Docker container keeps dying** | Not enough RAM | Use `-e LT_LOAD_ONLY="id,nl,en"` to save RAM, or upgrade RAM |
| **Port 5000 already in use** | Another app is using port 5000 | Change port: `-p 5050:5000`, then update `LIBRETRANSLATE_URL` |
| **Rate-limited in Mode 1** | Shared Worker quota exhausted | Deploy your own Worker on Cloudflare (free, 30 mins) or switch to Mode 2 |
| **"API Worker Error" in toast** | Worker is down / timed out | Check internet connection, try again later |

---

### 🎯 Recommended Setup

```
┌─────────────────────────────────────────────────────────┐
│  For development / trying things out                    │
│  → Mode 1 (Cloud)                                       │
│  → zero setup, just pnpm dev                            │
├─────────────────────────────────────────────────────────┤
│  For daily driver / homeserver                          │
│  → Mode 2 (Local)                                       │
│  → Docker LibreTranslate + API_MODE=off                 │
│  → unlimited, no rate limits, full offline              │
├─────────────────────────────────────────────────────────┤
│  For production / public-facing                         │
│  → Mode 1 + your own Worker + Vercel deploy             │
│  → or Mode 2 + VPS + public IP                         │
└─────────────────────────────────────────────────────────┘
```

---

<div align="center">

### 🎉 Udah bisa jalan? Cus langsung parafrase!

**Built with ❤️ by [Kandar Lubis](https://github.com/kandarlubis31)**

</div>
