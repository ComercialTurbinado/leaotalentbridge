// Script para testar a criação de uma vaga de emprego
require('dotenv').config({ path: '.env.local' });
// Importação correta do node-fetch para versões mais recentes do Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configurações
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const USER = {
  email: 'empresa@teste.com',
  password: 'Teste@123',
  type: 'empresa'
};

// Função para fazer login e obter token
async function login() {
  try {
    console.log(`\nFazendo login como ${USER.email}...`);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(USER)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login bem-sucedido!');
      return { token: data.token, userId: data.user.id };
    } else {
      console.log('❌ Falha no login:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    return null;
  }
}

// Função para obter o ID da empresa
async function getCompanyId(token) {
  try {
    console.log('\nBuscando ID da empresa...');
    
    const response = await fetch(`${API_URL}/companies`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      const company = data.data.find(c => c.email === USER.email);
      if (company) {
        console.log('✅ ID da empresa encontrado:', company._id);
        return company._id;
      }
    }
    
    console.log('❌ Empresa não encontrada');
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    return null;
  }
}

// Função para criar uma vaga de emprego
async function createJob(token, companyId, userId) {
  try {
    console.log('\nCriando vaga de emprego...');
    
    const jobData = {
      companyId: companyId,
      title: 'Desenvolvedor Full Stack',
      description: 'Estamos procurando um desenvolvedor Full Stack com experiência em React, Node.js e MongoDB para trabalhar em projetos inovadores.',
      summary: 'Vaga para desenvolvedor Full Stack com experiência em React, Node.js e MongoDB.',
      department: 'Tecnologia',
      location: {
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        isRemote: true,
        remoteOptions: 'hybrid'
      },
      workType: 'full_time',
      workSchedule: 'flexible',
      salary: {
        min: 6000,
        max: 12000,
        currency: 'BRL',
        isNegotiable: true,
        paymentFrequency: 'monthly',
        benefits: [
          'Vale Refeição',
          'Plano de Saúde',
          'Vale Transporte',
          'Gympass'
        ]
      },
      requirements: {
        education: {
          level: 'bachelor',
          field: 'Ciência da Computação ou áreas relacionadas',
          required: false
        },
        experience: {
          minYears: 2,
          maxYears: 5,
          level: 'mid',
          required: true
        },
        skills: {
          technical: [
            'React',
            'Node.js',
            'MongoDB',
            'TypeScript',
            'Git'
          ],
          soft: [
            'Comunicação',
            'Trabalho em equipe',
            'Resolução de problemas'
          ],
          languages: [
            {
              language: 'Português',
              level: 'native',
              required: true
            },
            {
              language: 'Inglês',
              level: 'intermediate',
              required: true
            }
          ]
        }
      },
      status: 'active',
      priority: 'medium',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias a partir de hoje
      applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias a partir de hoje
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 dias a partir de hoje
      maxApplications: 50,
      autoScreening: true,
      questionsRequired: true,
      customQuestions: [
        {
          question: 'Qual sua experiência com React?',
          type: 'text',
          required: true
        },
        {
          question: 'Você tem disponibilidade para trabalhar presencialmente 2 dias por semana?',
          type: 'boolean',
          required: true
        }
      ],
      tags: ['react', 'node.js', 'mongodb', 'typescript', 'full-stack'],
      category: 'technology',
      createdBy: userId
    };
    
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Vaga criada com sucesso!');
      console.log('Detalhes da vaga:', JSON.stringify(data.data, null, 2));
      return data.data;
    } else {
      console.log('❌ Falha ao criar vaga:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao criar vaga:', error);
    return null;
  }
}

// Função principal para executar os testes
async function runTests() {
  console.log('🔍 Iniciando teste de criação de vaga...');
  console.log('API URL:', API_URL);
  
  // Fazer login
  const auth = await login();
  if (!auth) {
    console.log('❌ Não foi possível continuar sem autenticação');
    return;
  }
  
  // Obter ID da empresa
  const companyId = await getCompanyId(auth.token);
  if (!companyId) {
    console.log('❌ Não foi possível continuar sem o ID da empresa');
    return;
  }
  
  // Criar vaga
  const job = await createJob(auth.token, companyId, auth.userId);
  if (job) {
    console.log('\n✨ Teste concluído com sucesso!');
  } else {
    console.log('\n❌ Teste falhou');
  }
}

// Executar testes
runTests(); 