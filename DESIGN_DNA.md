# DESIGN DNA — RISHI'S INDIE PORTFOLIO

> This document is the visual and interaction constitution of the portfolio.
>
> Read this before making ANY design, UI, animation, typography, layout, illustration, or visual-system decision.
>
> Future phases must evolve this design language rather than replace it.

---

# 01 — THE CORE IDEA

This is:

> **A personal archive of things I build and things I'm learning.**

The site should feel like a developer's carefully maintained corner of the internet.

It is:

- personal
- indie
- technical
- editorial
- Indian
- slightly nostalgic
- curious
- handmade
- understated
- experimental in small ways
- mature

It should feel authored.

The visitor should feel:

> "Someone actually made this."

Not:

> "Someone generated a portfolio from a template."

---

# 02 — THE CENTRAL VISUAL METAPHOR

The visual language is:

> **An old Indian book / manuscript reinterpreted by a modern software engineer.**

The design sits between:

```text
old paper
+
ink
+
Indian manuscript geometry
+
editorial typography
+
developer notebook
+
modern web engineering
```

Do NOT literally reproduce an old manuscript.

Do NOT make the site look historical.

The historical influence should be a visual vocabulary, not a costume.

---

# 03 — NON-NEGOTIABLE: NO VIBE CODING

Never introduce visual patterns merely because they are fashionable.

Avoid:

- generic AI portfolio layouts
- SaaS landing-page aesthetics
- excessive gradients
- purple/blue neon
- glassmorphism
- excessive blur
- glowing cards
- excessive rounded cards
- giant gradient text
- excessive pills
- fake terminal windows
- fake code snippets as decoration
- meaningless statistics
- excessive 3D
- gratuitous parallax
- excessive shadows
- generic "developer portfolio" card grids
- excessive Framer-style animations
- animation everywhere
- decorative UI without purpose

If a new design element could appear unchanged on 100 other AI-generated portfolios, question whether it belongs here.

---

# 04 — PRESERVE THE CURRENT DESIGN

The existing implementation is considered the baseline.

Future work should be:

> **evolution, not redesign.**

Do not replace the current visual system simply because another approach is possible.

Preserve the successful characteristics:

- aged-paper palette
- iron-gall ink feeling
- editorial typography
- manuscript-like ruled margins
- rubricated section numbering
- ashtadala padma mark
- restrained layout
- CSS Modules
- editorial composition
- subtle Indian influence

Only change them when there is a clear reason.

---

# 05 — COLOUR

The primary surface should feel like aged paper.

Current baseline:

```text
Warm grey / cream paper
#f4f1e9
```

Do NOT turn the website bright yellow.

The inspiration is:

- old books
- aged paper
- parchment
- Indian manuscripts
- warm natural paper

The paper should remain sophisticated and neutral.

---

## Ink

Typography should feel like ink rather than pure digital black.

Prefer:

- deep charcoal
- dark brown-black
- muted ink tones

Avoid absolute black everywhere unless necessary.

---

## Rubrication

Red is allowed primarily as:

> **rubrication**

Meaning it should behave like the red ink historically used to highlight important passages, headings, numerals, or marks.

Use it for:

- section numerals
- small marks
- selected emphasis
- ornamental details

Do NOT turn red into the site's dominant accent colour.

---

# 06 — TYPOGRAPHY

Typography has three jobs.

## EB Garamond

Use for:

- prose
- editorial content
- personal writing
- longer-form text
- selected display moments

It should provide the literary/editorial character.

---

## IBM Plex Sans

Use for:

- interface
- navigation
- buttons
- functional labels
- UI copy
- supporting information

---

## IBM Plex Mono

Use for:

- metadata
- timestamps
- technical labels
- numbers
- small system information
- GitHub/project metadata

---

## IBM Plex Sans Devanagari

Use only where the Devanagari identity requires it.

Current mark:

> ऋषि

Do not spread Devanagari throughout the site merely for decoration.

---

# 07 — INDIAN VISUAL LANGUAGE

The Indian influence should become **slightly more visible in future phases**.

However:

> subtlety remains mandatory.

The target is:

> noticeable when you pay attention.

Not:

> immediately obvious from across the room.

---

# 08 — ART DIRECTION

Use a restrained hybrid of:

### Indian geometric / mandala language

- mandalas
- radial geometry
- rosettes
- geometric repetition
- symmetrical structures

### Manuscript language

- marginal ornaments
- ruled borders
- folio-like details
- ink marks
- ornamental dividers

### Indian print / craft influence

- subtle block-print-like geometry
- imperfect ink feeling
- hand-printed texture
- restrained organic motifs

Do not combine all of these aggressively.

The visual hierarchy must remain:

```text
content
>
typography
>
layout
>
ornamentation
```

Never:

```text
ornamentation
>
everything else
```

---

# 09 — MANDALA / ROSETTE

The current ashtadala padma geometry should remain.

It is currently the site's strongest visual mark.

Treat it as a design system element.

Possible uses:

- wordmark
- section decoration
- footer
- subtle background watermark
- transition marker
- loading/interaction detail

Do not put the rosette everywhere.

Repetition should feel intentional.

---

# 10 — BACKGROUND GEOMETRY

Increase the current background art slightly.

Desired level:

> Very subtle, but noticeable when someone pays attention.

Possible elements:

- extremely low-contrast mandala fragments
- radial geometry
- geometric line structures
- manuscript-inspired patterns
- faint ornamental geometry

These should feel almost discovered rather than presented.

Avoid making the background compete with text.

---

# 11 — MANUSCRIPT MARGINS

The ruled page/margin concept is important.

The existing folio-like margins should remain.

Section numbers can continue to live in the margin.

This creates a visual relationship between:

```text
book
+
archive
+
technical documentation
```

Do not replace this with conventional modern section headers everywhere.

---

# 12 — TEXTURE

Paper texture should remain subtle.

Current inline SVG turbulence approach is good.

Prefer:

- CSS
- inline SVG
- tiny generated assets

Avoid:

- large texture images
- downloaded stock textures
- obvious Photoshop-style paper effects

The texture should disappear when the visitor stops looking for it.

---

# 13 — ILLUSTRATION

Illustrations are allowed only when they naturally fit.

Possible future elements:

- tiny birds
- botanical marks
- architectural geometry
- manuscript motifs
- small technical diagrams
- hand-drawn symbols

They must feel like they belong to the page.

Do not add illustrations merely to fill empty space.

---

# 14 — BIRDS / SMALL MOVING ART

Small illustrated birds are explicitly allowed.

A bird may occasionally travel from one side of the page toward another.

This should be:

- rare
- subtle
- elegant
- slow enough to feel natural
- non-blocking
- non-distracting

It should feel like an unexpected little detail in an illustrated manuscript.

It must NOT feel like:

- a game
- a gimmick
- a flying emoji
- a marketing animation

Do not constantly repeat the animation.

---

# 15 — MOTION PHILOSOPHY

Animation is now an intentional part of the design.

However:

> Motion should feel like ink, paper, typography, illustration, or an editorial page coming alive.

It should NOT feel like a SaaS landing page.

Desired animation intensity:

> **Noticeable but elegant.**

---

# 16 — APPROVED MOTION LANGUAGE

Good animation patterns include:

### Ink appearing

Lines or ornaments can appear as if being drawn.

### Typography reveal

Headings can gently reveal themselves.

### Ornament drawing

Mandala/rosette geometry can progressively appear.

### Section reveal

Content can subtly enter as it reaches the viewport.

### Small illustrated movement

Birds or similarly small illustrations may occasionally travel across the page.

### Hover interactions

Links and project entries can have subtle movement.

### Scroll-linked movement

Small ornamental elements may respond to scrolling.

Use this sparingly.

---

# 17 — MOTION MUST HAVE A REASON

Before implementing an animation ask:

> What does this animation communicate?

Good answers:

- hierarchy
- transition
- drawing
- discovery
- physicality
- editorial rhythm

Bad answer:

> "It looks cool."

If the animation does not improve the experience, remove it.

---

# 18 — NO HERO INTRO ANIMATION

Do not create a dramatic website-opening sequence.

No:

- fake page loading
- forced page-turn intro
- splash screen
- giant logo reveal
- long cinematic entrance

The user should reach the content quickly.

---

# 19 — REDUCED MOTION

Respect:

```css
prefers-reduced-motion
```

Every non-essential animation must have an appropriate reduced-motion fallback.

A visitor who disables motion should still experience the complete design.

---

# 20 — LAYOUT

Avoid repetitive card grids.

The site should feel editorial.

Use:

- asymmetric composition
- ruled sections
- narrow reading columns
- full-width moments
- whitespace
- metadata
- section numbering
- varied visual rhythm

Different sections can have different compositions while still sharing the same design DNA.

---

# 21 — CARDS

Cards are not forbidden, but they should not dominate.

Avoid:

```text
card
card
card
card
card
card
```

especially for projects.

Use:

- lists
- editorial indexes
- ruled entries
- asymmetric blocks
- typography-driven layouts

when appropriate.

---

# 22 — BORDER RADIUS

Do not make every component rounded.

Avoid the common AI-generated pattern:

```text
border-radius: 24px
```

on everything.

Prefer:

- sharp edges
- lightly rounded edges where appropriate
- rules
- borders
- paper-like surfaces

---

# 23 — SHADOWS

Shadows should be rare.

The page should derive hierarchy primarily from:

- typography
- spacing
- borders
- colour
- positioning

not floating cards.

---

# 24 — PERSONALITY

The site should communicate that Rishi:

- enjoys breaking things
- enjoys experimenting
- likes building things he personally needs
- is fascinated by Solana and blockchain
- is increasingly curious about hardware
- enjoys learning difficult systems
- likes real engineering problems

This personality should appear through content and small design choices.

Do not turn it into forced quirky copy.

---

# 25 — ENGINEERING PERSONALITY

The portfolio belongs to a developer interested in:

- distributed systems
- system design
- backend engineering
- real-time systems
- databases
- infrastructure
- Solana
- AI agents
- LLM internals
- context and memory
- optimization
- open-source agents
- robotics/hardware as a future exploration

The design should support technical depth without becoming a stereotypical "hacker" website.

---

# 26 — RESPONSIVE DESIGN

Desktop and mobile are both first-class experiences.

Do not simply shrink desktop.

Preserve:

- manuscript margins where practical
- typography hierarchy
- ornaments
- section numbering
- whitespace
- editorial rhythm

On small screens, simplify ornamentation rather than allowing it to obstruct content.

---

# 27 — ACCESSIBILITY

Accessibility always wins over decoration.

Maintain:

- semantic HTML
- correct headings
- keyboard navigation
- visible focus
- meaningful link names
- sufficient contrast
- reduced-motion support

Decorative SVGs must not become accidental accessibility content.

---

# 28 — PERFORMANCE

The visual system must remain lightweight.

Prefer:

- CSS
- SVG
- browser APIs
- minimal JavaScript
- existing dependencies

Do not add a dependency simply to implement a small visual effect that CSS/SVG can handle.

---

# 29 — CONTENT OVER DECORATION

If there is ever a conflict between:

```text
beautiful ornament
```

and:

```text
readable content
```

choose readable content.

The art should frame the archive.

It should never become the archive.

---

# 30 — DESIGN EVOLUTION RULE

Every future phase must ask:

1. Does this belong to the existing visual language?
2. Does it strengthen the "personal archive" idea?
3. Does it feel authored?
4. Is the Indian influence tasteful?
5. Is the ornamentation subtle?
6. Is the animation meaningful?
7. Does it avoid generic AI-generated patterns?

If the answer is no, rethink the implementation.

---

# 31 — THE ONE-SENTENCE TEST

Before shipping any major UI change, ask:

> **Could someone look at this website and reasonably believe that a developer with a personal aesthetic intentionally made it?**

If yes, continue.

If it looks like a template, redesign the offending part.

---

# 32 — FINAL VISUAL TARGET

The final experience should feel like:

> **A modern software engineer's personal archive printed on an old Indian page, with ink, geometry, small moments of movement, and carefully chosen technical details.**

It should be calm.

It should be curious.

It should be unmistakably Rishi's.
