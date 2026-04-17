# Hero Background Video & Poster — Production Guide

## Current Assets (Temporary)

**Video:** Smoke against black background from Pexels
- Source: https://www.pexels.com/video/footage-of-smoke-against-black-background-9694807/
- License: Pexels License — free for commercial use, no attribution required
- Resolution: 1920x1080, 25fps
- Size: ~13.1MB
- Supabase path: `media/hero/hero.mp4`

**Poster:** Auto-extracted frame from the video
- Size: ~104KB
- Supabase path: `media/hero/hero-poster.jpg`

---

## Replacement Specs

When you create your own video and poster, follow these specs:

### Video Requirements

| Spec | Value |
|------|-------|
| Format | MP4 (H.264 codec) |
| Resolution | 1920x1080 minimum |
| Duration | 15–30 seconds (seamless loop) |
| Frame rate | 24–30fps |
| Audio | None (strip audio track) |
| File size | Under 15MB ideal, 25MB max |
| Motion | Slow, continuous — no cuts, no sudden changes |
| Tone | Dark, atmospheric, contemplative |

### Poster Requirements

| Spec | Value |
|------|-------|
| Format | JPEG |
| Resolution | Same as video (1920x1080) |
| Quality | 80% compression |
| File size | Under 200KB |
| Content | A representative still frame from the video |

### How It's Used

The video plays fullscreen behind the hero text with a dark gradient overlay on top. On mobile (<640px), the video is hidden entirely and the ink-wash CSS gradient fallback is shown instead. The poster displays while the video buffers.

The overlay gradient goes from 30% opacity at the top to 100% at the bottom, so:
- **Top of frame:** partially visible through overlay — fine for subtle detail
- **Center of frame:** 50% dimmed — text sits here, keep visuals soft
- **Bottom of frame:** fully faded to black — connects seamlessly to the page background

---

## AI Video Generation Prompts

### Concept A: Ink in Water (Recommended)

**Runway Gen-3 / Kling AI:**
> Slow-moving ink dissolving in dark water, shot from above, deep black background with warm golden and muted silver tones bleeding outward, cinematic 4K, extremely slow motion, abstract and meditative, no text, seamless loop, dark moody atmosphere, volumetric light catching the ink edges

**Why this works:** Ink in water is a direct visual metaphor for Daoist philosophy — formless becoming form, wu wei (effortless action). The warm golden tones match the site's accent color (#C4A882). The dark background blends seamlessly with the site's #0C0C0E bg.

### Concept B: Atmospheric Smoke / Fog

**Runway Gen-3 / Kling AI:**
> Wispy smoke slowly curling and drifting against a pure black void, warm amber and cool silver light catching the edges, extremely slow motion, cinematic, abstract, meditative mood, no text, seamless loop, dark atmospheric, volumetric lighting from the side

**Why this works:** Smoke is formless and ever-changing — maps to the philosophical theme of becoming. More abstract than ink, slightly more mysterious.

### Concept C: Fog Over Still Water

**Runway Gen-3 / Kling AI:**
> Low fog drifting slowly over perfectly still dark water at dawn, barely visible horizon line, warm golden light breaking through mist on one side, muted tones, cinematic ultra-wide, extremely slow motion, contemplative and serene, no people, no text, seamless loop

**Why this works:** Nature-grounded rather than abstract. The still water reflects the Daoist concept of the mind as a still pond. The fog represents the unknowable. More accessible visually than ink or smoke.

### Concept D: Abstract Light and Shadow

**Runway Gen-3 / Kling AI:**
> Slow-moving abstract caustic light patterns on a dark surface, warm golden light refracting through unseen water, soft shadows shifting gradually, cinematic macro, extremely slow motion, meditative, no text, seamless loop, dark moody atmosphere

**Why this works:** Purely abstract — light as a symbol of consciousness and attention. The caustic patterns feel natural and organic without depicting any specific subject.

---

## AI Poster Image Prompts

Use the same concept as your chosen video. Here are matching still-frame prompts:

**Midjourney / DALL-E / Flux:**

**For Concept A (Ink):**
> Abstract dark background, warm golden ink dispersing in black water, soft volumetric light, cinematic still frame, moody contemplative atmosphere, minimal, 16:9 aspect ratio, ultra high quality

**For Concept B (Smoke):**
> Wispy smoke tendrils against pure black, warm amber sidelight catching the edges, cinematic still, dark atmospheric, contemplative mood, 16:9 aspect ratio, ultra high quality

**For Concept C (Fog):**
> Low fog over perfectly still dark water at dawn, warm golden light on horizon, muted tones, cinematic landscape, 16:9 aspect ratio, contemplative and serene, ultra high quality

**For Concept D (Light):**
> Abstract caustic light patterns on dark surface, warm golden refractions, soft shadows, cinematic macro photography, 16:9 aspect ratio, meditative mood, ultra high quality

---

## How to Replace the Assets

1. Upload your new video and poster to Supabase Storage, replacing the existing files:

```bash
npx supabase storage cp your-video.mp4 ss:///media/hero/hero.mp4 --experimental --linked
npx supabase storage cp your-poster.jpg ss:///media/hero/hero-poster.jpg --experimental --linked
```

2. No code changes needed — the component reads from `SITE.hero.video` and `SITE.hero.poster` which point to these fixed paths.

3. Clear browser cache or hard-refresh to see the new assets (Supabase CDN may cache for a few minutes).

---

## Recommended Tools

| Tool | Best For | Link |
|------|----------|------|
| Runway Gen-3 Alpha Turbo | AI video generation (best quality) | https://runwayml.com |
| Kling AI | AI video (good dark/cinematic) | https://klingai.com |
| Pika | AI video (quick iterations) | https://pika.art |
| Midjourney | Poster image (best aesthetic) | https://midjourney.com |
| ChatGPT / DALL-E | Poster image (convenient) | https://chatgpt.com |
| Flux | Poster image (open source) | https://flux.ai |

---

## Design Notes

- The site's warm accent color is `#C4A882` — aim for golden/amber tones in the video to match
- The site background is `#0C0C0E` (near-black) — video edges should fade to black
- Motion should feel like breathing — slow, organic, non-repeating
- Avoid anything that looks "tech startup" (particle networks, geometric grids, data visualizations)
- The video should feel like atmosphere, not content — it supports the text, not competes with it
