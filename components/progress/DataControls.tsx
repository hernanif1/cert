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
import { useDict } from "@/lib/i18n/client";

export function DataControls() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const t = useDict().tools.data;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setError(null);
    try {
      setPreview(parseImport(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.readError);
    }
  }

  return (
    <section className="mt-12 border-t border-border pt-6">
      <h2 className="font-display text-lg">{t.title}</h2>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-fg-muted">
        {t.intro}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={exportProgress}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent"
        >
          {t.export}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent"
        >
          {t.import}
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
          className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
        >
          {t.reset}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-4 max-w-xl rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-medium">{t.importQuestion}</p>
          <dl className="tnum mt-3 grid grid-cols-3 gap-2 text-xs">
            <dt className="col-span-1 text-fg-muted">{t.lessonsComplete}</dt>
            <dd className="col-span-1">{t.file(preview.lessonsInFile)}</dd>
            <dd className="col-span-1 text-fg-muted">{t.now(preview.lessonsNow)}</dd>
            <dt className="col-span-1 text-fg-muted">{t.checklistTicks}</dt>
            <dd className="col-span-1">{t.file(preview.checksInFile)}</dd>
            <dd className="col-span-1 text-fg-muted">{t.now(preview.checksNow)}</dd>
            <dt className="col-span-1 text-fg-muted">{t.drillCards}</dt>
            <dd className="col-span-1">{t.file(preview.cardsInFile)}</dd>
            <dd className="col-span-1 text-fg-muted">{t.now(preview.cardsNow)}</dd>
            <dt className="col-span-1 text-fg-muted">{t.mockAttempts}</dt>
            <dd className="col-span-1">{t.file(preview.attemptsInFile)}</dd>
            <dd className="col-span-1 text-fg-muted">{t.now(preview.attemptsNow)}</dd>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                applyImportMerge(preview.state);
                setPreview(null);
              }}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg hover:bg-accent-hover"
            >
              {t.merge}
            </button>
            <button
              type="button"
              onClick={() => {
                applyImportReplace(preview.state);
                setPreview(null);
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-accent"
            >
              {t.replace}
            </button>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="rounded-lg px-3 py-1.5 text-xs text-fg-muted hover:text-fg"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {confirmReset && (
        <div className="mt-4 max-w-xl rounded-2xl border border-danger/40 bg-danger-soft p-4">
          <p className="text-sm font-medium">
            {t.deleteQuestion}
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            {t.deleteBody}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportProgress}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:border-accent"
            >
              {t.backupFirst}
            </button>
            <button
              type="button"
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
              }}
              className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white"
            >
              {t.deleteAll}
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="rounded-lg px-3 py-1.5 text-xs text-fg-muted hover:text-fg"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
