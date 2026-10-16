# MMinds — Growth Engineering Website

Industrial-grade dark agency site. **No build step** — open any page directly.

## Stack
Clean Modular **HTML5 + Tailwind CDN + Vanilla JS** (per spec option 2). Fonts: Outfit + Inter. No pricing anywhere by design.

## Structure
```
mminds-website/
  index.html          Home — hero, ticker, bento services, process, proof, CTA
  services.html       Deep scope: Performance / SEO / AEO + tabs + FAQ accordion
  about.html          Mission/vision + team grid (photos, roles, LinkedIn)
  contact.html        Audit booking form (validation + states), calendar placeholder, office info
  assets/css/style.css  Design system: tokens, glass, mesh, bento, reveal, ticker
  assets/js/main.js     Nav, mobile menu, reveal observer, counters, tabs, accordions, forms, modal
```

## Run
```bash
cd mminds-website
npx serve .        # or: python -m http.server 8080
# open http://localhost:3000 / :8080
```

## Motion & FX layer (CDN-connected, no install)
Sourced from GitHub + cdnjs — linked with `defer` in every page, all guarded so the site works even if a CDN is blocked:
- **Lenis `1.3.27`** (`darkroomengineering/lenis`): buttery smooth scrolling — `https://unpkg.com/lenis@1.3.27/dist/lenis.min.js`
- **GSAP `3.15.0` + ScrollTrigger** (cdnjs): staggered split-text hero reveals, scroll-scrubbed parallax (`data-parallax`) and ticker drift
- **Scroll color themes**: sections carry `data-theme="obsidian|indigo|emerald"` — the page background + ambient glow crossfade as you scroll
- **Extras**: gradient scroll progress bar, interactive hero particle network (`#stars`), cursor glow, magnetic CTAs (`data-magnetic`), mouse-tracked card spotlights. `prefers-reduced-motion` disables all of it.

## Notes
- Team photos use `i.pravatar.cc` placeholders — swap `src` for real headshots.
- Calendar: paste Cal.com/Calendly `<iframe>` into the dashed block in `contact.html`.
- Forms are front-end validated with success/error states; wire `contactForm` to your API/Formspree in `main.js`.
- Colors: Obsidian `#060a14`, Electric Blue `#3b82f6`, Cyber Indigo `#6366f1`, Emerald `#10b981`.
