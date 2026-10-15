import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "2.1",
  slug: "2-1-model-selection",
  domain: 2,
  objective: "Selecionar modelos Claude apropriados com base em trade-offs",
  title: "Seleção de Modelos e Trade-offs",
  summary:
    "Selecionar um modelo é um trade-off de três vias entre capacidade, latência e custo, e a prova testa o método, não o catálogo. Defina um piso de qualidade a partir do custo de errar e então escolha o modelo mais barato e mais rápido que supere esse piso no seu próprio conjunto de avaliação.",

  body: [
    {
      kind: "prose",
      md: "A linha atual é a família Claude 5 — **Opus 5**, **Sonnet 5** e **Fable 5.1** — ao lado do **Haiku 4.5**. Nomes e faixas de preço mudam; o raciocínio não, e é por isso que as questões da prova descrevem uma carga de trabalho e pedem que você justifique uma escolha, em vez de perguntar qual modelo pontua mais alto em um benchmark.\n\nTrês propriedades estão em tensão, e melhorar uma geralmente custa outra:",
    },
    {
      kind: "list",
      items: [
        "**Capacidade** — a confiabilidade com que o modelo sustenta uma longa cadeia de raciocínio, lida com ambiguidade e se recupera dos próprios erros ao longo de muitas chamadas de tool.",
        "**Latência** — quanto tempo o usuário espera. O tempo até o primeiro token (time-to-first-token) determina a responsividade percebida; o tempo total determina a vazão (throughput).",
        "**Custo** — preço por token multiplicado por tokens multiplicado por tentativas. O último fator é o que os arquitetos esquecem.",
      ],
    },
    {
      kind: "prose",
      md: "O método que responde a quase toda questão de seleção tem dois passos. Primeiro, derive um **piso de qualidade** a partir da consequência de uma resposta errada: um ticket de suporte roteado para a fila errada é recuperável, uma interação medicamentosa incorreta não é. Segundo, escolha o modelo mais barato e mais rápido que supere esse piso *em um conjunto de avaliação representativo do seu próprio tráfego*. Benchmarks publicados não dizem nada sobre o seu prompt, os seus dados ou os seus casos de borda.",
    },

    { kind: "heading", text: "Lendo a carga de trabalho" },
    {
      kind: "prose",
      md: "O formato da carga de trabalho mostra qual das três propriedades é de fato a restrição determinante. Normalmente, só uma delas é.",
    },
    {
      kind: "table",
      caption: "O que a carga de trabalho restringe e para que lado isso empurra a escolha",
      headers: ["Carga de trabalho", "Restrição determinante", "Para que lado pender"],
      rows: [
        [
          "Classificação ou extração em alto volume contra um schema fixo",
          "Custo por requisição; os erros são baratos de detectar nas etapas seguintes",
          "O menor modelo que supere o piso, mais validação de schema na saída",
        ],
        [
          "Assistente interativo em uma superfície de produto",
          "Latência percebida, especialmente o tempo até o primeiro token",
          "Um modelo intermediário com streaming e prefixo em cache, antes de cogitar um downgrade",
        ],
        [
          "Trabalho agêntico de longo horizonte com muitas chamadas de tool sequenciais",
          "Erro acumulado — cada passo herda os erros do passo anterior",
          "O modelo mais capaz; uma pequena taxa de erro por passo é fatal ao longo de trinta passos",
        ],
        [
          "Enriquecimento offline em batch de um backlog",
          "Nenhuma; não há usuário esperando",
          "Capacidade, porque nesse modo a latência é praticamente gratuita",
        ],
        [
          "Decisão de alto risco atrás de revisão humana obrigatória",
          "O tempo do revisor, não a acurácia bruta do modelo",
          "Um modelo intermediário mais revisão, em vez do modelo de topo rodando sem supervisão",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Um modelo menor não é automaticamente mais barato. Muitas vezes ele precisa de um prompt mais longo, mais exemplos few-shot, uma passada de verificação ou uma nova tentativa após uma resposta malformada. O custo total é *tokens × preço × tentativas*, e um modelo mais caro por token que acerta de primeira pode sair mais barato do que um que falha em um quinto das vezes.",
    },

    { kind: "heading", text: "Escalonar em camadas em vez de escolher uma única vez" },
    {
      kind: "prose",
      md: "A maior parte do tráfego de produção é rotineira e uma pequena fração é genuinamente difícil, de modo que a escolha de um único modelo serve em excesso a maioria fácil ou serve mal a cauda difícil. A resposta padrão é **rotear**: tratar o grosso com um modelo rápido e barato e escalar para um mais capaz diante de um gatilho definido — baixa confiança do classificador, uma validação de schema que falhou, um pedido explícito do usuário por profundidade ou um tipo de caso sabidamente difícil.\n\nO custo passa então a ser determinado pelo mix ponderado por volume, não pelo preço de tabela do modelo mais forte do sistema. Um roteador que envia 90% do tráfego para um modelo pequeno e 10% para um grande custa muito mais perto do pequeno do que do grande, e os casos difíceis continuam recebendo a capacidade de que precisam. O preço desse padrão é uma segunda superfície de falha — a própria decisão de roteamento —, que precisa de avaliação própria.\n\nÀ parte disso, quando um modelo permite gastar mais esforço de raciocínio antes de responder, isso é um ajuste dentro do modelo, não uma troca de modelo: compra acurácia em problemas difíceis, de múltiplos passos, e paga por ela em latência e tokens de saída. Recorra a ele antes de presumir que você precisa de um modelo maior.",
    },

    {
      kind: "example",
      title: "Exemplo prático: triagem de 40.000 tickets de suporte por dia",
      scenario:
        "Uma plataforma de suporte classifica os tickets recebidos em uma de doze filas e redige uma primeira resposta. O time prototipou com o modelo mais capaz, a qualidade é excelente, e agora o financeiro sinalizou o gasto mensal. O product owner pergunta se deve mover tudo para o menor modelo disponível.",
      walkthrough:
        "1. **Defina o piso a partir da consequência.** Um roteamento errado é recuperável com um clique humano; uma resposta redigida errada que o atendente envia não é. São dois pisos diferentes, logo são duas decisões diferentes.\n2. **Meça, não presuma.** Rode 500 tickets rotulados em cada candidato. O modelo pequeno empata no roteamento e degrada visivelmente na redação.\n3. **Divida o caminho.** Roteie com o modelo pequeno. Redija com o modelo intermediário.\n4. **Adicione um gatilho de escalonamento.** Tickets que o roteador pontua com baixa confiança, e tudo o que for sinalizado como reclamação, vão para o modelo mais capaz.\n5. **Refaça o baseline.** O conjunto de avaliação é executado de novo contra a nova configuração antes do rollout, porque não há garantia de que prompts ajustados para um modelo se transfiram para outro.",
      takeaway:
        "A pergunta nunca foi qual modelo único usar. Decompor a carga de trabalho expôs duas subtarefas com pisos de qualidade diferentes, e o mix ponderado por volume entregou a maior parte da economia sem tocar na parte do sistema em que errar custa caro.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Use o modelo mais capaz em tudo* e *use o modelo mais barato em tudo* vão aparecer, e ambos estão errados pelo mesmo motivo: respondem sem referência ao custo de errar. A alternativa do gabarito quase sempre estabelece primeiro uma barra de qualidade, mede os candidatos contra ela e só então escolhe.",
    },

    {
      kind: "practice",
      questionIds: [
        "D2-q101",
        "D2-q102",
        "D2-q103",
        "D2-q104",
        "D2-q105",
        "D2-q106",
        "D2-q107",
        "D2-q108",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Piso de qualidade",
      definition:
        "O desempenho mínimo aceitável para uma tarefa, derivado do que uma resposta errada custa. É definido antes de qualquer modelo ser avaliado, e é o que transforma a escolha de modelo em uma questão decidível.",
    },
    {
      term: "Roteamento de modelos",
      definition:
        "Direcionar cada requisição a uma camada de modelo com base em um sinal como confiança, tipo de tarefa ou falha de validação, de modo que o custo acompanhe o mix ponderado por volume, e não o caso mais difícil.",
    },
    {
      term: "Gatilho de escalonamento",
      definition:
        "A condição definida sob a qual uma requisição é refeita em um modelo mais capaz — baixa confiança, falha na validação da saída ou uma classe de caso sabidamente difícil.",
    },
    {
      term: "Erro acumulado",
      definition:
        "Em trabalho agêntico de múltiplos passos, a forma como uma pequena taxa de falha por passo se multiplica ao longo dos passos — razão pela qual cadeias longas com uso de tools justificam um modelo mais capaz do que tarefas de um único turno.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Pontuações de benchmark são a base certa para escolher entre modelos.",
      why: "Benchmarks públicos medem habilidade agregada em tarefas genéricas, e a única pergunta que importa é se um candidato supera o seu piso de qualidade nos seus prompts, nos seus dados e nos seus casos de borda.",
      instead:
        "Avalie os candidatos contra uma amostra representativa do seu próprio tráfego, com o prompt que você de fato pretende colocar em produção.",
    },
    {
      id: "t2",
      trap: "Um modelo menor é sempre a opção mais barata.",
      why: "Modelos menores frequentemente precisam de prompts mais longos, mais exemplos, passadas de verificação e novas tentativas, e o gasto total é tokens vezes preço vezes tentativas, não o preço sozinho.",
      instead:
        "Compare o custo de ponta a ponta por tarefa concluída com sucesso, incluindo as novas tentativas e qualquer validação que o caminho mais barato exija.",
    },
    {
      id: "t3",
      trap: "A única forma de reduzir a latência é migrar para um modelo menor.",
      why: "Tamanho da saída, streaming, cache de um prefixo estável e paralelização de subchamadas independentes mexem de forma relevante no tempo de relógio sem trocar de modelo nem abrir mão de capacidade alguma.",
      instead:
        "Esgote primeiro as alavancas estruturais de latência; trate o downgrade como a opção que custa qualidade.",
    },
    {
      id: "t4",
      trap: "Trocar de modelo é seguro porque a chamada de API é idêntica.",
      why: "Prompts são ajustados ao comportamento de um modelo específico, de modo que verbosidade, aderência a formato e tratamento de casos de borda podem todos mudar mesmo quando o corpo da requisição é o mesmo e nada dá erro.",
      instead:
        "Trate toda troca de modelo como uma release: execute de novo a suíte de avaliação e compare com o baseline registrado antes do rollout.",
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
    {
      label: "Building Effective Agents — Anthropic Engineering",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],
} satisfies Lesson;
