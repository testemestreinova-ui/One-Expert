/**
 * inject-premium-squads.mjs
 * Injeta memórias de 3 squads premium nos agentes Vox (content) e Nexus (sales):
 *   - mestreinova-criativo → Vox: psicologia do professor, estrutura de carrossel, voz da marca
 *   - advisory-board      → Nexus: Sinek (Golden Circle), Brown (vulnerabilidade), Lencioni (disfunções)
 *   - movement            → Vox: manifesto, identidade de tribo, construção de movimento
 *
 * Uso: node scripts/inject-premium-squads.mjs
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
// MEMÓRIAS ADICIONAIS DO VOX (conteúdo + movimento)
// ─────────────────────────────────────────────
const VOX_PREMIUM_MEMORIES = [

  // ── MESTREINOVA CRIATIVO: PSICOLOGIA DO PROFESSOR ──
  { memory_type: "fact", relevance: 1.0,
    content: "Psicologia do professor brasileiro: 40 alunos/turma, 3 empregos, pouco tempo. Desconfia de modismos mas quer soluções PRÁTICAS. Não quer ser herói romantizado — quer ser reconhecido como profissional." },
  { memory_type: "fact", relevance: 0.95,
    content: "Dores profundas do professor: ensina como foi ensinado (sabe que não basta), quer engajar alunos sem competir com o celular, quer inovar mas falta tempo/apoio, formação não preparou para a sala real." },
  { memory_type: "fact", relevance: 0.95,
    content: "Aspirações do professor: alunos engajados e curiosos, dominar metodologias que funcionam de verdade, ser o professor que os alunos vão lembrar, crescer com segurança financeira, comunidade de educadores inovadores." },
  { memory_type: "fact", relevance: 0.9,
    content: "Gatilhos de parada no scroll para professores: reconhecimento ('isso acontece comigo'), promessa prática ('vou usar na segunda-feira'), número concreto ('5 estratégias em 3 passos'), contraste (tradicional X ativo), provocação respeitosa ('o que ninguém te ensinou')." },

  // ── MESTREINOVA CRIATIVO: PILARES E JORNADA DE CONTEÚDO ──
  { memory_type: "fact", relevance: 0.95,
    content: "5 Pilares de conteúdo Mestreinova: 1) Metodologias ativas (core, alta freq.) 2) Prática docente (gera identificação) 3) Desenvolvimento profissional (posiciona marca) 4) Inspiração com substância (viraliza) 5) Mestreinova por dentro (baixa freq., constrói confiança)." },
  { memory_type: "fact", relevance: 0.9,
    content: "Jornada de conteúdo do professor — Topo: problemas comuns, mitos, dados surpreendentes (CTA: salva). Meio: metodologias, tutoriais, casos de sucesso (CTA: comenta/segue). Fundo: transformação, o que vai aprender, por que agora (CTA: link na bio)." },
  { memory_type: "fact", relevance: 0.85,
    content: "Sazonalidade educacional para conteúdo: início de ano (planejamento, começar diferente), meio de ano (engajamento no 2º sem.), volta às aulas (novo ciclo), fim de ano (reflexão, celebrar, descansar)." },

  // ── MESTREINOVA CRIATIVO: ESTRUTURA DE CARROSSEL ──
  { memory_type: "fact", relevance: 1.0,
    content: "Formatos de carrossel Mestreinova: PAS (7 slides: hook→agitação×2→virada→solução×2→CTA) | Lista prática (hook com número+promessa → itens → síntese) | Antes/Depois (6 slides) | História com dados (7 slides, autoridade) | Mini-tutorial (5-8 slides, alta taxa de save)." },
  { memory_type: "fact", relevance: 0.95,
    content: "Hook irresistível de carrossel: UMA ideia, tensão imediata, especificidade. Fórmulas: '[N] + [adjetivo forte] + [resultado]' | 'A verdade sobre [tema]' | 'Por que [coisa comum] não funciona mais' | 'O que ninguém te ensinou sobre [tema]' | 'Se você [situação], você precisa ver isso'." },
  { memory_type: "fact", relevance: 0.9,
    content: "Princípio de transição entre slides: cada slide deve criar razão para ver o próximo. Técnicas: pergunta sem resposta (respondida no próximo), lista incompleta, dado que precisa de contexto, afirmação que desafia crença do professor." },
  { memory_type: "fact", relevance: 0.85,
    content: "CTA de carrossel Mestreinova: 'Salva para usar na sua próxima aula' | 'Comenta: qual dessas você já usa?' | 'Marca um colega que precisa ver isso' | 'Baixa o material no link da bio'. CTA deve soar como conselho de amigo, não como anúncio." },

  // ── MESTREINOVA CRIATIVO: VOZ DA MARCA ──
  { memory_type: "fact", relevance: 0.95,
    content: "Voz da marca Mestreinova: inteligente mas humana, prática mas inspiradora, inovadora mas acessível. USA: 'professor' (não 'educador'), 'aula' (não 'experiência de aprendizagem'), 'na prática', 'segunda-feira' como referência temporal." },
  { memory_type: "fact", relevance: 0.9,
    content: "O que EVITAR na voz Mestreinova: jargão ('protagonismo estudantil', 'práxis pedagógica'), promessas vagas ('transforme sua aula'), julgamento do professor ('errou', 'falhou'), linguagem corporativa ('stakeholders', 'entregar valor')." },
  { memory_type: "fact", relevance: 0.85,
    content: "Identidade visual Mestreinova para conteúdo: #001F21 (slides de autoridade/CTA), #2ECC71 (energia/ação/abertura), Young Serif (headlines — personalidade), Urbanist (corpo — clareza). Símbolo foguete+lápis = inovação + aprendizado." },

  // ── MOVEMENT: MANIFESTO E IDENTIDADE DE TRIBO ──
  { memory_type: "fact", relevance: 1.0,
    content: "Anatomia de manifesto eficaz: 1) Declaração da Realidade (nomeia a tensão que todos sentem mas ninguém fala) 2) Declaração de Crenças ('Nós acreditamos...') 3) Nomeação do Inimigo (sistema/ideologia, NUNCA grupo demográfico) 4) Visão de Futuro 5) Chamado à Identidade 6) Chamado à Ação 7) Declaração de Fechamento (memorizável, tatuável)." },
  { memory_type: "fact", relevance: 0.95,
    content: "Regra do Inimigo em manifestos e movimento: o inimigo DEVE ser um sistema, mentalidade ou condição — NUNCA um grupo de pessoas. 'O sistema que mede valor pelo produto' é inimigo válido. 'Os professores tradicionais' NÃO é. Inimigo vago vs. inimigo específico e reconhecível no cotidiano." },
  { memory_type: "fact", relevance: 0.9,
    content: "Estrutura 'We Believe' para manifesto: uso repetitivo de 'Nós acreditamos...' como dispositivo retórico. Inclua ao menos UMA crença herética — a que desconforta o mainstream. Ordene: mais universal → mais provocador. Cada crença cabe em uma frase." },
  { memory_type: "fact", relevance: 0.85,
    content: "Arco narrativo de movimento: Origem (ferida → despertar → encontro → declaração) + Jornada do Membro (antes: tensão sem nome → encontro com movimento → travessia → transformação → missão). Todo membro deve conseguir contar sua história com esse arco." },
  { memory_type: "fact", relevance: 0.8,
    content: "Construção de identidade de tribo: símbolos reconhecíveis, rituais de entrada, linguagem própria (vocabulário que distingue insiders), mitologia fundadora, inimigo compartilhado como agente de coesão. A identidade precede a lealdade." },
];

// ─────────────────────────────────────────────
// MEMÓRIAS ADICIONAIS DO NEXUS (advisory-board)
// ─────────────────────────────────────────────
const NEXUS_PREMIUM_MEMORIES = [

  // ── SIMON SINEK: GOLDEN CIRCLE E LIDERANÇA ──
  { memory_type: "fact", relevance: 1.0,
    content: "Simon Sinek — Golden Circle: WHY (propósito — cérebro límbico, SENTIDO, não articulado) → HOW (valores/princípios) → WHAT (produtos/serviços — neocórtex, racional). Líderes inspiradores comunicam de dentro para fora. 'As pessoas não compram o que você faz; compram POR QUÊ você faz'." },
  { memory_type: "fact", relevance: 0.95,
    content: "Sinek: manipulação vs. inspiração. Manipulação (preço, promoção, medo, novidade) funciona a curto prazo mas não constrói lealdade. Inspiração (WHY claro que ressoa) cria evangelistas que recrutam outros, reduz sensibilidade a preço, gera crescimento sustentável." },
  { memory_type: "fact", relevance: 0.9,
    content: "Sinek — Jogo Infinito: negócio não tem fim fixo. Jogador infinito precisa de: Just Cause (afirmativa, inclusiva, a serviço, resiliente, idealista) + Equipes de confiança + Rivais Dignos de Estudo + Flexibilidade Existencial + Coragem de Liderar." },
  { memory_type: "fact", relevance: 0.85,
    content: "Sinek — Celery Test: toda decisão estratégica filtrada pelo WHY. 'Isso avança nosso propósito?' Sim → faça. Não → recuse, não importa quão lucrativo pareça. Clareza do WHY torna cada decisão óbvia." },
  { memory_type: "fact", relevance: 0.85,
    content: "Sinek — Círculo de Segurança: líderes criam ambiente onde pessoas se sentem protegidas de ameaças externas. SEALs preferem desempenho médio com ALTA confiança a alto desempenho com BAIXA confiança. Desempenho se treina; confiança não se força." },

  // ── BRENÉ BROWN: VULNERABILIDADE E LIDERANÇA CORAJOSA ──
  { memory_type: "fact", relevance: 1.0,
    content: "Brené Brown: vulnerabilidade NÃO é fraqueza — é incerteza + risco + exposição emocional. É a medida mais precisa de coragem. Birthplace de amor, pertencimento, alegria, criatividade. Líderes que se blindam criam culturas de medo; líderes que modelam vulnerabilidade criam inovação e confiança." },
  { memory_type: "fact", relevance: 0.95,
    content: "Brown — Vergonha vs. Culpa: vergonha = 'Sou ruim' (foco no self, destrutivo, correlacionado com adição/agressão/depressão). Culpa = 'Fiz algo ruim' (foco no comportamento, adaptativo, leva a reparar). Líderes que usam vergonha para motivar criam desengajamento e violações éticas." },
  { memory_type: "fact", relevance: 0.9,
    content: "Brown — BRAVING Trust (confiança em 7 elementos): Boundaries (respeita limites), Reliability (faz o que diz), Accountability (admite erros), Vault (guarda confidências), Integrity (coragem sobre conforto), Non-judgment (pode pedir ajuda sem ser julgado), Generosity (interpretação generosa das ações)." },
  { memory_type: "fact", relevance: 0.85,
    content: "Brown — Liderança Corajosa vs. Blindada: armored (protege ego) vs. daring (cultiva comprometimento e propósito compartilhado). Líderes corajosos nomeiam e normalizam o medo coletivo em vez de usar medo e incerteza como armas." },

  // ── PATRICK LENCIONI: DISFUNÇÕES E SAÚDE ORGANIZACIONAL ──
  { memory_type: "fact", relevance: 1.0,
    content: "Lencioni — 5 Disfunções da Equipe (pirâmide bottom-up): 1) AUSÊNCIA DE CONFIANÇA (medo de vulnerabilidade) → 2) MEDO DE CONFLITO (debates artificiais) → 3) FALTA DE COMPROMETIMENTO (ambiguidade) → 4) FUGA DE RESPONSABILIDADE → 5) FALTA DE ATENÇÃO A RESULTADOS (ego/status acima dos objetivos)." },
  { memory_type: "fact", relevance: 0.95,
    content: "Lencioni — Confiança baseada em vulnerabilidade: BASE de tudo. O líder vai PRIMEIRO — admite erros, pede ajuda, demonstra fraquezas. Sem isso, o restante da pirâmide desmorona. Não se constrói fingindo que tudo está bem." },
  { memory_type: "fact", relevance: 0.9,
    content: "Lencioni — Saúde organizacional supera inteligência: empresa smart+saudável vence empresa só smart. Quatro disciplinas: 1) Construir equipe coesa de liderança 2) Criar clareza 3) Hipercomunicar clareza 4) Reforçar clareza em sistemas (contratação, RH, reuniões)." },
  { memory_type: "fact", relevance: 0.85,
    content: "Lencioni — Jogador de Equipe Ideal: HUMILDE (sem ego excessivo) + FAMINTO (autodisciplinado, trabalha duro) + INTELIGENTE (interpessoal — lê pessoas e situações). Perigoso quando falta uma das três: apenas humilde/faminto = acidental devastador; apenas inteligente = político charmoso." },
];

// ─────────────────────────────────────────────
// EXECUÇÃO
// ─────────────────────────────────────────────
async function injectForAgent(workspaceId, agentType, memories, label) {
  // Deleta apenas memórias de squad premium (evita apagar as já injetadas pelos outros scripts)
  // Usamos um padrão de identificação: inserimos com tag no conteúdo NÃO — melhor abordagem:
  // deletamos apenas as que vamos re-inserir agora (idempotente por relevance+content match)
  // Estratégia: delete by agent_type + memory_type + relevance combo não é safe.
  // Em vez disso, fazemos upsert — ou simplesmente inserimos (o script pode ser rodado 1x).
  // Para idempotência, deletamos por agent_type + memory_type apenas se for a primeira vez.
  // Optamos por insert direto — script é idempotente via execução única.

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
    await injectForAgent(ws.id, "content", VOX_PREMIUM_MEMORIES, "Vox (criativo + movimento)");
    await injectForAgent(ws.id, "sales", NEXUS_PREMIUM_MEMORIES, "Nexus (advisory board)");
    console.log("");
  }

  console.log("🎉 Concluído!");
  console.log(`   Vox +${VOX_PREMIUM_MEMORIES.length} memórias (Mestreinova Criativo + Movement)`);
  console.log(`   Nexus +${NEXUS_PREMIUM_MEMORIES.length} memórias (Advisory Board: Sinek, Brown, Lencioni)`);
}

main().catch(console.error);
