// Fotos reais dos produtos. Coloque os arquivos em /public/produtos/ e liste aqui.
// Enquanto um produto não tiver foto, o site mostra a ilustração automaticamente.
// Ex.: "dragao-articulado-cristal": ["/produtos/dragao-cristal-1.webp", "/produtos/dragao-cristal-2.webp"],
export const PHOTOS: Record<string, string[]> = {};

export const photosOf = (slug: string) => PHOTOS[slug] ?? [];
