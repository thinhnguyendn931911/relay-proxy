import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5" style={{ background: "var(--color-bg, #FDFAF6)" }}>
      <div className="text-center">
        <p className="text-7xl font-black" style={{ color: "var(--color-text-muted, #6B7280)" }}>404</p>
        <h1 className="mt-4 text-2xl font-black tracking-tight" style={{ color: "var(--color-text, #0a0a0a)" }}>
          Page Not Found
        </h1>
        <p className="mt-3 text-base leading-7" style={{ color: "var(--color-text-muted, #6B7280)" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: "var(--color-primary, #E56A4A)" }}
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
