const https = require('https');

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
        // Testar com dados mais simples
        testSimpleCompany(loginResult.token);
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

function testSimpleCompany(token) {
  console.log('\n🏢 Testando criação de empresa com dados simples...');
  
  // Dados mais simples
  const companyData = JSON.stringify({
    name: 'Empresa Simples',
    email: 'simples@empresa.com',
    industry: 'Tecnologia',
    primaryContact: {
      name: 'João Silva',
      position: 'CEO'
    }
  });
  
  const options = {
    hostname: 'uaecareers.com',
    port: 443,
    path: '/api/admin/companies/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': companyData.length
    }
  };

  console.log('📡 Fazendo requisição para:', options.hostname + options.path);
  console.log('📝 Dados enviados:', companyData);

  const req = https.request(options, (res) => {
    console.log('📊 Status da resposta:', res.statusCode);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('📄 Resposta completa:', responseData);
      try {
        const result = JSON.parse(responseData);
        console.log('✅ Resultado:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('❌ Erro ao fazer parse da resposta:', e.message);
        console.log('📄 Resposta bruta:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro na requisição:', error.message);
  });

  req.write(companyData);
  req.end();
}
