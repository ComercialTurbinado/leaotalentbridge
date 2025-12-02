'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrCheckbox, GrCreditCard, GrShield, GrPrevious, GrStar, GrGroup, GrSearch, GrPower, GrOrganization, GrCalendar, GrChat, GrBarChart, GrTarget, GrUser } from 'react-icons/gr';
import styles from './pagamento.module.css';

export default function EmpresaPagamentoPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('anual-vista');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [isLoading, setIsLoading] = useState(false);
  // Dados do usuário (para pagamento sem autenticação)
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

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
      description: 'Plataforma disponível 24/7 para sua equipe'
    },
    {
      icon: GrGroup,
      title: 'Banco de talentos brasileiros ilimitado',
      description: 'Acesso a milhares de profissionais qualificados'
    },
    {
      icon: GrSearch,
      title: 'Filtros avançados de busca por skills',
      description: 'Encontre o perfil exato que procura'
    },
    {
      icon: GrTarget,
      title: 'Entrevistas pré-agendadas automaticamente',
      description: 'Sistema inteligente de matching'
    },
    {
      icon: GrChat,
      title: 'Suporte prioritário via WhatsApp',
      description: 'Atendimento exclusivo para empresas'
    },
    {
      icon: GrBarChart,
      title: 'Relatórios detalhados de performance',
      description: 'Analytics completos do processo seletivo'
    },
    {
      icon: GrUser,
      title: 'Consultoria especializada em RH',
      description: 'Especialistas em recrutamento internacional'
    },
    {
      icon: GrGroup,
      title: 'Gerente de conta dedicado',
      description: 'Suporte personalizado para sua empresa'
    },
    {
      icon: GrOrganization,
      title: 'Branding personalizado da empresa',
      description: 'Página customizada com sua marca'
    },
    {
      icon: GrShield,
      title: 'Integração com sistemas de RH',
      description: 'APIs e integrações com seus sistemas'
    }
  ];

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      if (!selectedPlanData) return;

      // Obter token de autenticação (opcional)
      const token = localStorage.getItem('token');
      
      // Se não estiver autenticado, verificar se tem dados do usuário
      if (!token) {
        if (!userEmail || !userName) {
          setIsLoading(false);
          alert('Por favor, preencha seu email e nome para continuar com o pagamento.');
          return;
        }
      }

      // Calcular valor total
      const totalAmount = selectedPlanData.totalPrice 
        ? parseFloat(selectedPlanData.totalPrice.replace('R$ ', '').replace('.', '').replace(',', '.'))
        : parseFloat(selectedPlanData.price.replace('R$ ', '').replace('.', '').replace(',', '.'));

      // Criar preferência de pagamento no Mercado Pago
      const requestBody: any = {
        planId: selectedPlan,
        planName: selectedPlanData.name,
        amount: totalAmount,
        installments: selectedPlanData.installments ? parseInt(selectedPlanData.installments.split('x')[0]) : 1,
        paymentMethod,
        userType: 'empresa',
      };

      // Adicionar dados do usuário se não estiver autenticado
      if (!token) {
        requestBody.userEmail = userEmail;
        requestBody.userName = userName;
      }

      const headers: any = {
        'Content-Type': 'application/json',
      };

      // Adicionar token se existir
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar preferência de pagamento');
      }

      // Redirecionar para o checkout do Mercado Pago
      // Usar sandbox em desenvolvimento, produção em produção
      const checkoutUrl = data.data.sandboxInitPoint || data.data.initPoint;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('URL de checkout não fornecida');
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Ajustar método de pagamento quando plano mudar
  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);
    if (!plan?.allowsPix && (paymentMethod === 'pix' || paymentMethod === 'transfer')) {
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
              src="/images/UAECareers-orig.svg" 
              alt="UAE Careers" 
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
            <h1>Planos para Empresas</h1>
            <p>Encontre os melhores talentos brasileiros para sua empresa nos Emirados Árabes Unidos</p>
          </div>

          {/* Common Features */}
          <div className={styles.commonFeaturesSection}>
            <div className={styles.commonFeaturesCard}>
              <div className={styles.featuresHeader}>
                <GrOrganization size={32} className={styles.crownIcon} />
                <h3>O que sua empresa terá acesso:</h3>
                <p>Todos os recursos premium para recrutamento internacional</p>
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

              {/* Formulário de dados do usuário (se não autenticado) */}
              {!isAuthenticated && (
                <div className={styles.userForm}>
                  <h4>Dados para Pagamento</h4>
                  <p>Preencha os dados da empresa para continuar com o pagamento</p>
                  <div className={styles.formGroup}>
                    <label htmlFor="userEmail">Email da Empresa *</label>
                    <input
                      type="email"
                      id="userEmail"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="contato@empresa.com"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="userName">Nome da Empresa *</label>
                    <input
                      type="text"
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Nome da Empresa"
                      required
                    />
                  </div>
                  <p className={styles.formNote}>
                    💡 A conta da empresa será criada automaticamente após o pagamento aprovado.
                    Você receberá um email com instruções para acessar.
                  </p>
                </div>
              )}

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