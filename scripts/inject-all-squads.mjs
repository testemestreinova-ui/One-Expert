/**
 * inject-all-squads.mjs
 * Injeta memórias de 7 squads nos agentes Vox (content) e Nexus (sales)
 * Squads: copy-master, hormozi, storytelling, brand-squad, data-squad
 *
 * Uso: node scripts/inject-all-squads.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────
// MEMÓRIAS DO VOX (agente de conteúdo)
// ─────────────────────────────────────────────
const VOX_MEMORIES = [

  // ── HORMOZI: HOOKS & CONTEÚDO ──
  { memory_type: "fact", relevance: 1.0,
    content: "Hormozi Hooks: você tem 1-3 segundos. O hook é uma PROMESSA que faz o leitor precisar do restante — nunca um resumo" },
  { memory_type: "fact", relevance: 0.95,
    content: "Tipos de hook Hormozi: Resultado específico ('Fui de X para Y em Z dias') | Contrarian ('Por que professores não deveriam...') | Curiosidade ('O erro que 90% cometem') | História" },
  { memory_type: "fact", relevance: 0.95,
    content: "Hormozi Conteúdo: dê o QUÊ e o POR QUÊ de graça. Venda o COMO (implementação, velocidade, comunidade, accountability)" },
  { memory_type: "fact", relevance: 0.9,
    content: "Estrutura de conteúdo Hormozi: Hook (para o scroll) → Retain (mantém atenção) → Reward (entrega valor real). Todo post segue isso." },
  { memory_type: "fact", relevance: 0.85,
    content: "Hormozi: conteúdo é sistema, não arte. Volume + consistência > brilho ocasional. Repurpose: 1 ideia → vídeo → carrossel → threads → email" },

  // ── COPY MASTER: FRAMEWORKS ESSENCIAIS ──
  { memory_type: "fact", relevance: 1.0,
    content: "Eugene Schwartz — 5 Níveis de Consciência: Mais Consciente (3%), Consciente do Produto (7%), Consciente da Solução (10%), Consciente do Problema (20%), Inconsciente (60%)" },
  { memory_type: "fact", relevance: 0.95,
    content: "Schwartz: quanto menos consciente o público, mais longo e indireto o copy. Público frio (professores sem saber da plataforma) → educação primeiro, oferta depois" },
  { memory_type: "fact", relevance: 0.95,
    content: "Dan Kennedy — PAS Formula: Problem (descrever o problema claramente) → Agitate (injetar emoção, fazer sentir a dor) → Solution (apresentar a solução)" },
  { memory_type: "fact", relevance: 0.9,
    content: "Dan Kennedy — Triângulo 3M: Mensagem certa + Mercado certo + Mídia certa. Os três precisam se alinhar. Sem isso, nada funciona." },
  { memory_type: "fact", relevance: 0.9,
    content: "Gary Halbert — Starving Crowd: mercado > copy. Encontre quem DESESPERADAMENTE quer o que você vende antes de escrever uma palavra" },
  { memory_type: "fact", relevance: 0.9,
    content: "Frank Kern — Results in Advance: entregue um resultado REAL gratuitamente antes de qualquer venda. Cria reciprocidade + prova de que o pago é melhor ainda" },
  { memory_type: "fact", relevance: 0.85,
    content: "Joanna Wiebe — Message Mining: extraia as palavras EXATAS dos seus clientes (reviews, comentários, Reddit) e use no copy. Pesquisa é 80% do trabalho" },
  { memory_type: "fact", relevance: 0.85,
    content: "Sabri Suby — HVCO: High Value Content Offer — isca tão valiosa que poderia ser vendida mas é dada de graça. Deve resolver problema ESPECÍFICO e imediato do avatar" },
  { memory_type: "fact", relevance: 0.8,
    content: "Gary Halbert — SSS: Star (apresentar protagonista/herói) → Story (conflito e jornada) → Solution (como o produto resolve). Estrutura base de conteúdo narrativo" },

  // ── STORYTELLING ──
  { memory_type: "fact", relevance: 1.0,
    content: "Kindra Hall — 4 Histórias que todo negócio precisa: 1) História de Valor (o que o produto faz) 2) História do Fundador 3) História de Propósito 4) História do Cliente (prova social narrativa)" },
  { memory_type: "fact", relevance: 0.95,
    content: "Kindra Hall — Estrutura: Normal (antes) → Explosão (momento de mudança) → Nova Normal (depois transformado). Toda história de cliente segue isso." },
  { memory_type: "fact", relevance: 0.9,
    content: "Nancy Duarte — Sparkline: alterne entre 'Como é agora' e 'Como poderia ser'. A tensão entre os dois estados É o motor da persuasão" },
  { memory_type: "fact", relevance: 0.9,
    content: "Nancy Duarte — o PÚBLICO é o herói, a MARCA é o mentor/guia. Nunca posicione a marca como herói. Professor é o herói; Mestre Inova é o guia." },
  { memory_type: "fact", relevance: 0.85,
    content: "Nancy Duarte — Momento S.T.A.R.: algo que eles Sempre vão Lembrar. Dramatização, frase memorável, visual impactante, dado chocante ou história emocional." },
  { memory_type: "fact", relevance: 0.85,
    content: "Joseph Campbell — A Jornada do Herói aplicada ao copy: Mundo Comum → Chamado → Mentor → Provação → Transformação → Retorno com o Elixir (= resultado do produto)" },
  { memory_type: "fact", relevance: 0.8,
    content: "Oren Klaff — Método STRONG para pitch: Set Frame → Tell Story → Reveal Intrigue → Offer Prize → Nail Hookpoint → Get Decision. Você é o prêmio, não o vendedor." },

  // ── BRAND SQUAD ──
  { memory_type: "fact", relevance: 1.0,
    content: "Donald Miller StoryBrand SB7: Cliente é o herói. Marca é o guia. Estrutura: Personagem → Problema (externo+interno+filosófico) → Guia → Plano → CTA → Fracasso → Sucesso" },
  { memory_type: "fact", relevance: 0.95,
    content: "Miller: empresas vendem soluções para problemas EXTERNOS mas clientes compram soluções para problemas INTERNOS (sentimentos, identidade). Mestre Inova alivia o sentimento de sobrecarga." },
  { memory_type: "fact", relevance: 0.9,
    content: "Al Ries — Posicionamento: possuir UMA palavra na mente do prospect. Mestre Inova → 'intervenção'. Não crie conteúdo que dilua esse posicionamento." },
  { memory_type: "fact", relevance: 0.85,
    content: "Marty Neumeier — Onlyness Test: 'Nosso [produto] é o ÚNICO [categoria] que [diferencial radical]'. Para Mestre Inova: única plataforma que fecha o ciclo correção→intervenção" },
];

// ─────────────────────────────────────────────
// MEMÓRIAS DO NEXUS (agente de vendas/CRM)
// ─────────────────────────────────────────────
const NEXUS_MEMORIES = [

  // ── HORMOZI: OFERTAS, VENDAS E RETENÇÃO ──
  { memory_type: "fact", relevance: 1.0,
    content: "Hormozi Value Equation: Valor = (Resultado Desejado × Probabilidade de Alcançar) / (Tempo de Espera × Esforço). Aumente o numerador, reduza o denominador." },
  { memory_type: "fact", relevance: 0.95,
    content: "Hormozi: nunca baixe o preço — aumente o valor percebido. Preço premium atrai clientes melhores que geram melhores resultados → mais referências → mais leads → ciclo virtuoso" },
  { memory_type: "fact", relevance: 0.95,
    content: "CLOSER Framework: Clarify (por que vieram) → Label (diagnóstico do problema) → Overview (dor passada + visão futura) → Sell (venda a transformação, não o produto) → Explain → Reinforce" },
  { memory_type: "fact", relevance: 0.9,
    content: "Hormozi — Objeção 'não tenho dinheiro': nunca é sobre dinheiro, é sobre valor percebido. Se fosse R$5, compraria? Sim? Então é sobre valor, não preço." },
  { memory_type: "fact", relevance: 0.9,
    content: "Hormozi Retenção — LTGP: Valor Vitalício = Lucro Bruto por Período / Taxa de Churn. Reduzir churn de 5% para 4% aumenta LTV em 25%. Pequena melhora = impacto enorme." },
  { memory_type: "fact", relevance: 0.9,
    content: "Hormozi Onboarding: primeiros 30 dias determinam se o cliente fica 30 meses. Dia 0: quick win em 24h. Dias 1-7: primeira conquista. Dias 15-30: resultado significativo + check-in." },
  { memory_type: "fact", relevance: 0.85,
    content: "Hormozi Core 4 para leads: Warm Outreach (maior conversão, menor escala) → Cold Outreach → Conteúdo → Anúncios Pagos. Todo negócio usa algum desses 4." },
  { memory_type: "fact", relevance: 0.85,
    content: "Hormozi Launch — MVO (Minimum Viable Offer): venda antes de construir. O mercado vota com a carteira, não com palavras. 'Você compraria?' não significa nada. Pré-venda significa tudo." },

  // ── COPY MASTER: PERSUASÃO E VENDAS ──
  { memory_type: "fact", relevance: 0.95,
    content: "Dan Kennedy — 10 Regras do Direct Response: sempre ter uma oferta, sempre ter urgência, instruções claras, rastreamento, seguimento agressivo, copy forte, resultados acima de tudo" },
  { memory_type: "fact", relevance: 0.9,
    content: "Dan Kennedy: follow-up pode dobrar ou triplicar vendas. A maioria das vendas acontece no 5º ao 12º contato. Abandono precoce é o maior desperdício de marketing." },
  { memory_type: "fact", relevance: 0.85,
    content: "Oren Klaff — Frame Control: quem controla o frame controla o negócio. Nunca entre como vendedor desesperado. Você é o prêmio — o cliente deve se qualificar para trabalhar com você." },
  { memory_type: "fact", relevance: 0.85,
    content: "Oren Klaff — Crocodile Brain: a mensagem chega primeiro no cérebro reptiliano (ameaça? entediante? posso ignorar?). Se passar, vai para o límbico (emoções), depois para o neocórtex (lógica)." },

  // ── STORYTELLING: VENDAS NARRATIVAS ──
  { memory_type: "fact", relevance: 0.9,
    content: "Kindra Hall — História do Cliente para vendas: Antes (mundo com o problema) → Durante (descoberta da solução) → Depois (realidade transformada). Mais poderoso que qualquer testemunho genérico." },
  { memory_type: "fact", relevance: 0.85,
    content: "Kindra Hall — Story Gap: qual história o cliente conta para si mesmo agora? Qual história você quer que ele conte? O gap entre as duas é onde a venda acontece." },

  // ── DATA SQUAD: MÉTRICAS E SUCESSO ──
  { memory_type: "fact", relevance: 1.0,
    content: "Nick Mehta — Lei #7 do Customer Success: obsessão com Time-to-Value. Cada dia sem valor é risco de churn. Para Mestre Inova: professor deve corrigir algo no dia 1 do trial." },
  { memory_type: "fact", relevance: 0.95,
    content: "Nick Mehta — Lei #4: monitorar saúde do cliente relentlessly. Cliente saudável não churna. Health score deve ser revisado semanalmente. Deterioração = intervenção imediata." },
  { memory_type: "fact", relevance: 0.9,
    content: "Nick Mehta — Lei #1: venda para o cliente certo. CS começa ANTES da venda. Cliente fora do ICP que assina é o pesadelo do CS — churna e ainda reclama." },
  { memory_type: "fact", relevance: 0.9,
    content: "Peter Fader — CLV: distribuição de valor SEMPRE é assimétrica. Pequeno % de clientes gera a maioria da receita. Identifique e priorize os de alto valor." },
  { memory_type: "fact", relevance: 0.85,
    content: "Sean Ellis — Produto-Market Fit: pergunte 'O quanto ficaria desapontado se não pudesse mais usar este produto?' Se >40% responde 'Muito' → PMF encontrado." },
  { memory_type: "fact", relevance: 0.85,
    content: "Avinash Kaushik — See-Think-Do-Care: audiência See (sem intenção) → Think (considerando) → Do (pronta pra comprar) → Care (clientes ativos). Cada etapa pede conteúdo e métricas diferentes." },
  { memory_type: "fact", relevance: 0.8,
    content: "Kaushik: nunca medir audiência See com métricas de Do (conversão). Cada cluster tem seus próprios KPIs. Medir tudo igual = conclusões erradas sempre." },

  // ── PREFERÊNCIAS DO USUÁRIO ──
  { memory_type: "preference", relevance: 0.95,
    content: "Usuário (José) prefere scripts de vendas prontos para copiar com [VARIÁVEL] entre colchetes. Fundador sem exp. em vendas — precisa de clareza e praticidade, não teoria." },
];

// ─────────────────────────────────────────────
// EXECUÇÃO
// ─────────────────────────────────────────────
async function injectForAgent(workspaceId, workspaceName, agentType, memories) {
  // Limpa memórias antigas do tipo "fact" para evitar duplicatas
  await supabase
    .from("agent_memories")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("agent_type", agentType)
    .eq("memory_type", "fact");

  const rows = memories
    .filter(m => m.memory_type === "fact")
    .map(m => ({
      workspace_id: workspaceId,
      agent_type: agentType,
      memory_type: m.memory_type,
      content: m.content.slice(0, 500),
      relevance: m.relevance,
      expires_at: null,
    }));

  // Preferences: apenas insere (não limpa — podem ter sido aprendidas organicamente)
  const prefRows = memories
    .filter(m => m.memory_type === "preference")
    .map(m => ({
      workspace_id: workspaceId,
      agent_type: agentType,
      memory_type: m.memory_type,
      content: m.content.slice(0, 500),
      relevance: m.relevance,
      expires_at: null,
    }));

  const allRows = [...rows, ...prefRows];
  const { error } = await supabase.from("agent_memories").insert(allRows);

  if (error) {
    console.error(`  ❌ Erro em ${agentType}: ${error.message}`);
  } else {
    console.log(`  ✅ ${allRows.length} memórias → ${agentType === "content" ? "Vox" : "Nexus"}`);
  }
}

async function main() {
  console.log("🔍 Buscando workspaces...\n");

  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("id, name");

  if (error || !workspaces?.length) {
    console.error("Erro ou nenhum workspace encontrado:", error?.message);
    process.exit(1);
  }

  console.log(`✅ ${workspaces.length} workspace(s) encontrado(s)\n`);

  for (const ws of workspaces) {
    console.log(`📦 Workspace: ${ws.name}`);
    await injectForAgent(ws.id, ws.name, "content", VOX_MEMORIES);
    await injectForAgent(ws.id, ws.name, "sales", NEXUS_MEMORIES);
    console.log("");
  }

  console.log(`🎉 Concluído!`);
  console.log(`   Vox: ${VOX_MEMORIES.length} memórias (Copy Master, Hormozi Hooks/Content, Storytelling, Brand Squad)`);
  console.log(`   Nexus: ${NEXUS_MEMORIES.length} memórias (Hormozi Offers/Sales/Retention, Data Squad, Copy Master)`);
}

main().catch(console.error);
