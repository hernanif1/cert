import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "4.1",
  slug: "4-1-evaluation-metrics",
  domain: 4,
  objective:
    "Definir métricas de avaliação (acurácia, latência, custo, segurança operacional, segurança da informação)",
  title: "Definindo Métricas de Avaliação",
  summary:
    "Um sistema com LLM só pode ser melhorado na medida das métricas definidas para ele, e \"acurácia\" sozinha não é métrica. A prova espera uma medida concreta, um método de medição e um limiar acionável para cada uma de cinco famílias: acurácia, latência, custo, segurança operacional (safety) e segurança da informação (security).",

  body: [
    {
      kind: "prose",
      md: "Antes de melhorar um sistema é preciso medi-lo, e antes de medi-lo alguém precisa decidir o que *bom* significa em número. Essa decisão cabe ao arquiteto, porque toda métrica codifica um compromisso: uma meta de latência é uma promessa de experiência do usuário, um teto de custo é uma promessa de economia unitária, e um limiar de segurança operacional é uma postura de risco que o negócio concordou em sustentar.\n\nUma definição de métrica utilizável tem três partes, e abrir mão de qualquer uma delas deixa um número incapaz de encerrar uma discussão:",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "**A medida** — o que é contado, e em qual unidade. *Acurácia* não é uma medida; *percentual de totais de fatura extraídos que batem exatamente com o livro-razão* é.",
        "**O método** — como o valor é produzido: uma asserção determinística em código, um modelo avaliando contra uma rubrica, um revisor humano ou um contador de produção.",
        "**O limiar** — o número a partir do qual uma decisão muda. Métrica sem limiar produz um dashboard sobre o qual ninguém age.",
      ],
    },

    { kind: "heading", text: "As cinco famílias" },
    {
      kind: "table",
      caption: "Cada família responde a uma pergunta diferente e é medida em um lugar diferente",
      headers: ["Família", "Pergunta que responde", "Medida típica", "Onde é medida"],
      rows: [
        [
          "Acurácia",
          "A saída está certa para esta tarefa?",
          "Correspondência exata, F1 por campo, taxa de groundedness, nota de rubrica",
          "Offline, contra um dataset rotulado",
        ],
        [
          "Latência",
          "Quanto tempo o usuário espera?",
          "Tempo até o primeiro token e tempo total de conclusão em p50/p95/p99",
          "Online, por requisição",
        ],
        [
          "Custo",
          "Quanto custa uma unidade de valor de negócio?",
          "Custo por tarefa concluída com sucesso, com entrada e saída separadas",
          "Online, agregado por tarefa",
        ],
        [
          "Segurança operacional (safety)",
          "O sistema se comporta de forma aceitável?",
          "Taxa de saídas nocivas pareada com a taxa de falsas recusas",
          "Conjunto adversarial mais amostra do tráfego de produção",
        ],
        [
          "Segurança da informação (security)",
          "É possível fazer o sistema se comportar mal?",
          "Taxa de sucesso de injeção, chamadas de tool não autorizadas, taxa de vazamento",
          "Suíte de red team mantida mais contadores dos controles",
        ],
      ],
    },
    {
      kind: "prose",
      md: "**A acurácia tem o formato da tarefa.** Classificação admite correspondência exata e recall por classe. Extração admite precisão e recall por campo. Sumarização e redação aberta não admitem nenhum dos dois e precisam de uma rubrica pontuada por um juiz ou por um humano. Uma resposta fundamentada em recuperação precisa de dois números separados — *groundedness*, isto é, toda afirmação remonta ao contexto recuperado, e *relevância*, isto é, a resposta trata da pergunta — porque um sistema pode ser perfeitamente fundamentado e ainda assim inútil.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Reporte a latência como distribuição, nunca como média. A média é dominada pela maioria rápida e esconde a cauda que gera toda reclamação e todo timeout. Divida ainda mais: o **tempo até o primeiro token** governa a responsividade percebida em uma interface com streaming, o **tempo total de conclusão** governa um job em batch. Otimizar o errado é trabalho jogado fora.",
    },
    {
      kind: "prose",
      md: "**Custo por token é um fato contábil, não uma métrica.** O número que sustenta uma decisão é o custo por tarefa *concluída com sucesso*, porque um modelo mais barato que falha uma vez em cada cinco e dispara um retry ou um handoff humano não é mais barato. Acompanhe tokens de entrada e de saída separadamente: eles têm preços diferentes, a entrada em cache é ainda mais barata, e cada um responde a otimizações completamente distintas.\n\n**Segurança operacional exige uma métrica pareada.** A taxa de saídas nocivas, sozinha, é levada a zero por um sistema que recusa tudo, por isso ela é sempre reportada junto de uma taxa de falsas recusas em requisições benignas. É o par que impede que uma seja otimizada às custas da outra.\n\n**Segurança da informação é adversarial, portanto não se amostra do tráfego normal.** Resistência a injeção, violações de autorização de tools e vazamento de dados são medidos contra uma suíte deliberadamente hostil, que cresce a cada novo ataque descoberto. O tráfego comum de produção quase não contém ataques, então uma métrica de segurança amostrada do tráfego parece perfeita até o dia em que deixa de parecer.",
    },

    {
      kind: "example",
      title: "Exemplo prático: métricas para um assistente de triagem de sinistros",
      scenario:
        "Um assistente lê um sinistro submetido, extrai oito campos estruturados, classifica o sinistro em um de cinco fluxos de tratamento e redige uma nota para o regulador. A equipe propõe uma única métrica: acurácia acima de 90%.",
      walkthrough:
        "1. **Divida a acurácia por tipo de saída.** A extração recebe correspondência exata por campo contra o livro-razão. A classificação recebe recall por classe, porque o fluxo raro de alta severidade importa muito mais que o comum, e um número geral o esconderia. A nota redigida recebe uma rubrica pontuada por um juiz, com verificação por amostragem feita por humanos.\n2. **Coloque cada limiar onde uma decisão muda.** 90% na classe de alta severidade significa um sinistro grave em cada dez roteado errado, o que o negócio não vai aceitar; essa classe recebe 99% mais uma etapa obrigatória de revisão humana.\n3. **Acrescente as outras quatro famílias.** p95 de ponta a ponta abaixo de oito segundos, custo por sinistro triado abaixo do baseline manual, falsas recusas abaixo de 1% em sinistros benignos e tolerância zero para dados de um sinistro aparecerem na saída de outro.\n4. **Nomeie o método de cada uma.** Duas são asserções em código, uma é um juiz calibrado, três são contadores de produção.",
      takeaway:
        "Um número único para um sistema com várias saídas é um slogan, não uma métrica. Decompô-lo é a maior parte do trabalho, e a prova recompensa a decomposição.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Alternativas que oferecem *uma única nota geral de qualidade* ou *a satisfação média do usuário* como métrica principal de acurácia são escritas para parecer maduras. São agregadas e atrasadas: quando o número cai, não dá para atribuir o movimento a nenhum componente. A alternativa correta define medidas por capacidade, com limiares explícitos.",
    },

    {
      kind: "practice",
      questionIds: [
        "D4-q101",
        "D4-q102",
        "D4-q103",
        "D4-q104",
        "D4-q105",
        "D4-q106",
        "D4-q107",
        "D4-q108",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Groundedness",
      definition:
        "A parcela das afirmações de uma saída que é sustentada pelo contexto fornecido ao modelo. Medida separadamente da relevância, já que uma resposta pode ser totalmente fundamentada e ainda assim não responder à pergunta.",
    },
    {
      term: "Tempo até o primeiro token (TTFT)",
      definition:
        "Tempo decorrido entre a requisição e o primeiro token de saída transmitido. A métrica que governa a responsividade percebida em uma interface interativa, distinta do tempo total de conclusão.",
    },
    {
      term: "Custo por tarefa bem-sucedida",
      definition:
        "Gasto total, incluindo retries e escalonamentos, dividido pelas tarefas concluídas em um padrão aceitável. A métrica de custo que sobrevive a uma troca de modelo; o custo por token não sobrevive.",
    },
    {
      term: "Taxa de falsas recusas",
      definition:
        "A parcela de requisições benignas que o sistema recusa. O contrapeso que impede que a taxa de saídas nocivas seja otimizada por recusa generalizada.",
    },
    {
      term: "Métrica de guardrail",
      definition:
        "Uma métrica que não é o objetivo de uma mudança, mas que não pode piorar por causa dela — latência e custo enquanto se busca acurácia, taxa de recusa enquanto se busca segurança operacional. Sempre escrita na forma composta, porque um guardrail no Domínio 5 é um controle no caminho da requisição, e não uma medição.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Acurácia é um número único que descreve o quão bem o sistema funciona.",
      why: "Um sistema com vários tipos de saída falha de várias maneiras distintas, e um único valor agregado se move por razões que não podem ser atribuídas a nenhum componente, de modo que nunca consegue orientar uma correção.",
      instead:
        "Defina uma medida por capacidade e pondere cada limiar pela consequência para o negócio.",
    },
    {
      id: "t2",
      trap: "O tempo médio de resposta é o número de latência certo para assumir em um SLA.",
      why: "A média é dominada pela maioria rápida e oculta a cauda lenta responsável por toda reclamação e todo timeout, de modo que um SLA escrito sobre ela pode ser cumprido com folga enquanto os usuários sofrem.",
      instead:
        "Comprometa-se com percentis e separe o tempo até o primeiro token do tempo total de conclusão.",
    },
    {
      id: "t3",
      trap: "Custo por milhão de tokens é a métrica de custo a acompanhar e otimizar.",
      why: "O preço unitário do token ignora quantas tentativas uma tarefa realmente exige, de modo que um modelo mais barato, com taxa maior de falha e de retry, pode elevar o gasto total enquanto o número acompanhado cai.",
      instead:
        "Acompanhe o custo por tarefa concluída com sucesso, com entrada, entrada em cache e saída discriminadas.",
    },
    {
      id: "t4",
      trap: "Uma taxa muito baixa de saídas nocivas mostra que os controles de segurança operacional estão bem calibrados.",
      why: "Essa taxa é minimizada trivialmente por um sistema que recusa de forma agressiva, de modo que, sozinha, ela não diz nada sobre se as requisições legítimas continuam sendo atendidas.",
      instead:
        "Sempre a pareie com uma taxa de falsas recusas em um conjunto benigno e calibre as duas juntas.",
    },
    {
      id: "t5",
      trap: "A postura de segurança pode ser medida monitorando o tráfego de produção em busca de ataques.",
      why: "O tráfego genuíno quase não contém ataques deliberados, de modo que a taxa observada mede a atividade dos atacantes, e não a resistência do sistema, e parece saudável até uma campanha começar.",
      instead:
        "Meça contra uma suíte adversarial mantida, que cresce a cada nova descoberta.",
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
  ],

  relatedLessons: ["4.2", "4.5"],
} satisfies Lesson;
