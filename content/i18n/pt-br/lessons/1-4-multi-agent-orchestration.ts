import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "1.4",
  slug: "1-4-multi-agent-orchestration",
  domain: 1,
  objective: "Projetar sistemas multiagente e estratégias de orquestração",
  title: "Sistemas Multiagente e Orquestração",
  summary:
    "Sistemas multiagente compram paralelismo e isolamento de contexto, e pagam por isso em tokens, latência e falhas de coordenação. A prova testa se você sabe nomear as condições que justificam a troca e as que fazem dela um erro.",

  body: [
    {
      kind: "prose",
      md: "Um sistema multiagente tem mais de um ator rodando o próprio loop, e essa é uma afirmação mais estreita do que os diagramas sugerem. Um orquestrador que decompõe uma tarefa em tempo de execução, distribui as partes e sintetiza o que volta é o workflow **orquestrador–trabalhadores** do Objetivo 1.3: o projetista fixou essa estrutura, e só as subtarefas são geradas a cada requisição. O design se torna multiagente em outro ponto — quando cada **subagente** roda o próprio loop de tools e escolhe o próprio ponto de parada, de modo que o número de passos que ele dá não é conhecido de antemão e nenhum caminho de código o decide.\n\nPortanto, o formato de fan-out nunca resolve a questão. Pergunte o que a parte delegada realmente é: uma subtarefa gerada, executada e devolvida, ou uma investigação em aberto que o subagente precisa conduzir sozinho.\n\nQuando é o segundo caso, duas coisas estão sendo compradas, e nomeá-las com precisão é o que torna a troca avaliável:\n\n**Paralelismo.** Subtarefas independentes rodam ao mesmo tempo, então o tempo de relógio cai em direção ao da subtarefa mais lenta, em vez da soma de todas.\n\n**Isolamento de contexto.** Cada subagente tem a própria janela de contexto. Um subagente pode ler quarenta páginas e devolver três frases, e só essas três frases entram no contexto do orquestrador. É esse o mecanismo que torna viável uma busca ampla.\n\nO preço é pago em tokens. Cada subagente relê as próprias instruções, definições de tools e contexto, então o consumo total escala com agentes e turnos — rotineiramente uma ordem de grandeza acima de uma única chamada respondendo à mesma pergunta. O design se justifica quando a resposta é valiosa o bastante para absorver esse multiplicador.",
    },

    { kind: "heading", text: "Quando o formato se encaixa, e quando não" },
    {
      kind: "table",
      caption: "Sinais a favor e contra uma decomposição multiagente",
      headers: ["Sinal", "Adequação", "Por quê"],
      rows: [
        [
          "As subtarefas são independentes e podem ser exploradas em paralelo",
          "Forte",
          "Paralelismo e isolamento compensam ambos; a clássica busca em largura",
        ],
        [
          "Cada subtarefa precisa de uma tool ou de um escopo de credencial diferente",
          "Forte",
          "Agentes separados dão a cada parte o menor privilégio por construção",
        ],
        [
          "As subtarefas compartilham estado mutável que todas precisam enxergar",
          "Fraca",
          "O isolamento vira duplicação, e os agentes sobrescrevem o trabalho uns dos outros",
        ],
        [
          "A tarefa é uma sequência fixa de passos conhecidos",
          "Fraca",
          "Um workflow produz o mesmo resultado com custo menor e previsibilidade total",
        ],
        [
          "Cada parte delegada é uma subtarefa que retorna depois de uma única passada",
          "Fraca",
          "Isso é orquestrador–trabalhadores: fan-out em tempo de execução dentro de um workflow, não um segundo agente",
        ],
        [
          "A resposta é de baixo valor e o custo por requisição importa",
          "Fraca",
          "O multiplicador de tokens nunca é recuperado",
        ],
      ],
    },

    { kind: "heading", text: "Estratégias de orquestração" },
    {
      kind: "prose",
      md: "Quatro arranjos cobrem quase tudo, e cada um falha do seu jeito característico.",
    },
    {
      kind: "list",
      items: [
        "**Orquestrador e subagentes.** Um modelo líder planeja, delega e sintetiza; os subagentes nunca chamam uns aos outros. Manter o grafo de interações como uma árvore é o que torna tratável a atribuição de custo e de falhas, porque cada achado tem exatamente um caminho de volta até a requisição que o produziu. É o formato certo para amplitude — muitas linhas de investigação independentes cujos resultados se comprimem — e o errado no momento em que dois subagentes precisam do trabalho intermediário um do outro.",
        "**Handoff sequencial.** Cada subagente conclui um estágio e passa um artefato definido ao seguinte: extrair, depois verificar, depois redigir. Barato, previsível e fácil de retomar, porque cada artefato de fronteira é inspecionável por si só. O artefato também é o contrato inteiro — um julgamento feito a montante e não escrito nele se perde —, então esse arranjo falha nas costuras, e não dentro de um estágio, e a correção é uma interface mais rica, e não um modelo mais forte.",
        "**Gerador e crítico.** Um subagente produz, um segundo pontua o rascunho contra uma rubrica e devolve defeitos específicos, por um número limitado de rodadas. Ele se paga onde a qualidade é julgada, e não calculada, e onde o crítico tem algo que falta ao gerador: uma rubrica, um resultado de teste, um conjunto de tools diferente. Um crítico que compartilha o contexto e as instruções do gerador quase sempre concorda com ele, então limite as rodadas e saia quando a rubrica for atendida, e não quando o crítico se declarar satisfeito.",
        "**Espaço de trabalho compartilhado.** Os subagentes leem e escrevem um artefato comum — um arquivo de plano, um documento, um quadro de tarefas. O estado sobrevive a qualquer agente individual, o que torna retomável o trabalho de longa duração, e edições concorrentes descartam umas às outras em silêncio, o que o torna perigoso. Ele precisa de um protocolo de escrita explícito: propriedade por seção, atualizações somente por acréscimo (append-only) ou um coordenador que serializa as escritas. Sem isso, o último a escrever vence e nada gera erro.",
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Todo subagente precisa de três coisas, e a ausência de qualquer uma delas é a causa raiz habitual quando um sistema multiagente se comporta mal: um objetivo explícito, um formato de saída definido e uma condição de parada. Sem condição de parada, um agente ou entra em loop ou para quando calha de se sentir pronto, e isso não é uma propriedade sobre a qual se possa construir um sistema.",
    },

    {
      kind: "example",
      title: "Exemplo prático: um assistente de comparação de fornecedores",
      scenario:
        "Um time de compras quer quarenta fornecedores comparados em oito critérios. A versão com agente único enche o contexto depois de uns doze fornecedores, passa a produzir resumos rasos e a contradizer os próprios achados anteriores.",
      walkthrough:
        "1. **Verifique a independência.** Cada fornecedor pode ser pesquisado sem referência aos outros, então o trabalho é genuinamente paralelo.\n2. **Projete o contrato.** Cada subagente recebe um fornecedor, os oito critérios, um schema de saída e um teto de chamadas de tools. Quais páginas ele abre, e quantas, é decisão dele — os sites dos fornecedores são organizados de formas diferentes, e o caminho até um dado critério não pode ser escrito de antemão. Esse loop aberto, e não o fan-out, é o que faz disto um sistema multiagente, e não orquestrador–trabalhadores.\n3. **Comprima na fronteira.** Os subagentes devolvem o schema preenchido, não as transcrições da navegação. Quarenta registros curtos cabem com folga onde doze transcrições não cabiam.\n4. **Delimite as tools.** Os subagentes de pesquisa recebem search e fetch e mais nada; só o orquestrador escreve o documento final.\n5. **Orçamento.** Quarenta subagentes custam aproximadamente uma ordem de grandeza a mais em tokens do que a tentativa fracassada com agente único. O time aceita porque a comparação embasa uma decisão de sete dígitos.",
      takeaway:
        "O isolamento era o ponto. O paralelismo tornou o processo rápido, mas foi a fronteira comprimida que o tornou possível.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Acrescente mais agentes especializados* e *deixe os agentes se coordenarem entre si* soam como sofisticação, e ambas costumam ser a resposta errada. A coordenação ponto a ponto transforma uma árvore em um grafo sem limite de interações, e mais agentes em um problema acoplado multiplicam o contexto duplicado, em vez de dividir o trabalho.",
    },

    {
      kind: "practice",
      questionIds: [
        "D1-q401",
        "D1-q402",
        "D1-q403",
        "D1-q404",
        "D1-q405",
        "D1-q406",
        "D1-q407",
        "D1-q408",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Isolamento de contexto",
      definition:
        "Dar a cada subagente a própria janela de contexto, para que ele consuma uma entrada grande e devolva apenas um resultado comprimido, mantendo pequeno o contexto do orquestrador.",
    },
    {
      term: "Subagente",
      definition:
        "Um ator delegado que roda o próprio loop de tools e escolhe o próprio ponto de parada. A palavra é reservada para isso; um delegado que executa uma única subtarefa gerada e retorna é um trabalhador dentro do workflow orquestrador–trabalhadores, não um segundo agente.",
    },
    {
      term: "Orquestrador",
      definition:
        "O modelo líder que decompõe a tarefa, delega aos subagentes e sintetiza os artefatos devolvidos em uma única resposta. O mesmo formato aparece no workflow orquestrador–trabalhadores, então é o que os delegados têm permissão para fazer — e não o fan-out — que torna um design multiagente.",
    },
    {
      term: "Condição de parada",
      definition:
        "A regra explícita que encerra o trabalho de um subagente — um objetivo satisfeito, um orçamento de chamadas de tools ou um teto de iterações — sem a qual custo e latência não têm limite.",
    },
    {
      term: "Multiplicador de tokens",
      definition:
        "O fator pelo qual um design multiagente aumenta o consumo total, porque cada agente relê as próprias instruções, tools e contexto a cada turno.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Os subagentes podem compartilhar a janela de contexto do orquestrador para que nada se perca entre eles.",
      why: "Cada chamada ao modelo carrega o próprio contexto, e forçar uma única janela compartilhada entre todos os atores elimina o isolamento, que é o principal benefício do padrão, e reintroduz exatamente a pressão de contexto que ele foi adotado para aliviar.",
      instead:
        "Defina um artefato de retorno compacto por subagente e deixe o orquestrador sintetizar a partir deles.",
    },
    {
      id: "t2",
      trap: "Quando um sistema multiagente tem desempenho abaixo do esperado, acrescentar mais subagentes especializados ajuda.",
      why: "Onde as subtarefas estão acopladas por estado compartilhado, cada agente extra relê o mesmo material e cria mais uma chance de conclusões conflitantes, então a regressão se aprofunda em vez de se resolver.",
      instead:
        "Reexamine se a decomposição é genuinamente independente antes de mexer no fan-out.",
    },
    {
      id: "t3",
      trap: "Os subagentes devem devolver a saída completa das tools para que o orquestrador julgue a evidência por conta própria.",
      why: "Devolver transcrições brutas empurra o problema de contexto direto de volta para o orquestrador e joga fora o isolamento que fazia a decomposição valer o seu custo em tokens.",
      instead:
        "Faça cada subagente devolver um achado no formato de um schema, com ponteiros para as fontes que o orquestrador pode buscar de novo se precisar.",
    },
    {
      id: "t4",
      trap: "Dar a todos os subagentes o conjunto completo de tools mantém o design flexível.",
      why: "O acesso uniforme às tools abandona o menor privilégio, amplia o raio de impacto de um único passo ruim e torna materialmente mais difícil atribuir uma ação destrutiva ao agente que a executou.",
      instead:
        "Delimite as tools e as credenciais de cada subagente ao que o objetivo declarado dele exige, e nada além disso.",
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
    {
      label: "Model Context Protocol",
      url: "https://modelcontextprotocol.io",
      kind: "external",
    },
  ],

  relatedLessons: ["1.3", "1.5"],
} satisfies Lesson;
