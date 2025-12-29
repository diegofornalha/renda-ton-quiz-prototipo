export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual é o principal benefício do programa Renda Extra Ton?",
    options: [
      "Desconto em máquinas de cartão",
      "Ganhar comissões indicando novos clientes",
      "Isenção de taxas por 1 ano",
      "Acesso a um cartão de crédito exclusivo"
    ],
    correctAnswer: 1,
    explanation: "O programa Renda Extra Ton permite que você ganhe comissões indicando novos clientes para utilizar as soluções Ton. Quanto mais indicações, maior sua renda!"
  },
  {
    id: 2,
    question: "Quantas indicações são necessárias para atingir o nível Especialista I?",
    options: [
      "5 indicações",
      "10 indicações",
      "15 indicações",
      "20 indicações"
    ],
    correctAnswer: 1,
    explanation: "Para alcançar o nível Especialista I, você precisa realizar 10 indicações válidas. Continue crescendo para desbloquear novos níveis!"
  },
  {
    id: 3,
    question: "Qual das opções NÃO é uma forma de receber os ganhos do Renda Extra?",
    options: [
      "Transferência para conta bancária",
      "Crédito no app Ton",
      "PIX",
      "Cheque nominal"
    ],
    correctAnswer: 3,
    explanation: "O Renda Extra Ton permite recebimento via transferência bancária, crédito no app ou PIX. Cheques não são uma opção de pagamento disponível no programa."
  },
  {
    id: 4,
    question: "O que acontece quando uma indicação sua realiza a primeira venda?",
    options: [
      "Você ganha pontos de fidelidade",
      "Você recebe uma bonificação",
      "Nada acontece inicialmente",
      "Você perde a comissão"
    ],
    correctAnswer: 1,
    explanation: "Quando sua indicação realiza a primeira venda, você recebe uma bonificação! Este é o momento em que sua indicação é validada e você começa a ganhar."
  },
  {
    id: 5,
    question: "Qual é o nível máximo do programa Renda Extra Ton?",
    options: [
      "Especialista III",
      "Mestre",
      "Embaixador",
      "Diamante"
    ],
    correctAnswer: 2,
    explanation: "O nível Embaixador é o mais alto do programa! Nele você tem acesso a benefícios exclusivos e as maiores comissões por indicação."
  },
  {
    id: 6,
    question: "Para manter seu nível ativo, o que você precisa fazer mensalmente?",
    options: [
      "Fazer pelo menos 1 indicação",
      "Manter suas indicações ativas",
      "Pagar uma mensalidade",
      "Realizar um treinamento"
    ],
    correctAnswer: 1,
    explanation: "Para manter seu nível ativo, é importante que suas indicações continuem ativas e processando vendas regularmente."
  },
  {
    id: 7,
    question: "Qual material está disponível para ajudar nas suas indicações?",
    options: [
      "Apenas folhetos impressos",
      "Materiais digitais no app",
      "Somente vídeos no YouTube",
      "Manual físico enviado pelos correios"
    ],
    correctAnswer: 1,
    explanation: "O app Ton disponibiliza materiais digitais como banners, vídeos e textos prontos para você compartilhar e fazer suas indicações de forma mais eficiente!"
  },
  {
    id: 8,
    question: "Quem pode participar do programa Renda Extra Ton?",
    options: [
      "Apenas clientes com mais de 1 ano",
      "Somente vendedores profissionais",
      "Qualquer cliente Ton ativo",
      "Apenas pessoas jurídicas"
    ],
    correctAnswer: 2,
    explanation: "Qualquer cliente Ton ativo pode participar do programa Renda Extra! Basta ter uma conta ativa para começar a indicar e ganhar."
  },
  {
    id: 9,
    question: "O que é necessário para uma indicação ser considerada válida?",
    options: [
      "Apenas cadastro completo",
      "Cadastro + ativação da máquina + primeira venda",
      "Somente a compra da máquina",
      "Indicação de 3 amigos em conjunto"
    ],
    correctAnswer: 1,
    explanation: "Uma indicação só é validada quando o indicado completa o cadastro, ativa sua máquina e realiza a primeira venda. Assim garantimos que é uma indicação real!"
  },
  {
    id: 10,
    question: "Qual é a vantagem exclusiva do nível Embaixador?",
    options: [
      "Taxa zero para sempre",
      "Comissões recorrentes e suporte prioritário",
      "Máquina grátis por mês",
      "Viagem de premiação anual"
    ],
    correctAnswer: 1,
    explanation: "Embaixadores têm direito a comissões recorrentes sobre as vendas dos indicados e acesso a suporte prioritário, além de outras vantagens exclusivas!"
  }
];

export interface QuizLevel {
  name: string;
  emoji: string;
  minScore: number;
  maxScore: number;
  color: string;
  description: string;
}

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
