import type { DomainNumber, ObjectiveId } from "@/content/schema";

/**
 * Tradução do blueprint (content/domains.ts). Só TEXTO vive aqui: pesos, slugs,
 * ids e cotas continuam tendo uma única fonte de verdade no arquivo original,
 * então uma tradução nunca pode divergir da estrutura da prova.
 *
 * `text` é a tradução do objetivo oficial; o original em inglês continua sendo
 * o texto normativo (é ele que a prova usa).
 */
export const DOMAINS_PT_BR: Record<
  DomainNumber,
  { title: string; blurb: string }
> = {
  1: {
    title: "Design de Soluções e Arquitetura",
    blurb:
      "Transforme um problema de negócio em uma arquitetura baseada no Claude: escolha o padrão certo, decomponha o trabalho e justifique o design em termos de valor de negócio.",
  },
  2: {
    title: "Modelos Claude, Prompts e Engenharia de Contexto",
    blurb:
      "Escolha o modelo certo para a tarefa e, depois, projete prompts e contexto que se sustentem em produção — incluindo cache e reuso.",
  },
  3: {
    title: "Integração",
    blurb:
      "O domínio de maior peso. Conecte o Claude a sistemas reais: ferramentas, autenticação, recuperação, protocolos e observabilidade — sem abrir brechas de segurança ou de latência.",
  },
  4: {
    title: "Avaliação, Testes e Otimização",
    blurb:
      "Prove que o sistema funciona e mantenha-o funcionando: métricas, datasets de avaliação, testes A/B, diagnóstico de falhas e ajuste de custo e latência.",
  },
  5: {
    title: "Governança, Segurança e Gestão de Riscos",
    blurb:
      "Guardrails, modos de falha, supervisão humana, conformidade regulatória e as considerações éticas que se espera que um arquiteto leve em conta no design.",
  },
  6: {
    title: "Comunicação com Stakeholders e Gestão do Ciclo de Vida",
    blurb:
      "A metade sem código do papel de arquiteto: discovery, comunicação de trade-offs, gestão de expectativas e SLAs, documentação e handoff.",
  },
  7: {
    title: "Produtividade de Desenvolvedores e Capacitação Operacional",
    blurb:
      "O domínio mais leve, com 7%: configurar as ferramentas do Claude para equipes, melhorar os fluxos de trabalho de desenvolvimento e apoiar a depuração operacional.",
  },
};

export const OBJECTIVES_PT_BR: Record<
  ObjectiveId,
  { title: string; text: string }
> = {
  "1.1": {
    title: "Traduzindo Problemas de Negócio",
    text: "Traduzir problemas de negócio em soluções de IA baseadas no Claude",
  },
  "1.2": {
    title: "Arquitetura de Ponta a Ponta",
    text: "Projetar arquiteturas de ponta a ponta (entrada → processamento → saída → ciclos de feedback)",
  },
  "1.3": {
    title: "Escolhendo um Padrão de Arquitetura",
    text: "Selecionar padrões de arquitetura apropriados (workflow, agêntico, LLM aumentado)",
  },
  "1.4": {
    title: "Sistemas Multiagente e Orquestração",
    text: "Projetar sistemas multiagente e estratégias de orquestração",
  },
  "1.5": {
    title: "Técnicas de Decomposição",
    text: "Aplicar técnicas de decomposição para a resolução de problemas complexos",
  },
  "1.6": {
    title: "Alinhamento ao Valor de Negócio",
    text: "Alinhar soluções aos pilares de valor de negócio (eficiência, transformação, produtividade, custo, SLAs de desempenho)",
  },
  "2.1": {
    title: "Seleção de Modelos e Trade-offs",
    text: "Selecionar modelos Claude apropriados com base em trade-offs",
  },
  "2.2": {
    title: "System Prompts, Templates e Guardrails",
    text: "Projetar system prompts, templates e guardrails",
  },
  "2.3": {
    title: "Técnicas de Engenharia de Prompt",
    text: "Aplicar técnicas de engenharia de prompt (zero-shot, few-shot, chain-of-thought)",
  },
  "2.4": {
    title: "Janelas de Contexto e Uso de Tokens",
    text: "Otimizar janelas de contexto e gerenciar o uso de tokens",
  },
  "2.5": {
    title: "Reuso de Prompts: Cache, Prompts Modulares e Skills",
    text: "Implementar estratégias de reuso de prompts (cache, prompts modulares, Skills)",
  },
  "3.1": {
    title: "Configuração de Ferramentas e Excesso de Capacidades",
    text: "Avaliar a configuração de ferramentas/agentes quanto ao excesso de capacidades (capability bloat)",
  },
  "3.2": {
    title: "Lacunas de Autenticação e Autorização",
    text: "Analisar requisitos de autenticação e autorização para identificar lacunas de segurança",
  },
  "3.3": {
    title: "Trade-offs entre Acurácia e Latência",
    text: "Avaliar trade-offs entre acurácia e latência e justificar decisões de configuração",
  },
  "3.4": {
    title: "Observabilidade em Escala",
    text: "Analisar desafios de observabilidade e selecionar estratégias de monitoramento em escala",
  },
  "3.5": {
    title: "Projetando um Pipeline de RAG",
    text: "Projetar um pipeline de RAG com estratégias apropriadas de chunking e indexação",
  },
  "3.6": {
    title: "Recuperação Adequada ao Formato dos Dados",
    text: "Aplicar estratégias de recuperação adequadas ao formato dos dados e ao padrão de consulta",
  },
  "3.7": {
    title: "Escolhendo um Mecanismo de Integração",
    text: "Avaliar protocolos de conexão e selecionar o mecanismo de integração apropriado (MCP, API/CLI, agente para agente)",
  },
  "3.8": {
    title: "Descoberta Progressiva vs. Contexto Monolítico",
    text: "Avaliar a estratégia de descoberta progressiva versus contexto monolítico",
  },
  "4.1": {
    title: "Definindo Métricas de Avaliação",
    text: "Definir métricas de avaliação (acurácia, latência, custo, segurança operacional, segurança da informação)",
  },
  "4.2": {
    title: "Datasets de Avaliação e Frameworks de Teste",
    text: "Projetar datasets de avaliação e frameworks de teste usando metodologias mistas",
  },
  "4.3": {
    title: "Testes A/B e Iteração",
    text: "Conduzir testes A/B e melhorias iterativas",
  },
  "4.4": {
    title: "Diagnosticando Problemas do Sistema",
    text: "Diagnosticar problemas do sistema (falha de prompt, alucinações, modelo inadequado)",
  },
  "4.5": {
    title: "Otimizando Tokens, Latência e Custo",
    text: "Otimizar o uso de tokens, a latência e os trade-offs entre custo e desempenho",
  },
  "4.6": {
    title: "Logs e Monitoramento de Desempenho",
    text: "Monitorar o desempenho do sistema usando ferramentas de logging e observabilidade",
  },
  "5.1": {
    title: "Guardrails e Controles de Segurança",
    text: "Implementar guardrails e controles de segurança",
  },
  "5.2": {
    title: "Riscos, Limitações e Modos de Falha",
    text: "Identificar riscos, limitações e modos de falha de sistemas de LLM",
  },
  "5.3": {
    title: "Validação com Humano no Circuito",
    text: "Aplicar estratégias de validação com humano no circuito (human-in-the-loop)",
  },
  "5.4": {
    title: "Conformidade Regulatória",
    text: "Garantir a conformidade com regulamentações (p. ex., GDPR, HIPAA, FedRAMP)",
  },
  "5.5": {
    title: "Considerações de IA Ética",
    text: "Tratar considerações de IA ética (viés, equidade, transparência)",
  },
  "6.1": {
    title: "Discovery Estruturado",
    text: "Conduzir discovery estruturado e levantamento de requisitos",
  },
  "6.2": {
    title: "Comunicando Decisões e Trade-offs",
    text: "Comunicar decisões de arquitetura e trade-offs",
  },
  "6.3": {
    title: "Ciclos de Feedback e SLAs",
    text: "Gerenciar ciclos de feedback com stakeholders e o alinhamento de expectativas (incluindo SLAs)",
  },
  "6.4": {
    title: "Documentando Arquiteturas",
    text: "Documentar arquiteturas e fornecer orientação de implementação",
  },
  "6.5": {
    title: "Apoiando o Ciclo de Vida",
    text: "Apoiar as fases do ciclo de vida (discovery, design, handoff, monitoramento, iteração)",
  },
  "7.1": {
    title: "Configurando Ferramentas do Claude para Equipes",
    text: "Configurar ferramentas e ambientes do Claude para equipes (p. ex., Claude Code)",
  },
  "7.2": {
    title: "Fluxos de Desenvolvimento Assistidos por IA",
    text: "Melhorar os fluxos de trabalho de desenvolvimento usando ferramentas assistidas por IA",
  },
  "7.3": {
    title: "Depuração e Suporte Operacional",
    text: "Apoiar a depuração e a resolução de problemas operacionais",
  },
};
