"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IBox, ICalc, IChart, IDoc, IHome, IPrinter, IMenu, IMoon, IPlay, IReceipt, ISale, ISun, IUser, IWrench, IX } from "./LabIcons";

const NAV = [
  { href: "/lab", label: "Início", Icon: IHome },
  { href: "/lab/calculadora", label: "Calculadora", Icon: ICalc },
  { href: "/lab/pecas", label: "Minhas peças", Icon: IBox },
  { href: "/lab/vendas", label: "Vendas", Icon: ISale },
  { href: "/lab/producao", label: "Produção", Icon: IPrinter },
  { href: "/lab/documentos", label: "Documentos", Icon: IDoc },
  { href: "/lab/despesas", label: "Despesas", Icon: IReceipt },
  { href: "/lab/resultados", label: "Resultados", Icon: IChart },
  { href: "/lab/oficina", label: "Minha oficina", Icon: IWrench },
  { href: "/lab/aprenda", label: "Aprenda", Icon: IPlay },
  { href: "/lab/conta", label: "Conta", Icon: IUser },
];
const MOBILE = ["/lab", "/lab/calculadora", "/lab/vendas", "/lab/producao"];

export function LabLogo() {
  return (
    <Link href="/lab" className="flex items-center gap-2" title="Lab Inventores 3D — início">
      <span aria-hidden className="relative grid place-items-center w-9 h-9 rounded-[11px] bg-ink text-lime font-display font-extrabold text-[15px] ring-1 ring-lab-line">
        i3
        <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-coral ring-2 ring-lab-bg" />
      </span>
      <span className="font-display text-[18px] font-bold tracking-tight text-lab-text">
        Lab <span className="text-brand">inventores3d</span>
      </span>
    </Link>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    const read = () => {
      const attr = document.documentElement.dataset.labTheme;
      setDark(attr ? attr === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    };
    read();
    // há dois botões (desktop e celular): os dois ouvem a troca
    window.addEventListener("lab-theme", read);
    return () => window.removeEventListener("lab-theme", read);
  }, []);
  const toggle = () => {
    const next = !dark;
    document.documentElement.dataset.labTheme = next ? "dark" : "light";
    try {
      localStorage.setItem("lab-theme", next ? "dark" : "light");
    } catch {}
    window.dispatchEvent(new Event("lab-theme"));
  };
  return (
    <button onClick={toggle} className="grid place-items-center w-10 h-10 rounded-full border border-lab-line text-lab-muted hover:text-lab-text" aria-label={dark ? "Usar modo claro" : "Usar modo escuro"}>
      {dark ? <ISun size={18} /> : <IMoon size={18} />}
    </button>
  );
}

const isActive = (path: string, href: string) => (href === "/lab" ? path === "/lab" : path.startsWith(href));

export default function LabShell({ children, user }: { children: React.ReactNode; user?: { name: string } | null }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [path]);

  return (
    <div className="min-h-dvh bg-lab-bg text-lab-text print:bg-white">
      {/* lateral (desktop) */}
      <aside className="hidden print:!hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-lab-line bg-lab-card px-4 py-5">
        <LabLogo />
        <nav className="mt-8 flex flex-col gap-1" aria-label="Lab">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 h-11 text-[14.5px] font-medium transition ${isActive(path, href) ? "bg-brand text-white" : "text-lab-muted hover:bg-lab-soft hover:text-lab-text"}`}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-lab-line">
          <p className="text-sm text-lab-muted truncate">{user ? `Oi, ${user.name.split(" ")[0]}` : "Modo visitante"}</p>
          <ThemeToggle />
        </div>
      </aside>

      {/* topo (celular) */}
      <header className="lg:hidden print:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-lab-bg/90 backdrop-blur border-b border-lab-line">
        <LabLogo />
        <ThemeToggle />
      </header>

      <main className="lg:pl-64 pb-24 lg:pb-10 print:p-0">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 lg:py-10">{children}</div>
      </main>

      {/* barra inferior (celular) */}
      <nav className="lg:hidden print:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 border-t border-lab-line bg-lab-card pb-[env(safe-area-inset-bottom)]" aria-label="Lab">
        {NAV.filter((n) => MOBILE.includes(n.href)).map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={`flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-medium ${isActive(path, href) ? "text-brand" : "text-lab-muted"}`}>
            <Icon size={21} />
            {label === "Calculadora" ? "Calcular" : label}
          </Link>
        ))}
        <button onClick={() => setMenu(true)} className="flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-medium text-lab-muted" aria-label="Mais opções">
          <IMenu size={21} />
          Mais
        </button>
      </nav>

      {menu && (
        <div className="lg:hidden fixed inset-0 z-40 bg-ink/50" onClick={() => setMenu(false)}>
          <div className="absolute bottom-0 inset-x-0 rounded-t-3xl bg-lab-card p-4 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-display font-bold text-lg">Menu</p>
              <button onClick={() => setMenu(false)} aria-label="Fechar menu" className="w-10 h-10 grid place-items-center text-lab-muted">
                <IX />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {NAV.map(({ href, label, Icon }) => (
                <Link key={href} href={href} className={`flex flex-col items-center gap-1.5 rounded-2xl py-4 text-[12.5px] font-medium ${isActive(path, href) ? "bg-brand text-white" : "bg-lab-soft text-lab-text"}`}>
                  <Icon size={22} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
