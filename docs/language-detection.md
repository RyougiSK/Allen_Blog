# Language Detection System

How the site determines which language (English or Chinese) to show a visitor.

---

## Decision Flow

```
User visits the-quiet-way.com/some-path
                │
                ▼
┌───────────────────────────────┐
│  Does the URL already have    │
│  a locale prefix (/en or /zh)?│
└───────────┬───────────────────┘
            │
       ┌────┴────┐
       │ YES     │ NO
       ▼         ▼
   Serve that  ┌─────────────────────────┐
   locale      │ Check `locale` cookie   │
   directly    │ (set by language        │
               │  switcher, lasts 1 year)│
               └───────────┬─────────────┘
                           │
                    ┌──────┴──────┐
                    │ Cookie      │ No cookie
                    │ exists      │
                    ▼             ▼
               Use cookie   ┌─────────────────────────┐
               value        │ Check browser's          │
               (en or zh)   │ Accept-Language header    │
                            └───────────┬───────────────┘
                                        │
                                 ┌──────┴──────┐
                                 │ Starts      │ Otherwise
                                 │ with "zh"   │
                                 ▼             ▼
                              Redirect      Redirect
                              to /zh        to /en
                                              (default)
```

After detection, the middleware (`proxy.ts`) redirects the user to `/{locale}{path}` and the page renders in the chosen language.

---

## Where Does Accept-Language Come From?

The `Accept-Language` header is sent by every browser with each HTTP request. Its value depends on the platform and browser.

### macOS

| Browser | Language source | How to check / change |
|---------|----------------|-----------------------|
| **Safari** | Always uses macOS system language | System Settings → General → Language & Region → Preferred Languages |
| **Chrome** | Has its own language list that **overrides** macOS | `chrome://settings/languages` → top language in the list |
| **Firefox** | Has its own language list that **overrides** macOS | Settings → General → Language → Choose your preferred language |
| **Arc / Edge** | Same as Chrome (Chromium-based) | Settings → Languages |

**Key point:** On macOS, Safari always follows the OS, but Chrome/Firefox/Edge maintain their own language lists. A user can have macOS set to English but Chrome set to Chinese — Chrome will send `zh` as the primary language.

### iOS / iPadOS

| Browser | Language source | How to check / change |
|---------|----------------|-----------------------|
| **All browsers** (Safari, Chrome, Firefox, etc.) | Always uses iOS system language | Settings → General → Language & Region → Preferred Languages |

**Key point:** On iOS, Apple enforces that all browsers use the system language. Chrome on iOS cannot override this — it always follows the OS setting.

### Windows

| Browser | Language source | How to check / change |
|---------|----------------|-----------------------|
| **Edge** | Has its own language list | `edge://settings/languages` |
| **Chrome** | Has its own language list | `chrome://settings/languages` |
| **Firefox** | Has its own language list | Settings → General → Language |

**Key point:** On Windows, all major browsers maintain their own language settings independent of the OS display language.

### Android

| Browser | Language source | How to check / change |
|---------|----------------|-----------------------|
| **Chrome** | Uses Android system language | Settings → System → Language & input → Languages |
| **Firefox** | Has its own language list | Settings → General → Language |

---

## Accept-Language Header Format

Browsers send a prioritized list with quality values:

```
Accept-Language: en-AU,en;q=0.9,zh-CN;q=0.8,zh;q=0.7
```

- `en-AU` — primary language (quality 1.0 implied)
- `en;q=0.9` — generic English, slightly lower priority
- `zh-CN;q=0.8` — Simplified Chinese
- `zh;q=0.7` — generic Chinese

Our middleware checks: **does the header start with `zh`?** If yes → Chinese. Otherwise → English. This is intentionally simple for a two-language site.

---

## The Cookie Override

When a user clicks the language switcher on the site:

1. A `locale` cookie is set (`en` or `zh-cn`), valid for 1 year
2. The page navigates to the other locale URL
3. On all future visits, the cookie is checked **before** the Accept-Language header

This means: once a user manually switches language, their choice sticks across sessions, regardless of browser or OS language settings.

**Cookie scope:** The cookie is set with `path=/`, so it applies to all pages. It is **not** shared across browsers — each browser has its own cookie jar.

---

## Common Scenarios

### "My friend sees Chinese but her Mac is set to English"

Most likely cause: **Chrome's own language list** has Chinese ranked above English. On macOS, Chrome ignores the OS language setting and uses its own list at `chrome://settings/languages`.

Fix: Check Chrome's language settings, or clear cookies and use Safari (which follows the OS).

### "User switched to English on their phone, but sees Chinese on desktop"

Expected behavior. The `locale` cookie is per-browser, per-device. Switching language on one device does not affect another.

### "User shared an article link and the recipient sees a different language"

Article links include the locale: `/en/some-article` or `/zh/some-article`. The recipient sees the language in the URL. They can switch via the language switcher.

---

## Implementation Reference

- **Middleware:** `proxy.ts` — `detectLocale()` function (lines 26–35)
- **Cookie setting:** `components/features/language-switcher.tsx`
- **Layout locale validation:** `app/[locale]/layout.tsx`
- **Dictionary files:** `lib/i18n/dictionaries/en.json` and `zh-cn.json`
