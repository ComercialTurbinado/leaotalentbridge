'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrCheckbox, GrCreditCard, GrShield, GrPrevious, GrStar, GrGroup, GrDocument, GrVideo, GrPower, GrCalendar, GrChat, GrGlobe, GrBriefcase, GrTarget, GrBook, GrUser, GrTrophy } from 'react-icons/gr';
import styles from './pagamento.module.css';

export default function CandidatoPagamentoPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('anual-vista');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: 'anual-vista',
      name: 'Anual à Vista',
      price: 'R$ 5.500',
      originalPrice: 'R$ 6.000',
      period: '/ano',
      description: 'Melhor custo-benefício com desconto especial',
      popular: true,
      discount: 'Economia de R$ 500',
      allowsPix: true
    },
    {
      id: 'anual-3x',
      name: 'Anual 3x sem Juros',
      price: 'R$ 2.000',
      totalPrice: 'R$ 6.000',
      period: '/mês por 3 meses',
      description: 'Parcelamento sem juros no cartão',
      popular: false,
      installments: '3x sem juros',
      allowsPix: false
    },
    {
      id: 'anual-6x',
      name: 'Anual 6x no Cartão',
      price: 'R$ 1.083',
      totalPrice: 'R$ 6.500',
      period: '/mês por 6 meses',
      description: 'Maior flexibilidade de pagamento',
      popular: false,
      installments: '6x no cartão',
      allowsPix: false
    }
  ];

  const commonFeatures = [
    {
      icon: GrCalendar,
      title: 'Acesso completo por 12 meses',
      description: 'Plataforma disponível 24/7'
    },
    {
      icon: GrTarget,
      title: 'Todos os recursos da plataforma',
      description: 'Funcionalidades premium incluídas'
    },
    {
      icon: GrVideo,
      title: 'Simulações de entrevista ilimitadas',
      description: 'Pratique quantas vezes quiser'
    },
    {
      icon: GrDocument,
      title: 'Formatação de documentos profissionais',
      description: 'CV, carta de apresentação e mais'
    },
    {
      icon: GrBook,
      title: 'E-book cultural completo dos Emirados',
      description: 'Guia essencial para adaptação'
    },
    {
      icon: GrChat,
      title: 'Suporte prioritário via WhatsApp',
      description: 'Atendimento exclusivo e rápido'
    },
    {
      icon: GrUser,
      title: 'Mentoria mensal com especialistas',
      description: 'Sessões 1:1 com profissionais'
    },
    {
      icon: GrGroup,
      title: 'Consultoria 1:1 personalizada',
      description: 'Orientação individual focada'
    },
    {
      icon: GrBriefcase,
      title: 'Networking exclusivo com empresas',
      description: 'Conexões diretas no mercado'
    },
    {
      icon: GrTrophy,
      title: 'Certificado de conclusão',
      description: 'Reconhecimento oficial do programa'
    }
  ];

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Simular processamento do pagamento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Redirecionar para dashboard com acesso liberado
      router.push('/candidato/dashboard?pagamento=sucesso');
    } catch (error) {
      console.error('Erro no pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Ajustar método de pagamento quando plano mudar
  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);
    if (!plan?.allowsPix && paymentMethod === 'pix') {
      setPaymentMethod('credit');
    }
  };

  return (
    <div className={styles.pagamentoPage}>
      <div className={styles.pagamentoContainer}>
        {/* Header */}
        <div className={styles.pagamentoHeader}>
          <Link href="/" className={styles.backButton}>
            <GrPrevious size={20} />
            Voltar ao Início
          </Link>
          
          <div className={styles.logo}>
            <Image 
              src="/images/leao-talent-briddge-preto.svg" 
              alt="Leao Talent Bridge" 
              width={200} 
              height={140}
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
        </div>

        {/* Content */}
        <div className={styles.pagamentoContent}>
          <div className={styles.pageHeader}>
            <h1>Escolha Seu Plano</h1>
            <p>Selecione o plano ideal para acelerar sua carreira internacional</p>
          </div>

          {/* Common Features */}
          <div className={styles.commonFeaturesSection}>
            <div className={styles.commonFeaturesCard}>
              <div className={styles.featuresHeader}>
                <GrStar size={32} className={styles.crownIcon} />
                <h3>O que você terá acesso:</h3>
                <p>Todos os recursos premium incluídos em qualquer plano</p>
              </div>
              <div className={styles.commonFeaturesList}>
                {commonFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className={styles.commonFeature}>
                      <div className={styles.featureIcon}>
                        <IconComponent size={20} />
                      </div>
                      <div className={styles.featureContent}>
                        <h4 className={styles.featureTitle}>{feature.title}</h4>
                        <p className={styles.featureDescription}>{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Plans GrApps */}
          <div className={styles.plansGrid}>
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`${styles.planCard} ${selectedPlan === plan.id ? styles.selected : ''} ${plan.popular ? styles.popular : ''}`}
                onClick={() => handlePlanChange(plan.id)}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>
                    <GrStar size={16} />
                    Mais Popular
                  </div>
                )}
                
                <div className={styles.planHeader}>
                  <h3>{plan.name}</h3>
                  <div className={styles.planPrice}>
                    {plan.originalPrice && (
                      <div className={styles.originalPrice}>
                        De {plan.originalPrice}
                      </div>
                    )}
                    <span className={styles.price}>{plan.price}</span>
                    <span className={styles.period}>{plan.period}</span>
                    {plan.totalPrice && (
                      <div className={styles.totalPrice}>
                        Total: {plan.totalPrice}
                      </div>
                    )}
                  </div>
                  {plan.discount && (
                    <div className={styles.discount}>
                      {plan.discount}
                    </div>
                  )}
                  {plan.installments && (
                    <div className={styles.installments}>
                      {plan.installments}
                    </div>
                  )}
                  <p className={styles.planDescription}>{plan.description}</p>
                </div>

                <div className={styles.planAction}>
                  <div className={`${styles.selectIndicator} ${selectedPlan === plan.id ? styles.active : ''}`}>
                    {selectedPlan === plan.id ? 'Selecionado' : 'Selecionar'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Section */}
          <div className={styles.paymentSection}>
            <div className={styles.paymentCard}>
              <h3>Método de Pagamento</h3>
              
              <div className={styles.paymentMethods}>
                <div 
                  className={`${styles.paymentMethod} ${paymentMethod === 'credit' ? styles.active : ''}`}
                  onClick={() => setPaymentMethod('credit')}
                >
                  <GrCreditCard size={20} />
                  <span>Cartão de Crédito</span>
                  <div className={styles.paymentBadges}>
                    <span>Visa</span>
                    <span>Master</span>
                  </div>
                </div>

                {plans.find(p => p.id === selectedPlan)?.allowsPix && (
                  <div 
                    className={`${styles.paymentMethod} ${paymentMethod === 'pix' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('pix')}
                  >
                    <GrPower size={20} />
                    <span>PIX</span>
                    <div className={styles.paymentBadge}>
                      <span>Instantâneo</span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.paymentSummary}>
                <div className={styles.summaryRow}>
                  <span>Plano {plans.find(p => p.id === selectedPlan)?.name}</span>
                  <span>{plans.find(p => p.id === selectedPlan)?.totalPrice || plans.find(p => p.id === selectedPlan)?.price}</span>
                </div>
                {plans.find(p => p.id === selectedPlan)?.installments && (
                  <div className={styles.summaryRow}>
                    <span>Parcelamento</span>
                    <span>{plans.find(p => p.id === selectedPlan)?.installments}</span>
                  </div>
                )}
                {plans.find(p => p.id === selectedPlan)?.discount && (
                  <div className={styles.summaryRow}>
                    <span>Desconto</span>
                    <span className={styles.discountValue}>R$ 500</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span>Taxa de processamento</span>
                  <span>Grátis</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total</span>
                  <span>{plans.find(p => p.id === selectedPlan)?.totalPrice || plans.find(p => p.id === selectedPlan)?.price}</span>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                className="btn btn-primary btn-large w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading"></div>
                    Processando Pagamento...
                  </>
                ) : (
                  <>
                    <GrShield size={20} />
                    Finalizar Pagamento Seguro
                  </>
                )}
              </button>

              <div className={styles.securityNote}>
                <GrShield size={16} />
                <span>Pagamento 100% seguro e criptografado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 