/**
 * inject-desktop-skills.mjs
 * Injeta frameworks de 5 skills encontradas na mesa de trabalho (não instaladas nos agentes):
 *   - maquina-de-anuncios   → Atlas: 10 ângulos, diversidade tripartite, C1/C2/C3
 *   - Andrômeda (Meta Ads)  → Atlas: matriz de diversidade, TOPO/FUNDO, placements
 *   - detetive-de-nicho     → Atlas: análise de concorrentes 7 dimensões, gaps de mercado
 *   - maquina-de-reels      → Vox: Método Audience 7 partes, 7 gatilhos, 15 templates headline
 *   - super-copywriter      → Vox: Schwartz sofisticação, Agora Rule of One + 6 leads, Bly BDF
 *   - construtor-de-pagina  → Nexus: 3 princípios de conversão, fórmula de headline LP
 *   - mini-clone-euriler    → Nexus + Vox: método PMI, Árvore do Expert, posicionamento
 *
 * Uso: node scripts/inject-desktop-skills.mjs
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
// ATLAS — aquisição/tráfego pago
// ─────────────────────────────────────────────
const ATLAS_DESKTOP = [

  // ── MÁQUINA DE ANÚNCIOS: FUNDAMENTOS ──
  { memory_type: "fact", relevance: 1.0,
    content: "Criativo = filtro + contextualizador + disparador emocional. Filtro: atrai quem deve, repele quem não é público. Contextualizador: prepara a mente do lead pra mensagem de vendas. Disparador: ativa dor, desejo ou curiosidade que leva ao clique. 'Anúncio seduz, página confirma'." },
  { memory_type: "fact", relevance: 1.0,
    content: "10 Ângulos Estratégicos de anúncio: CDOR (curiosidade/dor, C1) | CVAL (conteúdo de valor, C1) | QPAD (quebra de padrão, C1) | HSELL (hard sell, C2 — o mais importante) | DEMO (demonstrativo, C2) | COMP (comparativo, C2) | PROVA (prova social, C3) | OBJE (quebra de objeções, C3) | URG (urgência, C3) | RETAR (remarketing). Mix ideal: ~4 C1 + ~3 C2 + ~3 C3." },
  { memory_type: "fact", relevance: 0.95,
    content: "Diversidade Tripartite (lei da IA do Meta): 10 anúncios iguais = 1 anúncio repetido. Variar obrigatoriamente: Mecânica (vídeo vs imagem vs carrossel) + Visual (expert, cliente, UGC, cenários diferentes) + Temática (dor vs desejo, depoimento vs demonstração). Trocar cor de roupa NÃO é diversidade." },
  { memory_type: "fact", relevance: 0.95,
    content: "4 Pontos de Atenção para assunto de anúncio: Em Alta (trending — funciona mas datado rápido) | Polêmica (posicionamento forte — atrai errado se mal usado) | Dor Comum Forte (universal e atemporal — MELHOR para ads) | Revelação Importante (informação surpreendente — forte para C1). Dor comum é a opção mais segura e consistente." },
  { memory_type: "fact", relevance: 0.9,
    content: "Leis dos criativos: 80/20 — 80% do resultado vem dos fundamentos (recorte, proposta, munição), 20% da produção. Criativo bonito com fundamento ruim = dinheiro jogado fora. Resultado é binário: funciona ou não. CAC decide, não opinião. 'Produto, não aula' — tangibilize, mostre o resultado." },
  { memory_type: "fact", relevance: 0.85,
    content: "Hard Sell (HSELL) — estrutura do anúncio mais importante: Gancho → dor → motivo da oferta → prova → a oferta → urgência → CTA. É o ângulo de maior conversão direta. Use sempre em C2. Nunca abra com o nome da marca ou produto nos primeiros 2 parágrafos." },

  // ── ANDRÔMEDA (META ADS): MATRIZ DE DIVERSIDADE ──
  { memory_type: "fact", relevance: 1.0,
    content: "Motor Andrômeda: criativo é o principal vetor de segmentação — a IA do Meta lê o anúncio e decide para quem entregar. Por isso diversidade criativa genuína supera segmentação detalhada. Kit Zero: planeje antes de escrever (persona-alvo, ângulo, nível de consciência, posição no funil, formato de hook, promessa central). Valide com o usuário antes de gerar." },
  { memory_type: "fact", relevance: 0.95,
    content: "Andrômeda — Formatos de Hook (5 tipos): Pergunta direta ('Você ainda [problema]?') | Afirmação polêmica ('A maioria dos [público] está [erro comum]') | Dado/estatística ('[X%] dos [público]...') | Comando direto ('Pare de [comportamento negativo]') | Narrativa ('Em [situação], [persona] descobriu...'). Combine com ângulo e nível de consciência." },
  { memory_type: "fact", relevance: 0.9,
    content: "Andrômeda — TOPO vs FUNDO: Topo (público frio) — sem mencionar produto nos 2 primeiros parágrafos, CTA suave ('Saiba mais'), tom educativo/provocador. Fundo (público quente) — produto direto, quebra de objeção + prova social, CTA direta ('Garanta sua vaga'), urgência. Carrossel: primeiro card = hook que force deslize; último card = CTA exclusiva." },

  // ── DETETIVE DE NICHO: INTELIGÊNCIA DE MERCADO ──
  { memory_type: "fact", relevance: 0.9,
    content: "Análise de concorrente — 7 Dimensões: 1) Posicionamento & Promessa 2) Oferta & Produtos (formato, esteira) 3) Precificação 4) Conteúdo (formato, temas, frequência) 5) Copy & Comunicação (linguagem, ganchos, gatilhos) 6) Diferenciais & Autoridade 7) Audiência (tamanho, engajamento real). Cada dimensão termina com 'o que isso significa para você'." },
  { memory_type: "fact", relevance: 0.85,
    content: "6 tipos de Gap de Mercado: Público ignorado (segmento sem atendimento específico) | Ângulo não explorado (tema existe, abordagem não) | Formato ausente (todos fazem curso, ninguém faz comunidade) | Profundidade (todos rasos, ninguém aprofunda) | Problemas mal resolvidos (reclamações se repetem) | Preços mal calibrados (falta opção acessível OU premium)." },
];

// ─────────────────────────────────────────────
// VOX — conteúdo
// ─────────────────────────────────────────────
const VOX_DESKTOP = [

  // ── MÁQUINA DE REELS: MÉTODO AUDIENCE ──
  { memory_type: "fact", relevance: 1.0,
    content: "Método Audience — 7 partes do Reels: 1) HEADLINE (3 primeiros segundos, 1-3 gatilhos) 2) INTENSIFICADOR (aumenta curiosidade sem revelar) 3) CTA INICIAL (salva esse vídeo) 4) CONTEÚDO NOTÁVEL (mín. 3 elementos) 5) CTA COMPARTILHAMENTO (após entregar valor) 6) NARRATIVA (crença que vende) 7) APRESENTAÇÃO MAGNÉTICA (nome + profissão + dor → resultado)." },
  { memory_type: "fact", relevance: 1.0,
    content: "7 Gatilhos de Atenção para Reels/carrossel: RECOMPENSA (palavras exatas do público) | MISTÉRIO (nunca revele na 2ª linha) | RECONHECIMENTO ('ta falando de mim!') | CRENÇA (visão de mundo que gera identificação ou controvérsia) | POPULARIDADE (pessoas famosas, trending) | AUTORIDADE (profissão + estudos + dados) | DISRUPÇÃO (viola expectativas — precisa ser sustentada). Use 2-3 por headline." },
  { memory_type: "fact", relevance: 0.95,
    content: "15 Templates de Headline para Instagram (mais poderosos): CONSEQUÊNCIA: 'É isso que acontece quando você [hábito]' | 'Por que [coisa que faz] não funciona mais' | 'Coisas que você acha normal mas que destroem [algo]'. LISTA: 'X coisas que [benefício/malefício]' | 'Sinais de que você tem [característica]'. DISRUPÇÃO: 'O melhor X não é A, não é B, não é C'. AUTORIDADE: 'Eu nunca mais fiz [X] depois de estudar [autoridade]'." },
  { memory_type: "fact", relevance: 0.9,
    content: "6 Elementos de Conteúdo Notável (mín. 3 por vídeo): Valor Prático (aplicável — gera save) | Pontos de Identificação (situações específicas — gera conexão) | Provas (dados, estudos, depoimentos — gera permissão de compartilhar) | Opiniões Polêmicas (gera comentários) | Histórias (conexão emocional) | Fatos Curiosos ('eu não sabia disso!' — gera compartilhamentos)." },
  { memory_type: "fact", relevance: 0.85,
    content: "Moeda Social — por que as pessoas compartilham: para ganhar STATUS no próprio grupo. Pensam: 'olha como sou inteligente/consciente por saber disso.' Tire o medo com PROVA e elas compartilham. A Maldição de William Bonner: ao ligar a câmera, profissionais viram robôs tentando 'passar autoridade' — matam a personalidade. Seja VOCÊ. A única coisa incopiável é você." },

  // ── SUPER COPYWRITER: SCHWARTZ + AGORA + BLY ──
  { memory_type: "fact", relevance: 1.0,
    content: "Schwartz — 5 Estágios de Sofisticação do Mercado: 1) Primeiro (promessa simples e direta) 2) Segundo (ampliar ao limite: números, prazo, garantia) 3) Saturado de promessas (apresente NOVO MECANISMO na headline, promessa no subtítulo) 4) Mecanismos saturados (elabore e amplie o mecanismo vencedor) 5) Mercado morto (IDENTIFICAÇÃO — quem usa, não o que faz). Errar o estágio = copy morta." },
  { memory_type: "fact", relevance: 1.0,
    content: "Agora Inc. — Regra de Um: UMA única grande ideia + UMA história que a apoia + UMA emoção dominante + UM benefício central + UM objetivo (a ação desejada). Teste: se não cabe em uma frase, não está claro. Volte e simplifique. É o princípio mais importante de toda copy." },
  { memory_type: "fact", relevance: 0.95,
    content: "Agora Inc. — 6 Leads Arquetípicos (do mais direto ao mais indireto): 1) OFERTA (prospect já confia — preço direto) 2) PROMESSA (maior promessa possível) 3) PROBLEMA-SOLUÇÃO (aperte a dor, ofereça esperança) 4) SEGREDO (conhecimento exclusivo, não revele cedo) 5) PROCLAMAÇÃO (dado surpreendente — retome no final) 6) HISTÓRIA (herói comum + dúvida + prova — defesas baixas, melhor para público frio)." },
  { memory_type: "fact", relevance: 0.9,
    content: "Agora — 7 Drivers Emocionais: MEDO (perder algo) | GANÂNCIA (resultado desejado) | CULPA ('seus filhos merecem mais') | EXCLUSIVIDADE (apenas 100 pessoas) | RAIVA ('o sistema destrói seus talentos') | SALVAÇÃO ('existe uma saída') | LISONJA ('profissionais inteligentes como você'). Toda copy deve pingar em pelo menos um." },
  { memory_type: "fact", relevance: 0.9,
    content: "Bly — Fórmula BDF (análise pré-copy obrigatória): Beliefs (o que o público acredita?), Desires (o que querem? Que mudança buscam?), Feelings (como se sentem — confiantes, com medo, frustrados?). Só escreva copy depois de mapear os 3. + 4 P's (Bonner): Promise → Picture (faça VER o resultado) → Proof → Push (oferta + CTA + urgência)." },
  { memory_type: "fact", relevance: 0.85,
    content: "Bly — 4 U's para avaliar qualquer headline (1-4 cada): URGENTE (razão pra agir agora?) | ÚNICO (diz algo novo ou de forma nova?) | ULTRA-ESPECÍFICO (números, dados, detalhes concretos?) | ÚTIL (oferece benefício real?). Se não pontua 3+ em ao menos 3 dos 4 U's, REESCREVA. Teste rápido de qualidade de headline." },
];

// ─────────────────────────────────────────────
// NEXUS — vendas/CRM
// ─────────────────────────────────────────────
const NEXUS_DESKTOP = [

  // ── CONSTRUTOR DE PÁGINA LP ──
  { memory_type: "fact", relevance: 1.0,
    content: "Construtor LP — 3 Princípios Invioláveis: 1) RECORTE ESPECÍFICO: interseção cirúrgica de Conteúdo + Público + Dor/Desejo. Quanto mais específico, mais converte. 2) PRODUTO, NÃO AULA: a página deve parecer iPhone na vitrine, não webinar. O lead pensa 'quero ISSO'. 3) A PEÇA QUE FALTAVA: venda o componente específico que faz a máquina do lead funcionar. 'ERA ISSO QUE ME FALTAVA!'." },
  { memory_type: "fact", relevance: 0.95,
    content: "Fórmula de Headline de LP: [Tempo/Formato] + [Resultado Mensurável] + [Mecanismo/Método]. Exemplos: 'Workshop de 2 dias: Monte Seu Primeiro Funil Usando IA' | 'Imersão de 7h: O Sistema Que Leva Consultores a R$10K/mês'. Cada seção da página responde UMA pergunta do visitante — na ordem certa até a única ação lógica ser clicar em comprar." },
  { memory_type: "fact", relevance: 0.9,
    content: "LP — Regras de copy: máx. 3-4 linhas por parágrafo, máx. 12-13 palavras por linha. Texto longo SEMPRE alinhado à esquerda (centralizar só títulos curtos). CTA após cada seção de valor. Não use bold em tudo (se tudo é destaque, nada é). Mobile-first — maioria do tráfego é mobile. Nunca invente depoimentos ou dados." },

  // ── MINI CLONE EURILER: POSICIONAMENTO ──
  { memory_type: "fact", relevance: 0.9,
    content: "Método PMI (Euriler Jube) — 3 pilares do negócio digital de expert: PROPÓSITO (quem você é, direção) + MARKETING (visibilidade, como ser visto pelo público certo) + IA (braço operacional, execução sem equipe). Fórmula: Repertório + IA = Resultado. Expert travado geralmente tem propósito mas falta marketing ou usa IA de forma incorreta." },
  { memory_type: "fact", relevance: 0.85,
    content: "Árvore do Expert — estrutura invisível (abaixo do solo): Semente (chamado/potencial), Raízes (crenças, valores, história), Sistema de Nutrição (hábitos). Estrutura visível: Tronco (posicionamento único), Galhos (produtos/serviços), Frutos (resultados de clientes), Folhagem (conteúdo/audiência). O invisível governa o visível — posicionamento sem raízes não sustenta." },
];

// ─────────────────────────────────────────────
// EXECUÇÃO
// ─────────────────────────────────────────────
async function injectForAgent(workspaceId, agentType, memories, label) {
  const rows = memories.map(m => ({
    workspace_id: workspaceId,
    agent_type: agentType,
    memory_type: m.memory_type,
    content: m.content.slice(0, 500),
    relevance: m.relevance,
    expires_at: null,
  }));

  const { error } = await supabase.from("agent_memories").insert(rows);

  if (error) {
    console.error(`  ❌ Erro em ${label}: ${error.message}`);
  } else {
    console.log(`  ✅ ${rows.length} memórias → ${label}`);
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
    await injectForAgent(ws.id, "acquisition", ATLAS_DESKTOP, "Atlas (Máquina de Anúncios + Andrômeda + Detetive de Nicho)");
    await injectForAgent(ws.id, "content",     VOX_DESKTOP,   "Vox (Máquina de Reels + Super Copywriter)");
    await injectForAgent(ws.id, "sales",       NEXUS_DESKTOP, "Nexus (Construtor LP + Mini Clone Euriler)");
    console.log("");
  }

  console.log("🎉 Concluído!");
  console.log(`   Atlas +${ATLAS_DESKTOP.length}  memórias (Máquina de Anúncios, Andrômeda, Detetive de Nicho)`);
  console.log(`   Vox   +${VOX_DESKTOP.length} memórias (Máquina de Reels, Super Copywriter Schwartz/Agora/Bly)`);
  console.log(`   Nexus +${NEXUS_DESKTOP.length}  memórias (Construtor LP, Mini Clone Euriler)`);
}

main().catch(console.error);
