// Mapas de tradução para status
export const userCandidateStatusLabel: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Reprovado', // exibe Reprovado
  suspended: 'Suspenso'
};

export const companyStatusLabel: Record<string, string> = {
  active: 'Ativa',
  inactive: 'Inativa',
  pending: 'Pendente',
  suspended: 'Suspensa',
  rejected: 'Rejeitada'
};

export const applicationStatusLabel: Record<string, string> = {
  pending: 'Pendente',
  reviewed: 'Analisada',
  shortlisted: 'Pré-selecionada',
  rejected: 'Reprovada',
  accepted: 'Aceita'
};

export const interviewStatusLabel: Record<string, string> = {
  pending_approval: 'Aguardando Aprovação',
  scheduled: 'Agendada',
  confirmed: 'Confirmada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  no_show: 'Não Compareceu',
  rejected: 'Reprovada'
};

export const documentStatusLabel: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Reprovado'
};

// Função helper para garantir ponto final em subtítulos
export const withPeriod = (label: string): string => {
  if (!label) return label;
  const trimmed = label.trim();
  if (trimmed.endsWith('.')) return trimmed;
  return `${trimmed}.`;
};

// Função para capitalizar primeira letra
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Função para traduzir indústrias
export const translateIndustry = (industry: string): string => {
  const industryMap: Record<string, string> = {
    technology: 'Tecnologia',
    finance: 'Financeiro',
    healthcare: 'Saúde',
    education: 'Educação',
    retail: 'Varejo',
    manufacturing: 'Manufatura',
    consulting: 'Consultoria',
    media: 'Mídia',
    real_estate: 'Imobiliário',
    transportation: 'Transporte',
    energy: 'Energia',
    food: 'Alimentação',
    fashion: 'Moda',
    automotive: 'Automotivo',
    pharmaceutical: 'Farmacêutico',
    telecommunications: 'Telecomunicações',
    tourism: 'Turismo',
    construction: 'Construção',
    agriculture: 'Agricultura',
    other: 'Outros'
  };
  
  return industryMap[industry] || capitalize(industry);
};

// Função para traduzir tamanho da empresa
export const translateCompanySize = (size: string): string => {
  const sizeMap: Record<string, string> = {
    startup: 'Startup (1-10)',
    small: 'Pequena (11-50)',
    medium: 'Média (51-200)',
    large: 'Grande (201-1000)',
    enterprise: 'Empresa (1000+)'
  };
  
  return sizeMap[size] || capitalize(size);
};

// Função para obter cor do status
export const getStatusColor = (status: string, type: 'user' | 'company' | 'application' | 'interview' | 'document' = 'user'): string => {
  const colorMap: Record<string, string> = {
    // Cores para usuários/candidatos
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    suspended: 'bg-gray-100 text-gray-800',
    
    // Cores para empresas
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    
    // Cores para candidaturas
    reviewed: 'bg-blue-100 text-blue-800',
    shortlisted: 'bg-purple-100 text-purple-800',
    accepted: 'bg-green-100 text-green-800',
    
    // Cores para entrevistas
    pending_approval: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-red-100 text-red-800',
    
    // Cores para documentos
    doc_approved: 'bg-green-100 text-green-800',
    doc_rejected: 'bg-red-100 text-red-800'
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};
