const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações de busca e substituição
const replacements = [
  // Marca
  {
    pattern: /Le[aã]o\s*Talent\s*Bridge/gi,
    replacement: 'UAE Careers',
    description: 'Substituir marca Leão Talent Bridge por UAE Careers'
  },
  // Email → E-mail
  {
    pattern: /\bEmail\b/g,
    replacement: 'E-mail',
    description: 'Substituir Email por E-mail'
  },
  // Tamanho → Porte
  {
    pattern: /\bTamanho\b/g,
    replacement: 'Porte',
    description: 'Substituir Tamanho por Porte'
  },
  // Todos os Tamanhos → Todos os Portes
  {
    pattern: /Todos\s+os\s+Tamanhos/g,
    replacement: 'Todos os Portes',
    description: 'Substituir Todos os Tamanhos por Todos os Portes'
  },
  // Rejeitado → Reprovado (apenas em UI, não em chaves)
  {
    pattern: /(?<!['"`])\bRejeitado\b(?!['"`])/g,
    replacement: 'Reprovado',
    description: 'Substituir Rejeitado por Reprovado (apenas em UI)'
  }
];

// Extensões de arquivo para processar
const fileExtensions = ['.tsx', '.ts', '.js', '.jsx', '.json'];

// Diretórios para ignorar
const ignoreDirs = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.npm-cache'
];

// Função para verificar se deve ignorar o arquivo
function shouldIgnoreFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  return ignoreDirs.some(dir => relativePath.includes(dir));
}

// Função para verificar se é um arquivo válido
function isValidFile(filePath) {
  const ext = path.extname(filePath);
  return fileExtensions.includes(ext);
}

// Função para aplicar substituições em um arquivo
function applyReplacementsToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let hasChanges = false;

    replacements.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        modifiedContent = modifiedContent.replace(pattern, replacement);
        hasChanges = true;
        console.log(`  ✅ ${description}: ${matches.length} ocorrência(s)`);
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Função para processar diretório recursivamente
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let totalFiles = 0;
  let modifiedFiles = 0;

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!shouldIgnoreFile(fullPath)) {
        const { files, modified } = processDirectory(fullPath);
        totalFiles += files;
        modifiedFiles += modified;
      }
    } else if (stat.isFile() && isValidFile(fullPath)) {
      totalFiles++;
      if (applyReplacementsToFile(fullPath)) {
        modifiedFiles++;
      }
    }
  });

  return { files: totalFiles, modified: modifiedFiles };
}

// Função principal
function applyStandardization() {
  console.log('🚀 Iniciando padronização automática...\n');

  const startTime = Date.now();
  const { files, modified } = processDirectory(process.cwd());
  const endTime = Date.now();

  console.log('\n📊 Resumo da padronização:');
  console.log(`  📁 Arquivos processados: ${files}`);
  console.log(`  ✏️  Arquivos modificados: ${modified}`);
  console.log(`  ⏱️  Tempo total: ${endTime - startTime}ms`);

  if (modified > 0) {
    console.log('\n✅ Padronização concluída!');
    console.log('💡 Próximos passos:');
    console.log('   1. Revisar as mudanças automaticas');
    console.log('   2. Testar a aplicação');
    console.log('   3. Fazer commit das mudanças');
  } else {
    console.log('\nℹ️  Nenhuma mudança necessária encontrada.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applyStandardization();
}

module.exports = { applyStandardization, replacements };
