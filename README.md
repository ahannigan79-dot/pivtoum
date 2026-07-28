# Pivotum

Helping parents understand how AI is reshaping their kids' career choices — and how to guide them.

This is a [Next.js](https://nextjs.org) (App Router + TypeScript) site, deployed on [Vercel](https://vercel.com).

## Getting started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the local development server   |
| `npm run build` | Create a production build            |
| `npm run start` | Serve the production build locally   |
| `npm run lint`  | Run Next.js linting                  |

## Deploying to Vercel

1. Push this repository to GitHub (branch is already configured).
2. In [Vercel](https://vercel.com/new), import the `pivtoum` repository.
3. Vercel auto-detects Next.js — no configuration needed. Click **Deploy**.

Every push to the connected branch triggers a new deployment automatically.

## Project structure

```
app/
  layout.tsx        Root layout + site metadata
  page.tsx          Landing page (skeleton)
  page.module.css   Landing page styles
  globals.css       Global styles / theme tokens
```
