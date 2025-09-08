import React from 'react';
import { getStatusColor } from '@/lib/utils/statusLabels';
import { useStatusTranslation } from '@/hooks/useI18n';

interface BadgeProps {
  status: string;
  type?: 'user' | 'company' | 'application' | 'interview' | 'document';
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  status, 
  type = 'user', 
  className = '',
  children 
}) => {
  const { 
    translateUserStatus, 
    translateCompanyStatus, 
    translateApplicationStatus, 
    translateInterviewStatus, 
    translateDocumentStatus 
  } = useStatusTranslation();

  const getTranslatedStatus = (): string => {
    switch (type) {
      case 'user':
        return translateUserStatus(status);
      case 'company':
        return translateCompanyStatus(status);
      case 'application':
        return translateApplicationStatus(status);
      case 'interview':
        return translateInterviewStatus(status);
      case 'document':
        return translateDocumentStatus(status);
      default:
        return translateUserStatus(status);
    }
  };

  const colorClasses = getStatusColor(status, type);
  const translatedStatus = getTranslatedStatus();

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses} ${className}`}
    >
      {children || translatedStatus}
    </span>
  );
};

export default Badge;
