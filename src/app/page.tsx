'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import AnimatedCard from '@/components/AnimatedCard';
import AnimatedHeading from '@/components/AnimatedHeading';
import { GrNext, GrGroup, GrOrganization, GrStatusCritical, GrStar, GrGlobe, GrBriefcase, GrLineChart, GrShield, GrMail, GrPhone, GrLocation, GrCalendar, GrClock, GrPlay, GrDocument, GrTarget, GrTrophy, GrPlan } from 'react-icons/gr';
import styles from './page.module.css';
import Image from 'next/image';

export default function HomePage() {
  const [userType, setUserType] = useState<'candidato' | 'empresa' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const gridPatternRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    website: '',
    experience: '',
    company: ''
  });

  // Adicionar efeito de movimento do grid com o mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gridPatternRef.current) return;
      
      const { clientX, clientY } = e;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Calcular a posição relativa do mouse na tela (0-1)
      const mouseXratio = clientX / windowWidth;
      const mouseYratio = clientY / windowHeight;
      
      // Mover o grid com base na posição do mouse
      // Multiplicamos por um valor pequeno para um movimento sutil
      const moveX = mouseXratio * 20;
      const moveY = mouseYratio * 20;
      
      gridPatternRef.current.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
      
      // Adicionar um efeito de "brilho" onde o mouse está
      const glowX = clientX;
      const glowY = clientY;
      gridPatternRef.current.style.setProperty('--glow-x', `${glowX}px`);
      gridPatternRef.current.style.setProperty('--glow-y', `${glowY}px`);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simular cadastro inicial na base
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirecionar para página de pagamento
      if (userType === 'candidato') {
        window.location.href = '/candidato/pagamento';
      } else if (userType === 'empresa') {
        window.location.href = '/empresa/pagamento';
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      alert('Erro ao processar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.homePage}>
      <Header transparent />
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.gridPattern} ref={gridPatternRef}></div>
        </div>
        
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <AnimatedHeading 
                title="Seu talento reconhecido no mundo." 
                level={1}
                className="leftAligned"
              />
              <p className={`${styles.heroDescription} slide-up`}>
                Conectamos profissionais brasileiros às melhores oportunidades nos Emirados Árabes Unidos.
                Somos a ponte entre profissionais qualificados e empresas que valorizam a excelência. 
                Com base em Dubai, conectamos talentos brasileiros ao futuro que eles merecem.
              </p>
              
           

              <div className={styles.heroCta}>
                <a href="#como-funciona" className="btn btn-secondary ">
                  Saiba mais
                  <GrNext size={20} />
                </a>
              </div>
            </div>

            {/* Formulário de Acesso Rápido */}
            <div className={`${styles.accessForm} slide-up`}>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Comece Sua Jornada</h3>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Seleção de Tipo de Usuário */}
                  <div className={styles.userTypeSelector}>
                    <button
                      type="button"
                      className={`${styles.userTypeButton} ${userType === 'candidato' ? styles.active : ''}`}
                      onClick={() => setUserType('candidato')}
                    >
                      <GrGroup size={36} />
                      <span>Sou Candidato</span>
                      <GrStatusCritical className={styles.checkIcon} size={24} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.userTypeButton} ${userType === 'empresa' ? styles.active : ''}`}
                      onClick={() => setUserType('empresa')}
                    >
                      <GrOrganization size={36} />
                      <span>Sou Empresa</span>
                      <GrStatusCritical className={styles.checkIcon} size={24} />
                    </button>
                  </div>

                  {/* Formulário Dinâmico */}
                  {userType && (
                    <div className={styles.formFields}>
                      <div className="form-group">
                        <label className="form-label">Nome Completo</label>
                        <input
                          type="text"
                          name="name"
                          className="form-input"
                          placeholder="Digite seu nome completo"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">E-mail</label>
                        <input
                          type="email"
                          name="email"
                          className="form-input"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Telefone</label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-input"
                          placeholder="+55 (11) 99999-9999"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {userType === 'candidato' && (
                        <div className="form-group">
                          <label className="form-label">LinkedIn</label>
                          <input
                            type="text"
                            name="linkedin"
                            className="form-input"
                            placeholder="https://www.linkedin.com/in/seu-perfil"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      )}

                      {userType === 'empresa' && (
                        <div className="form-group">
                          <label className="form-label">Website</label>
                          <input
                            type="text"
                            name="website"
                            className="form-input"
                            placeholder="https://www.seuwebsite.com"
                            value={formData.website}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      )}

                      {userType === 'empresa' && (
                        <div className="form-group">
                          <label className="form-label">LinkedIn da Empresa</label>
                          <input
                            type="text"
                            name="linkedin"
                            className="form-input"
                            placeholder="https://www.linkedin.com/company/empresa"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      )}

                      {userType === 'candidato' && (
                        <div className="form-group">
                          <label className="form-label">Nível de Experiência</label>
                          <select
                            name="experience"
                            className="form-select"
                            value={formData.experience}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Selecione</option>
                            <option value="junior">Júnior (1-3 anos)</option>
                            <option value="pleno">Pleno (3-7 anos)</option>
                            <option value="senior">Sênior (7+ anos)</option>
                            <option value="gerencial">Gerencial/Executivo</option>
                          </select>
                        </div>
                      )}

                      {userType === 'empresa' && (
                        <div className="form-group">
                          <label className="form-label">Nome da Empresa</label>
                          <input
                            type="text"
                            name="company"
                            className="form-input"
                            placeholder="Nome da sua empresa"
                            value={formData.company}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      )}

                      <button type="submit" className="btn btn-primary btn-large w-full" disabled={isLoading}>
                        {isLoading ? (
                          <div className={styles.loadingSpinner}></div>
                        ) : (
                          <>
                            Iniciar Cadastro
                            <GrNext size={20} />
                          </>
                        )}
                      </button>

                      <div className={styles.loginLink}>
                        <p>Já tem uma conta?</p>
                        <a href={`/${userType}/login`} className="text-gold">
                          Fazer Login
                        </a>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className={`${styles.heroStats} scale-in`}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>500+</div>
                  <div className={styles.statLabel}>Profissionais Conectados</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className={`section ${styles.howItWorksSection}`}>
        <div className="container">
          <AnimatedHeading 
            title="Comece Sua Jornada"
                          subtitle="Um Processo Simples E Eficiente Para Conectar Talentos A Oportunidades Únicas"
          />

          <div className={styles.stepsGrid}>
            <AnimatedCard
              number="01"
              icon={<GrDocument size={40} />}
              title="Crie Seu Perfil"
              description="Complete seu perfil com experiências, competências e objetivos."
              delay={0}
            />

            <AnimatedCard
              number="02"
              icon={<GrTarget size={40} />}
              title="Conexão Inteligente"
              description="Nossa plataforma cruza seus dados com vagas exclusivas que realmente combinam com seu talento."
              delay={200}
            />

            <AnimatedCard
              number="03"
              icon={<GrGroup size={40} />}
              title="Seleção com Propósito"
              description="Participe de processos seletivos com empresas que valorizam o profissional brasileiro."
              delay={400}
            />

            <AnimatedCard
              number="04"
              icon={<GrPlan size={40} />}
              title="Transição Estruturada"
                              description="Receba orientação jurídica e profissional, com suporte cultural."
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className={`section ${styles.benefitsSection}`}>
        <div className="container">
          <AnimatedHeading
            title="Por que Escolher a Leão Talent Bridge?"
            subtitle="Oferecemos Muito Mais Que Simples Conexões - Somos Seu Parceiro De Sucesso"
          />

          <div className="grid grid-3">
            <div className="card">
              <div className={styles.benefitIcon}>
                <GrLineChart size={50} />
              </div>
              <h3>Oportunidades Exclusivas</h3>
              <p>
                Vagas que você não encontra no LinkedIn — Acesso direto a oportunidades confidenciais com empresas selecionadas nos Emirados.
              </p>
            </div>

            <div className="card">
              <div className={styles.benefitIcon}>
                <GrShield size={50} />
              </div>
              <h3>Processo Seguro</h3>
              <p>
                Empresas verificadas e confiáveis — Você participa apenas de processos com empregadores sérios inclusive recomendado pela MOHRE.
              </p>
            </div>

            <div className="card">
              <div className={styles.benefitIcon}>
                <GrGlobe size={50} />
              </div>
              <h3>Suporte Completo</h3>
              <p>
                Apoio antes, durante e depois da mudança — Não é só sobre conseguir a vaga. Nós garantimos que sua chegada seja tranquila.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className={`section ${styles.aboutSection}`}>
        <div className="container">
          <div className="grid grid-2">
            <div className={styles.aboutContent}>
              <AnimatedHeading
                title="Sobre a Leão Talent Bridge"
                level={2}
                className={styles.leftAligned}
              />
              <h3 className="heading-3 mb-md">Conectando Talentos Ao Futuro</h3>
              <p>
                A partir de uma escuta ativa das demandas do mercado dos Emirados Árabes Unidos — e com o respaldo de líderes empresariais e apoio institucional — nasceu a Leão Talent Bridge, com um propósito claro: criar oportunidades reais para brasileiros no cenário internacional, com foco em todos os Emirados.
              </p>
              <p>
                Aliamos o conhecimento das necessidades das empresas locais aos objetivos e competências dos profissionais que desejam atuar fora do Brasil.
              </p>
              <p className={styles.highlightText}>
                Como uma vertente da Leão Group Global, a Leão Talent Bridge se destaca pela sólida experiência na mobilidade e recolocação de talentos, sendo amplamente reconhecida nos Emirados Árabes por sua atuação estratégica e comprometida.
              </p>
            </div>
            
            <div className={styles.aboutImage}>
              <div className={styles.imageContainer}>
                  <Image 
                  src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                  alt="Profissionais em networking internacional" 
                  width={500}
                  height={300}
                />
                <div className={styles.imageOverlay}>
                  <GrStar size={48} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className={`section ${styles.contactSection}`}>
        <div className="container">
          <AnimatedHeading
            title="Entre em Contato"
            subtitle="Pronto Para Dar O Próximo Passo? Nossa Equipe Está Aqui Para Ajudar"
          />

          <div className="grid grid-3">
            <div className={styles.contactCard}>
              <GrMail size={40} />
              <h4>E-mail</h4>
              <p>contato@leaocareers.com</p>
              <a href="mailto:contato@leaocareers.com" className="btn btn-secondary">
                Fale Com Um Consultor
              </a>
            </div>

            <div className={styles.contactCard}>
              <GrPhone size={40} />
              <h4>Telefone</h4>
              <p>+971 50 371 6967</p>
              <a href="tel:+971503716967" className="btn btn-secondary">
                Tirar Dúvidas Agora
              </a>
            </div>

            <div className={styles.contactCard}>
              <GrLocation size={40} />
              <h4>Unidades</h4>
              <p>Rio de Janeiro, Brasil<br />Dubai, EAU</p>
              <button className="btn btn-secondary">
                Ver Localização
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <div className={styles.footerLogo}>
              <Image 
                src="/images/UAECareers-white-icon.svg" 
                alt="Leão Talent Bridge" 
                width={24} 
                height={24}
              />
              <span>UAE <span className="text-gold">Careers</span></span>
            </div>
            
            <div className={styles.footerLinks}>
              <a href="#como-funciona">Como Funciona</a>
              <a href="#beneficios">Benefícios</a>
              <a href="#sobre">Sobre</a>
              <a href="#contato">Contato</a>
            </div>
            
            <div className={styles.footerCopyright}>
              <p>&copy; 2024 UAE Careers. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
