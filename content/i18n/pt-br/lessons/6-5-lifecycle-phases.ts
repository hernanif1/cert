import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "6.5",
  slug: "6-5-lifecycle-phases",
  domain: 6,
  objective:
    "Apoiar as fases do ciclo de vida (discovery, design, handoff, monitoramento, iteração)",
  title: "Apoiando o Ciclo de Vida",
  summary:
    "Projetos de IA raramente falham no modelo; falham nas emendas — uma prova de conceito que deslumbrou com dez exemplos, um handoff que deixou a equipe que recebeu incapaz de rodar uma avaliação, uma atualização de modelo colocada em produção como ganho gratuito. A prova testa o entregável do arquiteto e o critério de saída de cada fase.",

  body: [
    {
      kind: "prose",
      md: "As fases são discovery, design, handoff, monitoramento e iteração. Trate cada uma como um gate com um critério de saída, ou o projeto avança na base do entusiasmo e emperra em algum ponto entre uma demo bem-sucedida e um sistema em que alguém confie.",
    },
    {
      kind: "table",
      caption: "O que o arquiteto deve a cada fase e o que é preciso para sair dela",
      headers: ["Fase", "Entregável do arquiteto", "Critério de saída", "Falha comum"],
      rows: [
        [
          "Discovery",
          "Critérios de sucesso mensuráveis, amostras reais, dono do ground truth, não-objetivos",
          "Um critério que um número específico poderia reprovar",
          "Requisitos que não podem ser falseados",
        ],
        [
          "Design",
          "Arquitetura, ADRs, plano de avaliação, orçamentos de latência e custo por etapa",
          "Uma avaliação de baseline executada com entradas reais",
          "Um design que nunca encontrou a distribuição real das entradas",
        ],
        [
          "Handoff",
          "Avaliações executáveis, configuração fixada, orientação, runbook",
          "A equipe que recebe reproduz o baseline sem ajuda",
          "Uma entrega de documentos confundida com um handoff",
        ],
        [
          "Monitoramento",
          "Schema de trace, dashboards, alertas, cadência de revisão",
          "Um caso com falha pode ser explicado de ponta a ponta em minutos",
          "Logs que registram as saídas, mas não a versão do prompt nem o contexto recuperado",
        ],
        [
          "Iteração",
          "Gate de regressão, golden set em crescimento, log de mudanças",
          "Toda mudança reexecuta as avaliações antes do release",
          "Edições de prompt colocadas direto em produção",
        ],
      ],
    },

    { kind: "heading", text: "Uma prova de conceito não é um piloto" },
    {
      kind: "prose",
      md: "Uma demo com dez exemplos selecionados a dedo estabelece que o formato da solução é plausível. Não estabelece nada sobre a cauda. Três coisas mudam no caminho até a produção, e a prova espera que você as nomeie:",
    },
    {
      kind: "list",
      items: [
        "**Distribuição.** O tráfego real é mais longo, mais bagunçado, parte dele em outros idiomas, às vezes adversarial, e cheio de casos que o conjunto da demo nunca conteve.",
        "**Responsabilização.** Em uma demo, uma resposta errada é assunto para conversa. Em produção ela chega a um cliente, e alguém precisa percebê-la, escalá-la e corrigi-la.",
        "**Economia.** Dez exemplos não custam nada. Dez mil por dia, com recuperação, novas tentativas e sessões de vários turnos, são uma linha de orçamento sobre a qual o financeiro vai perguntar.",
      ],
    },
    {
      kind: "prose",
      md: "O piloto existe para comprar essa informação barato: tráfego real, usuários reais, um raio de impacto limitado, o processo manual existente ainda rodando por trás e human-in-the-loop na classe cara. Expandir do piloto para o tráfego completo passa a ser, então, uma decisão por segmento condicionada a evidência medida, não uma chave única.\n\nO entregável de monitoramento não é um dashboard, é um **schema de trace**. Um trace que registra só a saída não consegue explicar a saída. Registre por requisição: versão do prompt, id do modelo, ids dos documentos recuperados, chamadas de tools e seus resultados, contagens de tokens, latência por etapa, decisões de guardrails e o desfecho final, incluindo se um humano interveio. Essa é a diferença entre uma investigação de duas horas e uma de duas semanas.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Trate uma **atualização de modelo como uma mudança, não como um upgrade.** Um modelo mais novo é uma distribuição de comportamento diferente: prompts ajustados em torno das manias de um modelo mais antigo podem regredir, a formatação da saída se desloca, e latência e custo se movem — muitas vezes na direção com que o seu SLA se importa. Fixe os ids de modelo na configuração, rode a suíte de avaliação contra o candidato antes que qualquer tráfego se mova e faça o rollout atrás do mesmo gate de qualquer outra mudança.",
    },

    {
      kind: "example",
      title: "Exemplo prático: o piloto que salvou o projeto",
      scenario:
        "Um assistente de entrada de documentos marca 94% no conjunto de desenvolvimento de 40 casos da equipe. O patrocinador quer a fila de revisão manual desligada no lançamento. O arquiteto propõe, em vez disso, um piloto de quatro semanas em 10% do tráfego real, com a fila intacta.",
      walkthrough:
        "1. **A distribuição real chega.** A acurácia em produção é de 78%. O conjunto de desenvolvimento não continha nenhum fax digitalizado e nada acima de sessenta páginas.\n2. **Atribua a lacuna antes de corrigi-la.** Dois terços dos erros são de parsing, não de raciocínio — o caminho de digitalização perde a estrutura das tabelas. O terço restante é um campo genuinamente ambíguo.\n3. **Corrija a causa que de fato está causando o problema.** Um parsing melhor para documentos digitalizados; o campo ambíguo roteado para um revisor em vez de chutado.\n4. **Faça o conjunto de avaliação crescer a partir da realidade.** Toda falha do piloto vira um caso. O conjunto vai de 40 para 260 e para de bajular o sistema.\n5. **Condicione o rollout.** A fila é desligada por tipo de documento, cada um quando sua acurácia medida se mantém acima do limiar por duas semanas consecutivas.",
      takeaway:
        "Nada disso era visível sem tráfego real, e tudo isso teria ficado visível para os clientes se a fila tivesse sido desligada no lançamento.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Opções que escalam um piloto bem-sucedido para o tráfego completo de uma vez, ou que recorrem a um modelo mais novo para fechar uma lacuna de qualidade, são escritas para soar decididas. A opção correta quase sempre condiciona o avanço a evidência medida: expandir segmento por segmento, conforme cada um atinge seu limiar, e avaliar uma mudança de modelo antes que ela entre em produção, e não depois que os usuários reportarem a regressão.",
    },

    {
      kind: "practice",
      questionIds: [
        "D6-q501",
        "D6-q502",
        "D6-q503",
        "D6-q504",
        "D6-q505",
        "D6-q506",
        "D6-q507",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Critério de saída",
      definition:
        "A condição observável que precisa valer antes que um projeto deixe uma fase do ciclo de vida. Sem ele, as fases se confundem e o trabalho inacabado é levado adiante de forma invisível.",
    },
    {
      term: "Piloto",
      definition:
        "Uma execução limitada em tráfego real com o processo existente ainda em vigor. Compra as informações de distribuição, responsabilização e custo que uma prova de conceito não consegue comprar.",
    },
    {
      term: "Schema de trace",
      definition:
        "Os campos registrados em toda requisição — versão do prompt, id do modelo, ids recuperados, chamadas de tools, tokens, latência por etapa, desfecho — que tornam uma falha de produção explicável depois do fato.",
    },
    {
      term: "Gate de regressão",
      definition:
        "A regra de que nenhuma mudança de prompt, de recuperação ou de modelo chega à produção sem reexecutar a suíte de avaliação, que é o que impede que a correção de uma reclamação quebre outra capacidade.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Uma prova de conceito que se sai bem nos exemplos da equipe já reduziu o risco da produção.",
      why: "Exemplos selecionados a dedo vêm do que a equipe imaginou, não do tráfego real, então sub-representam tamanho, ruído, ambiguidade e entrada adversarial, que é exatamente onde a acurácia de produção se decide.",
      instead:
        "Passe para um piloto limitado em tráfego real com o caminho manual ainda rodando, e reconstrua o conjunto de avaliação a partir do que ele encontrar.",
    },
    {
      id: "t2",
      trap: "O handoff está completo quando a equipe de implementação tem o documento de arquitetura e a revisão de design foi encerrada.",
      why: "Ter um documento em mãos não é ter capacidade: até que a equipe que recebe consiga reproduzir a avaliação de baseline e colocar uma mudança de prompt em produção pelo próprio pipeline, o arquiteto continua sendo uma dependência oculta.",
      instead:
        "Faça da reprodução do baseline pela equipe que recebe o critério de saída do handoff.",
    },
    {
      id: "t3",
      trap: "Monitorar um sistema de IA significa acompanhar latência, taxa de erro e custo, como em qualquer serviço.",
      why: "Esses três dizem que algo degradou, mas nunca por quê, porque a causa quase sempre está na versão do prompt, no contexto recuperado ou em um resultado de tool, e nada disso pode ser reconstruído depois se não tiver sido registrado.",
      instead:
        "Registre versão do prompt, id do modelo, ids dos documentos recuperados, chamadas de tools e desfecho em toda requisição.",
    },
    {
      id: "t4",
      trap: "Um modelo mais novo pode ser adotado sem reexecutar a avaliação, já que a capacidade melhora a cada release.",
      why: "Um modelo diferente é uma distribuição de comportamento diferente: prompts ajustados às manias de um modelo mais antigo podem regredir, a formatação pode se deslocar, e latência e custo se movem de maneiras que um SLA existente talvez não tolere.",
      instead:
        "Rode primeiro a suíte de avaliação contra o modelo candidato e depois avance atrás do gate normal de mudanças.",
    },
    {
      id: "t5",
      trap: "Uma vez que o sistema está em produção, o envolvimento do arquiteto termina e a iteração pertence à engenharia.",
      why: "É na iteração que a arquitetura de fato se decide — limiares se movem, etapas são adicionadas, orçamentos são gastos — e a deriva sem dono nessas escolhas é como um design se torna, em silêncio, algo que ninguém teria aprovado.",
      instead:
        "Continue respondendo pelo gate de regressão, pelos orçamentos e pela cadência de revisão ao longo da fase de iteração.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 6",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Building Effective Agents — Anthropic Engineering",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],

  relatedLessons: ["6.1", "6.4"],
} satisfies Lesson;
