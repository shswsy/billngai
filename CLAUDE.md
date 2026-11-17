# CLAUDE.md — billngai (บิลง่าย)

Portfolio project for the user's Fastwork profile: free Thai quotation / invoice / receipt generator.
Static React 19 + TS + Vite app, no backend; all data in browser localStorage (`billngai:*` keys).

- `npm run dev` · `npm test` (vitest: baht text, PromptPay payload, totals) · `npm run build` · `npm run lint` (oxlint)
- Deploy: GitHub Pages via `.github/workflows/deploy.yml` on push to `main`; `vite.config.ts` uses `base: './'`.
- Print/PDF = browser print of `.paper` (A4, Sarabun). Check print with headless Chrome `--print-to-pdf` against `/?demo`.
- `/?demo` loads `src/lib/sample.ts` only when nothing is saved yet (never overwrites user data).
- UI text is Thai; user writes in Thai.
