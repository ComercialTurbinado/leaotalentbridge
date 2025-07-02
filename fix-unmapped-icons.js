const fs = require('fs');
const path = require('path');

// Mapeamento de ícones não encontrados para equivalentes disponíveis
const unmappedIconFixes = {
  // Ícones não encontrados -> ícones disponíveis no react-icons/gr
  'BookOpen': 'GrBook',
  'Award': 'GrTrophy', 
  'Grid': 'GrApps',
  'List': 'GrList',
  'Code': 'GrCode',
  'Palette': 'GrPaint',
  'MessageSquare': 'GrChat',
  'Crown': 'GrStar', // Aproximação
  'GraduationCap': 'GrBook', // Aproximação
  'Linkedin': 'GrLinkedin',
  'Ban': 'GrBlock',
  'UserCheck': 'GrUser',
  'UserX': 'GrUser',
  'Activity': 'GrLineChart',
  'Target': 'GrTarget',
  'Brain': 'GrCode', // Aproximação
  'PauseCircle': 'GrPause',
  'SkipForward': 'GrNext',
  'SkipBack': 'GrPrevious',
  'ThumbsUp': 'GrLike',
  'ThumbsDown': 'GrDislike',
  'Bookmark': 'GrBookmark',
  'Maximize': 'GrExpand',
  'Edit3': 'GrEdit',
  'History': 'GrHistory',
  'FileImage': 'GrImage',
  'FileSpreadsheet': 'GrDocument',
  'FileVideo': 'GrVideo',
  'Paperclip': 'GrAttachment',
  'Inbox': 'GrInbox',
  'Archive': 'GrArchive',
  'Building': 'GrOrganization',
  'Handshake': 'GrGroup', // Aproximação
  'Coffee': 'GrCoffee',
  'Languages': 'GrLanguage',
  'Github': 'GrGithub',
  'Database': 'GrStorage',
  'Quote': 'GrChat', // Aproximação
  'Plane': 'GrPlan', // Aproximação
  'FileCheck': 'GrDocument'
};

function fixUnmappedIcons(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Para cada ícone não mapeado, substituir no código
    Object.keys(unmappedIconFixes).forEach(oldIcon => {
      const newIcon = unmappedIconFixes[oldIcon];
      
      // Substituir uso do ícone no JSX
      const iconUsageRegex = new RegExp(`<${oldIcon}\\s`, 'g');
      if (content.match(iconUsageRegex)) {
        content = content.replace(iconUsageRegex, `<${newIcon} `);
        hasChanges = true;
        console.log(`  ${oldIcon} -> ${newIcon}`);
      }

      // Substituir no import se existir
      const importRegex = new RegExp(`\\b${oldIcon}\\b`, 'g');
      if (content.includes(`import`) && content.match(importRegex)) {
        content = content.replace(importRegex, newIcon);
        hasChanges = true;
      }
    });

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
      if (fixUnmappedIcons(filePath)) {
        totalFiles++;
        console.log(`  ✅ Arquivo atualizado`);
      }
    }
  });
  
  return totalFiles;
}

// Executar o script
console.log('🔄 Corrigindo ícones não mapeados...\n');

const srcPath = path.join(__dirname, 'src');
const totalFilesChanged = processDirectory(srcPath);

console.log(`\n✅ Concluído! ${totalFilesChanged} arquivos foram atualizados.`); 