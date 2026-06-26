"use client";

import { useActionState, useState } from "react";
import {
  ingestYoutubeAction,
  ingestPdfAction,
  type IngestState,
} from "../actions";

const fieldCls =
  "font-[family-name:var(--font-body)] text-[length:var(--text-sm)] bg-[var(--color-surface)] " +
  "border border-[var(--color-rule-strong)] rounded-[var(--radius-md)] px-[var(--spacing-3)] py-[var(--spacing-2)] " +
  "text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] w-full";

const labelCls =
  "font-[family-name:var(--font-display)] text-[length:var(--text-xs)] uppercase tracking-[0.08em] " +
  "text-[var(--color-text-muted)] mb-[var(--spacing-1)] block";

function Status({ state }: { state: IngestState }) {
  if (!state) return null;
  return (
    <p
      role="status"
      className={`font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] mt-[var(--spacing-2)] ${
        state.ok ? "text-[var(--color-text)]" : "text-[var(--color-error)]"
      }`}
    >
      {state.ok ? "✓ " : "✕ "}
      {state.message}
    </p>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium
        bg-[var(--color-text)] text-[var(--color-bg)] border border-[var(--color-text)]
        rounded-[var(--radius-md)] px-[var(--spacing-4)] py-[var(--spacing-2)]
        hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)]
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-[var(--duration-fast)]"
    >
      {pending ? "Ingesting…" : label}
    </button>
  );
}

export function IngestPanel() {
  const [tab, setTab] = useState<"youtube" | "pdf">("youtube");
  const [ytState, ytAction, ytPending] = useActionState(ingestYoutubeAction, null);
  const [pdfState, pdfAction, pdfPending] = useActionState(ingestPdfAction, null);

  return (
    <section
      className="border border-[var(--color-rule)] rounded-[var(--radius-md)] bg-[var(--color-surface)]
        p-[var(--spacing-6)] mb-[var(--spacing-12)]"
    >
      <div className="flex gap-[var(--spacing-4)] mb-[var(--spacing-4)] border-b border-[var(--color-rule)]">
        {(["youtube", "pdf"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium
              pb-[var(--spacing-2)] -mb-[1px] border-b-2 transition-colors duration-[var(--duration-fast)] ${
                tab === t
                  ? "border-[var(--color-accent)] text-[var(--color-text)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
          >
            {t === "youtube" ? "YouTube / podcast" : "PDF report"}
          </button>
        ))}
      </div>

      {tab === "youtube" ? (
        <form action={ytAction} className="flex flex-col gap-[var(--spacing-3)]">
          <div>
            <label htmlFor="yt-url" className={labelCls}>
              YouTube URL
            </label>
            <input
              id="yt-url"
              name="url"
              type="url"
              required
              placeholder="https://www.youtube.com/watch?v=…"
              className={`${fieldCls} font-[family-name:var(--font-mono)]`}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--spacing-3)]">
            <div>
              <label htmlFor="yt-speaker" className={labelCls}>
                Speaker (optional)
              </label>
              <input id="yt-speaker" name="speaker" type="text" placeholder="Jacob DeWitte" className={fieldCls} />
            </div>
            <div>
              <label htmlFor="yt-tags" className={labelCls}>
                Tags (comma-separated)
              </label>
              <input id="yt-tags" name="tags" type="text" placeholder="oklo, fuel-cycle" className={fieldCls} />
            </div>
          </div>
          <div className="flex items-center gap-[var(--spacing-4)]">
            <SubmitButton pending={ytPending} label="Ingest transcript" />
            <span className="font-[family-name:var(--font-body)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
              Fetches captions — can take 15–30s for a long talk.
            </span>
          </div>
          <Status state={ytState} />
        </form>
      ) : (
        <form action={pdfAction} className="flex flex-col gap-[var(--spacing-3)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--spacing-3)]">
            <div>
              <label htmlFor="pdf-file" className={labelCls}>
                PDF file
              </label>
              <input
                id="pdf-file"
                name="file"
                type="file"
                accept="application/pdf,.pdf"
                required
                className="font-[family-name:var(--font-body)] text-[length:var(--text-sm)] text-[var(--color-text-muted)] w-full"
              />
            </div>
            <div>
              <label htmlFor="pdf-publisher" className={labelCls}>
                Publisher (required)
              </label>
              <input id="pdf-publisher" name="publisher" type="text" required placeholder="Lazard" className={fieldCls} />
            </div>
            <div>
              <label htmlFor="pdf-title" className={labelCls}>
                Title (optional)
              </label>
              <input id="pdf-title" name="title" type="text" placeholder="LCOE+ v17.0" className={fieldCls} />
            </div>
            <div>
              <label htmlFor="pdf-date" className={labelCls}>
                Published (optional)
              </label>
              <input id="pdf-date" name="date" type="date" className={fieldCls} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="pdf-url" className={labelCls}>
                Public source URL (required)
              </label>
              <input
                id="pdf-url"
                name="url"
                type="url"
                required
                placeholder="https://www.lazard.com/research-insights/…"
                className={`${fieldCls} font-[family-name:var(--font-mono)]`}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="pdf-tags" className={labelCls}>
                Tags (comma-separated)
              </label>
              <input id="pdf-tags" name="tags" type="text" placeholder="lcoe, costs" className={fieldCls} />
            </div>
          </div>
          <div className="flex items-center gap-[var(--spacing-4)]">
            <SubmitButton pending={pdfPending} label="Ingest report" />
            <span className="font-[family-name:var(--font-body)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
              Text-based PDFs only — scanned images won’t extract.
            </span>
          </div>
          <Status state={pdfState} />
        </form>
      )}
    </section>
  );
}
