"use client";

/** Abre a impressão do navegador — lá dá pra "Salvar como PDF". */
export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="h-11 rounded-full border border-lab-line px-5 text-sm font-semibold hover:border-brand">
      Salvar PDF / imprimir
    </button>
  );
}
