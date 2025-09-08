const mongoose = require('mongoose');

async function verifyData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://comercialturbinado:B3DfSzmasC0gDVdb@cluster0.vryeq.mongodb.net/');
    console.log('✅ Conectado ao MongoDB para verificação\n');

    // Verificar coleções
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 COLEÇÕES ENCONTRADAS:');
    collections.forEach(col => {
      console.log(`   • ${col.name}`);
    });
    console.log('');

    // Contar documentos em cada coleção
    const collectionNames = ['users', 'companies', 'jobs', 'simulations', 'simulationanswers', 'applications'];
    
    console.log('📊 CONTAGEM DE DOCUMENTOS:');
    for (const collectionName of collectionNames) {
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        console.log(`   • ${collectionName}: ${count} documento(s)`);
      } catch (error) {
        console.log(`   • ${collectionName}: Coleção não encontrada`);
      }
    }
    console.log('');

    // Verificar dados específicos
    console.log('🔍 VERIFICAÇÃO DETALHADA:');
    
    // Usuários
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`   • Usuários encontrados: ${users.length}`);
    users.forEach(user => {
      console.log(`     - ${user.name} (${user.email}) - Tipo: ${user.type}`);
    });

    // Empresas
    const companies = await mongoose.connection.db.collection('companies').find({}).toArray();
    console.log(`   • Empresas encontradas: ${companies.length}`);
    companies.forEach(company => {
      console.log(`     - ${company.name} (${company.email}) - Status: ${company.status}`);
    });

    // Vagas
    const jobs = await mongoose.connection.db.collection('jobs').find({}).toArray();
    console.log(`   • Vagas encontradas: ${jobs.length}`);
    jobs.forEach(job => {
      console.log(`     - ${job.title} - Status: ${job.status}`);
    });

    // Simulações
    const simulations = await mongoose.connection.db.collection('simulations').find({}).toArray();
    console.log(`   • Simulações encontradas: ${simulations.length}`);
    simulations.forEach(simulation => {
      console.log(`     - ${simulation.title} - Categoria: ${simulation.category}`);
    });

    // Candidaturas
    const applications = await mongoose.connection.db.collection('applications').find({}).toArray();
    console.log(`   • Candidaturas encontradas: ${applications.length}`);
    applications.forEach(application => {
      console.log(`     - Status: ${application.status} - Fonte: ${application.source}`);
    });

    console.log('\n🎉 VERIFICAÇÃO CONCLUÍDA!');
    
    if (users.length > 0 && companies.length > 0 && jobs.length > 0 && simulations.length > 0 && applications.length > 0) {
      console.log('✅ Todos os dados foram criados com sucesso!');
      console.log('🚀 O sistema está pronto para uso!');
    } else {
      console.log('⚠️ Alguns dados podem estar faltando. Execute o seed novamente se necessário.');
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão fechada');
  }
}

if (require.main === module) {
  verifyData();
}

module.exports = verifyData; 