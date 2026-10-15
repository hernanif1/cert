import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "1.5",
  slug: "1-5-task-decomposition",
  domain: 1,
  objective: "Aplicar técnicas de decomposição para a resolução de problemas complexos",
  title: "Técnicas de Decomposição",
  summary:
    "Uma costura entre subtarefas justifica o seu custo quando compra uma instrução mais clara, um contexto mais estreito, uma verificação independente ou um tier de modelo mais barato. Costuras que não compram nada disso acrescentam latência e multiplicam o erro, e é por isso que a decomposição excessiva é uma falha tão real quanto a ausência de decomposição.",

  body: [
    {
      kind: "prose",
      md: "A decomposição está por baixo de todos os padrões deste domínio. Um workflow é uma decomposição com o código segurando as costuras; um sistema multiagente é uma decomposição com contextos isolados nas costuras. A pergunta de arquitetura é sempre a mesma — onde você corta, e por que ali?\n\nUma costura se justifica quando compra pelo menos uma de quatro coisas:",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "**Uma instrução mais clara.** A um passo que faz uma coisa só é possível dizer exatamente o que fazer, em um prompt curto o bastante para se raciocinar sobre ele.",
        "**Um contexto mais estreito.** Um passo que precisa de três campos não deveria receber o documento inteiro.",
        "**Uma verificação independente.** Se o artefato que cruza a costura pode ser validado, uma falha é detectada onde aconteceu e atribuída a um único passo.",
        "**Um tier mais barato.** Extração e classificação raramente precisam da capacidade que o raciocínio final exige, e uma costura é o que permite rodá-las em um modelo menor.",
      ],
    },
    {
      kind: "prose",
      md: "Uma costura que não compra nada disso é puro overhead: mais uma chamada, mais uma ida e volta, mais um lugar para errar.",
    },

    { kind: "heading", text: "As técnicas" },
    {
      kind: "table",
      caption: "Técnicas de decomposição e o formato de tarefa a que cada uma se adapta",
      headers: ["Técnica", "Corte ao longo de", "Uso típico"],
      rows: [
        [
          "Encadeamento sequencial",
          "Estágios de um mesmo pipeline",
          "Extrair, depois validar, depois raciocinar, depois escrever",
        ],
        [
          "Map e reduce",
          "Itens independentes",
          "Uma verificação aplicada a milhares de documentos e depois agregada",
        ],
        [
          "Seccionamento",
          "Partes independentes de um único item",
          "Contratos longos divididos por seção e comparados par a par",
        ],
        [
          "Extrair, depois raciocinar",
          "Evidência versus julgamento",
          "Extraia os fatos como dados estruturados e depois raciocine sobre a estrutura",
        ],
        [
          "Gerar, depois criticar",
          "Produção versus avaliação",
          "Rascunhar, pontuar contra uma rubrica, revisar dentro de um teto de iterações",
        ],
        [
          "Roteamento",
          "Classes de entrada",
          "Tipos de requisição que exigem prompts, tools ou políticas diferentes",
        ],
      ],
    },

    { kind: "heading", text: "Quanto custa a decomposição excessiva" },
    {
      kind: "prose",
      md: "Dois custos crescem com o número de passos, e ambos passam fácil despercebidos em uma revisão de design.\n\n**A latência se acumula.** Nove chamadas sequenciais são nove idas e voltas, e nenhum passo pode começar antes de o anterior terminar. Uma cadeia cujos passos individuais são todos rápidos ainda pode estourar um orçamento de dois segundos por larga margem.\n\n**O erro se compõe.** Se seis passos sequenciais têm 95% de acerto cada um e cada um consome a saída do anterior, o resultado de ponta a ponta fica em cerca de 74% — o produto dos termos, não a média deles. É por isso que os pontos de verificação importam mais do que a contagem de passos: uma costura com verificação interrompe a multiplicação, e uma costura sem verificação a prolonga.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Corte onde você consegue verificar. O valor de uma costura é dominado por uma questão: o artefato que a cruza pode ser validado antes de o próximo passo rodar? Costuras escolhidas por capricho — um prompt por conceito — acrescentam multiplicação sem acrescentar detecção.",
    },

    {
      kind: "example",
      title: "Exemplo prático: um assistente de nove passos que ficou mais lento",
      scenario:
        "Um time decompôs um assistente voltado ao cliente em nove chamadas encadeadas, para que cada prompt fosse pequeno e fácil de manter. Cada passo vai bem na avaliação isolada. A latência no percentil 95 é de quatorze segundos, e o abandono de sessões dobrou desde que a mudança entrou em produção.",
      walkthrough:
        "1. **Audite cada costura.** Pergunte o que ela compra. Quatro das nove existem só porque alguém queria um prompt arrumadinho por conceito.\n2. **Procure verificação.** Só três costuras validam alguma coisa. As outras seis são pura multiplicação de erro.\n3. **Procure benefício de tier.** Dois passos — classificação e extração de campos — de fato rodam em um modelo menor. Essas costuras se pagam.\n4. **Funda.** As quatro costuras decorativas são absorvidas pelos passos vizinhos, tirando quatro idas e voltas do caminho.\n5. **Meça de novo.** Cinco chamadas, as mesmas três verificações, as mesmas duas economias de tier, e o percentil 95 abaixo de seis segundos.",
      takeaway:
        "Não havia nada de errado com nenhum passo individual, e é por isso que a avaliação por passo nunca encontrou o problema. O defeito estava no número de costuras, não no que acontecia entre elas.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Quando o enunciado relata alta acurácia por passo e resultados decepcionantes de ponta a ponta, *alguma das avaliações por passo deve estar sendo medida errado* é a armadilha. Passos independentes se multiplicam, então os números normalmente fecham com exatidão. A resposta do gabarito acrescenta verificação nas costuras ou remove costuras, em vez de duvidar da medição.",
    },

    {
      kind: "practice",
      questionIds: [
        "D1-q501",
        "D1-q502",
        "D1-q503",
        "D1-q504",
        "D1-q505",
        "D1-q506",
        "D1-q507",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Costura",
      definition:
        "A fronteira entre duas subtarefas, onde um artefato é passado adiante. O seu valor é definido pelo que ela compra — uma verificação, um contexto mais estreito, um prompt mais claro ou um tier mais barato.",
    },
    {
      term: "Composição de erros",
      definition:
        "A multiplicação das acurácias por passo ao longo de uma cadeia, de modo que seis passos independentes de 95% rendem cerca de 74% de ponta a ponta, a menos que uma costura interrompa o produto com uma verificação.",
    },
    {
      term: "Map e reduce",
      definition:
        "Aplicar a mesma operação de forma independente a muitos itens e depois agregar os resultados em um passo separado. O formato padrão para trabalho de alto volume com itens independentes.",
    },
    {
      term: "Extrair, depois raciocinar",
      definition:
        "Cortar entre a coleta de evidências e o julgamento, de modo que os fatos sejam levados a uma estrutura validada antes de qualquer decisão ser tomada sobre eles.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Decompor mais é, em geral, mais seguro, porque cada passo fica mais fácil para o modelo.",
      why: "Cada passo sequencial extra multiplica mais um termo de acurácia no resultado de ponta a ponta e acrescenta uma ida e volta, então uma cadeia de passos fáceis pode pontuar pior e rodar mais devagar do que um número menor de passos mais difíceis.",
      instead:
        "Acrescente uma costura apenas onde ela compra uma verificação, um contexto mais estreito, uma instrução mais clara ou um tier mais barato.",
    },
    {
      id: "t2",
      trap: "A decomposição é uma técnica que se aplica especificamente a sistemas agênticos.",
      why: "Toda arquitetura deste domínio é uma decomposição — os workflows mantêm as costuras no código e os sistemas multiagente as mantêm nas fronteiras de contexto —, então a pergunta nunca é se decompor, mas onde ficam os cortes.",
      instead:
        "Trate o posicionamento das costuras como uma decisão de design que você toma em qualquer padrão, inclusive em uma única chamada aumentada.",
    },
    {
      id: "t3",
      trap: "Todos os passos de uma cadeia devem usar o mesmo tier de modelo para que o comportamento permaneça consistente.",
      why: "Um dos principais retornos de uma costura é a liberdade de rodar classificação ou extração em um modelo menor, reservando capacidade para o passo que de fato exerce julgamento, e um tier uniforme descarta esse retorno por inteiro.",
      instead:
        "Dimensione cada passo à sua própria dificuldade e deixe que a costura seja o ponto onde o tier muda.",
    },
    {
      id: "t4",
      trap: "Uma cadeia está adequadamente verificada quando cada passo é avaliado isoladamente.",
      why: "As notas por passo não dizem nada sobre como os erros se propagam pelas costuras, e uma cadeia em que todos os passos passam ainda pode falhar de ponta a ponta, porque cada passo consumiu uma entrada ligeiramente errada do anterior.",
      instead:
        "Avalie também de ponta a ponta e valide os artefatos que de fato cruzam as costuras.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 1",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Building Effective Agents — Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],

  relatedLessons: ["1.3", "1.4"],
} satisfies Lesson;
