# 🤝 Contributing to Phrase Paraphraser

<div align="center">

**LETSGOO! 🚀** · Mau bantu bikin project ini makin keren? Semua kontribusi berharga!

[🇮🇩 Bahasa Indonesia](#-bahasa-indonesia) · [🇬🇧 English](#-english)

</div>

---

<a id="-bahasa-indonesia"></a>
## 🇮🇩 Bahasa Indonesia

### ✨ Selamat Datang, Contributor!

Kontribusi **SANGAT, SANGAT diterima!** 🎉🎉🎉 Mau itu:

- Perbaikan typo atau broken link
- Bersihin legacy code
- Nambah fitur keren
- Improve dokumentasi
- Sekadar kasih saran atau ide
- Bantu jawab issue

... semuanya berharga! Project ini open source justru biar kita bisa belajar dan bangun bareng-bareng.

> **"Nyari first contribution? Udah di repo yang tepat bro!"** 😎

---

### 🐣 First Timer? Mulai Dari Sini!

1. **Cari issue berlabel [`good first issue`](https://github.com/kandarlubis31/phrase-paraphraser/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)** — ini issue yang sengaja dibuat ramah buat pemula
2. Tinggal komen **"I'd like to work on this"** — nanti aku assign ke kamu
3. Nggak ada issue yang cocok? Buka aja issue baru dengan ide kamu!

**Belum pernah contribute ke open source sama sekali?** Santai! Ini repo yang tepat buat mulai. Strukturnya simpel (Astro + TypeScript, 6 komponen doang), dan banyak file legacy yang siap kamu refactor sebagai latihan.

---

### 🏷️ Label Issues

| Label | Artinya |
|-------|---------|
| `good first issue` | Issue ramah pemula. Cocok buat first contribution! |
| `help wanted` | Butuh bantuan ekstra. Semua orang dipersilakan! |
| `hacktoberfest` | Issue khusus event Hacktoberfest |
| `bug` | Ada yang error? Let's fix it! |
| `enhancement` | Request fitur baru atau improvement |
| `documentation` | Perbaikan dokumentasi / README |
| `refactor` | Bersihin kode, hapus legacy, improve struktur |
| `discussion` | Brainstorming ide, diskusi arsitektur |

---

### 🚀 Alur Kontribusi

```bash
# 1. Fork & clone
gh repo fork kandarlubis31/phrase-paraphraser --clone
cd phrase-paraphraser

# 2. Bikin branch keren
git checkout -b feat/fitur-keren-kamu
# atau: fix/, docs/, refactor/, chore/

# 3. Install + setup
pnpm install && cp .env.example .env

# 4. Koding! (hot reload jalan terus)
pnpm dev

# 5. Pastikan build OK sebelum commit
pnpm build

# 6. Commit pake conventional commits
git commit -m "feat: tambah fitur keren yang bikin ngiler"

# 7. Push & buka PR!
git push origin feat/fitur-keren-kamu
# Buka Pull Request di GitHub 🚀
```

> 💡 **Ga punya GitHub CLI (`gh`)?** Pakai cara manual: fork lewat web GitHub, terus `git clone` fork kamu.

---

### ✅ PR Checklist

Sebelum kamu klik "Create Pull Request", pastiin ini semua udah beres:

- [ ] `pnpm build` sukses tanpa error
- [ ] Udah dites di dev server (`pnpm dev`)
- [ ] Nggak ada console error di browser
- [ ] Kalau nambah fitur, update dokumentasi juga
- [ ] Commit message udah pake [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, dll)
- [ ] Branch kamu udah rebase ke `master` terbaru

---

### 💻 Development Workflow

```bash
# Development (hot reload otomatis)
pnpm dev
# Buka http://localhost:4321 — setiap save file, browser auto-refresh!

# Build production (buat ngecek apakah ada error)
pnpm build

# Preview hasil build
pnpm preview
```

**Testing lokal setelah ngoding:**

1. Input teks pendek (`"Halo bro, apa kabar?"`) → cek hasil parafrase
2. Input teks panjang → cek cooldown system jalan
3. `Ctrl+Enter` → harusnya langsung eksekusi
4. Refresh halaman → input & hasil harusnya persist (localStorage)

---

### 📋 Code Style (Informal)

Kita nggak strict-strict amat, tapi usahakan:

| Area | Style |
|------|-------|
| **Komponen Astro** | Script di dalam `<script>` tag, style di dalam `<style>` tag (scoped) |
| **Utils TypeScript** | Pure functions, fully typed, export yang dipakai aja |
| **Naming** | `camelCase` buat variables/functions, `PascalCase` buat komponen |
| **Comments** | Bebas bahasa Indonesia atau Inggris. Kalau logic rumit, kasih penjelasan singkat |
| **Gaya ngoding** | Santai tapi rapi. Kalau ragu, lihat aja code yang udah ada dan ikutin style-nya |

---

### 🗂️ Panduan Struktur File

Biar nggak nyasar pas nyari file buat diedit:

| File / Folder | Status | Deskripsi |
|---------------|--------|-----------|
| `src/utils/paraphraseEngine.ts` | ⭐ Active | Engine utama: translate, diff, validasi, cooldown |
| `src/client/paraphraseController.ts` | ⭐ Active | Orchestrator UI: init, pipeline, cancel, state |
| `src/client/streamRenderer.ts` | Active | Streaming output (token → DOM) |
| `src/client/dom.ts` | Active | DOM element cache |
| `src/client/storage.ts` | Active | localStorage/sessionStorage helpers |
| `src/components/TranslateBox.astro` | ⭐ Active | Komponen utama (script cuma 5 baris!) |
| `src/components/AppHeader.astro` | Active | Header + live clock + mode badge |
| `src/components/EditorialFeatures.astro` | Active | Highlight fitur |
| `src/components/FlowVisual.astro` | Active | Visualisasi pipeline |
| `src/components/ResultProgress.astro` | Active | Panel hasil + skeleton + empty state |

---

### 🙋 Butuh Bantuan?

- **Tanya soal code?** Buka [discussion](https://github.com/kandarlubis31/phrase-paraphraser/issues?q=is%3Aissue+is%3Aopen+label%3Adiscussion) atau bikin issue baru
- **Mau ngobrol santai?** DM aja di [Instagram @kandar.lubis31](https://www.instagram.com/kandar.lubis31)
- **Nemu bug?** Buka issue dengan label `bug`
- **Request fitur?** Buka issue dengan label `enhancement`

---

<a id="-english"></a>
## 🇬🇧 English

### ✨ Welcome, Contributor!

Contributions are **MORE than welcome!** 🎉🎉🎉 Whether it's:

- Fixing a typo or broken link
- Cleaning up legacy code
- Adding a cool new feature
- Improving documentation
- Sharing ideas or suggestions
- Helping answer issues

... it all matters! This project is open source precisely so we can learn and build together.

> **"Looking for your first open source contribution? You just found the right repo!"** 😎

---

### 🐣 First Timer? Start Here!

1. **Look for issues labeled [`good first issue`](https://github.com/kandarlubis31/phrase-paraphraser/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)** — these are intentionally beginner-friendly
2. Drop a comment saying **"I'd like to work on this"** — I'll assign it to you
3. No suitable issue? Open a new one with your idea!

**Never contributed to open source before?** No worries! This is the perfect repo to start. The structure is simple (Astro + TypeScript, just 6 components), and there are legacy files ready for you to practice refactoring.

---

### 🏷️ Issue Labels

| Label | Meaning |
|-------|---------|
| `good first issue` | Beginner-friendly. Perfect for your first PR! |
| `help wanted` | Extra help needed — everyone's invited! |
| `hacktoberfest` | Issues for Hacktoberfest participants |
| `bug` | Something broken? Let's fix it! |
| `enhancement` | New feature request or improvement |
| `documentation` | Documentation / README improvements |
| `refactor` | Code cleanup, remove legacy, improve structure |
| `discussion` | Brainstorming ideas, architecture discussions |

---

### 🚀 Contribution Workflow

```bash
# 1. Fork & clone
gh repo fork kandarlubis31/phrase-paraphraser --clone
cd phrase-paraphraser

# 2. Create a cool branch
git checkout -b feat/your-cool-feature
# or: fix/, docs/, refactor/, chore/

# 3. Install + setup
pnpm install && cp .env.example .env

# 4. Code away! (hot reload FTW)
pnpm dev

# 5. Make sure it builds before committing
pnpm build

# 6. Commit using conventional commits
git commit -m "feat: add an awesome feature that makes people drool"

# 7. Push & open a PR!
git push origin feat/your-cool-feature
# Open a Pull Request on GitHub 🚀
```

> 💡 **Don't have GitHub CLI (`gh`)?** Fork via GitHub's web UI, then `git clone` your fork manually.

---

### ✅ PR Checklist

Before you hit that "Create Pull Request" button:

- [ ] `pnpm build` passes without errors
- [ ] Tested on dev server (`pnpm dev`)
- [ ] No console errors in the browser
- [ ] Updated documentation if adding features
- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, etc.)
- [ ] Branch is rebased onto the latest `master`

---

### 💻 Development Workflow

```bash
# Development (auto hot reload)
pnpm dev
# Open http://localhost:4321 — every file save triggers an auto-refresh!

# Production build (verify nothing's broken)
pnpm build

# Preview production build
pnpm preview
```

**Local testing after coding:**

1. Try short input (`"Halo bro, apa kabar?"`) → check paraphrase result
2. Try long input → verify cooldown system kicks in
3. `Ctrl+Enter` → should execute immediately
4. Refresh page → input & results should persist (localStorage)

---

### 📋 Code Style (Informal)

We're not super strict, but try to follow these:

| Area | Style |
|------|-------|
| **Astro components** | Logic in `<script>` tags, styles in `<style>` tags (scoped) |
| **TypeScript utils** | Pure functions, fully typed, export only what's needed |
| **Naming** | `camelCase` for variables/functions, `PascalCase` for components |
| **Comments** | English or Indonesian are fine. If the logic is complex, leave a brief explanation |
| **Vibe** | Clean and readable. When in doubt, look at existing code and match the style |

---

### 🗂️ File Structure Guide

So you don't get lost looking for the right file to edit:

| File / Folder | Status | Description |
|---------------|--------|-------------|
| `src/utils/paraphraseEngine.ts` | ⭐ Active | Core engine: translate, diff, validation, cooldown |
| `src/client/paraphraseController.ts` | ⭐ Active | UI orchestrator: init, pipeline, cancel, state |
| `src/client/streamRenderer.ts` | Active | Streaming output (token → DOM) |
| `src/client/dom.ts` | Active | DOM element cache |
| `src/client/storage.ts` | Active | localStorage/sessionStorage helpers |
| `src/components/TranslateBox.astro` | ⭐ Active | Main component (only 5 lines of script!) |
| `src/components/AppHeader.astro` | Active | Header + live clock + mode badge |
| `src/components/EditorialFeatures.astro` | Active | Feature highlights |
| `src/components/FlowVisual.astro` | Active | Pipeline visualization |
| `src/components/ResultProgress.astro` | Active | Results panel + skeleton + empty state |

---

### 🙋 Need Help?

- **Code question?** Open a [discussion](https://github.com/kandarlubis31/phrase-paraphraser/issues?q=is%3Aissue+is%3Aopen+label%3Adiscussion) or create a new issue
- **Casual chat?** DM me on [Instagram @kandar.lubis31](https://www.instagram.com/kandar.lubis31)
- **Found a bug?** Open an issue with the `bug` label
- **Feature request?** Open an issue with the `enhancement` label

---

<div align="center">

Made with ❤️ by [Kandar Lubis](https://github.com/kandarlubis31) · [MIT License](./LICENSE)

</div>
