import Link from "next/link";
import { EXAM } from "@/content/exam-facts";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/learn"
          className="font-display text-base tracking-tight text-fg"
        >
          Claude Certified
        </Link>
        <span className="rounded border border-border px-1.5 py-0.5 text-[11px] font-medium tracking-wide text-fg-muted">
          {EXAM.code}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/mock-exam"
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-colors hover:bg-accent-hover"
          >
            Take Mock Exam
          </Link>
        </div>
      </div>
    </header>
  );
}
