"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { colorOf } from "@/lib/products";
import { useCart } from "@/components/CartProvider";
import ProductArt from "@/components/ProductArt";
import Image from "next/image";
import { photosOf } from "@/lib/photos";
import { STORE, brl } from "@/lib/config";
import { readyDate } from "@/lib/delivery";
import { IconCheck, IconChevron, IconLeaf, IconMinus, IconPlus, IconPrinter, IconShield, IconTruck, IconWhats } from "@/components/Icons";

export default function AddToCart({ product: p }: { product: Product }) {
  const [color, setColor] = useState(p.colors[0]);
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const [touched, setTouched] = useState(false);
  const [ready, setReady] = useState("");
  const [showBar, setShowBar] = useState(false);
  const mainBtn = useRef<HTMLButtonElement>(null);
  const { add } = useCart();
  const col = colorOf(color);
  const unit = p.price + (col.extra ?? 0);
  const needsNote = !!p.personalize;
  const missing = needsNote && !note.trim();
  const photos = photosOf(p.slug);
  const [shot, setShot] = useState(0);
  const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;

  useEffect(() => setReady(readyDate(STORE.productionDays)), []);
  useEffect(() => {
    const el = mainBtn.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const submit = () => {
    if (missing) {
      setTouched(true);
      document.getElementById("personalize")?.focus();
      return;
    }
    add(p.slug, color, note, qty);
  };

  return (
    <>
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-12 items-start">
        {/* GALERIA */}
        <div className="min-w-0 lg:sticky lg:top-24">
          <div
            className="relative rounded-[2rem] aspect-square overflow-hidden transition-colors duration-500"
            style={{ background: `radial-gradient(100% 80% at 70% 15%, ${col.b}30, transparent 60%), radial-gradient(80% 70% at 15% 100%, ${col.a}26, transparent 60%), #fff` }}
          >
            <div className="absolute left-4 top-4 flex gap-1.5 z-10">
              {p.badge && <span className="rounded-full bg-ink text-white text-xs font-semibold px-3 py-1.5">{p.badge}</span>}
              {off > 0 && !p.badge?.includes("%") && <span className="rounded-full bg-coral text-white text-xs font-semibold px-3 py-1.5">-{off}%</span>}
            </div>
            {photos.length ? (
              <Image src={photos[shot]} alt={p.name} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            ) : (
              <ProductArt key={color} art={p.art} color={color} id={`pdp-${p.slug}`} className="pop-in absolute inset-0 m-auto w-[86%] h-[86%]" />
            )}
            {!photos.length && <span className="absolute bottom-4 left-4 rounded-full bg-white/80 backdrop-blur text-xs font-medium px-3 py-1.5 border border-line">
              Ilustração · a peça real tem as linhas de camada da impressão
            </span>}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto no-scrollbar">
              {photos.map((src, i) => (
                <button key={src} onClick={() => setShot(i)} aria-label={`Foto ${i + 1}`} className={`relative shrink-0 w-[72px] h-[72px] rounded-2xl overflow-hidden border-2 transition ${shot === i ? "border-ink" : "border-line"}`}>
                  <Image src={src} alt="" fill sizes="72px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          {!photos.length && p.colors.length > 1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto no-scrollbar">
              {p.colors.map((id) => (
                <button
                  key={id}
                  onClick={() => setColor(id)}
                  aria-label={`Ver em ${colorOf(id).label}`}
                  className={`shrink-0 w-[72px] h-[72px] rounded-2xl bg-white border-2 p-1 transition ${color === id ? "border-ink" : "border-line hover:border-ink/30"}`}
                >
                  <ProductArt art={p.art} color={id} id={`th-${p.slug}`} shadow={false} className="w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-[2.6rem] font-bold tracking-tight leading-[1.05]">{p.name}</h1>
          <p className="text-muted text-lg mt-3 leading-relaxed">{p.short}</p>

          <div className="mt-6 rounded-2xl bg-white border border-line p-4 sm:p-5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-4xl font-bold tabular-nums">{brl(unit)}</span>
              {p.compareAt && <span className="text-muted line-through">{brl(p.compareAt + (col.extra ?? 0))}</span>}
            </div>
            <p className="mt-1.5 text-sm">
              <b className="text-mint-ink">{brl(unit * (1 - STORE.pixDiscount))} no Pix</b> <span className="text-muted">· ou no cartão</span>
            </p>
          </div>

          {p.colors.length > 1 && (
            <fieldset className="mt-7">
              <legend className="text-sm font-semibold">
                Cor <span className="font-normal text-muted">— {col.label}{col.extra ? ` (+${brl(col.extra)})` : ""}</span>
              </legend>
              <div className="flex flex-wrap gap-2 mt-3">
                {p.colors.map((id) => {
                  const c = colorOf(id);
                  const on = color === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setColor(id)}
                      aria-pressed={on}
                      className={`flex items-center gap-2 rounded-full pl-1.5 pr-3.5 h-11 border-2 text-sm font-medium transition ${on ? "border-ink bg-white" : "border-line bg-white hover:border-ink/30"}`}
                    >
                      <span className="w-7 h-7 rounded-full" style={{ background: `linear-gradient(135deg, ${c.a}, ${c.b})` }} />
                      {c.label}
                      {c.extra ? <span className="text-xs text-muted">+{c.extra}</span> : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {needsNote && (
            <label className="block mt-7">
              <span className="text-sm font-semibold">{p.personalize}</span>
              <input
                id="personalize"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => setTouched(true)}
                maxLength={140}
                aria-invalid={touched && missing}
                className={`mt-2.5 w-full rounded-2xl bg-white border-2 px-4 h-14 outline-none transition ${touched && missing ? "border-coral" : "border-line focus:border-ink"}`}
                placeholder="Escreva aqui"
              />
              {touched && missing && <span className="block text-sm text-coral mt-1.5">Preencha pra gente saber como fazer a sua peça.</span>}
            </label>
          )}

          <div className="flex gap-3 mt-7">
            <div className="flex items-center rounded-full bg-white border border-line h-14">
              <button className="grid place-items-center w-12 h-14" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Diminuir quantidade">
                <IconMinus size={16} />
              </button>
              <span className="w-7 text-center font-semibold tabular-nums" aria-live="polite">{qty}</span>
              <button className="grid place-items-center w-12 h-14" onClick={() => setQty(qty + 1)} aria-label="Aumentar quantidade">
                <IconPlus size={16} />
              </button>
            </div>
            <button
              ref={mainBtn}
              onClick={submit}
              className="flex-1 rounded-full bg-brand hover:bg-brand-dark text-white font-semibold h-14 transition active:scale-[.98]"
            >
              Adicionar à sacola · {brl(unit * qty)}
            </button>
          </div>

          <div className="mt-5 rounded-2xl bg-brand-soft/60 border border-brand/10 p-4 text-sm space-y-2.5">
            <p className="flex gap-2.5"><IconPrinter size={18} className="text-brand shrink-0" /><span>Impresso sob encomenda — <b>pronto até {ready || "…"}</b></span></p>
            <p className="flex gap-2.5"><IconTruck size={18} className="text-brand shrink-0" /><span>Envio pra todo o Brasil · <b>grátis acima de {brl(STORE.freeShippingFrom)}</b></span></p>
            <p className="flex gap-2.5"><IconShield size={18} className="text-brand shrink-0" /><span>Chegou com defeito? <b>Reimprimimos e reenviamos</b> sem custo</span></p>
          </div>

          <div className="mt-6 divide-y divide-line border-y border-line">
            <Acc title="Sobre o produto" open>
              <p className="leading-relaxed">{p.description}</p>
            </Acc>
            <Acc title="Especificações">
              <ul className="space-y-2">
                {p.specs.map((s) => (
                  <li key={s} className="flex gap-2"><IconCheck size={18} className="text-mint shrink-0" />{s}</li>
                ))}
                {p.age && <li className="flex gap-2"><IconCheck size={18} className="text-mint shrink-0" />Idade recomendada: {p.age}</li>}
                <li className="flex gap-2"><IconLeaf size={18} className="text-mint shrink-0" />PLA de origem vegetal, atóxico</li>
              </ul>
            </Acc>
            <Acc title="Pagamento e entrega">
              <p className="leading-relaxed">
                Ao finalizar, o pedido chega pra gente no WhatsApp com tudo preenchido. Respondemos com o Pix ({Math.round(STORE.pixDiscount * 100)}% off) ou o link do cartão e o valor do frete pro seu CEP. A produção começa assim que o pagamento é confirmado.
              </p>
            </Acc>
          </div>

          <a
            href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(`Oi! Tenho uma dúvida sobre o ${p.name}.`)}`}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink/80 hover:text-ink"
          >
            <IconWhats size={18} /> Dúvida? Fale com a gente no WhatsApp
          </a>
        </div>
      </div>

      {/* Barra fixa (aparece quando o botão principal sai da tela) */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur-xl border-t border-line transition-transform duration-300 ${showBar ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showBar}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="hidden sm:block w-12 h-12 rounded-xl bg-paper shrink-0">
            <ProductArt art={p.art} color={color} id="bar" shadow={false} className="w-full h-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{p.name}</p>
            <p className="text-xs text-muted">{col.label} · <b className="text-ink">{brl(unit)}</b></p>
          </div>
          <button onClick={submit} tabIndex={showBar ? 0 : -1} className="rounded-full bg-brand hover:bg-brand-dark text-white font-semibold px-6 h-12 shrink-0">
            {missing ? "Personalizar" : "Adicionar"}
          </button>
        </div>
      </div>
    </>
  );
}

function Acc({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group">
      <summary className="cursor-pointer list-none flex items-center justify-between py-4 font-semibold">
        {title}
        <IconChevron size={18} className="text-muted group-open:rotate-180 transition" />
      </summary>
      <div className="pb-5 text-sm text-ink/80">{children}</div>
    </details>
  );
}
