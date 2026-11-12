export type Art =
  | "dragon"
  | "dino"
  | "axolotl"
  | "snake"
  | "octopus"
  | "capybara"
  | "shark"
  | "cat"
  | "gear"
  | "slider"
  | "egg"
  | "keychain"
  | "box"
  | "name"
  | "lamp"
  | "party";

export type Category = "articulados" | "fidget" | "chaveiros" | "kits" | "personalizados";

export const CATEGORIES: { id: Category; label: string; desc: string }[] = [
  { id: "articulados", label: "Articulados", desc: "Bichos que mexem cada junta" },
  { id: "fidget", label: "Fidget & Antiestresse", desc: "Pra mão que não para quieta" },
  { id: "chaveiros", label: "Chaveiros", desc: "Mini articulados pra levar junto" },
  { id: "kits", label: "Kits & Festas", desc: "Lembrancinhas e caixas surpresa" },
  { id: "personalizados", label: "Personalizados", desc: "Com nome, foto ou do seu jeito" },
];

export type Color = { id: string; label: string; a: string; b: string; extra?: number };

// Paleta de filamentos. a/b = gradiente usado na ilustração.
export const COLORS: Record<string, Color> = {
  galaxy: { id: "galaxy", label: "Galáxia", a: "#6d28d9", b: "#ec4899" },
  oceano: { id: "oceano", label: "Oceano", a: "#0284c7", b: "#22d3ee" },
  lava: { id: "lava", label: "Lava", a: "#dc2626", b: "#f59e0b" },
  floresta: { id: "floresta", label: "Floresta", a: "#15803d", b: "#a3e635" },
  arcoiris: { id: "arcoiris", label: "Arco-íris (seda)", a: "#f43f5e", b: "#3b82f6", extra: 10 },
  neon: { id: "neon", label: "Brilha no escuro", a: "#84cc16", b: "#d9f99d", extra: 10 },
  rosa: { id: "rosa", label: "Algodão-doce", a: "#f472b6", b: "#c4b5fd" },
  ouro: { id: "ouro", label: "Ouro (seda)", a: "#b45309", b: "#fde68a", extra: 10 },
};

export type Product = {
  slug: string;
  name: string;
  category: Category;
  art: Art;
  price: number;
  compareAt?: number;
  short: string;
  description: string;
  specs: string[];
  colors: string[];
  badge?: string;
  personalize?: string; // rótulo do campo de personalização, se houver
  bestseller?: boolean;
  age?: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: "dragao-articulado-cristal",
    name: "Dragão Articulado Cristal",
    category: "articulados",
    art: "dragon",
    price: 49.9,
    compareAt: 69.9,
    short: "O campeão de vendas da impressão 3D. 20 cm, todas as juntas se mexem.",
    description:
      "Impresso numa peça só, já sai articulado da impressora — sem cola, sem montagem. Cada segmento do corpo, das asas e da cauda se mexe. Vira brinquedo, enfeite de mesa e fidget ao mesmo tempo.",
    specs: ["20 cm de comprimento", "PLA atóxico e biodegradável", "Impresso em peça única (print-in-place)", "Acabamento em camada fina 0,12 mm"],
    colors: ["galaxy", "arcoiris", "lava", "oceano", "neon", "ouro"],
    badge: "Mais vendido",
    bestseller: true,
    age: "+6 anos",
  },
  {
    slug: "dragao-articulado-gigante",
    name: "Dragão Articulado Gigante",
    category: "articulados",
    art: "dragon",
    price: 119.9,
    compareAt: 149.9,
    short: "40 cm de dragão. Peça de presença pra estante ou pra brincar.",
    description:
      "A versão XL do nosso campeão. Asas abertas, juntas reforçadas e acabamento em seda que brilha na luz. É o presente que faz a criança (e o adulto) gritar.",
    specs: ["40 cm de comprimento", "PLA seda premium", "Juntas reforçadas", "Embalagem presente inclusa"],
    colors: ["arcoiris", "galaxy", "ouro", "lava"],
    badge: "Presente top",
    bestseller: true,
    age: "+6 anos",
  },
  {
    slug: "ovo-de-dragao-surpresa",
    name: "Ovo de Dragão Surpresa",
    category: "articulados",
    art: "egg",
    price: 59.9,
    short: "Um ovo que abre e tem um dragãozinho articulado dentro.",
    description:
      "O ovo é texturizado como escama e abre ao meio. Lá dentro, um dragão articulado enrolado esperando pra nascer. Momento de abrir = vídeo garantido.",
    specs: ["Ovo 10 cm + dragão 15 cm", "Fecho por encaixe", "Cores do ovo e do dragão combinam"],
    colors: ["galaxy", "lava", "oceano", "floresta"],
    badge: "Novidade",
    bestseller: true,
    age: "+6 anos",
  },
  {
    slug: "dino-rex-articulado",
    name: "Dino Rex Articulado",
    category: "articulados",
    art: "dino",
    price: 39.9,
    short: "T-Rex que anda, abre a boca e balança o rabo.",
    description:
      "O dino que toda criança quer. Pernas, cauda e pescoço articulados, impresso numa peça só. Resistente pra brincar de verdade.",
    specs: ["18 cm", "PLA atóxico", "Print-in-place"],
    colors: ["floresta", "lava", "oceano", "neon"],
    bestseller: true,
    age: "+4 anos",
  },
  {
    slug: "axolote-articulado",
    name: "Axolote Articulado",
    category: "articulados",
    art: "axolotl",
    price: 34.9,
    short: "O bichinho mais fofo da internet, agora todo flexível.",
    description: "Axolote sorridente com guelras de destaque e corpo segmentado. Febre entre crianças e adolescentes.",
    specs: ["15 cm", "PLA atóxico", "Print-in-place"],
    colors: ["rosa", "oceano", "neon", "galaxy"],
    bestseller: true,
    age: "+4 anos",
  },
  {
    slug: "capivara-articulada",
    name: "Capivara Articulada",
    category: "articulados",
    art: "capybara",
    price: 34.9,
    short: "A mascote não-oficial do Brasil, em versão que mexe.",
    description: "Capivara tranquila, de corpo articulado. Sucesso com criança, adulto e quem vive de meme.",
    specs: ["14 cm", "PLA atóxico", "Print-in-place"],
    colors: ["ouro", "lava", "floresta"],
    age: "+4 anos",
  },
  {
    slug: "tubarao-articulado",
    name: "Tubarão Articulado",
    category: "articulados",
    art: "shark",
    price: 34.9,
    short: "Tubarão que nada no ar de tão flexível.",
    description: "Corpo em segmentos que ondulam como um tubarão de verdade. Ótimo pra mesa do escritório também.",
    specs: ["18 cm", "PLA atóxico", "Print-in-place"],
    colors: ["oceano", "galaxy", "neon"],
    age: "+4 anos",
  },
  {
    slug: "cobra-articulada",
    name: "Cobra Articulada 60 cm",
    category: "articulados",
    art: "snake",
    price: 29.9,
    short: "60 cm de cobra que serpenteia de verdade. Susto garantido.",
    description: "Dezenas de segmentos que fazem a cobra se mover de forma realista. A pegadinha favorita da família.",
    specs: ["60 cm", "PLA atóxico", "Print-in-place"],
    colors: ["floresta", "neon", "lava", "arcoiris"],
    age: "+4 anos",
  },
  {
    slug: "polvo-articulado",
    name: "Polvo Articulado",
    category: "articulados",
    art: "octopus",
    price: 24.9,
    short: "Oito tentáculos que mexem em todas as direções.",
    description: "Polvinho fofo e muito tátil — difícil largar depois que pega na mão.",
    specs: ["10 cm", "PLA atóxico", "Print-in-place"],
    colors: ["rosa", "galaxy", "lava", "oceano"],
    age: "+4 anos",
  },
  {
    slug: "gato-articulado",
    name: "Gato Articulado",
    category: "articulados",
    art: "cat",
    price: 29.9,
    short: "Gatinho flexível pra quem ama felino.",
    description: "Gato de corpo articulado e rabo comprido. Presente certeiro pra tutor de gato.",
    specs: ["15 cm", "PLA atóxico", "Print-in-place"],
    colors: ["galaxy", "rosa", "ouro", "neon"],
    age: "+4 anos",
  },
  {
    slug: "fidget-engrenagem",
    name: "Fidget Engrenagem",
    category: "fidget",
    art: "gear",
    price: 24.9,
    short: "Engrenagens que giram juntas. Hipnotizante e silencioso.",
    description: "Gira uma, giram todas. Fidget de mesa pra foco, ansiedade e reunião longa. Funciona direto da impressora.",
    specs: ["7 cm", "Engrenagens print-in-place", "Silencioso"],
    colors: ["galaxy", "oceano", "lava", "neon"],
    bestseller: true,
    age: "+6 anos",
  },
  {
    slug: "fidget-slider-click",
    name: "Fidget Slider Click",
    category: "fidget",
    art: "slider",
    price: 19.9,
    short: "Desliza e faz clique. Viciante na medida.",
    description: "Slider de bolso com clique satisfatório. Cabe no estojo e no bolso.",
    specs: ["8 cm", "Clique tátil", "Bolso-friendly"],
    colors: ["arcoiris", "galaxy", "rosa", "oceano"],
    age: "+6 anos",
  },
  {
    slug: "chaveiro-articulado",
    name: "Chaveiro Articulado",
    category: "chaveiros",
    art: "keychain",
    price: 14.9,
    short: "Mini dragão, dino, axolote ou capivara pra pendurar.",
    description: "Versão chaveiro dos nossos articulados, com argola metálica. Escolha o bicho no campo abaixo.",
    specs: ["6–8 cm", "Argola metálica", "Escolha o bicho"],
    colors: ["galaxy", "arcoiris", "lava", "oceano", "neon", "rosa"],
    personalize: "Qual bicho? (dragão, dino, axolote, capivara, polvo)",
    age: "+6 anos",
  },
  {
    slug: "kit-3-chaveiros",
    name: "Kit 3 Chaveiros Articulados",
    category: "chaveiros",
    art: "keychain",
    price: 34.9,
    compareAt: 44.7,
    short: "Leve 3, pague menos. Pra você e pros amigos.",
    description: "Três chaveiros articulados à sua escolha. Diga os bichos e cores no campo de personalização.",
    specs: ["3 chaveiros 6–8 cm", "Argolas metálicas", "Mix de bichos e cores"],
    colors: ["arcoiris"],
    personalize: "Quais bichos e cores?",
    badge: "-22%",
  },
  {
    slug: "chaveiro-com-nome",
    name: "Chaveiro com Nome",
    category: "personalizados",
    art: "name",
    price: 19.9,
    short: "Seu nome em 3D, em duas cores.",
    description: "Chaveiro com nome (até 12 letras) em relevo bicolor. Ótimo pra mochila, lancheira e lembrancinha.",
    specs: ["Até 12 letras", "Bicolor", "Argola metálica"],
    colors: ["galaxy", "rosa", "oceano", "lava", "floresta"],
    personalize: "Nome (até 12 letras)",
  },
  {
    slug: "luminaria-litofania",
    name: "Luminária Litofania com Foto",
    category: "personalizados",
    art: "lamp",
    price: 149.9,
    short: "Sua foto aparece quando a luz acende. Presente que emociona.",
    description:
      "A foto é esculpida em relevo no plástico branco e só aparece quando a luz LED acende atrás. Depois do pedido, você manda a foto pelo WhatsApp.",
    specs: ["15 × 15 cm", "Base com LED USB", "Envie a foto pelo WhatsApp"],
    colors: ["ouro"],
    personalize: "Ocasião / observação (a foto vai pelo WhatsApp)",
    badge: "Personalizado",
  },
  {
    slug: "caixa-surpresa-3",
    name: "Caixa Surpresa 3 Articulados",
    category: "kits",
    art: "box",
    price: 89.9,
    compareAt: 109.7,
    short: "3 bichos articulados surpresa numa caixa presente.",
    description: "A gente escolhe 3 articulados (sem repetir) e manda numa caixa presente. Ideal pra aniversário.",
    specs: ["3 articulados sortidos", "Caixa presente", "Sem repetição"],
    colors: ["arcoiris"],
    badge: "-18%",
    age: "+6 anos",
  },
  {
    slug: "kit-lembrancinha-10",
    name: "Kit Lembrancinha Festa — 10 un",
    category: "kits",
    art: "party",
    price: 129.9,
    short: "10 chaveiros articulados no tema da festa, com tag do aniversariante.",
    description:
      "Lembrancinha que as crianças realmente usam. 10 chaveiros articulados nas cores do tema, cada um com tag personalizada. Peça com pelo menos 10 dias de antecedência.",
    specs: ["10 unidades", "Tag com nome e idade", "Cores do tema da festa"],
    colors: ["arcoiris"],
    personalize: "Nome do aniversariante, idade e tema",
    badge: "Festa",
  },
  {
    slug: "kit-lembrancinha-30",
    name: "Kit Lembrancinha Festa — 30 un",
    category: "kits",
    art: "party",
    price: 329.9,
    compareAt: 389.7,
    short: "Festa grande? 30 lembrancinhas personalizadas com desconto.",
    description:
      "30 chaveiros articulados personalizados com tag. Escolha até 3 bichos diferentes e as cores do tema. Peça com pelo menos 15 dias de antecedência.",
    specs: ["30 unidades", "Até 3 bichos diferentes", "Tag com nome e idade"],
    colors: ["arcoiris"],
    personalize: "Nome do aniversariante, idade, tema e data da festa",
    badge: "-15%",
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const colorOf = (id: string) => COLORS[id] ?? COLORS.galaxy;
