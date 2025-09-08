const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Conectar ao MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

// Schema simplificado com strict: false
const SimulationSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', SimulationSchema);

// Dados das simulações de exemplo
const sampleSimulations = [
  {
    title: 'Simulação de Entrevista em Inglês',
    description: 'Pratique suas habilidades de entrevista em inglês com perguntas comuns do mercado de trabalho.',
    category: 'english',
    difficulty: 'intermediate',
    estimatedTime: 30,
    isActive: true,
    questions: [
      {
        id: 1,
        question: 'Tell me about yourself.',
        type: 'audio_response',
        timeLimit: 120,
        tips: [
          'Keep it professional and relevant',
          'Focus on your career highlights',
          'Connect your experience to the role'
        ]
      },
      {
        id: 2,
        question: 'Why do you want to work for our company?',
        type: 'audio_response',
        timeLimit: 90,
        tips: [
          'Research the company beforehand',
          'Mention specific aspects you admire',
          'Show enthusiasm and genuine interest'
        ]
      },
      {
        id: 3,
        question: 'What are your greatest strengths?',
        type: 'audio_response',
        timeLimit: 120,
        tips: [
          'Choose strengths relevant to the job',
          'Provide specific examples',
          'Be confident but not arrogant'
        ]
      },
      {
        id: 4,
        question: 'Where do you see yourself in 5 years?',
        type: 'audio_response',
        timeLimit: 90,
        tips: [
          'Show ambition and growth mindset',
          'Align with company opportunities',
          'Be realistic and achievable'
        ]
      },
      {
        id: 5,
        question: 'Why are you leaving your current job?',
        type: 'audio_response',
        timeLimit: 90,
        tips: [
          'Stay positive about previous employers',
          'Focus on growth opportunities',
          'Avoid personal conflicts or complaints'
        ]
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    title: 'Teste de Conhecimentos Técnicos - TI',
    description: 'Avalie seus conhecimentos em programação, banco de dados e tecnologias modernas.',
    category: 'technical',
    difficulty: 'advanced',
    estimatedTime: 45,
    isActive: true,
    questions: [
      {
        id: 1,
        question: 'Explain the difference between REST and GraphQL APIs.',
        type: 'written_response',
        timeLimit: 300,
        tips: [
          'Compare their architectural approaches',
          'Mention pros and cons of each',
          'Give examples of when to use each'
        ]
      },
      {
        id: 2,
        question: 'How would you optimize a slow database query?',
        type: 'written_response',
        timeLimit: 240,
        tips: [
          'Mention indexing strategies',
          'Discuss query optimization techniques',
          'Consider database design improvements'
        ]
      },
      {
        id: 3,
        question: 'Describe the SOLID principles in object-oriented programming.',
        type: 'written_response',
        timeLimit: 360,
        tips: [
          'Explain each principle clearly',
          'Provide practical examples',
          'Show understanding of benefits'
        ]
      },
      {
        id: 4,
        question: 'What is the difference between authentication and authorization?',
        type: 'written_response',
        timeLimit: 180,
        tips: [
          'Define each concept clearly',
          'Explain their relationship',
          'Give real-world examples'
        ]
      }
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date()
  },
  {
    title: 'Simulação de Apresentação Corporativa',
    description: 'Pratique suas habilidades de apresentação em um ambiente corporativo simulado.',
    category: 'presentation',
    difficulty: 'intermediate',
    estimatedTime: 25,
    isActive: true,
    questions: [
      {
        id: 1,
        question: 'Present a 2-minute overview of a project you\'re proud of.',
        type: 'video_response',
        timeLimit: 120,
        tips: [
          'Structure your presentation clearly',
          'Highlight key achievements',
          'Maintain eye contact with camera'
        ]
      },
      {
        id: 2,
        question: 'Explain a complex technical concept to a non-technical audience.',
        type: 'video_response',
        timeLimit: 180,
        tips: [
          'Use simple language and analogies',
          'Be patient and clear',
          'Check for understanding'
        ]
      },
      {
        id: 3,
        question: 'How would you handle a disagreement with a team member?',
        type: 'video_response',
        timeLimit: 120,
        tips: [
          'Show emotional intelligence',
          'Focus on solutions, not problems',
          'Demonstrate conflict resolution skills'
        ]
      }
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  },
  {
    title: 'Avaliação de Soft Skills',
    description: 'Demonstre suas habilidades interpessoais e competências comportamentais.',
    category: 'soft_skills',
    difficulty: 'basic',
    estimatedTime: 20,
    isActive: true,
    questions: [
      {
        id: 1,
        question: 'Describe a time when you had to work under pressure.',
        type: 'written_response',
        timeLimit: 180,
        tips: [
          'Use the STAR method (Situation, Task, Action, Result)',
          'Focus on your problem-solving approach',
          'Highlight positive outcomes'
        ]
      },
      {
        id: 2,
        question: 'How do you prioritize tasks when everything seems urgent?',
        type: 'written_response',
        timeLimit: 150,
        tips: [
          'Mention specific prioritization frameworks',
          'Show logical thinking process',
          'Include stakeholder communication'
        ]
      },
      {
        id: 3,
        question: 'Tell us about a time you received constructive feedback.',
        type: 'written_response',
        timeLimit: 180,
        tips: [
          'Show openness to feedback',
          'Demonstrate growth mindset',
          'Explain how you implemented changes'
        ]
      },
      {
        id: 4,
        question: 'How would you motivate a team that\'s feeling demotivated?',
        type: 'written_response',
        timeLimit: 200,
        tips: [
          'Show leadership and empathy',
          'Mention specific motivation techniques',
          'Focus on team engagement strategies'
        ]
      }
    ],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date()
  },
  {
    title: 'Simulação de Vendas B2B',
    description: 'Teste suas habilidades de vendas em um cenário business-to-business realista.',
    category: 'sales',
    difficulty: 'advanced',
    estimatedTime: 35,
    isActive: true,
    questions: [
      {
        id: 1,
        question: 'You\'re calling a potential client for the first time. Make your opening pitch.',
        type: 'audio_response',
        timeLimit: 120,
        tips: [
          'Be confident but not pushy',
          'Focus on value proposition',
          'Ask engaging questions'
        ]
      },
      {
        id: 2,
        question: 'The client says your price is too high. How do you respond?',
        type: 'audio_response',
        timeLimit: 150,
        tips: [
          'Don\'t immediately lower the price',
          'Focus on ROI and value',
          'Understand their budget constraints'
        ]
      },
      {
        id: 3,
        question: 'How would you handle a client who wants to \'think about it\'?',
        type: 'audio_response',
        timeLimit: 120,
        tips: [
          'Understand their real concerns',
          'Create urgency appropriately',
          'Schedule a follow-up'
        ]
      }
    ],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date()
  }
];

// Função principal para popular as simulações
async function seedSimulations() {
  try {
    await connectToDatabase();
    
    console.log('🗑️ Limpando simulações existentes...');
    await Simulation.deleteMany({});
    
    console.log('🎯 Inserindo simulações de exemplo...');
    
    const insertedSimulations = await Simulation.insertMany(sampleSimulations);
    
    console.log(`✅ ${insertedSimulations.length} simulações inseridas com sucesso!`);
    
    // Listar as simulações criadas
    console.log('\n📋 Simulações criadas:');
    insertedSimulations.forEach((simulation, index) => {
      console.log(`${index + 1}. ${simulation.title} (${simulation.category} - ${simulation.difficulty})`);
    });
    
    console.log('\n🎉 Seed de simulações concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao inserir simulações:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Conexão com MongoDB fechada');
  }
}

// Executar o script
if (require.main === module) {
  seedSimulations();
}

module.exports = { seedSimulations };
