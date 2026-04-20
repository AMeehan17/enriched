"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type ReactNode,
} from "react";

/**
 * Popover — the shared a11y popover shell for Enriched.
 *
 * Extracted from Module 1's CiteButton so Module 2's TagPopover can reuse
 * the same accessibility + interaction logic (per eng review decision to
 * DRY the a11y implementation across modules).
 *
 * What this component owns:
 *   - Controlled trigger + panel state
 *   - Esc-to-close (document-level keydown listener)
 *   - Click-outside-to-close (document-level mousedown listener with
 *     one-tick delay to avoid opening-click immediately closing)
 *   - Focus return to trigger on close
 *   - aria-expanded / aria-haspopup / aria-controls on trigger
 *   - role="dialog" / aria-labelledby / aria-modal="false" on panel
 *   - Mobile bottom-sheet layout at <640px (CSS media query handled by caller's styles)
 *
 * What the caller owns:
 *   - Trigger element's visual styling (the consuming component decides
 *     what the button looks like — a `{}` affordance for CiteButton,
 *     a chip for TagPopover, etc.)
 *   - Panel content (anything valid as ReactNode)
 *   - Panel positioning (the caller decides anchoring via the
 *     panelClassName prop)
 *
 * No <dialog>, no backdrop blur, no scale-in animation. Opacity fade only
 * per DESIGN.md's anti-slop rule.
 */

/**
 * Props passed to the children render prop.
 * titleId: use this as the id on your semantic title element so
 *   aria-labelledby wires up correctly.
 * close: call to close the popover (for close buttons inside the panel).
 */
export interface PopoverRenderProps {
  titleId: string;
  close: () => void;
}

interface PopoverProps {
  /**
   * The trigger element content (e.g., "{}" text, a chip label). The
   * Popover wraps this in a <button> with all aria attributes.
   */
  trigger: ReactNode;
  /**
   * Panel content as a render prop. Receives { titleId, close }.
   * Render a semantic title element with id={titleId} so the panel's
   * aria-labelledby contract is satisfied.
   */
  children: (props: PopoverRenderProps) => ReactNode;
  /**
   * ARIA label for the trigger button (e.g., "Cite nuclear capacity factor").
   * Required for screen reader context.
   */
  triggerAriaLabel: string;
  /**
   * Optional title hover attribute for the trigger button.
   */
  triggerTitle?: string;
  /**
   * Classes applied to the trigger button element. Caller controls full
   * visual presentation.
   */
  triggerClassName?: string;
  /**
   * Classes applied to the panel element. Caller controls positioning
   * (anchor + offset), width, padding. The shell handles only state.
   */
  panelClassName?: string;
  /**
   * Classes applied to the wrapper div that contains the trigger. Defaults
   * to `relative inline-block` since most callers want relative-positioned
   * panel anchors, but callers can override.
   */
  wrapperClassName?: string;
  /**
   * Optional callback fired when the popover opens. Useful for analytics
   * or deferring heavy panel content until first open.
   */
  onOpen?: () => void;
}

export function Popover({
  trigger,
  children,
  triggerAriaLabel,
  triggerTitle,
  triggerClassName,
  panelClassName,
  wrapperClassName = "relative inline-block",
  onOpen,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const titleId = `${panelId}-title`;

  const close = useCallback(() => {
    setIsOpen(false);
    // Return focus to trigger for keyboard users
    buttonRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) onOpen?.();
      return next;
    });
  }, [onOpen]);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  // Click-outside to close. Delayed by one tick so the opening click doesn't
  // fire the mousedown listener and immediately close the popover.
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        close();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, close]);

  return (
    <div className={wrapperClassName}>
      <button
        ref={buttonRef}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={isOpen ? panelId : undefined}
        aria-label={triggerAriaLabel}
        title={triggerTitle}
        className={triggerClassName}
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className={panelClassName}
          style={{ opacity: 1 }}
        >
          {children({ titleId, close })}
        </div>
      )}
    </div>
  );
}

/**
 * Usage example:
 *
 *   <Popover
 *     trigger={<span>{'{}'}</span>}
 *     triggerAriaLabel="Cite nuclear capacity factor"
 *     triggerClassName="w-6 h-6 ..."
 *     panelClassName="absolute top-full right-0 w-96 ..."
 *   >
 *     {({ titleId, close }) => (
 *       <>
 *         <div className="flex items-start justify-between">
 *           <p id={titleId} className="...">Cite this value</p>
 *           <button onClick={close} aria-label="Close">×</button>
 *         </div>
 *         <pre>{bibtex}</pre>
 *       </>
 *     )}
 *   </Popover>
 */
