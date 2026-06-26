import { describe, it, expect } from "vitest";
import {
  slugify,
  makeId,
  decodeEntities,
  serialize,
  parse,
  validateFrontmatter,
  toCitation,
  type ResourceFrontmatter,
} from "./resources-schema";

describe("slugify", () => {
  it("lowercases, strips punctuation, and hyphenates", () => {
    expect(slugify("How Will the US Unleash Commercial Nuclear Power?")).toBe(
      "how-will-the-us-unleash-commercial-nuclear-power",
    );
  });

  it("collapses repeated separators and trims edges", () => {
    expect(slugify("  Foo --- Bar __ Baz  ")).toBe("foo-bar-baz");
  });

  it("caps length at 80 chars without a trailing hyphen", () => {
    const out = slugify("a ".repeat(100));
    expect(out.length).toBeLessThanOrEqual(80);
    expect(out.endsWith("-")).toBe(false);
  });
});

describe("makeId", () => {
  it("appends the publish year", () => {
    expect(makeId("Fuel Recycling", "2025-03-14")).toBe("fuel-recycling-2025");
  });

  it("omits the year when no date is given", () => {
    expect(makeId("Fuel Recycling")).toBe("fuel-recycling");
  });
});

describe("decodeEntities", () => {
  it("decodes the entities YouTube captions leak", () => {
    expect(decodeEntities("Q&amp;A &gt;&gt; it&#39;s")).toBe("Q&A >> it's");
  });

  it("decodes &amp; last so &amp;gt; does not become >", () => {
    // &amp;gt; is a literally-escaped "&gt;" — it should decode to "&gt;", not ">".
    expect(decodeEntities("&amp;gt;")).toBe("&gt;");
  });
});

describe("serialize + parse roundtrip", () => {
  const fm: ResourceFrontmatter = {
    id: "talk-2025",
    type: "talk",
    title: 'A title: with a colon and "quotes"',
    speaker: "Jane Doe",
    channel: "Some Channel",
    source_url: "https://youtube.com/watch?v=abc",
    published: "2025-03-14",
    duration_s: 3520,
    retrieved: "2026-06-25",
    tags: ["oklo", "fuel-cycle"],
  };

  it("preserves all frontmatter fields through a roundtrip", () => {
    const doc = { frontmatter: fm, body: "[00:00] (&t=0s) hello world" };
    const parsed = parse(serialize(doc));
    expect(parsed.frontmatter).toEqual(fm);
    expect(parsed.body.trim()).toBe("[00:00] (&t=0s) hello world");
  });

  it("escapes and restores quotes in the title", () => {
    const out = serialize({ frontmatter: fm, body: "x" });
    expect(out).toContain('\\"quotes\\"');
    expect(parse(out).frontmatter.title).toBe(fm.title);
  });

  it("throws on missing frontmatter block", () => {
    expect(() => parse("no frontmatter here")).toThrow();
  });
});

describe("validateFrontmatter", () => {
  const base: ResourceFrontmatter = {
    id: "x-2025",
    type: "talk",
    title: "T",
    source_url: "https://x",
    retrieved: "2026-06-25",
    tags: [],
    channel: "C",
  };

  it("passes a valid talk", () => {
    expect(validateFrontmatter(base)).toEqual([]);
  });

  it("flags a talk with neither speaker nor channel", () => {
    const { channel: _omit, ...noIdentity } = base;
    expect(validateFrontmatter(noIdentity as ResourceFrontmatter)).toContain(
      "talk requires a speaker or channel (identity field)",
    );
  });

  it("flags a report with no publisher", () => {
    const errs = validateFrontmatter({ ...base, type: "report", channel: undefined });
    expect(errs).toContain("report requires a publisher");
  });

  it("flags a non-slug id and missing required fields", () => {
    const errs = validateFrontmatter({ ...base, id: "Bad Id!" });
    expect(errs.some((e) => e.includes("id must be a lowercase slug"))).toBe(true);
  });
});

describe("toCitation bridge", () => {
  it("maps a talk into Enriched's Citation shape", () => {
    const c = toCitation({
      id: "oklo-fuel-2025",
      type: "talk",
      title: "Fuel",
      speaker: "Jacob DeWitte",
      channel: "Catalyst",
      source_url: "https://youtube.com/watch?v=abc",
      published: "2025-03-14",
      retrieved: "2026-06-25",
      tags: [],
    });
    expect(c.bibtex_key).toBe("oklo_fuel_2025");
    expect(c.author).toBe("Jacob DeWitte");
    expect(c.year).toBe(2025);
    expect(c.url).toBe("https://youtube.com/watch?v=abc");
    expect(c.accessed).toBe("2026-06-25");
  });
});
