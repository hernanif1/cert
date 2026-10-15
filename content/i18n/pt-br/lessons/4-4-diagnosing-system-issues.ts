import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "4.4",
  slug: "4-4-diagnosing-system-issues",
  domain: 4,
  objective:
    "Diagnosticar problemas do sistema (falha de prompt, alucinações, modelo inadequado)",
  title: "Diagnosticando Problemas do Sistema",
  summary:
    "\"O modelo está errado\" é sintoma, não diagnóstico. Um arquiteto isola a camada que está falhando — prompt, contexto, modelo ou tool — com um experimento discriminante antes de mudar qualquer coisa, porque cada camada tem uma correção diferente e a correção errada deixa o defeito no lugar.",

  body: [
    {
      kind: "prose",
      md: "Um sistema com LLM falha em camadas, e as camadas produzem sintomas que, vistos de fora, são idênticos: uma resposta fluente, confiante e errada. Diagnosticar é o trabalho de decidir qual camada a produziu. Chutar sai caro, porque toda camada tem um remédio que soa plausível, e aplicar o errado acrescenta complexidade enquanto o defeito sobrevive.\n\nDois hábitos fazem a maior parte do trabalho antes de qualquer teoria ser formulada. **Correlacione com a mudança**: se o sistema estava bem na terça e errado na quarta, o diff entre os dois é o caminho mais curto até a causa — uma reindexação, uma edição de prompt, uma versão de modelo fixada que foi afrouxada, uma mudança de schema em um sistema upstream. **Reproduza por replay**: fixe o snapshot do modelo, a versão do prompt, as definições de tools e o build do índice de recuperação; depois, faça o replay da requisição capturada N vezes e leia o prompt *renderizado*, não o template. Saída idêntica nunca é garantida, mesmo onde existem controles de amostragem, e na família atual de modelos eles nem estão disponíveis, de modo que a unidade de reprodução é uma taxa de falha, e não uma execução isolada. Truncamento, uma variável que resolveu vazia e um resultado de tool que chegou malformado são todos invisíveis no template e óbvios no que foi de fato enviado.",
    },

    { kind: "heading", text: "Lendo a assinatura" },
    {
      kind: "table",
      caption: "Cada classe de falha deixa um padrão distinto ao longo das entradas",
      headers: ["Classe", "Assinatura ao longo do conjunto de avaliação", "Teste discriminante", "Onde mora a correção"],
      rows: [
        [
          "Falha de prompt",
          "A mesma instrução é violada em quase toda entrada, independentemente da dificuldade",
          "Simplifique ou reordene a instrução e rode de novo os mesmos casos",
          "Estrutura do prompt, exemplos, contrato de saída",
        ],
        [
          "Alucinação",
          "Os erros são detalhes específicos fabricados; o resto da resposta é sólido",
          "Verifique se o fato afirmado aparece em algum lugar do contexto fornecido",
          "Fundamentação: citações, um caminho de recusa, uma passada de verificação",
        ],
        [
          "Modelo inadequado",
          "Os erros se concentram nos casos mais complexos e sobrevivem a reescritas do prompt",
          "Mantenha tudo constante e rode um modelo mais capaz",
          "Escolha do modelo, ou decomposição em etapas menores",
        ],
        [
          "Falha de recuperação",
          "As respostas são fiéis ao contexto, mas o contexto é o documento errado",
          "Injete diretamente um contexto sabidamente bom, contornando a recuperação",
          "Chunking, metadados do índice, ranqueamento",
        ],
        [
          "Falha de tool ou de integração",
          "As falhas se agrupam em entradas que acionam uma tool, muitas vezes com argumentos malformados",
          "Faça o replay da chamada da tool isoladamente, contra o schema dela",
          "Descrição da tool, schema, tratamento de erros",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "O teste discriminante é sempre *mudar uma camada e manter o resto fixo*. Trocar o modelo enquanto o prompt e o contexto permanecem idênticos separa modelo inadequado de falha de prompt. Colocar o documento de referência direto no prompt separa falha de recuperação de tudo o que vem depois dela. Sem um teste assim, um diagnóstico é uma preferência.",
    },
    {
      kind: "prose",
      md: "**Alucinação não é uma coisa só.** Um modelo pode afirmar algo ausente de qualquer fonte, contradizer uma fonte que recebeu ou estender demais uma fonte até uma conclusão que ela não sustenta. Só a segunda é detectável comparando a saída com o contexto, e é por isso que verificações de groundedness pegam algumas alucinações e outras não. Os remédios estruturais são os mesmos em cada caso: dê ao modelo um caminho legítimo para declinar, exija que as afirmações citem o trecho que as sustenta e verifique as afirmações de alto risco em uma segunda passada, em vez de torcer para que a primeira seja honesta.\n\n**Modelo inadequado se diagnostica por uma distribuição, não por uma saída ruim.** Se as falhas se espalham de maneira uniforme entre casos fáceis e difíceis, o modelo provavelmente não é a restrição. Se elas se concentram nos casos que exigem várias inferências encadeadas, sobrevivem a três reescritas genuínas do prompt e desaparecem quando o mesmo prompt roda em um modelo mais capaz, a tarefa está pedindo uma capacidade que o modelo escolhido não tem. Decompor a tarefa em etapas menores costuma ser a resposta mais barata para o mesmo achado.",
    },
    {
      kind: "example",
      title: "Exemplo prático: um assistente que inventa números de política",
      scenario:
        "Um assistente interno responde a perguntas sobre benefícios. O suporte relata que, às vezes, ele cita números de documentos de política que não existem. A correção proposta pela equipe é acrescentar \"Não invente informações\" ao system prompt e reenviar qualquer resposta de que um usuário reclame.",
      walkthrough:
        "1. **Reproduza.** Quinze conversas com falha passam por replay dez vezes cada, contra o snapshot, a versão de prompt e o build de índice fixados, usando exatamente os prompts renderizados. Doze fabricam na maioria dos replays, então isto é uma taxa, não um caso isolado.\n2. **Confira o contexto.** Em onze das doze, nenhum número de política aparece em lugar algum do contexto recuperado. O modelo recebeu uma pergunta que seu contexto não podia responder e não tinha nenhuma forma sancionada de dizer isso.\n3. **Descarte modelo inadequado.** Os mesmos doze casos rodam em um modelo mais capaz, com prompt e contexto idênticos. Dez continuam fabricando, então capacidade não é a restrição.\n4. **Corrija a estrutura, não a redação.** O contrato de saída passa a exigir um trecho de suporte citado entre aspas para cada número mencionado, um ramo explícito de sem-resposta é acrescentado e mostrado nos exemplos, e uma pós-verificação barata rejeita qualquer citação cujo número esteja ausente do contexto.\n5. **Trave o ganho.** Os doze casos entram na suíte de regressão.",
      takeaway:
        "Redação e reamostragem controlam variabilidade, não veracidade, e uma instrução para não alucinar não dá ao modelo nenhum mecanismo para cumpri-la. Fabricação sob contexto insuficiente se corrige com estrutura: citações, um caminho de recusa e verificação.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Fique atento a alternativas que empilham instruções no prompt — *diga a ele para ser preciso*, *diga a ele para conferir duas vezes*. Elas são atraentes porque são baratas, e estão erradas sempre que o enunciado mostra que o modelo simplesmente não tinha a informação para responder. Nenhuma redação recupera um fato que nunca chegou à janela de contexto.",
    },

    {
      kind: "practice",
      questionIds: [
        "D4-q401",
        "D4-q402",
        "D4-q403",
        "D4-q404",
        "D4-q405",
        "D4-q406",
        "D4-q407",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Prompt renderizado",
      definition:
        "O texto exato enviado ao modelo depois da aplicação do template, da inserção da recuperação e do truncamento. Depurar a partir do template esconde variáveis vazias e truncamento silencioso.",
    },
    {
      term: "Teste discriminante",
      definition:
        "Um experimento que muda exatamente uma camada e mantém as demais fixas, de modo que seu resultado confirma ou descarta uma hipótese em vez de ser meramente consistente com ela.",
    },
    {
      term: "Modelo inadequado",
      definition:
        "Uma tarefa que exige mais raciocínio ou mais aderência a instruções do que o modelo selecionado oferece. Reconhecido por falhas que se concentram nos casos complexos e persistem ao longo de reescritas do prompt.",
    },
    {
      term: "Caminho de recusa",
      definition:
        "Uma opção explícita e demonstrada para o modelo informar que o contexto não contém a resposta. Sem ela, contexto insuficiente produz fabricação de forma confiável.",
    },
    {
      term: "Correlação com mudanças",
      definition:
        "Ancorar o diagnóstico no que mudou entre um momento sabidamente bom e um sabidamente ruim, antes de raciocinar sobre o mecanismo.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Alucinações são reduzidas acrescentando uma instrução como \"afirme apenas fatos dos quais você tem certeza\".",
      why: "O modelo não tem um sinal interno confiável de certeza sobre o qual agir, e quando a resposta simplesmente está ausente do contexto nenhuma instrução consegue fazê-la surgir, de modo que a redação muda o tom, e não o comportamento.",
      instead:
        "Dê a ele um ramo sancionado de sem-resposta, exija citações de trechos fornecidos e verifique separadamente as afirmações de alto risco.",
    },
    {
      id: "t2",
      trap: "Fixar um parâmetro de amostragem torna reproduzível um caso com falha, então um replay limpo encerra o ticket.",
      why: "Saída idêntica não é garantida nem onde esses controles existem, a família atual de modelos os rejeita de imediato, e um detalhe fabricado que seja a continuação mais provável sob contexto ralo sobreviveria à decodificação gulosa de qualquer forma.",
      instead:
        "Fixe o snapshot do modelo, a versão do prompt, as definições de tools e o build do índice, faça o replay da requisição capturada N vezes e compare as taxas de falha antes e depois de uma correção.",
    },
    {
      id: "t3",
      trap: "Uma resposta errada que um modelo mais forte acerta prova que o modelo original era o problema.",
      why: "Um caso não prova nada sobre a distribuição, e um modelo mais forte pode compensar um prompt mal estruturado ou um contexto ralo, o que mascara uma correção mais barata atrás de uma conta permanentemente mais alta.",
      instead:
        "Compare as taxas de falha entre estratos de dificuldade no conjunto de avaliação completo antes de concluir que o modelo é a restrição.",
    },
    {
      id: "t4",
      trap: "Depurar a partir do template do prompt equivale a depurar a partir do que o modelo recebeu.",
      why: "O template esconde tudo o que acontece na montagem — variáveis que resolvem vazias, chunks recuperados que caem na ordem errada e truncamento no meio do contexto que descarta em silêncio justamente a instrução que está sendo violada.",
      instead:
        "Registre em log e inspecione a requisição totalmente renderizada, incluindo contagens de tokens, para cada caso com falha.",
    },
    {
      id: "t5",
      trap: "Uma saída fundamentada pode ser verificada pedindo ao modelo que avalie a própria confiança na resposta.",
      why: "A confiança autorrelatada tem correlação fraca com a correção e é gerada pelo mesmo processo que produziu o erro, de modo que tende a ser alta justamente nas fabricações fluentes.",
      instead:
        "Verifique contra o texto-fonte com uma checagem separada em vez de pedir ao gerador que avalie a si mesmo.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §8, item de exemplo 3",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["4.2", "3.5"],
} satisfies Lesson;
