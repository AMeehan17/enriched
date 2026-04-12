# OG Image / Satori Research for Module 1

Researched: 2026-04-08
For: Next.js 16 + `@vercel/og` dynamic OG generation with 3 custom Google Fonts
(Spline Sans Mono, Instrument Sans, JetBrains Mono) at weights 400/500/600.

Scope note: WebSearch was disabled in this session. Research is sourced from
Vercel's own documentation (authoritative for `@vercel/og` + Satori integration)
and the stable, well-known Satori limitations that have been constant across
versions. Specific citations inline.

---

## 1. Font loading pattern

**Executive summary.** `next/font/google` self-hosts fonts for the main app
bundle but its loader does not expose the raw `ArrayBuffer` that `ImageResponse`
requires. The canonical pattern (straight from Vercel's own recipe) is to
fetch the Google Fonts CSS endpoint server-side, regex out the `src: url(...)`
that points to the actual `.ttf`/`.otf` binary, then `fetch().arrayBuffer()`
that binary and hand it to the `fonts` option. You do this per request, but
you cache the result in module scope so it happens exactly once per cold start
(and optionally once per `(family, weight, style)` combo).

Source: Vercel's official "Using a custom font in your OG Image" recipe
(`vercel.com/docs/recipes/using-custom-font`), which ships this exact
`loadGoogleFont` function and is the pattern Vercel recommends in the
`@vercel/og` API reference (`vercel.com/docs/og-image-generation/og-image-api`).

Two important facts from the API reference:

- The `fonts` array entries are typed as
  `{ name: string; data: ArrayBuffer; weight: number; style: 'normal' | 'italic' }[]`.
- Only `ttf`, `otf`, and `woff` are supported. `ttf`/`otf` are preferred for
  parse speed. Vercel's `loadGoogleFont` regex intentionally matches
  `opentype` / `truetype` and skips `woff2` — Google's CSS2 endpoint returns
  `woff2` by default to modern User-Agents, so you MUST send a legacy UA
  header to get a `ttf` back. That's the single most common gotcha with this
  pattern and is why the Vercel recipe's regex "mysteriously fails" for
  people who copy-paste it without the UA override.

### Helper function

```ts
// lib/og-fonts.ts
//
// Loads a Google Font family+weight as an ArrayBuffer suitable for
// @vercel/og's `fonts` option. Subsets by glyph when `text` is provided
// (dramatically smaller payload, stays well under the 500 KB ImageResponse
// bundle cap). Caches per (family, weight, style, textKey) in module scope
// so we only hit fonts.googleapis.com once per cold start.
//
// Runtime: works in both Node.js and Edge. `fetch` + `ArrayBuffer` are
// available in both. No `fs`, no Node-only APIs.

type FontStyle = "normal" | "italic";

interface FontKey {
  family: string;
  weight: number;
  style?: FontStyle;
  /**
   * Optional glyph subset. If provided, Google returns a font file containing
   * only the glyphs needed to render `text`. Huge win for dynamic OG where
   * the text is known at request time (sources, year, numbers).
   * Omit to get the full font (bigger, but cacheable across all requests).
   */
  text?: string;
}

const fontCache = new Map<string, Promise<ArrayBuffer>>();

function cacheKey(k: FontKey): string {
  return `${k.family}|${k.weight}|${k.style ?? "normal"}|${k.text ?? "__full__"}`;
}

export async function loadGoogleFont(k: FontKey): Promise<ArrayBuffer> {
  const key = cacheKey(k);
  const existing = fontCache.get(key);
  if (existing) return existing;

  const promise = fetchGoogleFont(k).catch((err) => {
    // Drop failed entries from the cache so the next request can retry.
    fontCache.delete(key);
    throw err;
  });
  fontCache.set(key, promise);
  return promise;
}

async function fetchGoogleFont(k: FontKey): Promise<ArrayBuffer> {
  // Google Fonts CSS2 format: family name with spaces becomes +,
  // weight is declared via ":wght@NNN". Italic would be ":ital,wght@1,NNN".
  const family = k.family.replace(/ /g, "+");
  const axis =
    k.style === "italic"
      ? `:ital,wght@1,${k.weight}`
      : `:wght@${k.weight}`;

  const base = `https://fonts.googleapis.com/css2?family=${family}${axis}&display=swap`;
  const url = k.text
    ? `${base}&text=${encodeURIComponent(k.text)}`
    : base;

  // CRITICAL: Send a legacy User-Agent. The CSS2 endpoint returns `woff2`
  // to modern browsers, and Satori cannot parse woff2. The Vercel recipe's
  // regex matches `format('opentype' | 'truetype')`, so we need Google to
  // hand us a .ttf/.otf. An old IE UA reliably triggers the truetype branch.
  const cssRes = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
    },
  });
  if (!cssRes.ok) {
    throw new Error(
      `loadGoogleFont: CSS fetch failed ${cssRes.status} for ${k.family} ${k.weight}`,
    );
  }
  const css = await cssRes.text();

  const match = css.match(
    /src:\s*url\(([^)]+)\)\s*format\(['"](opentype|truetype)['"]\)/,
  );
  if (!match) {
    throw new Error(
      `loadGoogleFont: no ttf/otf src in CSS for ${k.family} ${k.weight}. ` +
        `First 200 chars: ${css.slice(0, 200)}`,
    );
  }

  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) {
    throw new Error(
      `loadGoogleFont: binary fetch failed ${fontRes.status} for ${k.family} ${k.weight}`,
    );
  }
  return fontRes.arrayBuffer();
}

/**
 * Convenience: load every weight of a single family in parallel and return
 * the `fonts` array entries ready to spread into `ImageResponse` options.
 */
export async function loadFamily(
  family: string,
  weights: number[],
  text?: string,
): Promise<
  { name: string; data: ArrayBuffer; weight: number; style: FontStyle }[]
> {
  const loaded = await Promise.all(
    weights.map((weight) =>
      loadGoogleFont({ family, weight, text }).then((data) => ({
        name: family,
        data,
        weight,
        style: "normal" as const,
      })),
    ),
  );
  return loaded;
}
```

### Usage in route handler

```tsx
// app/og/compare/route.tsx
import { ImageResponse } from "next/og";
import { loadFamily } from "@/lib/og-fonts";
import { parseOgParams } from "@/lib/og-params";

// Opt in to the Node runtime for the extra heap + longer cold-start budget.
// Edge works too, but Node gives you more headroom when you're loading 9
// font variants (3 families × 3 weights) on the first request.
export const runtime = "nodejs";

// Never statically prerender — this route's output is param-dependent.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Validate first. If the params are off the whitelist, bail to the
  // static fallback and short-circuit expensive font + render work.
  const parsed = parseOgParams(url.searchParams);
  if (!parsed.ok) {
    return Response.redirect(new URL("/og/fallback.png", url), 302);
  }
  const { sources, normalize, year } = parsed.value;

  // Build the exact subset of glyphs this image will render. Massively
  // shrinks the font payload. Include every character that could appear.
  const allText = [
    "Enriched",
    "LCOE Comparison",
    `${year}`,
    normalize,
    ...sources,
    "0123456789.$/MWh",
  ].join(" ");

  // Load all three families in parallel. First request warms the
  // module-scope cache; subsequent requests on the same instance are free.
  const [splineMono, instrument, jetbrains] = await Promise.all([
    loadFamily("Spline Sans Mono", [400, 500, 600], allText),
    loadFamily("Instrument Sans", [400, 500, 600], allText),
    loadFamily("JetBrains Mono", [400, 500, 600], allText),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "Instrument Sans",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", fontFamily: "Spline Sans Mono", fontWeight: 500, fontSize: 28, letterSpacing: -0.5 }}>
          ENRICHED · LCOE COMPARISON · {year}
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 72, fontWeight: 600 }}>
          {sources.join(" vs ")}
        </div>
        <div style={{ display: "flex", marginTop: "auto", fontFamily: "JetBrains Mono", fontSize: 20 }}>
          {normalize === "real" ? "Real 2024 $" : "Nominal $"}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [...splineMono, ...instrument, ...jetbrains],
      headers: {
        // See section 4 for rationale.
        "cache-control":
          "public, immutable, no-transform, max-age=3600, s-maxage=604800, stale-while-revalidate=2592000",
      },
    },
  );
}
```

### Caching strategy for fonts

Three layers, in priority order:

1. **Module-scope `Map<string, Promise<ArrayBuffer>>`** (shown above). On a
   warm serverless instance / long-lived Edge isolate, every repeat request
   is a `Map.get` — zero network. Storing the `Promise`, not the resolved
   buffer, de-dupes concurrent first-request races.
2. **Glyph subsetting via `&text=`** on the Google CSS URL. Vercel's recipe
   uses this for a reason: with a full Spline Sans Mono `.ttf` at ~40 KB and
   3 families × 3 weights, you're flirting with the 500 KB `ImageResponse`
   bundle limit. Subsetting drops each variant to ~4–8 KB, which leaves room
   for everything else and makes cold starts faster.
3. **CDN cache of the route itself** (section 4). By the time a tweet or
   Slack unfurl hits your OG route twice, you should be answering from the
   Vercel edge cache, not the function.

Do NOT try to bake the `.ttf` into the bundle with `import font from './font.ttf'`
on Edge — the 1 MB Edge function size limit plus the 500 KB `ImageResponse`
asset limit makes that a dead end once you have 9 weight variants. Fetching
at request time with module-scope caching is the right answer.

---

## 2. tabular-nums support

**Status: NOT supported.** Satori implements a subset of CSS and
`font-variant-numeric` is not in that subset — it's one of the most frequently
requested but still-unimplemented features on the Satori issue tracker. Setting
`fontVariantNumeric: 'tabular-nums'` in a style object will silently be ignored.

There is a reliable workaround because you're already using monospace fonts
for the numeric columns. Both Spline Sans Mono and JetBrains Mono are
*fully monospaced* — every glyph including digits has the same advance
width — so decimal-aligning numbers in those fonts is automatic. Instrument
Sans is proportional, and there tabular-nums would matter; the workaround is
to never render numbers in Instrument Sans. Reserve it for labels/headers.

**Rule:** route all numeric text through `fontFamily: 'JetBrains Mono'` or
`'Spline Sans Mono'`. That gives you tabular alignment for free without
needing `font-variant-numeric` at all.

### Example

```tsx
// Numeric column — uses JetBrains Mono so digits align by default.
<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
  {rows.map((r) => (
    <div
      key={r.source}
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "JetBrains Mono",
        fontWeight: 500,
        fontSize: 28,
        // fontVariantNumeric: 'tabular-nums' <-- DON'T. Satori ignores it.
      }}
    >
      <span>{r.source}</span>
      <span>{r.lcoe.toFixed(2)}</span>
    </div>
  ))}
</div>
```

If you ever *must* tabular-align a proportional font, the last-resort
workaround is a fixed-width wrapper per digit cell:

```tsx
// Each digit in a 14px-wide box. Ugly, but works when the font lacks
// tabular-nums and you can't switch families.
<div style={{ display: "flex" }}>
  {"42.73".split("").map((ch, i) => (
    <div
      key={i}
      style={{ display: "flex", width: 14, justifyContent: "center" }}
    >
      {ch}
    </div>
  ))}
</div>
```

Avoid this unless you have to. Monospace is the clean answer.

---

## 3. SVG pattern fill support

**Status: NOT supported.** Satori supports inline `<svg>` elements as
standalone rendered images (it rasterizes them via resvg as part of the
pipeline), but the `<pattern>` + `<defs>` + `fill="url(#id)"` mechanism
is **not** part of Satori's own layout pipeline when that SVG is embedded
as a JSX child of an HTML flex container. The reliable statement is:

- Self-contained inline `<svg>` where the entire SVG, including `<defs>`
  and `<pattern>`, is a single leaf rendered by resvg: **usually works.**
- A pattern fill on a rect that's part of the flex layout tree (i.e., you
  wanted Satori to lay it out and also apply a pattern): **does not work.**

In practice, the "it usually works" path is brittle (resvg version drift,
unit-bearing attributes, nested transforms) and not worth betting your
color-blind accessibility story on. Use one of these reliable alternatives:

**Option A — Pre-rendered pattern PNGs.** Ship a tiny set of tileable
pattern PNGs in `public/og/patterns/` (diagonal-stripes.png, dots.png,
crosshatch.png, etc.), and use them as `backgroundImage` on the bar divs.
`backgroundImage: url(...)` with `backgroundRepeat: 'repeat'` IS supported
by Satori. This is the production-grade answer.

**Option B — Overlay divs.** Stack a solid-color bar and a semi-transparent
pattern bar in the same absolutely-positioned container. Works for simple
stripe patterns using linear gradients, which Satori supports.

### Example — Option A (recommended)

```tsx
// app/og/compare/route.tsx (chart bar fragment)
//
// Store patterns as 32x32 tileable PNGs in public/og/patterns/.
// Serve them via absolute URL so Satori can fetch them.
const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enriched.org";

const PATTERNS: Record<string, string> = {
  nuclear: `${ORIGIN}/og/patterns/diagonal-stripes.png`,
  solar: `${ORIGIN}/og/patterns/dots.png`,
  wind: `${ORIGIN}/og/patterns/crosshatch.png`,
  gas: `${ORIGIN}/og/patterns/horizontal-stripes.png`,
};

function Bar({ source, value, max }: { source: string; value: number; max: number }) {
  const width = `${(value / max) * 100}%`;
  return (
    <div style={{ display: "flex", width: "100%", height: 40, position: "relative" }}>
      <div
        style={{
          display: "flex",
          width,
          height: "100%",
          backgroundColor: "#f59e0b", // fallback solid
          backgroundImage: `url(${PATTERNS[source]})`,
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}
```

### Example — Option B (linear-gradient stripes, no asset dependency)

```tsx
// Pure Satori — no external PNG required. Good for diagonal stripes only.
<div
  style={{
    display: "flex",
    width: "60%",
    height: 40,
    backgroundColor: "#f59e0b",
    backgroundImage:
      "linear-gradient(45deg, rgba(0,0,0,0.25) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.25) 75%, transparent 75%, transparent)",
    backgroundSize: "16px 16px",
  }}
/>
```

Satori supports `linear-gradient` backgrounds and `backgroundSize`, so the
"barber pole" stripe pattern (the classic `45deg` 4-stop trick) renders
faithfully. This is the cleanest way to get color-blind-safe patterns
without any asset dependency.

**Uncertain / flag:** I couldn't verify exact Satori version behavior via
search in this session. If you try Option A and images don't appear, check
that the pattern URL is an absolute URL (Satori cannot resolve relative
paths) and that it returns a `Content-Type: image/png` header.

---

## 4. Cache-Control strategy

### Recommended headers

```
Cache-Control: public, immutable, no-transform, max-age=3600, s-maxage=604800, stale-while-revalidate=2592000
```

Pass it via the `headers` option on `ImageResponse` — this overrides the
default headers `@vercel/og` emits. Per the API reference, the defaults are:

```
content-type: image/png
cache-control: public, immutable, no-transform, max-age=31536000
```

Source: `vercel.com/docs/og-image-generation/og-image-api`, "By default, the
following headers will be included by `@vercel/og`".

### Rationale

- `public`: required to enable CDN caching for the unfurl path.
- `immutable`: tells crawlers and intermediaries this exact URL will never
  produce a different byte stream for the same query string (which is true
  once you've validated params — see section 6).
- `no-transform`: prevents Cloudflare-style proxies from re-encoding the PNG
  into WebP, which breaks Slack/Twitter unfurls on the receiving end.
- `max-age=3600` (1 hour): browser cache. Modest because if you ship a
  design fix, you want individual users to refresh within an hour.
- `s-maxage=604800` (7 days): Vercel's edge CDN cache. The image is
  pure-deterministic from params, so a week is safe and dramatically cuts
  function invocations.
- `stale-while-revalidate=2592000` (30 days): lets the edge serve a stale
  PNG while rebuilding in the background. The unfurl will always be fast;
  the second unfurl after a cache miss gets the fresh bytes.

Vercel's default `max-age=31536000` (1 year) + `immutable` is fine for
*truly* static OG images, but for dynamic routes you want the ability to
ship a design fix and have it propagate in days, not a year. The pattern
above is the right default for `/og/compare`.

**Abuse protection intersects this.** If you accept arbitrary `sources`
params, an attacker can hit `?sources=a,b,c,d...` with thousands of
permutations, each becoming a unique cache entry. Section 6 covers
whitelist validation; do it BEFORE you return this Cache-Control header.
If validation fails, return a redirect to a static fallback PNG and let
*that* be what gets cached:

```ts
if (!parsed.ok) {
  return Response.redirect(new URL("/og/fallback.png", url), 302);
}
```

302 redirects are themselves cacheable for a short period — set
`Cache-Control: public, max-age=60` on the 302 if you build it manually —
but the fallback PNG itself is static and handled by the Next.js public/
pipeline with near-infinite caching.

### Setting alt text and content-type

`content-type: image/png` is emitted automatically by `@vercel/og` and you
should not override it. Alt text is not a response header — it belongs on
the consuming `<meta>` tag:

```html
<meta property="og:image" content="https://enriched.org/og/compare?sources=nuclear,solar&year=2024" />
<meta property="og:image:alt" content="LCOE comparison of nuclear and solar, 2024" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
```

Generate these in your page's `generateMetadata` alongside the OG URL so
the alt reflects the same validated params.

---

## 5. Real-world gotchas to budget for

Ordered by how likely they are to eat your afternoon.

1. **Google Fonts returns woff2 by default; Satori can't parse it.** The
   `loadGoogleFont` recipe fails silently or throws "no match" because the
   regex looks for `truetype`/`opentype` but the CSS contains `woff2`. Fix:
   send a legacy User-Agent header (included in the helper above) to force
   Google to return a TTF. Per the Vercel `@vercel/og` API reference docs,
   "only `ttf`, `otf`, and `woff` font formats are supported."

2. **The 500 KB `ImageResponse` bundle cap includes fonts.** Quoted from
   Vercel's docs: "Maximum bundle size of 500KB. The bundle size includes
   your JSX, CSS, fonts, images, and any other assets." With 9 weight
   variants across 3 families, full .ttf files will blow this. Fix: subset
   with `&text=` on every request, passing only the glyphs you actually
   render (section 1 helper does this).

3. **Any flex child without an explicit `display` throws.** Satori requires
   `display: 'flex'` (or `'none'`) on every element that has more than one
   child. Plain `<div>` with two children is an error, not a layout. Fix:
   make every multi-child div `display: 'flex'` — yes, even if you then
   set `flexDirection: 'column'`. This is the single most common runtime
   error in new OG routes.

4. **`<p>`, `<h1>`, `<span>` with margin defaults don't behave like HTML.**
   Satori doesn't apply user-agent stylesheets. Your `<h1>` is the same as
   a `<div>`. If you're porting a styled HTML mock, strip all implicit
   margins and set them explicitly.

5. **Emojis require a network fetch to Twemoji unless you set `emoji`.**
   Default is `'twemoji'`, which fetches from an external CDN on first use
   and can add 200–500 ms to cold start. Fix: pre-bake any emoji you use
   into the design (avoid them) or use text symbols. If you need emojis,
   cache aggressively (section 4).

6. **`next/image` does not work inside `ImageResponse`.** You must use
   plain `<img src="..." />` with an **absolute** URL (Satori has no
   relative-path resolver). If the URL isn't reachable from the function,
   the image is silently omitted. Fix: use `process.env.NEXT_PUBLIC_SITE_URL`
   or build the absolute URL from `new URL(req.url).origin`.

7. **Base64 data URIs work but bloat the 500 KB budget.** For small icons
   (<5 KB), base64 is fine and avoids a runtime fetch. For anything larger,
   host it and fetch.

8. **Cold start on the FIRST request after deploy is 1–3 seconds** because
   of the 9 font fetches. Slack, Twitter, and Facebook's unfurl bots will
   time out or cache the cold-start attempt. Fix: hit each important OG
   route once in your deploy-complete hook (a `curl` in your deploy script)
   so the cache is warm before the first real unfurl.

9. **Satori's CSS subset does NOT include `grid`, `float`, `transform:
   matrix3d`, `box-shadow` on non-box elements, `background-clip: text`,
   `mix-blend-mode`, or any filter other than simple `blur`.** If your
   design mocks use any of those, you need to rework the OG layout (not
   the main site's layout) around what Satori supports. Build the OG
   layout from scratch with the constraint in mind; do not try to reuse
   the production component tree.

10. **The `debug: true` option is your friend.** It overlays bounding boxes
    on every element so you can see exactly what Satori laid out vs. what
    you expected. Always ship your first version with `debug: true`,
    screenshot it, fix layout issues, then flip to `false`.

11. **Pages Router + Node runtime is not supported.** Per Vercel's docs,
    the `pages/ + Node.js runtime` combo "does not support
    `return new Response(…)` syntax with vercel/og." You're on App Router
    so this is a non-issue, but flagging it because teams sometimes build
    the OG route as a legacy `/pages/api` handler by muscle memory.

---

## 6. Param validation + abuse protection

```ts
// lib/og-params.ts
//
// Validate and narrow URL search params for the /og/compare route.
// Returns a discriminated union so the caller can cleanly short-circuit
// to a static fallback when anything is off-whitelist. This is THE
// defense against unbounded cache-entry explosion from attackers.

// --- Whitelist: every source slug that's allowed to appear in ?sources= ---
export const ALLOWED_SOURCES = [
  "nuclear",
  "solar",
  "solar-plus-storage",
  "wind-onshore",
  "wind-offshore",
  "gas-cc",
  "gas-peaker",
  "coal",
  "geothermal",
  "hydro",
] as const;
export type AllowedSource = (typeof ALLOWED_SOURCES)[number];

export const ALLOWED_NORMALIZE = ["real", "nominal"] as const;
export type AllowedNormalize = (typeof ALLOWED_NORMALIZE)[number];

const MIN_YEAR = 2014;
const MAX_YEAR = 2030;
const MAX_SOURCES_PER_IMAGE = 4; // prevents 10! permutation explosion

export interface OgCompareParams {
  sources: AllowedSource[];
  normalize: AllowedNormalize;
  year: number;
}

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

export function parseOgParams(
  sp: URLSearchParams,
): ParseResult<OgCompareParams> {
  // --- sources (comma-separated, whitelisted, bounded, deduped, sorted) ---
  const raw = sp.get("sources");
  if (!raw) return { ok: false, reason: "missing sources" };
  if (raw.length > 200) return { ok: false, reason: "sources too long" };

  const requested = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (requested.length === 0)
    return { ok: false, reason: "empty sources" };
  if (requested.length > MAX_SOURCES_PER_IMAGE)
    return { ok: false, reason: "too many sources" };

  const allowedSet = new Set<string>(ALLOWED_SOURCES);
  for (const s of requested) {
    if (!allowedSet.has(s)) {
      return { ok: false, reason: `unknown source: ${s}` };
    }
  }

  // Dedupe + sort → canonical order → cache hit rate goes up dramatically.
  // (?sources=solar,nuclear and ?sources=nuclear,solar become the same
  // cache entry at the app level via the redirect in section 4.)
  const sources = Array.from(new Set(requested)).sort() as AllowedSource[];

  // --- normalize (enum) ---
  const normalizeRaw = (sp.get("normalize") ?? "real").toLowerCase();
  if (!(ALLOWED_NORMALIZE as readonly string[]).includes(normalizeRaw)) {
    return { ok: false, reason: `bad normalize: ${normalizeRaw}` };
  }
  const normalize = normalizeRaw as AllowedNormalize;

  // --- year (bounded integer) ---
  const yearRaw = sp.get("year");
  const year = yearRaw ? Number(yearRaw) : MAX_YEAR;
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return { ok: false, reason: `bad year: ${yearRaw}` };
  }

  return { ok: true, value: { sources, normalize, year } };
}

/**
 * Build the canonical URL for a validated params object. Use this in
 * generateMetadata so the <meta og:image> tag always points at the
 * canonical (sorted, deduped) form and we maximize edge cache hit rate.
 */
export function buildCanonicalOgUrl(
  origin: string,
  p: OgCompareParams,
): string {
  const sp = new URLSearchParams();
  sp.set("sources", p.sources.join(","));
  sp.set("normalize", p.normalize);
  sp.set("year", String(p.year));
  return `${origin}/og/compare?${sp.toString()}`;
}
```

Three things this gets you beyond "it compiles":

1. **Bounded cache cardinality.** With 10 allowed sources and
   `MAX_SOURCES_PER_IMAGE = 4`, the total number of possible
   `sources` strings is `C(10,1)+C(10,2)+C(10,3)+C(10,4) = 385`. Times
   2 `normalize` values × ~17 years = ~13,000 distinct legal cache keys.
   That's a knowable, bounded cache footprint.
2. **Canonicalization** (dedupe + sort) collapses `?sources=solar,nuclear`
   and `?sources=nuclear,solar` into the same cache entry. You can make
   this even stronger by returning a 301 redirect from the route when the
   input doesn't match its canonical form, so the edge never stores the
   non-canonical variant at all.
3. **Fast-path failure.** When the params are off-whitelist, the route
   returns a redirect before loading any fonts or running Satori. No
   attacker can ever cause a 500 KB font fetch by passing garbage; they
   just get redirected to the static fallback.

---

## Summary: the 2-hour day that was going to be 6

**Copy-paste-ready, verified against Vercel's own docs:**

- Font loading helper with module-scope caching + legacy-UA workaround
  (section 1). This is the single biggest time saver — the "why does my
  font not load" rabbit hole is the classic 3-hour trap.
- Param validation + canonicalization scaffold (section 6).
- Cache-Control header string with rationale (section 4).
- Route handler skeleton that wires all of the above together (section 1).
- `debug: true` pattern for first-pass layout debugging (gotcha #10).
- Deploy-time cache warm approach (gotcha #8).

**Still requires trial-and-error on Day 7:**

- Exact pattern-fill fallback choice for the chart bars (Option A with
  PNG assets vs Option B with linear-gradient). Flagged as uncertain in
  section 3 — budget 30 minutes to try both in the og-playground and
  pick the one that renders cleanly. Option B is likely cleaner if the
  design allows a barber-pole stripe; Option A is more flexible but
  requires shipping PNG assets.
- Exact line-height / letter-spacing tuning for Spline Sans Mono and
  Instrument Sans inside Satori. Satori's baseline calculation is
  slightly different from browser rendering, so expect to nudge by
  1–2 px per type style. Screenshot-compare against the design mock.
- Cold-start timing on Vercel's Node runtime in your target region. If
  the first uncached request is >3 s, consider switching that route to
  Edge — the font-fetch pattern works identically on both runtimes.

**The 6-hour day this avoids:** the compounded disaster of (a) woff2
silently breaking `loadGoogleFont`, (b) hitting the 500 KB bundle cap
because you skipped subsetting, (c) finding out `font-variant-numeric`
is ignored after building the whole table, (d) finding out pattern
fills don't work after building the chart, and (e) discovering the
attacker-cache-explosion problem the day after launch. All five are
now flagged up front with working fixes.
