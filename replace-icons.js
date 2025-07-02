const fs = require('fs');
const path = require('path');

// Mapeamento dos ícones mais comuns
const iconMapping = {
  // Navegação e UI
  'Menu': 'GrMenu',
  'X': 'GrClose',
  'Bell': 'GrNotification',
  'Settings': 'GrSettings',
  'LogOut': 'GrLogout',
  'User': 'GrUser',
  'Home': 'GrHome',
  'Search': 'GrSearch',
  'Filter': 'GrFilter',
  'Plus': 'GrAdd',
  'Edit': 'GrEdit',
  'Trash2': 'GrTrash',
  'MoreVertical': 'GrMore',
  'ChevronDown': 'GrDown',
  'ChevronUp': 'GrUp',
  'ChevronLeft': 'GrPrevious',
  'ChevronRight': 'GrNext',
  'ArrowRight': 'GrNext',
  'ArrowLeft': 'GrPrevious',
  
  // Formulários
  'Mail': 'GrMail',
  'Lock': 'GrLock',
  'Eye': 'GrView',
  'EyeOff': 'GrHide',
  'Phone': 'GrPhone',
  'MapPin': 'GrLocation',
  'Calendar': 'GrCalendar',
  'Clock': 'GrClock',
  'Upload': 'GrUpload',
  'Download': 'GrDownload',
  'FileText': 'GrDocument',
  'Image': 'GrImage',
  'Camera': 'GrCamera',
  
  // Status e Alertas
  'AlertCircle': 'GrStatusWarning',
  'CheckCircle': 'GrStatusGood',
  'XCircle': 'GrStatusCritical',
  'Info': 'GrStatusInfo',
  'AlertTriangle': 'GrStatusWarning',
  'Check': 'GrCheckbox',
  
  // Negócios
  'Building2': 'GrOrganization',
  'Briefcase': 'GrBriefcase',
  'Users': 'GrGroup',
  'UserPlus': 'GrUserAdd',
  'TrendingUp': 'GrLineChart',
  'BarChart3': 'GrBarChart',
  'PieChart': 'GrPieChart',
  'DollarSign': 'GrMoney',
  'CreditCard': 'GrCreditCard',
  'Star': 'GrStar',
  'Heart': 'GrFavorite',
  'Share2': 'GrShare',
  'MessageCircle': 'GrChat',
  'Send': 'GrSend',
  
  // Mídia
  'Play': 'GrPlay',
  'Pause': 'GrPause',
  'Volume2': 'GrVolume',
  'VolumeX': 'GrVolumeMute',
  'Video': 'GrVideo',
  'Mic': 'GrMicrophone',
  'MicOff': 'GrMicrophoneOff',
  
  // Arquivos
  'FolderOpen': 'GrFolderOpen',
  'Folder': 'GrFolder',
  'File': 'GrDocument',
  'Save': 'GrSave',
  'Copy': 'GrCopy',
  'Clipboard': 'GrClipboard',
  'Link': 'GrLink',
  'ExternalLink': 'GrLinkExternal',
  
  // Outros comuns
  'Globe': 'GrGlobe',
  'Wifi': 'GrWifi',
  'Shield': 'GrShield',
  'Key': 'GrKey',
  'Zap': 'GrPower',
  'RefreshCw': 'GrRefresh',
  'RotateCcw': 'GrUndo',
  'RotateCw': 'GrRedo'
};

function replaceIconsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Verificar se o arquivo usa lucide-react
    if (!content.includes('from \'lucide-react\'')) {
      return false;
    }
    
    console.log(`Processando: ${filePath}`);
    
    // Extrair os ícones importados do lucide-react
    const importRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"];?/g;
    const match = importRegex.exec(content);
    
    if (match) {
      const importedIcons = match[1]
        .split(',')
        .map(icon => icon.trim())
        .filter(icon => icon.length > 0);
      
      // Mapear para react-icons/gr
      const mappedIcons = [];
      const unmappedIcons = [];
      
      importedIcons.forEach(icon => {
        if (iconMapping[icon]) {
          mappedIcons.push(iconMapping[icon]);
          // Substituir todas as ocorrências do ícone no código
          const iconRegex = new RegExp(`<${icon}\\s`, 'g');
          if (content.match(iconRegex)) {
            content = content.replace(iconRegex, `<${iconMapping[icon]} `);
            hasChanges = true;
          }
        } else {
          unmappedIcons.push(icon);
        }
      });
      
      if (mappedIcons.length > 0) {
        // Substituir o import
        const newImport = `import { ${mappedIcons.join(', ')} } from 'react-icons/gr';`;
        content = content.replace(importRegex, newImport);
        hasChanges = true;
        
        if (unmappedIcons.length > 0) {
          console.log(`  ⚠️  Ícones não mapeados: ${unmappedIcons.join(', ')}`);
        }
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Arquivo atualizado`);
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
      if (replaceIconsInFile(filePath)) {
        totalFiles++;
      }
    }
  });
  
  return totalFiles;
}

// Executar o script
console.log('🔄 Iniciando substituição de ícones...\n');

const srcPath = path.join(__dirname, 'src');
const totalFilesChanged = processDirectory(srcPath);

console.log(`\n✅ Concluído! ${totalFilesChanged} arquivos foram atualizados.`);
console.log('\n📝 Lembre-se de:');
console.log('1. Verificar se não há erros de compilação');
console.log('2. Testar a aplicação para garantir que os ícones estão funcionando');
console.log('3. Fazer commit das alterações'); 