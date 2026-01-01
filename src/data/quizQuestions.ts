import type { QuizQuestion, QuizLevel } from "@/types/quiz";

export type { QuizQuestion, QuizLevel };

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual é a idade mínima para participar do programa Renda Extra?",
    options: [
      "16 anos",
      "18 anos",
      "21 anos",
      "25 anos"
    ],
    correctAnswer: 1,
    explanation: "Conforme item 3.1 do Regulamento Renda Extra, pode participar qualquer pessoa física capaz, na forma da legislação civil, com idade igual ou superior a 18 (dezoito) anos."
  },
  {
    id: 2,
    question: "Quando ocorre o pagamento da recompensa no Renda Extra?",
    options: [
      "No mesmo dia da validação da indicação",
      "Até o dia 5 do mês subsequente",
      "Até o dia 10 do mês subsequente à indicação",
      "Até o dia 15 do mês subsequente"
    ],
    correctAnswer: 2,
    explanation: "Conforme item 5.5 do Regulamento, o pagamento ocorrerá até o dia 10 (dez) do mês subsequente à indicação, desde que a validação pelo Pagar.me ocorra no mesmo mês da indicação."
  },
  {
    id: 3,
    question: "Qual é o número MÍNIMO de indicações válidas necessárias para participar do Renda Ton?",
    options: [
      "1 indicação válida por mês",
      "3 indicações válidas por mês",
      "5 indicações válidas por mês",
      "10 indicações válidas por mês"
    ],
    correctAnswer: 1,
    explanation: "Conforme item 3.1 do Regulamento Renda Ton, o Usuário participante do Renda Extra que realizar, no mínimo, 3 (três) indicações válidas no período de um mês poderá, a critério exclusivo do Pagar.me, participar do Renda Ton."
  },
  {
    id: 4,
    question: "No programa 'Indique um Parceiro', por quanto tempo o Usuário recebe comissão sobre o desempenho do Parceiro Indicado?",
    options: [
      "90 dias",
      "120 dias",
      "180 dias",
      "365 dias"
    ],
    correctAnswer: 2,
    explanation: "Conforme item 7.4 do Regulamento, o Usuário receberá uma porcentagem sobre o desempenho do Parceiro Indicado no Renda Extra, dentro do período de 180 (cento e oitenta) dias contados da finalização do cadastro do Parceiro Indicado."
  },
  {
    id: 5,
    question: "O Usuário pode realizar autoindicação no Renda Extra?",
    options: [
      "Sim, desde que use CPF/CNPJ diferente",
      "Sim, mas apenas uma vez por mês",
      "Não, o Usuário não poderá realizar autoindicação",
      "Sim, se for para pessoa jurídica e ele for pessoa física"
    ],
    correctAnswer: 2,
    explanation: "Conforme item 5.2.d do Regulamento Renda Extra, o Usuário não poderá realizar autoindicação. Esta é uma regra clara para evitar fraudes e garantir que as indicações sejam genuínas."
  },
  {
    id: 6,
    question: "No programa Ton na Mão, em quanto tempo o Usuário deve realizar a entrega do Equipamento ao Novo Cliente após a conclusão da contratação?",
    options: [
      "No mesmo dia",
      "Até às 18:00 do dia útil seguinte",
      "Em até 3 dias úteis",
      "Em até 5 dias corridos"
    ],
    correctAnswer: 1,
    explanation: "Conforme item 4.2 do Regulamento Ton na Mão, o Usuário deve realizar a entrega até as 18:00 (dezoito horas) do dia útil seguinte à conclusão da contratação, devendo também registrar no sistema Workfinity."
  },
  {
    id: 7,
    question: "Qual é o valor da Comissão Adicional na Campanha ChaveTON para cada indicação válida com cadastro de Chave Pix Principal?",
    options: [
      "R$ 3,00",
      "R$ 5,00",
      "R$ 10,00",
      "R$ 15,00"
    ],
    correctAnswer: 1,
    explanation: "Conforme item 1.2 do Regulamento Campanha ChaveTON, a cada indicação bem-sucedida com cadastro de Chave Pix Principal, o Usuário terá direito a uma comissão adicional de R$ 5,00 (cinco reais)."
  },
  {
    id: 8,
    question: "Quantos dias o Novo Cliente tem para cadastrar a Chave Pix Principal após a aprovação da Conta Ton para que a indicação seja válida na Campanha ChaveTON?",
    options: [
      "1 dia corrido",
      "2 dias corridos",
      "3 dias corridos",
      "5 dias corridos"
    ],
    correctAnswer: 2,
    explanation: "Conforme item 3.1.III do Regulamento Campanha ChaveTON, o Novo Cliente deve cadastrar a Chave Pix Principal em até 3 (três) dias corridos contados a partir da data de aprovação da Conta Ton."
  },
  {
    id: 9,
    question: "No Programa Pronta Entrega, o que acontece se o Usuário não entregar o Equipamento ao Novo Cliente no prazo estabelecido?",
    options: [
      "Apenas recebe advertência por e-mail",
      "Está sujeito a penalidades, incluindo proibição de compra de novos Equipamentos",
      "Perde apenas a recompensa daquela indicação",
      "Nada acontece, é apenas uma recomendação"
    ],
    correctAnswer: 1,
    explanation: "Conforme item 4.2.1 do Regulamento Pronta Entrega, o Usuário estará sujeito a eventuais penalidades, incluindo, mas não se limitando à proibição de compra de novos Equipamentos por prazo determinado pelo TON."
  },
  {
    id: 10,
    question: "Para obter o Selo Ton no programa Ponto Físico, qual é um dos requisitos obrigatórios?",
    options: [
      "Ter pelo menos 100 indicações por mês",
      "Pagar uma taxa anual de certificação",
      "O ponto físico deve ser exclusivo do Ton, sem produtos de concorrentes",
      "Ter no mínimo 2 anos de participação no Renda Extra"
    ],
    correctAnswer: 2,
    explanation: "Conforme itens 2.3 e 2.6.g do Regulamento Ponto Ton, o Selo é disponibilizado apenas para pontos exclusivos do Ton, que não oferecem outro tipo de produto nem produtos ou maquininhas de concorrentes."
  }
];

export const quizLevels: QuizLevel[] = [
  {
    name: "Iniciante",
    emoji: "🌱",
    minScore: 0,
    maxScore: 3,
    color: "bg-secondary",
    description: "Você está começando sua jornada! Continue estudando para evoluir."
  },
  {
    name: "Especialista I",
    emoji: "📚",
    minScore: 4,
    maxScore: 5,
    color: "bg-primary/70",
    description: "Bom progresso! Você já entende o básico do programa."
  },
  {
    name: "Especialista II",
    emoji: "⭐",
    minScore: 6,
    maxScore: 7,
    color: "bg-primary/85",
    description: "Excelente! Seu conhecimento está se consolidando."
  },
  {
    name: "Especialista III",
    emoji: "🌟",
    minScore: 8,
    maxScore: 9,
    color: "bg-primary",
    description: "Impressionante! Você domina quase tudo sobre o Renda Extra."
  },
  {
    name: "Embaixador",
    emoji: "🏆",
    minScore: 10,
    maxScore: 10,
    color: "bg-accent",
    description: "Perfeito! Você é um verdadeiro especialista no Renda Extra Ton!"
  }
];

export const getLevelByScore = (score: number): QuizLevel => {
  return quizLevels.find(level => score >= level.minScore && score <= level.maxScore) || quizLevels[0];
};
