/**
 * <CellPlaceholder title note />
 *
 * Renders a hairline-bordered card with a title and a one-line note.
 * Stands in for an unbuilt cell so prose can ship before cells are done
 * (the week-1.5 prose-only checkpoint per the Module 3 design doc).
 *
 * Server-renderable. No client JS needed.
 */

interface CellPlaceholderProps {
  title: string;
  note: string;
}

export function CellPlaceholder({ title, note }: CellPlaceholderProps) {
  return (
    <figure
      role="img"
      aria-label={`Placeholder for ${title}`}
      style={{
        margin: "var(--spacing-8) 0",
        padding: "var(--spacing-8)",
        border: "1px dashed var(--color-rule-strong)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xs)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "var(--spacing-2)",
        }}
      >
        Cell placeholder
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-base)",
          color: "var(--color-text)",
          marginBottom: "var(--spacing-2)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-faint)",
        }}
      >
        {note}
      </div>
    </figure>
  );
}
