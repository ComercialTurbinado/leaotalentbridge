'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrCheckmark, GrGroup, GrSearch, GrBarChart } from 'react-icons/gr';
import styles from '../pagamento.module.css';

function PagamentoSucessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
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

          <h1>Assinatura Ativada! 🎉</h1>
          <p className={styles.successMessage}>
            Parabéns! Sua empresa já pode começar a recrutar os melhores talentos.
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
                <GrGroup size={24} />
                <div>
                  <h4>Acesso ao Banco de Talentos</h4>
                  <p>Explore milhares de profissionais qualificados</p>
                </div>
              </div>
              <div className={styles.step}>
                <GrSearch size={24} />
                <div>
                  <h4>Publique suas Vagas</h4>
                  <p>Comece a divulgar oportunidades de emprego</p>
                </div>
              </div>
              <div className={styles.step}>
                <GrBarChart size={24} />
                <div>
                  <h4>Acesse Relatórios</h4>
                  <p>Acompanhe métricas e performance de recrutamento</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.successActions}>
            <Link href="/empresa/dashboard" className="btn btn-primary btn-large">
              Ir para o Dashboard
            </Link>
            <Link href="/empresa/vagas/criar" className="btn btn-secondary btn-large">
              Criar Primeira Vaga
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PagamentoSucessoEmpresaPage() {
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

