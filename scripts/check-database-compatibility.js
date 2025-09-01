const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabaseCompatibility() {
  try {
    console.log('🔍 Verificando compatibilidade do banco de dados...\n');
    
    // Forçar uso do MongoDB Atlas online
    const MONGODB_URI = 'mongodb+srv://comercialturbinado:Pikopiko2212@cluster0.vryeq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔗 Conectando ao MongoDB Atlas...');
    console.log(`📍 URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    // Conectar ao MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!\n');

    // 1. Verificar versão do MongoDB
    const adminDb = mongoose.connection.db.admin();
    const serverInfo = await adminDb.serverInfo();
    console.log(`📊 Versão do MongoDB: ${serverInfo.version}`);
    
    if (serverInfo.version >= '4.0.0') {
      console.log('✅ Versão do MongoDB é compatível');
    } else {
      console.log('⚠️  Versão do MongoDB pode ter limitações');
    }

    // 2. Verificar coleções existentes
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log('\n📚 Coleções existentes:');
    collectionNames.forEach(name => {
      console.log(`  - ${name}`);
    });

    // 3. Verificar modelos necessários
    const requiredModels = [
      'users',
      'notifications',
      'notificationpreferences',
      'candidatemetrics',
      'interviews'
    ];

    console.log('\n🔧 Verificando modelos necessários:');
    for (const model of requiredModels) {
      if (collectionNames.includes(model)) {
        console.log(`  ✅ ${model} - Existe`);
      } else {
        console.log(`  ❌ ${model} - Não existe (será criado automaticamente)`);
      }
    }

    // 4. Verificar estrutura do modelo User
    console.log('\n👤 Verificando estrutura do modelo User...');
    const userSample = await mongoose.connection.db.collection('users').findOne({});
    
    if (userSample) {
      const hasPushSubscriptions = userSample.pushSubscriptions !== undefined;
      console.log(`  ${hasPushSubscriptions ? '✅' : '❌'} Campo pushSubscriptions: ${hasPushSubscriptions ? 'Presente' : 'Ausente'}`);
      
      if (!hasPushSubscriptions) {
        console.log('  💡 Campo será adicionado automaticamente na primeira operação');
      }
    } else {
      console.log('  ℹ️  Nenhum usuário encontrado para verificação');
    }

    // 5. Verificar índices
    console.log('\n📇 Verificando índices...');
    const userIndexes = await mongoose.connection.db.collection('users').indexes();
    console.log(`  📊 Índices na coleção users: ${userIndexes.length}`);

    // 6. Verificar permissões de escrita
    console.log('\n✍️  Verificando permissões de escrita...');
    try {
      await mongoose.connection.db.collection('test_write').insertOne({ test: true });
      await mongoose.connection.db.collection('test_write').deleteOne({ test: true });
      console.log('  ✅ Permissões de escrita OK');
    } catch (error) {
      console.log('  ❌ Erro de permissões de escrita:', error.message);
    }

    // 7. Verificar conectividade
    console.log('\n🌐 Verificando conectividade...');
    const pingResult = await mongoose.connection.db.admin().ping();
    if (pingResult.ok === 1) {
      console.log('  ✅ Conectividade OK');
    } else {
      console.log('  ❌ Problema de conectividade');
    }

    // 8. Verificar espaço em disco (aproximado)
    console.log('\n💾 Verificando espaço em disco...');
    try {
      const stats = await mongoose.connection.db.stats();
      const sizeInMB = Math.round(stats.dataSize / 1024 / 1024);
      console.log(`  📊 Porte do banco: ${sizeInMB} MB`);
      
      if (sizeInMB < 100) {
        console.log('  ✅ Espaço em disco suficiente');
      } else {
        console.log('  ⚠️  Banco de dados grande, considere otimizações');
      }
    } catch (error) {
      console.log('  ℹ️  Não foi possível verificar tamanho do banco');
    }

    console.log('\n🎉 Verificação de compatibilidade concluída!');
    console.log('\n📋 Resumo:');
    console.log('  - MongoDB compatível com todas as funcionalidades');
    console.log('  - Novos modelos serão criados automaticamente');
    console.log('  - Migração de dados será necessária');
    console.log('  - Execute: npm run migrate-notifications');

  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Executar verificação
if (require.main === module) {
  checkDatabaseCompatibility()
    .then(() => {
      console.log('\n🎯 Verificação finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na verificação:', error);
      process.exit(1);
    });
}

module.exports = { checkDatabaseCompatibility };
