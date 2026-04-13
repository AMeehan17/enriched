/**
 * Load a Google Font family+weight as an ArrayBuffer suitable for
 * @vercel/og's `fonts` option.
 *
 * Two non-obvious things this handles:
 *
 * 1. **Legacy User-Agent.** Google's CSS2 endpoint returns `woff2` to modern
 *    browsers, but Satori can only parse `ttf`/`otf`/`woff`. Sending an old
 *    IE UA forces Google to hand back a truetype URL. This is the single
 *    most common "why is my font not loading" trap with `ImageResponse`.
 *
 * 2. **Glyph subsetting** via `&text=` on the Google CSS URL. The
 *    `ImageResponse` bundle has a 500 KB cap that includes all fonts, so
 *    loading 3 families × 3 weights as full .ttf files (~40 KB each) would
 *    blow the budget. Subsetting to just the glyphs we actually render
 *    drops each variant to ~4–8 KB.
 *
 * Module-scope Map caches the Promise (not the resolved buffer) so
 * concurrent first-request races collapse to one network fetch.
 */

type FontStyle = "normal" | "italic";
type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

interface FontKey {
  family: string;
  weight: FontWeight;
  style?: FontStyle;
  /**
   * Optional glyph subset. If provided, Google returns a font file containing
   * only the glyphs needed to render `text`. Huge win for dynamic OG where
   * the text is known at request time.
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
    // Drop failed entries so the next request can retry.
    fontCache.delete(key);
    throw err;
  });
  fontCache.set(key, promise);
  return promise;
}

async function fetchGoogleFont(k: FontKey): Promise<ArrayBuffer> {
  const family = k.family.replace(/ /g, "+");
  const axis =
    k.style === "italic"
      ? `:ital,wght@1,${k.weight}`
      : `:wght@${k.weight}`;

  const base = `https://fonts.googleapis.com/css2?family=${family}${axis}&display=swap`;
  const url = k.text ? `${base}&text=${encodeURIComponent(k.text)}` : base;

  // CRITICAL: legacy User-Agent forces Google to return truetype, not woff2.
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

  // Match any Satori-supported format: truetype, opentype, OR woff.
  // The research draft assumed the legacy-UA trick would always yield
  // truetype, but in practice Google returns 'woff' for subsetted
  // (&text=) responses on several families. woff is fine — Satori
  // documents ttf/otf/woff as the supported set.
  const match = css.match(
    /src:\s*url\(([^)]+)\)\s*format\(['"](opentype|truetype|woff)['"]\)/,
  );
  if (!match || !match[1]) {
    throw new Error(
      `loadGoogleFont: no ttf/otf/woff src in CSS for ${k.family} ${k.weight}`,
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
 * ImageResponse-shaped font entries.
 */
export async function loadFamily(
  family: string,
  weights: FontWeight[],
  text?: string,
): Promise<
  { name: string; data: ArrayBuffer; weight: FontWeight; style: FontStyle }[]
> {
  return Promise.all(
    weights.map((weight) =>
      loadGoogleFont({ family, weight, ...(text !== undefined && { text }) }).then((data) => ({
        name: family,
        data,
        weight,
        style: "normal" as const,
      })),
    ),
  );
}
