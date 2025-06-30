const seedExtended = require('./seed-extended');
const seedAdvanced = require('./seed-advanced');

async function seedCompleteDatabase() {
  console.log('🚀 Iniciando seed completo do banco de dados...\n');
  
  try {
    // 1. Executar seed básico
    console.log('📦 Executando seed básico (User, Company, Job, Simulation, SimulationAnswer)...');
    await seedExtended();
    console.log('✅ Seed básico concluído!\n');
    
    // 2. Executar seed avançado
    console.log('🔧 Executando seed avançado (Application, Payment, Notification, Analytics, Review)...');
    await seedAdvanced();
    console.log('✅ Seed avançado concluído!\n');
    
    console.log('🎉 SEED COMPLETO FINALIZADO COM SUCESSO!');
    console.log(`
📊 RESUMO FINAL:
═══════════════════════════════════════════════════════════════

📋 DADOS BÁSICOS:
• 2 empresas (Tech Solutions Dubai, Emirates Financial Group)
• 2 usuários candidatos (Carlos Silva, Ana Paula Oliveira)
• 2 vagas de emprego (Full Stack Developer, Marketing Manager)
• 2 simulações de entrevista (Técnica e Comportamental)
• 1 resposta de simulação

🔧 DADOS AVANÇADOS:
• 1 candidatura completa com screening
• 1 pagamento processado
• 1 notificação enviada
• 2 eventos de analytics
• 1 review de empresa

🎯 SISTEMA PRONTO PARA USO!
═══════════════════════════════════════════════════════════════
    `);
    
  } catch (error) {
    console.error('❌ Erro durante o seed completo:', error);
    process.exit(1);
  }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  seedCompleteDatabase();
}

module.exports = seedCompleteDatabase; 