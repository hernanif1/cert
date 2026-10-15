import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "7.3",
  slug: "7-3-debugging-operational-issues",
  domain: 7,
  objective: "Apoiar a depuração e a resolução de problemas operacionais",
  title: "Depuração e Suporte Operacional",
  summary:
    "Quando um sistema baseado em Claude se comporta mal em produção, a primeira tarefa é restaurar o serviço e a segunda é descobrir o porquê — nessa ordem. Este objetivo trata do ofício operacional: capturar o suficiente para reproduzir uma falha não determinística, ler um trace que atravessa vários estágios, fazer a triagem pelo raio de impacto, fazer rollback e transformar o incidente em algo de que o sistema se lembra.",

  body: [
    {
      kind: "prose",
      md: "Diagnosticar *por que o modelo produziu aquela saída* é uma habilidade à parte, coberta no Domínio 4. Esta lição trata de tudo o que está em volta: o relato de um colega, o trace que atravessa cinco serviços, o rollback e o postmortem.\n\nA regra que rege tudo é que **mitigação e diagnóstico são trabalhos diferentes, com relógios diferentes**. Os usuários estão falhando agora; a causa raiz pode levar um dia. Restaure o serviço primeiro — reverta o deploy, desligue a flag, fixe a versão anterior do prompt — e investigue depois, a partir das evidências capturadas. Um rollback não destrói a investigação; os logs, os traces e as requisições capturadas continuam lá.",
    },

    { kind: "heading", text: "Reproduzindo uma falha não determinística" },
    {
      kind: "prose",
      md: "\"Eu testei e funcionou\" não é evidência. A amostragem faz da saída uma distribuição, então um replay bem-sucedido não diz quase nada sobre uma falha que ocorre uma vez em vinte. Reproduzir significa reexecutar repetidamente a requisição capturada, medir a taxa de falha e comparar essa taxa antes e depois de uma mudança.\n\nO replay só é possível se a requisição foi capturada, o que faz disso uma decisão de projeto, não uma decisão tomada durante o incidente. Uma requisição reproduzível carrega, no mínimo:",
    },
    {
      kind: "list",
      items: [
        "Um **identificador de requisição** que aparece em toda linha de log e em todo span downstream daquela requisição.",
        "As **versões de tudo o que molda o comportamento**: versão do template de prompt, identificador do modelo, versões de tools e de servidores MCP, versão do índice de recuperação.",
        "A **entrada e a saída completas**, incluindo as chamadas de tool e seus resultados, sujeitas à política de redação de dados sensíveis que se aplicar.",
        "O **contexto recuperado** — ao menos os identificadores dos documentos, para que você saiba se o modelo viu o material certo.",
        "O **tempo por estágio**, para que uma reclamação de latência possa ser atribuída a um estágio, e não ao sistema como um todo.",
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Um identificador de correlação propagado por todos os estágios é o que converte \"o assistente está quebrado\" em \"o p99 do vector store foi para oito segundos às 14:02.\" Sem ele, um sistema com LLM é uma única caixa opaca, e toda investigação recomeça a partir da descrição do usuário.",
    },

    { kind: "heading", text: "Triagem, rollback e o postmortem" },
    {
      kind: "prose",
      md: "A triagem classifica por raio de impacto e reversibilidade, não por quão interessante é o bug. Quantos usuários, quão grave para cada um, está piorando, dá para desfazer? Essas respostas definem a severidade, e a severidade determina o escalonamento. Estabelecer cedo se a falha é sua ou upstream poupa horas de investigação em código que nunca mudou.\n\nO rollback exige que tudo o que é capaz de mudar o comportamento seja versionado e reversível. Em um sistema com LLM essa lista é mais longa do que em um serviço convencional: prompts, seleção de modelo, definições de tools e o índice de recuperação mudam o comportamento sem um deploy de código. Uma edição de prompt publicada fora do processo de release é a causa mais comum de uma regressão inexplicada, justamente porque nada no registro de mudanças a mostra.",
    },
    {
      kind: "table",
      caption: "Do sinal à primeira verificação",
      headers: ["Como o sinal se apresenta", "Verifique primeiro", "Onde costuma estar"],
      rows: [
        [
          "Começa em um horário bem definido, sem nenhum deploy seu",
          "Status do provedor, saúde das dependências, execuções noturnas de pipeline",
          "Fora da sua aplicação",
        ],
        [
          "Começa imediatamente depois de um release",
          "Faça o diff do release e o rollback antes de diagnosticar",
          "A mudança",
        ],
        [
          "Intermitente, mais ou menos uma requisição em vinte",
          "Reexecute a requisição capturada muitas vezes; olhe timeouts e retries",
          "Variância de amostragem ou uma dependência instável",
        ],
        [
          "Só um tenant ou uma coorte",
          "Os dados deles, as permissões deles, o escopo de recuperação deles",
          "Configuração ou conteúdo por tenant",
        ],
        [
          "Latência em alta, qualidade da saída inalterada",
          "Tempos por estágio no trace, mais o enfileiramento",
          "Um estágio, raramente o modelo em si",
        ],
      ],
    },
    {
      kind: "prose",
      md: "O postmortem é sem culpados por uma razão prática, não sentimental: apontar um indivíduo suprime os relatos que tornam o próximo incidente visível. Monte a linha do tempo a partir do trace, não da memória, e exija que cada item de ação mude o sistema. \"Tenha mais cuidado ao editar prompts\" não é um item de ação; adicionar o caso que falhou à suíte de regressão, condicionar mudanças de prompt a code review e adicionar o alerta que teria pegado o problema vinte minutos antes, todos são.\n\nDar suporte a outros desenvolvedores corre sobre os mesmos trilhos: peça o identificador da requisição antes da descrição, reproduza antes de teorizar e escreva a entrada no runbook para que a próxima pessoa não repita a investigação.",
    },

    {
      kind: "example",
      title: "Exemplo prático: chamadas de tool falhando depois de um upgrade",
      scenario:
        "Um assistente interno de programação começa a falhar em cerca de 15% das requisições que tocam o issue tracker. O erro chega aos usuários como um pedido de desculpas genérico. Um desenvolvedor reporta o caso como \"o assistente está alucinando números de ticket.\" Nenhum deploy da aplicação saiu nos últimos quatro dias.",
      walkthrough:
        "1. **Mitigue primeiro.** O tráfego do workflow afetado é desviado da integração e os usuários recebem uma mensagem clara. O relógio do impacto sobre o usuário para antes que alguém diagnostique qualquer coisa.\n2. **Consiga um identificador, não um adjetivo.** O id da requisição reportada leva a um trace em que a chamada ao servidor MCP do issue tracker retorna um erro de schema, depois do qual o modelo improvisou um número de ticket plausível. O sintoma visível ao usuário estava downstream da falha real.\n3. **Correlacione com a linha do tempo.** As falhas começam às 09:14, coincidindo com uma atualização de versão minor desse servidor MCP, implantada por outra equipe — um componente que muda o comportamento, fora do processo de release da própria aplicação.\n4. **Faça o rollback da mudança real.** O servidor é fixado na versão anterior e a taxa de falha volta a zero. A análise de causa raiz continua contra os traces capturados, não contra a produção.\n5. **Feche o ciclo.** As ações do postmortem são sistêmicas: as versões dos servidores MCP passam a ser fixadas e atualizadas deliberadamente, um alerta de taxa de erro em chamadas de tool é adicionado, e o caso do erro de schema vira um teste de regressão, para que o assistente falhe de forma ruidosa em vez de inventar um número de ticket.",
      takeaway:
        "O sintoma reportado apontava para o modelo, e a falha estava em um upgrade de dependência que ninguém tinha registrado como mudança. O trace e o id de correlação tornaram isso visível em minutos; o rollback restaurou o serviço antes de a causa ser compreendida.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Em cenários de incidente, as alternativas que começam pela análise de causa raiz — adicionar logging, reproduzir localmente, revisar o prompt — são sedutoras porque soam rigorosas. Enquanto uma indisponibilidade está em curso, a resposta do gabarito restaura o serviço primeiro. A investigação vem depois, a partir das evidências capturadas.",
    },

    {
      kind: "practice",
      questionIds: [
        "D7-q301",
        "D7-q302",
        "D7-q303",
        "D7-q304",
        "D7-q305",
        "D7-q306",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Identificador de correlação",
      definition:
        "Um id de requisição carregado por toda linha de log e todo span de uma única interação do usuário; é o que torna uma falha rastreável através da recuperação, da chamada ao modelo, das tools e dos serviços downstream.",
    },
    {
      term: "Mitigação antes do diagnóstico",
      definition:
        "Restaurar o serviço — rollback, desligar a flag, fixar a versão — antes de investigar a causa. As duas atividades têm urgências diferentes, e um rollback preserva as evidências.",
    },
    {
      term: "Reprodução por replay",
      definition:
        "Reexecutar muitas vezes uma requisição capturada para medir uma taxa de falha, já que a amostragem torna uma única tentativa bem-sucedida irrelevante como evidência sobre uma falha intermitente.",
    },
    {
      term: "Postmortem sem culpados",
      definition:
        "Uma revisão de incidente que corrige o sistema que permitiu o erro, em vez de identificar uma pessoa, porque a culpa suprime os relatos que mantêm os incidentes visíveis.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Uma falha intermitente que não se reproduz em uma nova tentativa manual não é reproduzível.",
      why: "A amostragem faz da saída do modelo uma distribuição, não um valor fixo; um replay bem-sucedido é inteiramente compatível com uma falha que ocorre em uma requisição a cada vinte.",
      instead:
        "Reexecute a requisição capturada muitas vezes e compare as taxas de falha, tratando a própria taxa como aquilo que você está reproduzindo.",
    },
    {
      id: "t2",
      trap: "Fazer rollback antes de entender a causa só esconde o problema.",
      why: "Mitigação e diagnóstico têm relógios diferentes — os usuários continuam falhando enquanto a investigação corre — e um rollback deixa os logs, os traces e as requisições capturadas totalmente intactos para análise.",
      instead:
        "Restaure o serviço primeiro e depois diagnostique a partir das evidências capturadas, em um ambiente que não seja o de produção.",
    },
    {
      id: "t3",
      trap: "Prompt e configuração de modelo são conteúdo, então não precisam passar pelo processo de release.",
      why: "Ambos mudam o comportamento em produção tão completamente quanto uma mudança de código e, como nenhum dos dois aparece no log de deploys, uma regressão causada por um deles fica invisível para todos os que investigam o incidente.",
      instead:
        "Versione prompts, seleção de modelo, definições de tools e builds do índice, e exija o mesmo caminho de revisão e de reversão do código.",
    },
    {
      id: "t4",
      trap: "Um bom postmortem identifica quem cometeu o erro, para que a mesma pessoa não o repita.",
      why: "Atribuir culpa desestimula os relatos que trazem os incidentes à tona cedo, e quase toda falha é um sistema que permitiu que um erro humano comum chegasse à produção sem verificação.",
      instead:
        "Mantenha a revisão sem culpados e exija que cada item de ação mude o sistema — uma barreira, um alerta ou um teste de regressão.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 7",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],
  relatedLessons: ["4.4", "4.6", "7.2"],
} satisfies Lesson;
