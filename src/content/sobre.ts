// ============================================================================================================
//  TEXTOS DA ABA "SOBRE" (Perfil → Sobre)
//  Para mudar o que aparece na tela, edite SÓ este arquivo. Não é preciso mexer no código da tela (Sobre.tsx).
//
//  Dicas de edição:
//   • **assim** deixa o trecho em negrito.
//   • Parágrafos curtos leem melhor no celular: uma ideia por parágrafo, de 1 a 3 linhas.
//   • Para incluir/remover uma pessoa, adicione/apague uma linha em `equipe` (mantenha a vírgula no fim).
//   • `papel` é opcional. As siglas usadas em `papel` são explicadas em `papeis` (aparece como legenda).
//   • `jogos` de cada grupo usa os nomes internos: "sudoku", "tango", "zip", "patches", "astros".
// ============================================================================================================

export type JogoId = "sudoku" | "zip" | "tango" | "patches" | "astros";

export const SOBRE = {
  /** Aba no Perfil. */
  aba: "Sobre",

  topo: {
    sobretitulo: "Sobre o MindLoop",
    titulo: "Desafie sua mente.",
    texto: "Jogos de lógica e investigações para treinar o raciocínio de um jeito divertido, criados por estudantes em um projeto de extensão universitária.",
    selos: ["Projeto de Extensão I", "Sistemas para Internet", "FAETERJ Barra Mansa"],
  },

  paraQuem: {
    titulo: "Para quem é",
    texto: "Pensado e desenvolvido para apresentar aos estudantes do **3º ano do Ensino Médio**, que estão a um passo da faculdade e das primeiras escolhas profissionais.",
    subtitulo: "O que você exercita jogando",
    habilidades: [
      { icone: "🧠", nome: "Pensamento crítico" },
      { icone: "🔍", nome: "Dedução" },
      { icone: "💡", nome: "Criatividade" },
      { icone: "🧩", nome: "Resolução de problemas" },
    ],
  },

  faculdade: {
    titulo: "Da sala de aula para a tela",
    paragrafos: [
      "Cada fase, personagem e investigação foi criada por alunos de **Sistemas para Internet**, do jeito que se aprende no curso: ideia, planejamento, código e trabalho em equipe.",
      "Ou seja: o MindLoop também é uma amostra do que **você** pode aprender e construir por lá.",
    ],
  },

  orientacao: {
    titulo: "Orientação",
    nome: "Profa. Vivian Rodrigues",
    descricao: "Orientadora do projeto na disciplina de Projeto de Extensão I.",
  },

  equipe: {
    titulo: "Nossa equipe",
    texto: "Duas equipes, cada uma responsável por dois jogos.",
    grupos: [
      {
        nome: "Grupo 1",
        jogos: ["sudoku", "tango"] as JogoId[],
        pessoas: [
          { nome: "Willian de Souza Gomes", papel: "P.O." },
          { nome: "Daniel Gomes", papel: "D.S." },
          { nome: "Eurípedes Teodoro" },
          { nome: "Simone Oliveira" },
          { nome: "Marcos Vinícius Fortunato" },
        ],
      },
      {
        nome: "Grupo 2",
        jogos: ["zip", "patches"] as JogoId[],
        pessoas: [
          { nome: "Gabriel Freitas", papel: "P.O." },
          { nome: "Fernanda Delgado" },
          { nome: "Guilherme Coutinho" },
          { nome: "Gustavo Reis", papel: "D.S." },
        ],
      },
    ],
    /** Cartão de destaque depois dos grupos: o que toda a equipe criou junta. */
    bonus: {
      titulo: "Bônus de toda a equipe",
      texto: "O jogo **Astros** e as **Investigações** não estavam no plano inicial. Surgiram de ideias que apareceram durante o desenvolvimento, com a participação de **todos os integrantes** dos dois grupos.",
    },
    /** Legenda das siglas. Deixe `significado` vazio ("") para mostrar só a sigla. */
    papeis: [
      { sigla: "P.O.", significado: "Product Owner: organiza as prioridades do jogo" },
      { sigla: "D.S.", significado: "Design System: cuida do padrão visual (cores, botões e telas)" },
    ],
  },

  proposito: {
    titulo: "Nosso propósito",
    texto: "Aproximar a faculdade da comunidade. Acreditamos que aprender pode ser divertido e que a tecnologia transforma, por isso queremos te convidar a **pensar, experimentar e criar**, e a descobrir novas possibilidades para o seu futuro.",
    frase: "Sua próxima grande ideia pode começar com um desafio.",
  },

  rodape: "MindLoop · 2026",
};
