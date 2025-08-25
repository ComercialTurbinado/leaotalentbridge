const mongoose = require('mongoose');
require('dotenv').config();

// Schema simplificado para User
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  type: { type: String, enum: ['admin', 'candidato', 'empresa'], default: 'candidato' },
  profile: {
    phone: String,
    avatar: String,
    experience: String,
    skills: [String],
    education: String,
    languages: [{
      language: String,
      level: String
    }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10
    });
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

async function checkAdminUsers() {
  try {
    await connectDB();
    
    console.log('\n🔍 Verificando usuários admin...');
    
    // Verificar se existem usuários admin
    const adminUsers = await User.find({ type: 'admin' });
    
    if (adminUsers.length === 0) {
      console.log('❌ Nenhum usuário admin encontrado');
      console.log('📝 Criando usuário admin padrão...');
      
      const adminUser = new User({
        name: 'Administrador',
        email: 'admin@teste.com',
        password: 'admin123', // Senha simples para teste
        type: 'admin',
        profile: {
          phone: '+55 11 99999-9999',
          experience: 'Administrador do sistema',
          skills: ['Gestão', 'Administração', 'Sistema'],
          education: 'Administração de Sistemas'
        }
      });
      
      await adminUser.save();
      console.log('✅ Usuário admin criado com sucesso!');
      console.log('📧 Email: admin@teste.com');
      console.log('🔑 Senha: admin123');
    } else {
      console.log(`✅ Encontrados ${adminUsers.length} usuário(s) admin:`);
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
      });
    }
    
    // Verificar especificamente o admin@teste.com
    const specificAdmin = await User.findOne({ email: 'admin@teste.com' });
    if (specificAdmin) {
      console.log('\n✅ Usuário admin@teste.com encontrado!');
      console.log(`Nome: ${specificAdmin.name}`);
      console.log(`Tipo: ${specificAdmin.type}`);
      console.log(`Criado em: ${specificAdmin.createdAt}`);
    } else {
      console.log('\n❌ Usuário admin@teste.com NÃO encontrado');
      console.log('📝 Criando usuário admin@teste.com...');
      
      const newAdmin = new User({
        name: 'Administrador',
        email: 'admin@teste.com',
        password: 'admin123',
        type: 'admin',
        profile: {
          phone: '+55 11 99999-9999',
          experience: 'Administrador do sistema',
          skills: ['Gestão', 'Administração', 'Sistema'],
          education: 'Administração de Sistemas'
        }
      });
      
      await newAdmin.save();
      console.log('✅ Usuário admin@teste.com criado com sucesso!');
      console.log('📧 Email: admin@teste.com');
      console.log('🔑 Senha: admin123');
    }
    
    // Listar todos os usuários
    console.log('\n📋 Todos os usuários no sistema:');
    const allUsers = await User.find({}).select('name email type createdAt');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.type} - ${user.createdAt.toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

checkAdminUsers();
