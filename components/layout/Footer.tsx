import { EXAM } from "@/content/exam-facts";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-2">
      <div className="mx-auto max-w-7xl px-4 py-8 text-xs leading-relaxed text-fg-muted sm:px-6">
        <p className="font-display text-sm text-fg">
          {EXAM.credential}
        </p>
        <p className="mt-3 max-w-3xl">
          Unofficial study material. Not affiliated with, licensed by, or
          endorsed by Anthropic or Pearson VUE. Lessons are written from the
          published exam guide objectives and public documentation; no practice
          question is drawn from the live item bank, and practice scores are
          estimates that are not comparable to a real scaled score.
        </p>
        <p className="mt-3">
          Built from the {EXAM.code} Exam Guide v{EXAM.guideVersion} (
          {EXAM.effective}).
        </p>
      </div>
    </footer>
  );
}
