# 🏆 Renda Extra Ton - Quiz Interativo

Plataforma de quiz educativo estilo chat para avaliar conhecimento sobre o programa "Renda Extra Ton". Sistema interativo com níveis de dificuldade progressivos, timer configurável, resultados em tempo real e painel administrativo completo.

## ✨ Funcionalidades

### Quiz Interativo
- 💬 Interface estilo chat (WhatsApp/Telegram) com efeitos de digitação
- ⏱️ Timer de 30 segundos por questão (configurável)
- 📊 Sistema de pontuação em tempo real
- 🎯 Perguntas com 4 alternativas (A, B, C, D)
- 📈 Níveis de dificuldade progressivos (Fácil → Média → Difícil)
- 🎬 Vídeo de apresentação na tela inicial
- 🏅 Sistema de níveis: Iniciante → Especialista I/II/III → Embaixador
- ✉️ Validação de email para salvar resultados
- 📱 Totalmente responsivo

### Painel Administrativo
- 📊 Dashboard com estatísticas gerais
- 👥 Lista completa de participantes
- 🔍 Busca e filtros avançados
- 📜 Histórico individual de cada participante
- ⚙️ Controle do timer (liga/desliga + ajuste de tempo)
- 🎲 Controle de quantidade de perguntas por dificuldade
- 📝 Visualização do gabarito completo
- 📈 Análise de desempenho por questão

### Páginas Adicionais
- 📖 **Regulamento** - Informações sobre o programa
- 🌟 **Embaixadores** - Lista de embaixadores do programa
- 👤 **Participantes** - Visualização pública dos resultados
- ✅ **Gabarito** - Análise detalhada das questões

## 🚀 Tecnologias

### Frontend
- **React** 18.3.1 - Biblioteca UI
- **TypeScript** 5.8.3 - Tipagem estática
- **Vite** 5.4.19 - Build tool ultrarrápido
- **React Router** 6.30.1 - Roteamento SPA
- **TanStack Query** 5.83.0 - Gerenciamento de estado assíncrono

### UI/UX
- **Tailwind CSS** 3.4.17 - Estilização utilitária
- **shadcn/ui** - 51 componentes reutilizáveis
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones modernos
- **Sonner** - Notificações toast

### Backend/Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security** - Segurança em nível de linha

### Formulários e Validação
- **React Hook Form** 7.61.1 - Gerenciamento de formulários
- **Zod** 3.25.76 - Validação de schemas

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ (recomendado usar [nvm](https://github.com/nvm-sh/nvm))
- npm ou yarn
- Conta no [Supabase](https://supabase.com)

### Passo a passo

1. **Clone o repositório**
```bash
git clone <URL_DO_REPOSITORIO>
cd renda-ton-quiz-prototipo
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

4. **Execute as migrations do banco de dados**

No seu projeto Supabase, execute os arquivos SQL em `supabase/migrations/` na ordem cronológica.

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`

## 🗂️ Estrutura do Projeto

```
src/
├── pages/                    # Páginas da aplicação
│   ├── Index.tsx            # Quiz principal
│   ├── Admin.tsx            # Painel administrativo
│   ├── Gabarito.tsx         # Visualização do gabarito
│   ├── Participantes.tsx    # Lista de participantes
│   ├── Embaixadores.tsx     # Embaixadores do programa
│   ├── Regulamento.tsx      # Regulamento do programa
│   └── NotFound.tsx         # Página 404
│
├── components/
│   ├── ui/                  # 51 componentes shadcn/ui
│   ├── chat/                # Componentes do quiz chat
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatHeader.tsx
│   │   ├── QuizOptions.tsx
│   │   └── TypingIndicator.tsx
│   ├── admin/               # Componentes administrativos
│   └── ChatQuiz.tsx         # Container principal do quiz
│
├── hooks/                   # Custom React hooks
│   ├── useQuiz.ts          # Hook principal (530+ linhas)
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── integrations/supabase/
│   ├── client.ts           # Cliente Supabase
│   └── types.ts            # Tipos gerados automaticamente
│
├── types/
│   └── quiz.ts             # Definições de tipos do quiz
│
└── lib/
    └── utils.ts            # Funções utilitárias

supabase/
└── migrations/             # Migrations do banco de dados (SQL)
```

## 🗄️ Schema do Banco de Dados

### quiz_questions
Armazena as perguntas do quiz
- `id` - UUID (PK)
- `numero` - Número da questão
- `texto` - Texto da pergunta
- `alternativas` - JSONB com as 4 alternativas
- `dificuldade` - 'fácil', 'média' ou 'difícil'
- `topico` - Tópico da questão
- `regulamento_ref` - Referência ao regulamento

### quiz_levels
Define os níveis de classificação
- `id` - UUID (PK)
- `name` - Nome do nível (Iniciante, Especialista, Embaixador)
- `emoji` - Emoji representativo
- `min_score` / `max_score` - Pontuação necessária
- `color` - Cor do badge
- `description` - Descrição do nível

### quiz_results
Histórico de participações
- `id` - UUID (PK)
- `participant_email` - Email do participante
- `participant_name` - Nome do participante
- `score` - Pontuação obtida
- `total_questions` - Total de questões
- `answers` - JSONB com array de respostas
- `level` - Nível alcançado
- `completed_at` - Data/hora de conclusão

### quiz_settings
Configurações dinâmicas
- `id` - UUID (PK)
- `key` - Chave da configuração
- `value` - JSONB com o valor

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (porta 8080)

# Build
npm run build        # Build de produção otimizado
npm run build:dev    # Build em modo development
npm run preview      # Preview da build local

# Code Quality
npm run lint         # Executa ESLint
```

## 🎨 Customização

### Alterar Timer Padrão
Em `src/hooks/useQuiz.ts`:
```typescript
const DEFAULT_QUESTION_TIME_LIMIT = 30; // Altere para o valor desejado (em segundos)
```

### Alterar Cores do Tema
Em `src/index.css`, ajuste as variáveis CSS:
```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  /* ... outras cores */
}
```

### Configurar Email Regex
Em `src/hooks/useQuiz.ts`:
```typescript
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```

## 🚀 Deploy


### Deploy Manual
O projeto pode ser hospedado em qualquer serviço que suporte aplicações React:
- **Vercel** (recomendado)
- **Netlify**
- **Cloudflare Pages**
- **GitHub Pages**

**Lembre-se de configurar as variáveis de ambiente no serviço de deploy!**

## 🔐 Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrations em `supabase/migrations/`
3. Configure Row Level Security (RLS) policies:
   - Leitura pública para `quiz_questions` e `quiz_levels`
   - Insert público para `quiz_results`
4. Copie as credenciais (URL + anon key) para o `.env`

## 📝 Desenvolvimento

### Adicionar Nova Questão
Insira diretamente no Supabase ou via SQL:
```sql
INSERT INTO quiz_questions (numero, texto, alternativas, dificuldade, topico)
VALUES (
  11,
  'Texto da questão?',
  '{"a": {"texto": "Alternativa A", "correta": false}, "b": {"texto": "Alternativa B", "correta": true}, ...}',
  'média',
  'Tópico da questão'
);
```

### Hook useQuiz
O hook `src/hooks/useQuiz.ts` é o núcleo da aplicação. Ele gerencia:
- Estado do quiz (idle/playing/finished)
- Mensagens do chat
- Timer e pontuação
- Validação e persistência

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é um protótipo educacional. Consulte o proprietário para informações sobre licenciamento.

## 🔗 Links Úteis

- [Documentação do React](https://react.dev)
- [Documentação do Supabase](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite](https://vitejs.dev)

## 📞 Suporte

Para dúvidas ou problemas, abra uma [issue](../../issues) no GitHub.

---

Desenvolvido com ❤️ para o programa Renda Extra Ton
