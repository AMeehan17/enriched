import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { readSource } from "@/lib/resources-library";
import { TranscriptReader } from "../_components/TranscriptReader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { id } = await params;
  const doc = await readSource(id);
  if (!doc) notFound();
  return <TranscriptReader fm={doc.frontmatter} body={doc.body} />;
}
