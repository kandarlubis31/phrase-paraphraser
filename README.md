# Phrase Paraphraser

Translate text through a chain of languages for unique paraphrasing:
**Indonesian → Dutch → English → Indonesian**

## Features

- ✨ Multi-language translation chain using MyMemory API (free, no auth)
- 🚀 Astro + Tailwind CSS for fast, minimal bundle
- 🌐 Deployed on Vercel with serverless functions
- 📱 Responsive design with dark theme
- 📊 Visual step-by-step progress
- 🎯 Character limit (500 chars)

## Setup Instructions for Agent

### Step 1: Create project
```bash
npm create astro@latest phrase-paraphraser -- --template minimal
cd phrase-paraphraser
```

### Step 2: Copy all files
Copy all the files from this directory into the project root:
- `astro.config.mjs`
- `tailwind.config.mjs`
- `vercel.json`
- `package.json` (update dependencies)
- `.gitignore`
- `src/` (all folders and files)

### Step 3: Install dependencies
```bash
npm install
```

### Step 4: Run locally
```bash
npm run dev
```
Visit `http://localhost:3000`

### Step 5: Deploy to Vercel
```bash
npm install -g vercel
vercel login
npm run build
vercel --prod
```

## Project Structure

```
src/
├── pages/
│   ├── index.astro           # Main page
│   └── api/
│       └── paraphrase.ts    # POST endpoint
├── components/
│   ├── TranslateBox.astro   # Main UI
│   └── StepProgress.astro   # Chain visualization
├── lib/
│   └── translate.ts         # Translation logic
└── styles/
    └── global.css           # Tailwind + custom styles
```

## API Endpoint

**POST** `/api/paraphrase`

**Request:**
```json
{ "text": "Your Indonesian text here" }
```

**Response:**
```json
{
  "success": true,
  "steps": [
    { "lang": "nl", "flag": "🇳🇱", "text": "..." },
    { "lang": "en", "flag": "🇬🇧", "text": "..." },
    { "lang": "id", "flag": "🇮🇩", "text": "..." }
  ],
  "result": "Final paraphrased text"
}
```

## Translation Chain

MyMemory API endpoints:
- `id` → `nl`: Indonesian to Dutch
- `nl` → `en`: Dutch to English
- `en` → `id`: English back to Indonesian

## Environment

No authentication needed for MyMemory API. All requests are public.

## Notes

- Max text length: 500 characters
- Free API (MyMemory) - no rate limiting issues for personal use
- Vercel serverless handles all translations on the backend
- SSR rendering for instant results after form submission
