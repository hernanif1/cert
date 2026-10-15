import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "4.3",
  slug: "4-3-ab-testing-iteration",
  domain: 4,
  objective: "Conduzir testes A/B e melhorias iterativas",
  title: "Testes A/B e Iteração",
  summary:
    "A avaliação offline diz se uma mudança é melhor no seu dataset; um teste A/B diz se ela é melhor para os usuários. A prova sonda a disciplina em torno desse teste — uma variável, uma unidade de randomização persistente, uma duração pré-registrada e métricas de guardrail capazes de vetar uma vitória.",

  body: [
    {
      kind: "prose",
      md: "Avaliação offline e experimentação online respondem a perguntas diferentes, e nenhuma substitui a outra. Um golden set mede capacidade contra casos que você escolheu; um teste A/B mede resultados contra um tráfego que você não escolheu, incluindo as entradas que ninguém pensou em anotar. Uma mudança deve passar pelo filtro barato antes de chegar ao caro.",
    },
    {
      kind: "table",
      caption: "Exposição crescente: cada degrau compra mais sinal com mais risco",
      headers: ["Estágio", "Exposição de usuários", "O que consegue detectar", "O que não consegue"],
      rows: [
        [
          "Avaliação offline",
          "Nenhuma",
          "Regressões de qualidade, quebras de formato, variações de custo e latência",
          "Qualquer coisa sobre o comportamento real dos usuários ou a distribuição real das entradas",
        ],
        [
          "Shadow run",
          "Nenhuma — a variante roda, mas sua saída é descartada",
          "Latência, custo e divergência de saída em entradas genuínas de produção",
          "Se os usuários preferem a saída, já que eles nunca a veem",
        ],
        [
          "Canary",
          "Uma fatia pequena, observada de perto",
          "Quebras operacionais e violações de métricas de guardrail, rapidamente",
          "Efeitos pequenos — a amostra é pequena demais de propósito",
        ],
        [
          "Teste A/B",
          "Divisão randomizada, com os dois braços no ar",
          "Efeito causal sobre as métricas de resultado voltadas ao usuário",
          "Efeitos menores do que aqueles que o teste foi dimensionado para enxergar",
        ],
      ],
    },

    { kind: "heading", text: "Desenhando o teste" },
    {
      kind: "list",
      ordered: true,
      items: [
        "**Mude uma coisa só.** Se o prompt, o modelo e a profundidade da recuperação se movem juntos, uma vitória não pode ser atribuída e uma derrota não pode ser diagnosticada. Mudanças empacotadas são, de longe, a razão mais comum para um experimento não ensinar nada.",
        "**Escolha uma unidade de randomização persistente.** Atribua por usuário ou por sessão, não por requisição. A atribuição por requisição mostra as duas variantes à mesma pessoa, o que produz uma experiência incoerente e contamina toda métrica no nível do usuário.",
        "**Nomeie uma métrica primária antes de começar**, mais as **métricas de guardrail** — latência p95, custo por tarefa resolvida, taxa de escalonamento, taxa de recusa — que podem vetar uma vitória na primária. A forma composta é deliberada: uma métrica de guardrail mede, enquanto um guardrail no Domínio 5 é um controle que bloqueia.",
        "**Calcule o tamanho da amostra com antecedência**, a partir da taxa de baseline e do menor efeito que vale a pena lançar. É esse número, e não a impaciência, que define a duração, e ela normalmente cobre ciclos semanais completos, para que o tráfego de dias úteis e de fim de semana caia nos dois braços.",
        "**Pré-especifique os segmentos** que você vai analisar. Fatiar depois do fato até algo parecer significativo encontra ruído com toda a confiabilidade.",
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Conferir os resultados continuamente e parar no instante em que *p* cai abaixo de 0,05 é a maneira clássica de fabricar um falso positivo: com olhadas repetidas em dados que se acumulam, um resultado nulo acaba cruzando o limiar por puro acaso. Ou você roda até o tamanho de amostra pré-registrado, ou adota um desenho sequencial cuja regra de parada já leva em conta a inspeção repetida.",
    },
    {
      kind: "prose",
      md: "Significância estatística e significância prática são testes separados, e os dois precisam passar. Com grandes volumes de tráfego, uma melhoria de 0,2% pode ser significativa no nível de confiança que você quiser e ainda assim não justificar um modelo que custa 40% a mais para rodar. A regra de decisão que um arquiteto põe no papel se parece com *lançar se a métrica primária melhorar em pelo menos X, nenhuma métrica de guardrail piorar além de Y e o resultado se mantiver nos segmentos pré-especificados*.\n\nFique atento aos dois efeitos que fazem as leituras iniciais mentirem. A **novidade** infla o engajamento com qualquer coisa que pareça diferente, e depois some. O **aprendizado** age no sentido oposto: usuários que tinham se adaptado ao comportamento antigo vão pior no início e se recuperam. Os dois são argumentos para rodar a duração planejada inteira em vez de ler os dois primeiros dias.",
    },
    {
      kind: "example",
      title: "Exemplo prático: testando um prompt reescrito de assistente de suporte",
      scenario:
        "Um assistente de suporte resolve tickets de nível um sem repassá-los a humanos. A equipe reescreveu o system prompt, trocou para um modelo menor por causa do custo e aumentou a quantidade de chunks recuperados de três para seis. Ela quer rodar um teste A/B de uma semana em 50% do tráfego e lançar se a taxa de deflexão melhorar.",
      walkthrough:
        "1. **Desempacote.** Três mudanças em um braço significam que um ganho de deflexão pode vir do prompt enquanto a troca de modelo custa acurácia em silêncio. Separe em braços distintos ou em testes sequenciais.\n2. **Passe primeiro pelo filtro offline.** A suíte de regressão roda contra cada variante. O modelo menor cai oito pontos no estrato de troubleshooting em várias etapas, o que mata essa variante antes que qualquer usuário a veja.\n3. **Defina a regra de decisão.** Primária: taxa de deflexão. Métricas de guardrail: taxa de tickets reabertos em até 48 horas, latência p95, CSAT, custo por ticket resolvido. Deflexão que sobe enquanto as reaberturas sobem não é vitória, é custo adiado.\n4. **Dimensione o teste.** Deflexão de baseline em 31%, menor efeito que vale a pena em dois pontos; o cálculo diz que a semana é curta e que a divisão precisa de mais tempo, então a duração é definida pela matemática.\n5. **Realimente o resultado.** Seja o que for lançado, os casos de troubleshooting que falharam viram itens permanentes de regressão.",
      takeaway:
        "A maioria dos fracassos em testes A/B é falha de desenho, não de análise. Empacotar mudanças e deixar o calendário, e não um cálculo de poder estatístico, definir a duração são as duas que aparecem na prova.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Liberar para 100% e comparar esta semana com a semana passada* é oferecido como um atalho pragmático. Uma comparação antes-e-depois não tem controle concorrente, então sazonalidade, uma campanha de marketing ou um deploy sem relação ficam todos confundidos com a mudança. Braços randomizados concorrentes existem exatamente para eliminar isso.",
    },

    {
      kind: "practice",
      questionIds: [
        "D4-q301",
        "D4-q302",
        "D4-q303",
        "D4-q304",
        "D4-q305",
        "D4-q306",
        "D4-q307",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Unidade de randomização",
      definition:
        "A entidade atribuída a uma variante — usuário, sessão ou requisição. A atribuição persistente no nível do usuário mantém a experiência coerente e as métricas de usuário interpretáveis.",
    },
    {
      term: "Métrica de guardrail",
      definition:
        "Uma métrica que o experimento não pode prejudicar mesmo que a métrica primária melhore: latência, custo, taxa de recusa, taxa de escalonamento. Tem poder de veto sobre uma vitória. É nomeada por extenso para se manter distinta de um guardrail do Domínio 5, que impõe em vez de medir.",
    },
    {
      term: "Peeking",
      definition:
        "Conferir um experimento repetidas vezes e parar no primeiro resultado significativo. Infla a taxa de falsos positivos muito além do nível nominal, a menos que um desenho sequencial leve isso em conta.",
    },
    {
      term: "Shadow run",
      definition:
        "Executar uma variante em tráfego real descartando sua saída. Fornece dados de latência, custo e divergência com entradas reais a risco zero para o usuário, mas nenhum sinal de preferência.",
    },
    {
      term: "Efeito mínimo detectável",
      definition:
        "A menor mudança que um teste tem poder para distinguir do ruído. É definido a partir do que vale a pena lançar e determina o tamanho da amostra e, portanto, a duração.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Pare o experimento assim que o p-valor cruzar 0,05 para lançar a melhoria mais cedo.",
      why: "A inspeção repetida de dados que se acumulam dá a uma diferença genuinamente nula muitas chances de cruzar o limiar, de modo que a parada antecipada infla a taxa de falsos positivos muito acima do nível nominal.",
      instead:
        "Rode até um tamanho de amostra calculado previamente ou use um desenho sequencial cuja regra de parada leve em conta as olhadas repetidas.",
    },
    {
      id: "t2",
      trap: "Empacote a reescrita do prompt, a troca de modelo e o ajuste da recuperação em um único braço para economizar tempo de teste.",
      why: "Um braço empacotado produz um único número agregado que não pode ser atribuído a nenhum componente, de modo que uma vitória esconde uma regressão dentro dela e uma derrota não dá nenhuma indicação de qual peça reverter.",
      instead:
        "Teste uma variável por vez ou use um desenho fatorial se você realmente precisar das interações.",
    },
    {
      id: "t3",
      trap: "Atribua as variantes por requisição para que a divisão fique perfeitamente equilibrada.",
      why: "A atribuição por requisição expõe a mesma pessoa aos dois comportamentos dentro de uma única sessão, o que produz uma experiência incoerente e transforma toda métrica de resultado no nível do usuário em uma mistura dos dois braços.",
      instead:
        "Faça o hash de um identificador estável de usuário ou de sessão para que a atribuição seja persistente durante todo o experimento.",
    },
    {
      id: "t4",
      trap: "Um ganho estatisticamente significativo na métrica primária é motivo suficiente para lançar.",
      why: "A significância só diz que é improvável que o efeito seja ruído; não diz nada sobre se o efeito é grande o bastante para valer seu custo, nem sobre se uma métrica de guardrail piorou ao mesmo tempo.",
      instead:
        "Exija um tamanho de efeito pré-registrado e métricas de guardrail limpas antes de o resultado contar como vitória.",
    },
    {
      id: "t5",
      trap: "As notas da avaliação offline bastam para decidir um rollout, então o teste A/B pode ser dispensado.",
      why: "Um dataset offline só contém os casos que alguém pensou em incluir, e ele mede a qualidade da saída, e não o que os usuários realmente fazem com ela, que é o resultado que o negócio está comprando.",
      instead:
        "Use a avaliação offline como o filtro que impede variantes ruins de chegarem aos usuários e, depois, meça o resultado online.",
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

  relatedLessons: ["4.2", "4.6"],
} satisfies Lesson;
