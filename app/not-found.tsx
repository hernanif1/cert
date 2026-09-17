import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-start px-4 py-24 sm:px-6">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-2 font-display text-4xl">Page not found</h1>
      <p className="mt-3 text-fg-muted">
        That page is not part of the curriculum.
      </p>
      <Link
        href="/learn"
        className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
      >
        Back to the curriculum
      </Link>
    </main>
  );
}
