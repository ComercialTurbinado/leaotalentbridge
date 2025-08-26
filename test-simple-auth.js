const https = require('https');
const jwt = require('jsonwebtoken');

// Token que obtivemos do login
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE3MDdkODAwMWQyOTI2NDBlZWY2ZmMiLCJlbWFpbCI6ImFkbWluQGxlYW9jYXJlZXJzLmNvbSIsInR5cGUiOiJhZG1pbiIsImlhdCI6MTc1NjE4MDI0NywiZXhwIjoxNzU2Nzg1MDQ3fQ.ize7_q1QdawZRolke8jAVGYZahrU5Ywv8FPcZ4JZBZs';

console.log('🔍 Analisando token...');
console.log('🔑 Token:', token);

try {
  // Tentar decodificar sem verificar (para ver o conteúdo)
  const decoded = jwt.decode(token);
  console.log('📋 Conteúdo do token:', JSON.stringify(decoded, null, 2));
  
  // Verificar se o token não expirou
  const now = Math.floor(Date.now() / 1000);
  console.log('⏰ Tempo atual:', now);
  console.log('⏰ Expira em:', decoded.exp);
  console.log('⏰ Token expirado:', now > decoded.exp ? 'SIM' : 'NÃO');
  
} catch (error) {
  console.log('❌ Erro ao decodificar token:', error.message);
}

// Testar com diferentes JWT_SECRETs
const possibleSecrets = [
  'your-secret-key',
  'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify',
  'sua-chave-secreta-super-forte-aqui'
];

console.log('\n🔐 Testando diferentes JWT_SECRETs...');

possibleSecrets.forEach((secret, index) => {
  try {
    const verified = jwt.verify(token, secret);
    console.log(`✅ Secret ${index + 1} funcionou:`, secret);
    console.log('   Dados:', JSON.stringify(verified, null, 2));
  } catch (error) {
    console.log(`❌ Secret ${index + 1} falhou:`, secret, '-', error.message);
  }
});
