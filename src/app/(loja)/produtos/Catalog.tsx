"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PRODUCTS, CATEGORIES, COLORS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { IconSearch, IconX } from "@/components/Icons";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const SORTS = [
  { id: "rel", label: "Mais vendidos" },
  { id: "asc", label: "Menor preço" },
  { id: "desc", label: "Maior preço" },
];

export default function Catalog() {
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const c = sp.get("c") ?? "";
  const q = sp.get("q") ?? "";
  const sort = sp.get("o") ?? "rel";
  const cat = CATEGORIES.find((x) => x.id === c);
  const [term, setTerm] = useState(q);
  const pushed = useRef(q);

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp.toString());
    if (v) n.set(k, v);
    else n.delete(k);
    router.replace(`${path}${n.toString() ? `?${n}` : ""}`, { scroll: false });
  };

  useEffect(() => {
    // só sincroniza quando a busca veio de fora (ex.: busca do header)
    if (q !== pushed.current) {
      pushed.current = q;
      setTerm(q);
    }
  }, [q]);
  useEffect(() => {
    if (term === q) return;
    const t = setTimeout(() => {
      pushed.current = term;
      set("q", term);
    }, 220);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const list = useMemo(() => {
    let l = PRODUCTS.filter((p) => !cat || p.category === cat.id);
    if (q.trim()) {
      const t = norm(q.trim());
      l = l.filter((p) =>
        norm(`${p.name} ${p.short} ${p.category} ${p.colors.map((x) => COLORS[x]?.label).join(" ")}`).includes(t),
      );
    }
    if (sort === "asc") l = [...l].sort((a, b) => a.price - b.price);
    else if (sort === "desc") l = [...l].sort((a, b) => b.price - a.price);
    else l = [...l].sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller));
    return l;
  }, [cat, q, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-12">
      <p className="text-sm text-muted">Loja / {cat ? cat.label : "Todos"}</p>
      <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mt-1">{cat ? cat.label : "Toda a coleção"}</h1>
      <p className="text-muted mt-2">{cat ? cat.desc : "Tudo impresso sob encomenda, na cor que você escolher."}</p>

      <div className="md:sticky md:top-[110px] lg:top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mt-6 bg-paper/90 backdrop-blur-xl border-b border-line">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3">
          <label className="flex flex-1 md:flex-none min-w-0 items-center gap-2 rounded-full bg-white border border-line h-11 px-4 md:w-72 focus-within:border-ink/40">
            <IconSearch size={18} className="text-muted" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar na loja"
              className="flex-1 bg-transparent outline-none text-sm"
              aria-label="Buscar na loja"
            />
            {term && (
              <button onClick={() => setTerm("")} aria-label="Limpar busca" className="text-muted">
                <IconX size={16} />
              </button>
            )}
          </label>
          <div className="order-last md:order-none basis-full md:basis-auto flex gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0">
            <button onClick={() => set("c", "")} className={`whitespace-nowrap rounded-full px-4 h-11 text-sm font-medium border transition ${!cat ? "bg-ink text-white border-ink" : "bg-white border-line hover:border-ink/30"}`}>
              Todos
            </button>
            {CATEGORIES.map((x) => (
              <button
                key={x.id}
                onClick={() => set("c", x.id)}
                className={`whitespace-nowrap rounded-full px-4 h-11 text-sm font-medium border transition ${cat?.id === x.id ? "bg-ink text-white border-ink" : "bg-white border-line hover:border-ink/30"}`}
              >
                {x.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => set("o", e.target.value === "rel" ? "" : e.target.value)}
            className="shrink-0 w-[132px] md:w-auto rounded-full bg-white border border-line h-11 px-3 md:px-4 text-sm font-medium md:ml-auto"
            aria-label="Ordenar"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-muted mt-5">
        {list.length} {list.length === 1 ? "produto" : "produtos"}
        {q && <> para “{q}”</>}
      </p>

      {list.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl font-bold">Nada por aqui</p>
          <p className="text-muted mt-2">Tente outra palavra ou veja todas as categorias.</p>
          <button onClick={() => router.replace("/produtos")} className="mt-6 rounded-full bg-ink text-white font-semibold px-6 h-12">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-4">
          {list.map((p, i) => (
            <ProductCard key={p.slug} p={p} i={i} />
          ))}
        </div>
      )}
    </div>
  );
}
