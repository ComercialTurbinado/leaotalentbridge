'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrClose, GrRefresh, GrChat, GrCircleInformation } from 'react-icons/gr';
import styles from '../pagamento.module.css';

function PagamentoErroContent() {
  const searchParams = useSearchParams();
  const errorReason = searchParams.get('reason') || 'unknown';

  const errorMessages: Record<string, string> = {
    'cc_rejected_insufficient_amount': 'Saldo insuficiente no cartão',
    'cc_rejected_bad_filled_security_code': 'Código de segurança incorreto',
    'cc_rejected_bad_filled_date': 'Data de validade incorreta',
    'cc_rejected_bad_filled_other': 'Verifique os dados do cartão',
    'cc_rejected_blacklist': 'Cartão bloqueado',
    'cc_rejected_call_for_authorize': 'Entre em contato com seu banco',
    'cc_rejected_card_disabled': 'Cartão desabilitado',
    'cc_rejected_duplicated_payment': 'Pagamento duplicado',
    'cc_rejected_high_risk': 'Pagamento recusado por segurança',
    'cc_rejected_max_attempts': 'Limite de tentativas excedido',
    'unknown': 'Ocorreu um erro ao processar o pagamento',
  };

  const errorMessage = errorMessages[errorReason] || errorMessages.unknown;

  return (
    <div className={styles.pagamentoPage}>
      <div className={styles.pagamentoContainer}>
        <div className={styles.logo}>
          <Image 
            src="/images/UAECareers-orig.svg" 
            alt="UAE Careers" 
            width={200} 
            height={140}
            priority
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>

        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <GrClose size={64} />
          </div>

          <h1>Pagamento Não Processado</h1>
          <p className={styles.errorMessage}>
            Não foi possível processar o pagamento da sua empresa.
          </p>

          <div className={styles.errorDetails}>
            <GrCircleInformation size={24} />
            <div>
              <h4>Motivo:</h4>
              <p>{errorMessage}</p>
            </div>
          </div>

          <div className={styles.errorSolutions}>
            <h3>O que você pode fazer:</h3>
            <ul>
              <li>Verifique os dados do cartão corporativo e tente novamente</li>
              <li>Tente usar outro método de pagamento</li>
              <li>Entre em contato com o banco emissor do cartão</li>
              <li>Nossa equipe pode processar via transferência bancária</li>
            </ul>
          </div>

          <div className={styles.errorActions}>
            <Link href="/empresa/pagamento" className="btn btn-primary btn-large">
              <GrRefresh size={20} />
              Tentar Novamente
            </Link>
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary btn-large"
            >
              <GrChat size={20} />
              Falar com Suporte Empresarial
            </a>
            <Link href="/empresa/dashboard" className="btn btn-ghost btn-large">
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PagamentoErroEmpresaPage() {
  return (
    <Suspense fallback={
      <div className={styles.pagamentoPage}>
        <div className={styles.pagamentoContainer}>
          <div className={styles.loadingContainer}>
            <div className="loading"></div>
            <h2>Carregando...</h2>
          </div>
        </div>
      </div>
    }>
      <PagamentoErroContent />
    </Suspense>
  );
}

