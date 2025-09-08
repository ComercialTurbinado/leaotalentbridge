const https = require('https');

const options = {
  hostname: 'uaecareers.com',
  port: 443,
  path: '/api/debug-admin/',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const data = JSON.parse(responseData);
      console.log('\n=== TODOS OS ADMINS NO SISTEMA ===');
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Response (raw):', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
