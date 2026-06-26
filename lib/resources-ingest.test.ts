import { describe, it, expect } from "vitest";
import { vttToBody } from "./resources-ingest";

// YouTube auto-captions "roll": each cue repeats the prior settled line, then
// adds one new line with inline <ts><c> word timing. The parser must keep only
// each cue's last line and dedup, or the transcript doubles every phrase.
const AUTO_VTT = `WEBVTT
Kind: captions
Language: en

00:00:00.000 --> 00:00:01.550 align:start position:0%
Good<00:00:00.080><c> morning.</c>

00:00:01.560 --> 00:00:03.630 align:start position:0%
Good morning.
Welcome<00:00:01.800><c> to</c><00:00:02.040><c> our</c><00:00:02.560><c> event</c>

00:00:03.630 --> 00:00:05.000 align:start position:0%
Welcome to our event
and<00:00:03.700><c> then</c><00:00:03.900><c> the</c>

00:00:05.000 --> 00:00:06.500 align:start position:0%
and then the
the<00:00:05.200><c> IBM</c><00:00:05.600><c> PC</c>
`;

describe("vttToBody — auto-captions", () => {
  const body = vttToBody(AUTO_VTT);

  it("emits a single timestamped block with the &t= deeplink marker", () => {
    expect(body.startsWith("[00:00] (&t=0s) ")).toBe(true);
  });

  it("does not double the rolling 'settled' lines", () => {
    expect(body).not.toContain("Good morning. Good morning.");
    expect(body).toContain("Good morning. Welcome to our event");
  });

  it("collapses the caption seam word doubling ('...the' + 'the IBM' -> 'the IBM')", () => {
    expect(body).not.toMatch(/\bthe the\b/);
    expect(body).toContain("the IBM PC");
  });

  it("strips inline timing tags from the output", () => {
    expect(body).not.toContain("<c>");
    expect(body).not.toMatch(/<\d\d:\d\d:\d\d/);
  });
});

describe("vttToBody — manual subtitles (no rolling)", () => {
  const MANUAL_VTT = `WEBVTT

00:00:05.000 --> 00:00:08.000
This is a manual caption
spanning two lines

00:00:08.000 --> 00:00:10.000
And a second cue here
`;
  const body = vttToBody(MANUAL_VTT);

  it("keeps all lines of a manual cue (no last-line-only dropping)", () => {
    expect(body).toContain("This is a manual caption spanning two lines");
    expect(body).toContain("And a second cue here");
  });

  it("uses the cue start time for the marker", () => {
    expect(body).toContain("[00:05] (&t=5s)");
  });
});

describe("vttToBody — preserves genuine repeated words", () => {
  it("keeps real in-utterance doubles verbatim (citation faithfulness)", () => {
    // Seam dedup must NOT touch doubles inside a line — only the roll boundary.
    const vtt = `WEBVTT

00:00:10.000 --> 00:00:14.000
I think that that company had had a point
`;
    const body = vttToBody(vtt);
    expect(body).toContain("that that company had had a point");
  });
});

describe("vttToBody — HTML entities", () => {
  it("decodes entities that leak from auto-captions", () => {
    const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.000
Q&amp;A<00:00:00.500><c> session</c>
`;
    expect(vttToBody(vtt)).toContain("Q&A session");
  });
});

describe("vttToBody — empty input", () => {
  it("returns empty string when there are no cues", () => {
    expect(vttToBody("WEBVTT\n\n")).toBe("");
  });
});
