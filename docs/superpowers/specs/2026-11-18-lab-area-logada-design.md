# Lab Inventores 3D — área logada grátis (design)

Data: 2026-11-18 · Status: aguardando aprovação do Rafael

## Intenção (o porquê)

Criar em inventores3d.com.br uma área logada **grátis** com ferramentas de gestão para **quem está começando na impressão 3D** (comprou a 1ª impressora e quer vender peças). Inspirado no TubaGestão3D (TubaLabs), mas com identidade própria.

O objetivo do Rafael é **comunidade**: o iniciante entra pela ferramenta grátis e é levado ao **grupo de WhatsApp** da Inventores 3D. Canal no YouTube + Instagram (projeto separado, depois) trazem gente nova com vídeo-aulas mostrando o sistema.

Funil: YouTube/Instagram → cria conta no Lab → usa a calculadora → entra no grupo de WhatsApp → volta ao Lab pra registrar vendas.

## Metas
- Iniciante cria conta em < 1 min (Google ou código no e-mail) e sai sabendo quanto cobrar por uma peça.
- Toda conta nova vê o convite do grupo de WhatsApp (boas-vindas + card fixo no início).
- Cada tela tem link "Aprenda" pra vídeo-aula curta (as aulas são feitas no projeto do canal).
- Dados de cada pessoa isolados (ninguém vê dado de outra conta).

## Fora do escopo (v1)
Cobrança/planos/teste grátis; equipe; consignado; orçamentos em PDF; clientes; tarefas (tecla Q); lista de compras; biblioteca de STL; agenda de posts; IA (Tuba AI); pesquisa de mercado de produtos; mural/comunidade dentro do site; app mobile.

## Anti-metas (falhou mesmo se funcionar)
- Mexer na loja: layout, catálogo, sacola e checkout ficam idênticos. A única mudança visível na loja é um link "Lab" / "Entrar" no topo e no rodapé.
- Vazar dado de usuário (o erro que segue aberto no Juice). Toda tabela com RLS por `user_id`; nenhuma leitura sem filtro de dono.
- Parecer o Tuba: nada de tubarão, amarelo ou layout copiado. Usa a identidade da loja (roxo #6d4aff, lime, coral, Bricolage + Inter).
- Assustar o iniciante com tela de ERP. Linguagem simples, poucos campos, valores padrão preenchidos.

## Restrições
- Mesmo app Next.js 15.5 / React 19 / Tailwind 4 do site (`~/Desktop/investores3d`), rotas novas em `/lab`.
- Repo **público** (marianoangra/inventores3d): o código do Lab fica aberto; segredos só em env vars da Vercel.
- `git push` em main publica em produção sozinho (Vercel team gasomax, projeto investores3d).
- Supabase plano grátis (50k usuários ativos/mês, 500 MB banco).
- LGPD: coletar o mínimo, página de privacidade e botão "excluir minha conta".

## Abordagens consideradas
1. **Supabase (escolhida)** — Auth (Google + código por e-mail) + Postgres com Row Level Security. Isolamento de dados garantido no banco, contas/somas fáceis em SQL, grátis na escala esperada.
2. Firebase — conhecido (Juice), mas Firestore deixa relatórios mensais trabalhosos e regras de segurança fáceis de errar.
3. Postgres na Vercel + login próprio por código (como a Fric) — tudo na Vercel, mas segurança de sessão/login fica toda na nossa mão.

Rafael escolheu a 1.

## Decisões do Rafael
- Público: iniciantes na impressão 3D.
- Grátis, sem pagamento.
- Comunidade = grupo de WhatsApp; site é a porta. Instagram também (projeto do canal).
- Mascote: mini inventor (Thomas Edison como referência).
- Supabase.
- Loja do jeito que está; só adiciona a área logada.
- **Rafael testa sozinho primeiro.** Grupo de WhatsApp ainda não existe. Card/botão do grupo só aparecem quando `NEXT_PUBLIC_LAB_WHATSAPP_GROUP` estiver definido. O link "Lab" no topo/rodapé da loja fica escondido atrás de `NEXT_PUBLIC_LAB_PUBLICO=1` (até lá, `/lab` só por URL direta). Lançar = definir as duas env vars.
- **Pedir WhatsApp no cadastro: sim**, campo opcional na boas-vindas, com texto dizendo pra que serve ("pra te chamar pro grupo e avisar de aulas novas"). Guardado em `profiles.whatsapp`, nunca exposto a outros usuários, apagado junto com a conta.
- **Mascote: Edy** (mini inventor inspirado no Edison).

## O que entra na v1 (telas)

Todas em `/lab`, com layout próprio (barra lateral no desktop, barra inferior no celular), modo claro/escuro.

1. **Entrar** `/lab/entrar` — "Entrar com Google" + "Receber código no e-mail" (6 dígitos). Sem senha.
2. **Boas-vindas** (1ª vez) — nome, qual impressora (lista: Bambu A1 mini, A1, P1S, X1C, X2D, Creality K1/Ender 3, Elegoo, Outra), WhatsApp (opcional, com máscara), checkbox de aceite da privacidade. Termina numa tela com o mascote e o botão **"Entrar no grupo do WhatsApp"**.
3. **Início** `/lab` — card do grupo de WhatsApp (fixo até a pessoa clicar "já entrei"), checklist de primeiros passos (configurar oficina → 1º cálculo → 1ª venda), resumo do mês (vendas, lucro, lucro por hora de máquina).
4. **Minha oficina** `/lab/oficina` — impressoras (preço pago, vida útil em horas, consumo em W), filamentos (tipo, cor, preço do rolo, peso do rolo), custo do kWh, valor da sua hora de trabalho, % de perda/falha, embalagem padrão. Tudo vem com valor padrão sugerido.
5. **Calculadora** `/lab/calculadora` — gramas, tempo de impressão (h:min), tempo de trabalho manual, filamento, impressora, embalagem, margem desejada. Mostra custo detalhado (filamento, energia, desgaste da máquina, trabalho, perda) e **preço sugerido por canal** (venda direta/Instagram, Shopee, Mercado Livre) já com as taxas, lucro e **lucro por hora de máquina**. Botão "Salvar como peça".
6. **Minhas peças** `/lab/pecas` — lista das peças salvas (nome, foto opcional por URL, custo, preço por canal, lucro/hora). Editar/duplicar/excluir.
7. **Vendas** `/lab/vendas` — registrar venda: peça (ou avulsa), quantidade, preço unitário, canal, data. Lista do mês.
8. **Despesas** `/lab/despesas` — descrição, categoria (filamento, peças/manutenção, embalagem, energia, ferramentas, outros), valor, data.
9. **Resultados** `/lab/resultados` — por mês: faturamento, custo das peças vendidas, despesas, lucro, lucro por hora de máquina, peças mais vendidas, vendas por canal.
10. **Aprenda** `/lab/aprenda` — lista das vídeo-aulas (YouTube embutido). Cada tela tem um link "Como usar esta tela" que aponta pra aula dela (fica "em breve" até a aula existir).
11. **Conta** `/lab/conta` — nome, impressora, sair, **excluir conta e dados**. Página pública `/lab/privacidade`.

## Taxas dos marketplaces
Tabela de taxas por canal no código (`src/lib/lab/fees.ts`) com valores padrão vigentes (Shopee e ML clássico/premium), conferidos na hora de implementar. Na oficina o usuário pode sobrescrever cada taxa. Mostrar a data da última conferência.

## Dados (Supabase, todas com `user_id` + RLS "só o dono lê/escreve")
- `profiles` (id = auth user, nome, impressora, whatsapp null, aceitou_privacidade_em, entrou_no_grupo bool)
- `printers` (nome, preco, vida_util_h, watts)
- `filaments` (tipo, cor, preco_rolo, peso_rolo_g)
- `workshop_settings` (kwh, hora_trabalho, perda_pct, embalagem_padrao, taxas_override jsonb)
- `parts` (nome, foto_url, gramas, minutos_impressao, minutos_trabalho, printer_id, filament_id, margem_pct, custo_calculado, precos jsonb)
- `sales` (part_id null, descricao, qtd, preco_unit, canal, data)
- `expenses` (descricao, categoria, valor, data)

Cálculo de custo em uma função pura (`src/lib/lab/pricing.ts`) com testes — é o coração do produto.

## Mascote
**Edy** — mini inventor inspirado no Edison (jaleco, lâmpada, bigode). Nome próprio em vez de "Thomas Edison", por direito de imagem/nome de pessoa falecida (Código Civil art. 20). Na v1 do Lab ele aparece só na boas-vindas e nos estados vazios, como ilustração SVG simples; a versão final do personagem sai no projeto do canal.

## Integrações / passos que dependem do Rafael
- Criar conta Supabase (ou instalar via Vercel Marketplace no projeto investores3d — injeta as env vars sozinho).
- Login Google: cliente OAuth no Google Cloud (eu guio).
- E-mail do código: SMTP próprio via Resend com domínio inventores3d.com.br verificado (DNS no Registro.br, feito pelo Rafael). O e-mail padrão do Supabase só manda poucos por hora — não serve pra lançamento.
- Link de convite do grupo de WhatsApp → env `NEXT_PUBLIC_LAB_WHATSAPP_GROUP`.

## Chamadas minhas (Rafael pode corrigir)
- Rota `/lab` e nome "Lab Inventores 3D".
- Sem senha: só Google + código no e-mail.
- Calculadora com 3 canais na v1 (direto, Shopee, ML).
- Sem tela de admin na v1; contagem de cadastros vista no painel do Supabase.
- Lab sem indexação no Google (exceto a página de entrada/apresentação).

## Fica a cargo de quem implementa
Componentes, estrutura de pastas dentro de `src/app/lab`, uso de Server Actions vs rotas de API, formato dos estados vazios, ordem de implementação das telas.
