'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GrPlay, GrClock, GrGroup, GrStar, GrFilter, GrSearch, GrUser, GrStatusGood, GrBarChart, GrCalendar, GrCode, GrPaint, GrChat, GrBook, GrTrophy, GrApps, GrList } from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { ApiService } from '@/lib/api';
import styles from './cursos.module.css';

interface Course {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: string;
  category: 'technology' | 'design' | 'business' | 'languages' | 'soft_skills' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  totalDuration: number; // em minutos
  totalLessons: number;
  instructor: {
    name: string;
    avatar: string;
  };
  pricing: {
    type: 'free' | 'paid' | 'subscription';
    price?: number;
  };
  metrics: {
    totalStudents: number;
    averageRating: number;
    totalReviews: number;
  };
  hasCertificate: boolean;
  isFeatured: boolean;
  userProgress?: {
    status: 'not_started' | 'in_progress' | 'completed';
    progress: number;
    lastAccessedAt: string;
  };
}

export default function CursosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Carregar cursos do backend
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy
      };
      
      if (selectedCategory) {
        filters.category = selectedCategory;
      }
      
      if (selectedLevel) {
        filters.level = selectedLevel;
      }
      
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }
      
      const response = await ApiService.getCourses(filters) as any;
      
      if (response.success) {
        setCourses(response.data || []);
        setPagination({
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 12,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 0
        });
      } else {
        setError('Erro ao carregar cursos');
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, selectedCategory, selectedLevel, searchTerm]);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser) {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user, loadCourses]);

  // Gerar categorias disponíveis dinamicamente
  const getAvailableCategories = () => {
    const categories = Array.from(new Set(courses.map(course => course.category)));
    return categories.map(category => ({
      value: category,
      label: getCategoryDisplayName(category),
      icon: getCategoryIcon(category)
    }));
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'technology': return 'Tecnologia';
      case 'design': return 'Design';
      case 'business': return 'Negócios';
      case 'languages': return 'Idiomas';
      case 'soft_skills': return 'Soft Skills';
      case 'other': return 'Outros';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technology': return <GrCode size={16} />;
      case 'design': return <GrPaint size={16} />;
      case 'business': return <GrBarChart size={16} />;
      case 'languages': return <GrChat size={16} />;
      case 'soft_skills': return <GrUser size={16} />;
      default: return <GrBook size={16} />;
    }
  };

  const getLevelDisplayName = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return level;
    }
  };

  const getStatusBadge = (userProgress?: Course['userProgress']) => {
    if (!userProgress) {
      return (
        <div className={`${styles.statusBadge} ${styles.available}`}>
          <GrPlay size={12} />
          <span>Disponível</span>
        </div>
      );
    }

    switch (userProgress.status) {
      case 'completed':
        return (
          <div className={`${styles.statusBadge} ${styles.completed}`}>
            <GrStatusGood size={12} />
            <span>Concluído</span>
          </div>
        );
      case 'in_progress':
        return (
          <div className={`${styles.statusBadge} ${styles.inProgress}`}>
            <GrPlay size={12} />
            <span>{userProgress.progress}% concluído</span>
          </div>
        );
      default:
        return (
          <div className={`${styles.statusBadge} ${styles.available}`}>
            <GrPlay size={12} />
            <span>Disponível</span>
          </div>
        );
    }
  };

  // Calcular estatísticas dinamicamente
  const stats = {
    available: courses.length,
    completed: courses.filter(c => c.userProgress?.status === 'completed').length,
    inProgress: courses.filter(c => c.userProgress?.status === 'in_progress').length,
    certificates: courses.filter(c => c.userProgress?.status === 'completed' && c.hasCertificate).length
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

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Meus Cursos</h1>
              <p>Desenvolva suas habilidades com nossos cursos especializados</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrBook size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.available}</h3>
                <p>Cursos Disponíveis</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrPlay size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.inProgress}</h3>
                <p>Em Progresso</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.completed}</h3>
                <p>Concluídos</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrTrophy size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.certificates}</h3>
                <p>Certificados</p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
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
                className={styles.filterSelect}
              >
                <option value="">Todas as Categorias</option>
                {getAvailableCategories().map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todos os Níveis</option>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="popular">Mais Populares</option>
                <option value="rating">Melhor Avaliados</option>
                <option value="recent">Mais Recentes</option>
                <option value="title">Nome A-Z</option>
              </select>

              <div className={styles.viewToggle}>
                <button
                  className={viewMode === 'grid' ? styles.active : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <GrApps size={16} />
                </button>
                <button
                  className={viewMode === 'list' ? styles.active : ''}
                  onClick={() => setViewMode('list')}
                >
                  <GrList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button onClick={loadCourses} className="btn btn-primary">
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Courses Grid/List */}
          {!error && (
            <div className={`${styles.coursesContainer} ${styles[viewMode]}`}>
              {courses.map((course) => (
                <div key={course._id} className={styles.courseCard}>
                  <div className={styles.courseImage}>
                    <img src={course.thumbnail} alt={course.title} />
                    {course.isFeatured && (
                      <div className={styles.featuredBadge}>
                        <GrTrophy size={14} />
                        <span>Destaque</span>
                      </div>
                    )}
                    {getStatusBadge(course.userProgress)}
                  </div>

                  <div className={styles.courseContent}>
                    <div className={styles.courseHeader}>
                      <div className={styles.courseCategory}>
                        {getCategoryIcon(course.category)}
                        <span>{getCategoryDisplayName(course.category)}</span>
                      </div>
                      <div className={styles.courseLevel}>
                        {getLevelDisplayName(course.level)}
                      </div>
                    </div>

                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <p className={styles.courseDescription}>{course.shortDescription}</p>

                    <div className={styles.courseInstructor}>
                      <img src={course.instructor.avatar} alt={course.instructor.name} />
                      <span>{course.instructor.name}</span>
                    </div>

                    <div className={styles.courseStats}>
                      <div className={styles.courseStat}>
                        <GrClock size={14} />
                        <span>{Math.round(course.totalDuration / 60)}h</span>
                      </div>
                      <div className={styles.courseStat}>
                        <GrPlay size={14} />
                        <span>{course.totalLessons} aulas</span>
                      </div>
                      <div className={styles.courseStat}>
                        <GrGroup size={14} />
                        <span>{course.metrics.totalStudents}</span>
                      </div>
                      <div className={styles.courseStat}>
                        <GrStar size={14} />
                        <span>{course.metrics.averageRating > 0 ? course.metrics.averageRating.toFixed(1) : 'N/A'}</span>
                      </div>
                    </div>

                    {course.userProgress?.status === 'in_progress' && (
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${course.userProgress.progress}%` }}
                        />
                      </div>
                    )}

                    <div className={styles.courseFooter}>
                      <div className={styles.coursePrice}>
                        {course.pricing.type === 'free' ? (
                          <span className={styles.freePrice}>Gratuito</span>
                        ) : (
                          <span className={styles.paidPrice}>
                            ${course.pricing.price}
                          </span>
                        )}
                      </div>

                      <Link 
                        href={`/candidato/cursos/${course.slug}`}
                        className={`btn ${course.userProgress?.status === 'in_progress' ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {course.userProgress?.status === 'in_progress' ? 'Continuar' : 
                         course.userProgress?.status === 'completed' ? 'Revisar' : 'Começar'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && courses.length === 0 && (
            <div className={styles.emptyState}>
              <GrBook size={64} />
              <h3>Nenhum curso encontrado</h3>
              <p>Tente ajustar seus filtros de busca.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="btn btn-secondary"
              >
                Anterior
              </button>
              
              <span className={styles.pageInfo}>
                Página {pagination.page} de {pagination.pages}
              </span>
              
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="btn btn-secondary"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
