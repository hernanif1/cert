import type { Dict } from "@/lib/i18n/dict/en";
import { toolsPtBR } from "@/lib/i18n/dict/tools-pt-br";

/**
 * Português (Brasil). Termos de prova que o candidato verá em inglês no exame
 * real (nomes de domínio, "mock exam", "drill") são traduzidos na navegação,
 * mas as QUESTÕES permanecem em inglês de propósito — ver `practice.englishNote`.
 */
export const ptBR: Dict = {
  tools: toolsPtBR,
  brand: "Claude Certified",
  skipToContent: "Ir para o conteúdo",

  nav: {
    primary: "Principal",
    curriculum: "Currículo",
    overview: "Visão geral",
    practice: "Prática",
    studyTools: "Ferramentas de estudo",
    mockExam: "Simulado",
    mockExamHint: "63 questões cronometradas em condições de prova",
    takeMockExam: "Fazer simulado",
    progress: "Painel de progresso",
    progressHint: "Prontidão, cobertura e domínio dos exercícios",
    drill: "Modo de treino",
    drillHint: "Repetição espaçada em todo o banco de questões",
    checklist: "Checklist de prontidão",
    checklistHint: "Autoavaliação que você mesmo marca",
    flagged: "Questões marcadas",
    flaggedHint: "Tudo o que você marcou, com um prompt para estudar",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    allDomains: "Todos os domínios",
    domainOverview: "Visão geral do domínio",
    showLessons: (title) => `Mostrar lições de ${title}`,
    hideLessons: (title) => `Ocultar lições de ${title}`,
    lessonsCount: (n) => `${n} lições`,
    weightOfExam: (pct) => `${pct} da prova`,
  },

  theme: {
    label: "Tema",
    system: "Sistema",
    light: "Claro",
    dark: "Escuro",
    aria: (current) => `Tema: ${current}. Clique para alterar.`,
  },

  language: {
    label: "Idioma",
    aria: (current) => `Idioma: ${current}`,
  },

  search: {
    label: "Buscar",
    open: (shortcut) => `Buscar (${shortcut})`,
    placeholder: "Buscar lições, seções, termos-chave, armadilhas de prova…",
    loading: "Carregando o índice…",
    error: "A busca está indisponível no momento. Feche e tente de novo.",
    jumpTo: "Ir para",
    noResults: (q) => `Nenhum resultado para “${q}”.`,
    topHit: "Melhor resultado",
    results: "Resultados da busca",
    kinds: {
      lesson: "Lições",
      section: "Seções",
      term: "Termos-chave",
      trap: "Armadilhas de prova",
      domain: "Domínios",
      page: "Páginas",
    },
    keys: { navigate: "para navegar", open: "para abrir", close: "para fechar" },
  },

  view: {
    enterFullscreen: "Tela cheia",
    exitFullscreen: "Sair da tela cheia",
    enterFocus: "Modo foco: ocultar a navegação",
    exitFocus: "Sair do modo foco (Esc)",
  },

  footer: {
    disclaimer:
      "Material de estudo não oficial. Sem afiliação, licença ou endosso da Anthropic ou da Pearson VUE. As lições são escritas a partir dos objetivos do guia oficial da prova e de documentação pública; nenhuma questão de prática vem do banco de itens real, e as pontuações de prática são estimativas que não são comparáveis a uma nota escalonada de verdade.",
    builtFrom: (code, version, effective) =>
      `Construído a partir do Guia da Prova ${code} v${version} (${effective}).`,
  },

  storageBlocked:
    "Seu navegador está bloqueando os dados do site, então o progresso não será salvo entre as visitas.",

  home: {
    eyebrow: "Guia de estudo não oficial",
    intro:
      "Sete domínios ponderados, trinta e oito objetivos e um treino de repetição espaçada construído diretamente a partir do blueprint publicado da prova. Tudo roda no seu navegador; seu progresso nunca sai deste dispositivo.",
    start: "Começar a estudar",
    progress: "Painel de progresso",
    facts: {
      items: "Questões",
      timeLimit: "Tempo limite",
      minutes: (n) => `${n} minutos`,
      passingScore: "Nota de aprovação",
      passOf: (pass, max) => `${pass} de ${max}`,
      fee: "Taxa da prova",
      validity: "Validade",
      months: (n) => `${n} meses`,
      code: "Código da prova",
    },
  },

  learn: {
    metaTitle: "Currículo",
    metaDescription: (domains, lessons, code) =>
      `Todos os ${domains} domínios e ${lessons} objetivos do blueprint da prova ${code}.`,
    eyebrow: "Currículo",
    intro:
      "Sete domínios de conteúdo, com exatamente os pesos do blueprint publicado. Cada objetivo abaixo é uma lição.",
    facts: {
      items: "Questões",
      time: "Tempo",
      min: (n) => `${n} min`,
      pass: "Aprovação",
      domains: "Domínios",
      objectives: "Objetivos",
    },
    domainMeta: (lessons, mock, total) =>
      `${lessons} lições · ${mock} de ${total} questões do simulado`,
  },

  domain: {
    back: "Currículo",
    meta: (lessons, mock, total) =>
      `${lessons} lições · contribui com ${mock} de ${total} questões em um simulado`,
    taskStatements: "Objetivos da prova",
    drill: "Treinar este domínio",
  },

  lesson: {
    breadcrumb: "Trilha de navegação",
    learn: "Aprender",
    domain: (n) => `Domínio ${n}`,
    task: (id) => `Tarefa ${id}`,
    readingTime: (min) => `${min} min de leitura`,
    objective: "Objetivo",
    markComplete: "Marcar como concluída",
    completed: "Concluída",
    keyTerms: "Termos-chave",
    sources: "Fontes",
    examTraps: "Armadilhas da prova",
    takeaway: "Conclusão",
    notWritten:
      "Esta lição ainda não foi escrita. A rota, a navegação e o acompanhamento de progresso já funcionam — só o texto está pendente.",
    drillDomain: "Treinar este domínio",
    allOf: (title) => `Tudo de ${title}`,
    pager: "Navegação entre lições",
    previous: "Anterior",
    next: "Próxima",
    onThisPage: "Nesta página",
    backToTop: "Voltar ao topo",
    linkToSection: (title) => `Link para a seção: ${title}`,
    seeDefinition: "Ver a definição em Termos-chave",
    opensInNewTab: "abre em uma nova aba",
    readingProgress: "Progresso de leitura",
  },

  callout: {
    "key-concept": "Conceito-chave",
    "exam-distractor": "Distrator comum na prova",
    pitfall: "Armadilha",
    note: "Nota",
  },

  practice: {
    title: "Cenário de prática",
    englishNote:
      "As questões ficam em inglês de propósito: a prova real é aplicada em inglês.",
    check: "Verificar resposta",
    next: "Próxima questão",
    seeResult: "Ver resultado",
    restart: "Refazer",
    score: (right, total) => `${right} de ${total} corretas`,
    progressAria: "Progresso da prática",
    questionState: (n, state) => `Questão ${n}: ${state}`,
    state: {
      pending: "não respondida",
      correct: "correta",
      incorrect: "incorreta",
    },
    drillDomain: "Treinar este domínio",
    boxMove: (from, to, when) =>
      `Caixa ${from} → ${to} · próxima revisão ${when}`,
    interval: {
      again: "ainda nesta sessão",
      tomorrow: "amanhã",
      inDays: (n) => `em ${n} dias`,
    },
  },

  question: {
    counter: (i, total) => `Questão ${i} de ${total}`,
    select: (word) => `Selecione ${word}.`,
    numberWord: { 2: "DUAS", 3: "TRÊS" },
    flag: "Marcar",
    flagged: "Marcada",
    flagAria: "Marcar para revisão",
    unflagAria: "Remover marcação de revisão",
    choices: "Alternativas",
    missed: "Você deixou esta passar.",
    correct: "Correto",
    notQuite: "Quase lá",
  },

  progressUi: {
    completedTitle: "Concluída",
    lessonsOf: (done, total) => `${done} de ${total} lições`,
    lessonsComplete: (done, total) => `${done} de ${total} lições concluídas`,
  },

  notFound: {
    title: "Página não encontrada",
    body: "Essa página não faz parte do currículo.",
    back: "Voltar ao currículo",
  },
};
