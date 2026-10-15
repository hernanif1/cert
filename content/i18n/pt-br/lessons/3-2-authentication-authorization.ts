import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.2",
  slug: "3-2-authentication-authorization",
  domain: 3,
  objective:
    "Analisar requisitos de autenticação e autorização para identificar lacunas de segurança",
  title: "Lacunas de Autenticação e Autorização",
  summary:
    "Um agente que chama sistemas reais herda a identidade que você der a ele, e o modelo nunca é quem faz valer as permissões. Este objetivo trata de enxergar a lacuna entre quem pediu e o que a integração está de fato autorizada a fazer.",

  body: [
    {
      kind: "prose",
      md: "Duas perguntas parecem iguais e não são. A **autenticação** pergunta *quem está fazendo esta chamada*. A **autorização** pergunta *este principal tem permissão para fazer isto*. Revisões de integração falham quando um sistema responde à primeira de forma convincente e nunca responde de verdade à segunda.\n\nO problema estrutural nas arquiteturas de agentes é que o modelo fica entre o humano e o backend. As requisições chegam ao seu banco de dados ou à sua API SaaS carregando as credenciais do agente, não as do usuário, a menos que você providencie deliberadamente o contrário. Esse arranjo é o objetivo inteiro.",
    },

    { kind: "heading", text: "O confused deputy" },
    {
      kind: "prose",
      md: "Um agente que detém uma conta de serviço ampla é um *confused deputy* (o “delegado confuso”): tem mais autoridade do que qualquer usuário individual e age com base em instruções que não partiram dele. Peça a ele o registro salarial de outra pessoa e o backend vai atender de bom grado, porque o backend só enxerga a conta de serviço.\n\nA correção é a propagação de identidade. A identidade do usuário precisa chegar ao sistema que faz valer as permissões — via troca de tokens, fluxos on-behalf-of ou credenciais por usuário mantidas pela camada de integração — para que o controle de acesso rode onde sempre rodou: no servidor de recursos.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "**O modelo não é uma fronteira de segurança.** Um system prompt que diz *acesse apenas registros pertencentes ao usuário atual* é um pedido, não um controle. Dá para argumentar contra ele, vencê-lo no raciocínio ou sobrepô-lo com texto injetado em um documento que o agente recupera. Toda decisão de permissão precisa ser imposta por código que o modelo não consegue influenciar — na implementação da tool, no API gateway ou na política de nível de linha do próprio banco de dados.",
    },

    { kind: "heading", text: "Onde as lacunas realmente aparecem" },
    {
      kind: "table",
      caption: "Lacunas comuns de integração e o que as fecha",
      headers: ["Lacuna", "Por que passa na revisão", "Controle que a fecha"],
      rows: [
        [
          "Conta de serviço compartilhada por todos os usuários",
          "A autenticação no backend de fato funciona",
          "Propague a identidade do usuário final; imponha o escopo por usuário no recurso",
        ],
        [
          "Filtrar os resultados depois da recuperação",
          "Nos testes, os usuários só veem as próprias linhas",
          "Filtre antes da recuperação, na consulta ou no índice, para que dados não autorizados nunca sejam carregados",
        ],
        [
          "Chaves de API estáticas e de longa duração na configuração",
          "É simples, e a rotação está no roadmap",
          "Tokens de curta duração, com renovação automática e escopo estreito",
        ],
        [
          "Restrições ao uso de tools no nível do prompt",
          "O agente obedece em todos os testes manuais",
          "Verificações de autorização dentro da implementação da tool",
        ],
        [
          "Logs de auditoria que registram o agente como ator",
          "Os logs existem e parecem completos",
          "Registre o principal humano, a sessão e os argumentos da tool em toda chamada privilegiada",
        ],
        [
          "Um único índice de embeddings para todos os tenants",
          "A busca por similaridade raramente cruza tenants",
          "Índices com escopo por tenant, ou um filtro de tenant obrigatório aplicado no servidor",
        ],
      ],
    },

    { kind: "heading", text: "Prompt injection é um problema de privilégio" },
    {
      kind: "prose",
      md: "Quando um agente lê conteúdo não confiável — um chamado de suporte, uma página web, um PDF, a saída de outro agente —, esse conteúdo pode conter instruções. O agente não consegue distinguir dado de diretiva de forma confiável, então a única mitigação duradoura é limitar o que uma injeção bem-sucedida consegue alcançar. Isso significa escopos mínimos, aprovação humana em ações irreversíveis e restrições de saída (egress) sobre para onde o agente pode enviar dados. A detecção ajuda; a contenção é o que a prova considera gabarito.",
    },

    {
      kind: "example",
      title: "Exemplo prático: um assistente de RH que responde demais",
      scenario:
        "Um assistente de RH permite que os funcionários perguntem sobre a própria remuneração e o próprio saldo de férias e licenças. Ele consulta o HRIS por meio de um servidor MCP configurado com uma única conta de integração, que tem acesso de leitura aos registros de todos os funcionários. O system prompt instrui o modelo a responder apenas sobre o funcionário que fez a pergunta. Há uma revisão de segurança agendada para antes do lançamento.",
      walkthrough:
        "1. **Identifique o principal no recurso.** Toda consulta chega ao HRIS como a conta de integração. O HRIS não faz ideia de qual funcionário perguntou, então não tem como impor nada.\n2. **Teste a fronteira, não o caminho feliz.** Um pedido formulado como tarefa de relatório — *resuma os saldos de férias do time para fins de planejamento* — devolve dados de outros funcionários, porque nada além do prompt estava impedindo isso.\n3. **Propague a identidade.** Troque o token de sessão do usuário por um token downstream com escopo restrito àquele funcionário, para que o HRIS aplique as próprias regras de acesso.\n4. **Restrinja o escopo da credencial.** Mesmo a conta de serviço de fallback deveria ter acesso de leitura apenas aos campos de que o assistente precisa, não ao registro inteiro.\n5. **Corrija a trilha de auditoria.** Registre em log o id do funcionário, a sessão e os argumentos da tool, e não apenas que a conta de integração executou uma consulta.",
      takeaway:
        "O prompt estava fazendo um trabalho de segurança que ele não tem como fazer. Mover a imposição para o HRIS fez o mesmo pedido falhar no servidor de recursos, onde a recusa é determinística.",
    },

    {
      kind: "callout",
      variant: "pitfall",
      md: "Somente leitura não é automaticamente seguro. Um agente com acesso amplo de leitura e qualquer canal de saída — e-mail, um webhook, um comentário em chamado, até uma resposta de chat visível para outras pessoas — pode exfiltrar tudo o que consegue ver. Avalie o escopo de leitura e os caminhos de saída em conjunto.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Em questões de segurança, as alternativas que *apertam o prompt* — adicionar exemplos de recusa, reafirmar a regra, listar formulações proibidas — são escritas para parecer a resposta diligente. Quase nunca são o gabarito. O mesmo vale para *rotacionar a credencial com mais frequência*, que é higiene de verdade, mas mirada na falha errada. A alternativa correta move a decisão para o código: propagação de identidade, um token com escopo restrito ou uma verificação dentro da implementação da tool.",
    },

    {
      kind: "practice",
      questionIds: [
        "D3-q201",
        "D3-q202",
        "D3-q203",
        "D3-q204",
        "D3-q205",
        "D3-q206",
        "D3-q207",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Confused deputy",
      definition:
        "Um componente com mais autoridade do que aqueles que o chamam e que executa ações privilegiadas em nome deles sem verificar se quem chamou tinha direito a elas.",
    },
    {
      term: "Propagação de identidade",
      definition:
        "Levar a identidade do usuário final, através do agente, até o sistema que faz valer as permissões — tipicamente trocando um token de sessão por um token downstream com escopo restrito.",
    },
    {
      term: "Pré-filtragem",
      definition:
        "Aplicar as restrições de autorização na consulta ou no índice antes de os dados serem recuperados, de modo que registros não autorizados nem cheguem a entrar no contexto do modelo.",
    },
    {
      term: "Controle de saída (egress)",
      definition:
        "Restringir para onde um agente pode enviar dados — destinatários, domínios, destinos — para que um acesso amplo de leitura não possa ser convertido em exfiltração.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Um system prompt que proíbe o acesso a dados de outros usuários é um controle de acesso adequado.",
      why: "As instruções no prompt são texto consultivo que o modelo pondera contra todo o resto do contexto, inclusive conteúdo injetado por um atacante, de modo que não conseguem produzir a negação determinística que a autorização exige.",
      instead:
        "Imponha a regra na implementação da tool ou no servidor de recursos, onde o modelo não tem influência alguma sobre o resultado.",
    },
    {
      id: "t2",
      trap: "Como o servidor MCP autentica toda conexão, a integração é segura.",
      why: "A autenticação só estabelece qual cliente está chamando; não diz nada sobre se o usuário atual desse cliente pode executar a ação solicitada sobre o registro solicitado, o que é uma decisão totalmente à parte.",
      instead:
        "Combine a autenticação com uma autorização por requisição que leve em conta a identidade do usuário final e o recurso específico.",
    },
    {
      id: "t3",
      trap: "Recuperar de forma ampla e filtrar as linhas não autorizadas da resposta do modelo protege os dados.",
      why: "Uma vez que o conteúdo não autorizado está na janela de contexto, ele já cruzou a fronteira e pode vazar por paráfrase, por sumarização ou em um turno posterior, independentemente do que o filtro final remova.",
      instead:
        "Aplique o filtro de acesso antes da recuperação, para que os registros restritos nunca sejam carregados.",
    },
    {
      id: "t4",
      trap: "Um agente somente leitura não precisa de contenção adicional porque não consegue alterar nada.",
      why: "A confidencialidade é violada pela leitura, não apenas pela escrita, e qualquer caminho de saída que o agente controle transforma um acesso amplo de leitura em um canal de exfiltração para um atacante capaz de injetar instruções.",
      instead:
        "Restrinja o acesso de leitura ao que a tarefa exige e limite os destinos para os quais o agente pode enviar dados.",
    },
    {
      id: "t5",
      trap: "Os requisitos de auditoria estão atendidos quando toda chamada de tool é registrada em log.",
      why: "Logs que atribuem toda ação à conta de integração compartilhada não conseguem responder quem de fato a solicitou, que é justamente a primeira pergunta de uma investigação de incidente ou de uma auditoria de conformidade.",
      instead:
        "Registre o principal humano, o identificador da sessão e os argumentos junto com a chamada de tool.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 3",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Model Context Protocol — autorização",
      url: "https://modelcontextprotocol.io",
      kind: "external",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],
} satisfies Lesson;
