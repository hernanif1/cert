import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "2.4",
  slug: "2-4-context-window-token-management",
  domain: 2,
  objective: "Otimizar janelas de contexto e gerenciar o uso de tokens",
  title: "Janelas de Contexto e Uso de Tokens",
  summary:
    "A janela de contexto é um orçamento compartilhado, não uma meta a preencher: system prompt, definições de tools, histórico, material recuperado e a saída reservada disputam o mesmo espaço. Custo e latência escalam com o que você de fato envia, e a qualidade da resposta cai quando o trecho relevante fica soterrado entre trechos irrelevantes.",

  body: [
    {
      kind: "prose",
      md: "Uma janela maior eleva o teto do que uma requisição *pode* conter. Não muda nada sobre o que uma requisição *deve* conter. Três custos acompanham cada token que você adiciona, não importa quanta folga ainda reste:",
    },
    {
      kind: "list",
      items: [
        "**Dinheiro** — tokens de entrada são cobrados em toda requisição, e um prompt perdulário se multiplica pelo volume de tráfego.",
        "**Latência** — uma entrada longa demora mais para ser processada antes de aparecer o primeiro token de saída, que é a parte que os usuários percebem.",
        "**Acurácia** — material relevante disputa a atenção do modelo com material irrelevante, de modo que rechear um prompt com contexto só marginalmente relacionado pode, por si só, piorar a qualidade da resposta.",
      ],
    },
    {
      kind: "prose",
      md: "Esse terceiro custo é o que as questões da prova exploram, porque inverte a intuição de que mais contexto é mais seguro. Um contexto pequeno e preciso supera, de forma confiável, um contexto grande e diluído.",
    },

    { kind: "heading", text: "Orçamento por componente" },
    {
      kind: "prose",
      md: "Trate a janela como um plano de capacidade. Contabilize cada contribuinte, saiba o que o faz crescer e tenha uma alavanca nomeada para cada um.",
    },
    {
      kind: "table",
      caption: "Para onde vão os tokens",
      headers: ["Componente", "Cresce com", "Alavanca"],
      rows: [
        [
          "System prompt e definições de tools",
          "Número de tools expostas e tamanho do conjunto de regras",
          "Exponha só as tools de que a tarefa precisa; coloque as raras atrás de discovery sob demanda",
        ],
        [
          "Histórico da conversa",
          "Duração da sessão — a causa habitual de o custo ir subindo ao longo de uma sessão",
          "Compacte os turnos antigos em um resumo contínuo; mantenha as decisões, descarte a transcrição",
        ],
        [
          "Contexto recuperado",
          "Tamanho do chunk multiplicado por quantos chunks você passa",
          "Faça re-ranking e passe menos chunks, porém melhores, em vez de um top-k maior",
        ],
        [
          "Resultados de tools",
          "A verbosidade da API que respondeu, seja ela qual for",
          "Projete os campos de que você precisa antes que o resultado entre na transcrição",
        ],
        [
          "Saída reservada",
          "O formato e a verbosidade que você pediu",
          "Limite o tamanho máximo da saída e especifique apenas o formato contratado",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Tokens de saída merecem atenção à parte. Eles são gerados em série, então dominam a latência de relógio de um jeito que os tokens de entrada não dominam, e nos modelos atuais são cobrados a um preço mais alto que os de entrada. \"Responda em no máximo três frases\" costuma ser um ganho de latência maior do que cortar mil tokens de entrada.",
    },

    { kind: "heading", text: "Posicionamento, medição e o problema das conversas longas" },
    {
      kind: "prose",
      md: "A disposição dentro da janela importa. Com um documento longo no contexto, colocar a instrução e a pergunta *depois* do material ajuda o modelo a agir sobre o que acabou de ler, e isso combina bem com cache: o documento estático fica no prefixo estável, enquanto a pergunta variável fica no fim. Estruture contextos longos com delimitadores explícitos, para que o modelo consiga distinguir uma fonte da outra.\n\nMeça em vez de estimar. Contagem de tokens não é contagem de palavras — a tokenização em subpalavras faz com que código, JSON, tabelas e texto em outros idiomas que não o inglês concentrem muito mais tokens por caractere do que prosa em inglês, de modo que uma estimativa baseada em palavras subconta exatamente os payloads com maior chance de estourar a janela. Conte os tokens com um tokenizador de verdade antes de enviar, e registre em log as contagens de tokens de entrada e de saída por requisição, para que um prompt que vai inchando apareça como tendência, e não como incidente.\n\nEm sistemas conversacionais, o termo dominante de crescimento é o histórico. Cada turno acrescenta a mensagem do usuário, a resposta do assistente e todas as chamadas de tool e resultados no meio do caminho. O remédio padrão é a **compactação**: substituir periodicamente os turnos antigos por um resumo estruturado que preserve os fatos e as decisões duradouros e descarte a troca de mensagens em si. Tudo a que o usuário possa se referir mais tarde — identificadores, escolhas, restrições — fica fixado; o resto é recuperável dos logs, se alguém um dia precisar.",
    },

    {
      kind: "example",
      title: "Exemplo prático: um assistente que fica mais lento conforme você o usa",
      scenario:
        "Um assistente interno de pesquisa é rápido e barato nas primeiras trocas. No vigésimo turno, as respostas levam vários segundos para começar, o custo por requisição é cerca de seis vezes o do turno inicial, e os usuários relatam que ele responde a perguntas feitas dez minutos atrás, em vez da atual. O modelo, o template de prompt e a configuração de recuperação não mudaram.",
      walkthrough:
        "1. **Instrumente antes de adivinhar.** Registre em log os tokens de entrada por componente, a cada requisição. Histórico e resultados de tools respondem pela maior parte do crescimento; o system prompt e os chunks recuperados estão estáveis.\n2. **Leia corretamente o sintoma de qualidade.** Responder a uma pergunta antiga é diluição, não defeito do modelo: a pergunta atual é um parágrafo curto disputando com vinte turnos de texto relacionado.\n3. **Compacte.** A partir de um limiar, resuma os turnos antigos em um bloco estruturado — a pergunta de pesquisa, as fontes aceitas, as conclusões alcançadas — e descarte a troca bruta.\n4. **Enxugue os resultados de tools na origem.** A tool de busca devolvia documentos inteiros para a transcrição. Projete o resultado para título, identificador e o trecho correspondente.\n5. **Leve a pergunta para o fim.** O turno atual do usuário agora fica no fim da janela, depois do material de referência, em vez de soterrado antes dele.",
      takeaway:
        "Custo, latência e a reclamação das respostas defasadas tinham uma única causa em comum, e migrar para uma janela de contexto maior não teria resolvido nenhum deles. Teria deixado a sessão crescer mais antes de falhar, tornando cada requisição mais lenta e mais cara pelo caminho.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "A alternativa tentadora neste objetivo é a que compra folga no ponto da falha — *truncar os turnos mais antigos quando as requisições começarem a ser rejeitadas*, *aumentar o limite de saída*, *descer para uma camada mais barata para absorver o custo*. Cada uma trata um sintoma sem nomear o componente que está crescendo. A alternativa do gabarito identifica esse componente, geralmente o histórico da conversa ou resultados de tools sem projeção, e aplica a alavanca que pertence a ele.",
    },

    {
      kind: "practice",
      questionIds: [
        "D2-q401",
        "D2-q402",
        "D2-q403",
        "D2-q404",
        "D2-q405",
        "D2-q406",
        "D2-q407",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Janela de contexto",
      definition:
        "O tamanho máximo combinado de entrada e saída reservada para uma única requisição. Um orçamento compartilhado entre system prompt, tools, histórico, material recuperado e resposta.",
    },
    {
      term: "Compactação",
      definition:
        "Substituir turnos antigos da conversa por um resumo estruturado que preserva fatos e decisões duradouros, para que o histórico pare de crescer linearmente com a duração da sessão.",
    },
    {
      term: "Diluição de contexto",
      definition:
        "A queda na qualidade da resposta que ocorre quando material relevante disputa espaço com um grande volume de material irrelevante na mesma janela.",
    },
    {
      term: "Contabilidade de tokens",
      definition:
        "Medir tokens de entrada e de saída por componente e por requisição, em vez de estimar a partir da contagem de palavras, que subestima payloads densos como código e JSON.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A posição do material dentro da janela não importa, desde que tudo caiba.",
      why: "A ordem de montagem muda tanto a atenção quanto o custo: uma pergunta soterrada antes de um documento longo disputa com tudo o que vem depois dela, e conteúdo volátil colocado cedo invalida o prefixo em cache para todos os tokens seguintes.",
      instead:
        "Ordene o prompt deliberadamente — texto de sistema estável e material de referência primeiro, para que o prefixo entre em cache; a instrução e a pergunta por último, para que o modelo aja sobre o que acabou de ler.",
    },
    {
      id: "t2",
      trap: "Contagem de palavras é uma aproximação boa o bastante da contagem de tokens ao orçar um prompt.",
      why: "A tokenização em subpalavras representa código, JSON, tabelas e texto em outros idiomas com muito mais tokens do que prosa em inglês, de modo que estimativas baseadas em palavras subcontam justamente os payloads com maior chance de estourar a janela.",
      instead:
        "Conte os tokens com um tokenizador de verdade antes de enviar, e registre em log o uso real de tokens por requisição.",
    },
    {
      id: "t3",
      trap: "Tokens de saída contribuem pouco para custo e latência perto de uma entrada longa.",
      why: "A saída é gerada um token por vez e, portanto, domina o tempo de relógio, e é cobrada a um preço mais alto que a entrada, de modo que uma resposta sem limite sai cara duas vezes.",
      instead:
        "Limite o tamanho máximo da saída, peça apenas o formato contratado e mantenha o raciocínio fora do payload devolvido.",
    },
    {
      id: "t4",
      trap: "Resumir o histórico perde informação, então manter a transcrição completa é a escolha segura.",
      why: "Guardar tudo troca uma perda controlada por uma descontrolada: a atenção a qualquer fato isolado do início cai à medida que a transcrição cresce, e a sessão acaba falhando por estourar a janela.",
      instead:
        "Compacte deliberadamente — fixe identificadores, decisões e restrições em um resumo estruturado e descarte a troca bruta.",
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
  relatedLessons: ["2.5", "3.8", "4.5"],
} satisfies Lesson;
