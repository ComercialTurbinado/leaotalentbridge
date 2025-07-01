// Script para testar o login dos usuários criados
require('dotenv').config({ path: '.env.local' });
// Importação correta do node-fetch para versões mais recentes do Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configurações
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const USERS = [
  {
    email: 'empresa@teste.com',
    password: 'Teste@123',
    type: 'empresa'
  },
  {
    email: 'admin@teste.com',
    password: 'Teste@123',
    type: 'admin'
  }
];

// Função para testar login
async function testLogin(user) {
  try {
    console.log(`\nTestando login para ${user.email} (${user.type})...`);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        type: user.type
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login bem-sucedido!');
      console.log('Token JWT:', data.token.substring(0, 20) + '...');
      console.log('Dados do usuário:', JSON.stringify(data.user, null, 2));
      return data.token;
    } else {
      console.log('❌ Falha no login:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao testar login:', error);
    return null;
  }
}

// Função para testar acesso a rotas protegidas
async function testProtectedRoute(token, route) {
  try {
    console.log(`\nTestando acesso à rota protegida: ${route}`);
    
    const response = await fetch(`${API_URL}/${route}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Resposta:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao acessar rota protegida:', error);
    return null;
  }
}

// Função principal para executar os testes
async function runTests() {
  console.log('🔍 Iniciando testes de login e acesso...');
  console.log('API URL:', API_URL);
  
  // Testar login para cada usuário
  for (const user of USERS) {
    const token = await testLogin(user);
    
    if (token) {
      // Testar acesso a rotas protegidas com base no tipo de usuário
      if (user.type === 'empresa') {
        await testProtectedRoute(token, 'companies');
      } else if (user.type === 'admin') {
        await testProtectedRoute(token, 'users');
      }
    }
  }
  
  console.log('\n✨ Testes concluídos!');
}

// Executar testes
runTests(); 