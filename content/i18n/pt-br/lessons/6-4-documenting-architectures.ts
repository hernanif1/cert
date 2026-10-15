import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "6.4",
  slug: "6-4-documenting-architectures",
  domain: 6,
  objective: "Documentar arquiteturas e fornecer orientação de implementação",
  title: "Documentando Arquiteturas",
  summary:
    "A documentação é a interface entre uma arquitetura e a equipe que precisa construí-la e operá-la, e em sistemas de IA os documentos que sustentam o peso são justamente os que as equipes pulam: o contrato de prompt e configuração, o plano de avaliação e o runbook de falhas. A prova testa o que você registra por escrito, onde isso fica e o que impede que fique desatualizado.",

  body: [
    {
      kind: "prose",
      md: "Um design que existe só na cabeça do arquiteto é uma dependência do arquiteto. O conjunto de entregáveis de um sistema de IA é curto e específico, e cada item dele existe porque algo concreto quebra sem ele.",
    },
    {
      kind: "table",
      caption: "O conjunto de documentação e o que força cada atualização",
      headers: ["Documento", "Pergunta que responde", "Gatilho de atualização"],
      rows: [
        [
          "Visão geral da arquitetura",
          "O que chama o quê, por onde entra a entrada não confiável, onde ficam os dados regulados",
          "Uma nova tool, fonte de dados ou integração",
        ],
        [
          "Log de ADRs",
          "Por que o design é como é, e o que foi rejeitado",
          "Nunca é editado — um novo registro substitui um antigo",
        ],
        [
          "Contrato de prompt e configuração",
          "O que é dito ao modelo, sob qual versão e quais parâmetros",
          "Qualquer mudança de prompt, tool ou recuperação",
        ],
        [
          "Plano de avaliação e golden set",
          "Como alguém sabe que uma mudança é uma melhoria",
          "Um novo modo de falha ou defeito aceito",
        ],
        [
          "Runbook",
          "O que fazer quando quebra, e quem acordar",
          "Um novo modo de falha chega à produção",
        ],
        [
          "Orientação de implementação",
          "O que quem implementa não pode mudar, e por quê",
          "Interfaces ou restrições mudam",
        ],
      ],
    },
    {
      kind: "prose",
      md: "**Prompts são código-fonte.** O lugar deles é no repositório, sob revisão, versionados e referenciados por id na configuração e em todo trace. Um prompt colado em um documento de design ou em uma página de wiki vira um fork no momento em que alguém edita o sistema em execução, e o primeiro sintoma é um resultado de avaliação que ninguém consegue reproduzir.\n\n**Fixe tudo o que varia.** Registre o id exato do modelo, não *Claude*. Registre os parâmetros de amostragem, as definições de tools, a profundidade da recuperação e a versão do índice, e os guardrails em vigor. Um sistema cuja configuração só existe dentro de um deploy em execução não pode ser revisado, reconstruído nem revertido.",
    },
    {
      kind: "code",
      lang: "json",
      code: '{\n  "stage": "intake-classification",\n  "model": "claude-haiku-4-5",\n  "prompt_id": "intake-classify@v7",\n  "max_tokens": 512,\n  "tools": ["lookup_account"],\n  "retrieval": { "index": "policies-2026q1", "top_k": 8, "filters": ["region"] },\n  "escalation": { "model": "claude-opus-5", "when": "confidence < 0.7" },\n  "eval_suite": "evals/intake/v7",\n  "owner": "platform-support"\n}',
    },

    { kind: "heading", text: "Orientação que carrega seus motivos" },
    {
      kind: "prose",
      md: "Orientação de implementação não é uma descrição do sistema; é uma lista do que quem implementa pode e não pode decidir. Marque cada item como **fixo** ou **aberto**, e dê o motivo de cada item fixo — uma restrição sem explicação é otimizada para fora por um engenheiro bem-intencionado no terceiro mês. *A recuperação filtra por região antes da similaridade — exigido pelo acordo de residência de dados* sobrevive a uma refatoração. *Filtrar por região* não sobrevive.\n\nDepois, documente os caminhos infelizes, porque é por onde a demo nunca passou: o que acontece em um timeout de tool, em um resultado de recuperação vazio, em um disparo de guardrail, em um aviso de descontinuação de modelo. A maioria das revisões de incidentes de IA termina em uma ramificação que ninguém registrou porque nunca apareceu em uma demo.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Um diagrama de um sistema de IA merece seu lugar quando mostra **fronteiras de confiança**, não caixas. Marque por onde entra texto não confiável — entrada do usuário, documentos recuperados, resultados de tools — porque é por ali que chega a prompt injection; marque quais componentes podem executar ações com consequências reais; e marque onde os dados regulados são armazenados e por quanto tempo. Um diagrama de componentes sem essas três anotações não pode passar por revisão de segurança.",
    },

    {
      kind: "example",
      title: "Exemplo prático: um handoff reprovado na revisão",
      scenario:
        "Um arquiteto entrega um design concluído a um parceiro de implementação: um documento de quarenta páginas, um diagrama e um apêndice de prompts. Seis semanas depois, o sistema construído faz a recuperação sem o filtro de região, e seus números de acurácia não podem ser reproduzidos.",
      walkthrough:
        "1. **O apêndice de prompts era uma cópia.** O parceiro editou a dele; a versão do repositório nunca se mexeu. Correção: os prompts ficam no repo, referenciados por id, e o apêndice é apagado em vez de mantido em sincronia.\n2. **O filtro de região estava listado sem motivo.** Parecia uma otimização, então foi removido quando complicou uma consulta. Correção: marque-o como fixo e declare a obrigação de residência de dados ao lado dele.\n3. **A suíte de avaliação foi descrita, não entregue.** Não havia comando executável nem caminho para o golden set. Correção: o handoff só está completo quando o próprio parceiro reproduz os números do baseline.\n4. **Nada registrava qual versão do modelo produziu os números.** Correção: fixe o id do modelo e a versão do prompt na configuração, e emita ambos em todo trace.",
      takeaway:
        "Toda lacuna aqui era uma lacuna de documentação, não de competência. Orientação escrita ou carrega o artefato e o motivo, ou é redecidida por quem estiver com o teclado na mão.",
    },
    {
      kind: "callout",
      variant: "pitfall",
      md: "Um documento sem dono e sem gatilho de atualização está com os dias contados. Atrele os dois: um dono nomeado e o evento que força uma revisão — adicionar uma tool ou fonte de dados, trocar um modelo, encontrar um novo modo de falha. Rodadas de revisão baseadas em calendário encontram a deriva meses depois de ela ter acontecido e são a primeira coisa cancelada em um trimestre corrido.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Itens sobre documentação oferecem com regularidade *gerar a documentação a partir do código* e *escrever a especificação completa antes de a implementação começar*. As duas soam rigorosas. A primeira produz uma descrição precisa do que existe enquanto descarta todo motivo pelo qual aquilo existe — exatamente a parte que um futuro mantenedor não consegue reconstruir. A segunda fixa decisões antes de a evidência de avaliação que deveria guiá-las ter sido coletada.",
    },
    {
      kind: "practice",
      questionIds: [
        "D6-q401",
        "D6-q402",
        "D6-q403",
        "D6-q404",
        "D6-q405",
        "D6-q406",
        "D6-q407",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Contrato de prompt",
      definition:
        "O prompt versionado no repositório, referenciado por id na configuração e nos traces, de modo que qualquer saída possa ser rastreada até as instruções exatas que a produziram.",
    },
    {
      term: "Fixo versus aberto",
      definition:
        "Uma marcação explícita em cada elemento da orientação de implementação dizendo se quem implementa pode escolher diferente. Itens fixos carregam o motivo que os torna fixos.",
    },
    {
      term: "Fronteira de confiança",
      definition:
        "Uma linha na arquitetura em que conteúdo não confiável — entrada do usuário, documentos recuperados, resultados de tools — alcança um componente que pode agir. É o que um revisor de segurança procura primeiro.",
    },
    {
      term: "Runbook",
      definition:
        "Instruções voltadas ao operador para modos de falha conhecidos: timeouts, recuperação vazia, disparos de guardrail, dependências upstream degradadas, passos de rollback.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Um documento de arquitetura completo e detalhado é o entregável que conclui um handoff.",
      why: "Um documento prova que o design foi descrito, não que outra pessoa consegue operá-lo; a equipe que recebe continua sem conseguir reproduzir um baseline nem colocar uma mudança em produção sem a suíte de avaliação, o golden set e a configuração fixada.",
      instead:
        "Considere o handoff completo somente quando a equipe que recebe reproduzir seus números e fizer o deploy de uma mudança sem ajuda.",
    },
    {
      id: "t2",
      trap: "Os prompts devem ficar no documento de design para que os stakeholders possam revisar a redação exata.",
      why: "Duas cópias editáveis de um prompt garantem divergência, e, uma vez que o documento e o deploy discordam, não há como saber qual texto produziu qualquer resultado de avaliação registrado.",
      instead:
        "Mantenha os prompts em controle de versão, referencie-os por id e faça o documento apontar com um link em vez de citar.",
    },
    {
      id: "t3",
      trap: "Registrar a família do modelo e o prompt basta para descrever o que o sistema executa.",
      why: "O comportamento também depende da versão exata do modelo, dos parâmetros de amostragem, das definições de tools, da profundidade da recuperação e da versão do índice, e nada disso pode ser reconstruído depois do fato a partir de um deploy.",
      instead:
        "Fixe o id do modelo, a versão do prompt, as tools, a configuração de recuperação e os guardrails em configuração versionada no repositório.",
    },
    {
      id: "t4",
      trap: "Os caminhos de falha devem ser documentados depois do lançamento, quando os modos de falha reais forem conhecidos.",
      why: "O timeout de tool, o resultado de recuperação vazio e o disparo de guardrail são todos previsíveis antes do lançamento, e o primeiro incidente é o pior momento possível para decidir o que o sistema deve fazer a respeito deles.",
      instead:
        "Especifique o comportamento de fallback para cada modo de falha conhecido como parte do design, e depois amplie o runbook conforme a produção ensinar mais.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 6",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["6.2", "6.5"],
} satisfies Lesson;
