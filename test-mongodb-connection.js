// Script para testar a conexão com o MongoDB Atlas
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI não está definido no arquivo .env.local');
  process.exit(1);
}

console.log('Tentando conectar ao MongoDB...');
console.log(`URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Oculta credenciais no log

mongoose.connect(MONGODB_URI, {
  bufferCommands: false,
})
  .then(() => {
    console.log('Conexão com MongoDB estabelecida com sucesso!');
    console.log('Listando coleções disponíveis:');
    
    return mongoose.connection.db.listCollections().toArray();
  })
  .then((collections) => {
    if (collections.length === 0) {
      console.log('Nenhuma coleção encontrada. O banco de dados está vazio.');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    console.log('\nTeste concluído com sucesso!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  }); 