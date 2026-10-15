import type { Dict } from "@/lib/i18n/dict/en";

/** Painel de progresso, modo de treino e simulado. */
export const toolsPtBR: Dict["tools"] = {
  loading: "Carregando…",
  eyebrowTools: "Ferramentas de estudo",
  eyebrowPractice: "Prática",

  progress: {
    metaDescription:
      "Prontidão para a prova, cobertura por domínio e domínio dos exercícios — armazenados apenas neste navegador.",
    title: "Painel de progresso",
    readiness: "Prontidão para a prova",
    readinessAria: (score) => `Prontidão para a prova: ${score} de 100`,
    labels: {
      "Just Beginning": "Só começando",
      "Building Foundations": "Construindo a base",
      "Getting There": "Chegando lá",
      "Nearly There": "Quase lá",
      "Exam Ready": "Pronto para a prova",
    },
    lessons: "Lições",
    drill: "Treino",
    mock: "Simulado",
    component: (label) => `Componente ${label}`,
    gate: (g) => {
      switch (g.kind) {
        case "no-mock":
          return `Sua pontuação composta é ${g.score}, mas você ainda não fez nenhum simulado. É esse o número que decide.`;
        case "failed-mock":
          return `Sua pontuação composta é ${g.score}, mas seu último simulado marcou ${g.scaled} — abaixo do corte de ${g.cut}. É esse o número que decide.`;
        case "weak-domain":
          return `Você passou no último simulado, mas ${g.weak.map((w) => `D${w.id} com ${w.pct}%`).join(", ")} está abaixo de ${g.min}%. Reforce isso antes de fazer a prova real.`;
        case "lessons":
          return `Sua pontuação composta é ${g.score}, mas só ${g.done} das 38 lições estão concluídas (são necessárias ${g.needed}).`;
      }
    },
    unlock: (points) => `Faça um simulado para desbloquear ${points} pontos.`,
    startOne: "Começar um",
    pctComplete: (pct) => `${pct}% concluído`,
    mockAttempts: "Simulados feitos",
    best: (n) => `melhor: ${n}`,
    passAt: (n) => `aprovação com ${n}`,
    drillSeen: "Questões vistas",
    dayStreak: "Dias seguidos",
    longest: (n) => `recorde: ${n}`,
    openDrill: "Abrir o modo de treino",
    seen: "Vistas",
    mastered: "Dominadas",
    dueToday: "Para hoje",
    leeches: "Persistentes",
    bankPending: "O banco de questões ainda está sendo escrito.",
    byDomain: "Por domínio",
    domainAria: (title, pct) => `${title}: ${pct}% das lições concluídas`,
    domainLine: (done, total, weight) =>
      `${done}/${total} lições · ${weight} da prova`,
    drillMastered: (done, total) => `${done}/${total} questões dominadas`,
    footnote: (lessons, drill, mock, total) =>
      `A prontidão dá peso ${lessons} às lições, ${drill} ao treino e ${mock} ao desempenho nos simulados. Uma lição só conta depois de marcada como concluída e de você responder a pelo menos uma questão do objetivo dela — clicar em ${total} lições não deveria, por si só, dizer que você está pronto.`,
  },

  checklist: {
    metaDescription:
      "Uma autoavaliação antes da prova: 24 afirmações para marcar com honestidade, guardadas apenas neste navegador.",
    title: "Checklist de prontidão",
    intro:
      "Marque uma caixa só quando você conseguiria explicar aquilo em voz alta, sem consultar nada. Essas marcações são suas — elas não mexem na pontuação de prontidão, então não há nada para burlar.",
    checked: (done, total) => `${done} de ${total} marcados`,
    progressAria: "Progresso do checklist",
    groupAria: (title, done, total) =>
      `${title}: ${done} de ${total} marcados`,
    prepGroup: "Preparação para a prova",
    openLesson: (text) => `Abrir a lição que cobre: ${text}`,
    allChecked:
      "Todas as caixas marcadas. Faça um simulado cronometrado — é aquela pontuação que decide.",
  },

  data: {
    title: "Seus dados",
    intro:
      "O progresso fica armazenado apenas neste navegador, neste dispositivo. Exporte-o para levar a outra máquina ou guardar um backup.",
    export: "Exportar progresso",
    import: "Importar progresso",
    reset: "Zerar progresso",
    readError: "Não foi possível ler esse arquivo.",
    importQuestion: "Importar este arquivo?",
    lessonsComplete: "Lições concluídas",
    checklistTicks: "Itens do checklist",
    drillCards: "Cartões de treino",
    mockAttempts: "Simulados feitos",
    file: (n) => `arquivo: ${n}`,
    now: (n) => `agora: ${n}`,
    merge: "Mesclar",
    replace: "Substituir tudo",
    cancel: "Cancelar",
    deleteQuestion: "Apagar todo o progresso deste dispositivo?",
    deleteBody:
      "Lições concluídas, itens do checklist, histórico de treino e simulados. Isso não pode ser desfeito — faça um backup antes.",
    backupFirst: "Exportar um backup antes",
    deleteAll: "Apagar todo o progresso",
  },

  flagged: {
    metaDescription:
      "Todas as questões que você marcou no treino, em uma lista, com um prompt copiável que pede a um assistente para explicar cada uma.",
    title: "Questões marcadas",
    intro:
      "Todas as questões que você marcou, guardadas neste navegador. Cada linha tem um prompt para copiar no Claude: ele pede uma explicação completa da resposta correta e de cada distrator, com links de volta para a lição aqui e para a documentação do Claude de onde a questão vem.",
    count: (n) => (n === 1 ? "1 questão marcada" : `${n} questões marcadas`),
    empty: "Nada marcado ainda. Pressione F em qualquer cartão do treino, ou a bandeira no cartão, e a questão aparece aqui.",
    copyPrompt: "Copiar prompt",
    copyPromptFor: (id) => `Copiar um prompt de estudo para a questão de ${id}`,
    copied: "Copiado",
    copyFailed: "Falha ao copiar — selecione e copie manualmente",
    unflag: "Remover marcação",
    promptIntro:
      "Estou me preparando para a prova CCAR-P (Claude Certified Architect – Professional). Abaixo está uma questão de prática que marquei enquanto estudava, com as alternativas e a resposta correta. A questão está em inglês, como na prova; responda em português.",
    promptQuestion: (objective) => `Questão (objetivo da prova ${objective})`,
    promptRated: (rating) => `Minha avaliação: ${rating}`,
    promptCorrect: "Resposta correta",
    promptSource: (id, title, url) =>
      `De onde ela vem: lição ${id} "${title}" do meu guia de estudos — ${url}`,
    promptSourceUnknown: (objective) =>
      `De onde ela vem: objetivo da prova ${objective} do meu guia de estudos.`,
    promptAsk:
      "Por favor: (1) explique em detalhe por que a resposta correta está certa; (2) explique por que cada uma das outras alternativas está errada; (3) nomeie o conceito por trás que eu devo lembrar e, onde eu avaliei a questão, use a avaliação para calibrar a profundidade; (4) termine com uma seção de Referências que inclua o link interno da lição acima e o(s) link(s) da(s) página(s) oficial(is) da documentação do Claude (docs.claude.com ou code.claude.com) que cobrem este tema, indicando a seção que devo ler.",
  },

  drill: {
    metaDescription:
      "Prática com repetição espaçada em todo o banco de questões, agendada por um sistema Leitner que identifica questões persistentes.",
    title: "Modo de treino",
    loading: "Carregando o treino…",
    bankPending:
      "O banco de questões ainda está sendo escrito. O treino abre assim que houver questões para agendar.",
    intro:
      "Repetição espaçada sobre o banco de questões. Cada cartão sobe uma caixa quando você acerta e desce duas quando erra; a caixa 4 conta como dominada.",
    mode: "Modo",
    modes: {
      due: ["Para hoje", "Cartões agendados para hoje"],
      mixed: ["Misto", "Cartões do dia mais os novos"],
      new: ["Novas", "Nunca respondidas"],
      weak: ["Pontos fracos", "Baixa acurácia ou com recaídas"],
      leeches: ["Persistentes", "Quatro ou mais erros"],
      bookmarked: ["Marcadas", "Marcadas para revisão"],
      cram: ["Intensivo", "Ignora o agendamento; não registra nada"],
    },
    domains: "Domínios",
    all: "Todos",
    start: "Iniciar sessão",
    keys: "Teclas: 1–6 selecionam · Enter verifica · depois E fácil / Enter médio / H difícil · F marca · R revisa as marcadas · S suspende · Esc encerra a sessão",
    complete: "Sessão concluída",
    score: (right, total) => `${right} de ${total} corretas`,
    cramNote: "Sessão intensiva — seu calendário de revisões não foi alterado.",
    dueTomorrow: (n) => `Para amanhã: ${n}`,
    another: "Outra sessão",
    changeFilters: "Mudar filtros",
    progress: "Progresso",
    box: (n) => `Caixa ${n}`,
    leech: "persistente",
    cramBadge: "intensivo — nada é registrado",
    shortcuts: "Atalhos",
    end: "Encerrar sessão",
    becameLeech: "marcada como persistente",
    becameSuspended: "suspensa",
    leechAdvice:
      "Você errou esta questão quatro vezes. Isso costuma ser uma lacuna no conteúdo, não na memória —",
    reread: (id) => `releia a lição ${id}`,
    next: "Próxima",
    lesson: (id) => `Lição ${id}`,
    suspend: "Suspender",
    shortcutsTitle: "Atalhos de teclado",
    shortcutList: [
      ["1 – 6", "Seleciona uma alternativa (alterna, em múltipla escolha)"],
      ["Enter / Espaço", "Verifica a resposta; depois da revelação, avalia como Médio e avança"],
      ["E", "Depois da revelação: avalia como Fácil — você não a verá de novo"],
      ["H", "Depois da revelação: avalia como Difícil — volta na próxima rodada"],
      ["Backspace", "Limpa a seleção atual"],
      ["F", "Marca esta questão — fica no cartão, então o modo Marcadas pode treiná-la depois"],
      ["R", "Revisa agora as questões marcadas nesta sessão"],
      ["S", "Suspende este cartão e o pula"],
      ["Esc", "Encerra a sessão"],
      ["?", "Mostra esta lista"],
    ],
    close: "Fechar",
    reviewFlagged: (n) => `Revisar marcadas (${n})`,
    reviewing: "revisando marcadas",
    reviewComplete: "Revisão concluída",
    reviewScore: (right, total) => `${right} de ${total} questões marcadas corretas na revisão`,
    reviewNote: "Passagens de revisão nunca alteram seu calendário.",
    resumeSession: "Voltar à sessão",
    backToSummary: "Voltar ao resumo",
    flaggedTitle: (n) => `Marcadas para revisão (${n})`,
    retiredNotice: (id) => `Questão de ${id} aposentada — você não a verá de novo.`,
    undo: "Desfazer",
    stats: { due: "Para hoje", fresh: "Novas", leeches: "Persistentes", pool: "No banco", retired: "Aposentadas" },
    paceHint: (mmss) => `Ritmo da prova: ${mmss} por questão. Congela quando você verifica a resposta.`,
    ease: { easy: "Fácil", medium: "Médio", hard: "Difícil" },
    easeHint: {
      easy: "Aposenta a questão: você não a verá de novo.",
      medium: "Volta amanhã.",
      hard: "Volta na próxima rodada.",
    },
    ratePrompt: "Como foi?",
    retiredPreview: "aposentada de vez",
    wrongPreview: "Uma resposta errada volta na próxima rodada, seja qual for a avaliação.",
    itemClock: "questão",
    totalClock: "total",
    totalHint: (mmss, n) =>
      `Orçamento da sessão: ${mmss} para ${n} questões no ritmo da prova. Corre até o fim da sessão.`,
  },

  exam: {
    metaDescription: (items, minutes) =>
      `Um simulado cronometrado de ${items} questões, nas condições de prova de ${minutes} minutos.`,
    title: "Simulado",
    intro: (items, minutes, min, max, cut) =>
      `${items} questões, ${minutes} minutos, com nota em uma escala estimada de ${min}–${max} e corte em ${cut}. O cronômetro segue o relógio real: fechar a aba não o pausa.`,
    facts: { items: "Questões", minutes: "Minutos", pass: "Aprovação", attempts: "Tentativas" },
    start: "Iniciar a prova",
    bankPending:
      "O banco de questões ainda está sendo escrito, então ainda não dá para montar uma prova.",
    past: "Tentativas anteriores",
    correct: (raw, total) => `${raw}/${total} corretas`,
    timedOut: "tempo esgotado",
    report: "Relatório",
    inProgress: "Tentativa em andamento",
    orphaned: "Esta tentativa referencia questões que não estão mais no banco.",
    discard: "Descartar",
    timeRemaining: "Tempo restante",
    minutesRemaining: (n) => `${n} minuto${n === 1 ? "" : "s"} restante${n === 1 ? "" : "s"}`,
    answered: (n, total) => `${n}/${total} respondidas`,
    previous: "Anterior",
    next: "Próxima",
    submitExam: "Entregar prova",
    keys: "Teclas: 1–6 selecionam · ← → navegam · F marca",
    submitQuestion: "Entregar para correção?",
    submitSummary: (answered, unanswered, flagged) =>
      `${answered} respondidas · ${unanswered} sem resposta · ${flagged} marcadas`,
    unansweredWarning: "Questões sem resposta contam como erradas.",
    submit: "Entregar",
    keepWorking: "Continuar a prova",
    formA:
      "Formulário A — nenhuma destas questões aparece no treino, então esta é uma leitura limpa.",
    seenBefore: (seen, total) =>
      `${seen} de ${total} questões você já viu antes no treino.`,
    abandonConfirm: "Abandonar esta tentativa? Ela não será corrigida.",
    abandon: "Abandonar tentativa",
    navItem: (n, answered, flagged) =>
      `Questão ${n}, ${answered ? "respondida" : "sem resposta"}${flagged ? ", marcada para revisão" : ""}`,
    legendAnswered: "respondida",
    legendFlagged: "marcada",
  },

  result: {
    metaTitle: "Resultado do simulado",
    metaDescription: "Nota escalonada estimada e detalhamento por domínio.",
    none: "Nenhuma tentativa para mostrar",
    take: "Fazer um simulado",
    eyebrow: "Resultado do simulado",
    pass: "Aprovado",
    fail: "Reprovado",
    scaledNote: (cut) => `nota escalonada estimada · corte em ${cut}`,
    scaledAria: (n) => `Nota escalonada ${n}`,
    summary: (raw, total, needed, minutes) =>
      `${raw} de ${total} corretas · você precisava de ${needed} · ${minutes} min usados`,
    timeExpired: "tempo esgotado",
    gap: (domain, pct, items, weight) =>
      `Sua maior lacuna foi ${domain}, com ${pct}% em ${items} questões — isso representa ${weight} da prova.`,
    byDomain: "Por domínio",
    byDomainNote:
      "Do mais fraco para o mais forte. As porcentagens por domínio são diagnósticas — a prova real aprova ou reprova apenas pela nota escalonada total.",
    ofExam: (weight) => `${weight} da prova`,
    lowConfidence: (n) =>
      `apenas ${n} questões, então trate esta porcentagem como meramente indicativa`,
    another: "Fazer outro",
    drillWeak: "Treinar seus pontos fracos",
    dashboard: "Painel de progresso",
    estimateLead: "Esta nota é uma estimativa, não uma nota da Pearson VUE.",
    estimateBody: (total, cut, scaled) =>
      `A prova real é equalizada com parâmetros de dificuldade da teoria de resposta ao item, que não temos, e o guia descreve os pesos do blueprint como a proporção de questões pontuadas — o que implica questões de pré-teste não pontuadas que não conseguimos modelar, então pontuamos todas as ${total}. Nossa escala assume que o candidato minimamente qualificado acerta 70% e ancora ali o corte de ${cut}. Um ${scaled} aqui não é um ${scaled} lá. Ela serve para acompanhar a sua própria trajetória entre as tentativas.`,
  },
};
