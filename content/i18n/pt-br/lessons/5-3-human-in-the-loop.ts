import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "5.3",
  slug: "5-3-human-in-the-loop",
  domain: 5,
  objective: "Aplicar estratégias de validação com humano no circuito (human-in-the-loop)",
  title: "Validação com Humano no Circuito",
  summary:
    "A revisão humana não é um controle, e sim uma família deles, e a pergunta de design é quais decisões chegam a uma pessoa, quando e com quais evidências. Uma etapa de revisão da qual o revisor não consegue, na prática, discordar compra teatro de responsabilização, não segurança.",

  body: [
    {
      kind: "prose",
      md: "Três posicionamentos, com economias muito diferentes. **In the loop**: uma pessoa aprova antes do efeito colateral, então a ação não acontece sem ela. **On the loop**: o sistema age e uma pessoa monitora, podendo intervir ou reverter. **Over the loop**: ninguém vê as decisões individuais, mas uma amostra é auditada depois para estimar a taxa de erro do caminho automatizado.\n\nA maioria das questões da prova está, na verdade, perguntando qual deles se encaixa em um perfil de risco descrito, e a resposta quase nunca é *revisar tudo*.",
    },
    {
      kind: "table",
      caption: "Casando o padrão de revisão com a decisão",
      headers: ["Padrão", "O humano age", "Cobertura", "Custo", "Serve para"],
      rows: [
        [
          "Portão de aprovação",
          "Antes do efeito colateral",
          "Todo item encaminhado",
          "Latência humana no caminho da requisição",
          "Decisões irreversíveis, de alto valor ou reguladas",
        ],
        [
          "Escalonamento por regra",
          "Antes do efeito colateral, apenas nos itens encaminhados",
          "O subconjunto que aciona uma condição",
          "Latência apenas nos escalonamentos",
          "Populações mistas em que a maioria dos casos é rotineira",
        ],
        [
          "Monitoramento com intervenção",
          "Durante ou logo depois",
          "Fila ao vivo, melhor esforço",
          "Equipe, não latência",
          "Ações reversíveis de alto volume",
        ],
        [
          "Janela de reversibilidade",
          "Depois da ação, antes de ela se tornar definitiva",
          "Tudo o que pode ser desfeito",
          "Baixo",
          "Rascunhos, envios agendados, jobs enfileirados",
        ],
        [
          "Auditoria por amostragem",
          "Depois do fato, em uma amostra",
          "Estatística",
          "Baixo e previsível",
          "Comprovar a taxa de erro do caminho automatizado",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "**Encaminhe por reversibilidade e raio de impacto, não pela confiança do modelo.** Um erro reversível custa um desfazer; um irreversível custa a coisa em si. A confiança autodeclarada é texto gerado e não é calibrada, então aplicar um limiar sobre ela escalona os casos bem articulados, e não os arriscados.",
    },

    { kind: "heading", text: "Tornando a revisão real" },
    {
      kind: "prose",
      md: "A falha característica do design human-in-the-loop não é que as pessoas deixam coisas passar. É o **viés de automação**: chega uma recomendação fluente, completa e plausível, o trabalho nominal do revisor é conferi-la, e a taxa de aprovação se acomoda acima de 99%. O controle existe no diagrama de arquitetura e em nenhum outro lugar.",
    },
    {
      kind: "list",
      items: [
        "**Evidência, não uma conclusão.** Mostre as fontes recuperadas, as chamadas de tool e os valores que levaram à recomendação, para que conferir não signifique refazer o trabalho.",
        "**Uma fila que dê para zerar de verdade.** A vazão por revisor multiplicada pelo tamanho da equipe precisa superar o volume encaminhado com folga, ou o acúmulo acaba resolvido aprovando mais rápido.",
        "**Um caminho de rejeição barato e sem culpabilização.** Rejeitar deve ser um clique mais um código de motivo. Se a rejeição exige uma justificativa por escrito, a taxa de aprovação não diz nada.",
        "**Medição dos revisores.** Acompanhe a taxa de override, o tempo por tarefa e a concordância com casos-gabarito semeados na fila. Uma taxa de aprovação de 100% é um achado, não um sucesso.",
        "**Um ciclo de feedback.** Overrides e códigos de motivo são os melhores dados de avaliação que o sistema vai produzir; encaminhe-os para o golden set, não apenas para o log de auditoria.",
      ],
    },

    { kind: "heading", text: "O que a revisão humana não é" },
    {
      kind: "prose",
      md: "Uma segunda chamada de modelo criticando a primeira não é revisão humana. Pode ser uma boa verificação automatizada — barata, rápida, escalável —, mas compartilha pesos, contexto e qualquer instrução injetada com o modelo que revisa, então seus erros se correlacionam com os erros que ela existe para capturar.\n\nA distinção também importa juridicamente. Onde uma regulamentação exige intervenção humana significativa em uma decisão automatizada relevante, o revisor precisa ter tanto a autoridade quanto a informação para chegar a um resultado diferente. Uma pessoa que, na prática, não consegue mudar o resultado não atende ao requisito, por mais destaque que tenha no workflow.",
    },

    {
      kind: "example",
      title: "Exemplo prático: um assistente de regulação de sinistros",
      scenario:
        "Uma seguradora encaminha 100% das recomendações do assistente sobre sinistros para revisão humana — cerca de 40.000 por mês, divididas entre seis reguladores de sinistros. A liderança cita a revisão universal como o principal controle de segurança. A taxa de aprovação é de 99,2% e o tempo mediano por sinistro é de nove segundos.",
      walkthrough:
        "1. **Meça a revisão, não o modelo.** Nove segundos é uma olhadela. A cobertura universal produziu uma fila que só dá para zerar aprovando, então o controle é nominal.\n2. **Separe em faixas por consequência.** Sinistros abaixo de US$ 500 são aprovados automaticamente, com uma janela de reversibilidade mais uma auditoria por amostragem de 2%. Entre US$ 500 e US$ 10.000, encaminhe apenas quando uma regra for acionada — prestador novo, documentação faltando, conflito com o histórico de sinistros. Acima de US$ 10.000, revise sempre.\n3. **Observe os números se mexerem.** O volume encaminhado cai quatro quintos, o tempo mediano por tarefa sobe para cerca de noventa segundos, e a taxa de override sobe de 0,8% para 7%. O erro detectado aumentou enquanto a cobertura diminuía.\n4. **Dê evidências aos revisores.** Um painel de evidências mostra as cláusulas da apólice recuperadas, os sinistros anteriores comparados e os campos que acionaram o encaminhamento, com rejeição em um clique e códigos de motivo.\n5. **Meça os revisores.** 1% da fila é composto de casos sabidamente ruins, semeados de propósito; reguladores que os deixam passar com frequência precisam de novo treinamento, não de mais volume.\n6. **Comprove o caminho automático.** A auditoria por amostragem fornece uma estimativa de erro defensável para o que nunca foi revisado, e é isso que faz do limiar uma escolha baseada em evidência, e não uma afirmação.",
      takeaway:
        "Revisar tudo mal era pior do que revisar bem o subconjunto certo, e a amostra é o que transforma a divisão em faixas em uma afirmação que você consegue defender.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Fazer um humano revisar toda saída* soa como a resposta conservadora e geralmente está errada: é inviável em volume, degenera em carimbar sem olhar e joga fora o ganho de latência que justificou a automação. O gabarito divide em faixas por risco e depois comprova, por amostragem, que o caminho não revisado é seguro.",
    },

    {
      kind: "practice",
      questionIds: [
        "D5-q301",
        "D5-q302",
        "D5-q303",
        "D5-q304",
        "D5-q305",
        "D5-q306",
        "D5-q307",
        "D5-q308",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Human-in-the-loop",
      definition:
        "Uma pessoa aprova ou rejeita antes que a ação produza efeito. O único padrão que previne um erro irreversível em vez de apenas detectá-lo.",
    },
    {
      term: "Human-on-the-loop",
      definition:
        "O sistema age de forma autônoma enquanto uma pessoa monitora e pode intervir ou reverter. Limitado pela rapidez com que a intervenção ainda é útil.",
    },
    {
      term: "Viés de automação",
      definition:
        "A tendência de aceitar a recomendação de um sistema com menos escrutínio do que uma recomendação humana equivalente, especialmente sob pressão de tempo ou alto volume.",
    },
    {
      term: "Taxa de override",
      definition:
        "A parcela dos itens encaminhados que um revisor altera. Perto de zero, costuma indicar revisão desengajada, e não um modelo impecável.",
    },
    {
      term: "Auditoria por amostragem",
      definition:
        "Revisar uma amostra aleatória das decisões não revisadas para estimar a taxa de erro do caminho automatizado, que é o que torna defensável um limiar de encaminhamento.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Encaminhar toda decisão a um humano é o design mais conservador e, portanto, o mais seguro.",
      why: "Em volume de produção, a revisão universal cria filas que os revisores zeram aprovando mais rápido, então a atenção por item desaba, enquanto a etapa passa também a conferir uma falsa garantia a todos os que vêm depois.",
      instead:
        "Separe em faixas por reversibilidade e raio de impacto, depois amostre o caminho automatizado para comprovar a taxa de erro dele.",
    },
    {
      id: "t2",
      trap: "Uma etapa de revisão atende a um requisito de supervisão humana desde que uma pessoa identificada dê o aval antes que a ação produza efeito.",
      why: "Supervisão significa que o revisor poderia de fato chegar a um resultado diferente, então um aval não vale nada onde o revisor não tem autoridade para reverter a decisão, não tem as evidências por trás dela ou enfrenta uma fila que só se zera aprovando.",
      instead:
        "Dê ao revisor autoridade para reverter, as evidências em que a recomendação se apoia e um caminho de rejeição que não exija mais esforço do que a aprovação.",
    },
    {
      id: "t3",
      trap: "Um segundo modelo revisando o primeiro atende a um requisito de human-in-the-loop.",
      why: "Um modelo crítico compartilha pesos, contexto e quaisquer instruções injetadas com o modelo que revisa, então suas falhas se correlacionam com as que ele deveria capturar, e nenhum regulador o trata como intervenção humana.",
      instead:
        "Use críticos automatizados para ganhar escala e um humano nas decisões em que a responsabilização precisa recair sobre uma pessoa.",
    },
    {
      id: "t4",
      trap: "Uma taxa de aprovação alta demonstra que a etapa automatizada está funcionando bem.",
      why: "A taxa de aprovação confunde a qualidade do modelo com o engajamento do revisor: um revisor sobrecarregado ou mal informado produz o mesmo número quase perfeito que um sistema realmente preciso, então a métrica não consegue distinguir os dois.",
      instead:
        "Meça a taxa de override contra casos-gabarito semeados e audite de forma independente uma amostra dos itens aprovados.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 5",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Building Effective Agents — Anthropic Engineering",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],

  relatedLessons: ["5.1", "5.4"],
} satisfies Lesson;
