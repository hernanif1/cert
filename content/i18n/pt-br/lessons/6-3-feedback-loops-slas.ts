import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "6.3",
  slug: "6-3-feedback-loops-slas",
  domain: 6,
  objective:
    "Gerenciar ciclos de feedback com stakeholders e o alinhamento de expectativas (incluindo SLAs)",
  title: "Ciclos de Feedback e SLAs",
  summary:
    "Um SLA compromete você com algo mensurável, e o trabalho do arquiteto é garantir que esse algo não seja “respostas corretas”. A prova testa se você separa indicador, objetivo e acordo, se atrela uma população e uma janela a cada meta e se transforma reclamações em casos de teste permanentes.",

  body: [
    {
      kind: "prose",
      md: "Três termos são usados como sinônimos e não deveriam ser. Um **SLI** é o indicador — a grandeza efetivamente medida. Um **SLO** é o objetivo interno, definido de forma mais apertada do que aquilo que você prometeu, para que haja margem para perceber e corrigir a degradação. Um **SLA** é o compromisso externo, com uma consequência atrelada: créditos, multas, direito de rescisão.\n\nUm sistema não determinístico ainda pode sustentar um SLA de verdade, desde que o compromisso seja escrito sobre grandezas estáveis sob amostragem. Saídas individuais variam; taxas sobre uma população fixa, não.",
    },

    {
      kind: "callout",
      variant: "key-concept",
      md: "Um **SLI** é o que você mede, um **SLO** é a meta interna e um **SLA** é a promessa externa com uma consequência atrelada. Defina o SLO mais apertado que o SLA de propósito: essa folga é a margem que permite perceber a degradação e corrigi-la antes que ela vire uma nota de crédito.",
    },
    { kind: "heading", text: "Com o que você pode e não pode se comprometer" },
    {
      kind: "table",
      caption: "Reescrevendo uma promessa inexequível como uma promessa exequível",
      headers: ["Compromisso", "Viável?", "Como escrever"],
      rows: [
        [
          "Disponibilidade",
          "Sim",
          "99,9% das requisições retornam uma resposta sem erro, medido no servidor, mensalmente",
        ],
        [
          "Latência",
          "Sim, como percentil",
          "p95 de ponta a ponta abaixo de 4 s, medido no servidor, mensalmente, excluindo o tempo de rede do cliente",
        ],
        [
          "Acurácia em uma tarefa fechada",
          "Sim, com um denominador",
          "Pelo menos 97% de correspondência exata por campo no golden set de 500 casos, reexecutado a cada release",
        ],
        [
          "Qualidade de geração aberta",
          "Não",
          "Comprometa-se, em vez disso, com um processo de revisão e um prazo de triagem de defeitos",
        ],
        [
          "“O assistente nunca vai dizer nada errado”",
          "Não",
          "Comprometa-se com cobertura de guardrails, caminhos de escalonamento e um gate humano na classe de alto custo",
        ],
        [
          "Custo",
          "Sim, como orçamento com alerta",
          "Custo por caso resolvido abaixo de um valor declarado, com alerta de gasto em 80% do orçamento mensal",
        ],
      ],
    },
    {
      kind: "prose",
      md: "Repare no que torna viável a linha de acurácia: uma **população** (o golden set), um **método** (correspondência exata por campo) e uma **janela** (cada release). Um número a que falte qualquer um dos três é infalseável, e a primeira disputa sobre ele será resolvida por quem tiver o cargo mais alto, não por evidência.\n\nMetas de latência não são de livre escolha. Um compromisso de p95 restringe ao mesmo tempo a escolha de modelo e a profundidade da recuperação, porque acrescentar uma passada de re-ranking ou escalar para um modelo maior gasta exatamente o orçamento que o SLA comprometeu. Escreva o orçamento como uma decomposição — recuperação, geração, chamadas de tools, guardrails — para que o custo de uma nova etapa fique visível antes que alguém a adicione.\n\nO custo entra cedo na conversa porque se comporta de um jeito diferente de tudo o que o stakeholder já comprou. O gasto acompanha os tokens: tamanho da entrada, tamanho da saída, profundidade da recuperação, novas tentativas e turnos por tarefa. Adicionar usuários multiplica os casos; não muda o custo de um caso. Um trimestre bem-sucedido aumenta a conta, e um patrocinador que não foi avisado disso vai ler crescimento como defeito.",
    },
    {
      kind: "callout",
      variant: "pitfall",
      md: "*Precisamos de 99% de acurácia* é o requisito não examinado mais comum em projetos de IA. Faça três perguntas antes de concordar: 99% de que população, julgado por quem, em que janela? O requisito geralmente se dissolve em algo ao mesmo tempo alcançável e mais útil — uma barra muito alta na única classe em que um erro sai caro, com um gate humano por trás, e uma barra bem mais baixa em todo o resto.",
    },

    { kind: "heading", text: "Ciclos de feedback que mudam o sistema" },
    {
      kind: "prose",
      md: "Um ciclo que termina em um dashboard é decoração. Ele só está fechado quando uma reclamação de stakeholder pode virar um caso de teste. Três canais valem a construção:",
    },
    {
      kind: "list",
      items: [
        "**Sinal dentro do produto com um código de motivo.** Um simples polegar para baixo não é atribuível. Forçar uma escolha — *fatos errados / não respondeu à minha pergunta / lento demais / recusou um pedido razoável* — separa uma falha de recuperação de uma falha de latência antes que alguém abra um trace.",
        "**Transcrições de escalonamento e handoff.** Todo caso que um humano assumiu é uma falha rotulada que você já tem, sem custo adicional.",
        "**Uma revisão amostral permanente.** Uma cadência fixa em que um especialista de domínio pontua uma amostra de saídas, sucessos incluídos. Ela pega a deriva lenta que ninguém se dá ao trabalho de reportar.",
      ],
    },
    {
      kind: "prose",
      md: "Depois, a regra que faz o ciclo valer: **todo defeito aceito vira um caso de avaliação permanente.** Uma correção que não entra no golden set é uma correção cuja regressão você vai colocar em produção de novo, e o stakeholder que a reportou será quem vai perceber.",
    },

    {
      kind: "example",
      title: "Exemplo prático: renegociando um SLA de acurácia",
      scenario:
        "A área de compras quer uma cláusula contratual afirmando que o assistente de revisão de contratos tem 99% de acurácia. A avaliação da própria equipe mostra 92% de acurácia por campo em onze campos extraídos, com os erros concentrados em dois deles, em modelos de contrato fora do padrão.",
      walkthrough:
        "1. **Decomponha o número.** A acurácia por campo vai de 99,4% até 81%. Um único valor agregado escondia tanto os campos seguros quanto os perigosos.\n2. **Atrele uma consequência a cada campo.** Limite de responsabilidade e data de rescisão carregam exposição jurídica real; os outros nove são conveniências que um revisor corrige em segundos.\n3. **Reescreva o compromisso.** Pelo menos 99% nos dois campos de alta consequência, alcançados roteando as extrações de baixa confiança para um humano; pelo menos 90% nos demais; ambos medidos em um golden set de 400 contratos renovado a cada trimestre.\n4. **Comprometa-se com processo onde você não pode se comprometer com saída.** Um defeito reportado pelo negócio é triado em até dois dias úteis e adicionado ao golden set.\n5. **Nomeie a exclusão.** Modelos de contrato fora do corpus acordado ficam fora do escopo até serem amostrados, rotulados e adicionados.",
      takeaway:
        "O requisito real do stakeholder nunca foi um número; era que um erro caro específico não acontecesse. Atender a isso foi mais barato, mais rápido e mais honesto do que perseguir 99% em tudo.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Aceitar o número do stakeholder e depois fazer a engenharia para chegar nele soa atencioso e cooperativo, e é exatamente por isso que a opção é oferecida. A opção correta interroga a métrica primeiro — população, método, janela e custo do erro — porque uma meta que ninguém consegue falsear não pode ser nem cumprida nem descumprida, e será contestada na primeira vez que um cliente discordar de uma única resposta.",
    },

    {
      kind: "practice",
      questionIds: [
        "D6-q301",
        "D6-q302",
        "D6-q303",
        "D6-q304",
        "D6-q305",
        "D6-q306",
        "D6-q307",
        "D6-q308",
      ],
    },
  ],

  keyTerms: [
    {
      term: "SLI / SLO / SLA",
      definition:
        "O indicador medido, a meta interna definida com folga e o compromisso externo que carrega uma consequência. É confundindo os três que as equipes acabam contratualmente presas à própria meta ambiciosa.",
    },
    {
      term: "Denominador",
      definition:
        "A população sobre a qual uma taxa é medida. Um número de acurácia sem denominador — que casos, julgados por quem, em que janela — não pode ser verificado nem contestado com base em evidência.",
    },
    {
      term: "Código de motivo",
      definition:
        "Uma categoria obrigatória atrelada ao feedback negativo, que mapeia uma reclamação ao componente que ela implica, para que o sinal agregado se torne acionável.",
    },
    {
      term: "Golden set",
      definition:
        "O conjunto de casos fixo e rotulado contra o qual os compromissos de acurácia são medidos e ao qual todo defeito aceito é adicionado.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Um sistema não determinístico não pode sustentar um SLA significativo, então a acurácia deve ficar fora do contrato.",
      why: "Disponibilidade, percentis de latência e acurácia em um conjunto rotulado fixo são todos estáveis sob amostragem, mesmo quando as saídas individuais variam, então recusar-se a assumir compromisso entrega de graça uma negociação que você poderia ter vencido.",
      instead:
        "Comprometa-se com taxas sobre uma população, um método e uma janela declarados, e com garantias de processo onde a saída não pode ser garantida.",
    },
    {
      id: "t2",
      trap: "Coletar avaliações de polegar para cima e polegar para baixo dá à equipe um ciclo de feedback funcional.",
      why: "Uma avaliação negativa sem qualificação não pode ser atribuída à recuperação, ao raciocínio, à latência ou a uma recusa indesejada, então uma taxa em alta diz que algo está errado sem dizer a ninguém o que corrigir.",
      instead:
        "Exija um código de motivo, direcione cada código ao componente que ele implica e promova os defeitos confirmados ao golden set.",
    },
    {
      id: "t3",
      trap: "Um preço por usuário protege o negócio de um gasto descontrolado à medida que a adoção cresce.",
      why: "O custo acompanha tokens, não usuários, então entradas longas, recuperação profunda, novas tentativas e sessões de vários turnos movem a conta independentemente do número de pessoas, e um preço por usuário simplesmente transfere o risco para quem o vende.",
      instead:
        "Projete e assuma compromisso sobre o custo por caso concluído com sucesso, com alertas de orçamento sobre os fatores reais de consumo de tokens.",
    },
    {
      id: "t4",
      trap: "Um defeito reportado está encerrado quando a correção entra em produção e o stakeholder confirma que o caso agora funciona.",
      why: "Nada no sistema impede que uma mudança posterior de prompt, de recuperação ou uma atualização de modelo reintroduza exatamente aquele comportamento, e o mesmo stakeholder vai encontrá-lo de novo, com menos paciência.",
      instead:
        "Adicione todo defeito aceito ao golden set, para que a suíte de regressão o bloqueie permanentemente.",
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

  relatedLessons: ["6.1", "6.5"],
} satisfies Lesson;
