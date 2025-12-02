'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrCheckmark, GrDocument, GrStar, GrMail } from 'react-icons/gr';
import styles from '../pagamento.module.css';

function PagamentoSucessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    // Simular verificação do pagamento
    const timer = setTimeout(() => {
      setPaymentData({
        paymentId: searchParams.get('payment_id'),
        status: 'approved',
        amount: searchParams.get('amount') || '5500',
      });
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className={styles.pagamentoPage}>
        <div className={styles.pagamentoContainer}>
          <div className={styles.loadingContainer}>
            <div className="loading"></div>
            <h2>Verificando seu pagamento...</h2>
            <p>Aguarde enquanto confirmamos sua transação</p>
          </div>
        </div>
      </div>
    );
  }

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

        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <GrCheckmark size={64} />
          </div>

          <h1>Pagamento Confirmado! 🎉</h1>
          <p className={styles.successMessage}>
            Parabéns! Sua assinatura foi ativada com sucesso.
          </p>

          {paymentData?.paymentId && (
            <div className={styles.paymentInfo}>
              <span>ID do Pagamento:</span>
              <strong>{paymentData.paymentId}</strong>
            </div>
          )}

          <div className={styles.nextSteps}>
            <h3>Próximos Passos:</h3>
            <div className={styles.stepsList}>
              <div className={styles.step}>
                <GrStar size={24} />
                <div>
                  <h4>Acesso Total Liberado</h4>
                  <p>Você já pode acessar todos os recursos premium da plataforma</p>
                </div>
              </div>
              <div className={styles.step}>
                <GrDocument size={24} />
                <div>
                  <h4>Complete seu Perfil</h4>
                  <p>Preencha todas as informações para aumentar suas chances</p>
                </div>
              </div>
              <div className={styles.step}>
                <GrMail size={24} />
                <div>
                  <h4>Confirmação por Email</h4>
                  <p>Enviamos os detalhes do pagamento para seu email</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.successActions}>
            <Link href="/candidato/dashboard" className="btn btn-primary btn-large">
              Ir para o Dashboard
            </Link>
            <Link href="/candidato/perfil" className="btn btn-secondary btn-large">
              Completar Perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PagamentoSucessoPage() {
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
      <PagamentoSucessoContent />
    </Suspense>
  );
}

