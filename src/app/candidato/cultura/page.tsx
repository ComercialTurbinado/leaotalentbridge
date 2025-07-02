'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrDownload, GrView, GrClock, GrGroup, GrGlobe, GrBriefcase, GrUser, GrNotification, GrLogout, GrStar, GrStatusGood, GrDocument, GrPlay, GrNext, GrCalendar, GrLocation, GrFavorite, GrShield, GrPower, GrChat, GrCoffee, GrTarget, GrBook } from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import styles from './cultura.module.css';

interface CultureSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  readTime: number;
  isCompleted: boolean;
  content: {
    overview: string;
    keyPoints: string[];
    tips: string[];
    examples?: string[];
  };
}

export default function CandidatoCultura() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>(['basics', 'business']);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    AuthService.logout();
    router.push('/');
  };

  const cultureSections: CultureSection[] = [
    {
      id: 'basics',
      title: 'Fundamentos Culturais',
      description: 'Conheça a história, religião e valores fundamentais dos Emirados Árabes Unidos',
      icon: <GrGlobe size={24} />,
      color: '#3B82F6',
      readTime: 15,
      isCompleted: completedSections.includes('basics'),
      content: {
        overview: 'Os Emirados Árabes Unidos são uma federação de sete emirados, cada um com suas características únicas, mas unidos por tradições árabes e valores islâmicos. Compreender esses fundamentos é essencial para qualquer profissional que deseje trabalhar na região.',
        keyPoints: [
          'Os UAE são compostos por 7 emirados: Abu Dhabi, Dubai, Sharjah, Ajman, Ras Al Khaimah, Fujairah e Umm Al Quwain',
          'A religião oficial é o Islã, que influencia fortemente a cultura e os costumes locais',
          'O árabe é o idioma oficial, mas o inglês é amplamente utilizado nos negócios',
          'A moeda oficial é o Dirham dos Emirados Árabes Unidos (AED)',
          'O país é conhecido pela tolerância religiosa e diversidade cultural'
        ],
        tips: [
          'Respeite os horários de oração (5 vezes ao dia) em ambientes de trabalho',
          'Vista-se de forma conservadora, especialmente em áreas públicas',
          'Seja respeitoso durante o mês do Ramadan',
          'Aprenda algumas saudações básicas em árabe',
          'Demonstre interesse pela cultura local'
        ],
        examples: [
          'Cumprimentar com "As-salaam alaikum" (a paz esteja com você)',
          'Usar a mão direita para cumprimentos e refeições',
          'Remover sapatos ao entrar em mesquitas',
          'Evitar demonstrações públicas de afeto'
        ]
      }
    },
    {
      id: 'business',
      title: 'Etiqueta Empresarial',
      description: 'Protocolos e comportamentos adequados para o ambiente corporativo nos UAE',
      icon: <GrBriefcase size={24} />,
      color: '#10B981',
      readTime: 20,
      isCompleted: completedSections.includes('business'),
      content: {
        overview: 'O ambiente empresarial nos UAE combina tradições árabes com práticas internacionais modernas. O respeito hierárquico, a paciência nas negociações e a construção de relacionamentos são elementos fundamentais.',
        keyPoints: [
          'Relacionamentos pessoais são cruciais para o sucesso nos negócios',
          'Hierarquia é muito respeitada - sempre cumprimente a pessoa mais sênior primeiro',
          'Pontualidade é valorizada, mesmo que as reuniões possam começar com conversas sociais',
          'Cartões de visita devem ser entregues e recebidos com ambas as mãos',
          'Negociações podem ser longas - paciência é fundamental'
        ],
        tips: [
          'Construa relacionamentos antes de discutir negócios',
          'Vista-se formalmente - ternos completos são padrão',
          'Evite agendar reuniões durante horários de oração',
          'Seja respeitoso com tradições locais',
          'Use títulos formais até ser convidado a usar nomes'
        ],
        examples: [
          'Começar reuniões perguntando sobre família e saúde',
          'Oferecer café árabe ou tâmaras antes das discussões',
          'Fazer follow-up pessoal após reuniões importantes',
          'Respeitar a tradição de hospitalidade árabe'
        ]
      }
    },
    {
      id: 'communication',
      title: 'Comunicação Eficaz',
      description: 'Como se comunicar de forma apropriada e eficiente com colegas emiratienses',
      icon: <GrChat size={24} />,
      color: '#F59E0B',
      readTime: 12,
      isCompleted: false,
      content: {
        overview: 'A comunicação nos UAE valoriza o respeito, a diplomacia e a construção de consenso. O estilo indireto é comum, e é importante ler nas entrelinhas e demonstrar paciência.',
        keyPoints: [
          'Comunicação indireta é preferida - evite confrontos diretos',
          'Salvar a face é muito importante - critique em particular',
          'Silêncio durante conversas é normal e deve ser respeitado',
          'Linguagem corporal é importante - mantenha postura respeitosa',
          'Estabeleça confiança antes de abordar tópicos sensíveis'
        ],
        tips: [
          'Use linguagem diplomática e respeitosa',
          'Evite gestos que possam ser considerados ofensivos',
          'Mantenha contato visual moderado - não fixe o olhar',
          'Demonstre interesse genuine pelas opiniões dos outros',
          'Seja paciente com processos de tomada de decisão'
        ]
      }
    },
    {
      id: 'workplace',
      title: 'Ambiente de Trabalho',
      description: 'Dinâmicas do local de trabalho, hierarquia e colaboração em equipe',
      icon: <GrGroup size={24} />,
      color: '#8B5CF6',
      readTime: 18,
      isCompleted: false,
      content: {
        overview: 'Os locais de trabalho nos UAE são multiculturais, com profissionais de todo o mundo. O respeito pela diversidade, combinado com valores árabes tradicionais, cria um ambiente único.',
        keyPoints: [
          'Equipes são altamente diversificadas com muitas nacionalidades',
          'Respeito pela autoridade é fundamental',
          'Colaboração é valorizada, mas decisões finais vêm da liderança',
          'Horários de trabalho variam durante o Ramadan',
          'Networking é essencial para crescimento profissional'
        ],
        tips: [
          'Adapte-se a diferentes estilos de trabalho culturais',
          'Participe ativamente de eventos sociais da empresa',
          'Mostre respeito por todas as culturas presentes',
          'Seja flexível com horários durante períodos religiosos',
          'Desenvolva relacionamentos em todos os níveis hierárquicos'
        ]
      }
    },
    {
      id: 'social',
      title: 'Vida Social e Networking',
      description: 'Como construir relacionamentos e navegar na vida social profissional',
      icon: <GrCoffee size={24} />,
      color: '#EC4899',
      readTime: 14,
      isCompleted: false,
      content: {
        overview: 'A vida social nos UAE gira em torno da hospitalidade árabe e eventos profissionais. Construir uma rede sólida é essencial para o sucesso profissional e pessoal.',
        keyPoints: [
          'Hospitalidade é fundamental na cultura árabe',
          'Eventos de networking são frequentes e importantes',
          'Relacionamentos pessoais influenciam oportunidades profissionais',
          'Respeitar tradições locais em eventos sociais',
          'Diversidade cultural oferece ricas oportunidades de aprendizado'
        ],
        tips: [
          'Aceite convites para eventos sociais sempre que possível',
          'Retribua a hospitalidade quando apropriado',
          'Participe de atividades comunitárias e culturais',
          'Mantenha contato regular com sua rede profissional',
          'Demonstre interesse genuine por outras culturas'
        ]
      }
    },
    {
      id: 'practical',
      title: 'Dicas Práticas',
      description: 'Informações úteis para o dia a dia nos Emirados Árabes Unidos',
      icon: <GrTarget size={24} />,
      color: '#EF4444',
      readTime: 16,
      isCompleted: false,
      content: {
        overview: 'Aspectos práticos da vida diária nos UAE, desde transporte até costumes sociais, que facilitarão sua adaptação e integração na sociedade local.',
        keyPoints: [
          'Transporte público é eficiente, especialmente o metro de Dubai',
          'Táxis são amplamente disponíveis e seguros',
          'Shoppings são centros sociais importantes',
          'Clima é muito quente - adapte suas atividades',
          'Custo de vida varia significativamente entre emirados'
        ],
        tips: [
          'Use aplicativos locais como Careem e Uber',
          'Planeje atividades ao ar livre para manhãs/noites',
          'Familiarize-se com áreas de cada emirado',
          'Tenha sempre identificação consigo',
          'Aprenda sobre festivais e feriados locais'
        ]
      }
    }
  ];

  const markSectionAsCompleted = (sectionId: string) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections(prev => [...prev, sectionId]);
    }
  };

  const stats = {
    totalSections: cultureSections.length,
    completedSections: completedSections.length,
    totalReadTime: cultureSections.reduce((total, section) => total + section.readTime, 0),
    completedReadTime: cultureSections.filter(s => completedSections.includes(s.id)).reduce((total, section) => total + section.readTime, 0)
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.culturaPage}>
      <DashboardHeader user={user} userType="candidato" />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Guia Cultural - Emirados Árabes Unidos</h1>
              <p>Prepare-se culturalmente para atuar nos Emirados Árabes Unidos com nosso guia completo</p>
            </div>
            
            <div className={styles.headerActions}>
              <button className="btn btn-secondary">
                <GrDownload size={16} />
                Baixar PDF Completo
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrBook size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.completedSections}/{stats.totalSections}</h3>
                <p>Seções Concluídas</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.completedReadTime}min</h3>
                <p>Tempo de Leitura</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrTarget size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{Math.round((stats.completedSections / stats.totalSections) * 100)}%</h3>
                <p>Progresso Geral</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrGlobe size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>UAE</h3>
                <p>Destino de Carreira</p>
              </div>
            </div>
          </div>

          {/* Culture Sections */}
          <div className={styles.sectionsGrid}>
            {cultureSections.map((section) => (
              <div key={section.id} className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon} style={{ backgroundColor: section.color }}>
                    {section.icon}
                  </div>
                  <div className={styles.sectionInfo}>
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                  </div>
                  {section.isCompleted && (
                    <div className={styles.completedBadge}>
                      <GrStatusGood size={20} />
                    </div>
                  )}
                </div>

                <div className={styles.sectionMeta}>
                  <div className={styles.readTime}>
                    <GrClock size={14} />
                    <span>{section.readTime} min</span>
                  </div>
                  <div className={styles.sectionStatus}>
                    {section.isCompleted ? (
                      <span className={styles.statusCompleted}>✓ Concluído</span>
                    ) : (
                      <span className={styles.statusPending}>Pendente</span>
                    )}
                  </div>
                </div>

                <div className={styles.sectionPreview}>
                  <p>{section.content.overview.substring(0, 120)}...</p>
                </div>

                <div className={styles.sectionActions}>
                  <button 
                    className="btn btn-primary btn-small"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <GrView size={16} />
                    {section.isCompleted ? 'Revisar' : 'Ler Agora'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section Modal */}
          {activeSection && (
            <div className={styles.modalOverlay} onClick={() => setActiveSection(null)}>
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {(() => {
                  const section = cultureSections.find(s => s.id === activeSection);
                  if (!section) return null;

                  return (
                    <>
                      <div className={styles.modalHeader}>
                        <div className={styles.modalTitle}>
                          <div className={styles.modalIcon} style={{ backgroundColor: section.color }}>
                            {section.icon}
                          </div>
                          <div>
                            <h2>{section.title}</h2>
                            <p>{section.readTime} min de leitura</p>
                          </div>
                        </div>
                        <button 
                          className={styles.closeBtn}
                          onClick={() => setActiveSection(null)}
                        >
                          ×
                        </button>
                      </div>

                      <div className={styles.modalContent}>
                        <div className={styles.overview}>
                          <h3>Visão Geral</h3>
                          <p>{section.content.overview}</p>
                        </div>

                        <div className={styles.keyPoints}>
                          <h3>Pontos Principais</h3>
                          <ul>
                            {section.content.keyPoints.map((point, index) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </div>

                        <div className={styles.tips}>
                          <h3>💡 Dicas Práticas</h3>
                          <ul>
                            {section.content.tips.map((tip, index) => (
                              <li key={index}>{tip}</li>
                            ))}
                          </ul>
                        </div>

                        {section.content.examples && (
                          <div className={styles.examples}>
                            <h3>📝 Exemplos</h3>
                            <ul>
                              {section.content.examples.map((example, index) => (
                                <li key={index}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className={styles.modalFooter}>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setActiveSection(null)}
                        >
                          Voltar
                        </button>
                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            markSectionAsCompleted(section.id);
                            setActiveSection(null);
                          }}
                        >
                          <GrStatusGood size={16} />
                          Marcar como Concluído
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 