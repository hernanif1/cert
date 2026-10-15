import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "4.5",
  slug: "4-5-token-latency-cost-optimization",
  domain: 4,
  objective:
    "Otimizar o uso de tokens, a latência e os trade-offs entre custo e desempenho",
  title: "Otimizando Tokens, Latência e Custo",
  summary:
    "Custo e latência são determinados por partes diferentes da mesma requisição, então a mesma otimização raramente ajuda os dois. A prova espera que você defina primeiro um piso de qualidade, contabilize os tokens por estágio e só então escolha a alavanca que ataca a restrição que você de fato tem.",

  body: [
    {
      kind: "prose",
      md: "A otimização começa com um exercício de contabilidade, não com uma ideia. Quebre uma única requisição nos segmentos que consomem tokens — system prompt, definições de tools, exemplos few-shot, contexto recuperado, histórico da conversa e a saída gerada — e meça cada um em tráfego real. É rotina as equipes descobrirem que um schema de tools que ninguém enxuga há seis meses, ou um histórico de conversa reenviado por inteiro a cada turno, pesa mais do que tudo o que elas estavam prestes a ajustar.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Tokens de entrada e de saída se comportam de maneira diferente. A entrada é processada em uma única passada paralela, então um prompt longo custa dinheiro, mas acrescenta comparativamente pouco tempo. A saída é produzida um token por vez, então o comprimento da geração é o termo dominante da latência de ponta a ponta. **Para cortar custo, ataque a entrada. Para cortar latência, ataque a saída.** Confundir os dois é o motivo pelo qual projetos de encurtar prompt tantas vezes não conseguem mexer no gráfico de latência.",
    },

    { kind: "heading", text: "As alavancas" },
    {
      kind: "table",
      caption: "Case a alavanca com a restrição; a maioria das alavancas move um eixo, não os dois",
      headers: ["Alavanca", "Ajuda em", "Custo de usá-la", "Pré-condição"],
      rows: [
        [
          "Prompt caching",
          "Custo de entrada e tempo até o primeiro token em prefixos repetidos",
          "Disciplina na ordenação do prompt",
          "Um prefixo longo e estável byte a byte, colocado antes de qualquer coisa variável",
        ],
        [
          "Roteamento ou cascata de modelos",
          "Custo médio em uma carga de trabalho mista",
          "Lógica de roteamento, mais as próprias chamadas escalonadas",
          "Um sinal de dificuldade confiável e um caminho de escalonamento definido",
        ],
        [
          "Enxugamento de contexto e reranking",
          "Custo de entrada e, muitas vezes, acurácia também",
          "Risco de descartar a passagem necessária",
          "Qualidade de recuperação boa o suficiente para passar menos chunks",
        ],
        [
          "Contrato de saída mais enxuto",
          "Latência e custo de saída juntos",
          "Menos texto explicativo para os humanos na ponta",
          "Um consumidor downstream que não precisa de prosa",
        ],
        [
          "Streaming",
          "Apenas a responsividade percebida",
          "Complexidade no cliente",
          "Uma superfície interativa capaz de renderizar saída parcial",
        ],
        [
          "Processamento assíncrono em batch",
          "Custo unitário em trabalho de grande volume",
          "Tempo de retorno medido em minutos ou horas",
          "Uma carga de trabalho sem nenhum usuário esperando por ela",
        ],
      ],
    },
    {
      kind: "prose",
      md: "**Prompt caching é um problema de ordenação antes de ser um problema de configuração.** Um acerto de cache exige que o prefixo seja idêntico, então tudo o que é variável — um timestamp, um id de usuário, os chunks recuperados hoje — precisa ficar depois do conteúdo estável, e não entremeado nele. Um prompt que intercala uma variável por requisição no meio de um longo preâmbulo de sistema não tem reúso nenhum, e a correção é reordenar, não encurtar.\n\n**Roteamento só é mais barato de ponta a ponta.** Uma cascata que manda tudo primeiro para um modelo pequeno e escalona em caso de falha paga duas vezes por cada requisição escalonada, então a economia depende inteiramente da taxa de escalonamento e de o sinal de roteamento ser barato de calcular. Meça o custo combinado por tarefa concluída com sucesso, nunca o preço de tabela do modelo pequeno.\n\n**Paralelismo converte uma soma em um máximo.** Subtarefas independentes — classificar, extrair e checar a política no mesmo documento — disparadas de forma concorrente terminam no tempo da mais lenta, e não no total das três. Essa é a mudança de latência de maior alavancagem disponível quando um pipeline foi escrito como cadeia por hábito, e não por dependência.",
    },
    {
      kind: "example",
      title: "Exemplo prático: um assistente de documentos que custa demais",
      scenario:
        "Um assistente de documentos custa cerca de três vezes o seu orçamento. O primeiro instinto da equipe é mover todas as requisições para o menor modelo disponível.",
      walkthrough:
        "1. **Contabilize os tokens por estágio.** Por requisição: 1.100 de system prompt, 4.300 de definições de tools para onze tools, 9.000 de contexto recuperado em doze chunks, 2.000 de histórico reenviado, 600 de saída. A conta é a entrada, não a saída.\n2. **Defina o piso de qualidade antes de mexer em qualquer coisa.** A suíte de regressão define a nota mínima aceitável; qualquer otimização que fique abaixo dela é rejeitada, independentemente da economia.\n3. **Pegue primeiro os ganhos de graça.** Quatro tools nunca são chamadas e são removidas. O reranking permite que doze chunks virem quatro sem perda de acurácia medida. O histórico com mais de seis turnos é resumido.\n4. **Reordene para o cache.** O system prompt e as definições de tools vão para antes do conteúdo por requisição, para que o prefixo estável seja cacheável entre turnos.\n5. **Roteie o que sobrou.** As etapas de classificação e roteamento passam para um modelo pequeno e rápido; a síntese fica onde estava. O custo combinado é medido por tarefa bem-sucedida, incluindo os escalonamentos.",
      takeaway:
        "O downgrade incondicional de modelo era a única opção que teria rompido o piso de qualidade, e foi também a que a equipe tentou primeiro. A contabilidade revela ganhos mais baratos que não custam nada em qualidade.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Reduzir o limite máximo de tokens de saída* é oferecido como alavanca de custo. A geração é cobrada pelos tokens efetivamente produzidos, então baixar um teto que nunca é atingido não economiza nada — e baixar um que é atingido trunca respostas no meio da frase, o que transforma um problema de custo em um problema de correção. Encurte a saída mudando o formato solicitado, não cortando-a.",
    },

    {
      kind: "practice",
      questionIds: [
        "D4-q501",
        "D4-q502",
        "D4-q503",
        "D4-q504",
        "D4-q505",
        "D4-q506",
        "D4-q507",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Piso de qualidade",
      definition:
        "A nota mínima aceitável na suíte de regressão, fixada antes de a otimização começar. Transforma \"deixe mais barato\" em um problema com restrições e uma resposta defensável.",
    },
    {
      term: "Prefixo estável",
      definition:
        "A porção inicial do prompt, idêntica byte a byte, que pode ser mantida em cache entre requisições. É preservada colocando todo o conteúdo variável depois dela.",
    },
    {
      term: "Cascata de modelos",
      definition:
        "Atender a maior parte do tráfego com um modelo pequeno e escalonar os casos difíceis para um maior. Econômica apenas quando a taxa de escalonamento é baixa e o sinal de roteamento é barato.",
    },
    {
      term: "Custo combinado por tarefa",
      definition:
        "Gasto total somando todas as tentativas, escalonamentos e retries, dividido pelas tarefas concluídas com sucesso. O único número de custo que sobrevive a uma mudança de roteamento.",
    },
    {
      term: "Latência percebida",
      definition:
        "O que o usuário experimenta, governado pelo tempo até o primeiro token em uma interface com streaming, mesmo quando o tempo total de conclusão não muda.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Usar streaming nas respostas reduz a latência do sistema.",
      why: "O streaming muda o momento em que o primeiro token fica visível, não quanto tempo a geração leva; o tempo total de conclusão não muda, e um consumidor downstream em batch não vê melhoria alguma.",
      instead:
        "Use streaming para melhorar a responsividade percebida e encurte a saída gerada para melhorar o tempo real de conclusão.",
    },
    {
      id: "t2",
      trap: "Encurtar o system prompt é a forma mais eficaz de reduzir a latência de ponta a ponta.",
      why: "Os tokens de entrada são processados em uma passada paralela, enquanto os de saída são gerados sequencialmente, de modo que enxugar um preâmbulo longo reduz principalmente o custo e move a curva de latência bem menos do que as equipes esperam.",
      instead:
        "Mire no comprimento gerado, paralelize as etapas independentes e trate o enxugamento do prompt como alavanca de custo.",
    },
    {
      id: "t3",
      trap: "O prompt caching se aplica automaticamente a qualquer conteúdo que se repita entre requisições.",
      why: "O reúso depende de um prefixo inicial idêntico, de modo que uma variável como um timestamp ou um id de usuário colocada no começo do prompt invalida tudo o que vem depois dela e não gera reúso nenhum.",
      instead:
        "Ordene o prompt com o conteúdo estático primeiro e mantenha todo valor por requisição atrás do segmento cacheável.",
    },
    {
      id: "t4",
      trap: "Mover todo o tráfego para o menor modelo disponível é a forma mais segura de atingir uma meta de custo.",
      why: "O custo cai de imediato enquanto a qualidade piora nos casos mais difíceis, e os retries, escalonamentos e handoffs humanos que vêm em seguida costumam ser invisíveis na fatura do modelo contra a qual a mudança foi julgada.",
      instead:
        "Fixe primeiro um piso de qualidade na suíte de regressão; depois, roteie por dificuldade e meça o custo combinado por tarefa bem-sucedida.",
    },
    {
      id: "t5",
      trap: "Uma configuração mais baixa de máximo de tokens de saída reduz o gasto em toda requisição.",
      why: "A cobrança segue os tokens efetivamente gerados, e não o teto configurado, de modo que um limite acima da saída típica não muda nada e um limite abaixo dela trunca respostas e gera retrabalho.",
      instead:
        "Peça um formato de saída mais compacto e mantenha o limite como salvaguarda contra geração descontrolada.",
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
  ],

  relatedLessons: ["4.1", "2.5"],
} satisfies Lesson;
