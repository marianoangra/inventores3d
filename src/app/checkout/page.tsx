"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart, unitPrice } from "@/components/CartProvider";
import { getProduct, colorOf } from "@/lib/products";
import { STORE, brl } from "@/lib/config";

type Pay = "pix" | "cartao";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const [f, setF] = useState({ nome: "", whats: "", cep: "", endereco: "", cidade: "", obs: "" });
  const [pay, setPay] = useState<Pay>("pix");
  const [sent, setSent] = useState(false);

  const desconto = pay === "pix" ? subtotal * STORE.pixDiscount : 0;
  const freteGratis = subtotal >= STORE.freeShippingFrom;
  const total = subtotal - desconto;
  const ok = items.length > 0 && f.nome.trim() && f.whats.replace(/\D/g, "").length >= 10 && f.cep.replace(/\D/g, "").length === 8 && f.endereco.trim() && f.cidade.trim();

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const finalizar = () => {
    const pedido = Date.now().toString(36).toUpperCase().slice(-6);
    const linhas = items.map((i) => {
      const p = getProduct(i.slug)!;
      return `• ${i.qty}x ${p.name} — ${colorOf(i.color).label}${i.note ? ` (${i.note})` : ""} — ${brl(unitPrice(i.slug, i.color) * i.qty)}`;
    });
    const msg = [
      `Olá! Quero fazer o pedido #${pedido} na ${STORE.name}:`,
      "",
      ...linhas,
      "",
      `Subtotal: ${brl(subtotal)}`,
      pay === "pix" ? `Desconto Pix (${Math.round(STORE.pixDiscount * 100)}%): −${brl(desconto)}` : "Pagamento: cartão (link)",
      `Frete: ${freteGratis ? "GRÁTIS" : "a calcular pelo CEP"}`,
      `*Total: ${brl(total)}${freteGratis ? "" : " + frete"}*`,
      "",
      `Nome: ${f.nome}`,
      `WhatsApp: ${f.whats}`,
      `Endereço: ${f.endereco} — ${f.cidade} — CEP ${f.cep}`,
      f.obs ? `Obs: ${f.obs}` : "",
    ]
      .filter((l) => l !== null)
      .join("\n");
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
    clear();
  };

  if (sent)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-6xl">🎉</p>
        <h1 className="font-display text-3xl font-bold mt-4">Pedido enviado!</h1>
        <p className="text-ink/70 mt-3">
          Abrimos o WhatsApp com o resumo do seu pedido. Assim que você enviar a mensagem, respondemos com o {pay === "pix" ? "Pix" : "link de pagamento"} e o valor do frete, e sua peça entra na fila da impressora.
        </p>
        <Link href="/" className="inline-block mt-8 font-bold text-brand">Voltar pra loja</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid lg:grid-cols-[1fr_380px] gap-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Finalizar pedido</h1>
        {items.length === 0 ? (
          <p className="mt-6 text-ink/60">Seu carrinho está vazio. <Link href="/produtos" className="text-brand font-bold">Ver produtos</Link></p>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <Field label="Nome completo" v={f.nome} on={set("nome")} />
            <Field label="WhatsApp (com DDD)" v={f.whats} on={set("whats")} type="tel" />
            <Field label="CEP" v={f.cep} on={set("cep")} inputMode="numeric" />
            <Field label="Cidade / UF" v={f.cidade} on={set("cidade")} />
            <div className="sm:col-span-2"><Field label="Endereço (rua, número, complemento, bairro)" v={f.endereco} on={set("endereco")} /></div>
            <label className="sm:col-span-2 block">
              <span className="text-sm font-bold">Observações (opcional)</span>
              <textarea value={f.obs} onChange={set("obs")} rows={3} className="mt-1 w-full rounded-xl border px-4 py-3" />
            </label>
            <div className="sm:col-span-2">
              <p className="text-sm font-bold">Pagamento</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                {([
                  ["pix", "Pix", `${Math.round(STORE.pixDiscount * 100)}% de desconto`],
                  ["cartao", "Cartão de crédito", "Link de pagamento seguro, parcelável"],
                ] as const).map(([id, t, d]) => (
                  <button key={id} onClick={() => setPay(id)} className={`text-left rounded-2xl border-2 p-4 ${pay === id ? "border-brand bg-brand/5" : "border-black/10"}`}>
                    <p className="font-bold">{t}</p>
                    <p className="text-sm text-ink/60">{d}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <aside className="rounded-3xl bg-cream border border-black/5 p-6 h-fit lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-bold">Resumo</h2>
        <div className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <div key={i.key} className="flex justify-between gap-3">
              <span>{i.qty}x {getProduct(i.slug)!.name} <span className="text-ink/50">({colorOf(i.color).label})</span></span>
              <span className="font-semibold whitespace-nowrap">{brl(unitPrice(i.slug, i.color) * i.qty)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 space-y-1 text-sm">
          <Row k="Subtotal" v={brl(subtotal)} />
          {desconto > 0 && <Row k="Desconto Pix" v={`−${brl(desconto)}`} green />}
          <Row k="Frete" v={freteGratis ? "Grátis" : "Calculado pelo CEP"} green={freteGratis} />
        </div>
        <div className="flex justify-between font-extrabold text-xl mt-4">
          <span>Total</span>
          <span>{brl(total)}</span>
        </div>
        <button
          disabled={!ok}
          onClick={finalizar}
          className="mt-6 w-full rounded-full bg-[#25D366] hover:brightness-95 disabled:opacity-40 text-white font-bold py-4 transition"
        >
          Enviar pedido pelo WhatsApp
        </button>
        <p className="text-xs text-ink/50 mt-3 text-center">Confirmamos o frete e mandamos o {pay === "pix" ? "Pix" : "link de pagamento"} na hora.</p>
      </aside>
    </div>
  );
}

function Field({ label, v, on, type = "text", inputMode }: { label: string; v: string; on: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; inputMode?: "numeric" }) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <input value={v} onChange={on} type={type} inputMode={inputMode} className="mt-1 w-full rounded-xl border px-4 py-3" />
    </label>
  );
}

function Row({ k, v, green }: { k: string; v: string; green?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink/70">{k}</span>
      <span className={green ? "text-green-700 font-semibold" : ""}>{v}</span>
    </div>
  );
}
