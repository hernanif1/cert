import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "7.2",
  slug: "7-2-ai-assisted-workflows",
  domain: 7,
  objective:
    "Melhorar os fluxos de trabalho de desenvolvimento usando ferramentas assistidas por IA",
  title: "Fluxos de Desenvolvimento Assistidos por IA",
  summary:
    "Uma ferramenta agêntica de programação é tão confiável quanto o ciclo de feedback contra o qual ela consegue rodar, então o investimento de maior alavancagem costuma ser a suíte de testes, não o prompt. A prova espera que você dimensione o trabalho pelo que é verificável e meça resultados, não produção.",

  body: [
    {
      kind: "prose",
      md: "A pergunta feita a um arquiteto não é *devemos adotar isso*, e sim *onde isso compensa, e o que precisa ser verdade para que compense com segurança*. As duas metades têm a mesma resposta: **verificação**. Uma tarefa em que o agente consegue conferir o próprio trabalho — rodando testes, um verificador de tipos, um linter, um build — é uma tarefa que ele faz bem e em que um humano pode confiar. Uma tarefa sem esse sinal produz código plausível que alguém precisa validar lendo, que é a forma mais lenta e menos confiável de revisão que existe.",
    },
    {
      kind: "table",
      caption: "A adequação decorre de quão verificável é o trabalho",
      headers: ["Trabalho", "Adequação", "O que faz dar certo ou falhar"],
      rows: [
        [
          "Escrever testes contra comportamento existente",
          "Forte",
          "A especificação é o código que já roda; as falhas são imediatas e inequívocas",
        ],
        [
          "Refatorações mecânicas amplas e migrações de framework",
          "Forte",
          "Repetitivo, tedioso para humanos, e a suíte existente é o critério de aceitação",
        ],
        [
          "Reproduzir e reduzir um bug reportado",
          "Forte",
          "O caso que falha é a definição de pronto, e o ciclo termina sozinho",
        ],
        [
          "Orientar-se em uma base de código desconhecida",
          "Forte",
          "A resposta pode ser conferida contra o código, e errar custa pouco",
        ],
        [
          "Primeira passada de code review",
          "Boa, como complemento",
          "Pega as classes mecânicas de problema a baixo custo; não sabe o que a mudança deveria fazer",
        ],
        [
          "Funcionalidades greenfield com requisitos ambíguos",
          "Fraca até ser decomposta",
          "Ainda não existe sinal de verificação, então nada contém uma direção errada tomada com confiança",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "O valor de uma ferramenta agêntica escala com a qualidade do sinal de feedback já presente no repositório. Uma equipe com testes rápidos e significativos ganha um agente que converge para código que funciona; uma equipe sem eles ganha um agente que produz código que compila, lê bem e pode estar errado de maneiras que ninguém percebe até a produção.",
    },

    { kind: "heading", text: "Escopo, revisão e o diff" },
    {
      kind: "prose",
      md: "Divida o trabalho em incrementos verificáveis separadamente. Uma tarefa grande e ambígua precisa de decomposição antes da delegação — não porque o modelo não dê conta dela, mas porque uma mudança que toca quarenta arquivos chega como uma única unidade a revisar, e a qualidade da revisão humana cai acentuadamente com o tamanho do diff. Código gerado concentra o risco exatamente na etapa em que humanos são piores, então o contramovimento são mudanças menores, cada uma passando na suíte.\n\nO desenvolvedor é o dono do diff. Revisar o resumo que o agente faz da própria mudança não substitui revisar a mudança: o resumo é texto gerado que descreve intenção, e pode ser preciso e confiante enquanto o código por baixo faz outra coisa. Tarefas independentes podem rodar em paralelo em branches ou worktrees separados, o que é um ganho real de vazão (throughput) — mas cada uma ainda entra como sua própria mudança revisada.",
    },

    { kind: "heading", text: "Medindo a adoção com honestidade" },
    {
      kind: "prose",
      md: "As métricas fáceis de coletar são as que enganam. Parcela do código escrita pelo assistente, sugestões aceitas, prompts enviados — tudo isso mede atividade, e uma equipe pode elevar cada um desses números enquanto entrega mais devagar e quebra com mais frequência.\n\nMeça os resultados que a adoção da ferramenta deveria melhorar: **cycle time** do primeiro commit ao merge, **taxa de falha de mudanças**, **tempo de restauração** depois de uma mudança ruim e **carga de revisão** em horas de revisor por mudança integrada. São as mesmas métricas de entrega que a organização já acompanha, e é exatamente por isso que têm credibilidade com quem financia a adoção. Se o cycle time cai enquanto a taxa de falha de mudanças se mantém estável, a adoção está funcionando; se os dois sobem, as métricas de atividade continuarão parecendo excelentes.",
    },

    {
      kind: "example",
      title: "Exemplo prático: uma adoção que parecia bem-sucedida",
      scenario:
        "Seis meses depois, uma divisão reporta que 45% das linhas integradas foram geradas pelo agente e que a aceitação de sugestões está acima de 70%. A liderança está satisfeita. Enquanto isso, a retrospectiva da própria equipe reclama que as revisões demoram uma eternidade, e o volume de incidentes vem subindo aos poucos. Ninguém conecta os três fatos.",
      walkthrough:
        "1. **Meça entrega, não atividade.** Levante cycle time, taxa de falha de mudanças e horas de revisor por mudança. O tempo mediano até o merge quase dobrou e a taxa de falha de mudanças subiu pela metade.\n2. **Olhe os diffs.** O tamanho mediano das mudanças praticamente triplicou. Os desenvolvedores estão delegando funcionalidades inteiras em vez de incrementos, e os revisores estão aprovando diffs gerados grandes que, realisticamente, não conseguem ler.\n3. **Confira o sinal de verificação.** Os serviços com incidentes em alta são os dois com a cobertura de testes mais fraca — o agente não tinha contra o que se conferir, e o revisor também não.\n4. **Mude a prática, não a ferramenta.** Limite o escopo de uma tarefa delegada a um incremento verificável. Exija que a suíte passe antes da revisão e, nos serviços com cobertura fraca, faça o agente escrever primeiro os testes de caracterização que faltam.\n5. **Aposente as métricas de vaidade.** Reporte cycle time, taxa de falha de mudanças e carga de revisão no lugar delas; o número de linhas geradas é eliminado, não melhorado.",
      takeaway:
        "A ferramenta nunca foi o problema. Escopo sem limite somado a um ciclo de verificação fraco transformou um ganho de vazão (throughput) em um gargalo de revisão e em uma regressão de confiabilidade, e as métricas reportadas eram incapazes de mostrar isso.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Qualquer alternativa que proponha medir o desenvolvimento assistido por IA por volume — linhas geradas, sugestões aceitas, percentual da base de código — é um distrator. Volume não é resultado. A alternativa do gabarito se liga ao desempenho de entrega ou às taxas de defeito.",
    },

    {
      kind: "practice",
      questionIds: [
        "D7-q201",
        "D7-q202",
        "D7-q203",
        "D7-q204",
        "D7-q205",
        "D7-q206",
        "D7-q207",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Ciclo de verificação",
      definition:
        "O feedback automatizado que um agente consegue rodar contra o próprio trabalho — testes, verificação de tipos, linters, builds. Sua qualidade define o teto de confiabilidade com que ferramentas agênticas conseguem operar em um repositório.",
    },
    {
      term: "Incremento verificável",
      definition:
        "Uma unidade de trabalho delegado pequena o bastante para que passar na suíte e ler o diff, juntos, estabeleçam a correção. A unidade prática de escopo no desenvolvimento agêntico.",
    },
    {
      term: "Métricas de resultado",
      definition:
        "Medidas de entrega, como cycle time, taxa de falha de mudanças e tempo de restauração, usadas no lugar de medidas de atividade, como sugestões aceitas ou linhas geradas.",
    },
    {
      term: "Teste de caracterização",
      definition:
        "Um teste escrito para fixar o que o código existente faz hoje, de modo que uma refatoração posterior tenha um critério de aceitação. Uma primeira tarefa de alto valor em uma base de código com cobertura fraca.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A melhor forma de medir a adoção é pela parcela do código que o assistente escreve.",
      why: "O volume gerado não diz nada sobre se uma mudança era correta, necessária ou barata de revisar, e uma equipe pode elevar esse número enquanto o cycle time se alonga e os defeitos aumentam.",
      instead:
        "Reporte cycle time, taxa de falha de mudanças, tempo de restauração e carga de revisão — as métricas de entrega em que a organização já confia.",
    },
    {
      id: "t2",
      trap: "Um repositório com cobertura de testes fraca é o que mais se beneficia, porque o agente pode escrever os testes que faltam.",
      why: "A confiabilidade do agente depende do sinal de feedback que ele consegue rodar; sem uma suíte, nem ele nem o revisor conseguem distinguir uma mudança que funciona de uma apenas plausível, e os erros entram despercebidos.",
      instead:
        "Construa primeiro o ciclo de verificação — muitas vezes fazendo o agente escrever testes de caracterização — e só então delegue o trabalho de mudança contra ele.",
    },
    {
      id: "t3",
      trap: "Tarefas delegadas maiores são mais eficientes, porque uma única revisão cobre mais trabalho.",
      why: "A qualidade da revisão cai acentuadamente conforme o diff cresce; uma mudança gerada grande concentra o risco na etapa que humanos executam pior, e a economia aparente é devolvida na forma de defeitos que escapam.",
      instead:
        "Delegue um incremento verificável por vez e rode incrementos independentes em paralelo, em vez de fundi-los em uma única mudança.",
    },
    {
      id: "t4",
      trap: "Ler a explicação que o agente dá da própria mudança é um substituto aceitável para ler o diff.",
      why: "A explicação é texto gerado que descreve intenção e pode ser inteiramente fiel ao que se pretendia enquanto o código faz algo diferente — e só o código é o que de fato vai para produção.",
      instead:
        "Revise o diff. Trate a explicação como um guia de onde olhar, nunca como evidência do que a mudança faz.",
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
  relatedLessons: ["7.1", "7.3"],
} satisfies Lesson;
