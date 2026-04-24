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

## Bilingual System (English + Chinese)

This site is fully bilingual. Every user-facing page, component, and feature **must** support both English (`en`) and Chinese (`zh-cn`). This is not optional — treat it as a hard requirement for all work.

### How it works

- **Routing:** All public pages live under `app/[locale]/(public)/`. The `[locale]` param is `en` or `zh`. The layout at `app/[locale]/layout.tsx` validates the locale and provides the dictionary via `LocaleProvider`.
- **Middleware (`proxy.ts`):** Handles locale detection for bare URLs (no `/en` or `/zh` prefix). Detection order: (1) `locale` cookie set by language switcher, (2) browser `Accept-Language` header, (3) default `en`. Redirects to `/{locale}{path}`.
- **Dictionary files:** `lib/i18n/dictionaries/en.json` and `zh-cn.json` contain all UI strings keyed identically. Client components access them via `useLocale()` → `t("key")`.
- **Database content:** Articles store both `en` and `zh` versions with a `completed` boolean per locale. Templates and queries should respect the `completed` flag and fall back to the other locale when needed.
- **Email templates:** Every email template in `lib/email/templates/` has a `content` object with `en` and `zh` keys. The locale is determined by `preferred_locale` stored in the subscribers table (set from the URL locale at subscribe time).

### Rules for new features

1. **Every new UI string** must be added to both `en.json` and `zh-cn.json` with the same key.
2. **Every new page** under `app/[locale]/` must use the dictionary for all visible text — never hardcode English or Chinese strings in JSX.
3. **Every new email template** must include both `en` and `zh` content objects and accept a `locale` parameter.
4. **Server actions** that interact with user-facing locale should accept `locale: "en" | "zh"` as a parameter.
5. **New database tables** with user-facing text content should include locale-specific columns or a `preferred_locale` field.
6. **Static metadata** (page titles, descriptions, OG tags) must use the locale from params — see existing pages for the pattern.
7. **Never rely on `next.config.ts` redirects for locale routing** — the `proxy.ts` middleware handles this with language detection. Only use `next.config.ts` redirects for legacy URL migrations (e.g., `/blog/:slug` → `/en/:slug`).

## Communication

- The user may write requirements or clarifications in Chinese — this is expected. Always understand and incorporate Chinese input fully.
- All output (documents, plans, actions, code comments, and commentary) must be in English to keep the project consistent.

## Commands

- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run lint` — Run ESLint
