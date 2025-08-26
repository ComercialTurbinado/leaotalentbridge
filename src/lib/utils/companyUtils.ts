// Mapeamento de valores em português para os enums de empresa
export const industryMapping: { [key: string]: string } = {
  'tecnologia': 'technology',
  'financeiro': 'finance',
  'saude': 'healthcare',
  'educacao': 'education',
  'varejo': 'retail',
  'manufatura': 'manufacturing',
  'construcao': 'construction',
  'hospitalidade': 'hospitality',
  'consultoria': 'consulting',
  'marketing': 'marketing',
  'imoveis': 'real_estate',
  'energia': 'energy',
  'telecomunicacoes': 'telecommunications',
  'automotivo': 'automotive',
  'aeroespacial': 'aerospace',
  'logistica': 'logistics',
  'outros': 'other'
};

// Mapeamento de tamanhos em português
export const sizeMapping: { [key: string]: string } = {
  'startup': 'startup',
  'pequena': 'small',
  'media': 'medium',
  'grande': 'large',
  'empresa': 'enterprise'
};

// Função para mapear industry
export function mapIndustry(industry: string): string {
  return industryMapping[industry?.toLowerCase()] || industry;
}

// Função para mapear size
export function mapSize(size: string): string {
  return sizeMapping[size?.toLowerCase()] || size;
}

// Função para validar website
export function validateWebsite(website: string): boolean {
  if (!website) return true; // Website é opcional
  return /^https?:\/\/.+/.test(website);
}

// Função para processar dados de empresa
export function processCompanyData(data: any) {
  const processed = { ...data };
  
  // Mapear industry se fornecido
  if (processed.industry) {
    processed.industry = mapIndustry(processed.industry);
  }
  
  // Mapear size se fornecido
  if (processed.size) {
    processed.size = mapSize(processed.size);
  }
  
  return processed;
}
