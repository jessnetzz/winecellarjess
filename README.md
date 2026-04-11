# Wine Cellar

A premium personal wine cellar app built with React, TypeScript, Tailwind CSS, Vite, Supabase Auth, Supabase Postgres, CSV import/export, tasting logs, drink-window intelligence, and secure AI-assisted autofill.

## Architecture

- `src/App.tsx` gates the product behind Supabase Auth, keeps the existing dashboard/table/gallery UX, and calls async persistence handlers.
- `src/services/supabaseClient.ts` creates the typed Supabase browser client from Vite environment variables.
- `src/services/authService.ts` wraps email/password sign up, sign in, and sign out.
- `src/services/wineStorage.ts` is now the repository layer. It maps normalized Supabase rows into the existing `Wine` app model and handles wine, storage location, tasting entry, demo seed, CSV import, and one-time localStorage migration operations.
- `src/hooks/usePersistentWines.ts` owns loading, mutation, error, and local-import state for the authenticated user.
- `api/wine-autofill.ts` is a Vercel serverless endpoint that validates wine autofill requests, calls OpenAI server-side, validates the structured response, and returns safe JSON to the form.
- `src/services/aiWineAutofillService.ts` is the frontend API client for the AI Sommelier Autofill flow.
- `supabase/migrations/202604100001_initial_cellar_schema.sql` creates the database schema, indexes, triggers, and row-level security policies.

## Supabase Setup

1. Create a Supabase project from the Supabase dashboard.
2. In the project dashboard, go to **Project Settings > API**.
3. Copy the **Project URL** and **anon public key**.
4. Create a local `.env` file:

```bash
cp .env.example .env
```

5. Fill in:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4.1-mini
```

Do not put service-role keys in this Vite app. Browser clients should only use the anon/public key; row-level security protects user data.
`OPENAI_API_KEY` is used only by the Vercel serverless function in `api/wine-autofill.ts`; it must never be exposed with a `VITE_` prefix.

## Apply Database Migrations

Option A, Supabase SQL editor:

1. Open the Supabase dashboard.
2. Go to **SQL Editor**.
3. Paste the contents of `supabase/migrations/202604100001_initial_cellar_schema.sql`.
4. Run it.

Option B, Supabase CLI:

```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

## Run Locally

```bash
npm install
npm run dev
```

Open the local Vite URL. Sign up or sign in with email/password, then add wines, import CSV, or load demo data.

For local AI Sommelier Autofill testing, run through Vercel’s local runtime so `/api/wine-autofill` is available:

```bash
npm exec -- vercel dev
```

Make sure `.env` includes `OPENAI_API_KEY`. `OPENAI_MODEL` is optional and defaults to `gpt-4.1-mini`.

## LocalStorage Migration

If the old app has wine data in `localStorage` under `wine-cellar:v1:wines`, the app shows a one-time **Import my local data** banner after sign in. Import maps existing local wine records into Supabase storage locations, wines, and tasting entries, then marks that user as imported to avoid repeat imports.

## CSV Import Format

Import accepts a header row. The most useful columns are:

```text
name,producer,vintage,appellation,region,country,varietal,style,bottleSize,quantity,purchaseDate,purchasePrice,marketValue,alcoholPercent,drinkWindowStart,drinkWindowEnd,bestDrinkBy,storageLocation,acquisitionSource,status,tastingNotes,personalRating,foodPairingNotes,aiAdvice,imageUrl
```

`name`, `producer`, `vintage`, and `quantity` are validated most strictly.

## Vercel Deployment Checklist

1. Push the app to a Git provider connected to Vercel.
2. Add these Vercel environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional, defaults to `gpt-4.1-mini`)
3. Keep the build command as:

```bash
npm run build
```

4. Keep the output directory as:

```bash
dist
```

5. In Supabase Auth settings, add your Vercel production URL to allowed redirect/site URLs if you later add OAuth or email-confirmation redirects.
6. Apply the Supabase migration before using the deployed app.

## OpenAI Autofill

The AI Sommelier Autofill flow calls `src/services/aiWineAutofillService.ts`, which posts producer, wine name, and vintage to `api/wine-autofill.ts`. That endpoint calls OpenAI with a server-side `OPENAI_API_KEY`, requests structured JSON, validates the response, and returns normalized data to the form. The form highlights AI-suggested fields and keeps every field editable before saving through the existing Supabase path.

The tasting advice panel still uses `src/services/aiAdviceService.ts`. If you later want real AI tasting advice too, follow the same backend-only pattern used by `api/wine-autofill.ts`.
