import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "1.1",
  slug: "1-1-business-problem-translation",
  domain: 1,
  objective: "Traduzir problemas de negócio em soluções de IA baseadas no Claude",
  title: "Traduzindo Problemas de Negócio",
  summary:
    "A tradução transforma um resultado de negócio declarado em uma especificação no nível da tarefa, com um critério de sucesso mensurável e uma margem de erro explícita. A maioria dos projetos de IA que fracassam foi mal traduzida nesta etapa, e não mal construída depois.",

  body: [
    {
      kind: "prose",
      md: "Um patrocinador nunca chega com um problema de IA. Ele chega com um custo, um atraso, um backlog ou um risco — *sinistros levam onze dias para serem liquidados*, *analistas gastam dois dias por semana lendo relatórios regulatórios* — e o primeiro trabalho do arquiteto é converter isso em algo contra o qual um sistema possa ser construído e, mais importante, medido.\n\nUma tradução está completa quando existem quatro artefatos. Trabalho de design que começa antes de os quatro estarem escritos é adivinhação:",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "**O resultado e sua métrica.** O número que o negócio vai de fato conferir daqui a seis meses. *Sinistros mais rápidos* não é métrica; *mediana de liquidação abaixo de três dias* é.",
        "**A tarefa.** A unidade específica de trabalho que o sistema executa, com escopo pequeno o bastante para que uma saída seja uma decisão. Departamentos não são tarefas e cargos não são tarefas.",
        "**O critério de sucesso.** Como é uma boa saída, descrito de forma concreta o suficiente para que dois revisores avaliando a mesma saída concordem. Isso se torna o conjunto de avaliação.",
        "**A margem de erro.** Quanto custa uma saída errada, quem a detecta e quanto erro o processo ao redor consegue absorver antes que o negócio deixe de confiar no sistema.",
      ],
    },

    { kind: "heading", text: "Delimite pela tarefa, não pelo cargo" },
    {
      kind: "prose",
      md: "*Automatizar a subscrição* é uma linha de orçamento, não uma especificação. A subscrição de riscos reúne uma dúzia de atividades distintas — coletar documentos, extrair campos, conferi-los contra um conjunto de regras, precificar o risco, redigir uma justificativa, dar a aprovação final — e elas diferem enormemente em quão bem se adaptam a um modelo de linguagem e em quanto custa um erro.\n\nDecomponha o trabalho até encontrar tarefas com três propriedades: a entrada está disponível em formato legível por máquina, o julgamento envolvido está documentado em algum lugar que possa ser entregue ao modelo, e uma resposta errada é detectada por alguma coisa. É nessas tarefas que uma solução baseada no Claude se paga. O restante do trabalho fica onde está, e isso é um resultado bem-sucedido, não um resultado parcial.",
    },

    { kind: "heading", text: "É um problema com o formato do Claude?" },
    {
      kind: "prose",
      md: "Nem todo processo caro é um problema de linguagem. O teste de adequação diz respeito ao formato do trabalho, não ao seu custo.\n\n**Boa adequação:** linguagem não estruturada ou semiestruturada na entrada, um julgamento que uma pessoa competente conseguiria fazer a partir de critérios escritos, volume suficiente para que a consistência importe e uma etapa posterior capaz de absorver ou detectar um erro.\n\n:::example\n*Uma boa requisição:* “Recebemos 4.000 e-mails de reclamação por mês. Queremos classificar cada um em uma das doze categorias do nosso manual de atendimento e extrair número do pedido e motivo, para que o atendente abra o chamado já preenchido e corrija o que estiver errado.” As quatro condições valem, e o atendente detecta o erro antes que ele custe alguma coisa.\n:::\n\n**Má adequação:** aritmética que precisa ser exata, uma consulta que uma API existente já responde de forma determinística, um conjunto de regras pequeno e estável o bastante para ser expresso em código, ou uma decisão que ninguém está disposto a revisar. Esta última é a que mais importa — uma decisão não revisável e sem margem de erro é um problema de governança antes de ser um problema de arquitetura.\n\n:::example\n*Uma má requisição:* “Queremos que o Claude calcule a indenização de cada sinistro a partir da tabela de coberturas e pague automaticamente, sem ninguém conferir.” Aritmética exata sobre uma tabela estável cabe em código determinístico, e o pagamento é uma decisão que ninguém vai revisar. Nada no pedido tem formato de linguagem, e a única etapa que detectaria um erro foi removida.\n:::",
    },
    {
      kind: "table",
      caption: "Como o enquadramento do patrocinador restringe a arquitetura",
      headers: [
        "O que o patrocinador diz",
        "O que isso de fato restringe",
        "Consequência de design",
      ],
      rows: [
        [
          "Reduzir o ciclo do sinistro de onze dias para três",
          "Vazão (throughput) e tempo de fila, não a velocidade por requisição",
          "Processamento assíncrono em batch é aceitável; decomposição paralela vence um modelo mais rápido",
        ],
        [
          "Um sinistro válido jamais pode ser negado automaticamente",
          "Um custo de erro assimétrico",
          "Otimize para recall, encaminhe os casos de baixa confiança a um revisor e nunca deixe o sistema emitir uma negativa",
        ],
        [
          "Os analistas deveriam parar de ler os relatórios de ponta a ponta",
          "Horas devolvidas a um grupo específico",
          "Apoie o analista com extração e resumo; deixe o julgamento com a pessoa",
        ],
        [
          "As respostas do suporte precisam aparecer em até dois segundos",
          "Um compromisso rígido de latência por requisição",
          "Modelo de tier menor, prompt caching e um orçamento de recuperação fixado em tempo de design",
        ],
        [
          "Temos de defender a decisão perante um auditor",
          "Explicabilidade e evidência, não apenas acurácia",
          "Emita citações e armazene entradas, saídas e versões como um registro durável",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Um critério de sucesso que não pode ser avaliado não é um critério de sucesso. Antes de se comprometer com uma arquitetura, escreva vinte entradas representativas e a saída que você aceitaria para cada uma — duas delas estão abaixo. Se o time não conseguir concordar sobre essas vinte, o problema ainda está mal traduzido, e nenhuma escolha de modelo vai salvá-lo.",
    },
    {
      kind: "code",
      lang: "text",
      code: '[\n  {\n    "entrada": "O pedido 48213 chegou com a tela rachada, quero a troca.",\n    "aceito": {\n      "categoria": "dano no transporte",\n      "pedido": "48213",\n      "motivo": "tela rachada na entrega",\n      "chamado": "pré-preenchido, atendente aprova"\n    }\n  },\n  {\n    "entrada": "Já é a terceira vez que vocês erram e ninguém me retorna.",\n    "aceito": {\n      "categoria": "reclamação de atendimento",\n      "pedido": null,\n      "motivo": "falha recorrente, sem retorno",\n      "confianca": "baixa",\n      "chamado": "aberto em branco, encaminhado ao atendente"\n    },\n    "nota": "Chutar o número do pedido é uma falha mesmo quando o chute acerta."\n  }\n]',
    },

    {
      kind: "example",
      title: "Exemplo prático: 'queremos IA para sinistros'",
      scenario:
        "Uma seguradora regional pede um sistema de IA para tratar sinistros de automóvel, com a meta declarada de cortar o custo de tratamento em 40%. Os sinistros chegam por e-mail com fotos e PDFs anexados, um regulador os analisa contra os termos da apólice, e cerca de 60% são rotineiros.",
      walkthrough:
        "1. **Encontre a métrica.** Custo de tratamento é hora de regulador por sinistro, o que aponta para o tempo do regulador, e não para o sistema de sinistros.\n2. **Decomponha o trabalho.** Seis atividades. Os reguladores relatam que a triagem inicial — ler o e-mail, extrair os campos, conferir se os anexos estão completos — consome 45 dos 70 minutos.\n3. **Teste a adequação.** A triagem inicial recebe linguagem não estruturada e imagens e devolve campos estruturados, contra regras de completude documentadas. Forte adequação. A apuração de responsabilidade é um julgamento contestado, com exposição jurídica. Má adequação.\n4. **Defina a margem de erro.** Um anexo faltante é detectado pelo regulador na revisão e custa minutos. Uma atribuição de responsabilidade errada custa um processo judicial. As duas margens não têm nada em comum, e é por isso que as tarefas não podem compartilhar um único design.\n5. **Delimite a construção.** Extração e verificação de completude, com o regulador confirmando um formulário pré-preenchido. A responsabilidade continua com humanos.",
      takeaway:
        "A entrega é mais estreita que o pedido e move mais a métrica, porque mira onde as horas de fato são gastas e mantém a decisão não revisável com uma pessoa.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Os distratores deste objetivo partem da tecnologia, e não do problema: *prototipe com o modelo mais capaz e itere*, *indexe primeiro todo o acervo*, *substitua o processo de ponta a ponta*. Todos pulam a métrica, a tarefa e a margem de erro. A resposta do gabarito nomeia um resultado mensurável e uma tarefa delimitada.",
    },

    {
      kind: "practice",
      questionIds: [
        "D1-q101",
        "D1-q102",
        "D1-q103",
        "D1-q104",
        "D1-q105",
        "D1-q106",
        "D1-q107",
        "D1-q108",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Delimitação da tarefa",
      definition:
        "Estreitar um pedido do negócio até que uma saída do sistema corresponda a uma decisão, para que o trabalho possa ser especificado, avaliado e delimitado.",
    },
    {
      term: "Critério de sucesso",
      definition:
        "Uma declaração concreta de como é uma saída aceitável, escrita de modo que dois revisores independentes avaliem a mesma saída da mesma forma.",
    },
    {
      term: "Margem de erro",
      definition:
        "Quanto erro, e de que tipo, o processo ao redor consegue absorver, incluindo quem detecta um erro e quanto ele custa quando ninguém detecta.",
    },
    {
      term: "Fronteira da decisão humana",
      definition:
        "A linha entre os julgamentos que o sistema pode fazer e os que uma pessoa precisa fazer, fixada pelo custo de errar, e não pela capacidade do modelo.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A meta de negócio pode servir diretamente como critério de sucesso do sistema.",
      why: "Uma meta como redução de 40% no custo é medida em um processo ao longo de meses, enquanto um critério de sucesso precisa ser verificável em uma única saída hoje, e é isso que torna possível um conjunto de avaliação.",
      instead:
        "Derive da meta um critério por saída e mantenha a meta como a métrica de resultado contra a qual você reporta.",
    },
    {
      id: "t2",
      trap: "Um processo caro é, por definição, um bom candidato a uma solução baseada no Claude.",
      why: "O custo diz que o processo importa, mas não diz nada sobre se o trabalho tem formato de linguagem, se o julgamento está documentado em algum lugar ou se uma resposta errada seria detectada mais adiante.",
      instead:
        "Aplique o teste de adequação à tarefa e depois dimensione a oportunidade por onde as horas de fato se acumulam.",
    },
    {
      id: "t3",
      trap: "Automatizar o trabalho inteiro vale mais do que automatizar parte dele.",
      why: "O valor vem das horas que o design de fato move, e uma tarefa estreita com margem de erro real entra em produção, enquanto a reescrita do trabalho inteiro emperra na única atividade que ninguém deixa um sistema decidir.",
      instead:
        "Recorte as tarefas que passam no teste de adequação e deixe o julgamento contestado com uma pessoa, de propósito.",
    },
    {
      id: "t4",
      trap: "Acurácia é a métrica certa para qualquer problema de classificação.",
      why: "A acurácia trata todo erro como igual, mas no negócio eles não são: revisar um caso à toa custa alguns minutos, liberar uma fraude custa o valor da transação. Um modelo com alta acurácia pode estar errando justamente onde dói.",
      instead:
        "Escolha a métrica que reflete esse custo — em geral, recall com um limite de quantos casos vão para revisão.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 1",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["1.6"],
} satisfies Lesson;
