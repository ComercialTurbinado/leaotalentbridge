'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrClock, GrMail, GrPower, GrCircleInformation } from 'react-icons/gr';
import styles from '../pagamento.module.css';

function PagamentoPendenteContent() {
  const searchParams = useSearchParams();
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    setPaymentId(searchParams.get('payment_id'));
  }, [searchParams]);

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

        <div className={styles.pendingContainer}>
          <div className={styles.pendingIcon}>
            <GrClock size={64} />
          </div>

          <h1>Pagamento Pendente</h1>
          <p className={styles.pendingMessage}>
            Seu pagamento está sendo processado.
          </p>

          {paymentId && (
            <div className={styles.paymentInfo}>
              <span>ID do Pagamento:</span>
              <strong>{paymentId}</strong>
            </div>
          )}

          <div className={styles.pendingInfo}>
            <div className={styles.infoCard}>
              <GrPower size={32} />
              <h3>Pagamento via PIX</h3>
              <p>
                O pagamento via PIX pode levar alguns minutos para ser confirmado.
                Você receberá uma notificação assim que for aprovado.
              </p>
            </div>

            <div className={styles.infoCard}>
              <GrMail size={32} />
              <h3>Confirmação por Email</h3>
              <p>
                Enviaremos um email de confirmação assim que seu pagamento for aprovado.
                Fique atento à sua caixa de entrada.
              </p>
            </div>

            <div className={styles.infoCard}>
              <GrCircleInformation size={32} />
              <h3>Tempo de Processamento</h3>
              <p>
                Geralmente o processamento leva de 1 a 30 minutos.
                Pagamentos via boleto podem levar até 2 dias úteis.
              </p>
            </div>
          </div>

          <div className={styles.pendingActions}>
            <Link href="/candidato/dashboard" className="btn btn-primary btn-large">
              Ir para o Dashboard
            </Link>
            <Link href="/candidato/pagamento" className="btn btn-secondary btn-large">
              Ver Métodos de Pagamento
            </Link>
          </div>

          <div className={styles.pendingNote}>
            <p>
              💡 <strong>Dica:</strong> Você pode continuar usando a plataforma normalmente.
              Seu acesso será liberado automaticamente após a confirmação do pagamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PagamentoPendentePage() {
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
      <PagamentoPendenteContent />
    </Suspense>
  );
}

