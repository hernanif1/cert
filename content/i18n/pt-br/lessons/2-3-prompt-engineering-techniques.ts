import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "2.3",
  slug: "2-3-prompt-engineering-techniques",
  domain: 2,
  objective:
    "Aplicar técnicas de engenharia de prompt (zero-shot, few-shot, chain-of-thought)",
  title: "Técnicas de Engenharia de Prompt",
  summary:
    "Zero-shot, few-shot e chain-of-thought não são uma escada que você sobe; são três respostas para três modos de falha diferentes. A prova entrega um sintoma e espera que você aponte a técnica que o resolve — e que reconheça os casos em que nenhuma técnica de prompt vai ajudar.",

  body: [
    {
      kind: "prose",
      md: "Toda técnica deste objetivo custa tokens, e tokens custam dinheiro e latência em cada requisição, para sempre. A disciplina, portanto, é diagnóstica: identifique o que o modelo está de fato errando e então aplique a técnica mais barata que ataque aquele defeito específico.",
    },
    {
      kind: "list",
      items: [
        "**Zero-shot** — uma instrução clara, o contexto necessário e um contrato de saída explícito, sem exemplos. É o padrão. É a opção mais barata e basta com muito mais frequência do que os praticantes esperam.",
        "**Few-shot** — um pequeno conjunto de pares entrada/saída que demonstram a tarefa. Use quando a tarefa for mais fácil de *mostrar* do que de descrever: um estilo da casa, uma taxonomia de rótulos incomum, um formato de saída fora do padrão ou uma decisão de julgamento na fronteira entre duas categorias.",
        "**Chain-of-thought** — instruir o modelo a percorrer passos intermediários antes de se comprometer com uma resposta. Use quando os erros forem erros de raciocínio: o modelo conhece os fatos e pula um passo.",
      ],
    },

    { kind: "heading", text: "Casando a técnica com a falha" },
    {
      kind: "table",
      caption: "Primeiro diagnostique, depois escolha",
      headers: ["Sintoma", "Técnica", "Por que essa"],
      rows: [
        [
          "O formato da saída oscila entre requisições, apesar de haver um formato descrito",
          "Few-shot, de três a cinco exemplos no formato-alvo exato",
          "Uma estrutura é transmitida com mais precisão por demonstração do que por descrição",
        ],
        [
          "Acerta nos casos de um passo, erra nos de múltiplos passos",
          "Chain-of-thought, raciocínio antes da resposta",
          "A falha é um passo pulado, e tornar os passos explícitos é o que impede pulá-los",
        ],
        [
          "Duas categorias adjacentes são rotuladas de forma inconsistente",
          "Few-shot escolhido na fronteira de decisão, incluindo os quase-acertos",
          "Exemplos definem uma fronteira que uma definição escrita deixa ambígua",
        ],
        [
          "Fluente, confiante e factualmente errado sobre o seu domínio",
          "Recuperação — não uma mudança de prompt",
          "Nenhum arranjo do prompt fornece um conhecimento que o modelo não tem",
        ],
        [
          "Responde a uma pergunta parecida, e não à que foi feita",
          "Enquadramento mais rígido da tarefa e um contrato de saída explícito",
          "É a instrução, não o raciocínio, que está subespecificada",
        ],
        [
          "Um único prompt fazendo classificação, extração e redação ao mesmo tempo",
          "Encadeamento de prompts — dividir em chamadas sequenciais",
          "Cada etapa passa a ser testável e corrigível separadamente",
        ],
      ],
    },
    {
      kind: "prose",
      md: "Exemplos few-shot são dados de treino para uma única requisição, e carregam todas as fraquezas de dados de treino. Se quatro de cinco exemplos forem da mesma classe, o modelo vai prever essa classe em excesso. Se todos forem casos fáceis, não ensinam nada sobre a fronteira em que o modelo está de fato falhando. Escolha exemplos como você escolheria um conjunto de avaliação: balanceados entre as classes, extraídos de tráfego real e com peso maior nos casos genuinamente difíceis.\n\nComo os exemplos são enviados em toda requisição, eles são o candidato clássico a prompt caching — um bloco fixo de exemplos colocado antes do conteúdo variável do usuário pode ser reutilizado, em vez de reprocessado.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Chain-of-thought troca **latência e tokens de saída por acurácia em problemas de múltiplos passos**. Essa troca é excelente em um cálculo complexo ou em uma decisão de política com várias condições, e é pura perda em um rótulo de sentimento. Quando um modelo permite alocar esforço extra de raciocínio antes de responder, é a mesma troca, oferecida como um ajuste em vez de como texto no prompt.",
    },
    {
      kind: "prose",
      md: "Um detalhe operacional importa mais do que parece: mantenha o raciocínio fora do payload. Peça o desenvolvimento em uma seção delimitada e a resposta final no formato contratado, e então faça o parse só da resposta. Um consumidor nas etapas seguintes que receba três parágrafos de deliberação em volta de um objeto JSON vai quebrar, e a correção pertence ao prompt, não a uma expressão regular frágil.",
    },

    {
      kind: "example",
      title: "Exemplo prático: extração de termos de contratos de fornecedores",
      scenario:
        "Um pipeline extrai oito campos de contratos de fornecedores. O desempenho zero-shot é forte em sete campos. O oitavo — o prazo de aviso prévio de rescisão — sai errado em cerca de um quarto das vezes, sempre em contratos nos quais o aviso é expresso como uma cláusula que referencia outra cláusula, e não como um simples número de dias. A proposta do time é adicionar cinquenta exemplos e migrar para o modelo mais capaz.",
      walkthrough:
        "1. **Localize a falha.** Sete campos saem certos nos mesmos documentos, com o mesmo prompt, então não é um problema de contexto nem de capacidade do modelo. É específico de um campo com uma estrutura específica.\n2. **Dê nome ao defeito.** O modelo resolve a referência para a cláusula errada. Isso é um passo de raciocínio pulado, não um problema de formatação, de modo que exemplos sozinhos ensinariam sobretudo um formato que já está correto.\n3. **Aplique chain-of-thought só a esse campo.** Instrua o modelo a primeiro citar a cláusula, depois citar qualquer cláusula que ela referencie e então declarar o prazo resultante — em uma seção de desenvolvimento delimitada, descartada depois do parse.\n4. **Adicione um conjunto pequeno e direcionado de exemplos.** Quatro exemplos, todos de contratos com referência cruzada, já que é nessa fronteira que o modelo está falhando. Cinquenta exemplos genéricos teriam acrescentado tokens sem tocar no defeito.\n5. **Coloque em cache e meça.** Exemplos e instruções ficam antes do texto do contrato, para que o prefixo continue reutilizável, e a mudança é pontuada contra o conjunto separado para teste antes do rollout.",
      takeaway:
        "A jogada vencedora foi diagnosticar o defeito como de raciocínio, e não de formato. O instinto padrão — mais exemplos, modelo maior — teria elevado o custo de cada requisição e deixado errado um quarto dos contratos com referência cruzada.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Adicionar mais exemplos few-shot* é o distrator mais oferecido neste objetivo, porque soa como esforço. Exemplos corrigem forma e fronteiras. Não corrigem conhecimento ausente, e não corrigem raciocínio pulado.",
    },

    {
      kind: "practice",
      questionIds: [
        "D2-q301",
        "D2-q302",
        "D2-q303",
        "D2-q304",
        "D2-q305",
        "D2-q306",
        "D2-q307",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Prompting zero-shot",
      definition:
        "Instruir o modelo sem exemplos resolvidos, contando com uma descrição clara da tarefa e um contrato de saída. A opção mais barata e o padrão correto.",
    },
    {
      term: "Prompting few-shot",
      definition:
        "Fornecer um pequeno número de pares entrada/saída que demonstram a tarefa. Mais valioso para transmitir formato, estilo da casa e a fronteira entre categorias adjacentes.",
    },
    {
      term: "Chain-of-thought",
      definition:
        "Instruir o modelo a produzir raciocínio intermediário antes da resposta final, o que reduz erros de passo pulado em problemas de múltiplos passos, ao custo de latência e tokens de saída.",
    },
    {
      term: "Encadeamento de prompts (prompt chaining)",
      definition:
        "Dividir um prompt que executa vários trabalhos em chamadas sequenciais, para que cada etapa possa ser avaliada, colocada em cache e corrigida de forma independente.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Mais exemplos few-shot significam, de forma confiável, mais acurácia.",
      why: "O ganho se estabiliza depois de um punhado de exemplos bem escolhidos, e os adicionais compram sobretudo tokens e latência, enquanto qualquer desbalanceamento de classes entre eles enviesa ativamente as previsões do modelo.",
      instead:
        "Use um conjunto pequeno e balanceado, extraído dos casos que o modelo está de fato errando, e meça se cada acréscimo ajuda.",
    },
    {
      id: "t2",
      trap: "Chain-of-thought melhora a acurácia em qualquer tarefa, então é um padrão seguro.",
      why: "Em consultas diretas e classificação simples, ele acrescenta latência e custo de saída sem ganho algum, e o texto extra gerado dá ao modelo espaço para construir uma justificativa elaborada para uma resposta errada.",
      instead:
        "Reserve-o para problemas cujos erros vêm de passos intermediários pulados, e verifique o ganho no seu conjunto de avaliação.",
    },
    {
      id: "t3",
      trap: "Exemplos few-shot vão corrigir um modelo que afirma fatos incorretos sobre o seu domínio.",
      why: "Exemplos demonstram forma e fronteiras de decisão, não conteúdo, de modo que um modelo sem o conhecimento de base vai imitar perfeitamente o formato demonstrado e preenchê-lo com valores fabricados.",
      instead:
        "Trate erros factuais como um problema de recuperação: forneça a fonte autoritativa no contexto e exija citações.",
    },
    {
      id: "t4",
      trap: "O raciocínio do modelo pode ser devolvido ao chamador junto com a resposta.",
      why: "Os consumidores nas etapas seguintes fazem o parse de um contrato, e prosa em volta do payload quebra esse contrato, de modo que o raciocínio que melhorou a acurácia vira justamente o que quebra o pipeline.",
      instead:
        "Faça o modelo raciocinar dentro de delimitadores e emitir a resposta final no formato contratado, e então faça o parse só dessa seção.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 2",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],
  relatedLessons: ["2.5", "4.4"],
} satisfies Lesson;
