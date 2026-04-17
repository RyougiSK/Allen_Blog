# Favicon Design

## Current State

The favicon is a temporary placeholder: a dark rounded square (`#171717`) with the letter "A" in serif font (`#e5e5e5`). It lives at `app/icon.svg` and is picked up automatically by Next.js App Router.

## TODO

- [ ] Design a proper favicon that reflects the blog's brand identity
- [ ] Create multiple sizes if needed (16x16, 32x32, 180x180 for Apple touch icon)
- [ ] Consider adding an `apple-icon.png` in `app/` for iOS home screen bookmarks
- [ ] Replace `app/icon.svg` with the final asset

## Notes

- Next.js App Router supports `icon.svg`, `icon.png`, and `apple-icon.png` placed directly in `app/`
- SVG is preferred for scalability, but PNG may be needed for broader compatibility
- Keep the design simple and legible at small sizes (16x16)
