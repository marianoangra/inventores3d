// Configuração central da loja — mude aqui, reflete no site inteiro.
export const STORE = {
  name: "Investores 3D",
  domain: "investores3d.com.br",
  url: "https://investores3d.com.br",
  tagline: "Brinquedos articulados impressos em 3D, feitos sob encomenda no Brasil",
  // Número do WhatsApp que recebe os pedidos (só dígitos, com DDI 55).
  // Defina NEXT_PUBLIC_WHATSAPP na Vercel; o valor abaixo é só fallback.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "5500000000000",
  instagram: "investores3d",
  // Frete grátis acima deste valor (R$). Puxa o ticket médio pra cima.
  freeShippingFrom: 199,
  // Desconto no Pix (fração). 0.05 = 5%.
  pixDiscount: 0.05,
  // Prazo de produção (dias úteis) — tudo é impresso sob encomenda.
  productionDays: 3,
};

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
