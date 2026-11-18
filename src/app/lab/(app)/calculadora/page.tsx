import type { Metadata } from "next";
import Calculator from "@/components/lab/Calculator";
import Edy from "@/components/lab/Edy";

export const metadata: Metadata = { title: "Calculadora de preço" };

export default function CalculadoraPage() {
  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Edy size={64} mood="pensando" className="shrink-0" />
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Quanto cobrar pela peça?</h1>
          <p className="text-lab-muted text-sm sm:text-base mt-1">Coloque o peso e o tempo que o fatiador mostra. O Edy faz a conta com taxa de cada canal.</p>
        </div>
      </div>
      <Calculator />
    </>
  );
}
