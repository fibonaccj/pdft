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
3. **Enter your Gemini API Key** 
   - Get one free at: https://aistudio.google.com/app/apikeys
4. Select source and target languages
5. Upload a PDF file
6. Click the translate button

## Getting a Gemini API Key

1. Go to https://aistudio.google.com/app/apikeys
2. Click "Create API key in new project"
3. Copy the key
4. Paste it in the Settings dialog

---

## API Key Security

✅ **Why it's safe:**
- Your API key is sent directly to the backend (`/api/translate` endpoint)
- The backend forwards it securely to Google's Gemini API  
- Your key is **NEVER stored** in localStorage or anywhere else
- Each translation request uses your temporarily-provided key

---

## Deploying to Vercel

1. Push your code to GitHub/GitLab
2. Go to https://vercel.com
3. Connect your repository
4. Click "Deploy"
5. That's it! ✨

The `/api` folder will automatically be deployed as Vercel Functions.

No environment variables needed - users provide their own API keys when using the app.

