import type { Metadata } from "next";
import ActionForm, { Input } from "@/components/lab/ActionForm";
import HowTo from "@/components/lab/HowTo";
import { getWorkshop } from "@/lib/lab/data";
import { FEE_NOTES } from "@/lib/lab/fees";
import { deleteFilament, deletePrinter, saveFees, saveFilament, savePrinter, saveSettings } from "./actions";

export const metadata: Metadata = { title: "Minha oficina" };

const card = "rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6";
const pctStr = (v?: number) => (v === undefined ? "" : String(Math.round(v * 10000) / 100).replace(".", ","));

export default async function OficinaPage() {
  const { settings, printers, filaments } = await getWorkshop();
  const fo = settings.feeOverrides;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Minha oficina</h1>
        <p className="text-lab-muted mt-1">Os custos que entram em todo cálculo. Já vem com valores sugeridos — troque pelos seus.</p>
        <HowTo screen="oficina" />
      </header>

      <section className={card} aria-labelledby="custos">
        <h2 id="custos" className="font-display text-lg font-extrabold mb-4">Custos gerais</h2>
        <ActionForm action={saveSettings} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input label="Energia (kWh)" name="kwh" prefix="R$" defaultValue={settings.kwhPrice} hint="Está na conta de luz. Média BR ≈ R$ 0,95" />
            <Input label="Sua hora de trabalho" name="labor" prefix="R$" defaultValue={settings.laborHourly} hint="Quanto vale 1 h sua" />
            <Input label="Perdas e falhas" name="loss" suffix="%" defaultValue={settings.lossPct} hint="Impressões que dão errado. 5–10%" />
            <Input label="Embalagem padrão" name="packaging" prefix="R$" defaultValue={settings.packaging} />
            <Input label="Lucro padrão" name="margin" suffix="%" defaultValue={settings.marginPct} hint="Sobre o custo. Iniciante: 80–150%" />
          </div>
        </ActionForm>
      </section>

      <section className={card} aria-labelledby="imp">
        <h2 id="imp" className="font-display text-lg font-extrabold mb-4">Impressoras</h2>
        <div className="space-y-4">
          {printers.map((p) => (
            <div key={p.id} className="rounded-2xl bg-lab-soft p-4">
              <ActionForm action={savePrinter} className="space-y-3">
                <input type="hidden" name="id" value={p.id} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="col-span-2 sm:col-span-1"><Input label="Nome" name="name" type="text" defaultValue={p.name} /></div>
                  <Input label="Quanto pagou" name="price" prefix="R$" defaultValue={p.price} />
                  <Input label="Vida útil" name="life" suffix="h" defaultValue={p.lifeHours} />
                  <Input label="Consumo médio" name="watts" suffix="W" defaultValue={p.watts} />
                </div>
              </ActionForm>
              <ActionForm action={deletePrinter} submit="Excluir" variant="danger" className="mt-1">
                <input type="hidden" name="id" value={p.id} />
              </ActionForm>
            </div>
          ))}
          <details className="rounded-2xl border border-dashed border-lab-line p-4">
            <summary className="cursor-pointer text-sm font-semibold text-brand">+ Adicionar impressora</summary>
            <ActionForm action={savePrinter} submit="Adicionar" resetOnOk className="mt-3 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2 sm:col-span-1"><Input label="Nome" name="name" type="text" /></div>
                <Input label="Quanto pagou" name="price" prefix="R$" />
                <Input label="Vida útil" name="life" suffix="h" defaultValue={5000} />
                <Input label="Consumo médio" name="watts" suffix="W" defaultValue={120} />
              </div>
            </ActionForm>
          </details>
        </div>
      </section>

      <section className={card} aria-labelledby="fil">
        <h2 id="fil" className="font-display text-lg font-extrabold mb-4">Filamentos</h2>
        <div className="space-y-4">
          {filaments.map((f) => (
            <div key={f.id} className="rounded-2xl bg-lab-soft p-4">
              <ActionForm action={saveFilament} className="space-y-3">
                <input type="hidden" name="id" value={f.id} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input label="Tipo" name="type" type="text" defaultValue={f.type} />
                  <Input label="Cor" name="color" type="text" defaultValue={f.color} />
                  <Input label="Preço do rolo" name="price" prefix="R$" defaultValue={f.spoolPrice} />
                  <Input label="Peso do rolo" name="grams" suffix="g" defaultValue={f.spoolGrams} />
                </div>
              </ActionForm>
              <ActionForm action={deleteFilament} submit="Excluir" variant="danger" className="mt-1">
                <input type="hidden" name="id" value={f.id} />
              </ActionForm>
            </div>
          ))}
          <details className="rounded-2xl border border-dashed border-lab-line p-4">
            <summary className="cursor-pointer text-sm font-semibold text-brand">+ Adicionar filamento</summary>
            <ActionForm action={saveFilament} submit="Adicionar" resetOnOk className="mt-3 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input label="Tipo" name="type" type="text" defaultValue="PLA" />
                <Input label="Cor" name="color" type="text" />
                <Input label="Preço do rolo" name="price" prefix="R$" />
                <Input label="Peso do rolo" name="grams" suffix="g" defaultValue={1000} />
              </div>
            </ActionForm>
          </details>
        </div>
      </section>

      <section className={card} aria-labelledby="taxas">
        <h2 id="taxas" className="font-display text-lg font-extrabold">Taxas dos marketplaces</h2>
        <p className="text-sm text-lab-muted mt-1 mb-4">Deixe em branco pra usar a taxa padrão. Preencha só se a sua for diferente (categoria, plano, CNPJ…).</p>
        <ActionForm action={saveFees} submit="Salvar taxas" className="space-y-4">
          {(["shopee", "ml"] as const).map((ch) => (
            <div key={ch}>
              <p className="font-semibold text-sm">{ch === "shopee" ? "Shopee" : "Mercado Livre"}</p>
              <p className="text-xs text-lab-muted mb-2">Padrão: {FEE_NOTES[ch]}</p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <Input label="Comissão" name={`${ch}_pct`} suffix="%" defaultValue={pctStr(fo[ch]?.pct)} />
                <Input label="Taxa fixa por item" name={`${ch}_fixed`} prefix="R$" defaultValue={fo[ch]?.fixed} />
              </div>
            </div>
          ))}
        </ActionForm>
      </section>
    </div>
  );
}
