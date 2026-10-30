# KisanLabel AI
### Smart Farming. Safer Decisions.

KisanLabel AI is a complete, production-ready web application that helps Indian farmers
understand pesticide product labels using Artificial Intelligence. Scan a label photograph,
and the app extracts product identification, crop and pest information, dosage and tank
details, waiting periods, and safety instructions — then explains everything in your
preferred language.

---

## Features

- **AI Pesticide Label Scanner** — upload JPG/PNG/PDF images or capture directly with the
  camera, rotate and remove images, and scan multiple label pages at once.
- **Google Gemini analysis (online, default)** — a secure backend edge function reads the
  label photograph with Gemini image understanding and returns structured JSON.
- **Offline AI backup (Ollama + Tesseract)** — when the internet is down, the app falls back
  to a local Gemma model via Ollama with on-device OCR. No data leaves your device.
- **9 Indian languages** — English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi,
  Bengali, Punjabi. Chemical names, numbers, and units stay exact.
- **Complete analysis dashboard** — product identification, crop & pest info, dosage & tank
  info, waiting period, safety instructions, and visible warning cards.
- **AI Farmer Assistant** — an interactive chatbot that answers questions based only on the
  scanned label (no invented recommendations).
- **Scan history** — Supabase for cloud sync, IndexedDB for local offline storage. Upload of
  local scans is optional and requires your consent.
- **Progressive Web App** — installable, offline-capable with a service worker and asset
  caching.
- **Safety-first** — clearly distinguishes extracted information, AI explanations, and
  missing/unclear data. Never invents dosage or mixing ratios.

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite, Tailwind CSS, Lucide React icons.
- **Online database / backend:** Supabase (Postgres + Edge Functions).
- **Offline storage:** IndexedDB.
- **Online AI:** Google Gemini (`gemini-2.0-flash` by default, configurable).
- **Offline AI:** Ollama (`gemma:2b` by default) + Tesseract.js OCR.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional, for offline mode) [Ollama](https://ollama.com) installed and running, with the
  model pulled:
  ```bash
  ollama pull gemma:2b
  ollama serve   # runs on http://localhost:11434
  ```

### Install & run

```bash
npm install
npm run dev
```

The app runs on the Vite dev server (printed in the terminal).

### Build for production

```bash
npm run build
npm run preview
```

---

## Environment Variables

Supabase connection details (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are already
populated in the project environment.

The one secret you need to add for **online (Gemini) mode** is the Gemini API key, configured
as an **edge function secret** (never in frontend code):

- `GEMINI_API_KEY` — your Google Gemini API key (from
  https://aistudio.google.com/app/apikey).

Optional:

- `GEMINI_MODEL` — override the default model (`gemini-2.0-flash`).

If the Gemini key is not configured, the app shows a clear setup message and offers the
offline mode instead — it never shows fake results.

---

## Project Structure

```
src/
  components/     Shared UI (Navbar, Footer, AnalysisDashboard, …)
  context/        App-wide state (AI mode, language, online status, routing)
  lib/            Reusable services (supabase, ocr, aiAnalysis, aiChat, scanHistory, …)
  pages/          Page views (Landing, Scan, History, Assistant, Dashboard, About)
  types/          Shared TypeScript types
supabase/
  config.toml     Supabase project + edge function config
  functions/
    gemini-analyze/   Gemini edge function (image understanding + chat)
  migrations/     Database migrations (scans table + RLS)
public/
  sw.js           Service worker (offline caching)
  manifest.webmanifest
  favicon.svg
```

---

## How AI modes work

| Mode | Engine | Input | Needs internet |
|------|--------|-------|----------------|
| Online (default) | Google Gemini | label image(s) sent to the edge function | Yes |
| Offline (backup) | Ollama + Tesseract.js | image(s) → local OCR → local model | No |

You can switch modes manually from the top navigation. If Gemini is unavailable the app
informs you and offers offline mode (when Ollama is detected) — it never switches silently.

---

## Safety & Accuracy

KisanLabel AI never hallucinates pesticide information:

1. **Extracted from the label** — shown as plain values.
2. **AI-generated explanations** — clearly marked.
3. **Missing / uncertain** — always flagged in amber.

It does not independently calculate doses or recommend pesticide combinations. Always
follow the official product label and consult a qualified agricultural expert for
application decisions.

---

## License

For educational and demonstration purposes. Always follow official pesticide label
instructions and local regulations.
