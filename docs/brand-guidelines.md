# The Quiet Way — Brand Guidelines

## Identity

- **English Name:** The Quiet Way
- **Chinese Name:** 行于静中
- **Core Theme:** Inner Order in a Complex World
- **Core Positioning:** Designing Inner Life in the Modern World

This is a quiet intellectual and psychological space for reflection, philosophy, psychology, modern life, and inner order. It is NOT a startup, SaaS product, productivity dashboard, or AI company aesthetic.

The website should feel like: "A place where modern people can slow down, think deeply, and rebuild inner coherence."

---

## Three Pillars

Every article and thread belongs to one of three pillars:

### 1. Relationship with the Self (人与自己的关系)
- **Core Question:** Who am I?
- **Themes:** Jung, MBTI, archetypes, shadow, projection, dreams, emotional patterns, film analysis
- **Atmosphere:** Introspective, psychological, emotionally aware
- **Accent Color:** Muted Indigo — `#5A5C7A` / `#6C6F8F`
- **CSS Token:** `--color-accent-self`, `--color-accent-self-light`

### 2. Relationship with Nature & Society (人与自然（包括人类社会）的关系)
- **Core Question:** How do I live with the world?
- **Themes:** Zhuangzi, Laozi, uncertainty, modern anxiety, technology, AI era, social structure, consumerism, existential reflection
- **Atmosphere:** Contemplative, open, philosophical, existential
- **Accent Color:** Deep Moss Green — `#2F4F4F` / `#4C6663`
- **CSS Token:** `--color-accent-nature`, `--color-accent-nature-light`

### 3. Relationship with Living (人与生活的关系)
- **Core Question:** How do I truly live this out?
- **Themes:** Slow living, home, solitude, reading, writing, rituals, plants, aesthetics, work-life rhythm, attention
- **Atmosphere:** Warm, grounded, quiet, lived philosophy
- **Accent Color:** Warm Oak Beige — `#C9B79C` / `#D6D1C4`
- **CSS Token:** `--color-accent-living`, `--color-accent-living-light`

---

## Color System

All colors are defined as CSS custom properties in `app/globals.css`.

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-primary` | `#121212` | Page background |
| `--color-bg-secondary` | `#161616` | Nested backgrounds |
| `--color-bg-tertiary` | `#1C1C1C` | Cards, soft surfaces |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#E8E1D3` | Main body text |
| `--color-text-secondary` | `#B8B0A2` | Secondary text |
| `--color-text-tertiary` | `#8F887B` | Muted text |
| `--color-text-quaternary` | `#6B6354` | Hints, placeholders |

### Borders
| Token | Hex |
|-------|-----|
| `--color-border` | `#2A2723` |
| `--color-border-emphasis` | `#3D3830` |

### Rules
- Muted colors only, low saturation
- Soft contrast, breathable palettes
- Warm-dark atmosphere
- Never use: pure black, pure white, bright gradients, saturated purple, corporate blue

---

## Typography

### Fonts
| Role | Font | CSS Variable |
|------|------|-------------|
| English headings | Cormorant Garamond | `--font-cormorant` |
| Chinese headings | Noto Serif SC | `--font-noto-serif-sc` |
| English body | Inter | `--font-inter` |
| Chinese body | Noto Sans SC | `--font-noto-sans-sc` |
| Code | Geist Mono | `--font-geist-mono` |

### Principles
- Elegant, spacious, readable, calm, literary
- Large line-height (`--leading-body: 1.8`)
- Generous spacing
- Never crowded

---

## Layout

| Token | Value | Purpose |
|-------|-------|---------|
| `--width-content` | 47.5rem (760px) | Reading width |
| `--width-page` | 75rem (1200px) | Standard content width |
| `--spacing-section` | 9rem | Between major sections |
| `--spacing-block` | 4rem | Between blocks |

The layout should feel: calm, spacious, breathable, slow.

---

## Animation

- **Principle:** Like breathing. Fade, slow transitions, subtle movement.
- **Never:** Bounce, flashy interactions, over-animation
- **Durations:** Fast 200ms, Normal 350ms, Slow 600ms
- **Reveals:** Gentle fade-in-up (8px), staggered at 120ms intervals
- **Hero:** 1200ms entrance, 300ms stagger between elements

---

## Components

### Cards
- Soft borders (`border-border/60`)
- Warm-dark surfaces (`bg-bg-tertiary`)
- Large padding (`p-8` or `p-10`)
- No heavy shadows, no floating startup cards
- Pillar accent shown as left border (`border-l-2`)

### Buttons
- Soft, rounded (`--radius-lg: 1rem`), elegant, understated
- Feel like invitations, not CTAs
- Allowed labels: "Continue Reading", "Begin Reading", "Explore Essays", "Open Journal"
- Never: "BUY NOW", "GET STARTED", "TRY FREE"
- Variants: `default` (warm oak bg), `soft` (border only), `ghost`, `outline`

### Hero
- Video at very low opacity (0.15) as atmospheric texture
- Typographic focus: site name large in display font
- Both English and Chinese names displayed
- Subtle ink-wash CSS animation as ambient atmosphere

---

## Image Direction

- Twilight, soft light, shadows, rain, plants, books, quiet rooms
- Windows, desk, solitude, warm wood, analogue feeling
- Avoid: startup visuals, productivity setups, corporate photography

---

## Writing Tone

### Chinese
- Emotional, cultural, relatable, warm, poetic

### English
- Reflective, philosophical, universal, structured, contemplative

Do NOT mirror-translate. The two languages should feel like two expressions of the same inner world.

---

## Logo

The existing deer logo stays unchanged. It represents:
- Quiet awareness, sensitivity, calm observation
- Connection with nature, spiritual stillness, gentle intelligence

Usage: Elegant, subtle, symbolic, integrated into atmosphere, never dominant or commercial.

---

## What This Site Is NOT

- A content machine
- A media company
- A modern dashboard
- A tech startup
- An aggressive intellectual project

Avoid in design:
- Glassmorphism, flashy gradients, strong neon, ultra bright UI
- Startup aesthetics, excessive animation
- Over-designed layouts, high information density
