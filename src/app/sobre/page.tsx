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
          Cada peça da {STORE.name} é impressa sob encomenda numa impressora 3D de última geração, em PLA — plástico de origem vegetal, atóxico e biodegradável. A produção leva até {STORE.productionDays} dias úteis; depois disso, despachamos pra todo o Brasil. Pedidos acima de {brl(STORE.freeShippingFrom)} têm frete grátis.
        </p>
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
          Os dados que você informa no pedido (nome, WhatsApp e endereço) são usados apenas para produzir, cobrar e entregar seu pedido, conforme a LGPD. Não vendemos nem compartilhamos seus dados. A sacola fica salva só no seu navegador. Para preencher o endereço automaticamente, o CEP digitado é consultado no serviço público ViaCEP.
        </p>
      </section>
    </div>
  );
}
