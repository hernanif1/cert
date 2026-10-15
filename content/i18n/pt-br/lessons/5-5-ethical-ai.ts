import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "5.5",
  slug: "5-5-ethical-ai",
  domain: 5,
  objective:
    "Tratar considerações de IA ética (viés, equidade, transparência)",
  title: "Considerações de IA Ética",
  summary:
    "Viés, equidade e transparência viram trabalho de engenharia no momento em que você precisa nomear uma métrica, um subgrupo, um limiar e uma divulgação. Este objetivo recompensa compromissos concretos e mensuráveis, e o gabarito nunca está nas declarações de boa intenção.",

  body: [
    {
      kind: "prose",
      md: "Requisitos éticos chegam como adjetivos — justo, sem viés, transparente —, e o trabalho do arquiteto é convertê-los em algo em que um teste possa reprovar. Essa conversão é o objetivo inteiro. Os distratores são as versões que soam responsáveis e não podem ser medidas.",
    },

    { kind: "heading", text: "Por onde o viés entra" },
    {
      kind: "list",
      items: [
        "**Dados de pré-treinamento.** Texto amplo carrega as associações de suas fontes. É o viés que as pessoas mais discutem e o que uma equipe de aplicação controla de forma menos direta.",
        "**Seu corpus e seus exemplos.** Uma base de conhecimento de decisões históricas ensina o sistema a reproduzi-las, inclusive as erradas. Exemplos few-shot tirados de casos passados fazem o mesmo, mais rápido.",
        "**Enquadramento da tarefa.** Perguntar se um candidato *combina com o time* convida a uma resposta diferente de perguntar se ele atende a um requisito listado.",
        "**Variáveis proxy.** Remover um atributo protegido raramente remove o sinal dele: CEP, faculdade, lacunas de emprego, nome, foto e estilo de escrita o carregam. Esta é a resposta errada mais comum da área.",
        "**Ciclos de realimentação.** Quando as saídas viram o corpus de recuperação ou os dados de treinamento de amanhã, qualquer distorção com que o sistema tenha começado é amplificada.",
      ],
    },

    { kind: "heading", text: "Equidade é uma escolha entre definições incompatíveis" },
    {
      kind: "prose",
      md: "Não existe métrica de equidade neutra. As famílias de uso comum fazem promessas diferentes e, fora de casos degenerados, não dá para satisfazê-las ao mesmo tempo.",
    },
    {
      kind: "table",
      caption: "Três critérios de equidade e o que cada um concede",
      headers: ["Critério", "Exige", "Implicação desconfortável"],
      rows: [
        [
          "Paridade demográfica",
          "Taxas de seleção iguais entre os grupos",
          "Ignora se as taxas de qualificação diferem; pode exigir réguas efetivas diferentes",
        ],
        [
          "Igualdade de oportunidade",
          "Taxas de verdadeiros positivos iguais entre os grupos",
          "Permite taxas de seleção desiguais e taxas de falsos positivos desiguais",
        ],
        [
          "Paridade preditiva",
          "Uma dada pontuação significa a mesma coisa em todos os grupos",
          "Convive com taxas de erro desiguais exatamente do jeito que as pessoas contestam",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Quando as taxas-base diferem entre os grupos, satisfazer um critério quebra os outros — isso é um resultado aritmético, não uma deficiência de engenharia. Portanto, a entrega nunca é \"o sistema é justo\". É uma decisão por escrito: **qual critério, quais subgrupos, qual limiar, com o aval de quem, medido com que frequência**. Uma resposta que promete os três critérios está errada na matemática.",
    },

    { kind: "heading", text: "Como medir" },
    {
      kind: "list",
      items: [
        "**Fatie toda avaliação.** A acurácia agregada esconde a falha em subgrupos por construção. Reporte métricas por subgrupo e confira se cada fatia tem itens suficientes para sustentar uma afirmação.",
        "**Teste de forma contrafactual.** Mantenha constante a substância de uma entrada e varie apenas um nome, pronome, faculdade ou dialeto. Uma pontuação que se mexe é um achado direto e reproduzível — e não exige nenhum dado de atributo protegido.",
        "**Faça a triagem de impacto desproporcional.** Em contextos de emprego nos EUA, a regra dos quatro quintos — a taxa de seleção de um grupo abaixo de 80% da taxa do grupo mais selecionado — é uma heurística de triagem antiga, usada pelos órgãos de fiscalização. Não é um porto seguro acima da linha nem uma violação abaixo dela; ela mostra onde olhar.",
        "**Resolva o paradoxo da medição.** Muitas vezes você não pode coletar os atributos de que precisaria para medir equidade. As saídas são a coleta com finalidade limitada e controle de acesso separado, um terceiro confiável que guarda o atributo, ou o teste contrafactual, que contorna a necessidade.",
      ],
    },

    { kind: "heading", text: "Transparência que vale alguma coisa" },
    {
      kind: "prose",
      md: "Transparência significa que as pessoas afetadas conseguem saber o que precisam saber e fazer algo a respeito. Concretamente: divulgue que o interlocutor é um sistema de IA sempre que alguém puder razoavelmente supor o contrário; publique o uso pretendido e as **limitações documentadas**, incluindo as populações e entradas em que o sistema nunca foi avaliado; mantenha um registro de decisão com as entradas, as evidências recuperadas, a versão do modelo e do prompt, o resultado e o humano responsável; e ofereça um caminho para contestar.\n\nUma ressalva de que a prova gosta: **o raciocínio declarado por um modelo não é necessariamente um relato fiel de como ele produziu uma resposta.** Chain-of-thought é texto gerado. É genuinamente útil para depurar e para ajudar um revisor a conferir uma conclusão contra as evidências, e não é uma explicação que você consiga defender como a história causal.",
    },

    {
      kind: "example",
      title: "Exemplo prático: um assistente de triagem de currículos",
      scenario:
        "Uma empresa pontua candidatos em relação a uma descrição de vaga e pré-seleciona os 20% melhores. Para evitar viés, a equipe remove nome, gênero, idade e endereço de cada currículo antes que o modelo o veja. O piloto reporta 91% de concordância com decisões passadas dos recrutadores, o que a equipe apresenta como validação.",
      walkthrough:
        "1. **A métrica de destaque é o problema.** 91% de concordância com os recrutadores históricos significa que o sistema reproduz a seleção histórica, seja lá o que ela continha. Concordância com o passado mede conformismo, não qualidade.\n2. **Remover campos não removeu o sinal.** Universidade, lacunas de emprego, atividades, modo de escrever e sintaxe de quem não é falante nativo se correlacionam com características protegidas, e o modelo lê cada um deles.\n3. **Teste de forma contrafactual.** Duplique 500 currículos variando apenas o nome e a universidade. As pontuações se mexem de forma mensurável — um achado que não exige nenhum dado demográfico e que um regulador consegue acompanhar.\n4. **Escolha um critério.** Com o jurídico e o responsável pela contratação, escolha igualdade de oportunidade na decisão de pré-seleção, defina os subgrupos e faça a triagem de impacto desproporcional nas taxas de seleção a cada trimestre.\n5. **Mude a tarefa.** Pontue em relação a requisitos listados e ligados à vaga, com o trecho de apoio citado do currículo, em vez de uma pontuação holística de adequação. Tarefas estreitas são mais fáceis de justificar e mais fáceis de auditar.\n6. **Mantenha o humano real e o registro completo.** O assistente não pré-seleciona ninguém sozinho; ele apresenta evidências a um recrutador que decide, e toda decisão é registrada com a versão do modelo e do prompt.",
      takeaway:
        "Cada etapa transformou um adjetivo em um artefato: um teste, uma métrica, um limiar, um registro. É isso que a prova quer dizer com tratar considerações éticas.",
    },

    {
      kind: "callout",
      variant: "pitfall",
      md: "*Removemos os atributos protegidos* e *o provedor avaliou o modelo quanto a viés* são as duas respostas mais comuns, e falham pelo mesmo motivo: equidade é uma propriedade de um sistema implantado executando uma tarefa específica para uma população específica, e só medir os resultados desse sistema pode estabelecê-la.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Fique atento a *treinar com dados mais diversos* e *adicionar um filtro de viés à saída*. As duas descrevem um trabalho que outra pessoa faz em um modelo, enquanto a questão pergunta o que você vai medir, em qual população, contra qual critério, e quem dá o aval à escolha.",
    },

    {
      kind: "practice",
      questionIds: [
        "D5-q501",
        "D5-q502",
        "D5-q503",
        "D5-q504",
        "D5-q505",
        "D5-q506",
        "D5-q507",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Variável proxy",
      definition:
        "Um atributo que se correlaciona com uma característica protegida — CEP, faculdade, lacuna de emprego, nome — e leva o sinal dela para um modelo que nunca viu a característica em si.",
    },
    {
      term: "Impacto desproporcional (disparate impact)",
      definition:
        "Um processo de aparência neutra que produz resultados materialmente diferentes entre grupos. Em contextos de emprego nos EUA, a triagem é feita com a regra prática dos quatro quintos.",
    },
    {
      term: "Teste contrafactual",
      definition:
        "Variar apenas um sinal sensível em uma entrada de resto idêntica e medir se a saída muda. Reproduzível, e não exige nenhum dado demográfico.",
    },
    {
      term: "Fidelidade (faithfulness)",
      definition:
        "Se o raciocínio declarado reflete o processo que produziu a resposta. O raciocínio gerado pode ser plausível e construído a posteriori, então não é defensável como explicação de uma decisão.",
    },
    {
      term: "Limitações documentadas",
      definition:
        "Uma declaração publicada sobre em que o sistema foi avaliado, em que não foi e onde não se deve confiar nele. O artefato de transparência mais prático que um arquiteto produz.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Excluir os atributos protegidos da entrada torna o sistema justo.",
      why: "Proxies correlacionados, como CEP, faculdade, lacunas de emprego e estilo de escrita, carregam o mesmo sinal, então a exclusão tira a sua capacidade de medir resultados desiguais e deixa os próprios resultados intactos.",
      instead:
        "Meça os resultados por subgrupo e teste de forma contrafactual; cegar a entrada não faz mal, mas não é evidência de equidade.",
    },
    {
      id: "t2",
      trap: "Um sistema pode ser construído para satisfazer paridade demográfica, igualdade de oportunidade e paridade preditiva simultaneamente.",
      why: "Onde as taxas-base diferem entre os grupos, esses critérios são matematicamente incompatíveis, então um design que promete os três está afirmando algo que a aritmética proíbe, e não algo que a engenharia deixou de entregar.",
      instead:
        "Escolha o critério que se ajusta ao dano que você está prevenindo, registre a escolha e o responsável por ela, e meça-o com periodicidade definida.",
    },
    {
      id: "t3",
      trap: "Mostrar o chain-of-thought do modelo dá aos usuários afetados uma explicação da decisão.",
      why: "O raciocínio gerado não é um trace fiel da computação e pode ser uma narrativa plausível construída a posteriori, então apresentá-lo como o relato causal engana justamente as pessoas que têm direito a um relato verdadeiro.",
      instead:
        "Forneça um registro de decisão — entradas usadas, evidências recuperadas, versões, humano responsável — e um caminho para contestá-la.",
    },
    {
      id: "t4",
      trap: "O model card do provedor reporta baixo viés em benchmarks padrão, então a aplicação é justa.",
      why: "Benchmarks medem um modelo em abstrato, enquanto o dano surge de uma tarefa, um prompt, um corpus de recuperação, um limiar e uma população específicos, e o provedor não avaliou nenhum deles por você.",
      instead:
        "Rode avaliações por subgrupo específicas da tarefa, com seus próprios dados, antes do lançamento e periodicamente depois dele.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 5",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["5.3", "5.4"],
} satisfies Lesson;
