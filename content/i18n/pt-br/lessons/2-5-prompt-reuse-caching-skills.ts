import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "2.5",
  slug: "2-5-prompt-reuse-caching-skills",
  domain: 2,
  objective:
    "Implementar estratégias de reuso de prompts (cache, prompts modulares, Skills)",
  title: "Reuso de Prompts: Cache, Prompts Modulares e Skills",
  summary:
    "Três mecanismos reaproveitam o trabalho de prompt, e eles resolvem problemas diferentes: o cache reaproveita computação entre requisições, os fragmentos modulares reaproveitam texto escrito entre superfícies, e as Skills reaproveitam um procedimento inteiro entre tarefas. A ordem é o fio que os conecta — tudo o que é estável vem antes de tudo o que varia.",

  body: [
    {
      kind: "prose",
      md: "Reuso é onde a engenharia de prompt encontra a operação. Um prompt excelente que é reprocessado do zero em cada uma de dois milhões de requisições diárias é um problema de arquitetura, não de redação.",
    },

    { kind: "heading", text: "Prompt caching: um prefixo estável, reutilizado" },
    {
      kind: "prose",
      md: "O cache opera sobre o **prefixo** de uma requisição. O provedor retém o estado processado de um trecho inicial do prompt e o reutiliza quando uma requisição posterior começa com conteúdo idêntico byte a byte. Disso decorrem duas consequências, e juntas elas explicam a maioria das questões de cache da prova.\n\nPrimeiro, **a ordem é o design inteiro**. O cache casa do início do prompt para a frente e para no primeiro token que difere. Um identificador de sessão, um timestamp ou uma saudação personalizada perto do topo invalida tudo o que vem depois, por maior e mais estável que esse tudo seja.\n\nSegundo, **idêntico quer dizer idêntico**. Reformatar um documento de política, reordenar definições de tools ou regenerar uma lista em outra ordem quebram o casamento, de modo que o conteúdo cacheável deve ser construído de forma determinística e versionado, e não montado na hora.\n\nO cache também tem uma economia própria. Criar uma entrada custa mais do que enviar aqueles tokens normalmente, e lê-la de volta custa muito menos, de modo que o benefício é função da taxa de acerto, e um prefixo grande usado uma única vez é prejuízo líquido. As entradas expiram e normalmente são renovadas pelo uso: tráfego constante mantém o cache aquecido, tráfego esporádico paga o custo de escrita repetidas vezes.",
    },
    {
      kind: "code",
      lang: "text",
      code: `prefixo estável — reutilizado em todas as requisições
  1. system prompt (papel, regras, contrato de saída)
  2. definições de tools
  3. material de referência estático e volumoso
  4. exemplos few-shot
  --- fim do prefixo reutilizável ---
varia a cada requisição — nunca acima desta linha
  5. chunks recuperados para esta consulta
  6. histórico da conversa
  7. a mensagem atual do usuário`,
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "O cache **não** encolhe a requisição. Você continua enviando todos os tokens; o provedor apenas deixa de reprocessar a parte que já viu. O ganho está na latência e no custo cobrado quando há acerto — nunca no tamanho do payload, e nunca em quanto da janela de contexto você consome.",
    },

    { kind: "heading", text: "Prompts modulares e Skills" },
    {
      kind: "prose",
      md: "**Prompts modulares** resolvem um problema diferente: as mesmas regras precisam valer em um assistente web, em um pipeline em batch e em uma ferramenta interna, e hoje elas são três cópias que vão se distanciando. Componha cada prompt a partir de fragmentos nomeados — um bloco de tom compartilhado, um bloco de segurança compartilhado, um bloco de tarefa por superfície — em uma ordem fixa que mantenha os fragmentos invariantes primeiro, para que o prefixo continue cacheável. O custo é o acoplamento: editar um fragmento compartilhado muda todos os consumidores na hora, sem etapa de build que pegue o erro, o que faz dos fragmentos configuração de produção, e não conteúdo.\n\n**Skills** empacotam uma capacidade, e não um parágrafo: instruções para executar um tipo específico de trabalho, reunidas com os arquivos de apoio ou scripts de que esse trabalho precisa. O modelo vê o tempo todo um nome curto e uma descrição, e carrega o corpo completo só quando uma tarefa corresponde. É divulgação progressiva aplicada a instruções — um procedimento arbitrariamente detalhado, disponível sem que se pague por ele nas requisições que não precisam dele, que é precisamente o que um system prompt não consegue fazer.",
    },
    {
      kind: "table",
      caption: "Três mecanismos, três problemas",
      headers: ["Mecanismo", "O que reaproveita", "Melhor quando", "Principal modo de falha"],
      rows: [
        [
          "Prompt caching",
          "Computação já processada sobre um prefixo estável, entre requisições",
          "Um prefixo grande e idêntico em tráfego constante e de alto volume",
          "Qualquer coisa variável colocada acima dele derruba silenciosamente a taxa de acerto a zero",
        ],
        [
          "Fragmentos de prompt modulares",
          "Texto escrito, entre superfícies e times",
          "Várias aplicações precisam compartilhar regras que têm de andar em sincronia",
          "Uma edição de fragmento sem revisão muda todos os consumidores de uma vez",
        ],
        [
          "Skills",
          "Um procedimento inteiro mais seus arquivos de apoio, entre tarefas",
          "Trabalho repetido, de múltiplos passos, com convenções e artefatos próprios",
          "Skills sobrepostas ou descritas de forma vaga são carregadas quando não são relevantes",
        ],
      ],
    },

    {
      kind: "example",
      title: "Exemplo prático: o cabeçalho que custou um quarto de milhão de dólares",
      scenario:
        "Um produto de análise de documentos coloca em cache um prefixo de 30.000 tokens com instruções e políticas, com taxa de acerto reportada acima de 90%. Depois de uma release, o custo por requisição praticamente triplica e o tempo até o primeiro token dobra. As notas da release mencionam uma única mudança de prompt: uma linha no topo do system prompt dizendo \"Data e hora atuais: ...\", adicionada para que o assistente pudesse raciocinar sobre prazos.",
      walkthrough:
        "1. **Verifique a métrica de cache, não o modelo.** A taxa de acerto está perto de zero. Nada mudou no modelo, nos documentos ou no tráfego.\n2. **Encontre o primeiro token que varia.** A linha do timestamp agora é o primeiro conteúdo da requisição, e ela difere a cada chamada, de modo que nenhum token subsequente pode casar com um prefixo armazenado.\n3. **Mova, não remova.** O assistente realmente precisa da hora atual. Ela vai para o fim do prompt, junto da mensagem do usuário, abaixo da fronteira do cache.\n4. **Reduza a resolução.** Precisão de segundos nunca foi necessária. Arredondar para o dia teria deixado a linha estável durante quase um dia inteiro, mesmo no topo — um instinto útil quando um valor precisa ficar no prefixo.\n5. **Proteja.** Um teste agora verifica que o prefixo construído para uma entrada fixa é idêntico byte a byte entre dois builds, de modo que a próxima inserção bem-intencionada falhe no CI, e não na fatura.",
      takeaway:
        "Não havia nada de errado com o conteúdo do prompt, só com o lugar em que uma linha estava. Design de cache é layout de prompt, e um único valor dinâmico acima da fronteira basta para invalidar tudo o que está abaixo dela.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Quando uma questão mencionar cache, fique atento a alternativas que afirmam que ele reduz os tokens enviados, estende a janela de contexto ou se aplica a conteúdo repetido em qualquer ponto do prompt. As três estão erradas pelo mesmo motivo: o cache casa um prefixo e muda o processamento, não o payload.",
    },

    {
      kind: "practice",
      questionIds: [
        "D2-q501",
        "D2-q502",
        "D2-q503",
        "D2-q504",
        "D2-q505",
        "D2-q506",
        "D2-q507",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Prefixo estável",
      definition:
        "O trecho inicial de um prompt que é idêntico byte a byte entre requisições. Tudo o que é cacheável precisa morar aqui, e nada variável pode ser colocado acima dele.",
    },
    {
      term: "Taxa de acerto do cache (cache hit rate)",
      definition:
        "A parcela das requisições que reutiliza um prefixo armazenado. Como criar uma entrada custa mais do que um envio normal, a economia do cache é inteiramente determinada por esse número.",
    },
    {
      term: "Fragmento de prompt",
      definition:
        "Um bloco de texto de prompt nomeado e versionado, composto em vários prompts. Fragmentos compartilhados são configuração de produção e precisam de revisão e avaliação antes de qualquer mudança.",
    },
    {
      term: "Skill",
      definition:
        "Uma capacidade empacotada — instruções mais quaisquer arquivos de apoio — que o modelo descobre pelo nome e pela descrição e carrega por inteiro só quando uma tarefa corresponde a ela.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Prompt caching reduz o número de tokens que você precisa enviar.",
      why: "A requisição completa continua trafegando a cada chamada e continua ocupando a mesma fatia da janela de contexto; o cache muda como o trecho inicial é processado e cobrado quando há acerto, e nada mais.",
      instead:
        "Espere do cache ganho de latência e de custo em prefixos repetidos, e use recuperação ou compactação quando o objetivo for enviar menos.",
    },
    {
      id: "t2",
      trap: "Qualquer conteúdo repetido entre requisições se beneficia do cache.",
      why: "Só pode ser reutilizado um trecho que comece bem no início do prompt e seja idêntico a uma entrada armazenada, de modo que material repetido posicionado depois de conteúdo variável é reprocessado toda vez.",
      instead:
        "Reorganize o prompt para que todo bloco repetido fique contíguo na frente, antes de qualquer coisa específica da requisição.",
    },
    {
      id: "t3",
      trap: "Colocar a pergunta do usuário primeiro fica mais legível, e o documento estático depois dela continua cacheável.",
      why: "O casamento avança a partir do primeiro token e para na primeira diferença, de modo que um segmento inicial variável torna não reutilizáveis todos os tokens que o seguem, por mais estáveis que sejam.",
      instead:
        "Mantenha o layout fixo: system prompt, tools, material estático, exemplos e, por último, o conteúdo variável.",
    },
    {
      id: "t4",
      trap: "Uma Skill é essencialmente um system prompt mais longo com um nome colado.",
      why: "O corpo de uma Skill só é carregado quando sua descrição corresponde à tarefa em questão, de modo que procedimentos detalhados não custam nada em requisições não relacionadas, enquanto cada palavra de um system prompt é paga em toda e qualquer chamada.",
      instead:
        "Mantenha as regras universais no system prompt e empacote os procedimentos específicos de tarefa como Skills que o modelo possa puxar sob demanda.",
    },
    {
      id: "t5",
      trap: "Fragmentos de prompt compartilhados são conteúdo, então podem ser editados sem um processo de release.",
      why: "Toda superfície que compõe um fragmento herda a edição imediatamente, sem nenhuma etapa de build no meio, o que faz de uma mudança não revisada em texto de prompt compartilhado uma mudança simultânea de produção em todo lugar.",
      instead:
        "Versione os fragmentos, revise-os como código e execute a suíte de avaliação de cada superfície consumidora antes do rollout.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 2",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],
  relatedLessons: ["2.4", "3.8"],
} satisfies Lesson;
