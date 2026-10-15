import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "1.2",
  slug: "1-2-end-to-end-architecture",
  domain: 1,
  objective:
    "Projetar arquiteturas de ponta a ponta (entrada → processamento → saída → ciclos de feedback)",
  title: "Arquitetura de Ponta a Ponta",
  summary:
    "Um design de ponta a ponta tem quatro estágios — entrada, processamento, saída, feedback — e um estágio que o diagrama omite é um estágio sem dono. O feedback é o que os times pulam, e pulá-lo é o que deixa um sistema para sempre com a qualidade do lançamento.",

  body: [
    {
      kind: "prose",
      md: "O Domínio 1 pede que você desenhe o sistema inteiro, não a chamada ao modelo no meio dele. Cada um dos quatro estágios responde por garantias que os outros não conseguem oferecer, e a falha comum não é um estágio fraco, mas um estágio ausente. Um design que termina em *o modelo devolve uma resposta* não tem como saber se a resposta estava certa nem tem um caminho para levar esse conhecimento de volta ao sistema.",
    },

    { kind: "heading", text: "Entrada: tudo o que acontece antes de o modelo ver qualquer coisa" },
    {
      kind: "prose",
      md: "O estágio de entrada responde por quatro responsabilidades, e elas acontecem nessa ordem — cada uma estreitando o que tem permissão de chegar ao modelo:",
    },
    {
      kind: "list",
      items: [
        "**Ingestão.** Onde os formatos convergem. PDFs, corpos de e-mail, webhooks e envios de formulário viram uma única representação interna, de modo que nada a jusante precisa saber por qual canal um registro chegou.",
        "**Normalização.** Onde essa representação é uniformizada. Codificações, datas, unidades, moedas e nomes de campo são resolvidos uma vez, em código, em vez de ficarem a cargo do prompt.",
        "**Validação.** Onde o que não é processável é rejeitado antes que se gastem tokens com isso — um campo obrigatório ausente, um arquivo grande demais para a janela de contexto, um tipo que nenhum extrator trata.",
        "**Confiança.** Onde cada registro é rotulado com a sua origem, porque é a origem que decide se o conteúdo dele pode agir sobre o sistema.",
      ],
    },
    {
      kind: "prose",
      md: "A confiança é a menos óbvia das quatro e aquela sobre a qual os revisores perguntam. Conteúdo que chega de fora da organização é dado, nunca instrução. Essa fronteira é imposta de forma estrutural: delimite o conteúdo externo, mantenha-o separado das instruções e nunca deixe que um texto vindo de um fornecedor, de um cliente ou de uma página web decida o que uma tool tem permissão para fazer.",
    },

    { kind: "heading", text: "Processamento: a parte que todo mundo desenha" },
    {
      kind: "prose",
      md: "O processamento cobre as chamadas ao modelo e o fluxo de controle em torno delas — recuperação, invocação de tools, ramificações, novas tentativas e estado. Duas decisões de arquitetura moram aqui. A primeira é quem decide a sequência: o código ou o modelo. A segunda é o que o modelo tem permissão para alcançar, que é uma questão de autorização, e não de prompt. As tools carregam os privilégios do sistema, portanto o escopo delas é projetado, e não herdado.",
    },

    { kind: "heading", text: "Saída: um contrato, não uma string" },
    {
      kind: "prose",
      md: "Quem recebe a saída são outros sistemas, e sistema lê registro, não texto corrido. O estágio de saída formata o resultado, valida contra um schema e define o que fazer quando a validação falha: corrigir uma vez, tentar de novo com um limite de tentativas ou mandar para um humano. Ele também cuida da entrega e de onde entra a revisão.\n\nOnde a revisão entra é o que a prova cobra. Revisar depois de uma ação irreversível não impede nada — só registra o erro. Se a revisão existe para impedir algo, ela precisa vir antes da ação.",
    },

    { kind: "heading", text: "Ciclos de feedback: o estágio que acaba pulado" },
    {
      kind: "prose",
      md: "Um ciclo de feedback transforma o comportamento em produção em evidência e, depois, em mudança. Ele tem três partes, e as três são projetadas antes do lançamento, porque duas delas não podem ser acrescentadas depois.\n\n**Capturar.** Registre em log, juntos, a entrada, a versão do prompt, a versão do modelo, a saída e o desfecho. Um desfecho sem a sua entrada é uma nota sobre a qual ninguém consegue agir.\n\n**Rotular.** Correções humanas são os rótulos mais baratos que uma organização jamais vai conseguir. Quando um revisor edita um rascunho ou move um ticket para outra fila, isso é um exemplo rotulado, e um design que não o armazena jogou fora o seu conjunto de avaliação.\n\n**Agir.** As correções se acumulam em uma suíte de regressão, de modo que uma mudança em um prompt, em um modelo ou em uma estratégia de recuperação é medida, em vez de discutida.",
    },
    {
      kind: "table",
      caption: "O que cada estágio responde, e o que quebra sem ele",
      headers: ["Estágio", "Responde por", "Fraco ou ausente"],
      rows: [
        [
          "Entrada",
          "Ingestão, normalização, validação, a fronteira de confiança para conteúdo externo",
          "Gasto desperdiçado com registros não processáveis; texto externo capaz de conduzir o sistema",
        ],
        [
          "Processamento",
          "Chamadas ao modelo, recuperação, escopo das tools, fluxo de controle, novas tentativas, estado",
          "Loops sem limite e tools com mais autoridade do que a tarefa precisa",
        ],
        [
          "Saída",
          "Validação de schema, tratamento de falhas, entrega, posicionamento do ponto de controle",
          "Corrupção silenciosa a jusante; revisão que não consegue impedir nada",
        ],
        [
          "Feedback",
          "Captura, rotulagem, o conjunto de avaliação, monitoramento de drift",
          "A qualidade do lançamento vira qualidade permanente; regressões descobertas pelos clientes",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Decida o que registrar em log antes do lançamento. Correlacionar uma saída com a entrada, a versão do prompt e a versão do modelo exatas que a produziram é quase de graça em tempo de design e, na prática, impossível de reconstruir depois.",
    },

    {
      kind: "example",
      title: "Exemplo prático: um pipeline de entrada de faturas",
      scenario:
        "Um time de serviços compartilhados processa 9.000 faturas de fornecedores por mês. As faturas chegam como anexos de e-mail, um modelo extrai quinze campos e os campos são gravados no ERP. Depois do lançamento, a carga no ERP falha algumas vezes por mês, e o número de acurácia que o time cita ainda é o do conjunto de testes anterior ao lançamento.",
      walkthrough:
        "1. **Entrada.** Os anexos são normalizados em um único registro interno, e tudo o que não for uma fatura legível é rejeitado antes de qualquer chamada ao modelo. O texto do fornecedor é delimitado e nunca é tratado como instrução.\n2. **Processamento.** A extração roda contra uma especificação de campos, e campos de baixa confiança são sinalizados, em vez de adivinhados.\n3. **Saída.** O registro é validado contra o schema do ERP. Um registro que falha é reparado uma vez e depois encaminhado a um atendente — nunca convertido à força em null e carregado, que era o que o time vinha fazendo.\n4. **Feedback.** Cada correção do atendente é armazenada junto com o documento original e a versão do prompt. Depois de um mês, o time tem 400 rótulos reais.\n5. **Agir.** Esses rótulos viram o conjunto de regressão, de modo que a próxima mudança de prompt é medida, em vez de debatida.",
      takeaway:
        "Só o passo quatro faltava no lançamento, e a ausência dele é o motivo pelo qual ninguém conseguia responder a uma pergunta sobre qualidade quatro meses depois. Os outros três estágios funcionavam e não ensinavam nada ao time.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Quando o enunciado diz que a qualidade não melhorou desde o lançamento, as opções tentadoras são todas intervenções — um modelo maior, uma camada de recuperação, uma passada de verificador. Cada uma é uma mudança isolada, sem nenhum jeito de saber se ajudou. A resposta do gabarito é o mecanismo: desfechos capturados e vinculados às entradas e versões que os produziram.",
    },

    {
      kind: "practice",
      questionIds: [
        "D1-q201",
        "D1-q202",
        "D1-q203",
        "D1-q204",
        "D1-q205",
        "D1-q206",
        "D1-q207",
        "D1-q208",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Fronteira de confiança",
      definition:
        "A linha em que o conteúdo fornecido externamente é marcado como dado, e não como instrução, imposta pela estrutura e pela autorização das tools, e não por um pedido educado ao modelo.",
    },
    {
      term: "Contrato de saída",
      definition:
        "O schema do qual um consumidor a jusante depende, validado de forma determinística antes da entrega, com um caminho definido para os registros que falham na validação.",
    },
    {
      term: "Ponto de controle no caminho",
      definition:
        "Uma verificação humana ou programática colocada antes de uma ação irreversível, em oposição a uma revisão pós-entrega, que só consegue corrigir o registro.",
    },
    {
      term: "Captura de correções",
      definition:
        "Armazenar a edição de um humano junto com a entrada, a versão do prompt e a versão do modelo que produziram a saída original, transformando o trabalho rotineiro de revisão em dados de avaliação rotulados.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Um controle de joinha para cima e joinha para baixo atende ao requisito de ciclo de feedback.",
      why: "Uma nota sem vínculo com a entrada, a versão do prompt e a versão do modelo que produziram a saída diz ao time que algo estava errado sem lhe dar nada para reproduzir, medir ou mudar.",
      instead:
        "Capture o registro inteiro — entrada, versões, saída, desfecho — e trate as correções humanas como o rótulo.",
    },
    {
      id: "t2",
      trap: "A validação da saída pode ser delegada ao modelo que produziu a saída.",
      why: "Um modelo a quem se pede que confira o próprio trabalho compartilha o raciocínio que produziu o erro e com frequência vai confirmá-lo, ao passo que garantias estruturais, como a conformidade com o schema, podem ser impostas em código com certeza.",
      instead:
        "Valide a estrutura de forma determinística e reserve a revisão por modelo para julgamentos que o código não consegue expressar.",
    },
    {
      id: "t3",
      trap: "Uma etapa de revisão humana colocada depois da entrega ainda conta como controle.",
      why: "Depois que uma ação irreversível foi tomada — uma mensagem enviada, um pagamento emitido, um sinistro negado —, uma revisão posterior só consegue corrigir o registro, não impedir o dano que o ponto de controle foi criado para evitar.",
      instead:
        "Coloque o ponto de controle no caminho da ação que ele governa e faça amostragem posterior apenas onde a ação for reversível.",
    },
    {
      id: "t4",
      trap: "Ciclos de feedback são uma preocupação de operações que pode ser acrescentada quando o sistema já estiver no ar.",
      why: "Captura e correlação precisam estar no caminho da requisição desde o primeiro dia, porque um evento que nunca foi registrado em log com a sua versão de prompt e de modelo não pode ser reconstruído a partir de nada posterior.",
      instead:
        "Trate o schema de logging como uma entrega de tempo de design, ao lado do prompt e das definições de tools.",
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
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["1.3"],
} satisfies Lesson;
