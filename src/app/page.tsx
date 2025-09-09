'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import AnimatedCard from '@/components/AnimatedCard';
import AnimatedHeading from '@/components/AnimatedHeading';
import { GrNext, GrGroup, GrOrganization, GrStatusCritical, GrStar, GrGlobe, GrBriefcase, GrLineChart, GrShield, GrMail, GrPhone, GrLocation, GrCalendar, GrClock, GrPlay, GrDocument, GrTarget, GrTrophy, GrPlan } from 'react-icons/gr';
import styles from './page.module.css';
import Image from 'next/image';

export default function HomePage() {
  const { t } = useTranslation();
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
                title={t('home.hero.title')} 
                level={1}
                className="leftAligned"
              />
              <p className={`${styles.heroDescription} slide-up`}>
                {t('home.hero.description')}
              </p>
              
           

              <div className={styles.heroCta}>
                <a href="#como-funciona" className="btn btn-secondary ">
                  {t('home.hero.cta')}
                  <GrNext size={20} />
                </a>
              </div>
            </div>

            {/* Formulário de Acesso Rápido */}
            <div className={`${styles.accessForm} slide-up`}>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{t('home.hero.startJourney')}</h3>
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
                      <span>{t('home.hero.candidate')}</span>
                      <GrStatusCritical className={styles.checkIcon} size={24} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.userTypeButton} ${userType === 'empresa' ? styles.active : ''}`}
                      onClick={() => setUserType('empresa')}
                    >
                      <GrOrganization size={36} />
                      <span>{t('home.hero.company')}</span>
                      <GrStatusCritical className={styles.checkIcon} size={24} />
                    </button>
                  </div>

                  {/* Formulário Dinâmico */}
                  {userType && (
                    <div className={styles.formFields}>
                      <div className="form-group">
                        <label className="form-label">{t('home.hero.fullName')}</label>
                        <input
                          type="text"
                          name="name"
                          className="form-input"
                          placeholder={t('home.hero.placeholders.fullName')}
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">{t('home.hero.email')}</label>
                        <input
                          type="email"
                          name="email"
                          className="form-input"
                          placeholder={t('home.hero.placeholders.email')}
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">{t('home.hero.phone')}</label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-input"
                          placeholder={t('home.hero.placeholders.phone')}
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {userType === 'candidato' && (
                        <div className="form-group">
                          <label className="form-label">{t('home.hero.linkedin')}</label>
                          <input
                            type="text"
                            name="linkedin"
                            className="form-input"
                            placeholder={t('home.hero.placeholders.linkedin')}
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      )}

                      {userType === 'empresa' && (
                        <div className="form-group">
                          <label className="form-label">{t('home.hero.website')}</label>
                          <input
                            type="text"
                            name="website"
                            className="form-input"
                            placeholder={t('home.hero.placeholders.website')}
                            value={formData.website}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      )}

                      {userType === 'empresa' && (
                        <div className="form-group">
                          <label className="form-label">{t('home.hero.companyLinkedin')}</label>
                          <input
                            type="text"
                            name="linkedin"
                            className="form-input"
                            placeholder={t('home.hero.placeholders.companyLinkedin')}
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      )}

                      {userType === 'candidato' && (
                        <div className="form-group">
                          <label className="form-label">{t('home.hero.experience')}</label>
                          <select
                            name="experience"
                            className="form-select"
                            value={formData.experience}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">{t('home.hero.select')}</option>
                            <option value="junior">{t('home.hero.experienceLevels.junior')}</option>
                            <option value="pleno">{t('home.hero.experienceLevels.pleno')}</option>
                            <option value="senior">{t('home.hero.experienceLevels.senior')}</option>
                            <option value="gerencial">{t('home.hero.experienceLevels.managerial')}</option>
                          </select>
                        </div>
                      )}

                      {userType === 'empresa' && (
                        <div className="form-group">
                          <label className="form-label">{t('home.hero.companyName')}</label>
                          <input
                            type="text"
                            name="company"
                            className="form-input"
                            placeholder={t('home.hero.placeholders.companyName')}
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
                            {t('home.hero.startRegistration')}
                            <GrNext size={20} />
                          </>
                        )}
                      </button>

                      <div className={styles.loginLink}>
                        <p>{t('home.hero.alreadyHaveAccount')}</p>
                        <a href={`/${userType}/login`} className="text-gold">
                          {t('home.hero.login')}
                        </a>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className={`${styles.heroStats} scale-in`}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>500+</div>
                  <div className={styles.statLabel}>{t('home.hero.stats')}</div>
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
            title={t('home.howItWorks.title')}
            subtitle={t('home.howItWorks.subtitle')}
          />

          <div className={styles.stepsGrid}>
            <AnimatedCard
              number="01"
              icon={<GrDocument size={40} />}
              title={t('home.howItWorks.step1.title')}
              description={t('home.howItWorks.step1.description')}
              delay={0}
            />

            <AnimatedCard
              number="02"
              icon={<GrTarget size={40} />}
              title={t('home.howItWorks.step2.title')}
              description={t('home.howItWorks.step2.description')}
              delay={200}
            />

            <AnimatedCard
              number="03"
              icon={<GrGroup size={40} />}
              title={t('home.howItWorks.step3.title')}
              description={t('home.howItWorks.step3.description')}
              delay={400}
            />

            <AnimatedCard
              number="04"
              icon={<GrPlan size={40} />}
              title={t('home.howItWorks.step4.title')}
              description={t('home.howItWorks.step4.description')}
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className={`section ${styles.benefitsSection}`}>
        <div className="container">
          <AnimatedHeading
            title={t('home.benefits.title')}
            subtitle={t('home.benefits.subtitle')}
          />

          <div className="grid grid-3">
            <div className="card">
              <div className={styles.benefitIcon}>
                <GrLineChart size={50} />
              </div>
              <h3>{t('home.benefits.exclusive.title')}</h3>
              <p>
                {t('home.benefits.exclusive.description')}
              </p>
            </div>

            <div className="card">
              <div className={styles.benefitIcon}>
                <GrShield size={50} />
              </div>
              <h3>{t('home.benefits.secure.title')}</h3>
              <p>
                {t('home.benefits.secure.description')}
              </p>
            </div>

            <div className="card">
              <div className={styles.benefitIcon}>
                <GrGlobe size={50} />
              </div>
              <h3>{t('home.benefits.support.title')}</h3>
              <p>
                {t('home.benefits.support.description')}
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
                title={t('home.about.title')}
                level={2}
                className={styles.leftAligned}
              />
              <h3 className="heading-3 mb-md">{t('home.about.subtitle')}</h3>
              <p>
                {t('home.about.description1')}
              </p>
              <p>
                {t('home.about.description2')}
              </p>
              <p className={styles.highlightText}>
                {t('home.about.highlight')}
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
            title={t('home.contact.title')}
            subtitle={t('home.contact.subtitle')}
          />

          <div className="grid grid-3">
            <div className={styles.contactCard}>
              <GrMail size={40} />
              <h4>{t('home.contact.email.title')}</h4>
              <p>{t('home.contact.email.address')}</p>
              <a href="mailto:contact@uaecareers.com" className="btn btn-secondary">
                {t('home.contact.email.cta')}
              </a>
            </div>

            <div className={styles.contactCard}>
              <GrPhone size={40} />
              <h4>{t('home.contact.phone.title')}</h4>
              <p>{t('home.contact.phone.number')}</p>
              <a href="tel:+971503716967" className="btn btn-secondary">
                {t('home.contact.phone.cta')}
              </a>
            </div>

            <div className={styles.contactCard}>
              <GrLocation size={40} />
              <h4>{t('home.contact.location.title')}</h4>
              <p dangerouslySetInnerHTML={{ __html: t('home.contact.location.address') }}></p>
              <button className="btn btn-secondary">
                {t('home.contact.location.cta')}
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
                alt="UAE Careers" 
                width={24} 
                height={24}
              />
              <span>UAE <span className="text-gold">Careers</span></span>
            </div>
            
            <div className={styles.footerLinks}>
              <a href="#como-funciona">{t('header.howItWorks')}</a>
              <a href="#beneficios">{t('header.benefits')}</a>
              <a href="#sobre">{t('header.about')}</a>
              <a href="#contato">{t('header.contact')}</a>
            </div>
            
            <div className={styles.footerCopyright}>
              <p>{t('home.footer.copyright')}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
