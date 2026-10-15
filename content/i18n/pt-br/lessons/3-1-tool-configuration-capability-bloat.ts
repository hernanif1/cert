import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.1",
  slug: "3-1-tool-configuration-capability-bloat",
  domain: 3,
  objective:
    "Avaliar a configuração de ferramentas/agentes quanto ao excesso de capacidades (capability bloat)",
  title: "Configuração de Ferramentas e Excesso de Capacidades",
  summary:
    "Cada tool entregue a um agente custa contexto, disputa atenção na hora da seleção e amplia o raio de impacto de uma decisão ruim. Avaliar o excesso de capacidades é perguntar o que o trabalho realmente exige e apagar o resto.",

  body: [
    {
      kind: "prose",
      md: "Uma definição de tool não sai de graça. Ela ocupa contexto em toda requisição, entra no conjunto que o modelo precisa discriminar a cada turno e é uma capacidade que o agente pode exercer sempre que decidir. Os times adicionam tools uma de cada vez porque cada uma parece útil isoladamente, e a configuração se degrada aos poucos em vez de falhar com estardalhaço — é por isso que a prova pede que você *avalie* uma configuração, e não que depure um erro.\n\nTrês custos se acumulam, e separá-los importa porque cada um tem uma correção diferente:",
    },
    {
      kind: "list",
      items: [
        "**Custo de contexto.** O nome, a descrição e o schema JSON de cada tool são serializados em toda requisição. Um punhado de servidores com schemas verbosos pode consumir dezenas de milhares de tokens antes de o usuário dizer qualquer coisa.",
        "**Custo de seleção.** O modelo escolhe entre o conjunto inteiro a cada turno. A acurácia cai à medida que o conjunto cresce, e cai mais rápido quando as descrições se sobrepõem — duas tools que plausivelmente atendem ao mesmo pedido forçam um cara ou coroa.",
        "**Custo de raio de impacto.** Tudo o que está presente pode ser invocado, inclusive por instruções contrabandeadas em um documento recuperado ou no resultado de uma tool. Uma capacidade de que o workflow nunca precisa é só prejuízo.",
      ],
    },
    {
      kind: "prose",
      md: "O primeiro custo é mensurável, o segundo aparece como erros de tool errada, e o terceiro aparece uma vez só, e sai caro.",
    },

    { kind: "heading", text: "Lendo os sintomas" },
    {
      kind: "table",
      caption:
        "O excesso de capacidades se apresenta como bugs comuns; a correção está na configuração",
      headers: ["Sintoma", "Causa provável", "Resposta correta"],
      rows: [
        [
          "Tool errada escolhida para um pedido sem ambiguidade",
          "Duas tools com descrições sobrepostas",
          "Unifique-as, ou reescreva as descrições para que a fronteira fique explícita",
        ],
        [
          "Latência e custo altos mesmo em turnos triviais",
          "Schemas de tool grandes reenviados em toda requisição",
          "Enxugue os schemas, descarte tools não usadas ou carregue as definições sob demanda",
        ],
        [
          "O agente inventa valores plausíveis para parâmetros",
          "Parâmetros obrigatórios que quem chama não tem como conhecer",
          "Dê um valor padrão ao parâmetro ou resolva-o no servidor",
        ],
        [
          "Um único agente abrange domínios de negócio não relacionados",
          "O conjunto de tools cobre vários papéis ao mesmo tempo",
          "Divida em agentes com escopo por papel e conjuntos de tools disjuntos",
        ],
        [
          "Uma ação destrutiva dispara inesperadamente",
          "Capacidade de escrita exposta a um workflow somente leitura",
          "Remova a tool em vez de cercá-la de proteções",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "O privilégio mínimo se aplica à configuração de tools exatamente como se aplica a contas de serviço. A pergunta nunca é *isso poderia ser útil algum dia*, e sim *o trabalho deste agente exige isso agora*. Registrar em log uma tool perigosa, ou colocar uma confirmação na frente dela, mantém a capacidade no lugar — são controles detectivos e compensatórios aplicados sobre um privilégio que não deveria existir.",
    },

    { kind: "heading", text: "Enxugando uma configuração" },
    {
      kind: "list",
      ordered: true,
      items: [
        "**Parta do workflow, não do catálogo.** Enumere as tarefas que o agente precisa concluir e, depois, o mínimo de tools que cada uma exige. Todo o resto é candidato à remoção.",
        "**Elimine as sobreposições.** Se duas tools seriam respostas defensáveis para o mesmo pedido, o modelo vai errar parte das vezes, não importa como seja instruído no prompt.",
        "**Separe leitura de escrita.** Separar agentes que só recuperam informação de agentes que executam ações encolhe os dois conjuntos e confina a metade perigosa a uma superfície estreita e auditável.",
        "**Empurre o determinismo para o código.** Uma etapa que sempre roda no mesmo ponto com os mesmos argumentos pertence à camada de orquestração, não a uma tool que o modelo pode esquecer de chamar.",
        "**Carregue sob demanda quando o catálogo for realmente grande.** Quando um domínio de fato precisa de centenas de capacidades, exponha uma pequena superfície de discovery e busque as definições à medida que se tornarem relevantes.",
      ],
    },

    {
      kind: "example",
      title: "Exemplo prático: um assistente de operações com 47 tools",
      scenario:
        "Um assistente interno de operações está ligado a cinco servidores MCP que expõem, juntos, 47 tools. Os usuários relatam que ele consulta o rastreador de deploys de staging quando perguntam sobre produção, e que perguntas simples travam por segundos antes do primeiro token. O custo por requisição triplicou desde que o terceiro servidor foi conectado.",
      walkthrough:
        "1. **Meça o overhead fixo.** As definições de tools são serializadas em cerca de 24.000 tokens em toda requisição, o que explica o aumento de custo e boa parte do tempo até o primeiro token.\n2. **Classifique por uso.** Os logs de chamadas mostram que onze tools concentram 98% das invocações e que dezenove nunca foram chamadas uma única vez.\n3. **Localize a confusão.** `get_deployment_status` e `fetch_deploy_state` vêm de servidores diferentes, com descrições quase idênticas, e nenhuma das duas informa o ambiente que cobre.\n4. **Corte e esclareça.** Desconecte os dois servidores que só contribuem com tools mortas e reescreva a descrição que sobrou para declarar explicitamente o seu ambiente.\n5. **Divida o que resta.** A resposta a incidentes precisa de acesso de escrita; o assistente do dia a dia, não. Dois agentes com conjuntos de tools disjuntos substituem um agente que detinha todas elas.",
      takeaway:
        "Nada aqui foi resolvido com prompt. Os erros de tool errada eram um problema de descrição, a latência era um problema de tamanho de schema, e a exposição era um problema de escopo — três custos distintos de uma única configuração inchada.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Quando um agente escolhe a tool errada, *adicionar instruções ao system prompt dizendo qual tool usar* quase sempre aparece entre as alternativas e quase nunca é o gabarito. O texto do prompt compete com as descrições das tools em vez de se sobrepor a elas, e a abordagem escala mal conforme o conjunto cresce. O gabarito da prova é a alternativa que muda o próprio conjunto de tools — removendo, unificando ou desambiguando.",
    },

    {
      kind: "practice",
      questionIds: [
        "D3-q101",
        "D3-q102",
        "D3-q103",
        "D3-q104",
        "D3-q105",
        "D3-q106",
        "D3-q107",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Excesso de capacidades (capability bloat)",
      definition:
        "Uma configuração de tools ou de agente que expõe mais capacidade do que o workflow exige, degradando a acurácia de seleção e ampliando o raio de impacto sem acrescentar função útil.",
    },
    {
      term: "Raio de impacto (blast radius)",
      definition:
        "O conjunto de ações que um agente pode executar se se comportar de forma errada — por erro do modelo, instruções ambíguas ou conteúdo injetado. É limitado pelas tools que existem, não pelo que o prompt pede.",
    },
    {
      term: "Sobreposição de tools",
      definition:
        "Duas ou mais definições de tool que são respostas plausíveis para o mesmo pedido. É a causa dominante da seleção de tool errada, e fica fora do alcance de instruções no prompt.",
    },
    {
      term: "Agente com escopo por papel",
      definition:
        "Um agente cujo conjunto de tools vem de uma única função de trabalho, de modo que o trabalho somente leitura e o trabalho que executa ações rodem sob configurações separadas e mínimas.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Mais tools tornam um agente mais capaz, então expor o catálogo completo é o padrão seguro.",
      why: "A acurácia na seleção de tools cai à medida que o conjunto de candidatas cresce, e cada definição consome contexto em toda requisição, de modo que um catálogo maior piora o agente, de forma consistente, justamente nas tarefas que ele executa.",
      instead:
        "Restrinja o conjunto de tools ao workflow pelo qual o agente responde e remova tudo o que esse workflow não exige.",
    },
    {
      id: "t2",
      trap: "Uma tool não usada é inofensiva desde que toda chamada a ela seja registrada em log.",
      why: "O logging é um controle detectivo, que relata o dano depois que ele acontece; a capacidade continua disponível em qualquer turno, inclusive em um conduzido por instruções injetadas via conteúdo recuperado.",
      instead:
        "Remova a capacidade e reserve o logging para os privilégios de que o papel realmente precisa.",
    },
    {
      id: "t3",
      trap: "O prompt caching torna um catálogo grande de tools praticamente gratuito.",
      why: "O caching reduz o custo e a latência de reenviar um prefixo estável, mas as definições continuam ocupando a janela de contexto e continuam ampliando o conjunto entre o qual o modelo precisa escolher a cada turno.",
      instead:
        "Trate o caching como uma otimização de custo e continue avaliando o catálogo quanto à acurácia de seleção e ao raio de impacto.",
    },
    {
      id: "t4",
      trap: "Uma etapa determinística ainda assim deveria ser uma tool, para que o agente decida quando executá-la.",
      why: "Entregar ao modelo uma decisão que tem exatamente uma resposta correta fabrica um modo de falha onde não existia nenhum e gasta um turno de latência sem ganhar flexibilidade alguma.",
      instead:
        "Codifique as etapas fixas no código de orquestração e reserve as tools para escolhas genuínas em tempo de execução.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 3",
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
} satisfies Lesson;
