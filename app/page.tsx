import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-void-bg p-8">
      <section className="w-full max-w-lg rounded-md border border-white/20 bg-void-panel p-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">VOIDLINE</h1>
        <p className="mt-3 text-sm text-void-muted">Dark, private, real-time messaging with audio calls.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/login" className="rounded-md border border-white/30 px-4 py-2 hover:bg-void-hover">
            Login
          </Link>
          <Link href="/register" className="rounded-md border border-white/30 bg-white text-black px-4 py-2 hover:opacity-90">
            Register
          </Link>
        </div>
      </section>
    </main>
  );
}
