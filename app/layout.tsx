import type { Metadata } from "next";
import { Spline_Sans_Mono, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

// next/font/google self-hosts the fonts at build time. Zero CLS, no external
// requests at runtime, no privacy concerns. The CSS variables are exposed
// via the `variable` field and applied on <html> below.
//
// Subset to latin only. Drop weight 700 — DESIGN.md uses 400/500/600 only.

const splineSansMono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-spline-sans-mono",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enriched — Interactive Nuclear Energy Education",
  description:
    "Open-source interactive nuclear energy education. Beautiful, neutral, data-first. Toggle sources, normalize comparisons, watch the data tell the story.",
  metadataBase: new URL("https://enriched.xyz"),
  openGraph: {
    title: "Enriched — Interactive Nuclear Energy Education",
    description:
      "Compare energy sources across eight dimensions. Every number cited. Draw your own conclusions.",
    url: "https://enriched.xyz",
    siteName: "Enriched",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enriched — Interactive Nuclear Energy Education",
    description:
      "Compare energy sources across eight dimensions. Every number cited. Draw your own conclusions.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Font CSS variables go on <html>, not <body>. This matters for next/font:
  // the className must be on the document element so child components
  // resolve the variable correctly. Putting it on <body> works but is
  // a known footgun with shadcn/Tailwind v4 setups.
  return (
    <html
      lang="en"
      className={`${splineSansMono.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        {/* Skip link — first focusable element on every page. Keyboard users
            hitting Tab from the address bar get a visible "Skip to main
            content" chip that jumps past the nav/toolbar to the chart area. */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
