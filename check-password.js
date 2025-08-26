const https = require('https');

// Função para atualizar a senha do candidato com criptografia correta
const updateCandidatePassword = async () => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('123123', 10);
  
  console.log('Senha original: 123123');
  console.log('Senha criptografada:', hashedPassword);
  
  const data = JSON.stringify({
    email: 'teste4@teste.com',
    password: '123123',
    status: 'approved'
  });

  const options = {
    hostname: 'uaecareers.com',
    port: 443,
    path: '/api/debug-candidato/',
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', responseData);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

// Função para testar o login após a atualização
const testLogin = async () => {
  const data = JSON.stringify({
    email: 'teste4@teste.com',
    password: '123123',
    type: 'candidato'
  });

  const options = {
    hostname: 'uaecareers.com',
    port: 443,
    path: '/api/auth/login/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', responseData);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

const main = async () => {
  console.log('🔧 Atualizando senha do candidato...');
  await updateCandidatePassword();
  
  console.log('\n⏳ Aguardando 5 segundos para o deploy...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n🔍 Testando login...');
  await testLogin();
  
  console.log('\n✅ Processo concluído!');
};

main().catch(console.error);
