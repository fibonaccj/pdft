# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

### PDF Translator (`artifacts/pdf-translator`)
- **Type**: React + Vite, frontend-only (no backend required)
- **Preview path**: `/`
- **Purpose**: Upload PDF files and translate pages using Gemini AI. Captures the rendered PDF canvas and sends it to Gemini for translation.
- **Key features**:
  - First-visit settings dialog with Gemini API key, source/target language, model selection (default: gemini-2.0-flash-lite), and notes
  - All settings persisted to localStorage (no backend, fully client-side)
  - Split-screen: PDF viewer (left) with zoom in/out/reset and page navigation, translation output (right)
  - Centered "Translate" button between panels — captures the PDF canvas and calls Gemini API
  - Donation section in settings with BNB QR code and wallet address
- **Dependencies**: `pdfjs-dist` for PDF rendering, Gemini REST API for translation

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
