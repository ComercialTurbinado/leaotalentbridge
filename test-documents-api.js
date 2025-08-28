const fetch = require('node-fetch');

// Configurações
const BASE_URL = 'http://localhost:3000';
const TEST_CANDIDATE_EMAIL = 'teste@candidato.com';
const TEST_ADMIN_EMAIL = 'admin@teste.com';

// Função para fazer login
async function login(email, password, userType) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        userType
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    } else {
      throw new Error(`Login failed: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Erro no login ${userType}:`, error.message);
    return null;
  }
}

// Função para buscar documentos do candidato
async function getCandidateDocuments(candidateId, token) {
  try {
    const response = await fetch(`${BASE_URL}/api/candidates/${candidateId}/documents`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`Failed to get documents: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erro ao buscar documentos:', error.message);
    return null;
  }
}

// Função para buscar documentos via admin
async function getAdminDocuments(candidateId, token) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/candidates/${candidateId}/documents`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`Failed to get documents: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erro ao buscar documentos via admin:', error.message);
    return null;
  }
}

// Função para enviar documento como candidato
async function sendCandidateDocument(candidateId, token) {
  try {
    const documentData = {
      title: 'Teste de Documento',
      type: 'other',
      fileType: 'pdf',
      fileName: 'teste.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...',
      fileSize: 1024,
      mimeType: 'application/pdf',
      description: 'Documento de teste enviado pelo candidato'
    };

    const response = await fetch(`${BASE_URL}/api/candidates/${candidateId}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(documentData)
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(`Failed to send document: ${errorData.message}`);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar documento:', error.message);
    return null;
  }
}

// Função para enviar documento como admin
async function sendAdminDocument(candidateId, token) {
  try {
    const documentData = {
      title: 'Documento do Admin',
      type: 'form',
      fileType: 'pdf',
      fileName: 'formulario_admin.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...',
      fileSize: 2048,
      mimeType: 'application/pdf',
      description: 'Documento enviado pelo admin'
    };

    const response = await fetch(`${BASE_URL}/api/admin/candidates/${candidateId}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(documentData)
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(`Failed to send admin document: ${errorData.message}`);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar documento do admin:', error.message);
    return null;
  }
}

// Função principal de teste
async function runApiTest() {
  console.log('🚀 Iniciando teste da API de documentos...\n');

  try {
    // 1. Login como candidato
    console.log('1️⃣ Fazendo login como candidato...');
    const candidateToken = await login(TEST_CANDIDATE_EMAIL, 'senha123', 'candidato');
    if (!candidateToken) {
      console.log('❌ Falha no login do candidato. Criando usuário de teste...');
      // Aqui você pode adicionar lógica para criar o usuário se necessário
      return;
    }
    console.log('✅ Login do candidato realizado');

    // 2. Login como admin
    console.log('\n2️⃣ Fazendo login como admin...');
    const adminToken = await login(TEST_ADMIN_EMAIL, 'senha123', 'admin');
    if (!adminToken) {
      console.log('❌ Falha no login do admin. Criando usuário de teste...');
      return;
    }
    console.log('✅ Login do admin realizado');

    // 3. Buscar candidato ID (assumindo que o email é único)
    console.log('\n3️⃣ Buscando ID do candidato...');
    // Por simplicidade, vamos assumir um ID conhecido ou buscar via API
    const candidateId = '507f1f77bcf86cd799439011'; // ID de exemplo
    console.log(`📋 Usando ID do candidato: ${candidateId}`);

    // 4. Enviar documento como candidato
    console.log('\n4️⃣ Enviando documento como candidato...');
    const candidateDocResult = await sendCandidateDocument(candidateId, candidateToken);
    if (candidateDocResult) {
      console.log('✅ Documento enviado pelo candidato');
    }

    // 5. Enviar documento como admin
    console.log('\n5️⃣ Enviando documento como admin...');
    const adminDocResult = await sendAdminDocument(candidateId, adminToken);
    if (adminDocResult) {
      console.log('✅ Documento enviado pelo admin');
    }

    // 6. Buscar documentos como candidato
    console.log('\n6️⃣ Buscando documentos como candidato...');
    const candidateDocuments = await getCandidateDocuments(candidateId, candidateToken);
    if (candidateDocuments) {
      console.log(`📄 Documentos encontrados (candidato): ${candidateDocuments.data?.length || 0}`);
      if (candidateDocuments.data) {
        candidateDocuments.data.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc.title} (${doc.uploadedBy})`);
        });
      }
    }

    // 7. Buscar documentos como admin
    console.log('\n7️⃣ Buscando documentos como admin...');
    const adminDocuments = await getAdminDocuments(candidateId, adminToken);
    if (adminDocuments) {
      console.log(`📄 Documentos encontrados (admin): ${adminDocuments.data?.length || 0}`);
      if (adminDocuments.data) {
        adminDocuments.data.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc.title} (${doc.uploadedBy})`);
        });
      }
    }

    console.log('\n✅ Teste da API concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
runApiTest();
