import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col justify-center gap-4 px-6 py-16">
      <p className="text-text-muted text-sm font-medium">AI Visibility Dashboard</p>
      <h1 className="text-3xl font-semibold">Design tokens</h1>
      <p className="text-text-muted max-w-prose">
        Preview the colors, type, spacing, radii, and shadows used by the dashboard.
      </p>
      <Link
        className="bg-accent text-accent-contrast w-fit rounded-md px-4 py-2 font-medium"
        href="/tokens"
      >
        Open the token preview
      </Link>
    </main>
  );
}
