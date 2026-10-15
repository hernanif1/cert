"use client";

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { useDisclosure } from "@/components/ui/useDisclosure";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export interface MenuItem {
  key: string;
  label: string;
  /** Short right-aligned hint, e.g. a locale code. */
  hint?: string;
  icon?: IconName;
  selected?: boolean;
  /** BCP 47 tag when the label is written in another language. */
  lang?: string;
  onSelect: () => void;
}

/**
 * A single-choice dropdown (theme, language). ARIA menu pattern: the trigger
 * owns `aria-expanded`, items are `menuitemradio`, arrows/Home/End move focus,
 * Tab and Escape dismiss. Opening lands focus on the current choice.
 */
export function Menu({
  label,
  trigger,
  items,
  align = "right",
}: {
  /** Accessible name of the trigger, e.g. "Theme: Dark". */
  label: string;
  trigger: ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
}) {
  const { open, setOpen, close, rootRef, triggerRef } = useDisclosure();
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const els = listRef.current?.querySelectorAll<HTMLElement>("[role^=menuitem]");
    if (!els?.length) return;
    const current = Array.from(els).find((el) => el.getAttribute("aria-checked") === "true");
    (current ?? els[0]).focus();
  }, [open]);

  function onKeyDown(e: KeyboardEvent) {
    const els = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>("[role^=menuitem]") ?? [],
    );
    const i = els.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => {
      e.preventDefault();
      els[(n + els.length) % els.length]?.focus();
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(els.length - 1);
    else if (e.key === "Tab") close();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={label}
        title={label}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition-colors",
          open
            ? "border-accent/60 bg-accent-soft text-fg"
            : "border-border text-fg-muted hover:border-accent/60 hover:text-fg",
        )}
      >
        {trigger}
        <Icon name="chevron-down" size={13} className="opacity-60" />
      </button>

      {open && (
        <div
          ref={listRef}
          id={id}
          role="menu"
          aria-label={label}
          onKeyDown={onKeyDown}
          className={cn(
            "anim-pop absolute top-[calc(100%+0.4rem)] z-50 min-w-[12rem] rounded-xl border border-border bg-surface p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitemradio"
              aria-checked={item.selected === true}
              lang={item.lang}
              tabIndex={-1}
              onClick={() => {
                item.onSelect();
                close(true);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[0.8125rem] transition-colors",
                "hover:bg-surface-2 focus-visible:bg-surface-2",
                item.selected ? "font-medium text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              {item.icon && <Icon name={item.icon} size={15} />}
              <span className="flex-1 whitespace-nowrap">{item.label}</span>
              {item.hint && (
                <span className="text-[10px] font-semibold tracking-wider text-fg-muted/70">
                  {item.hint}
                </span>
              )}
              <Icon
                name="check"
                size={14}
                className={cn("text-accent", !item.selected && "invisible")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
