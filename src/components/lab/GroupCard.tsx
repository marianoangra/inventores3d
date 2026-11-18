"use client";

import { useState } from "react";
import { markJoinedGroup } from "@/app/lab/boas-vindas/actions";
import { IWhats } from "./LabIcons";

/** Convite do grupo de WhatsApp. Só aparece com NEXT_PUBLIC_LAB_WHATSAPP_GROUP definido. */
export default function GroupCard({ joined, compact = false }: { joined: boolean; compact?: boolean }) {
  const link = process.env.NEXT_PUBLIC_LAB_WHATSAPP_GROUP;
  const [hidden, setHidden] = useState(joined);
  if (!link || hidden) return null;

  const done = () => {
    setHidden(true);
    void markJoinedGroup();
  };

  return (
    <div className={`rounded-3xl bg-[#25D366] text-white ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      <p className="font-display text-xl font-extrabold">Entre no grupo dos inventores</p>
      <p className="mt-1 text-sm text-white/90">Tire dúvidas, mostre suas peças e fique sabendo das aulas novas primeiro.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a href={link} target="_blank" rel="noopener" onClick={done} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#128C4A]">
          <IWhats size={18} /> Entrar no grupo do WhatsApp
        </a>
        <button onClick={done} className="text-sm font-medium text-white/90 underline">Já entrei</button>
      </div>
    </div>
  );
}
