# E-Court Automate website

Public site for **E-Court Automate** (Quantura Technologies). Deploy on **Vercel**.

Page views are stored in a local **SQLite** file: `data/views.sqlite` (table `page_views`). No Redis.

## Local

```bash
cd e-court-automate-website
npm install
npm run dev
```

Open http://localhost:3060

## Vercel

1. Import this folder in Vercel (Next.js).
2. Redeploy.

Counts are stored in SQLite (`data/views.sqlite`) when that file is writable (local / a VPS). On **Vercel** the app disk is read-only, so the same table is kept under `/tmp` (or a JSON file if SQLite cannot load). Redis is not used.

Redeploy after pulling this change so the footer shows a number instead of “…”.

## Footer

Links to [https://www.quanturatech.com](https://www.quanturatech.com) and shows total page views.
