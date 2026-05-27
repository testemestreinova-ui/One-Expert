/**
 * Script: inject-memories.mjs
 * Injeta memórias do squad Traffic Masters (metodologia Pedro Sobral)
 * no agente Atlas (acquisition) para todos os workspaces existentes.
 *
 * Uso: node scripts/inject-memories.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SOBRAL_MEMORIES = [
  // FATOS — metodologia de tráfego
  {
    memory_type: "fact",
    content: "Metodologia Sobral: 3 tipos essenciais de campanha — Criação de Audiência, Captação de Leads, Geração de Vendas",
    relevance: 1.0,
  },
  {
    memory_type: "fact",
    content: "Estrutura de campanha ideal: 4 a 8 conjuntos de anúncios por campanha. Acima de 12 geralmente piora performance",
    relevance: 0.95,
  },
  {
    memory_type: "fact",
    content: "Temperatura de público Meta Ads: Quentes (últimos 7 dias, site, carrinho) > Mornos (contato anterior) > Frios (interesse)",
    relevance: 0.95,
  },
  {
    memory_type: "fact",
    content: "Estratégia do Passo Anterior: targetar usuários um passo antes da conversão (ex: visitou página de preços → mostrar anúncio de trial)",
    relevance: 0.9,
  },
  {
    memory_type: "fact",
    content: "Criativo é o novo público: na era da IA do Meta, um bom criativo encontra o público certo sozinho sem segmentação detalhada",
    relevance: 0.9,
  },
  {
    memory_type: "fact",
    content: "Monitoramento Meta Ads: criativos a cada 2-3 dias | públicos a cada 4 dias | orçamento a cada 2 dias | estrutura a cada 7 dias",
    relevance: 0.85,
  },
  {
    memory_type: "fact",
    content: "Teste isolado: mudar APENAS uma variável por vez. Cada centavo investido é um teste — extraia aprendizado de cada resultado",
    relevance: 0.85,
  },
  {
    memory_type: "fact",
    content: "CBO (Campaign Budget Optimization) para escala. ABO (Ad Set Budget) para testes controlados",
    relevance: 0.8,
  },
  {
    memory_type: "fact",
    content: "Fases de lançamento com tráfego: Produção de conteúdo → Captação (leads) → Aquecimento → Remarketing (conversões)",
    relevance: 0.85,
  },
  // FATOS — empresa Mestre Inova
  {
    memory_type: "fact",
    content: "Mestre Inova: planos Starter R$47,90 | Plus R$67,90 | Ultra R$107,90/mês. Trial 10 dias grátis sem cartão",
    relevance: 1.0,
  },
  {
    memory_type: "fact",
    content: "Mestre Inova benchmarks: 500+ educadores, 10.000+ avaliações corrigidas. CAC saudável: até 3x MRR do plano",
    relevance: 0.9,
  },
  {
    memory_type: "fact",
    content: "CPL referência edtech Brasil: Meta Ads R$8-25 | Google Ads R$15-40. Taxa trial→pago saudável: 15-25%",
    relevance: 0.9,
  },
  {
    memory_type: "fact",
    content: "Avatar Mestre Inova: professor 28-55 anos, ensino fundamental/médio/técnico, ativo no Instagram e YouTube, sobrecarga de correções",
    relevance: 0.95,
  },
  // PREFERÊNCIAS
  {
    memory_type: "preference",
    content: "Usuário prefere respostas diretas e práticas — fundador sem experiência prévia em marketing, foco em execução imediata",
    relevance: 0.9,
  },
];

async function main() {
  console.log("🔍 Buscando workspaces...");

  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("id, name");

  if (error) {
    console.error("Erro ao buscar workspaces:", error.message);
    process.exit(1);
  }

  if (!workspaces?.length) {
    console.log("Nenhum workspace encontrado. Faça login no sistema primeiro para criar um workspace.");
    process.exit(0);
  }

  console.log(`✅ ${workspaces.length} workspace(s) encontrado(s)\n`);

  for (const workspace of workspaces) {
    console.log(`📦 Workspace: ${workspace.name} (${workspace.id})`);

    // Limpar memórias antigas do mesmo tipo para evitar duplicatas
    await supabase
      .from("agent_memories")
      .delete()
      .eq("workspace_id", workspace.id)
      .eq("agent_type", "acquisition")
      .in("memory_type", ["fact", "preference"]);

    const rows = SOBRAL_MEMORIES.map((m) => ({
      workspace_id: workspace.id,
      agent_type: "acquisition",
      ...m,
      expires_at: null,
    }));

    const { error: insertError } = await supabase
      .from("agent_memories")
      .insert(rows);

    if (insertError) {
      console.error(`  ❌ Erro: ${insertError.message}`);
    } else {
      console.log(`  ✅ ${rows.length} memórias injetadas no Atlas\n`);
    }
  }

  console.log("🎉 Concluído! O Atlas agora possui a metodologia Pedro Sobral em sua memória.");
}

main().catch(console.error);
