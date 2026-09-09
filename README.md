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

On Vercel the app filesystem is not durable, so the SQLite file can reset between deploys. For a count that never resets, run this site on a VPS (or keep the same `data/views.sqlite` file). Redis is not required.

## Footer

Links to [https://www.quanturatech.com](https://www.quanturatech.com) and shows total page views.
