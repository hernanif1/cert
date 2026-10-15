import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.4",
  slug: "3-4-observability-at-scale",
  domain: 3,
  objective:
    "Analisar desafios de observabilidade e selecionar estratégias de monitoramento em escala",
  title: "Observabilidade em Escala",
  summary:
    "Sistemas com LLM falham em silêncio: uma resposta errada retorna HTTP 200 e é idêntica, por fora, a uma resposta certa. Monitorá-los em escala significa instrumentar qualidade, custo e comportamento das tools, não apenas disponibilidade e taxas de erro.",

  body: [
    {
      kind: "prose",
      md: "A observabilidade tradicional pressupõe que as falhas se anunciam — uma exceção, um 500, um timeout. O modo de falha mais importante de um sistema com LLM não faz nada disso. Um número de apólice alucinado, uma tool chamada com o argumento errado, uma recuperação que não devolveu nada de útil: tudo isso termina com sucesso, rapidamente e em tom confiante.\n\nEssa lacuna é o objetivo. Espera-se que você selecione uma instrumentação que traga à tona problemas de qualidade e de comportamento, e que a torne viável em custo e segura em volume de produção.",
    },

    { kind: "heading", text: "Três camadas, três perguntas" },
    {
      kind: "list",
      items: [
        "**Operacional.** Está no ar e está rápido? Percentis de latência, taxas de erro, timeouts, rate limiting, vazão (throughput) de tokens. As ferramentas convencionais dão conta disso muito bem.",
        "**Comportamental.** O que o sistema está de fato fazendo? Traces que abrangem cada chamada de modelo, invocação de tool e recuperação, correlacionados sob um único id, para que uma execução de várias etapas seja lida como uma história só.",
        "**Qualitativa.** As respostas são boas? Pontuação por amostragem, sinais de feedback dos usuários, taxas de recusa e de escalonamento, conclusão de tarefas. Nada na camada de transporte é capaz de lhe dizer isso.",
      ],
    },
    {
      kind: "prose",
      md: "A maioria dos incidentes de produção em sistemas de agentes é diagnosticada na camada comportamental e só é detectada na qualitativa. Um design que instrumenta apenas a camada operacional vai exibir um dashboard saudável durante uma semana inteira de respostas degradadas.",
    },

    { kind: "heading", text: "O que capturar em toda requisição" },
    {
      kind: "code",
      lang: "json",
      code: `{\n  "trace_id": "t-9f2c...",\n  "user_id_hash": "u-4471",\n  "tenant": "acme",\n  "model": "claude-sonnet-5",\n  "prompt_version": "triage@2026-03-11",\n  "tool_calls": [\n    { "name": "search_tickets", "latency_ms": 180, "status": "ok", "result_count": 7 },\n    { "name": "post_reply", "latency_ms": 240, "status": "error", "code": "403" }\n  ],\n  "retrieval": { "index": "kb-v4", "top_k": 5, "doc_ids": ["kb-991", "kb-1042"] },\n  "tokens": { "input": 8210, "cached": 7400, "output": 412 },\n  "latency_ms": { "ttft": 640, "total": 2310 },\n  "outcome": { "stop_reason": "end_turn", "user_feedback": null }\n}`,
    },
    {
      kind: "prose",
      md: "Repare no que *não* está ali: o texto do prompt e a resposta gerada. Essa é a parte cara e sensível. Armazene identificadores, versões, contagens e tempos em toda requisição, e guarde os payloads completos apenas para uma amostra e para os erros.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "**Amostre com inteligência, não de forma uniforme.** Guarde 100% das falhas, dos erros de tool, das recusas e das sessões com feedback ruim, além de uma pequena porcentagem dos sucessos para comparação com o baseline. A amostragem uniforme a uma taxa baixa economiza o mesmo dinheiro, mas joga fora exatamente os traces de que você vai precisar às 2 da manhã, porque falhas são raras por definição.",
    },

    { kind: "heading", text: "Sinais que se movem antes de os usuários reclamarem" },
    {
      kind: "table",
      caption: "Indicadores antecedentes para os quais vale a pena ter alerta",
      headers: ["Sinal", "O que uma mudança costuma significar"],
      rows: [
        [
          "Taxa de acerto da recuperação, ou parcela de respostas que não citam nenhuma fonte",
          "Deriva do índice, um job de ingestão que falhou ou uma mudança na distribuição das consultas",
        ],
        [
          "Taxa de erro de tool, por nome de tool",
          "Uma API downstream mudou, ou credenciais ou escopos expiraram",
        ],
        [
          "Média de turnos por tarefa concluída",
          "O agente está em loop ou replanejando; muitas vezes é o primeiro sinal de uma regressão de prompt",
        ],
        [
          "Taxa de recusa e de escalonamento",
          "Guardrails disparando em tráfego legítimo, ou entradas genuinamente novas",
        ],
        [
          "Parcela de tokens em cache na entrada",
          "Um prefixo mudou e o caching deixou de se aplicar sem alarde, elevando custo e latência",
        ],
        [
          "Custo por tarefa concluída, por tenant",
          "Crescimento do contexto, tempestades de retries ou um único cliente gerando uso patológico",
        ],
      ],
    },

    {
      kind: "example",
      title: "Exemplo prático: a semana em que os dashboards ficaram verdes",
      scenario:
        "Um agente de processamento de documentos roda a cerca de 400.000 requisições por dia. Os dashboards operacionais mostram a latência p95 estável e uma taxa de erro de 0,3%. Depois de oito dias, um gerente de contas escala que a qualidade da extração desabou. Não há alerta, não há incidente e não há nenhum trace com mais de 24 horas, porque a retenção de logs foi ajustada para reduzir custo.",
      walkthrough:
        "1. **Reconstrua o que mudou.** A versão do prompt e a versão do modelo não eram registradas por requisição, então correlacionar a regressão a um deploy leva dois dias de arqueologia no git.\n2. **Encontre a causa.** Uma atualização de conector alterou a forma como os PDFs eram parseados; as tabelas passaram a chegar como texto sem rótulos. O modelo, obediente, extraiu coisas sem sentido, e toda requisição retornou 200.\n3. **Instrumente a camada que faltava.** Adicione uma pontuação de LLM-judge sobre uma amostra de 1%, além de uma checagem de validade de schema em toda extração — um sinal determinístico e barato que teria disparado no primeiro dia.\n4. **Corrija a retenção de forma assimétrica.** Traces completos por 30 dias para as requisições amostradas e para as que falharam; metadados para tudo.\n5. **Alerte sobre distribuição, não sobre limiares.** A taxa de preenchimento dos campos de extração caindo 20% de uma semana para a outra é o alerta que pega o próximo caso.",
      takeaway:
        "Nada na camada operacional poderia ter detectado isso. Os sinais detectáveis eram uma checagem determinística e barata de validade e uma pontuação de qualidade por amostragem, e o diagnóstico precisava de metadados de versão que nunca foram registrados.",
    },

    {
      kind: "callout",
      variant: "pitfall",
      md: "Registrar em log os prompts e as respostas completas de toda requisição parece rigoroso e cria três problemas de uma vez: um custo de armazenamento que escala com o tráfego, uma obrigação de retenção sobre dados de usuários que você talvez nem tenha permissão para guardar, e um palheiro em que ninguém procura nada. Em vez disso, mascare os dados sensíveis, amostre e registre a estrutura.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Adicionar mais dashboards de latência e de taxa de erro* e *estender a retenção de logs* são as respostas operacionais reflexas e, neste objetivo, costumam ser distratores: as duas ampliam uma instrumentação que já é cega para a falha descrita. Procure a alternativa que acrescenta um **novo tipo** de sinal — uma checagem de correção, uma pontuação de qualidade por amostragem, um trace id de correlação ou metadados de versão.",
    },

    {
      kind: "practice",
      questionIds: [
        "D3-q401",
        "D3-q402",
        "D3-q403",
        "D3-q404",
        "D3-q405",
        "D3-q406",
        "D3-q407",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Trace",
      definition:
        "O registro completo de uma requisição como uma árvore de spans — chamadas de modelo, invocações de tool, recuperações — correlacionados por um único id, para que a execução de um agente em várias etapas possa ser reproduzida de ponta a ponta.",
    },
    {
      term: "Falha silenciosa",
      definition:
        "Um resultado incorreto devolvido como uma resposta bem-sucedida. É o modo de falha dominante em LLMs e a razão pela qual o monitoramento da camada de transporte é insuficiente.",
    },
    {
      term: "Amostragem baseada na cauda (tail-based sampling)",
      definition:
        "Decidir se um trace será retido depois que o desfecho é conhecido, de modo que toda falha seja mantida enquanto os sucessos são amostrados a uma taxa baixa.",
    },
    {
      term: "Avaliação online",
      definition:
        "Pontuar uma amostra do tráfego real de produção — por rubrica, LLM judge ou checagem determinística de validade — para detectar regressões de qualidade que as métricas operacionais não enxergam.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Dashboards saudáveis de latência e de taxa de erro significam que o sistema está funcionando.",
      why: "Uma resposta incorreta é devolvida como uma resposta bem-sucedida, com tempos normais, de modo que as métricas operacionais são cegas ao modo de falha que mais importa em um sistema com LLM.",
      instead:
        "Adicione instrumentação de qualidade — pontuação por amostragem, validação determinística da saída e sinais de feedback dos usuários — ao lado do monitoramento operacional.",
    },
    {
      id: "t2",
      trap: "Registre em log todo prompt e toda resposta na íntegra, para que qualquer incidente possa ser investigado depois.",
      why: "O logging de payloads completos faz o custo de armazenamento escalar linearmente com o tráfego, cria uma obrigação de retenção e de privacidade sobre dados de usuários e produz um volume em que ninguém consegue de fato buscar durante um incidente.",
      instead:
        "Registre metadados estruturados em toda requisição e retenha os payloads completos apenas para os erros e para uma pequena amostra.",
    },
    {
      id: "t3",
      trap: "Amostrar 1% das requisições de forma uniforme dá uma visão adequada da produção.",
      why: "Falhas são raras, então a amostragem uniforme não captura quase nenhuma delas, enquanto gasta o mesmo orçamento com tráfego comum e bem-sucedido que ninguém precisa inspecionar.",
      instead:
        "Retenha todos os erros, recusas e sessões com feedback negativo, e amostre os sucessos a uma taxa baixa para comparação com o baseline.",
    },
    {
      id: "t4",
      trap: "Um único trace representativo com falha basta para diagnosticar uma regressão de um agente.",
      why: "As saídas do modelo são não determinísticas, então um trace isolado não consegue distinguir uma amostra azarada de uma mudança sistemática, e a mesma entrada pode dar certo na tentativa seguinte.",
      instead:
        "Diagnostique a partir de agregados — taxas, distribuições e comparações semana a semana — e use traces individuais para explicar uma tendência que você já estabeleceu.",
    },
    {
      id: "t5",
      trap: "Registrar o nome do modelo é metadado de versão suficiente para depuração.",
      why: "Templates de prompt, schemas de tools, builds do índice de recuperação e versões de conectores mudam todos independentemente do modelo e são, com frequência, a causa real de uma regressão.",
      instead:
        "Carimbe todo trace com a versão do prompt, o build do índice e as versões das tools, para que uma mudança de qualidade possa ser correlacionada a um deploy específico.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 3",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
    {
      label: "Building Effective Agents — Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],
} satisfies Lesson;
