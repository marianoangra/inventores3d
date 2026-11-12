"use client";

import Link from "next/link";
import { useState } from "react";
import ProductArt from "./ProductArt";
import { colorOf } from "@/lib/products";
import { brl } from "@/lib/config";
import { IconArrow } from "./Icons";

const OPTS = ["galaxy", "lava", "oceano", "arcoiris", "neon", "ouro"];

export default function HeroPicker() {
  const [c, setC] = useState("galaxy");
  const col = colorOf(c);
  return (
    <div
      className="relative rounded-[2rem] p-5 sm:p-7 overflow-hidden transition-colors duration-500 min-h-[360px] sm:min-h-[460px] flex flex-col"
      style={{ background: `radial-gradient(120% 90% at 70% 20%, ${col.b}33, transparent 60%), radial-gradient(90% 80% at 10% 100%, ${col.a}2e, transparent 60%), #fff` }}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/80 backdrop-blur border border-line text-xs font-semibold px-3 py-1.5">✦ Mais vendido</span>
        <span className="text-xs text-muted">20 cm · peça única</span>
      </div>
      <div className="relative flex-1 grid place-items-center">
        <ProductArt key={c} art="dragon" color={c} id="hero" className="float w-full max-w-[420px] drop-shadow-xl pop-in" />
      </div>
      <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-muted mb-2">Toque pra trocar a cor · {col.label}</p>
          <div className="flex gap-2" role="radiogroup" aria-label="Cor do dragão">
            {OPTS.map((id) => {
              const o = colorOf(id);
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={c === id}
                  aria-label={o.label}
                  onClick={() => setC(id)}
                  className={`w-9 h-9 rounded-full transition ${c === id ? "ring-[3px] ring-offset-2 ring-ink scale-105" : "ring-1 ring-black/10 hover:scale-105"}`}
                  style={{ background: `linear-gradient(135deg, ${o.a}, ${o.b})` }}
                />
              );
            })}
          </div>
        </div>
        <Link
          href="/produto/dragao-articulado-cristal"
          className="flex items-center justify-between gap-4 rounded-2xl bg-ink text-white pl-4 pr-2 py-2 hover:bg-brand transition"
        >
          <span>
            <span className="block text-[11px] text-white/60">Dragão Articulado Cristal</span>
            <span className="font-bold">{brl(49.9)}</span>
          </span>
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-lime text-ink">
            <IconArrow size={18} />
          </span>
        </Link>
      </div>
    </div>
  );
}
