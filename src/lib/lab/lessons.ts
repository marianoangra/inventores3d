// Vídeo-aulas do Lab. Quando a aula sair no YouTube, preencha youtubeId (o trecho depois de "v=").
export type Lesson = { slug: string; title: string; screen: string; summary: string; youtubeId: string | null };

export const LESSONS: Lesson[] = [
  { slug: "oficina", screen: "oficina", title: "Monte sua oficina", summary: "Impressora, filamento, energia e o valor da sua hora.", youtubeId: null },
  { slug: "calculadora", screen: "calculadora", title: "Quanto cobrar pela peça", summary: "Peso, tempo e o preço certo pra Shopee, ML e venda direta.", youtubeId: null },
  { slug: "pecas", screen: "pecas", title: "Seu catálogo de peças", summary: "Salve, edite e compare o lucro por hora de cada peça.", youtubeId: null },
  { slug: "vendas", screen: "vendas", title: "Lançando vendas", summary: "Registre cada venda em segundos.", youtubeId: null },
  { slug: "despesas", screen: "despesas", title: "Controlando despesas", summary: "Filamento, manutenção, embalagem: tudo que sai do bolso.", youtubeId: null },
  { slug: "resultados", screen: "resultados", title: "Lendo seus resultados", summary: "Lucro do mês, lucro por hora de máquina e o que mais vende.", youtubeId: null },
];

export const lessonFor = (screen: string) => LESSONS.find((l) => l.screen === screen) ?? null;
