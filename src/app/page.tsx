import Link from "next/link";
import { PRODUCTS, CATEGORIES } from "@/lib/products";
import type { Art } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import ProductArt from "@/components/ProductArt";
import HeroPicker from "@/components/HeroPicker";
import { STORE, brl } from "@/lib/config";
import { IconArrow, IconLeaf, IconPix, IconPrinter, IconShield, IconTruck, IconChevron, IconGift, IconSparkle } from "@/components/Icons";

const FAQ = [
  ["É seguro pra criança?", "Usamos PLA, plástico de origem vegetal, atóxico e biodegradável. Chaveiros e peças pequenas não são indicados para menores de 3 anos."],
  ["Quanto tempo demora pra chegar?", `Tudo é impresso sob encomenda: a peça fica pronta em até ${STORE.productionDays} dias úteis e depois segue pelo frete escolhido. Kits de festa: peça com 10 a 15 dias de antecedência.`],
  ["Precisa montar ou colar?", "Não. Os articulados saem da impressora já com todas as juntas encaixadas — é só tirar da caixa e brincar."],
  ["Como funciona o pagamento?", `Você monta a sacola, preenche o endereço e o pedido chega pra gente no WhatsApp. Respondemos com o Pix (${Math.round(STORE.pixDiscount * 100)}% off) ou um link de cartão. Simples e com atendimento de gente de verdade.`],
  ["Vocês fazem atacado ou pedido grande?", "Sim! Escolas, buffets e lojas: chame no WhatsApp pra tabela especial a partir de 30 unidades."],
];

const CAT_ART: Record<string, { art: Art; color: string; bg: string }> = {
  articulados: { art: "dragon", color: "galaxy", bg: "#efeaff" },
  fidget: { art: "gear", color: "oceano", bg: "#e6f4fd" },
  chaveiros: { art: "keychain", color: "rosa", bg: "#fdebf3" },
  kits: { art: "party", color: "arcoiris", bg: "#fff4d6" },
  personalizados: { art: "name", color: "lava", bg: "#ffece6" },
};

export default function Home() {
  const best = PRODUCTS.filter((p) => p.bestseller);
  return (
    <>
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-10">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-line text-xs font-semibold px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" /> Impresso sob encomenda · feito no Brasil
            </span>
            <h1 className="font-display text-[2.6rem] leading-[1] sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] mt-5">
              Brinquedos que <span className="relative inline-block text-brand">mexem<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" aria-hidden><path d="M2 8 Q50 0 100 7 T198 5" stroke="#d4f55a" strokeWidth="6" fill="none" strokeLinecap="round" /></svg></span> cada junta.
            </h1>
            <p className="text-lg text-muted mt-6 max-w-lg leading-relaxed">
              Dragões, dinos, axolotes e fidgets articulados, impressos em 3D na cor que você escolher. Sem montagem, sem cola — direto da impressora pra sua mão.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href="/produtos" className="inline-flex items-center justify-center gap-2 rounded-full bg-ink hover:bg-brand text-white font-semibold px-7 h-14 transition">
                Ver a coleção <IconArrow size={18} />
              </Link>
              <Link href="/produtos?c=kits" className="inline-flex items-center justify-center gap-2 rounded-full bg-white border border-line hover:border-ink/40 font-semibold px-7 h-14 transition">
                <IconGift size={18} /> Lembrancinhas de festa
              </Link>
            </div>
            <dl className="hidden sm:grid grid-cols-3 gap-3 mt-10 max-w-md">
              {[
                ["8", "cores de filamento"],
                [`${STORE.productionDays} dias`, "pra ficar pronto"],
                [`${Math.round(STORE.pixDiscount * 100)}%`, "off no Pix"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-2xl bg-white border border-line p-3">
                  <dt className="font-display text-2xl font-bold">{n}</dt>
                  <dd className="text-xs text-muted leading-tight mt-0.5">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <HeroPicker />
          </div>
        </div>
      </section>

      {/* GARANTIAS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-12">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            [IconTruck, "Frete grátis", `acima de ${brl(STORE.freeShippingFrom)}`],
            [IconPix, "Pix com desconto", `${Math.round(STORE.pixDiscount * 100)}% off na hora`],
            [IconLeaf, "PLA atóxico", "plástico de origem vegetal"],
            [IconShield, "Defeito? Reimprimimos", "e reenviamos sem custo"],
          ].map(([Icon, t, d], i) => {
            const I = Icon as typeof IconTruck;
            return (
              <li key={i} className="flex items-center gap-3 rounded-2xl bg-white border border-line p-4">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-soft text-brand shrink-0">
                  <I size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-sm">{t as string}</span>
                  <span className="block text-xs text-muted">{d as string}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* CATEGORIAS */}
      <section className="mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Explore por categoria</h2>
        </div>
        <div className="mx-auto max-w-7xl mt-6 flex lg:grid lg:grid-cols-5 gap-3 overflow-x-auto no-scrollbar snap-x px-4 sm:px-6">
          {CATEGORIES.map((c) => {
            const a = CAT_ART[c.id];
            return (
              <Link
                key={c.id}
                href={`/produtos?c=${c.id}`}
                className="group snap-start shrink-0 w-[46%] sm:w-[30%] lg:w-auto rounded-[var(--radius-card)] p-4 flex flex-col transition hover:-translate-y-1"
                style={{ background: a.bg }}
              >
                <div className="aspect-square">
                  <ProductArt art={a.art} color={a.color} id={`cat-${c.id}`} shadow={false} className="w-full h-full group-hover:scale-105 transition duration-500" />
                </div>
                <p className="font-display font-bold text-lg mt-2">{c.label}</p>
                <p className="text-xs text-muted">{c.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* MAIS VENDIDOS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-20">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-brand flex items-center gap-1.5"><IconSparkle size={16} /> Os mais pedidos</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-1">Queridinhos da impressora</h2>
          </div>
          <Link href="/produtos" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold hover:text-brand">
            Ver todos <IconArrow size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {best.map((p, i) => (
            <ProductCard key={p.slug} p={p} i={i} />
          ))}
        </div>
        <Link href="/produtos" className="sm:hidden mt-5 flex items-center justify-center gap-2 rounded-full border border-line bg-white h-12 font-semibold">
          Ver todos os produtos <IconArrow size={16} />
        </Link>
      </section>

      {/* FESTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink text-white">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand/40 blur-3xl" />
          <div className="absolute -left-10 bottom-0 w-60 h-60 rounded-full bg-coral/25 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-6 items-center p-7 sm:p-12">
            <div>
              <span className="inline-block rounded-full bg-lime text-ink text-xs font-bold px-3 py-1.5">Lembrancinha de festa</span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mt-4 leading-[1.05]">A lembrancinha que ninguém joga fora.</h2>
              <p className="text-white/70 mt-4 max-w-md">
                Chaveiros articulados nas cores do tema, cada um com tag do aniversariante. A partir de <b className="text-white">{brl(12.99)}</b> por unidade.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-white/80">
                <li>✦ Kits de 10 e 30 unidades — ou mais, sob consulta</li>
                <li>✦ Até 3 bichos diferentes por kit</li>
                <li>✦ Entrega combinada pra data da festa</li>
              </ul>
              <Link href="/produtos?c=kits" className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime text-ink font-bold px-7 h-14 hover:brightness-95">
                Montar o kit da festa <IconArrow size={18} />
              </Link>
            </div>
            <ProductArt art="party" color="arcoiris" id="festa" shadow={false} className="w-full max-w-md mx-auto" />
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-20">
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Como nasce o seu brinquedo</h2>
        <ol className="grid md:grid-cols-3 gap-3 sm:gap-4 mt-8">
          {[
            [IconSparkle, "Você escolhe", "Bicho, cor e, se quiser, um nome. 8 cores, incluindo seda arco-íris e brilha no escuro."],
            [IconPrinter, "A gente imprime", `Sua peça entra na fila da impressora e fica pronta em até ${STORE.productionDays} dias úteis, camada por camada.`],
            [IconTruck, "Chega aí", `Embalado com cuidado e enviado pra todo o Brasil. Frete grátis acima de ${brl(STORE.freeShippingFrom)}.`],
          ].map(([Icon, t, d], i) => {
            const I = Icon as typeof IconTruck;
            return (
              <li key={i} className="relative rounded-[var(--radius-card)] bg-white border border-line p-6">
                <span className="absolute right-5 top-4 font-display text-6xl font-extrabold text-line">{i + 1}</span>
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-ink text-lime">
                  <I size={22} />
                </span>
                <p className="font-display font-bold text-xl mt-5">{t as string}</p>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">{d as string}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-20 grid lg:grid-cols-[1fr_1.4fr] gap-8">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Perguntas frequentes</h2>
          <p className="text-muted mt-3">Não achou o que procurava? A gente responde rapidinho no WhatsApp.</p>
          <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-2 font-semibold text-brand">
            Chamar no WhatsApp <IconArrow size={16} />
          </a>
        </div>
        <div className="space-y-2.5">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-2xl bg-white border border-line px-5 open:pb-4">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 py-4 font-semibold">
                {q}
                <IconChevron size={18} className="shrink-0 text-muted group-open:rotate-180 transition" />
              </summary>
              <p className="text-muted text-sm leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
