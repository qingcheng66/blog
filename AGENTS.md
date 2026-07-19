<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:installed-skills -->
# Skills

## design-taste-frontend (taste-skill)
Anti-slop frontend skill for landing pages, portfolios, and redesigns.
- **3 dials**: DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY
- **Brief inference** before writing any code — reads page kind, vibe, audience
- **Presets**: use-case presets for landing/portfolio/editorial
- **Design system mapping**: when to reach for shadcn, Tailwind, etc.
- See `.claude/skills/design-taste-frontend/SKILL.md` for full reference

## GSAP Skills
- **gsap-core** — gsap.to/from/fromTo, easing, stagger, defaults
- **gsap-timeline** — Timeline sequencing, position parameter, labels, nesting
- **gsap-scrolltrigger** — Scroll-linked animations, pinning, scrub, batch
- **gsap-react** — useGSAP hook, gsap.context(), cleanup on unmount

## Design References
- `design-references/vercel-design.md` — Black/white precision, Geist font
- `design-references/stripe-design.md` — Clean developer brand

## Quick GSAP Pattern for Blog
```tsx
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

// Scroll-triggered fade-in
useGSAP(() => {
  gsap.from(".post-card", {
    y: 40, opacity: 0, stagger: 0.1,
    scrollTrigger: { trigger: ".post-list", start: "top 80%" }
  });
}, { scope: containerRef });
```
<!-- END:installed-skills -->
