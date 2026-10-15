import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "4.2",
  slug: "4-2-eval-datasets-frameworks",
  domain: 4,
  objective:
    "Projetar datasets de avaliação e frameworks de teste usando metodologias mistas",
  title: "Datasets de Avaliação e Frameworks de Teste",
  summary:
    "Um framework de teste para um sistema com LLM são três avaliadores — asserções em código, um LLM juiz e humanos — apontados para um único golden set versionado. A questão de arquitetura é a qual avaliador cada verificação pertence, e como o golden set é construído para continuar pegando regressões em vez de virar, discretamente, um conjunto de treino.",

  body: [
    {
      kind: "prose",
      md: "A avaliação é a única coisa que separa uma demo de um sistema em que alguém pode confiar, e ela se apoia em dois artefatos: um golden set que representa o trabalho e um framework que avalia as saídas contra ele. Nenhum dos dois é opcional, e a prova trata *metodologias mistas* como a expressão que sustenta tudo — nenhum método de avaliação, sozinho, cobre um sistema real.",
    },

    { kind: "heading", text: "Construindo o golden set" },
    {
      kind: "prose",
      md: "Um **golden set** pareia entradas com uma saída de referência ou com os critérios pelos quais uma saída é considerada aceitável. Quatro fontes o alimentam, e uma suíte construída a partir de apenas uma é frágil:",
    },
    {
      kind: "list",
      items: [
        "**Traces de produção** — entradas reais, a única fonte que reflete como as pessoas de fato formulam as coisas. Anonimize antes de usar.",
        "**Casos curados, escritos à mão** — escritos para exercitar uma capacidade de propósito, incluindo combinações que os usuários ainda não tentaram.",
        "**Variação sintética** — gerada para preencher lacunas de cobertura e categorias raras a baixo custo. Útil para amplitude, fraca como verdade de referência por si só.",
        "**Casos adversariais e de regressão** — todo bug já encontrado vira um caso permanente, e é assim que a suíte impede que a mesma falha vá para produção duas vezes.",
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Estratifique o golden set de propósito. Um conjunto amostrado de forma puramente aleatória espelha a produção, o que significa que os casos raros e de alta consequência, os que realmente importam, aparecem uma ou duas vezes, e a nota agregada é dominada pelo tráfego fácil. Sobreamostre os estratos difíceis e reporte notas por estrato além do número geral. Cinquenta casos bem escolhidos, rodados a cada mudança, valem mais que dois mil rodados uma vez por trimestre.",
    },
    {
      kind: "prose",
      md: "Reserve uma fatia. Quando uma equipe itera prompts contra o golden set inteiro, esse conjunto virou um conjunto de treino: as notas sobem porque o prompt foi ajustado àqueles itens específicos, não porque o sistema melhorou. Mantenha uma partição cega, usada apenas para confirmar uma release, e versione o golden set para que uma nota seja sempre atribuível a um snapshot conhecido.",
    },

    { kind: "heading", text: "Três avaliadores, um framework" },
    {
      kind: "table",
      caption: "Empurre cada verificação para o avaliador mais barato que consiga de fato decidi-la",
      headers: ["Avaliador", "Melhor para", "Custo e velocidade", "Principal fraqueza"],
      rows: [
        [
          "Asserção em código",
          "Validade do schema, campos obrigatórios, tolerância numérica, tool chamada, string proibida ausente",
          "Quase de graça, milissegundos, totalmente determinística",
          "Não consegue julgar nada subjetivo",
        ],
        [
          "LLM-as-judge",
          "Tom, coerência, groundedness, notas de rubrica em texto aberto",
          "Barato o suficiente para milhares de casos por execução",
          "Vieses sistemáticos; precisa de calibração",
        ],
        [
          "Revisão humana",
          "Verdade de referência, casos disputados, calibração do juiz, descoberta de falhas inéditas",
          "Lenta e cara; de horas a dias",
          "Não escala para toda mudança",
        ],
      ],
    },
    {
      kind: "prose",
      md: "**Um LLM juiz é um instrumento de medição, e instrumentos têm erro conhecido.** Juízes favorecem a primeira opção apresentada em uma comparação par a par, premiam extensão e tom confiante em vez de correção, pontuam com mais generosidade as saídas da própria família de modelos e concentram suas notas em uma faixa estreita. Nada disso os torna inutilizáveis; significa que eles são projetados com engenharia, não aceitos na confiança.\n\nAs mitigações padrão são cumulativas: dê ao juiz uma rubrica com âncoras explícitas para cada nota em vez de uma escala vaga, forneça uma resposta de referência para que a tarefa vire comparação e não opinião, randomize a ordem nos testes par a par e use um modelo de uma família diferente daquela em teste. Depois, meça o próprio juiz — concordância contra algumas centenas de casos rotulados por humanos — e reverifique essa concordância sempre que o prompt ou o modelo do juiz mudar. Um juiz não calibrado é um número com unidade desconhecida.",
    },
    {
      kind: "example",
      title: "Exemplo prático: uma suíte de avaliação para um assistente de revisão de contratos",
      scenario:
        "O assistente extrai os termos principais de um contrato, sinaliza cláusulas que se desviam de um playbook e redige um resumo para o jurídico. A equipe tem um notebook que roda doze contratos escolhidos a dedo e imprime as saídas para alguém ler.",
      walkthrough:
        "1. **Divida as verificações por avaliador.** Datas, partes e valores extraídos viram asserções em código contra um gabarito rotulado. As sinalizações de desvio viram classificação contra um conjunto rotulado, pontuada com recall por classe. Só o resumo redigido precisa de um juiz.\n2. **Construa o golden set em estratos.** Duzentos contratos, sobreamostrados nos tipos de cláusula que o jurídico considera arriscados, mais todo contrato que já produziu um erro.\n3. **Calibre o juiz.** Dois advogados pontuam 150 resumos contra a mesma rubrica; o prompt do juiz é revisado até que a concordância com eles seja aceitável, e essa concordância também é acompanhada.\n4. **Ligue tudo ao pipeline.** As asserções em código rodam a cada commit como etapa bloqueante. A suíte completa, incluindo o juiz, roda toda noite e antes de cada release. Humanos revisam uma amostra semanal mais todo caso em que o juiz e uma asserção em código discordam.",
      takeaway:
        "As metodologias são dispostas em camadas por custo e frequência, não escolhidas uma única vez. Verificações determinísticas rodam o tempo todo, juízes rodam com frequência, humanos rodam raramente e calibram todo o resto.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Fazer o mesmo modelo avaliar as próprias saídas* e *coletar mais dados de produção até o golden set ficar grande o bastante* aparecem como respostas tentadoras. A primeira introduz viés de autopreferência no único sinal que você tem; a segunda atrasa toda decisão e ainda deixa passar os estratos raros que a amostragem aleatória sub-representa.",
    },

    {
      kind: "practice",
      questionIds: [
        "D4-q201",
        "D4-q202",
        "D4-q203",
        "D4-q204",
        "D4-q205",
        "D4-q206",
        "D4-q207",
        "D4-q208",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Golden set",
      definition:
        "Um conjunto versionado de entradas pareadas com saídas de referência ou critérios de aceitação, usado como a régua fixa contra a qual toda mudança do sistema é pontuada. O nome adotado aqui para esse artefato — não \"golden dataset\" nem \"eval set\".",
    },
    {
      term: "LLM-as-judge",
      definition:
        "Usar um modelo para avaliar a saída de outro modelo contra uma rubrica. Dá escala à avaliação subjetiva, mas carrega vieses de posição, de verbosidade e de autopreferência, que precisam ser mitigados e medidos.",
    },
    {
      term: "Calibração do juiz",
      definition:
        "Medir a concordância entre um LLM juiz e rótulos humanos nos mesmos casos e, então, ajustar o prompt do juiz até a concordância ser aceitável. Refeita sempre que o modelo ou o prompt do juiz muda.",
    },
    {
      term: "Suíte de regressão",
      definition:
        "O subconjunto de casos que nunca mais pode falhar, ampliado com cada bug confirmado, que entra como caso permanente. Roda a cada mudança, não em um agendamento.",
    },
    {
      term: "Partição reservada (held-out)",
      definition:
        "Casos mantidos fora da iteração de prompts para que a nota de uma release reflita generalização, e não ajuste ao golden set.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Use um LLM juiz para toda a avaliação, já que ele dá conta de qualquer tipo de verificação.",
      why: "Tudo o que uma asserção determinística consegue decidir — JSON válido, um campo obrigatório, um número dentro da tolerância — é decidido em código de forma mais barata, mais rápida e sem variância, e entregar isso a um juiz acrescenta custo e ruído.",
      instead:
        "Encaminhe cada verificação ao avaliador mais barato que consiga de fato decidi-la e reserve o juiz para a qualidade genuinamente subjetiva.",
    },
    {
      id: "t2",
      trap: "O modelo em teste é o melhor juiz da própria saída, já que ele entende a tarefa.",
      why: "Juízes pontuam as saídas da própria família de modelos com mais generosidade do que um humano pontuaria, de modo que a autoavaliação infla o único sinal feito para detectar problemas e esconde exatamente as falhas que a avaliação existe para pegar.",
      instead:
        "Julgue com uma família de modelos diferente, ancore em uma resposta de referência e calibre contra rótulos humanos.",
    },
    {
      id: "t3",
      trap: "Um golden set maior sempre produz um resultado mais confiável.",
      why: "Um conjunto grande amostrado aleatoriamente continua dominado por tráfego fácil e comum, e seu custo e tempo de execução levam as equipes a rodá-lo raramente, o que elimina o feedback rápido que de fato pega regressões.",
      instead:
        "Estratifique em direção aos casos difíceis e de alta consequência, mantenha a suíte rápida o bastante para rodar a cada mudança e reporte notas por estrato.",
    },
    {
      id: "t4",
      trap: "Notas de avaliação subindo release após release provam que o sistema está melhorando de verdade.",
      why: "Se os prompts foram iterados contra o golden set inteiro, a nota mede ajuste àqueles itens específicos, e não capacidade, e o ganho frequentemente não aparece em produção.",
      instead:
        "Reserve uma partição held-out usada exclusivamente para confirmar uma release e versione o golden set junto com o código.",
    },
    {
      id: "t5",
      trap: "Casos de teste sintéticos podem substituir os traces de produção quando a qualidade da geração for boa o suficiente.",
      why: "Entradas geradas herdam as premissas de quem escreveu o prompt de geração, de modo que deixam de fora, sistematicamente, as formulações malformadas, ambíguas e fora da distribuição que usuários reais produzem o tempo todo.",
      instead:
        "Use dados sintéticos para preencher lacunas de cobertura conhecidas e ancore a suíte em traces reais anonimizados.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 4",
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

  relatedLessons: ["4.1", "4.3"],
} satisfies Lesson;
