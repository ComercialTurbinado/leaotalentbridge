const mongoose = require('mongoose');

// Conexão com MongoDB
const MONGODB_URI = 'mongodb+srv://comercialturbinado:Pikopiko2212@cluster0.vryeq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function checkDB() {
  try {
    console.log('🔍 Verificando banco de dados...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado ao MongoDB');
    
    // Listar todas as coleções
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Coleções encontradas:');
    collections.forEach(col => {
      console.log(`   • ${col.name}`);
    });
    
    // Verificar se há dados nas principais coleções
    const db = mongoose.connection.db;
    
    if (collections.some(c => c.name === 'companies')) {
      const companyCount = await db.collection('companies').countDocuments();
      console.log(`\n🏢 Empresas: ${companyCount}`);
    }
    
    if (collections.some(c => c.name === 'jobs')) {
      const jobCount = await db.collection('jobs').countDocuments();
      console.log(`💼 Vagas: ${jobCount}`);
    }
    
    if (collections.some(c => c.name === 'users')) {
      const userCount = await db.collection('users').countDocuments();
      console.log(`👤 Usuários: ${userCount}`);
    }
    
    if (collections.some(c => c.name === 'courses')) {
      const courseCount = await db.collection('courses').countDocuments();
      console.log(`📚 Cursos: ${courseCount}`);
    }
    
    if (collections.some(c => c.name === 'simulations')) {
      const simulationCount = await db.collection('simulations').countDocuments();
      console.log(`🎯 Simulações: ${simulationCount}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão fechada');
  }
}

if (require.main === module) {
  checkDB();
}

module.exports = { checkDB };
