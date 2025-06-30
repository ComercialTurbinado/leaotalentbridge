const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Configurar o caminho base para os modelos
const modelsPath = path.join(__dirname, '..', 'src', 'lib', 'models');

// Função para importar modelos dinamicamente
function requireModel(modelName) {
  try {
    const modelPath = path.join(modelsPath, `${modelName}.ts`);
    // Para arquivos TypeScript em ambiente Node.js, precisamos usar require com extensão .js
    // ou configurar um transpiler. Por enquanto, vamos usar uma abordagem diferente.
    return require(path.join(modelsPath, modelName));
  } catch (error) {
    console.log(`Tentando importar ${modelName} de forma alternativa...`);
    // Fallback para importação direta
    return null;
  }
}

// Definir os schemas diretamente no script para evitar problemas de importação TypeScript
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['candidato', 'empresa', 'admin'],
    default: 'candidato'
  },
  profile: {
    completed: {
      type: Boolean,
      default: false
    },
    avatar: String,
    phone: String,
    company: String,
    position: String,
    linkedin: String,
    website: String,
    experience: String,
    // Campos estendidos para candidatos
    dateOfBirth: Date,
    nationality: String,
    currentLocation: {
      city: String,
      state: String,
      country: String
    },
    willingToRelocate: Boolean,
    preferredCountries: [String],
    summary: String,
    experience: [{
      company: String,
      position: String,
      location: String,
      startDate: Date,
      endDate: Date,
      description: String,
      technologies: [String]
    }],
    education: [{
      institution: String,
      degree: String,
      fieldOfStudy: String,
      startDate: Date,
      endDate: Date,
      gpa: Number
    }],
    skills: [String],
    languages: [{
      language: String,
      level: {
        type: String,
        enum: ['basic', 'intermediate', 'advanced', 'fluent', 'native']
      }
    }],
    certifications: [{
      name: String,
      institution: String,
      issueDate: Date,
      expiryDate: Date
    }],
    documents: [{
      id: String,
      name: String,
      type: String,
      url: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  preferences: {
    jobTypes: [String],
    salaryRange: {
      min: Number,
      max: Number,
      currency: String
    },
    industries: [String],
    workArrangement: [String],
    notificationSettings: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  website: String,
  description: String,
  industry: {
    type: String,
    enum: ['technology', 'finance', 'healthcare', 'education', 'retail', 'manufacturing', 'construction', 'hospitality', 'consulting', 'marketing', 'real_estate', 'energy', 'telecommunications', 'automotive', 'aerospace', 'logistics', 'other']
  },
  size: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise']
  },
  foundedYear: Number,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  primaryContact: {
    name: String,
    position: String,
    email: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended', 'rejected'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: Date,
  plan: {
    type: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    features: [String],
    maxJobs: {
      type: Number,
      default: 5
    },
    maxCandidates: {
      type: Number,
      default: 50
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  preferences: {
    candidateNotifications: Boolean,
    emailUpdates: Boolean,
    smsNotifications: Boolean,
    autoScreening: Boolean,
    candidateTypes: [String],
    preferredLocations: [String]
  }
}, {
  timestamps: true
});

const JobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  summary: String,
  department: String,
  location: {
    city: String,
    state: String,
    country: String,
    isRemote: Boolean,
    remoteOptions: {
      type: String,
      enum: ['fully_remote', 'hybrid', 'on_site']
    }
  },
  workType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'freelance', 'internship']
  },
  workSchedule: {
    type: String,
    enum: ['standard', 'flexible', 'shift', 'weekend']
  },
  salary: {
    min: Number,
    max: Number,
    currency: String,
    isNegotiable: Boolean,
    paymentFrequency: {
      type: String,
      enum: ['monthly', 'annual', 'hourly', 'project']
    },
    benefits: [String]
  },
  requirements: {
    education: {
      level: {
        type: String,
        enum: ['high_school', 'associate', 'bachelor', 'master', 'phd', 'none']
      },
      field: String,
      required: Boolean
    },
    experience: {
      minYears: Number,
      maxYears: Number,
      level: {
        type: String,
        enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive']
      },
      required: Boolean
    },
    skills: {
      technical: [String],
      soft: [String],
      languages: [{
        language: String,
        level: {
          type: String,
          enum: ['basic', 'intermediate', 'advanced', 'fluent', 'native']
        },
        required: Boolean
      }],
      certifications: [String]
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'expired'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  publishedAt: Date,
  expiresAt: Date,
  autoScreening: Boolean,
  questionsRequired: Boolean,
  customQuestions: [{
    question: String,
    type: {
      type: String,
      enum: ['text', 'multiple_choice', 'boolean', 'file']
    },
    required: Boolean
  }],
  tags: [String],
  category: {
    type: String,
    enum: ['technology', 'finance', 'healthcare', 'education', 'marketing', 'sales', 'design', 'operations', 'hr', 'legal', 'customer_service', 'manufacturing', 'construction', 'hospitality', 'retail', 'other']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const SimulationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['technical', 'behavioral', 'case_study', 'presentation'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  estimatedTime: Number,
  questions: [{
    id: Number,
    text: String,
    tips: [String]
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  targetAudience: [String],
  requiredSkills: [String]
}, {
  timestamps: true
});

const SimulationAnswerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  simulationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Simulation',
    required: true
  },
  answers: [{
    questionId: Number,
    text: String,
    timestamp: Date
  }],
  score: Number,
  feedback: String,
  completedAt: Date,
  duration: Number
}, {
  timestamps: true
});

async function seedExtendedDatabase() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://comercialturbinado:B3DfSzmasC0gDVdb@cluster0.vryeq.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Conectado ao MongoDB');

    // Criar modelos
    const User = mongoose.model('User', UserSchema);
    const Company = mongoose.model('Company', CompanySchema);
    const Job = mongoose.model('Job', JobSchema);
    const Simulation = mongoose.model('Simulation', SimulationSchema);
    const SimulationAnswer = mongoose.model('SimulationAnswer', SimulationAnswerSchema);

    // Limpar coleções específicas ao invés de dropar o banco
    console.log('🗑️ Limpando coleções...');
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Simulation.deleteMany({});
    await SimulationAnswer.deleteMany({});
    console.log('🗑️ Coleções limpas');

    // 1. Criar empresas
    console.log('🏢 Criando empresas...');
    const companies = await Company.insertMany([
      {
        name: 'Tech Solutions Dubai',
        email: 'hr@techsolutions.ae',
        website: 'https://techsolutions.ae',
        description: 'Empresa líder em soluções tecnológicas no Oriente Médio',
        industry: 'technology',
        size: 'medium',
        foundedYear: 2015,
        address: {
          street: 'Dubai Internet City',
          city: 'Dubai',
          state: 'Dubai',
          country: 'UAE',
          zipCode: '12345'
        },
        primaryContact: {
          name: 'Sarah Al-Mansouri',
          position: 'HR Director',
          email: 'sarah@techsolutions.ae',
          phone: '+971-50-123-4567'
        },
        status: 'active',
        isVerified: true,
        verificationDate: new Date(),
        plan: {
          type: 'premium',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
          features: ['unlimited_jobs', 'premium_support', 'analytics'],
          maxJobs: 50,
          maxCandidates: 1000,
          isActive: true
        },
        preferences: {
          candidateNotifications: true,
          emailUpdates: true,
          smsNotifications: false,
          autoScreening: true,
          candidateTypes: ['brasileiros', 'experiencia_internacional'],
          preferredLocations: ['São Paulo', 'Rio de Janeiro', 'Brasília']
        }
      },
      {
        name: 'Emirates Financial Group',
        email: 'careers@emiratesfinance.ae',
        website: 'https://emiratesfinance.ae',
        description: 'Grupo financeiro com foco em inovação e crescimento sustentável',
        industry: 'finance',
        size: 'large',
        foundedYear: 2008,
        address: {
          street: 'DIFC, Gate Village',
          city: 'Dubai',
          state: 'Dubai',
          country: 'UAE',
          zipCode: '54321'
        },
        primaryContact: {
          name: 'Ahmed bin Rashid',
          position: 'Talent Acquisition Manager',
          email: 'ahmed@emiratesfinance.ae',
          phone: '+971-55-987-6543'
        },
        status: 'active',
        isVerified: true,
        plan: {
          type: 'enterprise',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          features: ['unlimited_jobs', 'priority_support', 'custom_branding', 'api_access'],
          maxJobs: 100,
          maxCandidates: 5000,
          isActive: true
        },
        preferences: {
          candidateNotifications: true,
          emailUpdates: true,
          autoScreening: true,
          candidateTypes: ['financas', 'lideranca'],
          preferredLocations: ['São Paulo', 'Rio de Janeiro']
        }
      }
    ]);

    // 2. Criar usuários
    console.log('👥 Criando usuários...');
    const hashedPassword = await bcrypt.hash('senha123', 10);
    
    const users = await User.insertMany([
      // Candidatos
      {
        name: 'Carlos Silva Santos',
        email: 'carlos.silva@email.com',
        password: hashedPassword,
        type: 'candidato',
        profile: {
          completed: true,
          phone: '+55 11 99999-1111',
          dateOfBirth: new Date('1992-05-15'),
          nationality: 'Brasileira',
          currentLocation: {
            city: 'São Paulo',
            state: 'SP',
            country: 'Brasil'
          },
          willingToRelocate: true,
          preferredCountries: ['UAE', 'Qatar', 'Saudi Arabia'],
          summary: 'Desenvolvedor Full Stack com 6 anos de experiência, especializado em React e Node.js. Fluente em inglês e árabe básico.',
          experience: [
            {
              company: 'iFood',
              position: 'Senior Full Stack Developer',
              location: 'São Paulo, SP',
              startDate: new Date('2020-03-01'),
              endDate: new Date('2024-01-01'),
              description: 'Desenvolvimento de microserviços e APIs REST para plataforma de delivery',
              technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'AWS']
            }
          ],
          education: [
            {
              institution: 'Universidade de São Paulo (USP)',
              degree: 'Bacharelado em Ciência da Computação',
              fieldOfStudy: 'Ciência da Computação',
              startDate: new Date('2014-02-01'),
              endDate: new Date('2018-12-01'),
              gpa: 8.5
            }
          ],
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB'],
          languages: [
            { language: 'Português', level: 'native' },
            { language: 'Inglês', level: 'fluent' },
            { language: 'Árabe', level: 'basic' }
          ],
          certifications: [
            {
              name: 'AWS Solutions Architect',
              institution: 'Amazon Web Services',
              issueDate: new Date('2023-06-15'),
              expiryDate: new Date('2026-06-15')
            }
          ]
        },
        preferences: {
          jobTypes: ['full_time', 'contract'],
          salaryRange: { min: 15000, max: 25000, currency: 'AED' },
          industries: ['technology', 'finance'],
          workArrangement: ['remote', 'hybrid'],
          notificationSettings: {
            email: true,
            sms: false,
            push: true
          }
        },
        status: 'active',
        isVerified: true
      },
      {
        name: 'Ana Paula Oliveira',
        email: 'ana.oliveira@email.com',
        password: hashedPassword,
        type: 'candidato',
        profile: {
          completed: true,
          phone: '+55 21 98888-2222',
          dateOfBirth: new Date('1988-08-22'),
          nationality: 'Brasileira',
          currentLocation: {
            city: 'Rio de Janeiro',
            state: 'RJ',
            country: 'Brasil'
          },
          willingToRelocate: true,
          preferredCountries: ['UAE', 'UK', 'Canada'],
          summary: 'Gerente de Marketing Digital com 8 anos de experiência em campanhas internacionais e growth hacking.',
          experience: [
            {
              company: 'Stone Pagamentos',
              position: 'Marketing Manager',
              location: 'Rio de Janeiro, RJ',
              startDate: new Date('2019-01-01'),
              endDate: new Date('2024-01-01'),
              description: 'Liderança de equipe de marketing digital e campanhas de aquisição',
              technologies: ['Google Ads', 'Facebook Ads', 'Analytics', 'CRM']
            }
          ],
          skills: ['Marketing Digital', 'Google Ads', 'Analytics', 'Growth Hacking', 'CRM', 'SEO'],
          languages: [
            { language: 'Português', level: 'native' },
            { language: 'Inglês', level: 'fluent' },
            { language: 'Espanhol', level: 'intermediate' }
          ]
        },
        preferences: {
          jobTypes: ['full_time'],
          salaryRange: { min: 18000, max: 30000, currency: 'AED' },
          industries: ['marketing', 'technology', 'finance']
        },
        status: 'active',
        isVerified: true
      }
    ]);

    // 3. Criar vagas
    console.log('💼 Criando vagas...');
    const jobs = await Job.insertMany([
      {
        companyId: companies[0]._id,
        title: 'Senior Full Stack Developer',
        description: 'Estamos procurando um desenvolvedor experiente para liderar projetos de e-commerce de grande escala. Você trabalhará com tecnologias modernas e terá a oportunidade de impactar milhões de usuários.',
        summary: 'Desenvolvedor sênior para projetos de e-commerce com foco em React e Node.js',
        department: 'Engineering',
        location: {
          city: 'Dubai',
          state: 'Dubai',
          country: 'UAE',
          isRemote: false,
          remoteOptions: 'hybrid'
        },
        workType: 'full_time',
        workSchedule: 'flexible',
        salary: {
          min: 18000,
          max: 25000,
          currency: 'AED',
          isNegotiable: true,
          paymentFrequency: 'monthly',
          benefits: ['Seguro saúde', 'Seguro dental', 'Bônus anual', 'Educação continuada']
        },
        requirements: {
          education: {
            level: 'bachelor',
            field: 'Ciência da Computação',
            required: true
          },
          experience: {
            minYears: 5,
            maxYears: 8,
            level: 'senior',
            required: true
          },
          skills: {
            technical: ['React', 'Node.js', 'JavaScript', 'AWS', 'MongoDB'],
            soft: ['Liderança', 'Comunicação', 'Resolução de problemas'],
            languages: [
              { language: 'Inglês', level: 'fluent', required: true },
              { language: 'Árabe', level: 'basic', required: false }
            ],
            certifications: ['AWS Certified Developer']
          }
        },
        status: 'active',
        priority: 'high',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
        autoScreening: true,
        questionsRequired: true,
        customQuestions: [
          {
            question: 'Descreva sua experiência com microserviços',
            type: 'text',
            required: true
          },
          {
            question: 'Você tem experiência trabalhando remotamente?',
            type: 'boolean',
            required: true
          }
        ],
        tags: ['react', 'nodejs', 'senior', 'full-stack', 'ecommerce'],
        category: 'technology',
        createdBy: users[0]._id
      },
      {
        companyId: companies[1]._id,
        title: 'Marketing Manager - MENA Region',
        description: 'Oportunidade única para liderar estratégias de marketing na região MENA. Você será responsável por campanhas digitais, branding e expansão de mercado.',
        summary: 'Gerente de Marketing para liderar expansão na região MENA',
        department: 'Marketing',
        location: {
          city: 'Dubai',
          state: 'Dubai',
          country: 'UAE',
          isRemote: false,
          remoteOptions: 'on_site'
        },
        workType: 'full_time',
        salary: {
          min: 20000,
          max: 35000,
          currency: 'AED',
          isNegotiable: true,
          paymentFrequency: 'monthly',
          benefits: ['Seguro saúde premium', 'Car allowance', 'Housing allowance']
        },
        requirements: {
          education: {
            level: 'bachelor',
            field: 'Marketing',
            required: true
          },
          experience: {
            minYears: 6,
            maxYears: 10,
            level: 'senior',
            required: true
          },
          skills: {
            technical: ['Google Ads', 'Analytics', 'CRM', 'Social Media'],
            soft: ['Liderança', 'Estratégia', 'Negociação'],
            languages: [
              { language: 'Inglês', level: 'fluent', required: true },
              { language: 'Árabe', level: 'intermediate', required: false }
            ]
          }
        },
        status: 'active',
        priority: 'medium',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 dias
        tags: ['marketing', 'manager', 'mena', 'digital-marketing'],
        category: 'marketing',
        createdBy: users[1]._id
      }
    ]);

    // 4. Criar simulações
    console.log('🎯 Criando simulações...');
    const simulations = await Simulation.insertMany([
      {
        title: 'Entrevista Técnica - Desenvolvedor Full Stack',
        description: 'Simulação focada em perguntas técnicas para desenvolvedores com experiência em React e Node.js',
        category: 'technical',
        difficulty: 'intermediate',
        estimatedTime: 45,
        questions: [
          {
            id: 1,
            text: 'Explique a diferença entre props e state no React. Como você decidiria quando usar cada um?',
            tips: [
              'Considere mutabilidade vs imutabilidade',
              'Pense no fluxo de dados entre componentes',
              'Mencione re-renderização e performance'
            ]
          },
          {
            id: 2,
            text: 'Como você implementaria autenticação JWT em uma aplicação Node.js? Quais são as melhores práticas de segurança?',
            tips: [
              'Fale sobre assinatura e verificação de tokens',
              'Considere tempo de expiração e refresh tokens',
              'Mencione armazenamento seguro no frontend'
            ]
          }
        ],
        tags: ['react', 'nodejs', 'jwt', 'technical'],
        isActive: true,
        targetAudience: ['developers', 'full-stack', 'backend'],
        requiredSkills: ['JavaScript', 'React', 'Node.js']
      },
      {
        title: 'Entrevista Comportamental - Liderança',
        description: 'Simulação focada em competências comportamentais e situações de liderança',
        category: 'behavioral',
        difficulty: 'intermediate',
        estimatedTime: 30,
        questions: [
          {
            id: 1,
            text: 'Conte-me sobre uma situação em que você teve que liderar uma equipe através de uma mudança difícil. Como você abordou a resistência?',
            tips: [
              'Use a metodologia STAR (Situação, Tarefa, Ação, Resultado)',
              'Foque em como você comunicou a mudança',
              'Mencione como você apoiou a equipe'
            ]
          }
        ],
        tags: ['behavioral', 'leadership', 'management', 'soft-skills'],
        isActive: true,
        targetAudience: ['managers', 'leaders', 'seniors'],
        requiredSkills: ['Liderança', 'Comunicação']
      }
    ]);

    // 5. Criar respostas de simulação
    console.log('💭 Criando respostas de simulação...');
    await SimulationAnswer.insertMany([
      {
        userId: users[0]._id,
        simulationId: simulations[0]._id,
        answers: [
          {
            questionId: 1,
            text: 'Props são dados imutáveis passados de componente pai para filho, enquanto state é mutável e gerenciado internamente pelo componente. Props são usados para comunicação descendente e state para dados que mudam durante o ciclo de vida do componente.',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            questionId: 2,
            text: 'Para implementar JWT: 1) Criar endpoint de login que valida credenciais e retorna token assinado, 2) Middleware para verificar token em rotas protegidas, 3) Usar HTTPS, definir expiração curta, implementar refresh tokens e armazenar no httpOnly cookie.',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          }
        ],
        score: 88,
        feedback: 'Respostas demonstram sólido conhecimento técnico. Poderia detalhar mais aspectos de performance.',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        duration: 2700 // 45 minutos
      }
    ]);

    console.log('✅ Seed básico concluído com sucesso!');
    console.log(`📊 Dados criados:
    • ${companies.length} empresas
    • ${users.length} usuários
    • ${jobs.length} vagas
    • ${simulations.length} simulações
    • 1 resposta de simulação`);

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada');
  }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  seedExtendedDatabase();
}

module.exports = seedExtendedDatabase; 