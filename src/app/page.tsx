import Link from "next/link";
import { PRODUCTS, CATEGORIES } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import ProductArt from "@/components/ProductArt";
import { STORE, brl } from "@/lib/config";

const FAQ = [
  ["É seguro pra criança?", "Usamos PLA, plástico de origem vegetal e atóxico. Peças pequenas (chaveiros) não são indicadas para menores de 3 anos."],
  ["Quanto tempo demora?", `Tudo é impresso sob encomenda: produção em até ${STORE.productionDays} dias úteis + prazo do frete. Kits de festa: peça com 10 a 15 dias de antecedência.`],
  ["Precisa montar?", "Não. Os articulados saem prontos da impressora, com as juntas já encaixadas (print-in-place)."],
  ["Como pago?", `Pix (com ${Math.round(STORE.pixDiscount * 100)}% de desconto) ou cartão via link de pagamento. Você finaliza o pedido e confirmamos pelo WhatsApp.`],
  ["Fazem pedido grande / revenda?", "Sim. Escolas, buffets e lojas: chame no WhatsApp pra tabela de atacado a partir de 30 unidades."],
];

export default function Home() {
  const best = PRODUCTS.filter((p) => p.bestseller);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f3e8ff] via-white to-[#ffe4e6]">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block rounded-full bg-white border border-brand/20 text-brand text-xs font-bold px-3 py-1">Feito no Brasil · Impressão 3D</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] mt-4">
              Brinquedos que <span className="text-brand">mexem</span> cada junta.
            </h1>
            <p className="text-lg text-ink/70 mt-5 max-w-md">
              Dragões, dinos, axolotes e fidgets articulados, impressos sob encomenda na cor que você escolher. Sem montagem, sem cola, direto da impressora pra sua mão.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/produto/dragao-articulado-cristal" className="rounded-full bg-brand hover:bg-brand-dark text-white font-bold px-7 py-3.5 transition">
                Quero o dragão — {brl(49.9)}
              </Link>
              <Link href="/produtos" className="rounded-full bg-white border font-bold px-7 py-3.5 hover:border-brand transition">Ver tudo</Link>
            </div>
            <div className="flex gap-6 mt-8 text-sm text-ink/70">
              <span>✅ PLA atóxico</span>
              <span>🎨 8 cores</span>
              <span>⚡ Pix −5%</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-brand/30 to-pop/30 blur-3xl" />
            <ProductArt art="dragon" color="galaxy" id="hero" className="relative w-full max-w-md mx-auto wiggle drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="mx-auto max-w-6xl px-4 mt-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATEGORIES.map((c, i) => (
            <Link key={c.id} href={`/produtos?c=${c.id}`} className="rounded-2xl bg-cream border border-black/5 p-4 hover:border-brand transition">
              <p className="text-2xl">{["🐉", "⚙️", "🔑", "🎉", "✍️"][i]}</p>
              <p className="font-display font-bold mt-2">{c.label}</p>
              <p className="text-xs text-ink/60">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* MAIS VENDIDOS */}
      <section className="mx-auto max-w-6xl px-4 mt-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-3xl font-bold">Os queridinhos</h2>
          <Link href="/produtos" className="text-sm font-bold text-brand">Ver todos →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {best.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </section>

      {/* FESTA */}
      <section className="mx-auto max-w-6xl px-4 mt-20">
        <div className="rounded-[2rem] bg-ink text-white p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-sun font-bold text-sm">LEMBRANCINHA DE FESTA</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">A lembrancinha que as crianças não jogam fora.</h2>
            <p className="text-white/70 mt-4">
              Chaveiros articulados nas cores do tema, com tag personalizada do aniversariante. A partir de {brl(12.99)} por unidade no kit de 10.
            </p>
            <Link href="/produtos?c=kits" className="inline-block mt-6 rounded-full bg-sun text-ink font-bold px-7 py-3.5">Montar kit da festa</Link>
          </div>
          <ProductArt art="party" color="arcoiris" id="festa" className="w-full max-w-sm mx-auto" />
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-6xl px-4 mt-20">
        <h2 className="font-display text-3xl font-bold text-center">Como funciona</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {[
            ["1", "Escolha bicho e cor", "8 cores de filamento, incluindo seda arco-íris e brilha no escuro."],
            ["2", "A gente imprime", `Sua peça entra na fila da impressora e fica pronta em até ${STORE.productionDays} dias úteis.`],
            ["3", "Chega na sua casa", `Enviamos pra todo o Brasil. Frete grátis acima de ${brl(STORE.freeShippingFrom)}.`],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-2xl border border-black/5 p-6 bg-cream">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-brand text-white font-bold">{n}</span>
              <p className="font-display font-bold text-lg mt-4">{t}</p>
              <p className="text-sm text-ink/70 mt-1">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 mt-20">
        <h2 className="font-display text-3xl font-bold text-center">Perguntas frequentes</h2>
        <div className="mt-8 divide-y border-y">
          {FAQ.map(([q, a]) => (
            <details key={q} className="py-4 group">
              <summary className="font-bold cursor-pointer list-none flex justify-between">
                {q}
                <span className="text-brand group-open:rotate-45 transition">+</span>
              </summary>
              <p className="text-ink/70 mt-2 text-sm">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
