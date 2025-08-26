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
        // Agora testar a API de empresas
        testCompaniesAPI(loginResult.token);
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

function testCompaniesAPI(token) {
  console.log('\n🏢 Testando API de empresas...');
  
  // Dados de teste para uma empresa
  const companyData = JSON.stringify({
    name: 'Empresa Teste API',
    email: 'teste@empresa.com',
    cnpj: '12.345.678/0001-90',
    phone: '+55 11 99999-9999',
    industry: 'Tecnologia',
    size: 'medium',
    address: {
      street: 'Rua Teste, 123',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      zipCode: '01234-567'
    },
    website: 'https://empresa-teste.com',
    linkedin: 'https://linkedin.com/company/empresa-teste',
    description: 'Empresa de teste criada via API',
    logo: '',
    primaryContact: {
      name: 'João Silva',
      position: 'CEO',
      email: 'joao@empresa.com',
      phone: '+55 11 88888-8888'
    },
    status: 'active'
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
  console.log('🔑 Token:', token.substring(0, 50) + '...');

  const req = https.request(options, (res) => {
    console.log('📊 Status da resposta:', res.statusCode);
    console.log('📋 Headers:', res.headers);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('📄 Resposta completa:', responseData);
      try {
        const result = JSON.parse(responseData);
        console.log('✅ Resultado da criação de empresa:', JSON.stringify(result, null, 2));
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
