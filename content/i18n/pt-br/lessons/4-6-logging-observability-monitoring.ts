import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "4.6",
  slug: "4-6-logging-observability-monitoring",
  domain: 4,
  objective:
    "Monitorar o desempenho do sistema usando ferramentas de logging e observabilidade",
  title: "Logs e Monitoramento de Desempenho",
  summary:
    "Sistemas com LLM falham em silêncio: a chamada dá certo, o texto é fluente, e as respostas deixaram discretamente de ser boas. Monitorar um deles significa, portanto, carregar um sinal contínuo de qualidade ao lado dos sinais operacionais e registrar em log, por requisição, o suficiente para que uma regressão possa ser atribuída a uma mudança.",

  body: [
    {
      kind: "prose",
      md: "O monitoramento convencional pressupõe que as falhas se anunciam — um status diferente de 200, um stack trace, um timeout. Um sistema com LLM devolve 200 com um parágrafo plausível enquanto sua acurácia cai quinze pontos, e nenhum dashboard percebe. Essa propriedade molda tudo aqui: o desenho do monitoramento precisa fabricar o sinal que o sistema não vai emitir por conta própria.",
    },

    { kind: "heading", text: "O que toda requisição deve carregar" },
    {
      kind: "prose",
      md: "Uma linha de log só é útil se permitir que alguém pergunte depois *o que havia de diferente nas requisições que falharam*. Isso significa registrar a identidade da configuração, e não apenas o resultado:",
    },
    {
      kind: "list",
      items: [
        "**Identidade de versão** — id e versão do modelo, versão do template de prompt, versão do índice de recuperação, versão do schema de tools. Sem isso, uma regressão não pode ser atribuída a um deploy.",
        "**Contabilidade de tokens** — contagens de entrada, de entrada em cache e de saída, para que o custo e o crescimento do prompt fiquem visíveis por requisição, e não apenas em uma fatura.",
        "**Um detalhamento da latência** — tempo até o primeiro token, conclusão total e tempo gasto na recuperação e em cada chamada de tool, para que uma requisição lenta aponte para um componente.",
        "**Resultado comportamental** — motivo de parada, chamadas de tool tentadas e seus resultados, recusas e falhas de parse em saída estruturada.",
        "**Sinal downstream** — se um humano aceitou, editou ou escalonou o resultado. Este é o proxy de qualidade mais barato que você vai conseguir.",
        "**Estado de anonimização** — o que foi removido e sob qual política, com uma janela de retenção, já que prompts e respostas rotineiramente contêm conteúdo regulado.",
      ],
    },

    { kind: "heading", text: "Exportando a telemetria do Claude Code para um SIEM" },
    {
      kind: "prose",
      md: "O Claude Code traz um exportador OpenTelemetry para esse registro, desligado até que `CLAUDE_CODE_ENABLE_TELEMETRY=1` seja definido. Sua exportação padrão é *estrutural*: durações, contadores de tokens e de custo, nomes de modelo, nomes de tools, decisões de permissão, identificadores de sessão e de conta. O texto do prompt chega como `<REDACTED>`, os argumentos das tools são omitidos e nomes de tools de terceiros viram `custom`. O conteúdo da conversa só sai da máquina por chaves opt-in separadas:",
    },
    {
      kind: "code",
      lang: "bash",
      code: `export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otel-collector.internal:4317

# Structural: labels, identifiers, tracing — no conversation content
export OTEL_RESOURCE_ATTRIBUTES=department=eng,service.version=1.4.0
export OTEL_METRICS_INCLUDE_SESSION_ID=false   # metrics only; events keep session.id
export CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1   # span tracing; needs OTEL_TRACES_EXPORTER

# Content opt-ins: each one exports what users typed or the agent did
export OTEL_LOG_USER_PROMPTS=1     # prompt text on user_prompt events + interaction span
export OTEL_LOG_TOOL_DETAILS=1     # tool_input: file paths, shell commands, real MCP/skill names
export OTEL_LOG_TOOL_CONTENT=1     # tool output: file contents, stdout, diffs
export OTEL_LOG_RAW_API_BODIES=file:/var/log/claude-bodies   # full request/response JSON, body_ref on the event`,
    },
    {
      kind: "callout",
      variant: "pitfall",
      md: "As questões de prova sobre este tema giram em torno de uma distinção: quais variáveis *adicionam conteúdo* e quais apenas rotulam, filtram ou estruturam o que já é exportado. Atributos de recurso, flags `OTEL_METRICS_INCLUDE_*` e o tracing avançado mudam a forma dos dados. Prompts, detalhes de tools, conteúdo de tools e corpos brutos da API mudam o que eles contêm — e os corpos brutos implicam todos os outros, já que carregam a conversa inteira.",
    },

    { kind: "heading", text: "Fabricando um sinal de qualidade" },
    {
      kind: "table",
      caption: "Três sinais de qualidade complementares, ordenados pela rapidez com que reagem",
      headers: ["Sinal", "Como funciona", "Reage em", "Ponto cego"],
      rows: [
        [
          "Métricas proxy",
          "Contadores que não precisam de rótulos: taxa de escalonamento, taxa de retry, distância de edição, taxa de recusa, taxa de falha de parse",
          "Em minutos, no tráfego real",
          "Diz que algo se moveu, não o que está errado",
        ],
        [
          "Avaliação online amostrada",
          "Uma pequena porcentagem das respostas ao vivo avaliada pelo juiz calibrado",
          "Em horas, no mix real de entradas",
          "Confunde uma mudança no tráfego com uma mudança no sistema",
        ],
        [
          "Conjunto canary agendado",
          "Um golden set congelado, reexecutado contra a produção em um agendamento",
          "A cada execução agendada",
          "Não enxerga entradas que o conjunto não contém",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "O conjunto canary e a avaliação online amostrada respondem a perguntas diferentes, e é por isso que sistemas maduros rodam os dois. Como as entradas do canary nunca mudam, qualquer movimento em sua nota é atribuível ao sistema. Como as entradas do tráfego amostrado mudam o tempo todo, a nota dele também se move quando os usuários mudam — e essa diferença é, em si, o diagnóstico. Canary estável enquanto a nota amostrada cai significa que o tráfego mudou; os dois caindo significa que foi o sistema.",
    },
    {
      kind: "prose",
      md: "**Monitore as entradas, não só as saídas.** A distribuição do comprimento das consultas, o mix de tópicos, o idioma e a parcela de requisições em que a recuperação não retorna nada são baratos de acompanhar e explicam movimentos de qualidade de outro modo inexplicáveis. O lançamento de um produto, um novo mercado ou uma macro de suporte que muda como os usuários formulam a pergunta desloca a distribuição das entradas da noite para o dia; o modelo não piorou, o trabalho é que mudou.\n\n**Alerte sobre sintomas que os usuários sentem e dê a todo alerta um dono e uma ação.** Um acionamento sobre o qual ninguém pode agir treina a equipe a ignorar acionamentos, uma falha pior do que a que está sendo monitorada. Use limiares fixos onde existe um SLA, limiares relativos a um baseline móvel onde o nível oscila legitimamente, e reserve o acionamento de plantão para quebras visíveis ao usuário — picos na taxa de erro, p95 além do SLO, um salto abrupto no custo diário, um salto na taxa de recusa. Degradação lenta de qualidade pertence a uma revisão, não a um pager.",
    },
    {
      kind: "example",
      title: "Exemplo prático: pegando uma regressão silenciosa",
      scenario:
        "Os dashboards operacionais de um assistente de conhecimento ficam totalmente verdes por três semanas. Então os gerentes de conta relatam que as respostas parecem vagas há algum tempo, e eles não sabem dizer quando isso começou.",
      walkthrough:
        "1. **Procure um proxy que se moveu.** A taxa de edição humana nas respostas redigidas subiu de 18% para 34% ao longo do período. Nada mais no painel operacional se moveu.\n2. **Separe sistema de tráfego.** O conjunto canary, reexecutado toda noite, caiu quatro pontos na mesma data; a avaliação online amostrada caiu seis. Os dois se moveram, então é o sistema.\n3. **Alinhe com o registro de mudanças.** Os dashboards são anotados com os deploys. A queda coincide com uma reconstrução do índice, não com uma mudança de prompt ou de modelo.\n4. **Confirme com o detalhe por requisição.** As requisições depois daquela data mostram uma parcela maior de resultados de recuperação vazios e contagens menores de chunks recuperados — a reconstrução deixou de fora um conjunto de documentos.\n5. **Feche o ciclo.** Os casos que falharam viram itens permanentes de avaliação, e a taxa de edição e a nota do canary entram na revisão de alertas, para que três semanas não possam mais passar em silêncio.",
      takeaway:
        "Nada deu erro, então nada alertou. A regressão foi encontrada por uma métrica proxy que dispensa rótulos e atribuída por um conjunto canary congelado mais as anotações de deploy.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Adicionar alertas de disponibilidade e de taxa de erro* e *coletar polegar para cima e polegar para baixo dos usuários* soam, ambas, como respostas responsáveis. Nenhuma detecta uma regressão silenciosa de qualidade: a primeira nunca dispara, e o feedback explícito é esparso, enviesado para os irritados e chega muito depois do estrago. A alternativa correta estabelece uma medição de qualidade contínua e amostrada.",
    },

    {
      kind: "practice",
      questionIds: [
        "D4-q601",
        "D4-q602",
        "D4-q603",
        "D4-q604",
        "D4-q605",
        "D4-q606",
        "D4-q607",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Falha silenciosa",
      definition:
        "Uma degradação que não produz erro: a requisição dá certo, a saída é bem formada, e só a sua correção ou utilidade caiu. O desafio de monitoramento que define os sistemas com LLM.",
    },
    {
      term: "Conjunto canary de avaliação",
      definition:
        "Um golden set congelado, reexecutado contra a produção em um agendamento. Como suas entradas nunca mudam, qualquer movimento na nota é atribuível ao sistema, e não ao tráfego.",
    },
    {
      term: "Métrica proxy de qualidade",
      definition:
        "Um contador de produção sem rótulos que se correlaciona com a qualidade — taxa de edição, taxa de escalonamento, taxa de retry, taxa de recusa — e que, por isso, reage imediatamente e de graça.",
    },
    {
      term: "Drift de entrada",
      definition:
        "Uma mudança na distribuição das requisições que chegam: novos tópicos, novas formulações, novos idiomas. Muitas vezes é a verdadeira explicação para uma queda na qualidade da saída.",
    },
    {
      term: "Anotação de deploy",
      definition:
        "Marcar releases, mudanças de versão de prompt e reconstruções de índice diretamente nos dashboards, para que um degrau em uma métrica possa ser alinhado com o que mudou.",
    },
    {
      term: "Telemetria estrutural",
      definition:
        "Durações, contadores de tokens e de custo, nomes de modelo e de tools, decisões de permissão e identificadores — o que o Claude Code exporta assim que a telemetria é habilitada, sem nenhum conteúdo da conversa.",
    },
    {
      term: "Opt-in de conteúdo",
      definition:
        "Uma variável separada — OTEL_LOG_USER_PROMPTS, OTEL_LOG_TOOL_DETAILS, OTEL_LOG_TOOL_CONTENT, OTEL_LOG_RAW_API_BODIES — que adiciona aos eventos exportados o que os usuários digitaram ou o que o agente fez. Todas vêm desligadas por padrão.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Dashboards de taxa de erro, vazão (throughput) e disponibilidade são suficientes para monitorar um sistema com LLM em produção.",
      why: "Uma regressão de qualidade devolve respostas bem-sucedidas com conteúdo bem formado, de modo que nunca aparece nas métricas de disponibilidade ou de erro e pode persistir por semanas enquanto todo painel operacional continua verde.",
      instead:
        "Carregue um sinal contínuo de qualidade — contadores proxy, avaliação online amostrada e um conjunto canary agendado — ao lado dos operacionais.",
    },
    {
      id: "t2",
      trap: "O feedback de polegar para cima e polegar para baixo é a principal métrica de qualidade em produção.",
      why: "Avaliações explícitas são enviadas por uma parcela minúscula e autosselecionada dos usuários, enviesada para os irritados, e chegam bem depois das sessões afetadas, de modo que a série é esparsa e atrasada demais para detectar uma regressão.",
      instead:
        "Trate o feedback explícito como um insumo qualitativo e apoie-se em proxies implícitos mais avaliação amostrada para a tendência.",
    },
    {
      id: "t3",
      trap: "Uma queda na qualidade da saída significa que o modelo ou o prompt se degradou.",
      why: "Nada no sistema precisa ter mudado para que a qualidade medida caia — um novo produto, mercado ou formulação desloca a distribuição das entradas, e o sistema simplesmente está recebendo uma pergunta diferente da de antes.",
      instead:
        "Acompanhe a distribuição das entradas junto com a qualidade da saída e compare um conjunto canary fixo com o tráfego ao vivo amostrado para distinguir os dois.",
    },
    {
      id: "t4",
      trap: "Configure alertas em toda métrica monitorada para que nada passe despercebido.",
      why: "Alertar sobre métricas sem dono e sem resposta definida produz um fluxo de notificações que a equipe aprende a ignorar, o que soterra, com toda a confiabilidade, os poucos alertas que representam quebras genuínas visíveis ao usuário.",
      instead:
        "Acione o plantão apenas por sintomas que os usuários sentem, com um dono e um runbook, e encaminhe a degradação lenta para uma revisão agendada.",
    },
    {
      id: "t5",
      trap: "Avaliar uma amostra do tráfego ao vivo basta para detectar uma regressão, então um conjunto de avaliação fixo é redundante em produção.",
      why: "As notas amostradas ao vivo se movem sempre que o mix de tráfego se move, de modo que uma queda é ambígua entre o sistema estar piorando e as perguntas estarem ficando mais difíceis, e essa ambiguidade é exatamente o que trava uma investigação.",
      instead:
        "Rode um conjunto canary congelado em um agendamento, para que ao menos uma série tenha entradas constantes e movimento sem ambiguidade.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 4",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
    {
      label: "Claude Code Docs — Monitoramento",
      url: "https://code.claude.com/docs/en/monitoring-usage",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["4.2", "3.4"],
} satisfies Lesson;
