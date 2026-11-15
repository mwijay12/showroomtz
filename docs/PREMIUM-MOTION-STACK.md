# Premium Motion Stack — repos, libraries & references

Hii ni orodha ya kazi (working list) ya **repos za GitHub/GitLab** na libraries zinazotumika
kutengeneza websites za "premium" — WebGL, GLSL shaders, page transitions, text effects,
number effects na animated SVG.

> **Licensing note (2025/2026):** everything below is free for commercial use.
> GSAP became **100% free in April 2025** (Webflow acquisition) — that includes the
> formerly "Club" plugins: **SplitText, ScrollSmoother, MorphSVG, DrawSVG, MotionPath, Flip**.
> So `npm i gsap` now gives you the whole toolbox, no membership.

---

## 1. What we already ship in this repo

| Effect | Library | Where |
| --- | --- | --- |
| GLSL hero shaders (aurora / liquid chrome / starfield) | `three` (raw WebGL) | `src/components/effects/WebGLShaderBackground.tsx` |
| Scroll choreography (`data-gsap="reveal\|scrub\|zoom"`) | `gsap` + ScrollTrigger | `src/components/effects/GsapScrollFX.tsx` |
| Split-text line/word/char reveal | `gsap` + `SplitText` | `src/components/effects/SplitReveal.tsx` |
| Typing / typewriter | custom (rAF + timeouts) | `src/components/effects/Typewriter.tsx` |
| Decrypt / scramble text | custom (rAF glyph stream) | `src/components/effects/ScrambleText.tsx` |
| Number counters | `@tweenjs/tween.js` | `src/components/effects/CountUp.tsx` |
| SVG stroke drawing + motion path | `animejs` v4 | `src/components/effects/AnimatedSVG.tsx` |
| Tilt / spotlight / magnetic interaction | `framer-motion` | `src/components/effects/Interactive.tsx` |
| Marquee ticker | CSS | `src/components/effects/Marquee.tsx` |
| Spinners / skeletons / rails | CSS + React | `src/components/ui/premium-spinner.tsx`, `skeleton.tsx` |
| Smooth scroll | `lenis` | `@studio-freight/react-lenis` in providers |

Live gallery: **`/landing/motion`** — every effect isolated and playable.

---

## 2. WebGL + GLSL

| Repo | Why it matters |
| --- | --- |
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | The default 3D engine. Raw shaders, postprocessing, GLTF, everything. |
| [oframe/ogl](https://github.com/oframe/ogl) | ~50KB minimal WebGL library — perfect when three.js feels heavy. |
| [curtainsjs/curtainsjs](https://github.com/curtainsjs/curtainsjs) | Turns DOM images/videos into WebGL planes. The "premium agency" trick for image hover distortion. |
| [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | React renderer for three.js — declarative scenes. |
| [pmndrs/drei](https://github.com/pmndrs/drei) | R3F helpers: shaders, environments, text, controls. |
| [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) | Bloom, DOF, chromatic aberration, film grain. |
| [patriciogonzalezvivo/lygia](https://github.com/patriciogonzalezvivo/lygia) | The GLSL standard library: noise, SDFs, lighting, color. Copy-paste into any shader. |
| [patriciogonzalezvivo/glslViewer](https://github.com/patriciogonzalezvivo/glslViewer) | Run GLSL on desktop with live reload — fastest shader iteration loop. |
| [stegu/webgl-noise](https://github.com/stegu/webgl-noise) | Canonical simplex/perlin noise implementations (public domain). |
| [glslify/glslify](https://github.com/glslify/glslify) | `npm`-style module system for shader chunks. |
| [shader-park/shader-park-core](https://github.com/shader-park/shader-park-core) | Write shaders in JS, get GLSL out. |
| [gl-transitions/gl-transitions](https://github.com/gl-transitions/gl-transitions) | 100+ ready-made shader transitions (great for slides/route changes). |
| [bradley/Blotter](https://github.com/bradley/Blotter) | GPU text effects: liquid, slime, smoke — WebGL typography. |

**Learn / steal from:** [shadertoy.com](https://www.shadertoy.com), [threejs.org/examples](https://threejs.org/examples),
[bookofshaders.com](https://thebookofshaders.com).

---

## 3. Motion engines

| Repo | Use it for |
| --- | --- |
| [greensock/GSAP](https://github.com/greensock/GSAP) | Timeline choreography, ScrollTrigger, SplitText, DrawSVG, MorphSVG, Flip, ScrollSmoother. The industry default. |
| [juliangarnier/anime](https://github.com/juliangarnier/anime) | Anime.js **v4**: `animate()`, `stagger()`, `svg.createDrawable()`, `svg.createMotionPath()`, `createTimeline()`. Beautiful SVG work with a tiny footprint. |
| [tweenjs/tween.js](https://github.com/tweenjs/tween.js) | Smallest tween engine (v25 Groups). Ideal for counters, gauges, physics-ish values. |
| [motiondivision/motion](https://github.com/motiondivision/motion) | Framer Motion — layout transitions, `AnimatePresence`, springs, gestures. |
| [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) | Smooth scroll that doesn't break accessibility. |
| [locomotivemtl/locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) | Scroll hijacking + parallax (heavier alternative to Lenis). |
| [theatre-js/theatre](https://github.com/theatre-js/theatre) | Visual keyframe editor for JS animations — designer-friendly. |

---

## 4. Page transitions (Barba.js and friends)

**Important:** [Barba.js](https://github.com/barbajs/barba) is built for **multi-page sites**
(server-rendered HTML with full page swaps). In Next.js App Router you should **not** add Barba —
use the equivalents instead:

| Need | Next.js / React answer |
| --- | --- |
| Animate between routes | `framer-motion` + `AnimatePresence` (`src/components/effects/PageTransition.tsx`) |
| Prefetch + progress bar | `next/link` prefetch + `src/components/ui/TopProgressBar.tsx` |
| Barba-style "leave/enter" hooks | `usePathname()` in a layout effect, or GSAP `onLeave` timelines |
| View Transitions API | `document.startViewTransition()` — supported in modern Chrome/Safari |

Still worth studying for **timing and choreography ideas**:
[barbajs/barba](https://github.com/barbajs/barba) · [swup/swup](https://github.com/swup/swup)
(Barba's modern successor, works with any router).

---

## 5. Text effects

| Repo | Effect |
| --- | --- |
| [shshaw/splitting](https://github.com/shshaw/splitting) | CSS/JS text splitting for chars, words, lines (GSAP SplitText alternative). |
| GSAP `SplitText` + `ScrambleTextPlugin` | Masked line reveals, HUD decryption. Already installed. (`ScrambleText` in our kit is a dependency-free version of this.) |
| [bradley/Blotter](https://github.com/bradley/Blotter) | WebGL text distortion. |
| CSS `background-clip: text` + animated gradient | Our `.text-shimmer` / `.text-gold-gradient` utilities. |

---

## 6. SVG & illustration

| Repo | Effect |
| --- | --- |
| [maxwellito/vivus](https://github.com/maxwellito/vivus) | Classic SVG line drawing (we use Anime.js `createDrawable` instead — same result, one dep less). |
| [rough-stuff/rough](https://github.com/rough-stuff/rough) | Hand-drawn / sketchy SVG. |
| [metafizzy/zdog](https://github.com/metafizzy/zdog) | Flat "pseudo-3D" SVG illustrations. |
| [paperjs/paper.js](https://github.com/paperjs/paper.js) | Vector geometry engine. |
| [processing/p5.js](https://github.com/processing/p5.js) | Generative art — good for hero canvases. |

---

## 7. Loaders, skeletons & micro-interactions

| Repo | Effect |
| --- | --- |
| [n3r4zzurr0/svg-spinners](https://github.com/n3r4zzurr0/svg-spinners) | The best collection of crisp SVG spinners. |
| [dvtng/react-loading-skeleton](https://github.com/dvtng/react-loading-skeleton) | Skeleton screens done right (we rolled our own in `ui/skeleton.tsx` to match the brand). |
| [lukehaas/css-loaders](https://github.com/lukehaas/css-loaders) | Pure CSS loaders. |
| [hakimel/Ladda](https://github.com/hakimel/Ladda) | Button state → spinner → success morph (used in our auth CTA). |
| [tsparticles/tsparticles](https://github.com/tsparticles/tsparticles) | Particle fields. |
| [tengbao/vanta](https://github.com/tengbao/vanta) | Drop-in WebGL backgrounds (fog, waves, halos). |
| [rive-app/rive-react](https://github.com/rive-app/rive-react) | Interactive vector animation with state machines — best-in-class for mascots/UI. |
| [airbnb/lottie-web](https://github.com/airbnb/lottie-web) | After Effects animations on the web. |

---

## 8. Inspiration + full-site templates

| Source | Why |
| --- | --- |
| [awwwards.com/websites/webgl](https://www.awwwards.com/websites/webgl/) | The benchmark for premium WebGL sites. |
| [tympanus.net/codrops](https://tympanus.net/codrops/) | Codrops demos — every effect worth copying, with source. |
| [godly.website](https://godly.website) | Curated "astronomically good" web design. |
| [minimal.gallery](https://minimal.gallery) · [land-book.com](https://land-book.com) | Landing-page patterns that convert. |
| [brunosimon/folio-2019](https://github.com/brunosimon/folio-2019) | Bruno Simon's 3D portfolio — the classic WebGL site source. |
| [sjfricke/awesome-webgl](https://github.com/sjfricke/awesome-webgl) | Curated WebGL list. |
| [terkelg/awesome-creative-coding](https://github.com/terkelg/awesome-creative-coding) | Generative art / shader / creative coding list. |
| [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) examples folder | Production R3F patterns (portals, shaders, instancing). |

---

## 9. Recipes

### Premium hero (what `/landing/luxury` does)
1. `WebGLShaderBackground` full-bleed, `opacity={0.9}` + `GrainOverlay` (film texture).
2. Two gradients on top: bottom-to-top to blend into the page, left-to-right for legibility.
3. `SplitReveal` headline, `animateOn="mount"`, `type="lines"`, `stagger≈0.11`.
4. `Typewriter` value-prop line in the accent colour.
5. `MagneticButton` wrapping the primary CTA.
6. `SpeedGauge` / `RouteTrace` as "telemetry" furniture in a corner.

### Scroll choreography
```tsx
// any element, anywhere:
<div data-gsap="reveal">…</div>   // clip-path + rise
<div data-gsap="scrub">…</div>    // parallax
<div data-gsap="zoom">…</div>     // media scale-in
```
`GsapScrollFX` picks these up per route and reverts cleanly on unmount.

### Counters
```tsx
<CountUp value={2800} suffix="+" duration={2000} />
<CountUp value={4.9} decimals={1} suffix="★" />
```

### SVG drawing
```tsx
import { animate, svg } from 'animejs';
animate(svg.createDrawable('.my-strokes'), {
  draw: ['0 0', '0 1'], duration: 1600, ease: 'inOutQuad',
});
```

---

## 10. Performance guardrails we follow

- **`prefers-reduced-motion`** — every component checks it and renders a calm static state.
- **DPR capped at 1.5** for shader canvases; render loop pauses when the tab is hidden.
- **Cheap skeleton shimmer** is CSS-only (`transform`, `opacity`) — no JS per frame.
- **Observers, not scroll listeners** — `IntersectionObserver` for reveals and counters.
- **Animations are progressive enhancement** — if a library fails to load, content still renders.
- **Bundle discipline** — GSAP/SplitText/Anime.js are dynamically imported inside `useEffect`,
  so they never block first paint.

---

## 11. The editorial layer (how the site is actually composed)

The motion kit is only half of it — the other half is a consistent editorial
system, so every page reads like the same publication.

| Component | File | Role |
| --- | --- | --- |
| `Hero` + `TickerStrip` | `components/home/Hero.tsx` | cinematic studio open, split lockup, telemetry card, sticker ticker |
| `Manifesto` | `components/home/Manifesto.tsx` | word-by-word statement + rotating seal + counters |
| `FeaturedFleet` | `components/home/FeaturedFleet.tsx` | GSAP-pinned horizontal rail, WebGL pointer distortion per card |
| `ProcessRail` | `components/home/ProcessRail.tsx` | auction → clearance → delivery, drawn connector |
| `StatsBand` | `components/home/StatsBand.tsx` | dark telemetry band: counters, sparkline, gauge, stamps |
| `Coverage` | `components/home/Coverage.tsx` | delivery map + city list |
| `FinalCta` | `components/home/FinalCta.tsx` | GLSL aurora close, magnetic actions, WhatsApp |
| `PageMasthead` | `components/layout/PageMasthead.tsx` | shared inner-page opening: kicker, two-line lockup, seal |
| `RouteCurtain` | `components/effects/RouteCurtain.tsx` | 0.7s film wipe on every client navigation |
| `Stickers` | `components/effects/Stickers.tsx` | auction seal, stamps, steering/wrench/road doodles, word ring |
| `DistortImage` | `components/effects/DistortImage.tsx` | three.js pointer-ripple image (desktop only, IO-gated) |

### Imagery rules

- All vehicle photography lives in `public/images/studio/` and is model-matched
  (`lc300.jpg`, `prado.jpg`, `hiace.jpg`, `sclass.jpg`, `bmw7.jpg`, `hilux.jpg`,
  `rangerover.jpg`, `alphard.jpg`, `lx600.jpg`, `hero-suv.jpg`).
- Legacy `/images/cars/*` paths in old Firestore documents are remapped by
  make/model in `lib/car-image.ts` (`resolveCarImage`), and stock Unsplash hero
  URLs saved in branding settings are rewritten onto the studio set in
  `BrandingProvider` (`localizeBranding`). Old links never render the wrong car.
- Because WebGL is expensive, `DistortImage` is only enabled on `min-width:
  1024px`, pauses when off-screen, and falls back to a plain `<img>`.

### Type treatments

`.text-outline` uses `-webkit-text-fill-color: transparent` + a `currentColor`
stroke (so `text-outline text-primary` keeps the accent), `.index-number` gives
tabular catalogue numerals, `.grid-lines` adds a masked technical grid.

---

## 12. Animated car parts, real geography, and the preloader

| Piece | File | Notes |
| --- | --- | --- |
| `AlloyWheel`, `GearPair`, `Piston`, `BrakeDisc`, `Turbo`, `Headlight`, `Suspension`, `KeyFob` | `components/effects/CarParts.tsx` | hand-built SVGs, CSS/SMIL motion, `--part-speed` so cards spool them up on hover |
| `Engineering` | `components/home/Engineering.tsx` | the eight-part "teardown" act; each card is the inspection domain it illustrates |
| `TanzaniaMap` | `components/effects/TanzaniaMap.tsx` | real TZ outline + lake holes, projected city nodes, SMIL courier dots, hover = filter |
| `ImportLane` | `components/effects/ImportLane.tsx` | Yokohama → Singapore → Colombo → Dar es Salaam, 11,800 km / 30–38 days |
| `tanzania-geo.ts` | `components/effects/tanzania-geo.ts` | **generated** from `world-atlas@2` + `@geo-maps/earth-lakes-10km`; regenerate with `scripts/generate-tanzania-map.mjs` |
| `Preloader` | `components/effects/Preloader.tsx` | once per session, ~1.1 s, skipped for reduced motion, renders nothing on the server |
| `Reveal` / `Parallax` | `components/effects/Reveal.tsx` | the two entrance/depth primitives used across sections |
| `SiteTexture` | `components/effects/SiteTexture.tsx` | fixed film grain + vignette over the whole app |

**Why the map changed:** the previous "Tanzania map" was a decorative Bézier
squiggle with dots placed by eye — cities sat in the wrong regions and the
`JPN → TZ` provenance had no route. The map is now generated from Natural Earth
polygons, city dots come from true lon/lat, and the sea leg is drawn as its own
diagram with real ports and transit time.
