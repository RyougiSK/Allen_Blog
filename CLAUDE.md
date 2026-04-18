# Personal Blog — Next.js + Supabase

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript (Strict)
- **Database / Auth:** Supabase (`@supabase/ssr`)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Utilities:** date-fns
- **Components:** Shadcn UI (added as needed)

## Project Goals

1. Build a responsive, minimal blog feed with a professional "Linear-style" dark-mode UI.
2. Implement Supabase SSR utilities for secure, cookie-based auth.
3. Create a Markdown-based editor for writing and publishing posts.
4. Deliver high-quality typography and polished visual design throughout.

## Code Style & Conventions

- **Design philosophy:** Clean, functional components. Explicit TypeScript types. Professional "Linear-style" UI — dark mode first, high-quality typography, generous whitespace.
- **Naming:** PascalCase for components, kebab-case for filenames (e.g., `post-card.tsx`).
- **Data fetching:** Prefer Server Components for reads. Use Server Actions for mutations.
- **Supabase clients:** Always use helpers from `utils/supabase/` — never instantiate clients inline.
- **Imports:** Use the `@/` alias for all project imports.

## Project Structure

```
app/              → Routes and layouts (App Router)
components/ui/    → Atomic, reusable UI elements
components/features/ → Blog-specific composed components
lib/              → Shared utilities, types, constants
utils/supabase/   → Supabase client factories (server, client, middleware)
```

## Environment

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous/public key

## Database

The Supabase CLI is linked to the remote project. Use it to run migrations and queries directly — no manual steps needed.

- `npx supabase db push` — Apply pending migrations to the remote database
- `echo "SQL" | npx supabase db query --linked` — Run arbitrary SQL against the remote database
- Migrations live in `supabase/migrations/`

## Communication

- The user may write requirements or clarifications in Chinese — this is expected. Always understand and incorporate Chinese input fully.
- All output (documents, plans, actions, code comments, and commentary) must be in English to keep the project consistent.

## Commands

- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run lint` — Run ESLint
