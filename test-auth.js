const https = require('https');

// Primeiro, vamos fazer login para obter o token
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
      console.log('✅ Login resultado:', loginResult);
      
      if (loginResult.success && loginResult.token) {
        // Agora testar a autenticação
        testAuth(loginResult.token);
      } else {
        console.log('❌ Falha no login');
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

function testAuth(token) {
  console.log('\n🔍 Testando autenticação...');
  console.log('🔑 Token:', token.substring(0, 50) + '...');
  
  const authData = JSON.stringify({ token });
  
  const authOptions = {
    hostname: 'uaecareers.com',
    port: 443,
    path: '/api/debug-auth/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': authData.length
    }
  };

  console.log('📡 Fazendo requisição para:', authOptions.hostname + authOptions.path);

  const authReq = https.request(authOptions, (res) => {
    console.log('📊 Status da resposta:', res.statusCode);
    console.log('📋 Headers:', res.headers);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('📄 Resposta completa:', responseData);
      try {
        const authResult = JSON.parse(responseData);
        console.log('✅ Resultado da autenticação:', JSON.stringify(authResult, null, 2));
      } catch (e) {
        console.log('❌ Erro ao fazer parse da resposta:', e.message);
        console.log('📄 Resposta bruta:', responseData);
      }
    });
  });

  authReq.on('error', (error) => {
    console.error('❌ Erro na requisição:', error.message);
    console.error('❌ Detalhes do erro:', error);
  });

  authReq.write(authData);
  authReq.end();
}
