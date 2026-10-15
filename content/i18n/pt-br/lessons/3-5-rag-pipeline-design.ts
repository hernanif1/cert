import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.5",
  slug: "3-5-rag-pipeline-design",
  domain: 3,
  objective:
    "Projetar um pipeline de RAG com estratégias apropriadas de chunking e indexação",
  title: "Projetando um Pipeline de RAG",
  summary:
    "Um pipeline de RAG são quatro decisões — parsear, dividir em chunks, gerar embeddings, indexar — e a prova testa se você consegue casar cada uma com o formato dos dados de origem. A maioria das falhas de RAG nasce no chunking, não no modelo.",

  body: [
    {
      kind: "prose",
      md: "A geração aumentada por recuperação (RAG) troca *coloque tudo no prompt* por *coloque a coisa certa no prompt*. Essa mudança de enquadramento importa para a prova, porque diz onde olhar quando um sistema de RAG se comporta mal: o modelo geralmente está respondendo com fidelidade a partir do contexto que recebeu, e a pergunta interessante é como esse contexto foi escolhido.\n\nQuatro decisões definem o pipeline, e cada uma pode estar errada de forma independente:",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "**Parsear** — transformar os arquivos de origem em texto limpo preservando a estrutura. Hierarquia de títulos, limites de tabelas e blocos de código são sinal, e um parser que achata tudo isso já jogou fora a informação de que um bom chunker precisa.",
        "**Dividir em chunks** — dividir esse texto em unidades recuperáveis. É aqui que a maioria das falhas se origina.",
        "**Gerar embeddings** — mapear cada chunk para um vetor. O modelo de embedding e o modelo de consulta precisam ser o mesmo; embeddings de modelos diferentes não são comparáveis.",
        "**Indexar** — armazenar os vetores junto com os metadados pelos quais você vai querer filtrar depois, como tipo de documento, data de vigência ou escopo de acesso.",
      ],
    },
    {
      kind: "prose",
      md: "A recuperação então percorre o caminho inverso: gerar o embedding da consulta, buscar no índice, opcionalmente filtrar e aplicar re-ranking, e colocar no prompt os chunks que sobreviveram. Espera-se que um arquiteto justifique cada decisão com base nos dados, não que recite um valor padrão.",
    },

    { kind: "heading", text: "Casando a estratégia de chunking com os dados" },
    {
      kind: "prose",
      md: "Não existe tamanho de chunk universalmente correto. A estratégia certa decorre do formato do material de origem, e a prova recompensa de forma consistente as respostas que raciocinam a partir do formato dos dados, em vez de citar um número.",
    },
    {
      kind: "table",
      caption: "A estratégia de chunking decorre do formato dos dados de origem",
      headers: [
        "Formato dos dados",
        "Estratégia",
        "Tamanho típico",
        "Modo de falha se errar",
      ],
      rows: [
        [
          "Prosa longa, documentos de política",
          "Divisão recursiva por caracteres com overlap",
          "500–1000 tokens, 10–15% de overlap",
          "Respostas truncadas no meio de uma cláusula; uma regra e sua exceção caem em chunks diferentes",
        ],
        [
          "Referência estruturada de API ou de produto",
          "Divisão semântica nos limites das seções",
          "Uma seção por chunk",
          "Parâmetros separados do endpoint a que pertencem",
        ],
        [
          "Dados tabulares, exportações CSV",
          "Grupos de linhas com o cabeçalho repetido em cada chunk",
          "20–50 linhas mais o cabeçalho",
          "Números recuperados sem o significado da coluna que os torna legíveis",
        ],
        [
          "Código-fonte",
          "Divisão sensível à sintaxe, nos limites de função ou classe",
          "Um símbolo por chunk",
          "Corpos de função partidos ao meio; assinaturas órfãs de suas implementações",
        ],
        [
          "Transcrições de chat, tickets",
          "Turnos de conversa agrupados por thread",
          "Uma troca por chunk",
          "Uma pergunta recuperada sem a sua resposta",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "O tamanho do chunk troca **recall** por **suficiência**. Chunks menores produzem embeddings mais nítidos e casam com mais consultas, mas podem não carregar contexto suficiente para responder. Chunks maiores carregam mais contexto, mas diluem o embedding: um único vetor passa a representar vários tópicos, então a similaridade de cosseno cai para cada um deles. O overlap recupera suficiência sem abrir mão do recall.",
    },

    { kind: "heading", text: "Indexação não é só vetores" },
    {
      kind: "prose",
      md: "Um índice vetorial sozinho responde *o que é semanticamente similar*. Sistemas em produção geralmente precisam de mais do que isso.\n\n**Recuperação híbrida** combina similaridade vetorial densa com busca lexical, como BM25. A busca densa lida com paráfrase e sinônimo; a busca lexical lida com os tokens exatos em que embeddings são ruins — códigos de erro, números de peça, nomes próprios, `SKU-44189`. Se os usuários buscam por identificadores, um índice puramente vetorial vai decepcioná-los.\n\n**Filtragem por metadados** estreita o conjunto de candidatos antes mesmo de a similaridade ser calculada. Armazenar datas de vigência, tipos de documento e escopos de acesso junto de cada vetor permite responder *a política vigente* em vez de *uma política*, e permite aplicar a autorização no momento da recuperação, em vez de torcer para que o modelo se recuse.\n\n**Re-ranking** aplica um modelo mais lento e mais preciso aos melhores candidatos depois de uma primeira passada rápida. É a resposta padrão quando o recall está bom mas a precisão está ruim: o chunk certo está sendo recuperado, só não está ficando em primeiro lugar.",
    },

    {
      kind: "example",
      title: "Exemplo prático: uma base de conhecimento de benefícios com 40.000 páginas",
      scenario:
        "Um assistente de RH responde a perguntas de elegibilidade a planos em uma biblioteca de benefícios de 40.000 páginas. Ele acerta nas perguntas gerais e erra com convicção nas específicas — citando a franquia do ano passado, ou uma regra do plano regional errado. A latência está boa e o modelo não mudou.",
      walkthrough:
        "1. **Reproduza e inspecione a recuperação, não o modelo.** Registre em log os chunks efetivamente recuperados para uma consulta que falha. Eles são do assunto certo, mas de anos de plano já substituídos.\n2. **Diagnostique.** O índice guarda todos os anos de plano sem nenhuma forma de distingui-los. Semanticamente, os parágrafos sobre a franquia de 2024 e de 2026 são quase idênticos, então a busca por similaridade escolhe praticamente ao acaso.\n3. **Corrija o índice, não o prompt.** Adicione os metadados `plan_year`, `region` e `document_status`, e filtre por eles antes da similaridade.\n4. **Corrija o chunking.** As tabelas de elegibilidade tinham sido divididas por contagem de caracteres, separando as linhas de seus cabeçalhos. Refaça o chunking delas como grupos de linhas com o cabeçalho repetido.\n5. **Adicione correspondência lexical.** Os usuários buscam por códigos de plano, com os quais embeddings lidam mal. A recuperação híbrida dá conta deles.",
      takeaway:
        "Nada aqui era problema de modelo, e um modelo maior não teria ajudado. A correção estava na recuperação, que é onde a prova espera que você olhe primeiro.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Quando uma resposta de RAG está errada, *usar um modelo maior* e *aumentar a janela de contexto* vão ambos aparecer como opções. Nenhum dos dois resolve uma recuperação que alimenta o modelo com chunks ruins — um modelo maior lendo o documento errado continua respondendo a partir do documento errado. A prova aponta de forma consistente para a opção da camada de recuperação.",
    },

    {
      kind: "practice",
      questionIds: [
        "D3-q501",
        "D3-q502",
        "D3-q503",
        "D3-q504",
        "D3-q505",
        "D3-q506",
        "D3-q507",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Chunking",
      definition:
        "Dividir o texto de origem já parseado nas unidades que são transformadas em embeddings, indexadas e, por fim, recuperadas. A decisão de maior alavancagem em um pipeline de RAG.",
    },
    {
      term: "Overlap",
      definition:
        "Repetir uma parte do chunk anterior no início do seguinte, para que uma afirmação que atravessa um limite sobreviva intacta em pelo menos um chunk. Tipicamente 10–15% do tamanho do chunk.",
    },
    {
      term: "Recuperação híbrida",
      definition:
        "Combinar similaridade vetorial densa com busca lexical, como BM25, para que o sistema lide tanto com paráfrase quanto com identificadores exatos.",
    },
    {
      term: "Re-ranking",
      definition:
        "Pontuar os candidatos top-k de uma primeira recuperação rápida com um modelo mais lento e mais preciso. O remédio padrão quando o recall é adequado mas a precisão é ruim.",
    },
    {
      term: "Filtragem por metadados",
      definition:
        "Restringir o conjunto de candidatos por atributos armazenados — data, tipo, escopo de acesso — antes de a similaridade ser calculada, em vez de filtrar depois.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Chunks maiores são mais seguros porque preservam mais contexto ao redor.",
      why: "Chunks grandes demais diluem o embedding: um único vetor passa a ter de representar vários tópicos distintos, então sua similaridade com qualquer um deles cai e o recall piora de forma generalizada.",
      instead:
        "Dimensione o chunk para uma única ideia coerente e adicione overlap para proteger afirmações que ficam a cavalo de um limite.",
    },
    {
      id: "t2",
      trap: "Um sistema de RAG que devolve respostas convictas mas erradas precisa de um modelo mais capaz.",
      why: "Saída convictamente errada, com latência e versão de modelo inalteradas, aponta para o contexto que o modelo recebeu, não para o raciocínio dele sobre esse contexto. Um modelo maior lendo o chunk errado chega à mesma conclusão errada.",
      instead:
        "Inspecione o que a recuperação de fato devolveu para a consulta que falha antes de mexer no modelo.",
    },
    {
      id: "t3",
      trap: "Um índice vetorial sozinho é suficiente, já que embeddings capturam significado.",
      why: "Embeddings são fracos justamente onde tokens exatos importam — códigos de erro, SKUs, números de peça e nomes próprios — porque esses carregam pouco sinal semântico, e strings quase idênticas geram embeddings quase idênticos.",
      instead:
        "Use recuperação híbrida para que a correspondência lexical cubra os identificadores com os quais a busca densa lida mal.",
    },
    {
      id: "t4",
      trap: "O tamanho do chunk deve ser ajustado para preencher a janela de contexto do modelo.",
      why: "O tamanho da janela de contexto limita quanto você pode passar, mas não diz nada sobre qual divisão torna um chunk significativo e recuperável por si só, que é o que o chunking de fato decide.",
      instead:
        "Derive os limites dos chunks da estrutura dos dados de origem e só depois decida quantos chunks cabem na janela.",
    },
    {
      id: "t5",
      trap: "Refazer os embeddings é desnecessário ao trocar de modelo de embedding, desde que as dimensões coincidam.",
      why: "Vetores só são comparáveis dentro do modelo que os produziu; dois modelos colocam o mesmo texto em coordenadas sem relação entre si, então scores de similaridade entre eles não significam nada, mesmo com dimensionalidade idêntica.",
      instead:
        "Trate uma troca de modelo de embedding como uma reindexação completa do corpus.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 3",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Introducing Contextual Retrieval — Anthropic",
      url: "https://www.anthropic.com/news/contextual-retrieval",
      kind: "anthropic-blog",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],
} satisfies Lesson;
