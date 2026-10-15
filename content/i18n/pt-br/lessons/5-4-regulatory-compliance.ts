import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "5.4",
  slug: "5-4-regulatory-compliance",
  domain: 5,
  objective:
    "Garantir a conformidade com regulamentações (p. ex., GDPR, HIPAA, FedRAMP)",
  title: "Conformidade Regulatória",
  summary:
    "Um arquiteto não decide se um uso é lícito; um arquiteto garante que o sistema consiga atender aos controles dos quais a licitude depende. Isso significa projetar fronteiras de dados, caminhos de exclusão, minimização e registros de auditoria antes que alguém os peça.",

  body: [
    {
      kind: "prose",
      md: "Estas questões não são provas de direito. Elas testam se você consegue traduzir uma obrigação legal em um controle técnico, e se você sabe qual parte do problema é sua. O jurídico ou o responsável por conformidade decide sobre licitude, condição de controlador e termos contratuais. O arquiteto torna as obrigações resultantes *implementáveis e evidenciadas*: para onde os dados vão, o que é retido, o que pode ser excluído, quem agiu e onde uma pessoa pode intervir.",
    },
    {
      kind: "table",
      caption: "O que cada framework está realmente perguntando",
      headers: ["Framework", "Pergunta central", "Controles que cabem ao arquiteto"],
      rows: [
        [
          "GDPR",
          "Estes dados pessoais são tratados de forma lícita, mínima e transparente?",
          "Armazenamentos com escopo por finalidade, minimização antes do prompt, exclusão que alcança logs e índices, residência de dados, intervenção humana em decisões automatizadas relevantes",
        ],
        [
          "HIPAA",
          "As informações de saúde protegidas são tratadas por partes autorizadas, para finalidades autorizadas, no mínimo necessário?",
          "Um BAA assinado com todo fornecedor que toca em PHI, mascaramento antes do egresso, criptografia, registros de auditoria de quem acessou o quê",
        ],
        [
          "FedRAMP",
          "Todo serviço de nuvem dentro da fronteira de autorização deste sistema está autorizado no nível de impacto correto?",
          "Uma fronteira de autorização desenhada, serviços escolhidos entre ofertas autorizadas, monitoramento contínuo para o ATO da agência",
        ],
      ],
    },

    {
      kind: "callout",
      variant: "key-concept",
      md: "**Projete para o controle; não decida sobre a lei.** Suas entregas são capacidades: um caminho de exclusão que alcança todos os armazenamentos, um diagrama de fronteira, uma etapa de mascaramento, um registro de auditoria, uma pessoa que pode mudar um resultado. Se uma atividade de tratamento é lícita, isso cabe ao jurídico. Se cumprir a regra é sequer *possível*, isso cabe a você.",
    },

    { kind: "heading", text: "GDPR, concretamente" },
    {
      kind: "list",
      items: [
        "**Base legal e limitação de finalidade.** Dados coletados para prestar um serviço não podem ser reaproveitados discretamente para fazer fine-tuning de um modelo; essa é uma nova finalidade, que precisa de base própria. Em termos de arquitetura, os corpora de treinamento e os armazenamentos operacionais precisam ser separáveis e rotulados.",
        "**Minimização de dados.** Envie os campos de que a tarefa precisa. Substituir um nome e um número de conta por um id de caso antes do prompt é uma mudança pequena que tira o registro de toda uma classe de obrigações posteriores.",
        "**Direitos do titular.** Acesso, retificação, eliminação e portabilidade alcançam todo lugar em que os dados pessoais foram parar: logs de prompt, índices vetoriais, caches, datasets de avaliação, backups. Projete o caminho de exclusão quando projetar a ingestão.",
        "**Decisões automatizadas.** O Artigo 22 restringe decisões tomadas exclusivamente por tratamento automatizado com efeitos jurídicos ou de relevância similar; onde são permitidas, o titular tem direito a intervenção humana, a informações sobre a lógica e a um caminho para contestar. Isso significa um registro da decisão, um revisor com autoridade e um canal de recurso.",
        "**Transferências e residência.** Onde a inferência roda é uma decisão de design, não uma nota de rodapé de compras.",
      ],
    },

    { kind: "heading", text: "HIPAA, concretamente" },
    {
      kind: "prose",
      md: "PHI é informação de saúde que identifica um indivíduo, e só deixa de ser PHI segundo um padrão definido: a remoção, pelo método Safe Harbor, das dezoito categorias de identificadores, ou a determinação por especialista. Apagar o nome do paciente não é desidentificação — datas de atendimento, códigos postais (ZIP) e números de prontuário estão nessa lista.\n\nDuas consequências dominam o design. Primeiro, **um fornecedor que trata PHI em seu nome é um business associate e precisa de um BAA assinado antes que qualquer PHI trafegue**, e isso cobre logging e monitoramento tanto quanto a chamada ao modelo. Segundo, o **mínimo necessário**: o prompt leva os campos que a tarefa exige, e não o prontuário inteiro, e a recuperação tem escopo limitado à relação de cuidado.",
    },
    {
      kind: "callout",
      variant: "note",
      md: "Os termos do provedor são fatos a confirmar por escrito para a sua conta, não premissas em torno das quais projetar. A Anthropic assina um BAA para usos elegíveis da Claude API e, por padrão, não treina seus modelos com entradas e saídas da API comercial — mas confirme quais produtos, endpoints e configurações de retenção o seu contrato cobre e, então, projete a fronteira de acordo.",
    },

    { kind: "heading", text: "FedRAMP, concretamente" },
    {
      kind: "prose",
      md: "O FedRAMP autoriza *ofertas de serviço de nuvem*, não aplicações nem modelos. O primeiro artefato do arquiteto é a **fronteira de autorização**: todo componente que armazena, processa ou transmite dados federais, inclusive os que as equipes esquecem — o pipeline de logging, o banco vetorial, o SaaS de observabilidade.\n\nCada componente dentro dela precisa estar autorizado no nível de impacto do sistema ou acima dele (Low, Moderate ou High, mapeados para as baselines da NIST SP 800-53), a agência emite o ATO para o sistema como um todo, e o monitoramento contínuo vem em seguida.",
    },

    {
      kind: "example",
      title: "Exemplo prático: um assistente de autorização prévia em um plano de saúde",
      scenario:
        "Um plano quer um assistente que leia pedidos de autorização prévia, recupere as regras do plano e recomende aprovar, negar ou encaminhar. Os beneficiários estão nos EUA e na UE. A equipe planeja registrar os prompts completos em um SaaS de observabilidade de terceiros e fazer fine-tuning com um ano de casos históricos.",
      walkthrough:
        "1. **Classifique os dados primeiro.** Os pedidos contêm PHI, então todo componente que vê um prompt está no escopo — o que exige um BAA com o fornecedor de observabilidade, não apenas com o provedor do modelo.\n2. **Minimize antes do prompt.** Os identificadores do beneficiário não são necessários para aplicar as regras do plano; substitua-os por um id de caso e mantenha o mapeamento no sistema de registro.\n3. **Divida o logging.** Metadados estruturados podem seguir para o SaaS; os corpos dos prompts ficam em um armazenamento coberto, com retenção curta.\n4. **Questione o fine-tuning.** Os casos foram coletados para decidir sobre solicitações, então treinar com eles é uma finalidade distinta, que precisa de base própria, e, para beneficiários da UE, cria uma obrigação de eliminação que um modelo treinado não consegue cumprir. A recuperação sobre o mesmo corpus evita as duas coisas.\n5. **Projete para o Artigo 22 antes do lançamento.** Uma negativa é uma decisão relevante: o assistente recomenda, um humano identificado decide com o texto da regra recuperada diante de si, e o beneficiário recebe uma explicação e um caminho de recurso.",
      takeaway:
        "Nenhuma dessas etapas é um parecer jurídico. Cada uma é uma decisão de arquitetura que ou torna a resposta dos advogados viável, ou a torna impossível.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Questões de conformidade oferecem, com regularidade, *criptografar tudo* e *o fornecedor é certificado*. As duas são afirmações verdadeiras que não resolvem nada: criptografia é uma salvaguarda entre muitas, e uma autorização ou um BAA se vincula a uma parte identificada, nunca ao seu sistema como um todo.",
    },

    {
      kind: "practice",
      questionIds: [
        "D5-q401",
        "D5-q402",
        "D5-q403",
        "D5-q404",
        "D5-q405",
        "D5-q406",
        "D5-q407",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Business associate agreement (BAA)",
      definition:
        "O contrato que permite a um fornecedor tratar PHI em nome de uma entidade coberta. Exigido antes que a PHI trafegue, e exigido de todo fornecedor no caminho, incluindo logging e monitoramento.",
    },
    {
      term: "Mínimo necessário",
      definition:
        "O princípio da HIPAA segundo o qual um uso ou divulgação leva apenas a PHI que a tarefa exige. Em um sistema de LLM, ele rege o que entra no prompt e o que a recuperação tem escopo para devolver.",
    },
    {
      term: "Fronteira de autorização",
      definition:
        "O conjunto documentado de componentes que armazenam, processam ou transmitem dados federais. Tudo o que está dentro dela precisa estar autorizado no nível de impacto FedRAMP do sistema ou acima dele.",
    },
    {
      term: "Direito à eliminação",
      definition:
        "O direito do titular de ter seus dados pessoais excluídos, que em um sistema de LLM se estende a logs de prompt, índices vetoriais, caches, conjuntos de avaliação e backups, não só ao banco de dados principal.",
    },
    {
      term: "Artigo 22",
      definition:
        "O dispositivo do GDPR que restringe decisões exclusivamente automatizadas com efeitos jurídicos ou de relevância similar, e que exige intervenção humana significativa, informações sobre a lógica e um caminho para contestar.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Criptografar os dados em trânsito e em repouso torna um sistema conforme com a HIPAA.",
      why: "Criptografia é uma salvaguarda técnica entre requisitos administrativos, físicos e técnicos; sem um BAA assinado, escopo de mínimo necessário, controle de acesso e registros de auditoria, o resultado é um sistema criptografado e não conforme.",
      instead:
        "Trate a criptografia como o mínimo para entrar no jogo e trabalhe o conjunto completo de controles, começando por quais partes podem tocar em PHI.",
    },
    {
      id: "t2",
      trap: "Remover nomes e endereços de e-mail anonimiza um registro, então as regras de privacidade deixam de se aplicar.",
      why: "Tanto a desidentificação Safe Harbor quanto a definição de dados pessoais do GDPR abrangem identificadores indiretos — datas, códigos postais, números de dispositivo e de prontuário, combinações raras de atributos — que reidentificam indivíduos com esforço comum.",
      instead:
        "Aplique um padrão definido e trate dados pseudonimizados como ainda dentro do escopo.",
    },
    {
      id: "t3",
      trap: "O provedor do modelo tem uma autorização FedRAMP, então o sistema é conforme com o FedRAMP.",
      why: "O FedRAMP autoriza ofertas individuais de serviço de nuvem em um nível de impacto, enquanto a situação de um sistema depende de todos os serviços dentro da sua fronteira de autorização e de um ATO da agência para o sistema como um todo.",
      instead:
        "Desenhe a fronteira, verifique a autorização de cada componente no nível de impacto exigido e planeje o monitoramento contínuo.",
    },
    {
      id: "t4",
      trap: "Um pedido de eliminação é atendido excluindo as linhas do titular no banco de dados da aplicação.",
      why: "Em um sistema de LLM, os dados pessoais também ficam em logs de prompt e de completion, índices vetoriais, caches, datasets de avaliação e backups, e cada um deles é um caminho de exclusão separado que só existe se alguém o construiu.",
      instead:
        "Construa o caminho de exclusão junto com a ingestão, com uma chave por titular que alcance todos os armazenamentos derivados.",
    },
    {
      id: "t5",
      trap: "O provedor não treina com dados da API, então enviar dados pessoais não levanta nenhuma questão de conformidade.",
      why: "Treinamento é uma finalidade de tratamento entre muitas: transmissão, retenção, acesso, transferência internacional e a ausência de um acordo de tratamento de dados ou de um BAA são obrigações separadas que um compromisso de não treinar não resolve.",
      instead:
        "Confirme retenção, residência e termos contratuais para a sua conta e, de todo modo, minimize o que é enviado.",
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

  relatedLessons: ["5.3", "5.5"],
} satisfies Lesson;
