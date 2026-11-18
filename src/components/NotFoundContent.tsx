import Link from "next/link";

export default function NotFoundContent() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold">Essa página não existe (ou ainda está na impressora).</h1>
      <Link href="/produtos" className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-white hover:bg-brand">
        Ver os produtos
      </Link>
    </section>
  );
}
