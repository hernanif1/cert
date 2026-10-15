import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.3",
  slug: "3-3-accuracy-latency-tradeoffs",
  domain: 3,
  objective:
    "Avaliar trade-offs entre acurácia e latência e justificar decisões de configuração",
  title: "Trade-offs entre Acurácia e Latência",
  summary:
    "Quase toda melhoria de acurácia em um sistema com LLM é paga com tempo, e quase toda melhoria de latência é paga com acurácia. O trabalho do arquiteto é precificar as duas contra o custo de errar neste workflow específico.",

  body: [
    {
      kind: "prose",
      md: "Acurácia e latência não são botões independentes. Mais esforço de raciocínio, passadas de verificação, re-ranking, modelos maiores e decomposição em várias etapas elevam a qualidade gastando tempo. Modelos menores, menos chunks recuperados, raciocínio mais curto e respostas em passada única devolvem tempo aceitando mais erro.\n\nA prova não quer um padrão. Quer uma justificativa que parta do workflow: quão grave é uma resposta errada aqui, quem a detecta e o que o usuário vivencia enquanto espera?",
    },

    { kind: "heading", text: "O que realmente custa tempo" },
    {
      kind: "table",
      caption: "Alavancas, direção do efeito e quando cada uma se justifica",
      headers: ["Alavanca", "Efeito", "Justifica-se quando"],
      rows: [
        [
          "Modelo maior da família Claude",
          "Mais acurácia em raciocínio difícil; mais tempo por token",
          "A dificuldade da tarefa é a restrição limitante, não a vazão (throughput)",
        ],
        [
          "Esforço de raciocínio mais alto",
          "Raciocínio em várias etapas melhor; a latência escala com o nível de esforço, de low a max",
          "Os problemas realmente exigem derivação, não memória ou formatação",
        ],
        [
          "Passada de verificação ou de crítica",
          "Pega erros; praticamente dobra o tempo de ponta a ponta",
          "O custo de uma resposta errada supera o custo de esperar",
        ],
        [
          "Re-ranking dos candidatos recuperados",
          "A precisão sobe; acrescenta uma chamada de modelo antes da geração",
          "O recall é adequado, mas o trecho certo fica mal ranqueado",
        ],
        [
          "Mais chunks recuperados",
          "O recall sobe até certo ponto, depois vem a diluição; mais tokens de entrada",
          "A avaliação mostra que o modo de falha são as ausências, não o ruído",
        ],
        [
          "Prompt caching sobre um prefixo estável",
          "Menor tempo até o primeiro token e menor custo; acurácia inalterada",
          "Um system prompt ou conjunto de tools grande se repete entre as requisições",
        ],
        [
          "Cascata de modelos com escalonamento",
          "Caminho rápido para entradas fáceis; cauda mais lenta para as difíceis",
          "A distribuição das entradas é de fato mista e o roteamento é confiável",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Meça o percentil que o usuário sente, não a média. Uma configuração com mediana de 900 ms e p99 de nove segundos é um produto diferente de outra que leva uniformemente dois segundos, ainda que a segunda pareça pior em um dashboard de latência média. É exatamente por isso que SLAs interativos são escritos em termos de p95 ou p99.",
    },

    { kind: "heading", text: "A latência percebida é uma variável à parte" },
    {
      kind: "prose",
      md: "O streaming não faz uma resposta terminar mais cedo — o tempo total de geração não muda —, mas desloca o momento em que o usuário vê progresso pela primeira vez, e em interfaces conversacionais isso é a maior parte da experiência sentida. O tempo até o primeiro token e o tempo total de conclusão precisam de orçamentos separados.\n\nO mesmo raciocínio distingue os modos de interação. Um turno de chat síncrono vive dentro da janela de paciência de um humano. Um job assíncrono — classificação noturna de documentos, enriquecimento em lote — não tem essa janela, de modo que configurações que maximizam a acurácia, inaceitáveis em um chat, ali simplesmente saem de graça.",
    },
    {
      kind: "prose",
      md: "Onde o trabalho se decompõe, o paralelismo compra acurácia quase sem custo de latência: chamadas de tool independentes emitidas juntas, ou várias subtarefas distribuídas em chamadas separadas, terminam no tempo da mais lenta, e não na soma. Estágios sequenciais de guardrail e de verificação são o oposto — cada um acrescenta a sua duração inteira a toda requisição, inclusive à grande maioria que nunca precisou dele.",
    },

    {
      kind: "example",
      title: "Exemplo prático: um assistente de triagem que estoura o SLA",
      scenario:
        "Um assistente de triagem de suporte ao cliente classifica um chamado recebido e redige uma resposta. O SLA do produto é um p95 de dois segundos até o primeiro token. O p95 atual é de 6,4 segundos. O pipeline executa uma checagem de moderação, depois a recuperação, depois a classificação com esforço de raciocínio alto, depois a redação e, por fim, uma segunda chamada de modelo que verifica o rascunho contra a política. A acurácia da classificação é de 94%; os rascunhos são revisados por um atendente antes do envio.",
      walkthrough:
        "1. **Atribua o tempo.** Os spans mostram a recuperação com 300 ms, a classificação com 2,8 s, a redação com 1,9 s, a verificação com 1,2 s e a moderação com 200 ms.\n2. **Pergunte o que cada estágio protege.** Todo rascunho já é lido por um humano antes de ser enviado, então a passada de verificação está guardando uma saída que tem um segundo revisor mais adiante.\n3. **Corte o estágio redundante.** Remover a verificação devolve 1,2 s e não custa nada que o revisor humano já não estivesse pegando.\n4. **Dimensione o raciocínio.** Classificar em onze categorias conhecidas é reconhecimento de padrões, não derivação. Baixar esse estágio para o menor esforço de raciocínio recupera a maior parte dos seus 2,8 s, e a avaliação offline mostra a acurácia caindo de 94% para 93%.\n5. **Desloque o custo fixo.** O system prompt e as definições de tools são idênticos em toda requisição, então colocar esse prefixo em cache reduz mais uma vez o tempo até o primeiro token.",
      takeaway:
        "A latência estava sendo gasta em uma acurácia de que o workflow não precisava, porque um revisor humano já a fornecia. Os trade-offs são precificados contra o sistema inteiro, não contra a chamada de modelo isolada.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Use o modelo mais capaz disponível* é oferecido sempre que se discute acurácia e raramente é o gabarito em uma questão com restrição de latência. A capacidade do modelo é uma alavanca entre várias, e é a que gasta de forma mais direta o orçamento que o cenário diz já estar esgotado. Procure a alternativa que remove trabalho de que o workflow não precisa.",
    },

    {
      kind: "practice",
      questionIds: [
        "D3-q301",
        "D3-q302",
        "D3-q303",
        "D3-q304",
        "D3-q305",
        "D3-q306",
        "D3-q307",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Tempo até o primeiro token",
      definition:
        "Quanto tempo o usuário espera até aparecer qualquer saída. É dominado pelo processamento da entrada, pela recuperação e por quaisquer estágios anteriores à geração; melhora com caching e com a remoção de etapas seriais.",
    },
    {
      term: "Cascata de modelos",
      definition:
        "Rotear as entradas fáceis para um modelo rápido e escalar apenas os casos incertos ou de alto risco para um modelo mais capaz, de modo que a latência média acompanhe o caminho fácil.",
    },
    {
      term: "Latência de cauda",
      definition:
        "O p95 ou o p99 da distribuição de latência. É o número contra o qual um SLA interativo é escrito, porque as médias escondem as requisições de que os usuários reclamam.",
    },
    {
      term: "Custo de guardrail serial",
      definition:
        "A duração inteira que um estágio de verificação ou de moderação acrescenta a toda requisição, inclusive à maioria que teria passado sem ele.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Problemas de acurácia se resolvem melhor migrando para o maior modelo disponível.",
      why: "A capacidade do modelo só ajuda quando o raciocínio era o fator limitante; quando a falha vem de uma recuperação ruim, de um prompt vago ou de contexto ausente, um modelo maior chega à mesma conclusão errada mais devagar e a um custo maior.",
      instead:
        "Diagnostique qual estágio produz o erro e, então, gaste latência apenas no estágio que está de fato falhando.",
    },
    {
      id: "t2",
      trap: "Uma passada de verificação deve ser adicionada sempre que a acurácia importa.",
      why: "Uma segunda chamada de modelo acrescenta a sua duração inteira a toda requisição enquanto pega erros em apenas uma pequena fração delas, e é puro desperdício onde um revisor humano ou uma checagem posterior já inspeciona a mesma saída.",
      instead:
        "Aplique a verificação de forma seletiva — a casos de baixa confiança ou de alto risco — e somente onde nada mais no workflow já revisa o resultado.",
    },
    {
      id: "t3",
      trap: "O prompt caching melhora a qualidade das respostas ao dar ao modelo um contexto mais estável.",
      why: "O caching muda a forma como um prefixo repetido é cobrado e processado, não o que o modelo vê nem como ele raciocina, de modo que a distribuição de saídas para uma requisição idêntica não é afetada.",
      instead:
        "Trate o caching como uma otimização de custo e de tempo até o primeiro token, e busque acurácia por meio de mudanças no contexto, na recuperação ou no raciocínio.",
    },
    {
      id: "t4",
      trap: "A latência mediana é o alvo certo ao ajustar um sistema interativo.",
      why: "A mediana descreve as requisições de que ninguém reclama, enquanto a cauda lenta é o que quebra um SLA e afasta os usuários, e o comportamento da cauda muitas vezes se move na direção oposta à da mediana.",
      instead:
        "Defina e monitore as metas em p95 ou p99, e confira ambos ao avaliar uma mudança de configuração.",
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
