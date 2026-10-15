import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.6",
  slug: "3-6-retrieval-strategies",
  domain: 3,
  objective:
    "Aplicar estratégias de recuperação adequadas ao formato dos dados e ao padrão de consulta",
  title: "Recuperação Adequada ao Formato dos Dados",
  summary:
    "A busca por similaridade é uma estratégia de recuperação entre várias, e é a errada para agregação, listagem exaustiva e travessia de relacionamentos. Este objetivo trata de escolher o mecanismo que os dados e a pergunta exigem em conjunto — inclusive decidir que a recuperação nem é necessária.",

  body: [
    {
      kind: "prose",
      md: "Projetar um pipeline e escolher uma estratégia são habilidades diferentes. Depois de decidir *que* você vai recuperar, ainda falta decidir *como*, e a resposta depende de duas entradas que precisam ser consideradas juntas: o formato dos dados e o padrão das perguntas feitas sobre eles.\n\nUm corpus de prosa não estruturada consultado de forma conversacional é o caso para o qual a busca vetorial foi criada. Quase todas as outras combinações têm um mecanismo melhor disponível, e a prova recompensa quem reconhece qual.",
    },

    { kind: "heading", text: "A matriz de seleção" },
    {
      kind: "table",
      caption: "Formato dos dados mais padrão de consulta determinam o mecanismo",
      headers: ["Formato dos dados", "Padrão de consulta", "Mecanismo"],
      rows: [
        [
          "Prosa não estruturada",
          "Perguntas conceituais, parafraseadas",
          "Busca vetorial densa",
        ],
        [
          "Identificadores, códigos, símbolos, termos raros",
          "Busca exata de um token conhecido",
          "Busca lexical, ou híbrida onde os dois estilos aparecem",
        ],
        [
          "Linhas em um banco relacional ou data warehouse",
          "Contagens, somas, rankings, comparações no tempo",
          "SQL gerado ou uma API feita para o propósito — não embeddings",
        ],
        [
          "Entidades com relacionamentos tipados",
          "Perguntas multi-hop, de dependência e de impacto",
          "Travessia de grafo, opcionalmente iniciada por uma busca vetorial",
        ],
        [
          "Corpus pequeno que cabe com folga no contexto",
          "Qualquer um",
          "Coloque no prompt e use cache; dispense a recuperação",
        ],
        [
          "Dados voláteis — preços, estoque, status",
          "Estado atual",
          "Chamada de API ao vivo no momento da requisição, nunca um índice reconstruído periodicamente",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "**Similaridade não é agregação.** *Quantos contratos são renovados no Q3* é um problema de contagem sobre um campo conhecido. A busca vetorial devolve as *k* passagens mais parecidas com a pergunta — ela não tem noção de completude, então não consegue avisar que deixou quarenta linhas de fora. Qualquer pergunta que contenha *quantos*, *total*, *todos*, *média* ou *ranking* está pedindo uma operação que um recuperador top-k estruturalmente não consegue executar.",
    },

    { kind: "heading", text: "Padrões de consulta que quebram a recuperação ingênua" },
    {
      kind: "list",
      items: [
        "**Exaustivo.** *Liste todos os fornecedores em um país sancionado.* Exige um filtro sobre o conjunto completo, não os vizinhos mais próximos de uma frase.",
        "**Multi-hop.** *Quais serviços vão quebrar se descontinuarmos a biblioteca de autenticação?* A resposta é uma travessia; nenhuma passagem isolada a contém, e aumentar o *k* recupera mais primeiros saltos em vez de chegar ao segundo.",
        "**Comparativo.** *Em que a política deste ano difere da do ano passado?* Precisa de duas recuperações direcionadas e disjuntas, não de um único conjunto misturado que o modelo tenha de desembaraçar.",
        "**Temporal.** *Qual é a taxa atual?* Precisa de uma restrição de recência ou de uma consulta ao vivo; versões mais antigas e mais novas de um documento são quase idênticas para um modelo de embedding.",
        "**Negação.** *Quais contas não têm contrato ativo?* Ausência não pode ser recuperada. Ela tem de ser calculada a partir de um conjunto completo.",
      ],
    },
    {
      kind: "prose",
      md: "Para os padrões multi-hop e comparativo, o remédio usual é a transformação da consulta, e não um índice diferente: decomponha a pergunta em subperguntas, recupere para cada uma e deixe o modelo compor. Quando uma pergunta atravessa mecanismos — *resuma a linguagem de risco de todos os contratos que vencem neste trimestre* —, encaminhe-a como uma consulta estruturada que seleciona as linhas, seguida de uma recuperação restrita aos documentos que sobreviveram.",
    },

    { kind: "heading", text: "Ajustando os dois controles que importam" },
    {
      kind: "prose",
      md: "**Top-k** é uma troca entre recall e ruído. Aumentá-lo ajuda quando a avaliação mostra que a passagem certa está ficando totalmente de fora; atrapalha quando a passagem certa já é recuperada e agora fica enterrada entre quase duplicatas. Diagnostique qual é o caso antes de mexer no número.\n\n**Filtros** devem ser aplicados antes da similaridade, não depois. Pós-filtrar um resultado top-10 até sobrarem os três documentos que o usuário pode ver pode deixar você com três correspondências fracas quando existiam dez fortes dentro do escopo permitido.",
    },

    {
      kind: "example",
      title: "Exemplo prático: um assistente de vendas que não sabe contar",
      scenario:
        "Um assistente de vendas é fundamentado em um índice vetorial construído a partir de exportações do CRM, um chunk por registro de oportunidade. Ele responde bem a *o que discutimos com a Northwind no último trimestre*. Ele responde a *quantos negócios acima de $50,000 foram fechados em EMEA no último trimestre* com um número convictamente errado e diferente a cada tentativa.",
      walkthrough:
        "1. **Classifique os dois tipos de consulta.** O primeiro é uma busca semântica sobre anotações narrativas. O segundo é uma agregação com dois predicados sobre campos estruturados.\n2. **Reconheça o descompasso estrutural.** O assistente recupera dez chunks, vê um punhado de negócios que se qualificam e conta esses. Havia 312. Nada no pipeline tinha como saber.\n3. **Rejeite as correções tentadoras.** Subir o top-k para 100 chega mais perto sem nunca acertar, e refazer o chunking não muda nada em relação à completude.\n4. **Roteie por intenção.** Perguntas de agregação e de filtro vão para uma consulta SQL gerada contra o data warehouse do CRM; perguntas narrativas vão para o índice vetorial.\n5. **Devolva uma resposta verificável.** O caminho via SQL emite a consulta junto com o número, algo que o design anterior simplesmente não conseguia fazer.",
      takeaway:
        "A falha não era de ajuste fino de parâmetros. Contar exige um conjunto completo, e um recuperador top-k devolve uma amostra ranqueada — então a correção foi um mecanismo diferente para essa classe de consulta, não um índice mais bem configurado.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Aumentar o número de resultados recuperados* é o distrator oferecido com mais frequência neste objetivo. Ele só está correto quando o diagnóstico é uma falha de recall. Quando a pergunta exige completude, uma mudança de ordenação ou uma travessia, mais resultados aproximam a resposta do certo sem nunca torná-la certa — o que é pior, porque parece progresso.",
    },

    {
      kind: "practice",
      questionIds: [
        "D3-q601",
        "D3-q602",
        "D3-q603",
        "D3-q604",
        "D3-q605",
        "D3-q606",
        "D3-q607",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Padrão de consulta",
      definition:
        "A classe de pergunta que os usuários de fato fazem — conceitual, de correspondência exata, agregada, multi-hop, comparativa, temporal —, que restringe o mecanismo de recuperação tanto quanto o formato dos dados.",
    },
    {
      term: "Decomposição da consulta",
      definition:
        "Dividir uma pergunta composta ou multi-hop em subperguntas, recuperar para cada uma de forma independente e compor os resultados. A resposta padrão quando nenhuma passagem isolada contém a resposta.",
    },
    {
      term: "Pré-filtro",
      definition:
        "Restringir o conjunto de candidatos por predicados estruturados antes de a similaridade ser calculada, para que o top-k venha do subconjunto permitido e relevante, em vez de ser aparado depois.",
    },
    {
      term: "Roteamento text-to-SQL",
      definition:
        "Enviar perguntas de agregação, filtro e ranking para uma consulta gerada sobre armazenamento estruturado, em vez de um índice vetorial, produzindo respostas completas e auditáveis.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Qualquer problema de fundamentação pode ser resolvido gerando embeddings dos dados e recuperando-os.",
      why: "Agregação, listagem exaustiva e negação exigem todas um conjunto de resultados completo, e uma busca por similaridade top-k devolve uma amostra ranqueada, sem ter como saber ou informar o que deixou de fora.",
      instead:
        "Roteie perguntas de contagem, filtro e ranking para consultas estruturadas e reserve a busca por similaridade para buscas conceituais sobre prosa.",
    },
    {
      id: "t2",
      trap: "Uma pergunta multi-hop pode ser respondida recuperando um número maior de chunks.",
      why: "Aumentar o top-k alarga o primeiro salto, mas nunca chega ao segundo, porque o fato que faz a ligação está em um documento que não tem nenhuma semelhança textual com a pergunta original.",
      instead:
        "Decomponha a pergunta em recuperações sequenciais, ou percorra um grafo explícito de relacionamentos.",
    },
    {
      id: "t3",
      trap: "Um manual interno pequeno ainda assim deve passar por um pipeline de recuperação, por consistência.",
      why: "Um corpus que cabe com folga na janela de contexto pode simplesmente ser incluído e colocado em cache, e forçá-lo a passar pela recuperação acrescenta erros de limite de chunk, erros de ranking e sobrecarga operacional em troca de nada.",
      instead:
        "Carregue corpora pequenos e estáveis diretamente no contexto e use recuperação quando o corpus realmente exceder o que você consegue passar.",
    },
    {
      id: "t4",
      trap: "Filtros de acesso e de recência podem ser aplicados aos resultados recuperados depois da busca.",
      why: "A pós-filtragem encolhe uma lista já ranqueada, então uma consulta pode devolver três passagens fracas que sobreviveram ao filtro enquanto dez fortes e permitidas nem chegaram a ser pontuadas.",
      instead:
        "Aplique os predicados estruturados antes da similaridade, para que o ranking seja calculado sobre o subconjunto elegível.",
    },
    {
      id: "t5",
      trap: "Dados operacionais que mudam com frequência devem ser reindexados de forma agendada para que o agente possa recuperá-los.",
      why: "Qualquer índice de estado volátil fica defasado entre as reconstruções, e o agente não tem nenhum sinal que indique a idade do valor recuperado, então informa números desatualizados com total confiança.",
      instead:
        "Leia o estado volátil por meio de uma chamada de API ao vivo no momento da requisição e reserve a indexação para conteúdo durável.",
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
  relatedLessons: ["3.5"],
} satisfies Lesson;
