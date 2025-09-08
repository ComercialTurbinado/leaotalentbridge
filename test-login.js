const https = require('https');

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
        console.log('Headers:', res.headers);
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

testLogin().catch(console.error); 