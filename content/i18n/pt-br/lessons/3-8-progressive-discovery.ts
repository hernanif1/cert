import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.8",
  slug: "3-8-progressive-discovery",
  domain: 3,
  objective: "Avaliar a estratégia de descoberta progressiva versus contexto monolítico",
  title: "Descoberta Progressiva vs. Contexto Monolítico",
  summary:
    "Você pode carregar de antemão tudo de que o agente talvez precise, ou dar a ele um mapa e deixar que busque o detalhe sob demanda. A escolha depende de quanto do corpus uma tarefa típica de fato toca, de quão estável ele é e de você estar otimizando o custo por requisição ou o custo por sessão.",

  body: [
    {
      kind: "prose",
      md: "**Contexto monolítico** coloca tudo no prompt: o conjunto completo de políticas, todas as definições de tools, o schema inteiro, a listagem completa de arquivos. É uma única ida e volta, totalmente determinístico quanto ao que o modelo viu e altamente cacheável quando o conteúdo é estável.\n\n**Descoberta progressiva** coloca um mapa — um índice, um sumário, um catálogo compacto de tools — mais os meios para buscar o detalhe. O agente puxa o que precisa, quando precisa. O contexto de trabalho fica pequeno e relevante, mas cada busca é mais uma ida e volta, e o agente pode deixar de procurar.\n\nNenhum dos dois é um padrão. A prova quer o trade-off precificado contra uma carga de trabalho específica.",
    },

    { kind: "heading", text: "O que orienta a decisão" },
    {
      kind: "table",
      caption: "Sinais que apontam para cada estratégia",
      headers: ["Sinal", "Aponta para"],
      rows: [
        [
          "O corpus cabe com folga na janela e é estável",
          "Monolítico, com o prefixo em cache",
        ],
        [
          "Uma tarefa típica precisa de uma fatia pequena e imprevisível de um corpus grande",
          "Descoberta progressiva",
        ],
        [
          "O conteúdo muda entre requisições",
          "Progressiva — um prefixo volátil inviabiliza o cache de qualquer forma",
        ],
        [
          "Orçamento rígido de latência em um único turno",
          "Monolítico; buscas extras são idas e voltas extras",
        ],
        [
          "Sessões longas em que o mesmo material é reutilizado muitas vezes",
          "Monolítico, amortizado ao longo da sessão",
        ],
        [
          "A auditoria exige provar exatamente o que embasou uma decisão",
          "Monolítico, ou progressiva com cada busca registrada em log",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Uma janela de contexto grande torna o carregamento monolítico *possível*, não *gratuito*. Encher uma janela com material em sua maior parte irrelevante dilui a atenção por toda ela, e os tokens são processados a cada turno de uma sessão de vários turnos. A pergunta relevante não é se o corpus cabe — é qual fração do que você carregou a tarefa realmente precisava. Essa fração é o discriminador que vale a pena memorizar: **carregue e coloque em cache quando uma tarefa típica toca a maior parte de um corpus pequeno e estável; use descoberta progressiva quando uma tarefa típica toca uma pequena fração de um corpus grande.** Capacidade é uma propriedade separada de eficácia, e só a fração diz algo sobre eficácia.",
    },

    { kind: "heading", text: "O híbrido geralmente é a resposta" },
    {
      kind: "prose",
      md: "Sistemas reais raramente escolhem um só. O padrão que perdura é um **núcleo monolítico estável mais detalhe progressivo**: identidade, instruções de operação, contrato de saída e um índice compacto do que existe vão no prefixo, onde ficam em cache e nunca mudam. Tudo o que é volumoso ou volátil é buscado sob demanda.\n\nSkills são esse padrão tornado explícito. Uma descrição curta está sempre no contexto para que o modelo saiba que a capacidade existe; as instruções completas só são carregadas quando ela é invocada. Catálogos de tools podem funcionar do mesmo jeito — uma superfície de buscar-e-carregar em vez de centenas de definições inline. Bases de código também: uma listagem de diretórios mais tools de leitura é melhor do que colar todos os arquivos.",
    },
    {
      kind: "list",
      items: [
        "**Sempre residente.** Papel, restrições, formato de saída, regras de segurança e um mapa dos recursos disponíveis. Pequeno, estável, cacheável.",
        "**Buscado sob demanda.** Corpos de documentos, schemas completos de tools, resultados de consultas, conteúdo de arquivos — qualquer coisa grande, mutável ou necessária apenas para algumas tarefas.",
        "**Nunca carregado.** Material que nenhuma tarefa plausível exige. Os tokens mais baratos são os que você nunca envia.",
      ],
    },

    {
      kind: "example",
      title: "Exemplo prático: um assistente de revisão jurídica em duas escalas",
      scenario:
        "Um assistente jurídico revisa contratos com base em um playbook interno. No lançamento, o playbook tem 40 páginas, é colado inteiro no system prompt, colocado em cache, e funciona bem. Dois anos depois, são 900 páginas distribuídas em 60 anexos específicos por jurisdição. As respostas ficaram vagas, o custo por revisão quadruplicou e a equipe está discutindo um modelo com contexto maior.",
      walkthrough:
        "1. **Meça a fração de uso.** Uma revisão típica cita dois ou três anexos. Mais de 90% do material carregado é irrelevante para qualquer contrato específico.\n2. **Reconheça o custo real.** A janela maior acomodaria o conteúdo, mas não tornaria inofensivos os 90% irrelevantes, e eles são reprocessados a cada turno de uma revisão de vários turnos.\n3. **Divida o contexto.** A metodologia de revisão, o schema de saída e um índice de anexos — uma linha por anexo — ficam no prefixo em cache, com cerca de 4,000 tokens.\n4. **Busque o resto.** Uma tool de recuperação carrega o texto completo do anexo sob pedido. O agente informa a jurisdição e o tipo de cláusula e puxa dois ou três.\n5. **Mantenha a trilha de auditoria.** Toda busca é registrada em log, então um revisor ainda consegue provar quais anexos embasaram uma conclusão — a propriedade que o carregamento monolítico entregava de graça.",
      takeaway:
        "O mesmo design estava correto com 40 páginas e errado com 900. O que mudou não foi o tamanho da janela, mas a fração do corpus de que uma única tarefa precisava.",
    },

    {
      kind: "callout",
      variant: "pitfall",
      md: "A descoberta progressiva só funciona se o mapa for bom. Um índice que não descreve o que cada entrada contém deixa o agente adivinhando, e ele vai ou não buscar nada ou buscar tudo — o pior das duas estratégias, com as idas e voltas de uma e o inchaço de contexto da outra.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Migrar para um modelo com uma janela de contexto maior* é o distrator de plantão neste objetivo. Ele responde a uma questão de capacidade que o cenário geralmente já disse não ser o limitante — o material cabe, e o agente continua escolhendo mal dentro dele. O gabarito quase sempre estreita o que chega ao modelo, em vez de alargar o espaço em que isso chega.",
    },

    {
      kind: "practice",
      questionIds: [
        "D3-q801",
        "D3-q802",
        "D3-q803",
        "D3-q804",
        "D3-q805",
        "D3-q806",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Descoberta progressiva",
      definition:
        "Fornecer um mapa compacto do material disponível mais tools para buscar o detalhe sob demanda, de modo que o contexto de trabalho contenha apenas o que a tarefa atual precisa.",
    },
    {
      term: "Contexto monolítico",
      definition:
        "Carregar de antemão no prompt tudo o que uma tarefa possa exigir. Determinístico e cacheável; degrada à medida que cresce a parcela de material irrelevante.",
    },
    {
      term: "Diluição de contexto",
      definition:
        "A perda de precisão que vem de cercar o material relevante com grandes volumes de material irrelevante, mesmo quando tudo cabe dentro da janela.",
    },
    {
      term: "Prefixo estável",
      definition:
        "A porção inicial e imutável de um prompt — papel, regras, schema, índice — que pode ser colocada em cache entre requisições. Conteúdo volátil colocado no início destrói o cache de tudo o que vem depois.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Uma janela de contexto grande o suficiente elimina a necessidade de carregamento progressivo.",
      why: "Capacidade e eficácia são propriedades diferentes: uma janela preenchida em grande parte com material irrelevante dilui a atenção e é reprocessada a cada turno, então caber não é o mesmo que ajudar.",
      instead:
        "Decida a partir da fração do corpus que uma tarefa típica de fato usa, não a partir de o corpus inteiro caber ou não.",
    },
    {
      id: "t2",
      trap: "A descoberta progressiva é sempre mais barata porque menos tokens são carregados.",
      why: "Cada busca é uma ida e volta extra, com latência própria, e uma sessão longa que puxa repetidamente o mesmo material pode enviar mais tokens no total do que um único prefixo monolítico em cache teria enviado.",
      instead:
        "Compare o custo por sessão concluída, incluindo novas tentativas e buscas repetidas, em vez de tokens por requisição isolada.",
    },
    {
      id: "t3",
      trap: "Prompt caching torna a estratégia monolítica segura em qualquer tamanho.",
      why: "O cache reduz o custo e o tempo de processamento de um prefixo repetido, mas não muda nada em relação a quanto material irrelevante o modelo precisa contornar ao raciocinar, então a acurácia continua degradando à medida que o conteúdo cresce.",
      instead:
        "Coloque em cache o núcleo estável e mova o material volumoso ou volátil para trás de uma recuperação sob demanda.",
    },
    {
      id: "t4",
      trap: "Carregar todos os documentos de antemão garante que o agente não vai deixar passar informação relevante.",
      why: "Estar presente na janela não é o mesmo que ser usado, e uma cláusula específica enterrada em centenas de páginas de texto parecido compete com tudo ao redor pela atenção do modelo.",
      instead:
        "Estreite o que chega ao modelo para que o material relevante enfrente menos competição, e verifique com avaliação em vez de presumir cobertura.",
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
