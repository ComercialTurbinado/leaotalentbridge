'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrPrevious, GrPlay, GrClock, GrGroup, GrStar, GrStatusGood, GrLock, GrDocument, GrVideo, GrDownload, GrUser, GrNotification, GrLogout, GrCalendar, GrGlobe, GrBriefcase, GrBarChart, GrLineChart, GrShare, GrChat, GrNext, GrLike, GrBook, GrTrophy, GrTarget, GrCode, GrPaint, GrBookmark } from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import styles from './curso-detalhes.module.css';

interface CourseModule {
  id: number;
  title: string;
  description: string;
  duration: number; // em minutos
  type: 'video' | 'text' | 'quiz' | 'assignment';
  completed: boolean;
  locked: boolean;
  resources?: {
    type: 'pdf' | 'link' | 'code';
    title: string;
    url: string;
  }[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  category: 'tecnologia' | 'design' | 'negocios' | 'idiomas' | 'soft-skills';
  level: 'iniciante' | 'intermediario' | 'avancado';
  duration: number; // em horas
  modules: CourseModule[];
  students: number;
  rating: number;
  reviews: number;
  instructor: string;
  instructorBio: string;
  instructorAvatar: string;
  thumbnail: string;
  featured: boolean;
  progress: number; // 0-100
  certificate: boolean;
  skills: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  lastUpdated: string;
  language: string;
  completedModules: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export default function CursoDetalhes() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string || "1";
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadCourse = useCallback(() => {
    // Mock data - em produção viria de uma API
    const mockCourse: Course = {
      id: parseInt(courseId),
      title: 'React.js Completo - Do Zero ao Avançado',
      description: 'Aprenda React.js desde os conceitos básicos até técnicas avançadas. Inclui hooks, context API, Redux e projetos práticos.',
      longDescription: 'Este curso completo de React.js foi desenvolvido para levar você do nível iniciante ao avançado. Você aprenderá todos os conceitos fundamentais do React, incluindo componentes, props, state, hooks, context API, e muito mais. O curso inclui projetos práticos que você pode adicionar ao seu portfólio.',
      category: 'tecnologia',
      level: 'intermediario',
      duration: 40,
      modules: [
        {
          id: 1,
          title: 'Introdução ao React',
          description: 'Conceitos básicos, instalação e primeiro componente',
          duration: 45,
          type: 'video',
          completed: true,
          locked: false,
          resources: [
            { type: 'pdf', title: 'Guia de Instalação', url: '#' },
            { type: 'code', title: 'Código do Projeto', url: '#' }
          ]
        },
        {
          id: 2,
          title: 'Componentes e Props',
          description: 'Criando componentes reutilizáveis e passando dados',
          duration: 60,
          type: 'video',
          completed: true,
          locked: false,
          resources: [
            { type: 'pdf', title: 'Exercícios Práticos', url: '#' }
          ]
        },
        {
          id: 3,
          title: 'State e Eventos',
          description: 'Gerenciando estado e manipulando eventos',
          duration: 75,
          type: 'video',
          completed: true,
          locked: false
        },
        {
          id: 4,
          title: 'Hooks Essenciais',
          description: 'useState, useEffect e outros hooks fundamentais',
          duration: 90,
          type: 'video',
          completed: false,
          locked: false
        },
        {
          id: 5,
          title: 'Context API',
          description: 'Gerenciamento de estado global com Context',
          duration: 80,
          type: 'video',
          completed: false,
          locked: false
        },
        {
          id: 6,
          title: 'Roteamento com React Router',
          description: 'Navegação entre páginas em aplicações SPA',
          duration: 70,
          type: 'video',
          completed: false,
          locked: false
        },
        {
          id: 7,
          title: 'Projeto Prático - Todo App',
          description: 'Construindo uma aplicação completa de tarefas',
          duration: 120,
          type: 'video',
          completed: false,
          locked: false
        },
        {
          id: 8,
          title: 'Redux Toolkit',
          description: 'Gerenciamento avançado de estado com Redux',
          duration: 100,
          type: 'video',
          completed: false,
          locked: false
        },
        {
          id: 9,
          title: 'Testes com Jest e Testing Library',
          description: 'Testando componentes React',
          duration: 85,
          type: 'video',
          completed: false,
          locked: false
        },
        {
          id: 10,
          title: 'Deploy e Otimização',
          description: 'Publicando sua aplicação e otimizações de performance',
          duration: 65,
          type: 'video',
          completed: false,
          locked: false
        },
        {
          id: 11,
          title: 'Projeto Final - E-commerce',
          description: 'Construindo uma loja virtual completa',
          duration: 180,
          type: 'video',
          completed: false,
          locked: false
        },
        {
          id: 12,
          title: 'Avaliação Final',
          description: 'Quiz final para certificação',
          duration: 30,
          type: 'quiz',
          completed: false,
          locked: false
        }
      ],
      students: 2847,
      rating: 4.8,
      reviews: 342,
      instructor: 'Carlos Silva',
      instructorBio: 'Desenvolvedor Full Stack com mais de 8 anos de experiência. Especialista em React, Node.js e arquitetura de sistemas. Já treinou mais de 10.000 desenvolvedores.',
      instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
      featured: true,
      progress: 25, // 3 de 12 módulos concluídos
      certificate: true,
      skills: ['React.js', 'JavaScript', 'Hooks', 'Redux', 'Context API', 'React Router'],
      requirements: [
        'Conhecimento básico de HTML, CSS e JavaScript',
        'Familiaridade com ES6+',
        'Node.js instalado no computador',
        'Editor de código (VS GrCode recomendado)'
      ],
      whatYouWillLearn: [
        'Dominar os conceitos fundamentais do React',
        'Criar componentes reutilizáveis e eficientes',
        'Gerenciar estado com hooks e Context API',
        'Implementar roteamento em aplicações SPA',
        'Trabalhar com Redux para estado global',
        'Testar componentes React',
        'Otimizar performance de aplicações',
        'Fazer deploy de aplicações React'
      ],
      lastUpdated: '2024-01-15',
      language: 'Português',
      completedModules: 3,
      status: 'in_progress'
    };

    setCourse(mockCourse);
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
    loadCourse();
  }, [router, loadCourse]);

  const handleLogout = () => {
    AuthService.logout();
    router.push('/');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tecnologia':
        return <GrCode size={20} />;
      case 'design':
        return <GrPaint size={20} />;
      case 'negocios':
        return <GrBriefcase size={20} />;
      case 'idiomas':
        return <GrGlobe size={20} />;
      case 'soft-skills':
        return <GrChat size={20} />;
      default:
        return <GrBook size={20} />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'tecnologia':
        return 'Tecnologia';
      case 'design':
        return 'Design';
      case 'negocios':
        return 'Negócios';
      case 'idiomas':
        return 'Idiomas';
      case 'soft-skills':
        return 'Soft Skills';
      default:
        return 'Outros';
    }
  };

  const getLevelName = (level: string) => {
    switch (level) {
      case 'iniciante':
        return 'Iniciante';
      case 'intermediario':
        return 'Intermediário';
      case 'avancado':
        return 'Avançado';
      default:
        return 'Todos';
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <GrVideo size={16} />;
      case 'text':
        return <GrDocument size={16} />;
      case 'quiz':
        return <GrTarget size={16} />;
      case 'assignment':
        return <GrBook size={16} />;
      default:
        return <GrBook size={16} />;
    }
  };

  const getModuleTypeName = (type: string) => {
    switch (type) {
      case 'video':
        return 'Vídeo';
      case 'text':
        return 'Texto';
      case 'quiz':
        return 'Quiz';
      case 'assignment':
        return 'Exercício';
      default:
        return 'Conteúdo';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className="loading"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.errorPage}>
        <h1>Curso não encontrado</h1>
        <Link href="/candidato/cursos" className="btn btn-primary">
          Voltar aos Cursos
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.cursoDetalhesPage}>
      <DashboardHeader user={user} userType="candidato" />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className="container">
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link href="/candidato/cursos" className={styles.backLink}>
              <GrPrevious size={16} />
              Voltar aos Cursos
            </Link>
          </div>

          {/* Course Hero */}
          <div className={styles.courseHero}>
            <div className={styles.courseInfo}>
              <div className={styles.courseMeta}>
                <div className={styles.categoryBadge}>
                  {getCategoryIcon(course.category)}
                  <span>{getCategoryName(course.category)}</span>
                </div>
                <div className={styles.levelBadge}>
                  {getLevelName(course.level)}
                </div>
              </div>

              <h1 className={styles.courseTitle}>{course.title}</h1>
              <p className={styles.courseDescription}>{course.description}</p>

              <div className={styles.courseStats}>
                <div className={styles.statItem}>
                  <GrStar size={16} />
                  <span>{course.rating} ({course.reviews} avaliações)</span>
                </div>
                <div className={styles.statItem}>
                  <GrGroup size={16} />
                  <span>{course.students.toLocaleString()} alunos</span>
                </div>
                <div className={styles.statItem}>
                  <GrClock size={16} />
                  <span>{course.duration} horas</span>
                </div>
                <div className={styles.statItem}>
                  <GrBook size={16} />
                  <span>{course.modules.length} módulos</span>
                </div>
                <div className={styles.statItem}>
                  <GrGlobe size={16} />
                  <span>{course.language}</span>
                </div>
              </div>

              <div className={styles.instructor}>
                <img src={course.instructorAvatar} alt={course.instructor} />
                <div>
                  <h4>Instrutor: {course.instructor}</h4>
                  <p>{course.instructorBio}</p>
                </div>
              </div>
            </div>

            <div className={styles.courseMedia}>
              <div className={styles.courseImage}>
                <Image src={course.thumbnail} alt={course.title} width={400} height={250} />
                {course.status === 'in_progress' && course.progress > 0 && (
                  <div className={styles.progressOverlay}>
                    <div className={styles.progressInfo}>
                      <span>Seu Progresso</span>
                      <span className={styles.progressPercent}>{course.progress}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className={styles.progressText}>
                      {course.completedModules} de {course.modules.length} módulos concluídos
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.courseActions}>
                <Link 
                  href={`/candidato/cursos/${course.id}/modulo/4`}
                  className="btn btn-primary btn-large w-full"
                >
                  <GrPlay size={20} />
                  {course.status === 'in_progress' ? 'Continuar Curso' : 
                   course.status === 'completed' ? 'Revisar Curso' : 'Iniciar Curso'}
                </Link>

                <div className={styles.courseStatus}>
                  <div className={styles.statusInfo}>
                    <span className={styles.statusLabel}>Status:</span>
                    <span className={`${styles.statusText} ${
                      course.status === 'completed' ? styles.completed :
                      course.status === 'in_progress' ? styles.inProgress : styles.notStarted
                    }`}>
                      {course.status === 'completed' ? 'Concluído' :
                       course.status === 'in_progress' ? 'Em Progresso' : 'Disponível'}
                    </span>
                  </div>
                  {course.certificate && (
                    <div className={styles.certificateInfo}>
                      <GrTrophy size={16} />
                      <span>Certificado incluído</span>
                    </div>
                  )}
                </div>

                <div className={styles.actionButtons}>
                  <button className={styles.actionBtn}>
                    <GrBookmark size={16} />
                    Salvar
                  </button>
                  <button className={styles.actionBtn}>
                    <GrShare size={16} />
                    Compartilhar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Course Navigation */}
          <div className={styles.courseNavigation}>
            <button 
              className={`${styles.navTab} ${activeTab === 'overview' ? styles.active : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Visão Geral
            </button>
            <button 
              className={`${styles.navTab} ${activeTab === 'modules' ? styles.active : ''}`}
              onClick={() => setActiveTab('modules')}
            >
              Módulos ({course.modules.length})
            </button>
            <button 
              className={`${styles.navTab} ${activeTab === 'reviews' ? styles.active : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Avaliações ({course.reviews})
            </button>
          </div>

          {/* Course Content */}
          <div className={styles.courseContent}>
            {activeTab === 'overview' && (
              <div className={styles.overviewTab}>
                <div className={styles.mainContent}>
                  <section className={styles.section}>
                    <h2>Sobre o Curso</h2>
                    <p>{course.longDescription}</p>
                  </section>

                  <section className={styles.section}>
                    <h2>O que você vai aprender</h2>
                    <ul className={styles.learningList}>
                      {course.whatYouWillLearn.map((item, index) => (
                        <li key={index}>
                          <GrStatusGood size={16} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className={styles.section}>
                    <h2>Requisitos</h2>
                    <ul className={styles.requirementsList}>
                      {course.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </section>

                  <section className={styles.section}>
                    <h2>Habilidades que você desenvolverá</h2>
                    <div className={styles.skillsList}>
                      {course.skills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>

                <div className={styles.sidebar}>
                  <div className={styles.sidebarCard}>
                    <h3>Detalhes do Curso</h3>
                    <div className={styles.detailsList}>
                      <div className={styles.detailItem}>
                        <GrClock size={16} />
                        <span>Duração: {course.duration} horas</span>
                      </div>
                      <div className={styles.detailItem}>
                        <GrBook size={16} />
                        <span>{course.modules.length} módulos</span>
                      </div>
                      <div className={styles.detailItem}>
                        <GrTrophy size={16} />
                        <span>Certificado incluído</span>
                      </div>
                      <div className={styles.detailItem}>
                        <GrCalendar size={16} />
                        <span>Atualizado em {new Date(course.lastUpdated).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.sidebarCard}>
                    <h3>Estatísticas</h3>
                    <div className={styles.statsList}>
                      <div className={styles.statItem}>
                        <GrGroup size={16} />
                        <span>{course.students.toLocaleString()} alunos</span>
                      </div>
                      <div className={styles.statItem}>
                        <GrStar size={16} />
                        <span>{course.rating}/5 ({course.reviews} avaliações)</span>
                      </div>
                      <div className={styles.statItem}>
                        <GrLineChart size={16} />
                        <span>95% de conclusão</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'modules' && (
              <div className={styles.modulesTab}>
                <div className={styles.modulesHeader}>
                  <h2>Conteúdo do Curso</h2>
                  <p>{course.modules.length} módulos • {course.duration} horas de conteúdo</p>
                </div>

                <div className={styles.modulesList}>
                  {course.modules.map((module, index) => (
                    <div key={module.id} className={styles.moduleCard}>
                      <div className={styles.moduleHeader}>
                        <div className={styles.moduleNumber}>
                          {module.completed ? (
                            <GrStatusGood size={20} className={styles.completed} />
                          ) : module.locked ? (
                            <GrLock size={20} className={styles.locked} />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        
                        <div className={styles.moduleInfo}>
                          <h3 className={styles.moduleTitle}>{module.title}</h3>
                          <p className={styles.moduleDescription}>{module.description}</p>
                          
                          <div className={styles.moduleMeta}>
                            <div className={styles.moduleType}>
                              {getModuleIcon(module.type)}
                              <span>{getModuleTypeName(module.type)}</span>
                            </div>
                            <div className={styles.moduleDuration}>
                              <GrClock size={14} />
                              <span>{formatDuration(module.duration)}</span>
                            </div>
                          </div>

                          {module.resources && module.resources.length > 0 && (
                            <div className={styles.moduleResources}>
                              <span>Recursos:</span>
                              {module.resources.map((resource, idx) => (
                                <a key={idx} href={resource.url} className={styles.resourceLink}>
                                  <GrDownload size={12} />
                                  {resource.title}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className={styles.moduleActions}>
                          {module.completed ? (
                            <Link 
                              href={`/candidato/cursos/${course.id}/modulo/${module.id}`}
                              className="btn btn-secondary btn-small"
                            >
                              Revisar
                            </Link>
                          ) : module.locked ? (
                            <button className="btn btn-disabled btn-small" disabled>
                              Bloqueado
                            </button>
                          ) : (
                            <Link 
                              href={`/candidato/cursos/${course.id}/modulo/${module.id}`}
                              className="btn btn-primary btn-small"
                            >
                              {index === course.completedModules ? 'Iniciar' : 'Assistir'}
                              <GrNext size={16} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className={styles.reviewsTab}>
                <div className={styles.reviewsHeader}>
                  <h2>Avaliações dos Alunos</h2>
                  <div className={styles.reviewsStats}>
                    <div className={styles.overallRating}>
                      <span className={styles.ratingNumber}>{course.rating}</span>
                      <div className={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                          <GrStar 
                            key={i} 
                            size={16} 
                            className={i < Math.floor(course.rating) ? styles.starFilled : styles.starEmpty}
                          />
                        ))}
                      </div>
                      <span className={styles.reviewCount}>({course.reviews} avaliações)</span>
                    </div>
                  </div>
                </div>

                <div className={styles.reviewsList}>
                  {/* Mock reviews */}
                  <div className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <img 
                        src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" 
                        alt="Ana Silva" 
                      />
                      <div>
                        <h4>Ana Silva</h4>
                        <div className={styles.reviewRating}>
                          {[...Array(5)].map((_, i) => (
                            <GrStar key={i} size={12} className={styles.starFilled} />
                          ))}
                        </div>
                      </div>
                      <span className={styles.reviewDate}>há 2 dias</span>
                    </div>
                    <p className={styles.reviewText}>
                      Excelente curso! O instrutor explica muito bem e os projetos práticos realmente ajudam a fixar o conteúdo. Recomendo para quem quer aprender React de forma sólida.
                    </p>
                    <div className={styles.reviewActions}>
                      <button className={styles.reviewAction}>
                        <GrLike size={14} />
                        Útil (12)
                      </button>
                      <button className={styles.reviewAction}>
                        <GrChat size={14} />
                        Responder
                      </button>
                    </div>
                  </div>

                  <div className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <Image 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" 
                        alt="João Santos" 
                        width={40}
                        height={40}
                      />
                      <div>
                        <h4>João Santos</h4>
                        <div className={styles.reviewRating}>
                          {[...Array(4)].map((_, i) => (
                            <GrStar key={i} size={12} className={styles.starFilled} />
                          ))}
                          <GrStar size={12} className={styles.starEmpty} />
                        </div>
                      </div>
                      <span className={styles.reviewDate}>há 1 semana</span>
                    </div>
                    <p className={styles.reviewText}>
                      Muito bom curso, conteúdo atualizado e bem estruturado. Apenas senti falta de mais exercícios práticos nos primeiros módulos.
                    </p>
                    <div className={styles.reviewActions}>
                      <button className={styles.reviewAction}>
                        <GrLike size={14} />
                        Útil (8)
                      </button>
                      <button className={styles.reviewAction}>
                        <GrChat size={14} />
                        Responder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 