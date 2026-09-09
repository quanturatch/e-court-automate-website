# E-Court Automate website

Public site for **E-Court Automate** (Quantura Technologies). Deploy on **Vercel**.

## Local

```bash
cd e-court-automate-website
npm install
npm run dev
```

Open http://localhost:3060

## Vercel

1. Push this folder to GitHub (or import the directory in the Vercel dashboard).
2. Framework: Next.js. Root directory: this folder.
3. **Page views persist only if you add Upstash Redis** (free):
   - Create a Redis database at [upstash.com](https://upstash.com)
   - In Vercel project → Settings → Environment Variables:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
4. Redeploy.

Without Upstash, the counter still works on your laptop (`data/views.json`) but **resets on each Vercel serverless instance**.

## Footer

Links to [https://www.quanturatech.com](https://www.quanturatech.com) and shows total page views.
