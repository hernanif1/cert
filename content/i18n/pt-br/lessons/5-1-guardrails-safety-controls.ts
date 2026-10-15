import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "5.1",
  slug: "5-1-guardrails-safety-controls",
  domain: 5,
  objective: "Implementar guardrails e controles de segurança",
  title: "Guardrails e Controles de Segurança",
  summary:
    "Um guardrail é um componente no caminho da requisição, não uma frase em um prompt: classificadores, filtros e verificações de autorização que rodam onde o modelo não tem voto. Este objetivo trata de qual camada impõe o quê, e do que o sistema faz quando uma delas falha ou dispara.",

  body: [
    {
      kind: "prose",
      md: "Um guardrail é um controle que roda **fora** do modelo. Essa distinção sustenta a maior parte deste objetivo. Instruções dentro de um prompt moldam o comportamento e merecem ser escritas com cuidado, mas são consultivas: podem ser contornadas por raciocínio, sobrepostas por texto escondido em conteúdo recuperado ou ignoradas em uma amostra azarada, e nada fora do modelo percebe. Uma verificação implementada em código ao redor do modelo ou roda, ou não roda.\n\nPortanto, a pergunta de arquitetura nunca é *o que o prompt deve dizer*. É *qual camada impõe isso, o que essa camada faz quando está indisponível e o que acontece depois que ela dispara*.",
    },

    { kind: "heading", text: "Defesa em camadas" },
    {
      kind: "prose",
      md: "Os controles ficam em pontos distintos do caminho da requisição, e cada ponto captura uma classe diferente de problema. Um sistema com controles em um único ponto tem um ponto único de falha.",
    },
    {
      kind: "table",
      caption: "Onde cada controle roda e o que ele não consegue enxergar",
      headers: ["Camada", "Roda", "Captura", "Não enxerga"],
      rows: [
        [
          "Triagem de entrada",
          "Antes da chamada ao modelo",
          "Strings sabidamente ruins, dados pessoais que nunca deveriam ser enviados, padrões reconhecíveis de jailbreak",
          "Dano que só aparece na resposta",
        ],
        [
          "Tratamento de conteúdo não confiável",
          "Entre a recuperação e o prompt",
          "Instruções embutidas em documentos e em resultados de tools",
          "Conteúdo nocivo apenas em combinação",
        ],
        [
          "Triagem de saída",
          "Depois da geração, antes da entrega",
          "Conteúdo proibido, segredos vazados, dados pessoais, afirmações sem sustentação",
          "Efeitos colaterais que o turno já causou",
        ],
        [
          "Autorização de ações",
          "Dentro da tool, antes do efeito colateral",
          "Limites de valor, titularidade do registro, allowlists de destino",
          "Conteúdo ruim que não toca em nenhuma tool",
        ],
        [
          "Monitoramento e controle de taxa",
          "Entre sessões",
          "Padrões de abuso, picos na taxa de disparo, anomalias de custo",
          "Uma requisição isolada, feita pela primeira vez",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "**A ordem importa tanto quanto a cobertura.** Uma triagem de saída que roda depois que uma tool já executou é uma trilha de auditoria, não um guardrail. Se uma ação é irreversível — dinheiro movimentado, e-mail enviado, um registro apagado — a verificação pertence ao momento *anterior* ao efeito colateral, dentro da tool, onde uma verificação reprovada devolve um erro em vez de abrir uma negociação.",
    },

    { kind: "heading", text: "Blocklists e classificadores fazem trabalhos diferentes" },
    {
      kind: "prose",
      md: "Uma blocklist é determinística, barata, auditável e trivialmente contornada por paráfrase, tradução, espaçamento ou codificação. Um classificador generaliza entre formulações, mas custa uma chamada, adiciona latência e devolve uma pontuação em vez de um fato — logo, tem um limiar, e um trade-off entre falsos positivos e falsos negativos que alguém precisa escolher deliberadamente.\n\nUse os dois, cada um naquilo em que é bom. Regras determinísticas pertencem às formas exatas: números de conta, hostnames internos, prefixos de chave. Classificadores pertencem à intenção: assédio, autolesão, aconselhamento não autorizado, uma tentativa de extrair o system prompt. Uma resposta que adota um e descarta o outro costuma ser o distrator.",
    },
    {
      kind: "code",
      lang: "json",
      code: `{\n  "input": {\n    "pii_patterns": { "action": "redact_and_log" },\n    "injection_classifier": { "threshold": 0.7, "action": "strip_and_flag" }\n  },\n  "output": {\n    "secret_scan": { "action": "block" },\n    "safety_classifier": { "threshold": 0.5, "action": "block_and_queue" }\n  },\n  "tools": {\n    "issue_refund": { "max_amount": 250, "enforced_in": "tool", "approval_above": 50 },\n    "send_email": { "recipient_allowlist": "account_contacts_only" }\n  },\n  "on_guardrail_unavailable": {\n    "irreversible_actions": "fail_closed",\n    "informational_responses": "fail_open_and_page"\n  }\n}`,
    },

    { kind: "heading", text: "Fail-closed ou fail-open é uma decisão por ação" },
    {
      kind: "prose",
      md: "Todo guardrail tem um estado de indisponibilidade: o classificador estoura o tempo limite, o serviço de políticas está fora do ar, o scanner lança uma exceção. Decida o comportamento conforme a severidade de cada ação, e não globalmente.",
    },
    {
      kind: "table",
      caption: "Os dois modos de falha e onde cada um pertence",
      headers: ["Modo", "O que acontece", "Quando usar", "Exemplo"],
      rows: [
        [
          "**Falhe fechado**",
          "A ação é bloqueada até o guardrail voltar.",
          "Ação irreversível ou conteúdo de alto risco.",
          "O scanner de segredos cai. A tool `send_email` recusa enviar e devolve um erro, em vez de arriscar vazar uma chave.",
        ],
        [
          "**Falhe aberto**",
          "A ação segue em modo degradado, com alerta ruidoso.",
          "Resposta legítima de baixo risco, onde bloquear custa mais do que o risco residual.",
          "O classificador de tom estoura o tempo limite. O assistente responde a uma dúvida de FAQ mesmo assim, registra o evento e dispara um alerta.",
        ],
      ],
    },
    {
      kind: "prose",
      md: "O que você não pode fazer é deixar isso indefinido. Um guardrail indefinido falha aberto sob carga, e carga é a coisa mais barata que um adversário consegue fabricar.",
    },

    { kind: "heading", text: "O que precisa acontecer quando um controle dispara" },
    {
      kind: "prose",
      md: "Um controle **dispara** quando a condição que ele vigia é satisfeita: a regra bate, a pontuação cruza o limiar, a verificação reprova. Nesse momento ele deixa de observar e passa a agir, e a ação precisa estar definida antes, em código, não improvisada pelo modelo. Por exemplo:",
    },
    {
      kind: "table",
      headers: ["Controle", "Quando ele dispara", "Ação possível"],
      rows: [
        ["Blocklist", "A resposta contém um hostname proibido", "Bloquear a resposta"],
        ["Scanner de segredos", "Detecta uma chave de API na resposta", "Impedir a entrega"],
        ["Classificador", "A pontuação de conteúdo perigoso ultrapassa o limiar configurado", "Bloquear e encaminhar para revisão"],
        ["Verificação na ferramenta de reembolso", "O valor solicitado ultrapassa o limite permitido sem aprovação", "Suspender a operação e exigir aprovação"],
      ],
    },
    {
      kind: "prose",
      md: "Independentemente de qual controle disparou, o que acontece em seguida segue o mesmo roteiro:",
    },
    {
      kind: "list",
      items: [
        "**Devolva uma resposta determinística que o modelo não escreveu.** Uma recusa gerada pelo mesmo modelo que produziu o conteúdo bloqueado não é um controle.",
        "**Registre o evento em log** com o trace id, a regra que disparou, a pontuação e um hash da entrada — não o conteúdo bruto, a menos que a política de retenção permita.",
        "**Incremente um contador.** Um pico na taxa de disparo é ou um ataque, ou uma regressão, e os dois merecem um alerta.",
        "**Encaminhe para revisão** onde um falso positivo sai caro, para que uma requisição bloqueada indevidamente chegue a uma pessoa e não a uma lixeira.",
        "**Ajuste com base em falsos positivos confirmados.** Um guardrail que ninguém ajusta é desligado em menos de um trimestre.",
      ],
    },

    {
      kind: "example",
      title: "Exemplo prático: um assistente que informa preços que não deveria",
      scenario:
        "Um assistente de vendas voltado a parceiros recupera dados do CRM e de uma planilha interna de preços. O system prompt manda nunca divulgar os pisos internos de desconto. Com insistência suficiente, ele os divulga mesmo assim, e já começou a gerar cotações abaixo do piso aprovado.",
      walkthrough:
        "1. **Nomeie a camada.** O conteúdo sai pela resposta, então a camada que impõe a regra é a triagem de saída. O prompt estava fazendo um trabalho que um prompt não consegue fazer.\n2. **Divida o problema de detecção.** Códigos de piso têm uma forma exata, então uma varredura determinística os captura. *Informar preços não publicados* tem formato de intenção e exige um classificador.\n3. **Em vez disso, remova o dado.** O agente voltado a parceiros não tem por que recuperar a planilha interna: conteúdo que nunca está no contexto não pode vazar.\n4. **Autorize a ação.** A tool de cotação valida o desconto no serviço de direitos (entitlements) antes de gravar, e rejeita valores fora da política, não importa o que o modelo tenha pedido.\n5. **Defina o comportamento no disparo.** Respostas bloqueadas devolvem uma mensagem fixa, registram um evento com pontuação, incrementam um contador e abrem um ticket para a operação de vendas.",
      takeaway:
        "Agora quatro camadas independentes precisam falhar juntas. Antes da revisão, a camada mais fraca era também a única.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Adicionar uma instrução ao system prompt* aparece em quase toda questão sobre guardrails e quase nunca é o gabarito neste nível. Prompts são uma camada probabilística; a prova está perguntando qual controle continua de pé quando o modelo está errado, confuso ou sendo manipulado por um conteúdo que lhe pediram para ler.",
    },

    {
      kind: "practice",
      questionIds: [
        "D5-q101",
        "D5-q102",
        "D5-q103",
        "D5-q104",
        "D5-q105",
        "D5-q106",
        "D5-q107",
        "D5-q108",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Defesa em profundidade",
      definition:
        "Controles independentes nas camadas de entrada, recuperação, saída e ação, dimensionados para que nenhuma falha isolada produza o dano. A independência é a propriedade que importa: verificações correlacionadas são uma verificação só.",
    },
    {
      term: "Classificador de entrada",
      definition:
        "Um modelo ou regra que pontua uma requisição recebida antes da chamada principal e pode mascarar trechos dela, sinalizá-la ou rejeitá-la. Barato em toda requisição, cego para qualquer coisa que o modelo gere depois.",
    },
    {
      term: "Filtro de saída",
      definition:
        "Uma triagem aplicada à resposta gerada antes que ela chegue ao usuário. Protege o leitor; não consegue desfazer um efeito colateral que o turno já causou.",
    },
    {
      term: "Fail-closed",
      definition:
        "Negar a operação quando um controle não pode ser avaliado. O padrão correto para ações irreversíveis, porque a alternativa transforma qualquer indisponibilidade em uma janela sem proteção.",
    },
    {
      term: "Raio de impacto (blast radius)",
      definition:
        "Tudo o que uma única manipulação bem-sucedida consegue alcançar: registros legíveis, ações invocáveis, destinos graváveis. É a contenção, não a detecção, que o delimita.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Um system prompt escrito com cuidado é suficiente para impedir que um agente execute uma ação proibida.",
      why: "Instruções de prompt são consultivas e probabilísticas: podem ser sobrepostas por texto escondido em um documento recuperado, contornadas por argumentação ou ignoradas em uma única amostra, e nada fora do modelo detecta que isso aconteceu.",
      instead:
        "Imponha as operações proibidas dentro da tool, onde uma verificação reprovada devolve um erro em vez de uma opinião.",
    },
    {
      id: "t2",
      trap: "Com um classificador de segurança em operação, blocklists baseadas em padrões ficam obsoletas.",
      why: "Classificadores devolvem probabilidades e generalizam entre formulações, mas são pouco confiáveis em strings de forma exata, como números de conta e prefixos de chave, onde uma regra determinística nunca erra e custa quase nada.",
      instead: "Combine os dois: regras para formas exatas, classificadores para intenção.",
    },
    {
      id: "t3",
      trap: "Um guardrail que estoura o tempo limite deve deixar a requisição passar, para que um problema de disponibilidade não vire uma indisponibilidade para o usuário.",
      why: "Falhar aberto globalmente converte qualquer pico de carga ou incidente de dependência em uma janela sem nenhum controle de segurança, e gerar carga é a jogada mais barata à disposição de um adversário.",
      instead:
        "Falhe fechado em caminhos irreversíveis ou de alto risco; falhe aberto, acionando o plantão, apenas onde o risco residual é de fato menor que o custo de bloquear.",
    },
    {
      id: "t4",
      trap: "Fazer a triagem da saída do modelo é suficiente, já que tudo o que o usuário vê passa por ela.",
      why: "A triagem de saída roda depois que as chamadas de tool do turno já executaram, então consegue impedir que o usuário leia sobre uma transferência, mas não consegue impedir a transferência, a exclusão ou o e-mail que já aconteceram.",
      instead: "Autorize os efeitos colaterais na tool; faça a triagem da saída para o leitor.",
    },
    {
      id: "t5",
      trap: "Pedir ao modelo que revise a própria resposta adiciona uma segunda camada de defesa.",
      why: "Uma autoverificação compartilha os pesos, o contexto e quaisquer instruções injetadas que produziram o problema, de modo que suas falhas se correlacionam com as falhas que ela deveria capturar — a única propriedade que uma segunda camada não pode ter.",
      instead:
        "Use um classificador separado ou, no mínimo, uma chamada separada com um prompt restrito e sem acesso ao conteúdo não confiável.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 5",
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

  relatedLessons: ["3.2", "5.2"],
} satisfies Lesson;
