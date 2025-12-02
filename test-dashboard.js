const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
async function testDashboard() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado com sucesso!');

    // Importar modelos
    const User = require('./src/lib/models/User');
    const CandidateDocument = require('./src/lib/models/CandidateDocument');
    const Interview = require('./src/lib/models/Interview');
    const Application = require('./src/lib/models/Application');

    // Buscar um candidato de teste
    console.log('\n👤 Buscando candidatos...');
    const candidatos = await User.find({ type: 'candidato' }).limit(3);
    
    if (candidatos.length === 0) {
      console.log('❌ Nenhum candidato encontrado');
      return;
    }

    const candidato = candidatos[0];
    console.log(`✅ Candidato encontrado: ${candidato.name} (${candidato.email})`);

    // Testar dados do dashboard
    console.log('\n📊 Testando dados do dashboard...');
    
    // Documentos
    const documentos = await CandidateDocument.find({ candidateId: candidato._id });
    console.log(`📄 Documentos: ${documentos.length} total`);
    console.log(`   - Pendentes: ${documentos.filter(d => d.status === 'pending').length}`);
    console.log(`   - Aprovados: ${documentos.filter(d => d.status === 'verified').length}`);
    console.log(`   - Rejeitados: ${documentos.filter(d => d.status === 'rejected').length}`);

    // Entrevistas
    const entrevistas = await Interview.find({ candidateId: candidato._id });
    console.log(`🎯 Entrevistas: ${entrevistas.length} total`);
    console.log(`   - Agendadas: ${entrevistas.filter(e => e.status === 'scheduled').length}`);
    console.log(`   - Concluídas: ${entrevistas.filter(e => e.status === 'completed').length}`);

    // Candidaturas
    const candidaturas = await Application.find({ candidateId: candidato._id });
    console.log(`💼 Candidaturas: ${candidaturas.length} total`);
    console.log(`   - Pendentes: ${candidaturas.filter(c => c.status === 'pending').length}`);
    console.log(`   - Pré-selecionadas: ${candidaturas.filter(c => c.status === 'shortlisted').length}`);

    // Testar cálculo de completude do perfil
    console.log('\n📈 Testando cálculo de completude do perfil...');
    
    const requiredFields = [
      'name', 'email', 'phone', 'birthDate', 'nationality',
      'address.city', 'address.state', 'professionalInfo.summary',
      'skills', 'education', 'languages'
    ];

    let score = 0;
    const maxScore = requiredFields.length;

    requiredFields.forEach(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentValue = candidato[parent];
        if (parentValue && parentValue[child]) {
          score++;
        }
      } else {
        const value = candidato[field];
        if (value) {
          if (Array.isArray(value) && value.length > 0) {
            score++;
          } else if (typeof value === 'string' && value.trim().length > 0) {
            score++;
          } else if (value !== undefined && value !== null) {
            score++;
          }
        }
      }
    });

    const completude = Math.round((score / maxScore) * 100);
    console.log(`✅ Completude do perfil: ${completude}% (${score}/${maxScore} campos)`);

    // Testar API do dashboard
    console.log('\n🌐 Testando API do dashboard...');
    try {
      const response = await fetch(`http://localhost:3000/api/candidates/dashboard-summary`, {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test'}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API do dashboard respondendo');
        console.log(`   - Alertas: ${data.alerts?.length || 0}`);
        console.log(`   - Estatísticas: ${Object.keys(data.quickStats || {}).length} campos`);
        console.log(`   - Atividades recentes: ${data.recentActivity?.length || 0}`);
      } else {
        console.log(`⚠️ API retornou status: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️ API não está rodando ou erro de conexão');
    }

    console.log('\n🎉 Teste do dashboard concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexão com MongoDB fechada');
  }
}

testDashboard();
