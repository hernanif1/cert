import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "1.6",
  slug: "1-6-business-value-alignment",
  domain: 1,
  objective:
    "Alinhar soluções aos pilares de valor de negócio (eficiência, transformação, produtividade, custo, SLAs de desempenho)",
  title: "Alinhamento ao Valor de Negócio",
  summary:
    "Cinco pilares de valor — eficiência, transformação, produtividade, custo e SLAs de desempenho — implicam, cada um, uma métrica diferente e uma arquitetura diferente para o mesmo requisito funcional. Nomear o pilar antes de projetar é o que impede um sistema de ser julgado por um número que ele nunca foi construído para mover.",

  body: [
    {
      kind: "prose",
      md: "Dois times podem construir a mesma funcionalidade e discordar sobre se ela deu certo, porque estão medindo pilares diferentes. O trabalho do arquiteto é nomear o pilar primeiro, declarar a métrica que ele implica e deixar essa métrica conduzir o design.\n\nOs pilares não são rótulos intercambiáveis. Eles diferem no que conta como sucesso, em quem aprova e no que a arquitetura tem permissão para sacrificar.",
    },
    {
      kind: "table",
      caption: "Os pilares de valor e o que cada um faz com um design",
      headers: ["Pilar", "Métrica que decide", "Consequência de design"],
      rows: [
        [
          "Eficiência",
          "Custo e tempo de ciclo por unidade de trabalho processada",
          "Remova passos do processo, use batch e paralelize; a automação é o objetivo",
        ],
        [
          "Transformação",
          "Receita nova ou uma capacidade que a organização não tinha antes",
          "Um custo unitário mais alto é aceitável; a comparação é com não fazer nada",
        ],
        [
          "Produtividade",
          "Horas devolvidas por pessoa, produção por cabeça",
          "Mantenha o humano no loop e otimize o handoff; a pessoa continua decidindo",
        ],
        [
          "Custo",
          "Custo total de propriedade, não só o gasto com modelo",
          "Escalone os modelos por tier, use cache agressivamente e inclua revisão humana e retrabalho no total",
        ],
        [
          "SLAs de desempenho",
          "Um compromisso em percentil, disponibilidade, vazão (throughput) sustentada",
          "Projete a cauda: tiers menores no caminho crítico, streaming, fallbacks, recuperação limitada",
        ],
      ],
    },

    { kind: "heading", text: "As distinções que caem na prova" },
    {
      kind: "prose",
      md: "**Eficiência versus produtividade.** A eficiência tira trabalho do processo; a produtividade devolve o trabalho a uma pessoa, que então faz mais com o tempo. Um assistente que rascunha e uma pessoa que aprova é produtividade. Um passo que desaparece do pipeline é eficiência. As duas são medidas de formas diferentes e aprovadas por pessoas diferentes.\n\n**Transformação versus eficiência.** Transformação é fazer algo que a organização simplesmente não conseguia fazer — cotações personalizadas no mesmo dia que ela nunca ofereceu, um serviço em um idioma que ela nunca atendeu. Reformular um caso de transformação como economia de headcount o subestima e prepara o projeto para ser julgado por um número que ele não foi construído para mover.\n\n**Custo significa custo total de propriedade.** O gasto com modelo é uma linha. A infraestrutura de recuperação, as rodadas de avaliação e, acima de tudo, a revisão humana e o retrabalho entram no mesmo total. Uma migração para um tier mais barato que aumenta o volume de revisão pode elevar o custo total enquanto mostra uma redução de 70% na conta do modelo.",
    },

    { kind: "heading", text: "Níveis de serviço dizem respeito à cauda" },
    {
      kind: "prose",
      md: "Um compromisso de desempenho é quase sempre expresso como um percentil — 95% das respostas dentro de um limite — e um percentil nunca é satisfeito por uma média. Projetar para um compromisso de latência significa projetar o caminho lento: fixe o teto do orçamento de recuperação em tempo de design, mantenha as passadas de verificação fora do caminho síncrono, use streaming para que o tempo até o primeiro token seja o que o usuário percebe e defina o que o sistema devolve quando o orçamento é excedido. Um design sem comportamento definido no limite não tem um nível de serviço; tem uma esperança.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "O mesmo requisito funcional rende arquiteturas diferentes sob pilares diferentes. *Resumir tickets de suporte*, construído para eficiência, é um batch noturno em um tier pequeno. Construído para um compromisso de latência, é uma chamada síncrona com streaming e um orçamento de recuperação fixo. Nada mudou na função.",
    },

    {
      kind: "example",
      title: "Exemplo prático: uma funcionalidade, dois pilares",
      scenario:
        "Um banco pede sumarização de tickets. O diretor de operações quer cortar o custo de tratar um ticket. A diretora de experiência do cliente quer que os atendentes abram um ticket e vejam um resumo imediatamente.",
      walkthrough:
        "1. **Nomeie os pilares.** O primeiro pedido é eficiência, medida em custo por ticket. O segundo é um compromisso de desempenho, medido no percentil 95 do tempo até a exibição.\n2. **Projete para a eficiência.** Resuma na ingestão, em batches, em um tier de modelo pequeno, guardando o resultado em cache junto ao ticket.\n3. **Projete para o compromisso.** Se os resumos tivessem de ser gerados quando o ticket é aberto, o design precisaria de um tier menor, de um orçamento de recuperação fixo e de streaming.\n4. **Repare na sobreposição.** Pré-computar na ingestão satisfaz os dois: o batch é barato e a leitura é um acerto de cache.\n5. **Declare a troca.** Um ticket atualizado depois da sumarização exibe um resumo defasado até o próximo batch, o que ambos os diretores aceitam por escrito.",
      takeaway:
        "Os pilares eram conciliáveis aqui, mas só porque foram nomeados separadamente primeiro. Se o time tivesse otimizado apenas o custo, o compromisso de latência teria sido descoberto em produção.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Escolha a opção mais barata* é oferecida o tempo todo neste objetivo e só é a resposta do gabarito quando o enunciado estabelece o custo como o pilar dominante. Quando o enunciado nomeia um nível de serviço, uma meta de transformação ou um alvo de produtividade, o design mais barato é o distrator.",
    },

    {
      kind: "practice",
      questionIds: [
        "D1-q601",
        "D1-q602",
        "D1-q603",
        "D1-q604",
        "D1-q605",
        "D1-q606",
        "D1-q607",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Custo total de propriedade",
      definition:
        "O gasto com modelo somado à infraestrutura de recuperação, às rodadas de avaliação e à revisão humana e ao retrabalho que o design gera. O único número de custo que pode ser comparado entre designs.",
    },
    {
      term: "Transformação",
      definition:
        "Valor criado ao viabilizar um trabalho que a organização simplesmente não conseguia fazer, julgado contra não fazê-lo, e não contra o custo do jeito antigo.",
    },
    {
      term: "Produtividade",
      definition:
        "Valor criado ao devolver horas a pessoas específicas que continuam sendo as tomadoras de decisão, medido por cabeça, e não por unidade de processo.",
    },
    {
      term: "Compromisso em percentil",
      definition:
        "Um nível de serviço expresso em um quantil, como 95% das respostas em até 1,2 segundo, que restringe a cauda lenta, e não a média.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A redução de custo é a justificativa padrão para qualquer sistema baseado no Claude.",
      why: "Iniciativas sob os pilares de transformação e de produtividade se justificam por uma nova capacidade e pelas horas devolvidas, e forçá-las para dentro de um caso de economia subestima o benefício e ainda compromete o time com um número que o design nunca foi construído para mover.",
      instead:
        "Nomeie o pilar que o patrocinador está de fato comprando e depois reporte contra a métrica que esse pilar implica.",
    },
    {
      id: "t2",
      trap: "O custo total de propriedade é dominado pelo gasto com tokens do modelo.",
      why: "Revisão humana, retrabalho, rodadas de avaliação e infraestrutura de recuperação rotineiramente superam o gasto com modelo, e é exatamente por isso que um tier mais barato que reduz a qualidade pode elevar o total mesmo com a conta do modelo caindo bastante.",
      instead:
        "Precifique a revisão e o retrabalho que o design gera junto com os tokens que ele consome.",
    },
    {
      id: "t3",
      trap: "Um compromisso de latência é cumprido quando o tempo médio de resposta fica dentro do limite.",
      why: "Os compromissos são escritos em um percentil justamente porque as médias escondem a cauda, e as requisições que de fato violam um acordo são as lentas, que a média dilui.",
      instead:
        "Meça e projete o percentil nomeado no acordo, incluindo o comportamento no limite.",
    },
    {
      id: "t4",
      trap: "Dar aos analistas um assistente que corta pela metade o tempo de redação é um ganho de eficiência.",
      why: "O trabalho não saiu do processo — uma pessoa ainda revisa e assina cada saída —, então o retorno é medido como horas devolvidas por analista, o que é o pilar de produtividade, e não o de eficiência.",
      instead:
        "Pergunte se um passo saiu do processo ou se uma pessoa ganhou tempo de volta; essa resposta nomeia o pilar.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domínio 1",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["1.1"],
} satisfies Lesson;
