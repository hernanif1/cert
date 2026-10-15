import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "7.1",
  slug: "7-1-team-tooling-claude-code",
  domain: 7,
  objective:
    "Configurar ferramentas e ambientes do Claude para equipes (p. ex., Claude Code)",
  title: "Configurando Ferramentas do Claude para Equipes",
  summary:
    "Configurar uma ferramenta agêntica para uma equipe significa decidir o que é compartilhado e versionado, o que permanece pessoal e o que é imposto em vez de apenas solicitado. O Claude Code é o caso de referência: instruções de projeto, permissões, servidores MCP e hooks são as quatro superfícies sobre as quais se espera que um arquiteto saiba raciocinar.",

  body: [
    {
      kind: "prose",
      md: "O Claude Code é a ferramenta agêntica de linha de comando da Anthropic, disponível também dentro de IDEs e na web. Um desenvolvedor sozinho a configura por tentativa e erro e obtém bons resultados. Uma equipe que faz o mesmo acaba com vinte ambientes sutilmente diferentes, o que significa que o mesmo pedido produz comportamentos distintos dependendo de em qual laptop rodou — e ninguém consegue reproduzir o resultado de ninguém.\n\nConfigurar para uma equipe é, portanto, tirar decisões dos ambientes individuais e levá-las para o repositório, onde são revisadas, versionadas e compartilhadas. Quatro superfícies carregam esse peso:",
    },
    {
      kind: "list",
      items: [
        "**Instruções de projeto** — um arquivo de memória versionado no repositório que descreve como *esta* base de código funciona: comandos de build e de teste, convenções, orientação arquitetural, aquilo que um engenheiro novo perguntaria na primeira semana.",
        "**Permissões** — quais operações o agente pode executar sem pedir, e quais sempre param para aprovação humana.",
        "**Servidores MCP** — os sistemas internos que o agente consegue alcançar: issue tracker, documentação, observabilidade, APIs internas.",
        "**Hooks** — scripts que rodam automaticamente em pontos definidos do ciclo de vida do agente, como depois de uma edição de arquivo ou antes de um commit.",
      ],
    },

    { kind: "heading", text: "O que é compartilhado, o que é pessoal" },
    {
      kind: "prose",
      md: "A configuração funciona em camadas. Configurações que descrevem o *projeto* pertencem ao repositório e mudam por pull request; configurações que descrevem uma *máquina ou uma pessoa* ficam locais e fora do controle de versão. Errar essa divisão é a falha mais comum na configuração para equipes — ou todo mundo reinventa as partes compartilhadas, ou caminhos e preferências pessoais são commitados e quebram o ambiente dos outros.",
    },
    {
      kind: "table",
      caption: "As camadas de configuração e quem é dono de cada uma",
      headers: ["Camada", "Onde fica", "O que carrega", "Como muda"],
      rows: [
        [
          "Instruções de projeto",
          "Commitadas no repositório, ao lado do código",
          "Comandos de build e de teste, convenções, notas de arquitetura",
          "Revisão de pull request, como qualquer outro arquivo",
        ],
        [
          "Configurações e permissões compartilhadas",
          "Commitadas junto com o projeto",
          "A allowlist de baseline da equipe e as operações negadas",
          "Revisão de pull request",
        ],
        [
          "Configurações pessoais",
          "Locais e deliberadamente não commitadas",
          "Caminhos da máquina, preferências individuais, sobrescritas pessoais",
          "O próprio indivíduo, sem impacto na equipe",
        ],
        [
          "Servidores MCP",
          "Lista de servidores na configuração do projeto; credenciais por desenvolvedor",
          "Quais sistemas internos o agente consegue alcançar",
          "O time de plataforma define; cada desenvolvedor se autentica como si mesmo",
        ],
        [
          "Hooks",
          "Scripts commitados, vinculados a eventos do ciclo de vida",
          "Formatação, lint, verificações de política que precisam rodar sempre",
          "Revisão de pull request",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Instruções são consultivas; permissões e hooks são imposição. Uma instrução é contexto que o modelo pondera contra todo o resto da janela — a adesão é alta, mas não garantida. Um hook é um script que o harness executa incondicionalmente, e uma regra de permissão é uma barreira que o harness aplica antes de a ação acontecer. Tudo o que precisa ser verdade todas as vezes pertence à segunda categoria.",
    },

    { kind: "heading", text: "Permissões, credenciais e escala" },
    {
      kind: "prose",
      md: "O prompt de aprovação é o controle que impede uma ação irreversível de acontecer sem supervisão, então a allowlist é uma decisão de segurança de verdade, não de ergonomia. Coloque na allowlist as operações somente leitura ou trivialmente reversíveis — rodar testes, ler arquivos, consultar um endpoint de status — e mantenha as operações destrutivas ou de saída parando para um humano. Equipes que reagem à fadiga de prompts liberando tudo removeram a revisão justamente onde o raio de impacto é maior.\n\nAs credenciais de MCP seguem a mesma lógica. A *lista* de servidores é configuração compartilhada; **a autenticação fica por desenvolvedor**, de modo que o agente atua com as permissões que o indivíduo já tem e a trilha de auditoria aponta uma pessoa. Uma conta de serviço compartilhada reduz o acesso de todos à união de todas as permissões e torna a atribuição impossível depois de um incidente.\n\nConforme a adoção cresce, os workflows recorrentes da equipe devem deixar de viver em históricos de chat individuais. Um checklist de release, um procedimento de migração ou uma rubrica de revisão que a equipe executa repetidamente pertence ao repositório como uma Skill ou um comando compartilhado, onde pode ser descoberto, revisado e é idêntico para todos.",
    },

    {
      kind: "example",
      title: "Exemplo prático: padronizando um time de plataforma de doze pessoas",
      scenario:
        "A adoção é entusiasmada e os resultados são extremamente desiguais. Alguns desenvolvedores recebem mudanças que seguem as convenções da casa; outros recebem código que ignora o cliente HTTP interno e reimplementa a lógica de retry. Dois engenheiros conectaram o servidor MCP de observabilidade de produção com um token compartilhado de leitura e escrita. Vários colocaram todos os comandos na allowlist para acabar com os prompts.",
      walkthrough:
        "1. **Escreva as instruções de projeto uma única vez e faça o commit.** Comandos de build e de teste, as bibliotecas internas a preferir, os diretórios que são gerados, as convenções que um revisor acabaria apontando. A deriva de convenções desaparece porque o contexto deixa de ser por desenvolvedor.\n2. **Divida as configurações.** Um baseline commitado carrega a allowlist da equipe; um arquivo local carrega caminhos específicos da máquina e preferências pessoais, e é ignorado pelo controle de versão.\n3. **Restrinja a allowlist deliberadamente.** Testes, builds, formatadores e consultas somente leitura rodam sem prompt. Tudo o que escreve fora da árvore de trabalho, faz push, faz deploy ou gasta dinheiro continua pedindo aprovação.\n4. **Corrija o modelo de credenciais.** A lista de servidores MCP vai para a configuração do projeto; o token compartilhado é revogado e cada desenvolvedor se autentica individualmente, de modo que o acesso corresponde aos direitos que ele já tem e os logs o identificam.\n5. **Torne determinístico o que é inegociável.** Formatação e lint saem de uma linha nas instruções e viram um hook que roda depois de cada edição — agora a regra é executada, em vez de solicitada.\n6. **Capture os workflows repetidos.** O checklist de release e o procedimento de migração viram Skills commitadas, em vez de instruções que alguém cola a partir de uma wiki.",
      takeaway:
        "Cada correção tirou uma decisão do ambiente de um indivíduo e a levou para o repositório, onde ela é revisada e versionada. É isso que torna o comportamento do agente reproduzível em uma equipe, e é isso que a prova quer dizer com configurar ferramentas para equipes.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Adicione às instruções de projeto* aparece como resposta para todo problema de configuração de equipe, e está certa para convenções e orientação. Quando o cenário diz que algo precisa acontecer **todas as vezes** — um formatador, uma verificação de política, uma operação bloqueada — a resposta do gabarito é um hook ou uma regra de permissão, não uma frase em um documento.",
    },

    {
      kind: "practice",
      questionIds: [
        "D7-q101",
        "D7-q102",
        "D7-q103",
        "D7-q104",
        "D7-q105",
        "D7-q106",
        "D7-q107",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Instruções de projeto",
      definition:
        "Um arquivo de memória commitado que dá ao agente contexto durável sobre a base de código — comandos, convenções, arquitetura. Versionado junto com o código que descreve e revisado como código.",
    },
    {
      term: "Allowlist de permissões",
      definition:
        "O conjunto de operações que o agente pode executar sem parar para aprovação. Operações somente leitura e reversíveis entram aqui; as destrutivas e irreversíveis, não.",
    },
    {
      term: "Hook",
      definition:
        "Um script que o harness roda automaticamente em um ponto definido do ciclo de vida. Hooks são determinísticos, o que os torna o lugar certo para tudo o que precisa acontecer em toda execução.",
    },
    {
      term: "Autenticação por desenvolvedor",
      definition:
        "Configurar os servidores MCP compartilhados de modo que cada desenvolvedor se autentique individualmente, preservando o privilégio mínimo e mantendo as trilhas de auditoria atribuíveis a uma pessoa.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Colocar comandos na allowlist de forma ampla é um jeito razoável de parar de interromper os desenvolvedores com prompts de aprovação.",
      why: "O prompt de aprovação é o controle que impede uma ação irreversível de rodar sem supervisão; removê-lo por atacado em nome da conveniência elimina a revisão exatamente onde o raio de impacto é maior.",
      instead:
        "Coloque na allowlist as operações somente leitura e reversíveis, e mantenha as destrutivas, de saída ou custosas parando para um humano.",
    },
    {
      id: "t2",
      trap: "Uma conta de serviço compartilhada para os servidores MCP é mais simples do que configurar autenticação por desenvolvedor.",
      why: "Ela concede a cada desenvolvedor a união de todas as permissões, independentemente dos direitos de cada um, e toda ação no log de auditoria é atribuída à conta, não à pessoa que a iniciou.",
      instead:
        "Compartilhe a configuração dos servidores no repositório e faça cada desenvolvedor se autenticar individualmente.",
    },
    {
      id: "t3",
      trap: "As instruções de projeto pertencem a uma wiki da equipe, onde é mais fácil mantê-las atualizadas.",
      why: "Instruções que não viajam com o repositório nunca são revisadas quando o código que descrevem muda; por isso derivam em silêncio e não podem ser ramificadas nem revertidas junto com o código.",
      instead:
        "Faça o commit delas ao lado do código, para que sejam versionadas, revisadas em pull requests e corretas em cada branch.",
    },
    {
      id: "t4",
      trap: "Tudo o que a equipe precisa fazer sempre pode ser escrito como uma regra nas instruções de projeto.",
      why: "Instruções são contexto consultivo que o modelo pondera contra todo o resto da janela, o que torna a adesão alta, mas nunca certa — e uma verificação que roda na maioria das vezes não é um controle.",
      instead:
        "Expresse o comportamento obrigatório como um hook ou uma regra de permissão, que o harness executa de forma determinística.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 7",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
    {
      label: "Model Context Protocol",
      url: "https://modelcontextprotocol.io",
      kind: "external",
    },
  ],
  relatedLessons: ["3.7", "7.2"],
} satisfies Lesson;
