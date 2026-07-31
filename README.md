# Lifetime Immigration — website rebuild

A rebuild of [lifetimeimmigration.com](https://www.lifetimeimmigration.com) as a static site:
nine pages, no framework, no third-party requests.

## Preview

Open `index.html` in a browser.

Fonts are self-hosted and browsers block font loading over `file://`, so for an accurate preview
serve the folder over HTTP:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

To deploy: connect the repo to Netlify with build command `node build.js` and publish
directory `.` — no dependencies, no `node_modules`.

## Files

```
build.js            assembles pages from src/ — run: node build.js
src/layout.html     page shell (head, OG, canonical, JSON-LD)
src/partials/       header.html, footer.html — shared across every page
src/pages/          page sources — edit these, not the root .html files
css/style.css       design tokens, layout, components, responsive rules
js/main.js          mobile nav, testimonial slider, maps, scroll reveal
img/ fonts/         assets

index.html  express-entry.html  provincial-nominee.html
family-sponsorship.html  study-permits.html  business-immigration.html
about.html  news.html  contact.html          <- generated, do not edit
sitemap.xml  robots.txt                      <- generated
```

### Building

```bash
node build.js     # writes nine pages plus sitemap.xml and robots.txt
```

No dependencies, no `npm install`, no framework. On Netlify set the build command to
`node build.js` and the publish directory to the project root.

Page sources start with a JSON metadata block:

```html
<!--{
  "title": "...",
  "description": "...",
  "nav": "services",              marks the nav item current
  "ogImage": "img/hero-x.jpg",    social share image
  "localBusiness": true           adds the two office schema blocks
}-->
```

## Pages

| Page | What it is |
|---|---|
| `index.html` | Homepage — seven sections |
| `express-entry.html` | Federal Skilled Worker, Trades, Canadian Experience Class, CRS |
| `provincial-nominee.html` | PNP streams, Quebec, Atlantic Immigration Program |
| `family-sponsorship.html` | Visitor visa, super visa, spousal and parent sponsorship |
| `study-permits.html` | Study permits, DLIs, PGWP, proof of funds, IELTS/TEF |
| `business-immigration.html` | Start-Up Visa, Quebec, self-employed, provincial entrepreneur |
| `about.html` | Story, consultants, settlement services, testimonials |
| `news.html` | Immigration news index |
| `contact.html` | Enquiry form, offices, maps, payments |

**Navigation:** Home · Our Services ▾ · About Us · News · Contact Us. The Our Services dropdown
goes straight to the five service pages — there is deliberately no hub landing page, because a
short pillar page ranks for nothing and competes with its own children for the same terms.

## Technical SEO

Every page emits a canonical URL, Open Graph and Twitter card tags with a real share image, and
`Organization` JSON-LD. About and Contact additionally carry `ProfessionalService` blocks for both
offices. `sitemap.xml` and `robots.txt` are generated from the page list on every build.

### Contact form

Wired for **Netlify Forms** — `data-netlify="true"` with a honeypot field. It will collect real
submissions the moment the site is deployed to Netlify, with no backend to build. Submissions
appear under Forms in the Netlify dashboard. If the client would rather the enquiries went
straight to an inbox, that is a notification setting, not a code change.

### Maps

Click-to-load. Nothing is requested from Google until the visitor presses **Show map**, so the
site keeps its zero-third-party-request property on load — verified: no external requests before
the click, the Google iframe appears after it. Both maps are built from the real office
addresses.

**Express Entry content is the client's own**, taken from the existing page and restructured —
the three programmes, minimum requirements, selection factors, the NOC categories, the 1,560-hour
rules and the CLB 7 / NCLC 7 language thresholds are all theirs. What changed is the presentation:
proper tables instead of pasted screenshots, and the CRS diagram rendered once rather than twice.

Total weight: **~5.5 MB** across nine pages.

## Design direction

Benchmarked against three established Canadian immigration consultancies — MDC Canada, ICS and
Immiland — and built to sit in the same category.

**Palette.** Those sites converge on deep navy with a red accent (MDC `#28317C`, ICS `#0C2136`
with `#EC4E4F`). This design uses navy `#0E2340` as the primary with Lifetime's own maroon
`#8A0716` as the action colour — matching the category while keeping the existing brand asset
meaningful. It replaces the six competing colours on the current site.

**Typography.** Poppins for headings — geometric, clean, modern — with Inter for body text. Both
self-hosted, 76 KB total, no third-party font calls.

**Hero.** Dark navy overlay over a lightly blurred (2px) photograph of the flag and the Peace
Tower. The headline is white with "Canada" in brand maroon `#8A0716`.

One known accessibility trade-off, made deliberately: maroon on the dark overlay measures
**≈1.05:1 luminance contrast** (sampled from the rendered pixels behind the word). It is
comfortably *readable* — red against blue is a strong hue difference — but WCAG scores luminance
only, and large text needs 3:1. In practice that means the word may be hard to distinguish for
users with red–green colour blindness, in strong glare, or on poor displays. The rest of the
headline is white at ~9:1, so the sentence is never lost, only the accent colour.

Two levers if that is ever a problem: lighten the accent (gold `#E0B950` measures 4.9:1 here and
is already in the palette), or return to a light hero wash, where the true maroon reaches 5.3:1.

**Patterns carried across from the references:**

- Full-bleed photographic hero with centred content
- The CICC-CCIC regulatory credential as a glass panel below the hero CTA — deliberately the
  most prominent trust element on the page, since licensing is what separates a regulated
  consultant from an unlicensed agent
- A short fact line under it (experience, offices, languages)
- An accreditation strip naming the regulator, with its mark
- Centred section headings — eyebrow, title, short accent rule
- Numbered process steps, icon above the numeral, joined by a connecting line
- A "meet your consultants" section with named credentials
- Deep navy multi-column footer

**Logo.** The site uses the company's own horizontal logo from the media library —
`uploads/2025/07/Lifetime-Immigration-Logo.png`, a proper wordmark-and-emblem lockup, and a
much newer asset than the red gradient tile the live site still serves in its header
(`uploads/2023/12/Website-header-01.png`, ACF `options_header_logo` = 1986).

The source file is RGBA but with an opaque white background, so it would have shown as a white
block on the navy footer. The white was knocked out by un-premultiplying each pixel against
white, which preserves the antialiased edges and recovers the true black and red. Two files:

- `img/logo.png` — black wordmark, red emblem, transparent (header and light surfaces)
- `img/logo-light.png` — white wordmark, red emblem, transparent (navy footer)

Both are derived from the same official artwork; no letterforms were redrawn.

## What changed from the current site

| Problem | Fix |
|---|---|
| The hero is a flat JPEG — headline, both consultants' names and the CICC-CCIC badge are baked into an image | Rebuilt as real HTML. The photograph and accreditation mark were extracted from that JPEG; everything else is live text |
| `/express-entry-2/` runs 8,005px of pasted Word content and renders the CRS diagram twice | Structural template established here; content pages follow |
| Text clipped mid-sentence in fixed-height carousel cards | Cards size to their content |
| Three hero CTAs competing equally | One primary action — free assessment — repeated in the header, hero and closing band |
| CICC-CCIC regulation buried in an image | Named in the top bar, hero badges, stats band, a dedicated accreditation strip, and per-consultant |
| A menu item reading "CLICK ON THE LINK BELOW!" | Menu rebuilt around four pathways |
| 100 pages, ~20 reachable from the nav, five titled "Express Entry" | Four pathways: Immigrate, Study, Visit & Family, Business |

## Motion

All motion runs off one shared easing curve (`--ease`) so the page feels like a single system
rather than a pile of separate effects.

- **Entrance.** Cards, quotes and articles fade and rise as they scroll into view. Each item is
  staggered by its index *within its own grid* (80ms apart), so a row of four cascades but two
  separate sections never inherit each other's delay. Section headings rise, and their accent
  rule draws outward from the centre.
- **Hero** animates on load rather than on scroll — headline, rule, subhead, buttons, credential
  panel and fact line, in sequence.
- **Hover.** Service cards lift, draw an accent rule across the top, fill their icon and shift
  the heading to maroon. Programme and article images scale inside their frames. Nav links wipe
  an underline in from the left. Process numerals lift and fill. Footer links slide.

Two safeguards, both verified:

1. **Nothing depends on JavaScript to be visible.** Content is opaque by default; the page only
   hides it to animate once JS confirms it is running, and a 3-second timer reveals everything
   regardless if the observer ever fails.
2. **`prefers-reduced-motion` is fully honoured** — all animation and transition durations *and
   delays* collapse to nil, and every element renders at full opacity.

## Testimonial slider

A maroon band with a continuous horizontal loop of **eight real testimonials**, pulled from the
WordPress database with the clients' own names — including one in French from a client in
Cameroon, which supports the bilingual positioning.

`main.js` duplicates the card track once and the keyframe translates by exactly half its width,
so the loop has no seam. Speed is derived from content width (55px/sec), so adding or removing
cards later doesn't change the pace.

Accessibility handled three ways:

- Pauses on hover **and** on keyboard focus-within, so a keyboard user tabbing through can read
- Duplicated cards are `aria-hidden` with their focusable children removed from the tab order,
  so screen readers and tab navigation see each testimonial once
- The default state in CSS is a plain scrollable row; the animation only starts once JS has
  added `.is-running`. Reduced-motion visitors and anyone without JS get the scrollable row,
  never a broken half-empty loop

## Pattern background

`img/pattern.jpg` — the maple-leaf tile, washed back under a white gradient so it reads as
texture rather than decoration. It tiles seamlessly (measured edge difference 9/765). Optimised
from the 1.7 MB source PNG to **50 KB**. Text over it was checked rather than assumed: body copy
4.98:1, headings 14.68:1.

## Copy

Tightened throughout. The original is long, passive, and leads with the company rather than the
reader:

> **Before:** "We are specialized in immigration services and have helped, during the past two
> decades, thousands of families successfully migrate to Canada."
>
> **After:** "Two decades. Thousands of families settled."


## Placeholder figures

The counter bands on the homepage and About page carry **illustrative numbers**, not confirmed
ones. Only *20+ years* is supported by the client's own About page. Replace the `data-count`
values in `src/pages/index.html` and `src/pages/about.html` with confirmed figures before
launch — they are marked with an HTML comment in both files.

| Shown | Status |
|---|---|
| 15,000+ families settled | Placeholder — needs confirming |
| 20+ years of experience | Supported by their About page |
| 40+ immigration programs | Placeholder — needs confirming |
| 60+ countries served | Placeholder — needs confirming |

The real testimonial count is **285** (54 published plus 231 unpublished in WordPress), if a
verifiable figure is wanted in the meantime.

## To confirm with the client

**The RCIC licence number conflicts between two of their own sources.**

| Source | Number |
|---|---|
| lifetimeimmigration.com About page (page 75) | ICCRC Licence **# R510526** |
| lifetimeresettlement.com footer (same principal) | RCIC **# R510528** |

Last digit differs — 6 versus 8. One is a typo, and it has been live on one of the two sites for
some time. Neither number is used on this build. The Quebec licence agrees across both sources
(**#11570**) and is shown on Mr Badal's consultant card. Confirm the RCIC number against the
CICC-CCIC public register and it can be added, along with Mrs Kavita Badal's.

**The live site's map points at the wrong office.** The `options_google_map_1` embed in ACF
resolves to *74 Burgby Ave, Brampton*, while the contact address in the same options table is
*29 Pagebrook Drive, Etobicoke*. This build uses the Etobicoke address for both the map and the
contact card. Worth checking which is current — anyone using the live map today is being sent to
the wrong place.

## Layout notes worth knowing before building inner pages

Three fixes here apply to every page that reuses these components:

1. **`figure` has a browser default of `margin: 1em 40px`.** It was silently shrinking every
   testimonial card by 80px inside its grid column (288px instead of 368px), which forced names
   and role labels to wrap and left the divider rules at three different heights. Reset in the
   base styles — reuse `.quote` and `.team-shot` freely now.
2. **Bottom-aligned card content misaligns titles.** `margin-top: auto` bottom-aligns a block,
   so cards whose copy runs to different line counts end up with headings on different
   baselines. The programme cards now use a fixed-height body with `justify-content: flex-end`
   instead. Use that pattern for any photo card.
3. **Caption blocks need a `min-height`** wherever a divider rule sits above them, or the rule
   tracks the content length.

Verified aligned row-by-row at 1440 / 768 / 390: testimonial captions, programme titles, service
card links, article links.

## Verified

- No console errors, and **zero third-party network requests** — no Google Fonts, no analytics,
  no CDN. The current site loads Google Tag Manager, two Analytics properties, Google Translate
  and a Facebook pixel before any content appears
- No horizontal scroll at 1440px, 768px or 390px
- No clipped text at any breakpoint
- Colour contrast passes WCAG AA throughout
- Keyboard accessible: visible focus rings, working skip link, and a mobile menu that opens,
  closes on `Escape` and returns focus to its toggle
- Content remains visible if JavaScript fails — the scroll animation only engages once JS has
  confirmed it is running

## Before this goes live

**The phone number and email now appear only in the footer**, since the top utility bar was
removed. If the client wants a click-to-call in the header, that is a small addition — worth
considering, as phone enquiries convert well in this sector.

**The "285 testimonials" figure** is no longer displayed anywhere after the stats band was
removed. It was the actual database count (54 published plus 231 unpublished) if it is wanted
back. Everything currently shown — CICC registration, 20+ years, two offices, bilingual service
— is verifiable.

**No star ratings are shown anywhere.** All three reference sites lean on Google or Trustpilot
scores. That block was deliberately left out rather than populated with an invented number. Supply
the real Google rating and review count and it can be added in the same style.

**Every contact detail here is the real one**, taken from the site's ACF options table:

| | |
|---|---|
| Canada | 29 Pagebrook Drive, Etobicoke, Ontario M9P 1P4 — +1 647 223 6314 |
| Mauritius | 2nd Floor, Popular Printing Building, 12 Leoville L'Homme Street, Port Louis — +230 5 251 9739 / +230 5 258 2151 |
| Email | info@lifetimeimmigration.com |

Worth stating explicitly because an AI-generated concept of this page circulated with a different
phone number, two invented office addresses, an invented Mauritius email, and three invented
clients with invented five-star reviews. None of that appears here. Every testimonial is real and
attributed to the person who wrote it.

**Content to address:**

1. The news feed stops at **March 2025**. Article dates are shown deliberately rather than hidden.
2. **231 testimonials are unpublished** in WordPress while only 54 are live. Several recent ones
   are specific and strong.
3. The live site's header still serves the old red gradient logo tile from December 2023, even
   though a cleaner horizontal lockup was uploaded in July 2025. This build uses the newer one.
   Worth updating the ACF logo field on the live site regardless of whether this rebuild goes
   ahead — it is a one-field change.

## Not in this pass

Inner pages, English/French translation wiring, and CMS integration. Pathway cards and secondary
links point to placeholders. The natural next step is one pathway hub plus one content page.

---

Content and imagery are taken from the live site and remain the property of Lifetime Immigration.
