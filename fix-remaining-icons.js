const fs = require('fs');
const path = require('path');

// Lista de substituições específicas para ícones restantes
const finalIconFixes = {
  'Building2': 'GrOrganization',
  'MapPin': 'GrLocation', 
  'Users': 'GrGroup',
  'GrSettings': '', // Remover - não existe
  'GrLinkExternal': 'GrLink', // Usar GrLink em vez de GrLinkExternal
  'Calendar as CalendarIcon': 'GrCalendar', // Corrigir import com alias
  'ThumbsDown': 'GrDislike',
  'Bookmark': 'GrBookmark',
  'Paperclip': 'GrAttachment',
  'Archive': 'GrArchive',
  'Handshake': 'GrGroup',
  'Coffee': 'GrCoffee',
  'Languages': 'GrLanguage',
  'Github': 'GrGithub',
  'Database': 'GrStorage',
  'Quote': 'GrChat',
  'Plane': 'GrPlan',
  'FileCheck': 'GrDocument',
  'Linkedin': 'GrLinkedin'
};

function fixRemainingIcons(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Aplicar cada substituição
    Object.keys(finalIconFixes).forEach(oldIcon => {
      const newIcon = finalIconFixes[oldIcon];
      
      if (newIcon === '') {
        // Remover ícone do import se não existe
        const removeFromImportRegex = new RegExp(`,\\s*${oldIcon}|${oldIcon}\\s*,`, 'g');
        if (content.match(removeFromImportRegex)) {
          content = content.replace(removeFromImportRegex, '');
          hasChanges = true;
          console.log(`  Removido: ${oldIcon}`);
        }
      } else {
        // Substituir uso do ícone no JSX
        const iconUsageRegex = new RegExp(`<${oldIcon}\\s`, 'g');
        if (content.match(iconUsageRegex)) {
          content = content.replace(iconUsageRegex, `<${newIcon} `);
          hasChanges = true;
          console.log(`  ${oldIcon} -> ${newIcon}`);
        }

        // Substituir no import
        const importRegex = new RegExp(`\\b${oldIcon}\\b`, 'g');
        if (content.includes(`import`) && content.match(importRegex)) {
          content = content.replace(importRegex, newIcon);
          hasChanges = true;
        }

        // Substituir em referências diretas (como icon: Building2)
        const directRefRegex = new RegExp(`\\bicon:\\s*${oldIcon}\\b`, 'g');
        if (content.match(directRefRegex)) {
          content = content.replace(directRefRegex, `icon: ${newIcon}`);
          hasChanges = true;
          console.log(`  Referência: ${oldIcon} -> ${newIcon}`);
        }
      }
    });

    // Limpar imports vazios ou duplicados
    content = content.replace(/,\s*,/g, ','); // Remove vírgulas duplas
    content = content.replace(/{\s*,/g, '{'); // Remove vírgula no início
    content = content.replace(/,\s*}/g, '}'); // Remove vírgula no final

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalFiles = 0;
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      totalFiles += processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      console.log(`Processando: ${filePath}`);
      if (fixRemainingIcons(filePath)) {
        totalFiles++;
        console.log(`  ✅ Arquivo atualizado`);
      }
    }
  });
  
  return totalFiles;
}

// Executar o script
console.log('🔄 Corrigindo ícones restantes...\n');

const srcPath = path.join(__dirname, 'src');
const totalFilesChanged = processDirectory(srcPath);

console.log(`\n✅ Concluído! ${totalFilesChanged} arquivos foram atualizados.`); 