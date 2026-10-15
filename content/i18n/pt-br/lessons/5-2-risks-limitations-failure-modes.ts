import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "5.2",
  slug: "5-2-risks-limitations-failure-modes",
  domain: 5,
  objective: "Identificar riscos, limitações e modos de falha de sistemas de LLM",
  title: "Riscos, Limitações e Modos de Falha",
  summary:
    "Sistemas de LLM falham de forma plausível, não ruidosa, e etapas encadeadas transformam pequenas taxas de erro por etapa em grandes taxas de erro de ponta a ponta. Este objetivo trata de nomear um modo de falha com precisão suficiente para que o controle certo decorra dele.",

  body: [
    {
      kind: "prose",
      md: "Software convencional falha com barulho: um stack trace, um 500, um timeout. A falha característica de um LLM é uma resposta fluente, bem formatada e confiante que está errada, devolvida com um 200 e uma latência saudável. Toda conversa sobre risco neste domínio começa aí, porque isso significa que o monitoramento herdado de serviços comuns vai reportar saúde perfeita durante um incidente de qualidade.\n\nA prova recompensa a precisão sobre *qual* falha está acontecendo. \"O modelo alucinou\" é verdade para a maioria das saídas ruins e não é acionável para nenhuma delas.",
    },

    { kind: "heading", text: "Uma taxonomia que vale a pena memorizar" },
    {
      kind: "table",
      caption: "Classes de falha e onde fica o controle de cada uma",
      headers: ["Classe", "Exemplo", "Sinal", "O controle fica em"],
      rows: [
        [
          "Intrínseca ao modelo",
          "Citação fabricada, deslize aritmético, inversão da resposta sob contestação",
          "Fluente e confiante; varia entre execuções com a mesma entrada",
          "Fundamentação (grounding) e verificação externa",
        ],
        [
          "Contexto",
          "A resposta certa existe, mas o chunk recuperado é o errado; detalhe essencial enterrado em uma janela longa",
          "O modelo é fiel a um contexto ruim",
          "Recuperação e construção do contexto",
        ],
        [
          "Orquestração",
          "Um erro de tool engolido e narrado como sucesso; um loop que nunca termina",
          "A falha aparece várias etapas depois da causa",
          "Validação de etapas, orçamentos, timeouts",
        ],
        [
          "Adversarial",
          "Instruções injetadas por meio de um documento recuperado; extração do system prompt",
          "A entrada parece legítima; o efeito aparece nas ações",
          "Isolamento, escopo, controle de egresso",
        ],
        [
          "Deriva operacional",
          "A qualidade degrada depois de uma atualização do corpus ou de uma troca de versão do modelo",
          "Nenhuma mudança de código; correlaciona com uma data",
          "Fixação de versão e avaliações (evals) de regressão",
        ],
      ],
    },
    {
      kind: "prose",
      md: "Duas propriedades atravessam as cinco classes. A saída é **não determinística**, então um incidente pode não se reproduzir, e testes de correspondência exata são instáveis por construção. E a confiança expressa pelo modelo **não é uma probabilidade**: hesitação e assertividade são características estilísticas do texto gerado, então o tom não diz nada sobre se uma afirmação está fundamentada.",
    },

    { kind: "heading", text: "O erro se acumula com as etapas" },
    {
      kind: "prose",
      md: "A aritmética mais cobrável deste objetivo: um agente que precisa acertar *n* etapas de ponta a ponta tem sucesso em aproximadamente a confiabilidade por etapa elevada à potência *n*. Métricas de etapa com aparência saudável escondem workflows inutilizáveis.",
    },
    {
      kind: "table",
      caption: "Sucesso de ponta a ponta por comprimento da cadeia",
      headers: ["Etapas", "99% por etapa", "95% por etapa", "90% por etapa"],
      rows: [
        ["1", "99%", "95%", "90%"],
        ["5", "95%", "77%", "59%"],
        ["10", "90%", "60%", "35%"],
        ["20", "82%", "36%", "12%"],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "É por isso que **encurtar a cadeia é um controle de segurança**. Colapsar três etapas probabilísticas em um único caminho de código determinístico elimina por completo as taxas de falha delas, e costuma ser mais barato do que elevar a acurácia por etapa. É também por isso que a acurácia por etapa é um número enganoso para reportar a um stakeholder: informe a conclusão de ponta a ponta.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Quando um workflow encadeado tem desempenho abaixo do esperado, *usar um modelo mais capaz* e *adicionar novas tentativas* estão ambos no cardápio. Nenhum dos dois mexe na aritmética: novas tentativas ajudam em erros transitórios de tool e não fazem nada por uma etapa que devolve silenciosamente uma resposta errada, e um modelo com 98% por etapa ainda perde um terço das execuções de vinte etapas.",
    },

    { kind: "heading", text: "Limitações que são propriedades, não bugs" },
    {
      kind: "list",
      items: [
        "**Data de corte do conhecimento.** O modelo não tem informação sobre eventos posteriores ao treinamento e não consegue informar com confiabilidade onde fica a própria data de corte. Fatos sensíveis ao tempo devem ser recuperados, nunca lembrados.",
        "**Sem introspecção.** O relato de um modelo sobre por que respondeu como respondeu é texto gerado, não um trace da computação. Útil para depurar um prompt; sem valor como registro de auditoria.",
        "**Bajulação (sycophancy).** Contestar uma resposta correta muitas vezes a inverte, então um ciclo de avaliação em que um humano contesta repetidamente mede complacência, e não acurácia.",
        "**Contexto não é memória.** O sistema sabe apenas o que foi colocado na janela neste turno; tudo o que precisa persistir pertence a um armazenamento fora dela.",
        "**Falha silenciosa de tool.** Uma tool que devolve um resultado vazio com um 200 é idêntica a uma tool que não tem nada a reportar, e o modelo vai narrar com confiança por cima da lacuna.",
      ],
    },

    {
      kind: "example",
      title: "Exemplo prático: um agente de sinistros de doze etapas que passa em todos os testes unitários",
      scenario:
        "Um agente valida um sinistro ao longo de doze etapas apoiadas em tools. Cada tool, medida isoladamente, acerta 96% das vezes, e todos os testes unitários passam. Em um piloto de duas semanas, apenas 63% dos sinistros são concluídos sem que um operador precise refazer o trabalho.",
      walkthrough:
        "1. **Faça a conta.** 0,96 elevado à décima segunda potência dá cerca de 61%, então o resultado do piloto é a consequência esperada do design, não um defeito de alguma etapa específica.\n2. **Encontre a etapa silenciosa.** Os traces mostram a etapa três devolvendo zero linhas para nomes de prestador ambíguos, com um 200 e nenhum erro. Nada verificava nada, então a execução seguiu em frente.\n3. **Verifique pós-condições.** Agora cada etapa declara como é um resultado válido e faz a execução falhar em vez de repassar uma lacuna adiante.\n4. **Encurte a cadeia.** Seis das doze etapas eram consultas e junções determinísticas; fundidas em um único caminho de código, deixam de contribuir com qualquer probabilidade de falha.\n5. **Coloque um checkpoint na etapa irreversível.** A autorização de pagamento agora exige uma aprovação humana explícita, em vez de herdar a confiança das onze etapas anteriores.\n6. **Reporte o número certo.** A métrica do stakeholder passa a ser a conclusão de ponta a ponta com um detalhamento das falhas, não a acurácia por etapa.",
      takeaway:
        "Nada disso era um problema de qualidade do modelo. Era a consequência comum de encadear um componente probabilístico e nunca medir a cadeia.",
    },

    {
      kind: "callout",
      variant: "pitfall",
      md: "Desconfie da revisão de incidente que conclui que *o modelo alucinou*. Pergunte de qual classe era: o contexto estava errado, o resultado de uma tool veio silenciosamente vazio, uma instrução injetada mudou o plano ou o corpus mudou na terça-feira passada? Cada uma aponta para uma correção diferente, e só uma delas diz respeito ao modelo.",
    },

    {
      kind: "practice",
      questionIds: [
        "D5-q201",
        "D5-q202",
        "D5-q203",
        "D5-q204",
        "D5-q205",
        "D5-q206",
        "D5-q207",
        "D5-q208",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Falha silenciosa",
      definition:
        "Um resultado errado entregue sem nenhum sinal de erro. O modo de falha padrão de um LLM, e o motivo pelo qual dashboards de taxa de erro sozinhos não conseguem detectar um incidente de qualidade.",
    },
    {
      term: "Erro composto",
      definition:
        "A multiplicação das taxas de sucesso por etapa ao longo de uma cadeia, de modo que 95% por etapa em dez etapas resulta em cerca de 60% de ponta a ponta.",
    },
    {
      term: "Bajulação (sycophancy)",
      definition:
        "A tendência de revisar uma resposta na direção do que o usuário parece querer quando ela é contestada, independentemente de a resposta original estar correta.",
    },
    {
      term: "Deriva (drift)",
      definition:
        "Degradação ao longo do tempo sem nenhuma mudança de código, causada por entradas que mudam, por um corpus atualizado ou por uma versão de modelo upstream.",
    },
    {
      term: "Calibração",
      definition:
        "A correspondência entre a confiança declarada e a correção real. A confiança expressa em texto gerado não é calibrada, então não pode ser usada sozinha como sinal de roteamento.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A alucinação pode ser eliminada com um prompt suficientemente detalhado ou com um modelo mais capaz.",
      why: "A geração amostra de uma distribuição sobre tokens sem nenhuma checagem interna contra a verdade de referência, então prompts e modelos melhores reduzem a taxa, mas nunca chegam a zero, e um sistema precisa de verificação, não de um prompt que finalmente funcione.",
      instead:
        "Fundamente as afirmações em fontes recuperadas e verifique fora do modelo as que têm consequência.",
    },
    {
      id: "t2",
      trap: "Uma taxa de sucesso de 95% por etapa é confortavelmente suficiente para um workflow de dez etapas.",
      why: "Falhas de etapa se multiplicam em vez de tirar média: 0,95 elevado à décima potência dá aproximadamente 60%, então duas em cada cinco execuções falham em algum ponto, mesmo que cada etapa pareça saudável no próprio dashboard.",
      instead:
        "Meça a conclusão de ponta a ponta e, então, encurte a cadeia ou coloque checkpoints nela.",
    },
    {
      id: "t3",
      trap: "Fixar um parâmetro de amostragem torna um sistema de LLM reproduzível, então asserções de correspondência exata são seguras.",
      why: "A família atual de modelos rejeita esses controles categoricamente e, mesmo onde existem, eles nunca garantem tokens idênticos; resultados de recuperação, respostas de tools e montagem de contexto também variam independentemente da decodificação, então a suíte continua instável e, de quebra, mede a propriedade errada.",
      instead:
        "Fixe o snapshot do modelo e o build do índice para replay, e faça asserções sobre validade de schema, propriedades obrigatórias e pontuações de rubrica.",
    },
    {
      id: "t4",
      trap: "Quando o modelo declara alta confiança, é mais provável que a resposta esteja correta.",
      why: "A confiança expressa é uma característica estilística do texto gerado, não uma estimativa calibrada, e a formulação confiante acompanha citações fabricadas com a mesma facilidade com que acompanha as corretas.",
      instead:
        "Derive a confiança de sinais externos: pontuações de recuperação, concordância entre execuções independentes, validação contra um sistema de registro.",
    },
    {
      id: "t5",
      trap: "Se nada deu erro nos logs, a execução teve sucesso.",
      why: "A falha que define um LLM devolve um 200 com conteúdo fluente, bem formado e errado, então dashboards de taxa de erro herdados de serviços convencionais mostram saúde perfeita durante todo um incidente de qualidade.",
      instead:
        "Monitore sinais de qualidade — checagens de fundamentação, validade de schema, correções do usuário, abandono — junto com as taxas de erro.",
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
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["4.4", "5.1"],
} satisfies Lesson;
