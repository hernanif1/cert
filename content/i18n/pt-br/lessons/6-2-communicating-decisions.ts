import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "6.2",
  slug: "6-2-communicating-decisions",
  domain: 6,
  objective: "Comunicar decisões de arquitetura e trade-offs",
  title: "Comunicando Decisões e Trade-offs",
  summary:
    "Uma decisão que não é registrada por escrito, com suas alternativas e consequências, volta a ser rediscutida a cada trimestre. A prova testa se você consegue enunciar um trade-off em números da sua própria carga de trabalho, moldá-lo para o público que está na sala e nomear a condição que faria você revertê-lo.",

  body: [
    {
      kind: "prose",
      md: "Arquitetos perdem decisões em que tinham razão porque apresentam a análise em vez da decisão. A correção é estrutural: comece pelo que foi decidido e quanto custa, registre o que foi rejeitado e diga de antemão o que faria você mudar de ideia.\n\nIsso importa mais para sistemas de IA do que para software comum, porque os trade-offs são desconhecidos para quem os financia. Acurácia, latência e custo estão acoplados pela escolha de modelo e pela profundidade da recuperação — uma passada de recuperação mais profunda compra fundamentação e gasta latência, um modelo mais forte compra taxa de resolução e gasta dinheiro por tarefa. Quem só comprou licenças por usuário até hoje não espera um botão de qualidade que também seja um botão de gasto.",
    },

    { kind: "heading", text: "Registre a decisão por escrito uma única vez" },
    {
      kind: "prose",
      md: "Um **architecture decision record** (ADR) é um documento curto que captura uma decisão no momento em que ela é tomada. Um **RFC** vem antes da decisão, para colher contribuições; o ADR registra o resultado e o raciocínio que levou a ele. Um ADR é imutável: quando o design muda, você escreve um novo registro que marca o antigo como substituído, porque o valor do log está em mostrar no que se acreditava na época e por quê.",
    },
    {
      kind: "code",
      lang: "text",
      code: "ADR-014: Rotear a classificação de entrada para o Haiku 4.5\n\nStatus:   Aceito em 2026-03-04 — substitui o ADR-009\nContexto: 38 mil tickets/mês. Orçamento de p95 de 2,5 s de ponta a\n          ponta. A classificação de entrada tem 5 rótulos sobre texto curto.\nDecisão:  O Haiku 4.5 classifica a entrada; casos de baixa confiança\n          escalam para o Opus 5 com a thread completa.\nOpções:   (a) Opus 5 para todo o tráfego — rejeitada: +0,9 s de p95 e ~6x\n              de custo por ticket resolvido por +1,4 pt de acurácia no nosso conjunto\n          (b) Passada única do Haiku 4.5, sem escalonamento — rejeitada: 2,1% dos\n              casos roteados errado para um caminho visível ao cliente\nRisco aceito: ~7% dos tickets seguem o caminho de escalonamento, mais lento.\nRevisitar quando: o escalonamento passar de 12% por duas semanas seguidas, ou\n                  o p95 passar de 2,5 s, ou o volume de entrada dobrar.",
    },

    { kind: "heading", text: "Molde a mensagem para o público" },
    {
      kind: "table",
      caption: "A mesma decisão, quatro versões",
      headers: ["Público", "Do que precisa", "O que deixar de fora", "Falha se você errar"],
      rows: [
        [
          "Patrocinador executivo",
          "A decisão, o custo por unidade de trabalho comparado ao baseline de hoje, o risco aceito, a data",
          "Nomes de modelos, chunking, estrutura de prompt",
          "O financiamento é cortado no meio do projeto por causa de uma conta sobre a qual ninguém foi avisado",
        ],
        [
          "Equipe de engenharia",
          "Interfaces, orçamentos por etapa, o que está fixado e o que ela pode escolher",
          "A narrativa de justificativa de negócio",
          "Quem implementa redecide em silêncio as restrições que você fixou",
        ],
        [
          "Segurança e conformidade",
          "Fluxo de dados, retenção, fronteiras de confiança, por onde entra texto não confiável",
          "Detalhes de ajuste de acurácia",
          "Um veto tardio, depois que o design está congelado e o orçamento foi gasto",
        ],
        [
          "Operações e usuários finais",
          "O que o sistema não vai fazer e como escalar quando ele errar",
          "Arquitetura",
          "Confiança mal depositada, seguida de abandono depois da primeira resposta errada e confiante",
        ],
      ],
    },
    {
      kind: "prose",
      md: "**Quantifique ou não afirme.** *O Opus 5 é mais capaz* não é um trade-off. *No nosso conjunto de 300 casos, o Opus 5 resolve 84% dos tickets sem ajuda contra 71% do Haiku 4.5, a cerca de seis vezes o custo por ticket resolvido e 900 ms a mais no p95* é — e foi medido na sua carga de trabalho, não emprestado de um benchmark que rodou a tarefa de outra pessoa.\n\n**Nunca insinue uma garantia que o sistema não pode dar.** Entradas idênticas podem produzir saídas diferentes, e uma atualização de modelo pode deslocar um comportamento em torno do qual um prompt foi ajustado. Escreva compromissos como taxas medidas sobre uma amostra e uma janela declaradas, e seja explícito sobre quais comportamentos são limitados por guardrails e gates, e não pela cooperação do modelo.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Toda recomendação deveria trazer uma **condição de reversão**: o observável que tornaria essa decisão errada. Ela converte uma opinião em um limiar monitorado, desloca a discordância do gosto para a evidência e dá a um patrocinador cético algo melhor que confiança — um alarme que ele mesmo pode conferir.",
    },

    {
      kind: "example",
      title: "Exemplo prático: defendendo um design com dois modelos",
      scenario:
        "Um CFO lê que o assistente de suporte usa dois modelos e pergunta por que a equipe não pode simplesmente usar o melhor. O design classifica a entrada com o Haiku 4.5 e escala os casos ambíguos para o Opus 5.",
      walkthrough:
        "1. **Abra com o número que pertence ao CFO.** Custo por ticket resolvido nos dois designs, calculado sobre o tráfego real do mês passado, incluindo novas tentativas e handoffs para humanos.\n2. **Nomeie o que se abre mão.** O roteamento classifica errado cerca de 2% dos casos que o design de modelo único teria resolvido; eles caem em uma fila de escalonamento, e não na frente de um cliente.\n3. **Mostre que a alternativa foi precificada, não descartada.** Opus 5 em tudo foi medido: compra 1,4 ponto de acurácia por cerca de seis vezes o custo unitário.\n4. **Declare a condição de reversão.** Se o escalonamento passar de 12% por duas semanas, o roteamento deixou de se pagar e o design é revisitado.\n5. **Registre.** A conversa vira o ADR-014, de modo que, da próxima vez que a pergunta for feita, a resposta é um link em vez de mais uma reunião.",
      takeaway:
        "O CFO nunca precisou entender roteamento. Precisava da diferença de custo, do risco que está sendo aceito em nome dele e da condição sob a qual a equipe mudaria de ideia.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Um passo a passo técnico minucioso para um público executivo é escrito para parecer rigoroso, e geralmente é o distrator. A decisão desaparece dentro da análise e o patrocinador não consegue agir sobre ela. A profundidade pertence ao ADR para o qual o resumo de cinco slides aponta, não à sala onde a aprovação está sendo pedida.",
    },

    {
      kind: "practice",
      questionIds: [
        "D6-q201",
        "D6-q202",
        "D6-q203",
        "D6-q204",
        "D6-q205",
        "D6-q206",
        "D6-q207",
        "D6-q208",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Architecture decision record (ADR)",
      definition:
        "Um registro curto e imutável de uma decisão: contexto, a decisão, as alternativas rejeitadas e por quê, e as consequências aceitas. É substituído por um novo registro, em vez de editado.",
    },
    {
      term: "RFC",
      definition:
        "Uma proposta que circula para comentários antes de uma decisão ser tomada. O ADR é aquilo em que o RFC se resolve depois que a escolha é feita.",
    },
    {
      term: "Condição de reversão",
      definition:
        "O observável mensurável que invalidaria uma decisão, registrado junto com ela. Transforma um julgamento contestado em um limiar monitorado.",
    },
    {
      term: "Risco aceito",
      definition:
        "A consequência que uma decisão assume conscientemente, declarada no registro para que ninguém a descubra mais tarde como um defeito-surpresa.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Um ADR deve ser atualizado conforme o sistema evolui, para sempre descrever o comportamento atual.",
      why: "Editar um registro de decisão destrói a única coisa para a qual ele serve — o raciocínio disponível na época — e não deixa rastro de por que a escolha anterior foi feita nem do que mudou para invalidá-la.",
      instead:
        "Escreva um novo ADR e marque o antigo como substituído, deixando o texto original intacto.",
    },
    {
      id: "t2",
      trap: "Apresentar a avaliação completa e todas as opções consideradas demonstra rigor para um público executivo.",
      why: "Executivos precisam da decisão, do custo dela e do risco aceito para aprovar ou objetar; enterrar isso no caminho da análise consome a reunião e muitas vezes não produz decisão nenhuma.",
      instead:
        "Comece pela decisão, pelo custo por unidade de trabalho e pela condição de reversão; o detalhe vai em um link.",
    },
    {
      id: "t3",
      trap: "Como o comportamento do modelo é variável, é mais seguro não colocar números em um trade-off.",
      why: "Recusar-se a quantificar entrega a decisão a quem estiver mais confiante na sala, e a variabilidade se trata reportando taxas sobre uma amostra e uma janela declaradas, não ficando vago.",
      instead:
        "Meça os candidatos no seu próprio conjunto de casos e reporte juntos a acurácia, o custo por tarefa concluída e a latência p95.",
    },
    {
      id: "t4",
      trap: "Uma decisão está comunicada quando a equipe concordou com ela na revisão de design.",
      why: "Acordo verbal não deixa registro das alternativas nem do risco aceito, então o mesmo debate se reabre sempre que chega um novo stakeholder ou o sistema se comporta mal de um jeito sobre o qual ninguém avisou.",
      instead:
        "Encerre toda revisão de design escrevendo o ADR, incluindo o que foi rejeitado e o gatilho de revisão.",
    },
    {
      id: "t5",
      trap: "Quando os stakeholders pedem a melhor qualidade possível, recomendar o modelo mais capaz é a resposta segura.",
      why: "Isso compromete o negócio, em silêncio, com um perfil de custo e latência que ele nunca avaliou, e pula a comparação que mostraria se a diferença de capacidade de fato muda algum resultado que importa para ele.",
      instead:
        "Apresente o ganho medido por unidade de custo e de latência, e deixe o patrocinador aceitar a troca explicitamente.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 6",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Building Effective Agents — Anthropic Engineering",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],

  relatedLessons: ["6.4", "6.5"],
} satisfies Lesson;
