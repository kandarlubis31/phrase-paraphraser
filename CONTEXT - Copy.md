FASE 1 — AUDIT (read-only, per domain)

Prompt 1 — Audit Arsitektur & Struktur

text
Audit struktur project secara menyeluruh: organisasi folder src/client, src/utils, src/components, src/pages, konsistensi naming, separation of concern antara controller/engine/komponen, dan potensi circular dependency. Jangan ubah kode apa pun. Simpan temuan sebagai acuan untuk prompt berikutnya.

Prompt 2 — Audit Client Modules

text
Berdasarkan hasil audit arsitektur, audit khusus src/client/ (paraphraseController.ts, streamRenderer.ts, dom.ts, storage.ts). Cari race condition, memory leak (event listener tidak di-cleanup), state management yang tidak konsisten, null-check yang kurang pada dom.ts, dan potensi bug di flow cancel/AbortController. Jangan ubah kode.

Prompt 3 — Audit paraphraseEngine.ts

text
Audit paraphraseEngine.ts secara mendalam: logika translate() dual-mode (Worker vs LibreTranslate), token slang [#900]-[#906], LCS diff algorithm di highlightDifferences, validateInputText, dan cooldown mechanism. Cari edge case yang belum tertangani (misal: token leak, encoding issue, race antara dua mode API), serta duplikasi logic antara branch API_MODE. Jangan ubah kode.

Prompt 4 — Audit Komponen Astro

text
Audit seluruh komponen di src/components/ (TranslateBox, AppHeader, EditorialFeatures, FlowVisual, ResultProgress) dan src/pages/index.astro. Cari script yang seharusnya sudah dipindah ke src/client tapi masih nyangkut, props/typing yang kurang ketat, serta konsistensi antar komponen. Jangan ubah kode.

Prompt 5 — Audit Security & Error Handling

text
Berdasarkan seluruh audit sebelumnya, fokus audit ke aspek security dan error handling: penggunaan insertAdjacentHTML (potensi XSS residual), exposure env var di client bundle, validasi input sebelum fetch, timeout handling, dan error message yang ditampilkan ke user (apakah bocorin detail internal). Jangan ubah kode.

Prompt 6 — Audit Accessibility & SEO

text
Audit a11y (ARIA label, keyboard navigation, focus state, contrast warna terminal palette) dan SEO (OG meta tags di index.astro, semantic HTML, heading hierarchy). Jangan ubah kode.

Prompt 7 — Audit Styling & Tailwind

text
Audit konsistensi Tailwind: penggunaan palet terminal (11 shade), duplicate utility class, custom CSS di global.css yang bisa disederhanakan pakai theme(), serta inkonsistensi spacing/radius/shadow antar komponen. Jangan ubah kode.
FASE 2 — CRITICAL FIX (berdasarkan hasil audit)

Prompt 8 — Fix Critical: Client Modules

text
Berdasarkan hasil audit client modules, perbaiki seluruh bug prioritas tinggi: race condition, memory leak, null-check dom.ts, dan masalah AbortController. Jangan ubah UI atau behavior fitur, hanya perbaiki bug yang ditemukan.

Prompt 9 — Fix Critical: paraphraseEngine

text
Berdasarkan hasil audit paraphraseEngine, perbaiki bug prioritas tinggi terkait dual-mode translate, token slang, dan diff algorithm. Pastikan kedua mode (API_MODE on/off) tetap berfungsi identik secara behavior setelah perbaikan.

Prompt 10 — Fix Critical: Security & A11y

text
Berdasarkan hasil audit security dan a11y, perbaiki seluruh temuan prioritas tinggi: potensi XSS, validasi input, ARIA label yang hilang, dan keyboard navigation yang rusak. Jangan ubah tampilan visual.
FASE 3 — REFACTOR

Prompt 11 — Refactor Client Modules

text
Setelah seluruh critical fix di client modules selesai, refactor untuk readability dan modularitas: pecah fungsi yang terlalu besar di paraphraseController.ts, hilangkan duplikasi logic antar modul. Pertahankan seluruh behavior dan fitur.

Prompt 12 — Refactor paraphraseEngine

text
Refactor paraphraseEngine.ts: pisahkan logic per API mode jadi fungsi terpisah yang jelas (worker adapter vs libretranslate adapter), extract token slang map jadi konstanta terpisah, sederhanakan LCS diff jika memungkinkan. Pertahankan seluruh fitur dan hasil translate yang identik.

Prompt 13 — Refactor Komponen Astro

text
Refactor komponen Astro: pastikan tidak ada script tersisa di luar src/client, ekstrak UI state (empty/loading/error/result) jadi lebih reusable jika ada duplikasi antar komponen. Pertahankan tampilan dan fitur.
FASE 4 — PERFORMANCE OPTIMIZATION

Prompt 14 — Optimize Streaming & Rendering

text
Optimalkan streamRenderer.ts dan proses render token streaming: cek batching 15ms sudah optimal, cek reflow/repaint berlebihan, cek apakah insertAdjacentHTML dipanggil efisien. Jangan ubah UX visual streaming yang sudah ada.

Prompt 15 — Optimize Bundle & Loading

text
Optimalkan bundle size dan loading: cek dynamic import untuk modul yang tidak dibutuhkan saat initial load, cek font loading, cek apakah ada dependency yang bisa di-lazy-load. Jangan ubah UX.

Prompt 16 — Optimize Network & Request Handling

text
Optimalkan request ke translation API: cek retry logic, timeout 30s apakah optimal, cek apakah ada request redundant/duplicate saat pipeline jalan, cek cleanup AbortController setelah selesai. Jangan ubah behavior fitur.
FASE 5 — STYLING CLEANUP

Prompt 17 — Tailwind & CSS Cleanup

text
Berdasarkan hasil audit styling, rapikan seluruh class Tailwind: hapus duplicate utility, konsolidasi custom CSS ke theme() jika perlu, samakan spacing/radius/shadow antar komponen. Jangan ubah tampilan visual final.
FASE 6 — UX POLISH

Prompt 18 — UX Polish

text
Lakukan polish UX kecil: pastikan loading skeleton, empty state, error state, cancel flow, dan cooldown countdown terasa mulus di mobile dan desktop. Perbaiki friction kecil tanpa mengubah identitas desain terminal yang sudah ada.
FASE 7 — VALIDATE & FINAL QA

Prompt 19 — Validasi End-to-End

text
Lakukan validasi menyeluruh terhadap seluruh perubahan dari prompt-prompt sebelumnya. Test kedua mode (PUBLIC_API_MODE=on dan off) memberikan hasil yang konsisten, pastikan tidak ada regression di pipeline translate ID→NL→EN→ID, cancel flow, dan cooldown.

Prompt 20 — Final QA

text
Lakukan review terakhir: pastikan tidak ada TypeScript error (strict mode), tidak ada lint issue, tidak ada import tidak terpakai, tidak ada dead code, tidak ada console.log tersisa. Pastikan project dalam kondisi production-ready untuk deploy ke Vercel maupun self-hosted.