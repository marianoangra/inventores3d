// Fotos reais dos produtos. Coloque os arquivos em /public/produtos/ e liste aqui.
// Enquanto um produto não tiver foto, o site mostra a ilustração automaticamente.
// Ex.: "dragao-articulado-cristal": ["/produtos/dragao-cristal-1.webp", "/produtos/dragao-cristal-2.webp"],
export const PHOTOS: Record<string, string[]> = {
  "rok-cooler": ["/produtos/rok-mini-1.webp", "/produtos/rok-mini-2.webp", "/produtos/rok-mini-3.webp", "/produtos/rok-cooler-1.webp"],
  "rok-cooler-7-latas": ["/produtos/rok-7-1.webp", "/produtos/rok-7-2.webp", "/produtos/rok-7-3.webp", "/produtos/rok-cooler-1.webp"],
  "snap-pong": ["/produtos/snap-pong-1.webp"],
  "boneco-rei-do-rock": ["/produtos/rei-do-rock-1.webp"],
  "chaveiro-com-nome": ["/produtos/chaveiro-nome-1.webp", "/produtos/chaveiro-nome-2.webp", "/produtos/chaveiro-nome-3.webp"],
  "topo-de-bolo-personalizado": ["/produtos/topo-bolo-1.webp", "/produtos/topo-bolo-2.webp", "/produtos/topo-bolo-3.webp"],
  "suporte-headset": ["/produtos/suporte-headset-1.webp", "/produtos/suporte-headset-2.webp", "/produtos/suporte-headset-3.webp"],
  "suporte-2-controles": ["/produtos/suporte-controle-1.webp", "/produtos/suporte-controle-2.webp", "/produtos/suporte-controle-3.webp"],
  "suporte-echo-dot": ["/produtos/suporte-echo-1.webp", "/produtos/suporte-echo-2.webp", "/produtos/suporte-echo-3.webp"],
  "organizador-de-mesa": ["/produtos/organizador-1.webp", "/produtos/organizador-2.webp", "/produtos/organizador-3.webp"],
};

export const photosOf = (slug: string) => PHOTOS[slug] ?? [];
