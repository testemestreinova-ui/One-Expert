/**
 * inject-medium-squads.mjs
 * Injeta memórias de 2 squads de média prioridade:
 *   - copy-squad (23 copywriters lendários) → Vox: Ogilvy, Hopkins, Sugarman, Collier, Brunson
 *   - c-level-squad (C-suite virtual)        → Nexus: CMO (posicionamento, GTM, funil de demanda)
 *                                            → Atlas: Vision-Mission cascade, horizontes estratégicos
 *
 * Uso: node scripts/inject-medium-squads.mjs
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
// VOX — copy-squad (clássicos do copywriting)
// ─────────────────────────────────────────────
const VOX_COPY_SQUAD = [

  // ── DAVID OGILVY ──
  { memory_type: "fact", relevance: 1.0,
    content: "Ogilvy — A Grande Ideia: teste com 5 perguntas: fez você parar? Gostaria de ter pensado nisso? É única? Serve à estratégia perfeitamente? Poderia durar 30 anos? Sem Grande Ideia, o anúncio passa como barco na noite." },
  { memory_type: "fact", relevance: 0.95,
    content: "Ogilvy — Headline: 5x mais pessoas leem o headline que o body copy. Deve conter NOVIDADE, o NOME do produto, apelar ao INTERESSE DO LEITOR. Escreva 20+ opções antes de escolher. Nunca use headline 'inteligente' que não comunica." },
  { memory_type: "fact", relevance: 0.9,
    content: "Ogilvy — Imagem de marca: todo anúncio é investimento de longo prazo na personalidade da marca. Todo anúncio ou constrói ou corrói — não existe anúncio neutro. Posicionamento decide ANTES de qualquer criativo." },
  { memory_type: "fact", relevance: 0.85,
    content: "Ogilvy — Copy longa: amadores usam copy curta. Dê ao consumidor TODAS as informações. Específicos concretos vendem mais que generalidades. 'O consumidor não é idiota — ela é sua esposa. Insulta sua inteligência se acha que slogan vago persuade'." },

  // ── CLAUDE HOPKINS ──
  { memory_type: "fact", relevance: 1.0,
    content: "Claude Hopkins — Publicidade Científica: propaganda é salesmanship. Todo anúncio é julgado por UM critério: gerou vendas? Nunca decida por opinião — teste. 'Quase qualquer pergunta pode ser respondida de forma barata e definitiva por uma campanha de teste'." },
  { memory_type: "fact", relevance: 0.95,
    content: "Hopkins — Preemptive Claim: declare primeiro um fato comum do setor e o possua. A Schlitz sterilizava garrafas com vapor — toda cervejaria fazia, mas a Schlitz disse PRIMEIRO. Resultado: de 5º para 1º em vendas nos EUA. Você não precisa ser único — só o primeiro a falar." },
  { memory_type: "fact", relevance: 0.9,
    content: "Hopkins — Especificidade vende: afirmações vagas são inúteis. 'A melhor salsa' = nada. 'Feita com tomates maduros da Califórnia' = persuasão. Substitua CADA adjetivo por um fato. Substitua CADA generalidade por um número." },

  // ── JOE SUGARMAN ──
  { memory_type: "fact", relevance: 1.0,
    content: "Joe Sugarman — Slippery Slide: o leitor deve ser tão compelido que não consegue parar de ler. TODA FUNÇÃO de cada elemento (headline, subtítulo, foto, legenda) é uma única coisa: levar à primeira frase. A função da primeira frase é levar à segunda. E assim por diante." },
  { memory_type: "fact", relevance: 0.95,
    content: "Sugarman — Seeds of Curiosity: plante loops abertos ao longo do copy. 'Mas tem mais...' | 'Mas vou explicar isso em um momento...' | 'E aqui é onde fica interessante...' | 'O que aconteceu a seguir chocou todos...' Nunca satisfaça a curiosidade antes do fechamento." },
  { memory_type: "fact", relevance: 0.9,
    content: "Sugarman — 30 Gatilhos Psicológicos: curiosidade (mais poderoso para manter leitura), sentimento de posse (mentalmente 'compre' antes de comprar), honestidade (admitir uma falha gera MAIS confiança que qualquer afirmação), urgência, exclusividade, especificidade (detalhes precisos aumentam credibilidade)." },
  { memory_type: "fact", relevance: 0.85,
    content: "Sugarman — Venda o CONCEITO, não o produto: nunca venda o produto em si — venda a ideia por trás dele. BluBlocker não era óculos escuros — era 'experiência visual aprimorada, ver o mundo como nunca antes'. O conceito é a ideia emocional/intelectual que torna o produto irresistível." },

  // ── ROBERT COLLIER ──
  { memory_type: "fact", relevance: 1.0,
    content: "Robert Collier — Princípio da Conversa: 'Sempre entre na conversa que já está acontecendo na mente do prospecto'. O leitor NÃO está esperando seu anúncio — está no meio da vida dele. Comece onde ELE está, não onde você quer que ele esteja. PIOR abertura: começar com o que o produto É." },
  { memory_type: "fact", relevance: 0.95,
    content: "Collier — Mental Movie: grande copy não informa — cria um filme mental vívido. O leitor deve VER a si mesmo desfrutando o benefício, SENTIR as emoções da transformação, EXPERIMENTAR antes de comprar. Afirmações abstratas não fazem nada. Imagens concretas criam o filme." },
  { memory_type: "fact", relevance: 0.9,
    content: "Collier — Fórmula de 6 etapas: 1) Abertura (entra na conversa) 2) Descrição (pinta o mental movie) 3) Motivo (por que agir agora) 4) Prova (remove razões para dizer não) 5) Snapper (o que perdem sem agir — perda > ganho) 6) Fechamento (ação clara e sem fricção)." },

  // ── RUSSELL BRUNSON ──
  { memory_type: "fact", relevance: 1.0,
    content: "Russell Brunson — Value Ladder: todo negócio precisa de escada de valor — níveis crescentes de valor e preço. Atraia com oferta gratuita/barata e ascenda clientes naturalmente ao ticket mais alto. Sem Value Ladder, você depende de cada venda individual. Com ela, cada cliente tem potencial ascendente." },
  { memory_type: "fact", relevance: 0.95,
    content: "Brunson — Hook-Story-Offer: todo marketing precisa de: HOOK (para o scroll, interrompe o padrão — headline, imagem, primeira linha) → STORY (constrói conexão emocional e desejo via Epiphany Bridge) → OFFER (não só o produto — o STACK: tudo que recebem, bônus, garantia, urgência)." },
  { memory_type: "fact", relevance: 0.9,
    content: "Brunson — Epiphany Bridge: pessoas não compram por lógica — compram por emoção e justificam com lógica. A história que dá ao prospecto o mesmo 'momento eureka' que você teve. Estrutura: backstory → desejo → obstáculo → epifania → revelação → transformação → novo caminho." },
];

// ─────────────────────────────────────────────
// NEXUS — c-level-squad (CMO + estratégia)
// ─────────────────────────────────────────────
const NEXUS_CLEVEL = [

  // ── CMO ARCHITECT: POSICIONAMENTO E GTM ──
  { memory_type: "fact", relevance: 1.0,
    content: "CMO — STP Framework: Segmentação (dividir mercado em grupos) → Targeting (selecionar segmento) → Posicionamento (como ser percebido na mente do target). Template: 'Para [cliente-alvo] que [necessidade], [marca] é o [categoria] que [benefício-chave] porque [razão para acreditar]'." },
  { memory_type: "fact", relevance: 0.95,
    content: "CMO — Posicionamento eficaz precisa ser: Diferenciado (claramente distinto das alternativas) + Crível (você pode entregar) + Relevante (o target se importa) + Sustentável (concorrentes não copiam facilmente). Falta qualquer um = posicionamento fraco." },
  { memory_type: "fact", relevance: 0.9,
    content: "CMO — Go-to-Market: não lance em todo lugar — escolha 2-3 canais onde seu target JÁ VIVE e domine-os. Pré-lançamento (8-12 semanas): validação de mensagem, seleção de canal. Lançamento: multi-canal coordenado. Pós-lançamento: loops rápidos de feedback, dobrar no que funciona." },
  { memory_type: "fact", relevance: 0.9,
    content: "CMO — Funil de Demanda: Awareness (impressões, alcance) → Interest (lead magnets, email) → Consideration (trials, cases, demos — aqui Mestre Inova é forte) → Decision (suporte à venda, ROI calculator) → Advocacy (indicação, comunidade). Cada estágio pede táticas e métricas distintas." },
  { memory_type: "fact", relevance: 0.85,
    content: "CMO — Estratégia de canal: Owned (site, email, app, comunidade) + Earned (PR, boca a boca, reviews) + Paid (anúncios, influencers) + Shared (redes sociais, UGC). Owned é o mais valioso a longo prazo — nenhum algoritmo pode te tirar seu email list." },

  // ── VISION CHIEF: ESTRATÉGIA E VISÃO ──
  { memory_type: "fact", relevance: 0.9,
    content: "Vision Chief — Cascata Visão-Missão-Estratégia: Visão (futuro ambicioso 10+ anos) → Missão (papel da empresa) → Estratégia (abordagem 3-5 anos) → Objetivos (resultados anuais mensuráveis) → Iniciativas (blocos trimestrais) → Métricas (prova semanal). Toda decisão deve rastrear até a Visão." },
  { memory_type: "fact", relevance: 0.85,
    content: "Vision Chief — 3 Horizontes: H1 (0-18 meses: proteger e expandir receita core) + H2 (18-36 meses: próximos motores de crescimento) + H3 (36-60 meses: apostas transformacionais). Nunca sacrifique H1 por H3, mas nunca ignore H3. O H2 é onde a maioria das empresas falha — exige paciência e convicção." },
  { memory_type: "fact", relevance: 0.8,
    content: "Vision Chief — Cultura como ativo estratégico: Valores (o que acreditamos) + Comportamentos (o que fazemos) + Rituais (como reforçamos) + Narrativas (o que contamos) + Incentivos (o que recompensamos). Anti-padrão fatal: recompensar performance individual enquanto prega trabalho em equipe." },
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
    await injectForAgent(ws.id, "content", VOX_COPY_SQUAD, "Vox (copy-squad: Ogilvy, Hopkins, Sugarman, Collier, Brunson)");
    await injectForAgent(ws.id, "sales",   NEXUS_CLEVEL,   "Nexus (c-level: CMO + Vision Chief)");
    console.log("");
  }

  console.log("🎉 Concluído!");
  console.log(`   Vox   +${VOX_COPY_SQUAD.length} memórias (Copy Squad — 5 copywriters clássicos)`);
  console.log(`   Nexus +${NEXUS_CLEVEL.length} memórias (C-Level — CMO + Vision Chief)`);
}

main().catch(console.error);
