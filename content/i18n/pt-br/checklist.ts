/**
 * Tradução do checklist (content/checklist.ts). Só TEXTO vive aqui: ids,
 * objetivos, agrupamento e ordem continuam tendo uma única fonte de verdade no
 * arquivo original, então uma tradução nunca pode divergir da estrutura — e o
 * progresso, guardado por id, é o mesmo nos dois idiomas.
 */
export const CHECKLIST_PT_BR: Record<string, string> = {
  "d1-pattern-choice":
    "Sei escolher entre os padrões LLM aumentado, workflow e agêntico a partir da descrição de um cenário",
  "d1-multi-agent":
    "Sei quando a decomposição em múltiplos agentes se justifica e quando um único agente é melhor",
  "d1-value-pillars":
    "Sei ancorar a recomendação de uma arquitetura nos pilares de eficiência, custo ou SLA de desempenho",

  "d2-model-tier":
    "Sei escolher a família de modelo a partir dos requisitos de capacidade, custo e latência",
  "d2-prompt-caching":
    "Sei quando o cache de prompt se paga e quais são os três erros clássicos que o invalidam",
  "d2-prompt-technique":
    "Sei escolher entre zero-shot, few-shot e cadeia de raciocínio para uma dada tarefa",

  "d3-integration-mechanism":
    "Sei escolher entre MCP, API direta e integração entre agentes a partir de um cenário",
  "d3-capability-bloat":
    "Sei identificar excesso de ferramentas e explicar descoberta progressiva versus contexto monolítico",
  "d3-per-user-auth":
    "Sei por que autorização por usuário é melhor que uma conta de serviço compartilhada",
  "d3-chunking":
    "Sei raciocinar sobre os trade-offs do tamanho dos trechos e quando acrescentar reordenação",
  "d3-retrieval-quality":
    "Corrijo a qualidade da recuperação em vez de empilhar mais contexto",

  "d4-metrics-failure-modes":
    "Sei associar métricas de avaliação aos modos de falha",
  "d4-eval-dataset":
    "Sei montar um dataset de avaliação que espelha a produção e permanece reservado",
  "d4-grader-split":
    "Sei como avaliadores em código, LLM como juiz e revisão humana dividem o trabalho de teste",
  "d4-ab-test":
    "Sei conduzir um teste A/B limpo: uma variável, métrica definida antes, amostra suficiente",
  "d4-diagnose":
    "Sei distinguir alucinação, falha de recuperação e modelo inadequado a partir dos sintomas",

  "d5-guardrail-layers":
    "Sei listar as cinco camadas de guardrails na ordem",
  "d5-hitl-placement":
    "Conheço as regras de onde colocar supervisão humana em ações irreversíveis e reguladas",
  "d5-compliance-regimes":
    "Sei distinguir GDPR, HIPAA e FedRAMP em uma linha cada",

  "d6-lifecycle-phases":
    "Sei nomear as fases do ciclo de vida na ordem e os resultados da fase de descoberta",
  "d6-adr":
    "Sei o que entra em um registro de decisão de arquitetura",

  "d7-team-config":
    "Sei por que os padrões do time vivem na configuração do projeto versionada no Claude Code",

  "prep-trap-patterns":
    "Já revisei todos os nove padrões de resposta-armadilha",
  "prep-timed-mocks":
    "Já fiz pelo menos dois simulados completos e cronometrados",
};
