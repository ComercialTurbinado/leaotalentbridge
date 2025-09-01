import { useMemo } from 'react';
import ptBR from '../../locales/pt-BR.json';

type TranslationKey = string;
type TranslationParams = Record<string, string | number>;

export const useI18n = () => {
  const t = useMemo(() => {
    return (key: TranslationKey, params?: TranslationParams): string => {
      // Dividir a chave por pontos para navegar no objeto
      const keys = key.split('.');
      let value: any = ptBR;
      
      // Navegar pela estrutura do objeto
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Se não encontrar a chave, retornar a própria chave
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }
      
      // Se o valor não for string, retornar a chave
      if (typeof value !== 'string') {
        console.warn(`Translation value is not a string: ${key}`);
        return key;
      }
      
      // Substituir parâmetros se fornecidos
      if (params) {
        return Object.entries(params).reduce((str, [param, replacement]) => {
          return str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(replacement));
        }, value);
      }
      
      return value;
    };
  }, []);

  return { t };
};

// Hook específico para status
export const useStatusTranslation = () => {
  const { t } = useI18n();
  
  const translateUserStatus = (status: string): string => {
    return t(`status.userCandidate.${status}`) || status;
  };
  
  const translateCompanyStatus = (status: string): string => {
    return t(`status.company.${status}`) || status;
  };
  
  const translateApplicationStatus = (status: string): string => {
    return t(`status.application.${status}`) || status;
  };
  
  const translateInterviewStatus = (status: string): string => {
    return t(`status.interview.${status}`) || status;
  };
  
  const translateDocumentStatus = (status: string): string => {
    return t(`status.document.${status}`) || status;
  };
  
  return {
    translateUserStatus,
    translateCompanyStatus,
    translateApplicationStatus,
    translateInterviewStatus,
    translateDocumentStatus
  };
};

// Hook específico para seções
export const useSectionTranslation = () => {
  const { t } = useI18n();
  
  const translateSection = (section: string): string => {
    return t(`sections.${section}`);
  };
  
  return { translateSection };
};

// Hook específico para indústrias e tamanhos
export const useIndustryTranslation = () => {
  const { t } = useI18n();
  
  const translateIndustry = (industry: string): string => {
    return t(`industries.${industry}`) || industry;
  };
  
  const translateCompanySize = (size: string): string => {
    return t(`companySizes.${size}`) || size;
  };
  
  return { translateIndustry, translateCompanySize };
};
