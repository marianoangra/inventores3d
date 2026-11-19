"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart, unitPrice } from "@/components/CartProvider";
import Thumb from "@/components/Thumb";
import { getProduct, colorOf } from "@/lib/products";
import { STORE, brl } from "@/lib/config";
import { readyDate } from "@/lib/delivery";
import { IconCheck, IconPix, IconShield, IconWhats, IconArrow } from "@/components/Icons";
import { isValidCpf, maskCpf } from "@/lib/shop/cpf";
import { shippingFor, ufFromCity } from "@/lib/shop/shipping";
import { MAX_INSTALLMENTS } from "@/lib/shop/order";

type Pay = "pix" | "cartao";
const LAST_ORDER = "i3d-last-order";

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
const maskCep = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

export default function Checkout({ online }: { online: boolean }) {
  const { items, subtotal, clear } = useCart();
  const [f, setF] = useState({ nome: "", whats: "", cpf: "", email: "", cep: "", rua: "", numero: "", comp: "", bairro: "", cidade: "", obs: "" });
  const [uf, setUf] = useState("");
  const [pay, setPay] = useState<Pay>("pix");
  const [parcelas, setParcelas] = useState(1);
  const [busy, setBusy] = useState(false);
  const [payErr, setPayErr] = useState("");
  const [lastOrder, setLastOrder] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [cepState, setCepState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [tried, setTried] = useState(false);
  const [ready, setReady] = useState("");

  useEffect(() => setReady(readyDate(STORE.productionDays)), []);
  useEffect(() => {
    try {
      setLastOrder(localStorage.getItem(LAST_ORDER));
    } catch {}
  }, []);

  // Autopreenche o endereço pelo CEP (ViaCEP, gratuito)
  useEffect(() => {
    const d = f.cep.replace(/\D/g, "");
    if (d.length !== 8) {
      setCepState("idle");
      setUf("");
      return;
    }
    let alive = true;
    setCepState("loading");
    fetch(`https://viacep.com.br/ws/${d}/json/`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.erro) return setCepState("err");
        setF((cur) => ({ ...cur, rua: j.logradouro || cur.rua, bairro: j.bairro || cur.bairro, cidade: j.localidade ? `${j.localidade}/${j.uf}` : cur.cidade }));
        setUf(j.uf || "");
        setCepState("ok");
        setTimeout(() => document.getElementById("f-numero")?.focus(), 50);
      })
      .catch(() => alive && setCepState("err"));
    return () => {
      alive = false;
    };
  }, [f.cep]);

  // itens sob encomenda (prazo combinado) não pagam no site: o pedido inteiro vai pro WhatsApp
  const quoteOnly = items.filter((i) => getProduct(i.slug)?.quoteOnly);
  const payOnline = online && quoteOnly.length === 0;
  const desconto = pay === "pix" ? Math.round(subtotal * STORE.pixDiscount * 100) / 100 : 0;
  const freteGratis = subtotal >= STORE.freeShippingFrom;
  const frete = payOnline ? shippingFor(subtotal, uf || ufFromCity(f.cidade), STORE.freeShippingFrom) : null;
  const total = subtotal - desconto + (frete ?? 0);
  const errors = {
    nome: !f.nome.trim() ? "Informe seu nome" : payOnline && !f.nome.trim().includes(" ") ? "Nome e sobrenome" : "",
    whats: f.whats.replace(/\D/g, "").length < 10 ? "WhatsApp com DDD" : "",
    cpf: payOnline && !isValidCpf(f.cpf) ? "CPF inválido" : "",
    email: payOnline && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()) ? "E-mail inválido" : "",
    cep: f.cep.replace(/\D/g, "").length !== 8 ? "CEP com 8 números" : "",
    rua: !f.rua.trim() ? "Informe a rua" : "",
    numero: !f.numero.trim() ? "Nº" : "",
    cidade: !f.cidade.trim() ? "Informe a cidade" : payOnline && frete === null ? "Cidade/UF (ex.: Campinas/SP)" : "",
  };
  const ok = items.length > 0 && Object.values(errors).every((e) => !e);

  const set = (k: keyof typeof f, mask?: (v: string) => string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: mask ? mask(e.target.value) : e.target.value });

  const pagar = async () => {
    setTried(true);
    setPayErr("");
    if (!ok) {
      const first = Object.entries(errors).find(([, v]) => v)?.[0];
      if (first) document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/pedido", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ slug, color, note, qty }) => ({ slug, color, note, qty })),
          pay,
          installments: pay === "cartao" ? parcelas : 1,
          customer: { name: f.nome, cpf: f.cpf, email: f.email, phone: f.whats },
          address: { cep: f.cep, street: f.rua, number: f.numero, complement: f.comp, district: f.bairro, city: f.cidade, uf: uf || ufFromCity(f.cidade) || "" },
          notes: f.obs,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { url?: string; code?: string; erro?: string };
      if (!r.ok || !j.url || !j.code) throw new Error(j.erro || "Não deu pra gerar o pagamento. Tente de novo.");
      try {
        localStorage.setItem(LAST_ORDER, j.code);
      } catch {}
      clear();
      window.location.href = j.url; // fatura do Asaas (Pix ou cartão)
    } catch (e) {
      setPayErr(e instanceof Error ? e.message : "Erro ao gerar o pagamento.");
      setBusy(false);
    }
  };

  const finalizar = () => {
    setTried(true);
    // pelo WhatsApp não precisa de CPF/e-mail
    const zap = { ...errors, cpf: "", email: "", cidade: f.cidade.trim() ? "" : errors.cidade };
    if (!items.length || Object.values(zap).some(Boolean)) {
      const first = Object.entries(zap).find(([, v]) => v)?.[0];
      if (first) document.getElementById(`f-${first}`)?.focus();
      return;
    }
    const pedido = Date.now().toString(36).toUpperCase().slice(-6);
    const linhas = items.map((i) => {
      const p = getProduct(i.slug)!;
      return `• ${i.qty}x ${p.name} — ${colorOf(i.color).label}${i.note ? ` (${i.note})` : ""} — ${brl(unitPrice(i.slug, i.color) * i.qty)}`;
    });
    const msg = [
      `Olá! Quero fazer o pedido *#${pedido}* na ${STORE.name}:`,
      "",
      ...linhas,
      "",
      `Subtotal: ${brl(subtotal)}`,
      pay === "pix" ? `Desconto Pix (${Math.round(STORE.pixDiscount * 100)}%): −${brl(desconto)}` : "Pagamento: cartão (link)",
      `Frete: ${freteGratis ? "GRÁTIS" : frete !== null ? brl(frete) : "a calcular pelo CEP"}`,
      `*Total: ${brl(total)}${freteGratis || frete !== null ? "" : " + frete"}*`,
      "",
      `Nome: ${f.nome}`,
      `WhatsApp: ${f.whats}`,
      `Endereço: ${f.rua}, ${f.numero}${f.comp ? ` — ${f.comp}` : ""} — ${f.bairro ? `${f.bairro} — ` : ""}${f.cidade} — CEP ${f.cep}`,
      f.obs ? `Obs: ${f.obs}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(pedido);
    clear();
  };

  if (sent)
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="pop-in mx-auto grid place-items-center w-20 h-20 rounded-full bg-mint text-white">
          <IconCheck size={38} />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight mt-6">Pedido #{sent} enviado!</h1>
        <p className="text-muted mt-3 leading-relaxed">
          Abrimos o WhatsApp com o resumo. <b className="text-ink">Toque em enviar</b> por lá e respondemos com o {pay === "pix" ? "Pix" : "link de pagamento"} e o frete. Depois do pagamento, sua peça entra na fila da impressora.
        </p>
        <ol className="text-left mt-8 rounded-2xl bg-white border border-line p-5 space-y-3 text-sm">
          {["Envie a mensagem no WhatsApp", `Pague pelo ${pay === "pix" ? "Pix" : "link do cartão"}`, `Peça pronta até ${ready}`, "Código de rastreio no seu WhatsApp"].map((t, i) => (
            <li key={t} className="flex items-center gap-3">
              <span className="grid place-items-center w-7 h-7 rounded-full bg-brand-soft text-brand text-xs font-bold shrink-0">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 font-semibold text-brand">
          Voltar pra loja <IconArrow size={16} />
        </Link>
      </div>
    );

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Sua sacola está vazia</h1>
        {lastOrder && (
          <Link href={`/pedido/${lastOrder}`} className="mt-4 block font-semibold text-brand">
            Acompanhar meu pedido {lastOrder}
          </Link>
        )}
        <Link href="/produtos" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink text-white font-semibold px-6 h-12">
          Ver produtos <IconArrow size={16} />
        </Link>
      </div>
    );

  const err = (k: keyof typeof errors) => (tried && errors[k] ? errors[k] : "");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12 pb-10 grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Finalizar pedido</h1>
        <p className="text-muted mt-1">{payOnline ? "3 passos rápidos. Pague no Pix ou no cartão e sua peça entra na fila da impressora." : "3 passos rápidos. O pagamento é confirmado com você no WhatsApp."}</p>
        {online && quoteOnly.length > 0 && (
          <p className="mt-4 rounded-2xl bg-brand-soft px-4 py-3 text-sm">
            <b>{quoteOnly.map((i) => getProduct(i.slug)!.name).join(", ")}</b> é feito sob encomenda, com prazo combinado. Por isso este pedido é finalizado pelo WhatsApp.
          </p>
        )}

        <Section n={1} title="Seus dados">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field id="nome" label="Nome completo" v={f.nome} on={set("nome")} err={err("nome")} autoComplete="name" />
            <Field id="whats" label="WhatsApp" v={f.whats} on={set("whats", maskPhone)} err={err("whats")} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(11) 99999-9999" />
            {payOnline && (
              <>
                <Field id="cpf" label="CPF" v={f.cpf} on={set("cpf", maskCpf)} err={err("cpf")} inputMode="numeric" placeholder="000.000.000-00" hint="Exigido pra emitir a cobrança" />
                <Field id="email" label="E-mail" v={f.email} on={set("email")} err={err("email")} type="email" autoComplete="email" placeholder="voce@email.com" hint="Pra receber o comprovante" />
              </>
            )}
          </div>
        </Section>

        <Section n={2} title="Entrega">
          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-6 sm:col-span-2">
              <Field
                id="cep"
                label="CEP"
                v={f.cep}
                on={set("cep", maskCep)}
                err={err("cep") || (cepState === "err" ? "CEP não encontrado" : "")}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                hint={cepState === "loading" ? "Buscando…" : cepState === "ok" ? "✓ Endereço encontrado" : ""}
              />
            </div>
            <div className="col-span-6 sm:col-span-4">
              <Field id="rua" label="Rua" v={f.rua} on={set("rua")} err={err("rua")} autoComplete="address-line1" />
            </div>
            <div className="col-span-2">
              <Field id="numero" label="Número" v={f.numero} on={set("numero")} err={err("numero")} inputMode="numeric" />
            </div>
            <div className="col-span-4">
              <Field id="comp" label="Complemento (opcional)" v={f.comp} on={set("comp")} autoComplete="address-line2" />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <Field id="bairro" label="Bairro" v={f.bairro} on={set("bairro")} />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <Field id="cidade" label="Cidade/UF" v={f.cidade} on={set("cidade")} err={err("cidade")} autoComplete="address-level2" />
            </div>
            <label className="col-span-6 block">
              <span className="text-sm font-medium">Observações (opcional)</span>
              <textarea value={f.obs} onChange={set("obs")} rows={2} placeholder="Ex.: é presente, embrulhar" className="mt-1.5 w-full rounded-2xl bg-white border-2 border-line focus:border-ink outline-none px-4 py-3" />
            </label>
          </div>
        </Section>

        <Section n={3} title="Pagamento">
          <div className="grid sm:grid-cols-2 gap-3">
            {([
              ["pix", "Pix", `${Math.round(STORE.pixDiscount * 100)}% de desconto · aprovação na hora`, IconPix],
              ["cartao", "Cartão de crédito", payOnline ? `Em até ${MAX_INSTALLMENTS}x sem juros` : "Link de pagamento seguro, parcelável", IconShield],
            ] as const).map(([id, t, d, I]) => (
              <button
                key={id}
                onClick={() => setPay(id)}
                aria-pressed={pay === id}
                className={`relative text-left rounded-2xl border-2 p-4 transition ${pay === id ? "border-ink bg-white" : "border-line bg-white hover:border-ink/30"}`}
              >
                <span className={`absolute right-4 top-4 grid place-items-center w-5 h-5 rounded-full border-2 ${pay === id ? "border-ink bg-ink text-white" : "border-line"}`}>
                  {pay === id && <IconCheck size={12} />}
                </span>
                <I size={22} className="text-brand" />
                <p className="font-semibold mt-2">{t}</p>
                <p className="text-sm text-muted">{d}</p>
              </button>
            ))}
          </div>
          {payOnline && pay === "cartao" && (
            <label className="mt-3 block max-w-xs">
              <span className="text-sm font-medium">Parcelas</span>
              <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="mt-1.5 w-full rounded-2xl bg-white border-2 border-line focus:border-ink outline-none px-4 min-h-[52px]">
                {Array.from({ length: MAX_INSTALLMENTS }, (_, k) => k + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}x de {brl(total / n)} sem juros
                  </option>
                ))}
              </select>
            </label>
          )}
        </Section>
      </div>

      <aside className="rounded-[var(--radius-card)] bg-white border border-line p-5 sm:p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-bold">Resumo</h2>
        <ul className="mt-4 space-y-3 max-h-72 overflow-y-auto">
          {items.map((i) => {
            const p = getProduct(i.slug)!;
            return (
              <li key={i.key} className="flex items-center gap-3 text-sm">
                <div className="relative w-14 h-14 rounded-xl bg-paper shrink-0">
                  <Thumb p={p} color={i.color} id={`co-${i.key}`} />
                  <span className="absolute -right-1.5 -top-1.5 grid place-items-center min-w-5 h-5 px-1 rounded-full bg-ink text-white text-[11px] font-bold">{i.qty}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium leading-tight">{p.name}</p>
                  <p className="text-xs text-muted truncate">{colorOf(i.color).label}{i.note ? ` · ${i.note}` : ""}</p>
                </div>
                <span className="font-semibold tabular-nums">{brl(unitPrice(i.slug, i.color) * i.qty)}</span>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-line mt-5 pt-4 space-y-2 text-sm">
          <Row k="Subtotal" v={brl(subtotal)} />
          {desconto > 0 && <Row k="Desconto Pix" v={`−${brl(desconto)}`} green />}
          <Row k="Frete" v={freteGratis ? "Grátis" : frete !== null ? brl(frete) : payOnline ? "Informe o CEP" : "Calculado no WhatsApp"} green={freteGratis} />
          <Row k="Fica pronto até" v={ready} />
        </div>
        <div className="flex justify-between items-baseline border-t border-line mt-4 pt-4">
          <span className="font-semibold">Total</span>
          <span className="font-display text-3xl font-bold tabular-nums">{brl(total)}</span>
        </div>
        {!freteGratis && frete === null && <p className="text-xs text-muted text-right">+ frete</p>}
        {payOnline ? (
          <>
            <button onClick={pagar} disabled={busy} className="mt-5 w-full flex items-center justify-center gap-2 rounded-full bg-ink hover:bg-ink/90 text-white font-semibold h-14 transition active:scale-[.98] disabled:opacity-60">
              {pay === "pix" ? <IconPix size={20} /> : <IconShield size={20} />}
              {busy ? "Gerando pagamento…" : `Pagar ${brl(total)} no ${pay === "pix" ? "Pix" : "cartão"}`}
            </button>
            {payErr && <p role="alert" className="text-sm text-coral text-center mt-2">{payErr}</p>}
            {tried && !ok && !payErr && <p className="text-sm text-coral text-center mt-2">Confira os campos marcados.</p>}
            <p className="text-xs text-muted mt-3 text-center leading-relaxed">
              Pagamento seguro pelo Asaas. Seus dados servem só pra cobrança e entrega (<Link href="/sobre#privacidade" className="underline">privacidade</Link>).
            </p>
            <button onClick={finalizar} className="mt-3 w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#128C7E]">
              <IconWhats size={16} /> Prefiro combinar pelo WhatsApp
            </button>
          </>
        ) : (
          <>
            <button onClick={finalizar} className="mt-5 w-full flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:brightness-95 text-white font-semibold h-14 transition active:scale-[.98]">
              <IconWhats size={20} /> Enviar pedido pelo WhatsApp
            </button>
            {tried && !ok && <p className="text-sm text-coral text-center mt-2">Confira os campos marcados.</p>}
            <p className="text-xs text-muted mt-3 text-center leading-relaxed">Você não paga nada agora. Confirmamos frete e pagamento com você no WhatsApp.</p>
          </>
        )}
      </aside>
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-3 font-display text-xl font-bold mb-4">
        <span className="grid place-items-center w-8 h-8 rounded-full bg-ink text-lime text-sm">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  id,
  label,
  v,
  on,
  err,
  hint,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  v: string;
  on: (e: React.ChangeEvent<HTMLInputElement>) => void;
  err?: string;
  hint?: string;
  type?: string;
  inputMode?: "numeric" | "tel";
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        id={`f-${id}`}
        value={v}
        onChange={on}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={!!err}
        className={`mt-1.5 w-full rounded-2xl bg-white border-2 px-4 h-13 min-h-[52px] outline-none transition ${err ? "border-coral" : "border-line focus:border-ink"}`}
      />
      {err ? <span className="block text-xs text-coral mt-1">{err}</span> : hint ? <span className="block text-xs text-mint-ink mt-1">{hint}</span> : null}
    </label>
  );
}

function Row({ k, v, green }: { k: string; v: string; green?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{k}</span>
      <span className={green ? "text-mint-ink font-semibold" : "font-medium"}>{v}</span>
    </div>
  );
}
