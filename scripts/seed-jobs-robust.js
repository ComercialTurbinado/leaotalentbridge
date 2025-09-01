const mongoose = require('mongoose');

// Conexão com MongoDB
const MONGODB_URI = 'mongodb+srv://comercialturbinado:Pikopiko2212@cluster0.vryeq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function connectDB() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
    });
    
    console.log('✅ Conectado ao MongoDB com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    return false;
  }
}

// Schema simplificado para Job
const JobSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  summary: String,
  department: String,
  location: {
    city: String,
    state: String,
    country: String,
    isRemote: Boolean,
    remoteOptions: String
  },
  workType: String,
  workSchedule: String,
  salary: {
    min: Number,
    max: Number,
    currency: String,
    isNegotiable: Boolean,
    paymentFrequency: String,
    benefits: [String]
  },
  requirements: {
    education: {
      level: String,
      field: String,
      required: Boolean
    },
    experience: {
      minYears: Number,
      maxYears: Number,
      level: String,
      required: Boolean
    },
    skills: {
      technical: [String],
      soft: [String],
      languages: [{
        language: String,
        level: String,
        required: Boolean
      }],
      certifications: [String]
    }
  },
  status: { type: String, default: 'active' },
  priority: { type: String, default: 'medium' },
  publishedAt: Date,
  expiresAt: Date,
  autoScreening: Boolean,
  questionsRequired: Boolean,
  tags: [String],
  category: String,
  slug: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

// Schema simplificado para Company
const CompanySchema = new mongoose.Schema({
  name: String,
  email: String,
  industry: String,
  size: String,
  location: {
    city: String,
    state: String,
    country: String
  }
}, { timestamps: true });

const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);

// Schema simplificado para User
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  type: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedJobs() {
  let connection = false;
  
  try {
    console.log('🌱 Iniciando seed de vagas...');
    
    // 1. Conectar ao banco
    connection = await connectDB();
    if (!connection) {
      throw new Error('Falha na conexão com MongoDB');
    }
    
    // 2. Verificar se já existem vagas
    const existingJobs = await Job.countDocuments();
    if (existingJobs > 0) {
      console.log(`⚠️  Já existem ${existingJobs} vagas no banco. Pulando criação.`);
      return;
    }
    
    // 3. Criar empresa de exemplo (se não existir)
    console.log('🏢 Verificando/criando empresa...');
    let company = await Company.findOne({ email: 'hr@techsolutions.ae' });
    
    if (!company) {
      company = await Company.create({
        name: 'Tech Solutions Dubai',
        email: 'hr@techsolutions.ae',
        industry: 'Technology',
        size: '100-500',
        location: {
          city: 'Dubai',
          state: 'Dubai',
          country: 'UAE'
        }
      });
      console.log('✅ Empresa criada:', company.name);
    } else {
      console.log('✅ Empresa encontrada:', company.name);
    }
    
    // 4. Criar usuário admin (se não existir)
    console.log('👤 Verificando/criando usuário admin...');
    let adminUser = await User.findOne({ email: 'admin@leaocareers.com' });
    
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin Sistema',
        email: 'admin@leaocareers.com',
        type: 'admin'
      });
      console.log('✅ Usuário admin criado:', adminUser.name);
    } else {
      console.log('✅ Usuário admin encontrado:', adminUser.name);
    }
    
    // 5. Criar vagas de exemplo
    console.log('💼 Criando vagas...');
    const jobsData = [
      {
        companyId: company._id,
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
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        autoScreening: true,
        questionsRequired: true,
        tags: ['react', 'nodejs', 'senior', 'full-stack', 'e-commerce'],
        category: 'technology',
        slug: 'senior-full-stack-developer-dubai',
        createdBy: adminUser._id
      },
      {
        companyId: company._id,
        title: 'UX/UI Designer',
        description: 'Designer criativo para criar experiências digitais excepcionais. Você será responsável por design de interfaces, prototipagem e pesquisa de usuários.',
        summary: 'Designer UX/UI para produtos digitais com foco em experiência do usuário',
        department: 'Design',
        location: {
          city: 'Dubai',
          state: 'Dubai',
          country: 'UAE',
          isRemote: true,
          remoteOptions: 'fully_remote'
        },
        workType: 'full_time',
        workSchedule: 'flexible',
        salary: {
          min: 12000,
          max: 18000,
          currency: 'AED',
          isNegotiable: true,
          paymentFrequency: 'monthly',
          benefits: ['Seguro saúde', 'Flexibilidade de horário', 'Equipamentos']
        },
        requirements: {
          education: {
            level: 'bachelor',
            field: 'Design ou áreas relacionadas',
            required: false
          },
          experience: {
            minYears: 3,
            maxYears: 6,
            level: 'mid',
            required: true
          },
          skills: {
            technical: ['Figma', 'Adobe Creative Suite', 'Prototipagem', 'User Research'],
            soft: ['Criatividade', 'Empatia', 'Comunicação'],
            languages: [
              { language: 'Inglês', level: 'fluent', required: true }
            ],
            certifications: []
          }
        },
        status: 'active',
        priority: 'medium',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        autoScreening: false,
        questionsRequired: true,
        tags: ['ux', 'ui', 'design', 'figma', 'user-research'],
        category: 'design',
        slug: 'ux-ui-designer-dubai-remote',
        createdBy: adminUser._id
      },
      {
        companyId: company._id,
        title: 'Marketing Manager',
        description: 'Gerente de marketing para liderar estratégias digitais e campanhas de crescimento. Experiência com marketing digital, SEO e análise de dados.',
        summary: 'Gerente de marketing digital com foco em crescimento e análise de dados',
        department: 'Marketing',
        location: {
          city: 'Dubai',
          state: 'Dubai',
          country: 'UAE',
          isRemote: false,
          remoteOptions: 'hybrid'
        },
        workType: 'full_time',
        workSchedule: 'standard',
        salary: {
          min: 15000,
          max: 22000,
          currency: 'AED',
          isNegotiable: true,
          paymentFrequency: 'monthly',
          benefits: ['Seguro saúde', 'Bônus por performance', 'Desenvolvimento profissional']
        },
        requirements: {
          education: {
            level: 'bachelor',
            field: 'Marketing, Administração ou áreas relacionadas',
            required: true
          },
          experience: {
            minYears: 4,
            maxYears: 7,
            level: 'senior',
            required: true
          },
          skills: {
            technical: ['Google Analytics', 'Facebook Ads', 'SEO', 'E-mail Marketing'],
            soft: ['Liderança', 'Estratégia', 'Análise de dados'],
            languages: [
              { language: 'Inglês', level: 'fluent', required: true },
              { language: 'Árabe', level: 'intermediate', required: false }
            ],
            certifications: ['Google Ads', 'Facebook Blueprint']
          }
        },
        status: 'active',
        priority: 'medium',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        autoScreening: true,
        questionsRequired: true,
        tags: ['marketing', 'digital', 'growth', 'analytics', 'leadership'],
        category: 'marketing',
        slug: 'marketing-manager-dubai',
        createdBy: adminUser._id
      }
    ];
    
    // Criar vagas uma por uma para melhor controle de erros
    const createdJobs = [];
    for (const jobData of jobsData) {
      try {
        const job = await Job.create(jobData);
        createdJobs.push(job);
        console.log(`✅ Vaga criada: ${job.title}`);
      } catch (error) {
        console.error(`❌ Erro ao criar vaga "${jobData.title}":`, error.message);
      }
    }
    
    // 6. Exibir resumo
    console.log('\n🎉 Seed de vagas concluído!');
    console.log(`📊 Dados criados:
    • 1 empresa (${company.name})
    • 1 usuário admin (${adminUser.name})
    • ${createdJobs.length} vagas ativas criadas`);
    
    if (createdJobs.length > 0) {
      console.log('\n📋 Vagas criadas:');
      createdJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} - ${job.category} - ${job.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error.message);
  } finally {
    if (connection) {
      await mongoose.connection.close();
      console.log('🔌 Conexão fechada');
    }
  }
}

if (require.main === module) {
  seedJobs();
}

module.exports = { seedJobs };
