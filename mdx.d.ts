/**
 * Type declarations for *.mdx imports.
 *
 * Module 3 articles live as MDX files imported by their page route:
 *
 *   import SpectrumArticle, { metadata } from "@/content/reference/spectrum.mdx";
 *
 * @next/mdx compiles each MDX file to a React component plus any
 * top-level `export` statements. The `metadata` field below mirrors
 * the shape we use in `content/reference/*.mdx` so page routes get
 * typed access to title/description/etc. without per-import assertions.
 */

declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { MDXProps } from "mdx/types";

  export const metadata: {
    title: string;
    description: string;
    publishedDate?: string;
    updatedDate?: string;
    author?: string;
    slug?: string;
    [key: string]: unknown;
  };

  const MDXComponent: ComponentType<MDXProps>;
  export default MDXComponent;
}
