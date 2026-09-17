"use client";

import { useRef, useState } from "react";
import {
  applyImportMerge,
  applyImportReplace,
  exportProgress,
  parseImport,
  resetProgress,
  type ImportPreview,
} from "@/lib/storage/transfer";

export function DataControls() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setError(null);
    try {
      setPreview(parseImport(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that file.");
    }
  }

  return (
    <section className="mt-12 border-t border-border pt-6">
      <h2 className="font-display text-lg">Your data</h2>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-fg-muted">
        Progress is stored only in this browser, on this device. Export it to
        move to another machine or keep a backup.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={exportProgress}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent"
        >
          Export progress
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent"
        >
          Import progress
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="rounded-md border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
        >
          Reset progress
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-4 max-w-xl rounded-card border border-border bg-surface p-4">
          <p className="text-sm font-medium">Import this file?</p>
          <dl className="tnum mt-3 grid grid-cols-3 gap-2 text-xs">
            <dt className="col-span-1 text-fg-muted">Lessons complete</dt>
            <dd className="col-span-1">file: {preview.lessonsInFile}</dd>
            <dd className="col-span-1 text-fg-muted">now: {preview.lessonsNow}</dd>
            <dt className="col-span-1 text-fg-muted">Drill cards</dt>
            <dd className="col-span-1">file: {preview.cardsInFile}</dd>
            <dd className="col-span-1 text-fg-muted">now: {preview.cardsNow}</dd>
            <dt className="col-span-1 text-fg-muted">Mock attempts</dt>
            <dd className="col-span-1">file: {preview.attemptsInFile}</dd>
            <dd className="col-span-1 text-fg-muted">now: {preview.attemptsNow}</dd>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                applyImportMerge(preview.state);
                setPreview(null);
              }}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg hover:bg-accent-hover"
            >
              Merge
            </button>
            <button
              type="button"
              onClick={() => {
                applyImportReplace(preview.state);
                setPreview(null);
              }}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:border-accent"
            >
              Replace everything
            </button>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="rounded-md px-3 py-1.5 text-xs text-fg-muted hover:text-fg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {confirmReset && (
        <div className="mt-4 max-w-xl rounded-card border border-danger/40 bg-danger-soft p-4">
          <p className="text-sm font-medium">
            Delete all progress on this device?
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            Lesson completions, drill history and mock attempts. This cannot be
            undone — take a backup first.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportProgress}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:border-accent"
            >
              Export a backup first
            </button>
            <button
              type="button"
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
              }}
              className="rounded-md bg-danger px-3 py-1.5 text-xs font-medium text-white"
            >
              Delete all progress
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="rounded-md px-3 py-1.5 text-xs text-fg-muted hover:text-fg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
