import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "6.1",
  slug: "6-1-structured-discovery",
  domain: 6,
  objective: "Conduzir discovery estruturado e levantamento de requisitos",
  title: "Discovery Estruturado",
  summary:
    "O discovery converte a descrição que um stakeholder faz de um trabalho em coisas que você consegue medir: entradas reais, um baseline, alguém que seja dono da definição de correto e uma lista escrita de não-objetivos. A prova testa se você pede evidências em vez de aceitar um requisito tal como foi enunciado.",

  body: [
    {
      kind: "prose",
      md: "Toda decisão posterior se apoia no que o discovery estabeleceu, e um projeto de IA falha de maneiras que o levantamento de requisitos tradicional nunca traz à tona. Um stakeholder pode descrever uma tarefa com fluência e ainda assim ser incapaz de dizer como é uma saída correta — que é justamente aquilo a que um sistema não determinístico precisa ser submetido.\n\nO discovery estruturado produz quatro artefatos, não uma ata de reunião:",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "**Uma amostra representativa de entradas reais.** De vinte a cinquenta casos de verdade, extraídos do processo em produção, incluindo os bagunçados. Descrições do trabalho não são entradas; é na distribuição do material real que mora a viabilidade.",
        "**Uma definição de correto, com um dono.** Alguém precisa ser capaz de arbitrar uma saída contestada. Se dois especialistas rotulam o mesmo caso de formas diferentes, você encontrou uma preferência, não uma especificação.",
        "**Um baseline.** Quanto o processo atual custa, quanto tempo leva e com que frequência erra. Sem isso, nenhuma meta de acurácia pode ser defendida nem contestada.",
        "**Uma lista de não-objetivos.** O que o sistema não vai fazer, registrado por escrito e acordado enquanto todo mundo ainda está calmo.",
      ],
    },

    { kind: "heading", text: "Perguntas que reduzem o risco de um projeto de IA" },
    {
      kind: "table",
      caption: "Cada pergunta compra uma redução de risco específica",
      headers: ["Pergunte", "Que risco reduz", "Falha quando é pulada"],
      rows: [
        [
          "Você pode me mostrar dez casos reais, três dos quais deram errado?",
          "Viabilidade e distribuição das entradas",
          "O design serve ao caso da demo; o tráfego real é mais longo, mais sujo e parte dele está em outro idioma",
        ],
        [
          "Quem decide se uma saída está certa?",
          "Avaliabilidade",
          "Nenhum golden set pode ser construído, então nunca se consegue mostrar que uma mudança é uma melhoria",
        ],
        [
          "Com que frequência o processo erra hoje, e quanto tempo ele leva?",
          "Definição de limiares",
          "Uma meta arbitrária como 99% vira compromisso sem nada com que compará-la",
        ],
        [
          "Quanto custa uma resposta errada, e quem percebe?",
          "Assimetria do custo de erro",
          "Uma resposta errada e confiante chega a um cliente sem nenhum gate de revisão na frente",
        ],
        [
          "Quantas requisições por dia, e qual o tamanho de uma entrada típica?",
          "Envelope de custo e latência",
          "O gasto com tokens e a latência p95 são descobertos em produção, depois de o orçamento ter sido aprovado",
        ],
        [
          "Que dados o modelo pode ver, e onde eles podem ser processados?",
          "Restrições legais e de residência de dados",
          "A recuperação é redesenhada tarde porque uma fonte não pode sair da sua região",
        ],
      ],
    },
    {
      kind: "prose",
      md: "Duas delas merecem ênfase. **O custo de erro raramente é simétrico.** Um sinistro de alta gravidade que passa despercebido e um sinistro rotineiro escalado sem necessidade têm preços absurdamente diferentes, e é a razão entre eles que diz onde cabe um gate de revisão humana. Pergunte quanto a resposta errada custa em dinheiro, tempo ou exposição regulatória, não se a acurácia importa.\n\n**O custo escala com tokens, não com licenças.** Um patrocinador que orça como se fosse uma compra de SaaS pressupõe um preço por usuário por mês. Levante o volume de requisições, o tamanho típico de entrada e de saída e quantos turnos uma tarefa consome, porque um workflow de documentos longos com volume modesto pode gastar mais que um workflow de prompts curtos com dez vezes o tráfego.\n\nHá um teste de viabilidade que vale rodar antes de qualquer trabalho de design: um humano competente conseguiria responder a isso com os dados que o sistema de fato vai conseguir alcançar? Se não, nenhuma escolha de modelo resolve, e a conclusão honesta do discovery é que os dados precisam mudar primeiro.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Stakeholders chegam com uma solução na mão — *queremos um chatbot*, *queremos fine-tuning*. Seu trabalho é recuperar o trabalho que está por trás: que decisão é tomada, por quem, com base em que evidência e com que frequência. Fixe o resultado e deixe o mecanismo em aberto. Um pedido de chatbot geralmente se resolve em desviar uma classe de tickets, o que pode nem precisar de uma interface conversacional.",
    },

    {
      kind: "example",
      title: "Exemplo prático: “resuma nossas ligações com clientes”",
      scenario:
        "Uma diretora de suporte pede um assistente que resuma transcrições de ligações. O requisito declarado é um parágrafo por ligação, e o sucesso é descrito como resumos em que a equipe confie.",
      walkthrough:
        "1. **Peça amostras.** Chegam trinta transcrições. A mediana é de 4.200 palavras, a mais longa tem 31.000 e um quinto delas é bilíngue — o envelope de custo e de contexto agora pode ser conhecido em vez de chutado.\n2. **Pergunte quem lê o resumo, e para decidir o quê.** Os líderes de equipe leem os resumos para escolher quais ligações precisam de uma revisão de coaching. O trabalho real é triagem, não sumarização.\n3. **Reformule a saída.** Um resumo curto mais três campos estruturados — desfecho, risco de escalonamento, sinalização de coaching — atende a essa decisão e pode ser pontuado campo a campo.\n4. **Encontre o dono do ground truth.** Dois líderes discordam sobre o risco de escalonamento em quatro das dez ligações amostradas, então o rótulo precisa ser definido antes que qualquer coisa seja construída.\n5. **Escreva os não-objetivos.** Nenhuma ação de coaching automatizada, nenhuma saída voltada ao cliente, nenhuma transcrição bruta retida por mais de trinta dias.",
      takeaway:
        "O pedido original não era avaliável, porque confiança não tem denominador. O discovery o transformou em três campos com uma regra de rotulagem e um dono, e é isso que torna testável cada decisão de arquitetura posterior.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Opções que abrem o projeto escolhendo um modelo, rascunhando prompts ou agendando uma prova de conceito de duas semanas sempre parecem avanço, e perguntas de discovery parecem lentas ao lado delas. A prova dá como correta a opção que primeiro garante dados reais e uma definição mensurável de sucesso — um protótipo construído sobre critérios não declarados não pode ser comprovado, apenas demonstrado.",
    },

    {
      kind: "practice",
      questionIds: [
        "D6-q101",
        "D6-q102",
        "D6-q103",
        "D6-q104",
        "D6-q105",
        "D6-q106",
        "D6-q107",
        "D6-q108",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Amostra representativa",
      definition:
        "Entradas reais extraídas do processo em produção, incluindo falhas e outliers, usadas para estabelecer viabilidade, distribuição do tamanho das entradas e custo. Diferente dos exemplos selecionados a dedo que um stakeholder oferece por conta própria.",
    },
    {
      term: "Dono do ground truth",
      definition:
        "A pessoa nomeada que arbitra se uma saída contestada está correta. Sem ela, não existe golden set e nenhuma alegação de acurácia pode ser resolvida.",
    },
    {
      term: "Baseline",
      definition:
        "Quão acurado, rápido e caro é o processo atual. O ponto de referência que torna uma meta proposta defensável em vez de arbitrária.",
    },
    {
      term: "Assimetria do custo de erro",
      definition:
        "A diferença de custo para o negócio entre um falso positivo e um falso negativo. Determina onde cabem os gates de revisão humana e os limiares de confiança.",
    },
    {
      term: "Não-objetivo",
      definition:
        "Uma capacidade explicitamente excluída do escopo, acordada por escrito durante o discovery. O controle de escopo mais barato que existe, porque sai de graça antes que alguém tenha investido nela.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "O stakeholder conhece o próprio processo, então a descrição que ele faz da tarefa é um requisito suficiente.",
      why: "Uma descrição fluente de um workflow costuma omitir as exceções, a variedade das entradas e o julgamento tácito que tornam a tarefa difícil, e nada disso fica visível até você ter as entradas reais em mãos.",
      instead:
        "Peça casos reais, incluindo os que deram errado, e derive o requisito do que os dados mostram.",
    },
    {
      id: "t2",
      trap: "Uma prova de conceito rápida com um punhado de exemplos é a forma mais veloz de estabelecer viabilidade.",
      why: "Dez exemplos selecionados a dedo não dizem nada sobre a cauda da distribuição, e uma demo que funciona com eles cria uma expectativa contra a qual o sistema de produção depois terá de lutar, porque ninguém combinou sobre o que o sucesso seria medido.",
      instead:
        "Estabeleça primeiro critérios mensuráveis e uma amostra representativa; só então um protótipo testa algo falseável.",
    },
    {
      id: "t3",
      trap: "Se dois revisores discordam sobre uma saída, um prompt mais claro resolve.",
      why: "Discordância entre revisores significa que falta a definição da tarefa, não que o modelo está confuso; prompt nenhum consegue fornecer uma regra de decisão que a organização nunca chegou a tomar.",
      instead:
        "Arbitre as discordâncias, escreva a regra de rotulagem e só então trate a lacuna como um problema de prompt.",
    },
    {
      id: "t4",
      trap: "O custo pode ser estimado depois que um modelo for escolhido, já que o preço é por token e o volume é um detalhe de engenharia.",
      why: "O gasto é determinado pelo tamanho da entrada, pelo tamanho da saída, pela profundidade da recuperação, pelas novas tentativas e pelos turnos por tarefa, então a estimativa depende muito mais dos fatos de discovery sobre a carga de trabalho do que de qual modelo está por trás.",
      instead:
        "Registre volume, tamanho típico de documento e turnos por tarefa durante o discovery, e modele o gasto por tarefa concluída a partir disso.",
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

  relatedLessons: ["6.3", "6.5"],
} satisfies Lesson;
