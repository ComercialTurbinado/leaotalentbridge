'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrPlay, GrClock, GrGroup, GrStar, GrLineChart, GrFilter, GrSearch, GrUser, GrNotification, GrLogout, GrStatusGood, GrBarChart, GrCalendar, GrPower, GrGlobe, GrBriefcase, GrDocument, GrVideo, GrDownload, GrNext, GrCode, GrPaint, GrChat, GrBook, GrTrophy, GrApps, GrList } from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import styles from './cursos.module.css';

interface Course {
  id: number;
  title: string;
  description: string;
  category: 'tecnologia' | 'design' | 'negocios' | 'idiomas' | 'soft-skills';
  level: 'iniciante' | 'intermediario' | 'avancado';
  duration: number; // em horas
  modules: number;
  students: number;
  rating: number;
  reviews: number;
  instructor: string;
  instructorAvatar: string;
  thumbnail: string;
  featured: boolean;
  progress?: number; // 0-100
  certificate: boolean;
  skills: string[];
  lastUpdated: string;
  language: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export default function CursosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');

  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: 'React.js Completo - Do Zero ao Avançado',
      description: 'Aprenda React.js desde os conceitos básicos até técnicas avançadas. Inclui hooks, context API, Redux e projetos práticos.',
      category: 'tecnologia',
      level: 'intermediario',
      duration: 40,
      modules: 12,
      students: 2847,
      rating: 4.8,
      reviews: 342,
      instructor: 'Carlos Silva',
      instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
      featured: true,
      progress: 25,
      certificate: true,
      skills: ['React.js', 'JavaScript', 'Hooks', 'Redux'],
      lastUpdated: '2024-01-15',
      language: 'Português',
      status: 'in_progress'
    },
    {
      id: 2,
      title: 'UX/UI Design para Iniciantes',
      description: 'Fundamentos de design de experiência do usuário e interface. Aprenda Figma, prototipagem e design thinking.',
      category: 'design',
      level: 'iniciante',
      duration: 25,
      modules: 8,
      students: 1923,
      rating: 4.7,
      reviews: 198,
      instructor: 'Ana Costa',
      instructorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      featured: false,
      progress: 0,
      certificate: true,
      skills: ['Figma', 'Design Thinking', 'Prototipagem', 'UX Research'],
      lastUpdated: '2024-01-10',
      language: 'Português',
      status: 'not_started'
    },
    {
      id: 3,
      title: 'Inglês para Negócios - Nível Avançado',
      description: 'Desenvolva suas habilidades em inglês para o ambiente corporativo. Apresentações, negociações e comunicação profissional.',
      category: 'idiomas',
      level: 'avancado',
      duration: 30,
      modules: 10,
      students: 1456,
      rating: 4.9,
      reviews: 267,
      instructor: 'Michael Johnson',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
      featured: true,
      progress: 60,
      certificate: true,
      skills: ['Business English', 'Presentations', 'Negotiations', 'Writing'],
      lastUpdated: '2024-01-08',
      language: 'Inglês',
      status: 'in_progress'
    },
    {
      id: 4,
      title: 'Gestão de Projetos Ágeis - Scrum e Kanban',
      description: 'Metodologias ágeis para gestão de projetos. Scrum, Kanban, ferramentas e certificação preparatória.',
      category: 'negocios',
      level: 'intermediario',
      duration: 20,
      modules: 6,
      students: 987,
      rating: 4.6,
      reviews: 143,
      instructor: 'Roberto Lima',
      instructorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
      featured: false,
      progress: 0,
      certificate: true,
      skills: ['Scrum', 'Kanban', 'Agile', 'Project Management'],
      lastUpdated: '2024-01-12',
      language: 'Português',
      status: 'not_started'
    },
    {
      id: 5,
      title: 'Liderança e Comunicação Eficaz',
      description: 'Desenvolva habilidades de liderança, comunicação assertiva e gestão de equipes para o mercado internacional.',
      category: 'soft-skills',
      level: 'intermediario',
      duration: 15,
      modules: 5,
      students: 2134,
      rating: 4.8,
      reviews: 289,
      instructor: 'Fernanda Oliveira',
      instructorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      thumbnail: 'https://images.unsplash.com/photo-1552664688-cf412ec27db2?w=400&h=250&fit=crop',
      featured: false,
      progress: 100,
      certificate: true,
      skills: ['Leadership', 'Communication', 'Team Management', 'Emotional Intelligence'],
      lastUpdated: '2024-01-05',
      language: 'Português',
      status: 'completed'
    },
    {
      id: 6,
      title: 'Node.js e APIs RESTful',
      description: 'Desenvolvimento backend com Node.js, Express, MongoDB e criação de APIs RESTful escaláveis.',
      category: 'tecnologia',
      level: 'avancado',
      duration: 35,
      modules: 14,
      students: 1678,
      rating: 4.7,
      reviews: 234,
      instructor: 'Pedro Santos',
      instructorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=40&h=40&fit=crop&crop=face',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
      featured: true,
      progress: 0,
      certificate: true,
      skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
      lastUpdated: '2024-01-18',
      language: 'Português',
      status: 'not_started'
    }
  ]);

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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'iniciante':
        return styles.levelBeginner;
      case 'intermediario':
        return styles.levelIntermediate;
      case 'avancado':
        return styles.levelAdvanced;
      default:
        return '';
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

  const getStatusBadge = (status: string, progress?: number) => {
    switch (status) {
      case 'completed':
        return (
          <div className={styles.statusBadge}>
            <GrStatusGood size={16} className={styles.statusCompleted} />
            <span>Concluído</span>
          </div>
        );
      case 'in_progress':
        return (
          <div className={styles.statusBadge}>
            <GrPlay size={16} className={styles.statusInProgress} />
            <span>{progress}% Concluído</span>
          </div>
        );
      default:
        return (
          <div className={styles.statusBadge}>
            <GrBook size={16} className={styles.statusNotStarted} />
            <span>Disponível</span>
          </div>
        );
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.students - a.students;
      case 'rating':
        return b.rating - a.rating;
      case 'recent':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default:
        return 0;
    }
  });

  const stats = {
    available: courses.length,
    completed: courses.filter(c => c.status === 'completed').length,
    inProgress: courses.filter(c => c.status === 'in_progress').length,
    certificates: courses.filter(c => c.status === 'completed' && c.certificate).length
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
    <div className={styles.cursosPage}>
      <DashboardHeader user={user} userType="candidato" />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Cursos Disponíveis</h1>
              <p>Desenvolva suas habilidades com cursos gratuitos especializados para o mercado internacional</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrBook size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.available}</h3>
                <p>Cursos Disponíveis</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrPlay size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.inProgress}</h3>
                <p>Em Progresso</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.completed}</h3>
                <p>Concluídos</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrTrophy size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.certificates}</h3>
                <p>Certificados</p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBar}>
              <div className={styles.searchInput}>
                <GrSearch size={20} />
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className={styles.filters}>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Todas as categorias</option>
                  <option value="tecnologia">Tecnologia</option>
                  <option value="design">Design</option>
                  <option value="negocios">Negócios</option>
                  <option value="idiomas">Idiomas</option>
                  <option value="soft-skills">Soft Skills</option>
                </select>
                
                <select 
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <option value="">Todos os níveis</option>
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>

                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Mais populares</option>
                  <option value="rating">Melhor avaliados</option>
                  <option value="recent">Mais recentes</option>
                </select>
              </div>

              <div className={styles.viewToggle}>
                <button 
                  className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <GrApps size={18} />
                </button>
                <button 
                  className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <GrList size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Courses GrList */}
          <div className={styles.coursesSection}>
            <div className={styles.coursesHeader}>
              <h2>
                {sortedCourses.length} {sortedCourses.length === 1 ? 'curso' : 'cursos'}
              </h2>
            </div>

            <div className={`${styles.coursesList} ${viewMode === 'list' ? styles.listView : styles.gridView}`}>
              {sortedCourses.map((course) => (
                <div key={course.id} className={styles.courseCard}>
                  {course.featured && (
                    <div className={styles.featuredBadge}>
                      <GrStar size={12} />
                      Destaque
                    </div>
                  )}

                  <div className={styles.courseImage}>
                    <Image src={course.thumbnail} alt={course.title} width={400} height={250} />
                    {course.status === 'in_progress' && course.progress && course.progress > 0 && (
                      <div className={styles.progressOverlay}>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill} 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className={styles.progressText}>{course.progress}% concluído</span>
                      </div>
                    )}
                    <div className={styles.playButton}>
                      <GrPlay size={24} />
                    </div>
                  </div>

                  <div className={styles.courseContent}>
                    <div className={styles.courseHeader}>
                      <div className={styles.categoryBadge}>
                        {getCategoryIcon(course.category)}
                        <span>{getCategoryName(course.category)}</span>
                      </div>
                      <div className={`${styles.levelBadge} ${getLevelColor(course.level)}`}>
                        {getLevelName(course.level)}
                      </div>
                    </div>

                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <p className={styles.courseDescription}>{course.description}</p>

                    <div className={styles.courseInstructor}>
                          <Image src={course.instructorAvatar} alt={course.instructor} width={40} height={40} />
                      <span>{course.instructor}</span>
                    </div>

                    <div className={styles.courseStats}>
                      <div className={styles.statItem}>
                        <GrClock size={14} />
                        <span>{course.duration} h</span>
                      </div>
                      <div className={styles.statItem}>
                        <GrBook size={14} />
                        <span>{course.modules} módulos</span>
                      </div>
                      <div className={styles.statItem}>
                        <GrGroup size={14} />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                      <div className={styles.statItem}>
                        <GrStar size={14} />
                        <span>{course.rating} ({course.reviews})</span>
                      </div>
                    </div>

                    <div className={styles.courseSkills}>
                      {course.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                      {course.skills.length > 3 && (
                        <span className={styles.skillTag}>
                          +{course.skills.length - 3}
                        </span>
                      )}
                    </div>

                    <div className={styles.courseFooter}>
                      <div className={styles.courseStatus}>
                        {getStatusBadge(course.status, course.progress)}
                      </div>

                      <div className={styles.courseActions}>
                        <Link 
                          href={`/candidato/cursos/${course.id}`}
                          className="btn btn-primary btn-small"
                        >
                          {course.status === 'in_progress' ? 'Continuar' : 
                           course.status === 'completed' ? 'Revisar' : 'Iniciar'}
                          <GrNext size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sortedCourses.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <GrBook size={48} />
                </div>
                <h3>Nenhum curso encontrado</h3>
                <p>Tente ajustar os filtros ou termos de busca para encontrar cursos relevantes.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 