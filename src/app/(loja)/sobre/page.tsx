import { SHIPPING_BY_REGION } from "@/lib/shop/shipping";
import type { Metadata } from "next";
import { STORE, brl } from "@/lib/config";

export const metadata: Metadata = {
  title: "Como funciona, trocas e privacidade",
  alternates: { canonical: "/sobre" },
};

export default function Sobre() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-10 text-ink/80 leading-relaxed">
      <section>
        <h1 className="font-display text-5xl font-bold tracking-tight text-ink">Como funciona</h1>
        <p className="mt-4">
          A {STORE.name} é uma loja de invenções: a gente cria, projeta e testa peças próprias — como o Rok-Cooler e o Snap-Pong — além de brinquedos articulados e personalizados. Cada peça é impressa sob encomenda numa impressora 3D de última geração, em PLA — plástico de origem vegetal, atóxico e biodegradável. A produção leva até {STORE.productionDays} dias úteis; depois disso, despachamos pra todo o Brasil. Pedidos acima de {brl(STORE.freeShippingFrom)} têm frete grátis.
        </p>
      </section>
      <section>
        <h2 id="frete" className="font-display text-2xl font-bold text-ink scroll-mt-28">Frete</h2>
        <p className="mt-3">Valor fixo por região, calculado pelo CEP no checkout. Acima de {brl(STORE.freeShippingFrom)}, é grátis pra todo o Brasil.</p>
        <ul className="mt-3 grid sm:grid-cols-2 gap-x-8 gap-y-1">
          {Object.values(SHIPPING_BY_REGION).map((r) => (
            <li key={r.label} className="flex justify-between border-b border-line py-1.5">
              <span>{r.label}</span>
              <b className="text-ink tabular-nums">{brl(r.price)}</b>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 id="trocas" className="font-display text-2xl font-bold text-ink scroll-mt-28">Trocas e devoluções</h2>
        <p className="mt-3">
          Pelo Código de Defesa do Consumidor, você pode desistir da compra em até 7 dias após o recebimento. Se a peça chegar quebrada ou com defeito, mande uma foto pelo WhatsApp: reimprimimos e reenviamos sem custo. Itens personalizados (com nome, foto ou tema) não podem ser devolvidos por arrependimento, só por defeito.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl font-bold text-ink">Segurança</h2>
        <p className="mt-3">Chaveiros e peças pequenas não são indicados para menores de 3 anos, por conterem partes pequenas.</p>
      </section>
      <section>
        <h2 id="privacidade" className="font-display text-2xl font-bold text-ink scroll-mt-28">Privacidade</h2>
        <p className="mt-3">
          Os dados que você informa no pedido (nome, WhatsApp, endereço e, no pagamento pelo site, CPF e e-mail) são usados apenas para produzir, cobrar e entregar seu pedido, conforme a LGPD. Não vendemos seus dados. Para cobrar, nome, CPF, e-mail, telefone e CEP são enviados ao Asaas, a instituição de pagamento que processa o Pix e o cartão; os dados do cartão são digitados direto no ambiente do Asaas e nunca passam pela nossa loja. A sacola fica salva só no seu navegador. Para preencher o endereço automaticamente, o CEP digitado é consultado no serviço público ViaCEP. Para pedir a exclusão dos seus dados, fale com a gente no WhatsApp.
        </p>
      </section>
    </div>
  );
}
