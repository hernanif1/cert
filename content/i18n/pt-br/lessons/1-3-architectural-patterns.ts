import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "1.3",
  slug: "1-3-architectural-patterns",
  domain: 1,
  objective:
    "Selecionar padrões de arquitetura apropriados (workflow, agêntico, LLM aumentado)",
  title: "Escolhendo um Padrão de Arquitetura",
  summary:
    "Três níveis estão sendo distinguidos — o LLM aumentado, os workflows cujo fluxo de controle vive no código e os agentes que conduzem o próprio processo. A prova recompensa a escolha do nível mais simples que atende ao requisito e penaliza a autonomia que o problema nunca pediu.",

  body: [
    {
      kind: "prose",
      md: "Toda a taxonomia gira em torno de uma pergunta: quem decide o que acontece em seguida.\n\n**O LLM aumentado** é uma única chamada ao modelo estendida com recuperação, tools e memória. É o bloco de construção de que todos os outros padrões são feitos, e é uma arquitetura completa por si só para uma grande parcela dos requisitos reais.\n\n**Um workflow** orquestra várias chamadas ao modelo ao longo de um caminho definido em código. Os passos são conhecidos antes de a requisição chegar; o modelo os preenche.\n\n**Um agente** decide os próprios passos. Ele escolhe uma tool, avalia o resultado e continua até julgar a tarefa concluída ou até uma condição de parada disparar.\n\nA orientação publicada é inequívoca, e a prova a segue: use o padrão mais simples que atende ao requisito e acrescente complexidade apenas onde ela comprovadamente compra alguma coisa. Designs agênticos trocam latência, custo e previsibilidade por flexibilidade, o que só é uma boa troca quando a flexibilidade é necessária.",
    },

    { kind: "heading", text: "Os padrões de workflow que vale a pena nomear" },
    {
      kind: "table",
      caption: "Padrões de workflow e o sinal que seleciona cada um",
      headers: ["Padrão", "Formato", "Escolha quando"],
      rows: [
        [
          "Encadeamento de prompts (prompt chaining)",
          "Uma sequência fixa, cada passo consumindo o anterior",
          "Os passos são conhecidos de antemão e cada resultado intermediário é verificável",
        ],
        [
          "Roteamento (routing)",
          "Classificar primeiro, depois despachar para um caminho especializado",
          "As entradas caem em classes distintas que exigem prompts, tools ou políticas diferentes",
        ],
        [
          "Paralelização",
          "Subtarefas independentes ao mesmo tempo — seccionamento, ou votação sobre uma mesma tarefa",
          "O trabalho se divide em partes independentes, ou várias tentativas aumentam a confiança",
        ],
        [
          "Orquestrador–trabalhadores (orchestrator–workers)",
          "Uma chamada líder decompõe em tempo de execução e delega",
          "As subtarefas dependem da entrada e não podem ser enumeradas de antemão",
        ],
        [
          "Avaliador–otimizador (evaluator–optimizer)",
          "Gerar, pontuar contra uma rubrica, revisar",
          "Existe uma avaliação clara e uma segunda passada melhora o rascunho de forma confiável",
        ],
      ],
    },
    {
      kind: "prose",
      md: "Orquestrador–trabalhadores é o padrão mais frequentemente rotulado de forma errada. É um workflow, porque a estrutura geral é fixada pelo projetista, mas suas subtarefas são produzidas em tempo de execução, em vez de escritas de antemão. É isso que o distingue da paralelização, e é o que o deixa mais perto da fronteira agêntica sem cruzá-la. O cruzamento acontece um passo depois, e o Objetivo 1.4 traça a linha: um delegado que roda o próprio loop de tools e decide por conta própria quando terminou é um segundo agente, enquanto um que executa uma única subtarefa gerada e retorna não é.",
    },

    { kind: "heading", text: "Escolhendo entre os três níveis" },
    {
      kind: "list",
      ordered: true,
      items: [
        "Você consegue escrever os passos antes de a requisição chegar? Se sim, é um workflow. O teste é a enumerabilidade, não a complexidade.",
        "O número de passos depende do que os resultados intermediários revelam? É para esse caso que os agentes existem.",
        "O ambiente dá ao modelo um feedback sobre o qual ele consegue agir, e um passo errado é recuperável dentro do loop? Sem as duas coisas, a autonomia acumula erros em vez de corrigi-los.",
        "Uma única chamada fundamentada basta? Então o LLM aumentado é a resposta, e qualquer coisa além disso é puro custo.",
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Tool use não torna um sistema agêntico. Agência é uma propriedade do fluxo de controle: um modelo que escolhe tools dentro de um passo cuja posição na sequência foi fixada pelo código ainda está rodando um workflow. Pergunte quem decide o que acontece em seguida, todas as vezes.",
    },

    {
      kind: "example",
      title: "Exemplo prático: escolhendo um padrão para endossos de apólice",
      scenario:
        "Uma seguradora processa pedidos de endosso de apólice. Todo pedido é validado, classificado em um de quatro tipos de endosso, tem seus campos extraídos, é precificado e gera uma carta ao cliente. A sequência nunca varia. Um fornecedor propõe substituir o pipeline por um agente autônomo.",
      walkthrough:
        "1. **Enumere.** Os cinco passos já estão escritos, em ordem, no runbook existente. Isso resolve a primeira pergunta: é um workflow.\n2. **Procure uma divisão em classes.** Os quatro tipos de endosso exigem campos de extração e regras de precificação diferentes, então um passo de roteamento depois da classificação justifica o seu lugar.\n3. **Verifique se há algo em aberto.** Nada em um pedido muda quais passos rodam, só qual ramo roda. Nenhum requisito agêntico aparece.\n4. **Precifique a alternativa.** Um agente redescobriria os mesmos cinco passos a cada pedido, com latência maior e custo variável, e tornaria o pipeline mais difícil de auditar — um problema real em um processo regulado.\n5. **Decida.** Encadeamento de prompts com um passo de roteamento, cada passo validado por schema.",
      takeaway:
        "O agente não foi rejeitado porque agentes são ruins. Foi rejeitado porque a flexibilidade que ele vende não era um requisito aqui, enquanto os seus custos eram certos.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Os itens deste objetivo oferecem a opção agêntica como a resposta sofisticada, geralmente vestida com palavras como *autônomo* ou *autodirigido*. Quando o enunciado afirma ou dá a entender que os passos são conhecidos de antemão, essa opção é o distrator. Recorra a um agente apenas quando o enunciado mostrar que o caminho de fato varia a cada requisição.",
    },

    {
      kind: "practice",
      questionIds: [
        "D1-q301",
        "D1-q302",
        "D1-q303",
        "D1-q304",
        "D1-q305",
        "D1-q306",
        "D1-q307",
        "D1-q308",
      ],
    },
  ],

  keyTerms: [
    {
      term: "LLM aumentado",
      definition:
        "Uma única chamada ao modelo estendida com recuperação, tools e memória. O bloco de construção de todos os outros padrões e uma arquitetura completa para muitos requisitos.",
    },
    {
      term: "Workflow",
      definition:
        "Várias chamadas ao modelo orquestradas ao longo de um caminho definido em código, em que os passos são conhecidos antes de a requisição chegar.",
    },
    {
      term: "Agente",
      definition:
        "Um sistema em que o modelo conduz o próprio processo — escolhendo tools, avaliando resultados e continuando — até julgar a tarefa concluída ou até uma condição de parada disparar.",
    },
    {
      term: "Teste de enumerabilidade",
      definition:
        "A pergunta que separa workflow de agente: os passos podem ser escritos antes de a requisição chegar, ou o caminho depende do que é descoberto ao longo do percurso.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Uma arquitetura agêntica é a escolha mais avançada e, portanto, a recomendação mais segura.",
      why: "Autonomia é uma troca, não um upgrade: ela compra flexibilidade com latência adicional, custo variável e previsibilidade reduzida, e uma tarefa com sequência fixa não tem uso para nada disso.",
      instead:
        "Escolha o padrão mais simples que atende ao requisito e só suba de nível quando o caminho de fato variar a cada requisição.",
    },
    {
      id: "t2",
      trap: "Qualquer sistema que chama tools é um agente.",
      why: "A disponibilidade de tools é ortogonal ao fluxo de controle: tanto uma única chamada aumentada quanto um workflow conduzido por código usam tools sem que um modelo jamais escolha a sequência de passos.",
      instead:
        "Classifique por quem decide o próximo passo — o caminho do código ou o modelo.",
    },
    {
      id: "t3",
      trap: "Orquestrador–trabalhadores é um sistema multiagente, e não um padrão de workflow.",
      why: "A estrutura de orquestração é fixada pelo projetista, ainda que as subtarefas sejam geradas a cada requisição, e essa estrutura fixa é exatamente o que mantém o padrão do lado workflow da linha.",
      instead:
        "Trate a geração de subtarefas em tempo de execução como aquilo que o distingue da paralelização, não como evidência de agência.",
    },
    {
      id: "t4",
      trap: "Um passo de roteamento deve usar o mesmo modelo dos ramos para os quais ele roteia.",
      why: "Classificar uma entrada em um punhado de classes conhecidas é uma tarefa muito mais fácil do que o trabalho seguinte, então rodar o roteador no tier mais pesado acrescenta latência e custo a cada requisição, sem ganho mensurável de acurácia.",
      instead:
        "Dimensione o roteador para a tarefa de classificação e reserve capacidade para os caminhos especializados.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 1",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Building Effective Agents — Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],

  relatedLessons: ["1.4", "1.5"],
} satisfies Lesson;
