const https = require('https');

const testViewDocument = () => {
  const candidatoId = '68adc96a4fae12498df74593';
  const documentId = '68adc96a4fae12498df74593'; // Vou usar o mesmo ID para teste
  
  const options = {
    hostname: 'uaecareers.com',
    port: 443,
    path: `/api/admin/candidates/${candidatoId}/documents/${documentId}`,
    method: 'GET',
    headers: {
      'Authorization': 'Bearer admin-token-test'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log('✅ Documento encontrado!');
            console.log('Título:', response.data.title);
            console.log('Tipo:', response.data.fileType);
            console.log('Tamanho:', response.data.fileSize);
            console.log('MIME:', response.data.mimeType);
          } else {
            console.log('❌ Erro:', response.message);
          }
        } catch (e) {
          console.log('❌ Erro ao parsear resposta:', e.message);
        }
      } else {
        console.log('❌ Erro HTTP:', res.statusCode);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Erro na requisição:', e.message);
  });

  req.end();
};

console.log('🔍 Testando API de visualização de documento...');
console.log('Candidato ID:', '68adc96a4fae12498df74593');
console.log('---');

testViewDocument();
