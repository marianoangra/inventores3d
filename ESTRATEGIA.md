# Inventores 3D — estratégia de lançamento

## O que o mercado mostrou (nov/2026)
- **Articulados print-in-place dominam** brinquedo 3D: dragão, dino, cobra, axolote, polvo, capivara. Dino articulado R$25–45, cobra R$18–35 (ML/Shopee).
- **Chaveiro articulado** é o item de maior giro: anúncio a R$35 com 500+ vendas no ML; Shopee tem chaveiro a R$9,90–R$18.
- **O dragão genérico virou commodity**: no Etsy caiu de ~£14 (2023) pra ~£4,50 porque todo mundo imprime o mesmo arquivo. Briga de preço unitário em marketplace = margem zero.
- **O que segura preço**: personalizado (nome, foto/litofania), kits, cores premium (seda, galáxia, brilha no escuro: +20–30%).
- Taxas: Shopee leva ~R$13,50 de uma peça de R$45; ML Clássico ~R$11–13.

## Posicionamento
1. **Marketplace = vitrine/aquisição** (Shopee pro impulso barato, ML pra busca). Site = margem.
2. **No site não se vende unidade barata, se vende ticket**: kit 3 chaveiros, caixa surpresa, frete grátis acima de R$199, Pix −5%.
3. **Lembrancinha de festa (B2B2C) é a mina**: kit 10 = R$129,90, kit 30 = R$329,90. Custo de material de um chaveiro ≈ R$0,50–1. Buffets, escolas e mães de festa infantil compram em volume e recompram.
4. **Litofania com foto (R$149,90)**: presente emocional, ninguém compara preço.

## Regra de ouro: propriedade intelectual
- **NÃO** vender personagem licenciado (Banguela/Como Treinar seu Dragão, Labubu, Stitch, Pokémon, times de futebol). Vende, mas dá derrubada de anúncio e processo. A Bambu Lab fez acordo com a Pop Mart em mar/2026 e removeu todo Labubu do MakerWorld — a fiscalização apertou.
- Arquivos do MakerWorld são **uso pessoal** por padrão. Pra vender a peça impressa: comprar a **Commercial License Membership** do criador (ou usar modelos com licença comercial explícita / encomendar modelos originais).
- Antes de imprimir pra vender, guarde print da licença de cada modelo.

## Capacidade da X2D
- Volume ~256×256×260 mm: dragão 40 cm sai em diagonal/encolhido; ok.
- AMS = multicolor (até 25 filamentos): chaveiro com nome bicolor e articulados arco-íris sem troca manual.
- Bico duplo: suporte solúvel/menos desperdício nas trocas de cor (mais margem nos multicolor).
- Estratégia de fila: imprimir **placas cheias** (ex.: 12–20 chaveiros por placa) e manter **estoque pequeno dos 5 mais vendidos** nas 3 cores mais pedidas, pra despachar no dia seguinte.

## Próximos passos (em ordem)
1. Fotos reais dos 6 queridinhos (fundo branco + vídeo curto mexendo as juntas) → substituir as ilustrações.
2. Definir `NEXT_PUBLIC_WHATSAPP` na Vercel (número que recebe pedidos).
3. Integrar Mercado Pago Checkout Pro (Pix automático + cartão) quando o volume justificar sair do pedido-por-WhatsApp.
4. Subir os mesmos produtos em Shopee e ML com link pro site na bio/embalagem (cartão "compre de novo com 10% off").
5. Reels/TikTok: vídeo da junta mexendo + timelapse da impressora é o criativo que vende esse produto.
6. Prospectar 10 buffets infantis da região com kit amostra.

## Onde editar
- Produtos/preços/cores: `src/lib/products.ts`
- Frete grátis, desconto Pix, prazo, WhatsApp: `src/lib/config.ts`
