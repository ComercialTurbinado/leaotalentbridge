require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar ao MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
}

// Schemas
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  type: String,
  profile: Object,
}, { timestamps: true });

const SimulationSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: Array,
  estimatedTime: Number,
  category: String,
  difficulty: String,
  isActive: Boolean,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', SimulationSchema);

// Dados de usuários iniciais
const initialUsers = [
  {
    email: 'candidato@teste.com',
    password: 'senha123',
    name: 'João Silva',
    type: 'candidato',
    profile: {
      completed: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      phone: '+55 11 99999-9999',
      position: 'Desenvolvedor Full Stack'
    }
  },
  {
    email: 'empresa@teste.com',
    password: 'senha123',
    name: 'Maria Santos',
    type: 'empresa',
    profile: {
      completed: true,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      phone: '+55 11 88888-8888',
      company: 'TechCorp Dubai',
      position: 'Recrutadora Sênior'
    }
  },
  {
    email: 'admin@leaocareers.com',
    password: 'admin123',
    name: 'Admin Sistema',
    type: 'admin',
    profile: {
      completed: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      phone: '+55 11 77777-7777',
      position: 'Administrador'
    }
  }
];

// Dados de simulações iniciais
const initialSimulations = [
  {
    title: 'Entrevista Comportamental Básica',
    description: 'Simulação focada em perguntas comportamentais para avaliar experiências e motivações.',
    estimatedTime: 20,
    category: 'behavioral',
    difficulty: 'basic',
    isActive: true,
    questions: [
      {
        id: 1,
        text: 'Fale sobre você e sua experiência profissional.',
        tips: [
          'Mantenha uma apresentação objetiva de 2-3 minutos',
          'Destaque suas principais conquistas',
          'Conecte sua experiência com a vaga desejada'
        ]
      },
      {
        id: 2,
        text: 'Por que você quer trabalhar nos Emirados Árabes Unidos?',
        tips: [
          'Demonstre conhecimento sobre o mercado local',
          'Fale sobre crescimento profissional',
          'Mencione a diversidade cultural'
        ]
      },
      {
        id: 3,
        text: 'Conte sobre um desafio profissional que você superou.',
        tips: [
          'Use a técnica STAR (Situação, Tarefa, Ação, Resultado)',
          'Seja específico nos resultados alcançados',
          'Mostre suas habilidades de resolução de problemas'
        ]
      },
      {
        id: 4,
        text: 'Quais são seus pontos fortes e como eles se aplicam ao trabalho?',
        tips: [
          'Cite 2-3 pontos fortes principais',
          'Dê exemplos práticos de como utilizou essas qualidades',
          'Relacione com resultados concretos'
        ]
      },
      {
        id: 5,
        text: 'Onde você se vê profissionalmente em 5 anos?',
        tips: [
          'Mostre ambição e planejamento de carreira',
          'Conecte seus objetivos com oportunidades na região',
          'Demonstre comprometimento de longo prazo'
        ]
      }
    ]
  },
  {
    title: 'Entrevista Técnica - Desenvolvimento',
    description: 'Simulação para desenvolvedores com foco em habilidades técnicas e resolução de problemas.',
    estimatedTime: 30,
    category: 'technical',
    difficulty: 'intermediate',
    isActive: true,
    questions: [
      {
        id: 1,
        text: 'Descreva sua stack de tecnologias preferida e por quê.',
        tips: [
          'Mencione tecnologias front-end e back-end',
          'Explique suas vantagens e desvantagens',
          'Dê exemplos de projetos onde utilizou'
        ]
      },
      {
        id: 2,
        text: 'Como você abordaria a otimização de performance de uma aplicação web?',
        tips: [
          'Mencione ferramentas de análise',
          'Fale sobre otimização de código e banco de dados',
          'Considere caching e CDN'
        ]
      },
      {
        id: 3,
        text: 'Explique como você implementaria autenticação segura em uma API.',
        tips: [
          'Discuta JWT vs Sessions',
          'Mencione práticas de segurança',
          'Fale sobre refresh tokens'
        ]
      }
    ]
  },
  {
    title: 'Liderança e Gestão de Equipe',
    description: 'Simulação para posições de liderança, focando em gestão de pessoas e projetos.',
    estimatedTime: 25,
    category: 'situational',
    difficulty: 'advanced',
    isActive: true,
    questions: [
      {
        id: 1,
        text: 'Como você lidaria com um conflito entre membros da sua equipe?',
        tips: [
          'Demonstre habilidades de mediação',
          'Foque na resolução construtiva',
          'Mencione prevenção de conflitos futuros'
        ]
      },
      {
        id: 2,
        text: 'Descreva como você motivaria uma equipe em um projeto desafiador.',
        tips: [
          'Fale sobre definição clara de objetivos',
          'Mencione reconhecimento e feedback',
          'Considere desenvolvimento individual'
        ]
      },
      {
        id: 3,
        text: 'Como você gerenciaria um projeto com deadline apertado?',
        tips: [
          'Discuta priorização de tarefas',
          'Mencione comunicação com stakeholders',
          'Fale sobre gestão de riscos'
        ]
      }
    ]
  }
];

async function seedDatabase() {
  try {
    await connectDB();

    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await User.deleteMany({});
    await Simulation.deleteMany({});

    // Criar usuários
    console.log('👥 Criando usuários...');
    for (const userData of initialUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      console.log(`✅ Usuário criado: ${userData.email}`);
    }

    // Criar simulações
    console.log('🎯 Criando simulações...');
    for (const simulationData of initialSimulations) {
      const simulation = new Simulation(simulationData);
      await simulation.save();
      console.log(`✅ Simulação criada: ${simulationData.title}`);
    }

    console.log('\n🎉 Database populado com sucesso!');
    console.log('\n📋 Credenciais de teste:');
    console.log('Candidato: candidato@teste.com / senha123');
    console.log('Empresa: empresa@teste.com / senha123');
    console.log('Admin: admin@leaocareers.com / admin123');

  } catch (error) {
    console.error('❌ Erro ao popular database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão fechada');
  }
}

// Executar script
seedDatabase(); 