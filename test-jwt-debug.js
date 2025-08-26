const https = require('https');
const jwt = require('jsonwebtoken');

// Primeiro, fazer login para obter o token
const loginData = JSON.stringify({
  email: 'admin@leaocareers.com',
  password: 'admin123',
  type: 'admin'
});

const loginOptions = {
  hostname: 'uaecareers.com',
  port: 443,
  path: '/api/auth/login/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('🔐 Fazendo login...');

const loginReq = https.request(loginOptions, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const loginResult = JSON.parse(responseData);
      console.log('✅ Login resultado:', loginResult.success ? 'Sucesso' : 'Falha');
      
      if (loginResult.success && loginResult.token) {
        // Testar verificação do JWT
        testJWTVerification(loginResult.token);
      } else {
        console.log('❌ Falha no login:', loginResult.message);
      }
    } catch (e) {
      console.log('❌ Erro no login:', responseData);
    }
  });
});

loginReq.on('error', (error) => {
  console.error('❌ Erro no login:', error);
});

loginReq.write(loginData);
loginReq.end();

function testJWTVerification(token) {
  console.log('\n🔍 Testando verificação do JWT...');
  console.log('🔑 Token:', token);
  
  // Tentar decodificar sem verificar (para ver o conteúdo)
  try {
    const decodedWithoutVerify = jwt.decode(token);
    console.log('📋 Token decodificado (sem verificar):', decodedWithoutVerify);
  } catch (e) {
    console.log('❌ Erro ao decodificar token:', e.message);
  }
  
  // Tentar verificar com diferentes secrets
  const possibleSecrets = [
    'your-secret-key',
    'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify',
    'leao-careers-jwt-secret-2024',
    'admin-secret-key'
  ];
  
  console.log('\n🔐 Testando diferentes JWT_SECRETs...');
  
  possibleSecrets.forEach((secret, index) => {
    try {
      const decoded = jwt.verify(token, secret);
      console.log(`✅ Secret ${index + 1} funcionou:`, {
        userId: decoded.userId,
        email: decoded.email,
        type: decoded.type
      });
    } catch (e) {
      console.log(`❌ Secret ${index + 1} falhou:`, e.message);
    }
  });
}
