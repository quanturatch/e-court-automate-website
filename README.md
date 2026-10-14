# E-Court Automate website

Public site for **E-Court Automate** (Quantura Technologies). Deploy on **Vercel**.

Footer shows **page views** and **how many people copied the installer**. Those counts persist:

- **Local:** `data/stats.json`
- **Vercel:** a durable remote counter (survives deploys; `/tmp` SQLite does not)

## Local

```bash
cd e-court-automate-website
npm install
npm run dev
```

Open http://localhost:3060

## Vercel

1. Import this folder in Vercel (Next.js).
2. Redeploy after pulling this change.

The footer must show numbers after that deploy (not “…”, not a reset to zero on every push).

## Footer

Links to [https://www.quanturatech.com](https://www.quanturatech.com), contact +91 94940 37782, page views, and installer copies.
