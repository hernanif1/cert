import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.7",
  slug: "3-7-connection-protocols",
  domain: 3,
  objective:
    "Avaliar protocolos de conexão e selecionar o mecanismo de integração apropriado (MCP, API/CLI, agente para agente)",
  title: "Escolhendo um Mecanismo de Integração",
  summary:
    "MCP, uma chamada direta de API ou CLI e a delegação agente para agente resolvem problemas diferentes, e escolher o mecanismo errado aparece ou como encanamento desnecessário ou como não determinismo sem limites. A escolha decorre de quem precisa da capacidade e de quem decide quando usá-la.",

  body: [
    {
      kind: "prose",
      md: "Três mecanismos conectam um sistema baseado em Claude ao mundo, e eles não são intercambiáveis.\n\n**MCP** — o Model Context Protocol — é um padrão aberto para expor tools, recursos e prompts a qualquer cliente compatível com MCP. Seu valor está no reuso e no discovery: um servidor, muitos clientes, uma forma uniforme de enumerar o que está disponível. **Uma chamada direta de API ou CLI** é o seu próprio código invocando um sistema, sem camada de protocolo e sem discovery. A delegação **agente para agente** entrega um objetivo, não uma chamada, a outro agente autônomo que faz seu próprio planejamento, com suas próprias tools e seu próprio contexto.",
    },

    { kind: "heading", text: "Duas perguntas decidem" },
    {
      kind: "list",
      ordered: true,
      items: [
        "**Quem decide se isto executa, e com quais argumentos?** Se o código de orquestração sempre sabe, é uma chamada de função — escreva-a em código. Se o modelo precisa decidir em tempo de execução, é uma tool.",
        "**Quantos clientes distintos precisam desta capacidade?** Uma única aplicação significa que uma integração direta basta. Vários agentes, IDEs ou assistentes — especialmente entre equipes — é para isso que a camada de protocolo existe.",
      ],
    },
    {
      kind: "prose",
      md: "Agente para agente é um terceiro caso que nenhuma das duas perguntas cobre. Ele se aplica quando o trabalho precisa de raciocínio independente em várias etapas, de um conjunto diferente de tools e de uma janela de contexto própria — conciliar uma conta, investigar um incidente, pesquisar um assunto. Você delega um objetivo e recebe um resultado, aceitando que as etapas intermediárias são assunto de quem recebeu a delegação.",
    },

    {
      kind: "table",
      caption: "Critérios de seleção entre os três mecanismos",
      headers: ["Critério", "Servidor MCP", "API / CLI direta", "Agente para agente"],
      rows: [
        [
          "Unidade de troca",
          "Definições de tool, recurso ou prompt",
          "Uma requisição e uma resposta específicas",
          "Um objetivo e um resultado",
        ],
        [
          "Quem escolhe os argumentos",
          "O modelo, em tempo de execução",
          "O seu código, de forma determinística",
          "O agente delegado decide suas próprias etapas",
        ],
        [
          "Reuso entre clientes",
          "É a razão de existir",
          "Trabalho por integração, toda vez",
          "Alto, mas o acoplamento é por contrato, não por schema",
        ],
        [
          "Determinismo",
          "Seleção dependente do modelo",
          "Totalmente determinístico",
          "O mais baixo — o delegado planeja por conta própria",
        ],
        [
          "Facilidade de depuração",
          "Boa; chamadas individuais são rastreáveis",
          "A melhor",
          "A mais difícil; é preciso correlacionar dois traces",
        ],
        [
          "Sobrecarga adicionada",
          "Um servidor para executar, versionar e proteger",
          "Nenhuma além da biblioteca cliente",
          "Mais um loop de modelo, com custo e latência próprios",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "MCP é um padrão de transporte e de descrição, não uma capacidade. Embrulhar um endpoint em um servidor MCP não o torna mais disponível para o modelo do que uma tool bem descrita definida inline; o que isso compra é que *outros* clientes possam descobrir e usar a mesma definição sem reimplementá-la. Se há exatamente um consumidor e nenhum requisito de discovery, o servidor é uma sobrecarga que agora você mantém.",
    },

    { kind: "heading", text: "Etapas determinísticas não pertencem ao modelo" },
    {
      kind: "prose",
      md: "O erro de aplicação mais comum é expor uma etapa fixa do pipeline como tool. Se toda execução precisa validar o payload, depois gravar no log de auditoria, depois chamar o serviço de precificação, nessa ordem, codificar essas etapas como tools introduz três chances de o modelo pular, reordenar ou errar os argumentos de uma etapa que não tinha decisão nenhuma. Coloque-as em código e dê tools ao modelo apenas onde um julgamento genuíno em tempo de execução é necessário. É a distinção entre workflow e agente aplicada no nível de uma única chamada.",
    },

    {
      kind: "example",
      title: "Exemplo prático: três integrações, três respostas",
      scenario:
        "Uma equipe de plataforma está conectando um assistente de processamento de sinistros a três sistemas: um serviço de OCR de documentos chamado em todo sinistro enviado, uma consulta interna de apólices de que quatro assistentes diferentes e toda a frota de IDEs da engenharia precisam, e uma revisão de fraude que exige puxar registros de várias fontes e formar um julgamento.",
      walkthrough:
        "1. **OCR em todo sinistro.** Não há decisão — todo sinistro é escaneado. Isso vira uma etapa no código de orquestração que chama diretamente o SDK do serviço, antes mesmo de o modelo ser invocado.\n2. **Consulta de apólices para muitos clientes.** Vários consumidores independentes precisam da mesma capacidade com a mesma semântica. Este é o caso para um servidor MCP: defina uma vez, e todo cliente compatível a descobre.\n3. **Revisão de fraude.** O trabalho é aberto, precisa de suas próprias tools e de um contexto de trabalho grande, e não deve poluir o contexto do assistente de sinistros com dezenas de consultas intermediárias. Delegue-o a um agente dedicado e consuma o veredito dele.\n4. **Confira o trade-off aceito.** O caminho delegado é o menos previsível e o mais difícil de depurar, então ele ganha seu próprio trace id, um orçamento de etapas e um contrato de resultado estruturado.",
      takeaway:
        "O mesmo sistema usou os três mecanismos, escolhidos por capacidade. Os fatores decisivos foram quem toma a decisão, quantos clientes precisam dela e se o trabalho exige raciocínio independente.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Exponha via MCP* soa como a resposta moderna e alinhada a padrões e, por isso, é oferecida em excesso. Em questões que descrevem uma única aplicação com uma integração fixa e nenhum outro consumidor, o gabarito costuma ser a chamada direta. Pergunte o que a camada de protocolo está comprando antes de pagar por ela.",
    },

    {
      kind: "practice",
      questionIds: [
        "D3-q701",
        "D3-q702",
        "D3-q703",
        "D3-q704",
        "D3-q705",
        "D3-q706",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Model Context Protocol (MCP)",
      definition:
        "Um padrão aberto para que servidores exponham tools, recursos e prompts a qualquer cliente compatível, de modo que uma integração possa ser descoberta e reutilizada em muitas aplicações.",
    },
    {
      term: "Delegação agente para agente",
      definition:
        "Entregar um objetivo a outro agente autônomo, com suas próprias tools e seu próprio contexto, e consumir o resultado dele, não as etapas. Compra isolamento e especialização ao custo de previsibilidade.",
    },
    {
      term: "Isolamento de contexto",
      definition:
        "Manter o trabalho intermediário de uma subtarefa em uma janela de contexto separada, para que quem chamou receba apenas a conclusão. Um dos principais motivos para delegar em vez de fazer inline.",
    },
    {
      term: "Ponto de decisão em tempo de execução",
      definition:
        "Um ponto em que a ação a tomar, ou com quais argumentos, depende genuinamente da entrada. O teste para saber se algo deve ser uma tool em vez de código.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Todo serviço interno deve ser embrulhado como servidor MCP para que os agentes possam usá-lo.",
      why: "A camada de protocolo só se paga quando vários clientes independentes precisam da mesma capacidade; com um único consumidor, ela acrescenta um servidor para fazer deploy, versionar, proteger e depurar, sem nenhum ganho no que o modelo consegue fazer.",
      instead:
        "Use uma integração direta quando há um único consumidor e adote MCP quando reuso ou discovery entre clientes for um requisito real.",
    },
    {
      id: "t2",
      trap: "Uma etapa que executa em toda requisição ainda assim deve ser uma tool, para que o agente continue no controle.",
      why: "Expor uma etapa fixa como tool converte uma ação garantida em uma ação probabilística, criando falhas de etapa pulada, reordenada e com argumento errado que simplesmente não existem quando a etapa vive no código de orquestração.",
      instead:
        "Codifique as etapas incondicionais em código e reserve tools para chamadas cujo momento ou cujos argumentos dependam genuinamente da entrada.",
    },
    {
      id: "t3",
      trap: "Delegar a outro agente é uma forma mais limpa de organizar qualquer tarefa de várias etapas.",
      why: "Um agente delegado planeja de forma independente, o que tira de você a capacidade de garantir a sequência e faz as falhas se espalharem por dois traces; o isolamento só vale a pena quando a subtarefa realmente precisa de raciocínio e contexto próprios.",
      instead:
        "Delegue subtarefas abertas que precisam de tools e contexto separados e decomponha sequências previsíveis na sua própria orquestração.",
    },
    {
      id: "t4",
      trap: "Adotar MCP significa substituir a API REST existente do serviço.",
      why: "Um servidor MCP é uma fachada adicional à frente de capacidades que geralmente mantêm sua interface original, e os consumidores existentes que não são agentes continuam chamando a API exatamente como antes.",
      instead:
        "Trate o MCP como uma forma de descrever e expor capacidades existentes a clientes de modelo, não como uma migração do serviço subjacente.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 3",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Model Context Protocol",
      url: "https://modelcontextprotocol.io",
      kind: "external",
    },
    {
      label: "Building Effective Agents — Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],
} satisfies Lesson;
