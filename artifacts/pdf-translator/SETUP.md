# Local Development Setup

To run this project locally with the Vercel API proxy, follow these steps:

## Quick Start (Recommended - Using Vercel CLI)

### 1. Install Vercel CLI
```bash
npm install -g vercel
# or
pnpm add -g vercel
```

### 2. Create `.env.local` in project root
```
# .env.local
GEMINI_API_KEY=your_key_here  # Optional for local dev
GEMINI_MODEL=gemini-3.1-flash-lite-preview  # Optional for local dev
```

### 3. Run with Vercel CLI
```bash
cd artifacts/pdf-translator
vercel dev
```

This will automatically:
- Run Vite dev server
- Set up API routes on `/api/*`
- Handle all proxying correctly

The app will be available at `http://localhost:3000`

---

## Alternative: Manual Setup

If you don't want to use Vercel CLI:

### 1. Install dependencies
```bash
cd artifacts/pdf-translator
pnpm install
```

### 2. Create `.env.local` file
```bash
# Create in artifacts/pdf-translator directory
PORT=5173
BASE_PATH=/
```

### 3. Run dev server
```bash
pnpm run dev
```

⚠️ **Note:** With this method, the `/api/translate` endpoint won't work locally. You'll need to either:
- Deploy to Vercel first and test there
- Or use `vercel dev` (recommended)

---

## How to Use

1. Open the app (http://localhost:5173 or http://localhost:3000)
2. Click the Settings icon (gear icon in top right)
3. Select source and target languages
4. Upload a PDF file
5. Click the translate button

## Gemini API Key

This app uses a single server-side Gemini API key configured by the owner.

- Local dev (optional): set `GEMINI_API_KEY` in `.env.local` to test the API route with `vercel dev`.
- Production (Vercel): set `GEMINI_API_KEY` and `GEMINI_MODEL` in your Project Settings → Environment Variables.

---

## API Key Security

✅ **Why it's safe:**
- The API key is stored only on the server (Vercel Environment Variable)
- It is never exposed to the browser or stored in localStorage
- Frontend calls your own backend at `/api/translate`; the backend calls Gemini

---

## Deploying to Vercel

1. Push your code to GitHub/GitLab
2. Go to https://vercel.com
3. Connect your repository
4. Click "Deploy"
5. That's it! ✨

The `/api` folder will automatically be deployed as Vercel Functions.

Before using the app, set the `GEMINI_API_KEY` in Project Settings → Environment Variables.

