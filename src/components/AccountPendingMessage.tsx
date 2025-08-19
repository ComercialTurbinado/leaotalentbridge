'use client';

import { useState } from 'react';
import { GrStatusWarning, GrClose, GrMail, GrClock, GrUser, GrOrganization } from 'react-icons/gr';
import styles from './AccountPendingMessage.module.css';

interface AccountPendingMessageProps {
  userType: 'candidato' | 'empresa';
  userName: string;
  userEmail: string;
  registrationDate?: string;
  onClose?: () => void;
  variant?: 'banner' | 'modal' | 'inline';
}

export default function AccountPendingMessage({ 
  userType, 
  userName, 
  userEmail, 
  registrationDate,
  onClose,
  variant = 'banner'
}: AccountPendingMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const getUserTypeText = () => {
    return userType === 'candidato' ? 'candidato' : 'empresa';
  };

  const getUserTypeIcon = () => {
    return userType === 'candidato' ? <GrUser size={24} /> : <GrOrganization size={24} />;
  };

  const getApprovalSteps = () => {
    if (userType === 'candidato') {
      return [
        'Análise dos dados de cadastro',
        'Verificação de documentos enviados',
        'Validação do perfil profissional',
        'Aprovação final pelo administrador'
      ];
    } else {
      return [
        'Verificação dos dados da empresa',
        'Validação da documentação corporativa',
        'Análise do perfil empresarial',
        'Aprovação final pelo administrador'
      ];
    }
  };

  if (!isVisible) return null;

  const baseClasses = `${styles.pendingMessage} ${styles[variant]}`;

  return (
    <div className={baseClasses}>
      <div className={styles.messageContent}>
        {/* Header */}
        <div className={styles.messageHeader}>
          <div className={styles.iconSection}>
            <div className={styles.statusIcon}>
              <GrStatusWarning size={32} />
            </div>
            <div className={styles.userIcon}>
              {getUserTypeIcon()}
            </div>
          </div>
          
          <div className={styles.titleSection}>
            <h2>Conta Pendente de Aprovação</h2>
            <p>Olá, <strong>{userName}</strong>! Sua conta de {getUserTypeText()} está sendo analisada.</p>
          </div>

          {onClose && (
            <button 
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Fechar mensagem"
            >
              <GrClose size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className={styles.messageBody}>
          <div className={styles.statusInfo}>
            <div className={styles.infoCard}>
              <GrClock size={20} />
              <div>
                <h4>Status Atual</h4>
                <p>Aguardando aprovação do administrador</p>
                {registrationDate && (
                  <small>Cadastrado em {new Date(registrationDate).toLocaleDateString('pt-BR')}</small>
                )}
              </div>
            </div>

            <div className={styles.infoCard}>
              <GrMail size={20} />
              <div>
                <h4>Contato</h4>
                <p>{userEmail}</p>
                <small>Email de cadastro confirmado</small>
              </div>
            </div>
          </div>

          <div className={styles.processSteps}>
            <h4>Processo de Aprovação</h4>
            <div className={styles.stepsList}>
              {getApprovalSteps().map((step, index) => (
                <div key={index} className={styles.step}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.estimateInfo}>
            <div className={styles.estimateCard}>
              <h4>Tempo Estimado</h4>
              <p><strong>1-3 dias úteis</strong></p>
              <small>Tempo médio para análise e aprovação</small>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.messageFooter}>
          <div className={styles.helpSection}>
            <h4>Precisa de ajuda?</h4>
            <p>
              Entre em contato conosco pelo email{' '}
              <a href="mailto:suporte@leaotalentbridge.com">
                suporte@leaotalentbridge.com
              </a>
              {' '}ou através do WhatsApp{' '}
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                (11) 99999-9999
              </a>
            </p>
          </div>

          <div className={styles.nextSteps}>
            <h4>O que você pode fazer agora:</h4>
            <ul>
              <li>✅ Aguardar a aprovação (sem necessidade de ação)</li>
              <li>📚 Acessar cursos disponíveis enquanto aguarda</li>
              <li>📝 Completar seu perfil para acelerar a aprovação</li>
              <li>📞 Entrar em contato em caso de urgência</li>
            </ul>
          </div>
        </div>
      </div>

      {variant === 'modal' && (
        <div className={styles.modalOverlay} onClick={handleClose} />
      )}
    </div>
  );
}
