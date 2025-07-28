// Script para criar usuários de teste (empresa e admin)
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conexão com MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI não está definido no arquivo .env.local');
  process.exit(1);
}

// Definindo o modelo User
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
  }
}, {
  timestamps: true
});

// Definindo o modelo Company
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
  phone: {
    type: String,
    required: true
  },
  website: String,
  industry: {
    type: String,
    required: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'],
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  description: {
    type: String,
    required: true
  },
  logo: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
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
      default: 10
    },
    maxCandidates: {
      type: Number,
      default: 100
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Registrando os modelos
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);

// Função para criar usuários de teste
async function createTestUsers() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log('Conectado ao MongoDB com sucesso!');

    // Criar hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Teste@123', salt);

    // Verificar se os usuários já existem
    const existingCompanyUser = await User.findOne({ email: 'empresa@teste.com' });
    const existingAdminUser = await User.findOne({ email: 'admin@teste.com' });

    // Criar usuário empresa se não existir
    if (!existingCompanyUser) {
      // Criar empresa primeiro
      const company = new Company({
        name: 'Empresa Teste',
        email: 'empresa@teste.com',
        phone: '11999999999',
        website: 'https://empresateste.com',
        industry: 'Tecnologia',
        size: '11-50',
        location: {
          city: 'São Paulo',
          state: 'SP',
          country: 'Brasil'
        },
        description: 'Empresa de teste para o sistema',
        status: 'approved',
        isVerified: true,
        plan: {
          type: 'premium',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano a partir de hoje
          features: ['unlimited_jobs', 'premium_support', 'analytics'],
          maxJobs: 50,
          maxCandidates: 1000,
          isActive: true
        }
      });

      await company.save();
      console.log('Empresa criada com sucesso:', company.name);

      // Criar usuário associado à empresa
      const companyUser = new User({
        email: 'empresa@teste.com',
        password: passwordHash,
        name: 'Usuário Empresa',
        type: 'empresa',
        profile: {
          completed: true,
          phone: '11999999999',
          company: company.name,
          position: 'Gerente de RH',
          website: company.website
        }
      });

      await companyUser.save();
      console.log('Usuário empresa criado com sucesso:', companyUser.email);
    } else {
      console.log('Usuário empresa já existe:', existingCompanyUser.email);
      
      // Verificar se a empresa existe e tem um plano
      const company = await Company.findOne({ email: 'empresa@teste.com' });
      if (company) {
        // Atualizar a empresa para adicionar ou corrigir o plano
        await Company.updateOne(
          { _id: company._id },
          {
            $set: {
              plan: {
                type: 'premium',
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano a partir de hoje
                features: ['unlimited_jobs', 'premium_support', 'analytics'],
                maxJobs: 50,
                maxCandidates: 1000,
                isActive: true
              }
            }
          }
        );
        console.log('Plano adicionado/atualizado na empresa existente');
      }
    }

    // Criar usuário admin se não existir
    if (!existingAdminUser) {
      const adminUser = new User({
        email: 'admin@teste.com',
        password: passwordHash,
        name: 'Administrador',
        type: 'admin',
        profile: {
          completed: true
        }
      });

      await adminUser.save();
      console.log('Usuário admin criado com sucesso:', adminUser.email);
    } else {
      console.log('Usuário admin já existe:', existingAdminUser.email);
    }

    // Criar usuário candidato se não existir
    const existingCandidateUser = await User.findOne({ email: 'candidato@teste.com' });
    if (!existingCandidateUser) {
      const candidateUser = new User({
        email: 'candidato@teste.com',
        password: passwordHash,
        name: 'Usuário Candidato',
        type: 'candidato',
        profile: {
          completed: true,
          phone: '11888888888',
          experience: '3 anos como desenvolvedor web'
        }
      });

      await candidateUser.save();
      console.log('Usuário candidato criado com sucesso:', candidateUser.email);
    } else {
      console.log('Usuário candidato já existe:', existingCandidateUser.email);
    }

    console.log('\nUsuários de teste:');
    console.log('- Empresa: email=empresa@teste.com, senha=Teste@123');
    console.log('- Admin: email=admin@teste.com, senha=Teste@123');
    console.log('- Candidato: email=candidato@teste.com, senha=Teste@123');

    mongoose.connection.close();
    console.log('Conexão com MongoDB fechada.');
  } catch (error) {
    console.error('Erro ao criar usuários de teste:', error);
    process.exit(1);
  }
}

// Executar a função
createTestUsers(); 