'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Crown, 
  Play, 
  Clock, 
  Video, 
  Mic,
  User, 
  Bell, 
  Settings, 
  LogOut,
  CheckCircle,
  Star,
  TrendingUp,
  Filter,
  Search,
  Plus,
  BookOpen,
  Target,
  Award,
  Zap,
  Brain,
  Users,
  Briefcase,
  Code,
  Palette,
  BarChart3,
  Shield,
  Globe,
  Camera,
  PauseCircle,
  SkipForward,
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import styles from './simulacoes.module.css';

interface SimulationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  questionsCount: number;
  avgDuration: number;
  difficulty: 'básico' | 'intermediário' | 'avançado';
  unlocked: boolean;
}

interface Simulation {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: number;
  questionsCount: number;
  difficulty: 'básico' | 'intermediário' | 'avançado';
  type: 'comportamental' | 'técnica' | 'cultural' | 'situacional';
  completed: boolean;
  score?: number;
  completedAt?: string;
  feedback?: string;
  nextSimulation?: number;
  tags: string[];
}

interface SimulationAttempt {
  id: number;
  simulationId: number;
  completedAt: string;
  score: number;
  feedback: string;
  answers: Array<{
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }>;
}

export default function SimulacoesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categorias');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

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

  const categories: SimulationCategory[] = [
    {
      id: 'comportamental',
      name: 'Entrevistas Comportamentais',
      description: 'Perguntas sobre experiências, motivações e fit cultural',
      icon: <Users size={24} />,
      color: '#3B82F6',
      questionsCount: 25,
      avgDuration: 30,
      difficulty: 'básico',
      unlocked: true
    },
    {
      id: 'tecnica',
      name: 'Entrevistas Técnicas',
      description: 'Perguntas específicas da sua área de atuação',
      icon: <Code size={24} />,
      color: '#10B981',
      questionsCount: 40,
      avgDuration: 45,
      difficulty: 'intermediário',
      unlocked: true
    },
    {
      id: 'cultural',
      name: 'Adaptação Cultural',
      description: 'Preparação para trabalhar nos Emirados Árabes Unidos',
      icon: <Globe size={24} />,
      color: '#F59E0B',
      questionsCount: 20,
      avgDuration: 25,
      difficulty: 'intermediário',
      unlocked: true
    },
    {
      id: 'lideranca',
      name: 'Liderança e Gestão',
      description: 'Simulações para posições de liderança',
      icon: <Award size={24} />,
      color: '#8B5CF6',
      questionsCount: 30,
      avgDuration: 40,
      difficulty: 'avançado',
      unlocked: false
    },
    {
      id: 'vendas',
      name: 'Vendas e Negociação',
      description: 'Técnicas de vendas e negociação comercial',
      icon: <BarChart3 size={24} />,
      color: '#EF4444',
      questionsCount: 35,
      avgDuration: 35,
      difficulty: 'intermediário',
      unlocked: false
    },
    {
      id: 'design',
      name: 'Design e Criatividade',
      description: 'Portfolio review e processo criativo',
      icon: <Palette size={24} />,
      color: '#EC4899',
      questionsCount: 18,
      avgDuration: 50,
      difficulty: 'intermediário',
      unlocked: true
    }
  ];

  const simulations: Simulation[] = [
    {
      id: 1,
      title: 'Apresentação Pessoal e Motivações',
      description: 'Pratique como se apresentar e explicar suas motivações profissionais',
      category: 'comportamental',
      duration: 20,
      questionsCount: 8,
      difficulty: 'básico',
      type: 'comportamental',
      completed: true,
      score: 85,
      completedAt: '2024-12-10',
      feedback: 'Excelente apresentação! Trabalhe na conexão emocional com suas experiências.',
      tags: ['apresentação', 'motivação', 'primeira impressão']
    },
    {
      id: 2,
      title: 'Experiências e Conquistas',
      description: 'Como destacar suas principais experiências e conquistas profissionais',
      category: 'comportamental',
      duration: 25,
      questionsCount: 10,
      difficulty: 'básico',
      type: 'comportamental',
      completed: false,
      tags: ['experiência', 'conquistas', 'resultados']
    },
    {
      id: 3,
      title: 'Desafios e Resolução de Problemas',
      description: 'Demonstre como você lida com desafios e resolve problemas complexos',
      category: 'comportamental',
      duration: 30,
      questionsCount: 12,
      difficulty: 'intermediário',
      type: 'situacional',
      completed: false,
      tags: ['problemas', 'desafios', 'soluções']
    },
    {
      id: 4,
      title: 'Conhecimentos Técnicos - Frontend',
      description: 'Avaliação de conhecimentos em React, JavaScript, CSS e desenvolvimento web',
      category: 'tecnica',
      duration: 45,
      questionsCount: 15,
      difficulty: 'intermediário',
      type: 'técnica',
      completed: true,
      score: 78,
      completedAt: '2024-12-08',
      feedback: 'Bom conhecimento técnico. Recomendo estudar mais sobre performance e otimização.',
      tags: ['react', 'javascript', 'css', 'frontend']
    },
    {
      id: 5,
      title: 'Conhecimentos Técnicos - Backend',
      description: 'APIs, bancos de dados, arquitetura de sistemas e segurança',
      category: 'tecnica',
      duration: 50,
      questionsCount: 18,
      difficulty: 'avançado',
      type: 'técnica',
      completed: false,
      tags: ['api', 'database', 'arquitetura', 'backend']
    },
    {
      id: 6,
      title: 'Cultura e Etiqueta nos Emirados',
      description: 'Entenda a cultura empresarial e etiqueta profissional nos UAE',
      category: 'cultural',
      duration: 25,
      questionsCount: 10,
      difficulty: 'intermediário',
      type: 'cultural',
      completed: false,
      tags: ['cultura', 'emirados', 'etiqueta', 'negócios']
    },
    {
      id: 7,
      title: 'Portfolio e Processo Criativo',
      description: 'Apresentação de portfolio e explicação do processo criativo',
      category: 'design',
      duration: 40,
      questionsCount: 12,
      difficulty: 'intermediário',
      type: 'comportamental',
      completed: false,
      tags: ['portfolio', 'design', 'criatividade', 'processo']
    }
  ];

  const filteredSimulations = simulations.filter(simulation => {
    const matchesSearch = simulation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         simulation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         simulation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || simulation.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || simulation.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const stats = {
    total: simulations.length,
    completed: simulations.filter(s => s.completed).length,
    avgScore: Math.round(simulations.filter(s => s.score).reduce((acc, s) => acc + (s.score || 0), 0) / simulations.filter(s => s.score).length) || 0,
    hoursSpent: Math.round(simulations.filter(s => s.completed).reduce((acc, s) => acc + s.duration, 0) / 60 * 10) / 10
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'básico': return '#10B981';
      case 'intermediário': return '#F59E0B';
      case 'avançado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comportamental': return <Users size={16} />;
      case 'técnica': return <Code size={16} />;
      case 'cultural': return <Globe size={16} />;
      case 'situacional': return <Brain size={16} />;
      default: return <BookOpen size={16} />;
    }
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
    <div className={styles.simulacoesPage}>
      <DashboardHeader user={user} userType="candidato" />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Simulações de Entrevista</h1>
              <p>Pratique entrevistas reais e melhore suas habilidades de comunicação</p>
            </div>
            
            <div className={styles.headerActions}>
              <Link href="/candidato/simulacoes/nova" className="btn btn-primary">
                <Plus size={20} />
                Nova Simulação
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Target size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.completed}/{stats.total}</h3>
                <p>Simulações Concluídas</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Star size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.avgScore}%</h3>
                <p>Pontuação Média</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Clock size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.hoursSpent}h</h3>
                <p>Tempo de Prática</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <TrendingUp size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>+12%</h3>
                <p>Melhoria Geral</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={styles.tabsSection}>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'categorias' ? styles.active : ''}`}
                onClick={() => setActiveTab('categorias')}
              >
                <BookOpen size={18} />
                Por Categoria
              </button>
              
              <button 
                className={`${styles.tab} ${activeTab === 'simulacoes' ? styles.active : ''}`}
                onClick={() => setActiveTab('simulacoes')}
              >
                <Play size={18} />
                Todas as Simulações
                <span className={styles.tabBadge}>{simulations.length}</span>
              </button>

              <button 
                className={`${styles.tab} ${activeTab === 'historico' ? styles.active : ''}`}
                onClick={() => setActiveTab('historico')}
              >
                <CheckCircle size={18} />
                Histórico
                <span className={styles.tabBadge}>{stats.completed}</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'categorias' && (
            <div className={styles.categoriesSection}>
              <div className={styles.categoriesGrid}>
                {categories.map((category) => (
                  <div key={category.id} className={`${styles.categoryCard} ${!category.unlocked ? styles.locked : ''}`}>
                    <div className={styles.categoryHeader}>
                      <div className={styles.categoryIcon} style={{ backgroundColor: category.color }}>
                        {category.icon}
                      </div>
                      <div className={styles.categoryInfo}>
                        <h3>{category.name}</h3>
                        <p>{category.description}</p>
                      </div>
                      {!category.unlocked && (
                        <div className={styles.lockIcon}>
                          <Shield size={20} />
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.categoryStats}>
                      <div className={styles.categoryStat}>
                        <span className={styles.statNumber}>{category.questionsCount}</span>
                        <span className={styles.statLabel}>Perguntas</span>
                      </div>
                      <div className={styles.categoryStat}>
                        <span className={styles.statNumber}>{category.avgDuration}min</span>
                        <span className={styles.statLabel}>Duração Média</span>
                      </div>
                      <div className={styles.categoryStat}>
                        <span 
                          className={styles.difficultyBadge}
                          style={{ backgroundColor: getDifficultyColor(category.difficulty) }}
                        >
                          {category.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.categoryActions}>
                      {category.unlocked ? (
                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setActiveTab('simulacoes');
                          }}
                        >
                          <Play size={16} />
                          Iniciar Simulação
                        </button>
                      ) : (
                        <button className="btn btn-secondary" disabled>
                          <Shield size={16} />
                          Bloqueado
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'simulacoes' && (
            <div className={styles.simulacoesSection}>
              {/* Filters */}
              <div className={styles.filtersSection}>
                <div className={styles.searchBar}>
                  <div className={styles.searchInput}>
                    <Search size={20} />
                    <input
                      type="text"
                      placeholder="Buscar simulações..."
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
                      {categories.filter(c => c.unlocked).map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    
                    <select 
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                    >
                      <option value="">Todos os níveis</option>
                      <option value="básico">Básico</option>
                      <option value="intermediário">Intermediário</option>
                      <option value="avançado">Avançado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Simulations List */}
              <div className={styles.simulationsList}>
                {filteredSimulations.map((simulation) => (
                  <div key={simulation.id} className={`${styles.simulationCard} ${simulation.completed ? styles.completed : ''}`}>
                    <div className={styles.simulationHeader}>
                      <div className={styles.simulationInfo}>
                        <div className={styles.simulationTitle}>
                          <h3>{simulation.title}</h3>
                          <div className={styles.simulationMeta}>
                            <div className={styles.metaItem}>
                              {getTypeIcon(simulation.type)}
                              <span>{simulation.type}</span>
                            </div>
                            <div className={styles.metaItem}>
                              <Clock size={14} />
                              <span>{simulation.duration}min</span>
                            </div>
                            <div className={styles.metaItem}>
                              <BookOpen size={14} />
                              <span>{simulation.questionsCount} perguntas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className={styles.simulationStatus}>
                        <div 
                          className={styles.difficultyBadge}
                          style={{ backgroundColor: getDifficultyColor(simulation.difficulty) }}
                        >
                          {simulation.difficulty}
                        </div>
                        
                        {simulation.completed && (
                          <div className={styles.completedBadge}>
                            <CheckCircle size={16} />
                            <span>Concluída</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.simulationContent}>
                      <p>{simulation.description}</p>
                      
                      <div className={styles.simulationTags}>
                        {simulation.tags.map((tag, index) => (
                          <span key={index} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      {simulation.completed && simulation.score && (
                        <div className={styles.simulationResult}>
                          <div className={styles.scoreDisplay}>
                            <Star size={16} />
                            <span className={styles.score}>{simulation.score}%</span>
                            <span className={styles.completedDate}>
                              Concluída em {new Date(simulation.completedAt!).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          
                          {simulation.feedback && (
                            <div className={styles.feedback}>
                              <p>&ldquo;{simulation.feedback}&rdquo;</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles.simulationActions}>
                      {simulation.completed ? (
                        <>
                          <Link 
                            href={`/candidato/simulacoes/${simulation.id}/resultado`}
                            className="btn btn-secondary btn-small"
                          >
                            Ver Resultado
                          </Link>
                          <Link 
                            href={`/candidato/simulacoes/${simulation.id}`}
                            className="btn btn-primary btn-small"
                          >
                            <RotateCcw size={16} />
                            Refazer
                          </Link>
                        </>
                      ) : (
                        <Link 
                          href={`/candidato/simulacoes/${simulation.id}`}
                          className="btn btn-primary btn-small"
                        >
                          <Play size={16} />
                          Iniciar
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredSimulations.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Target size={48} />
                  </div>
                  <h3>Nenhuma simulação encontrada</h3>
                  <p>
                    Tente ajustar os filtros ou explore as categorias disponíveis para encontrar simulações adequadas ao seu perfil.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'historico' && (
            <div className={styles.historicoSection}>
              <div className={styles.historicoHeader}>
                <h2>Histórico de Simulações</h2>
                <p>Acompanhe sua evolução e resultados ao longo do tempo</p>
              </div>

              <div className={styles.progressChart}>
                <div className={styles.chartHeader}>
                  <h3>Evolução da Pontuação</h3>
                  <div className={styles.chartPeriod}>
                    <span>Últimos 30 dias</span>
                  </div>
                </div>
                <div className={styles.chartPlaceholder}>
                  <div className={styles.chartMessage}>
                    <BarChart3 size={48} />
                    <p>Gráfico de evolução será exibido após mais simulações</p>
                  </div>
                </div>
              </div>

              <div className={styles.historicoList}>
                {simulations.filter(s => s.completed).map((simulation) => (
                  <div key={simulation.id} className={styles.historicoItem}>
                    <div className={styles.historicoInfo}>
                      <h4>{simulation.title}</h4>
                      <div className={styles.historicoMeta}>
                        <span>Concluída em {new Date(simulation.completedAt!).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>{simulation.duration} minutos</span>
                        <span>•</span>
                        <span>{simulation.questionsCount} perguntas</span>
                      </div>
                    </div>
                    
                    <div className={styles.historicoScore}>
                      <div className={styles.scoreCircle}>
                        <span>{simulation.score}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {simulations.filter(s => s.completed).length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <CheckCircle size={48} />
                  </div>
                  <h3>Nenhuma simulação concluída</h3>
                  <p>
                    Complete suas primeiras simulações para ver seu histórico e acompanhar sua evolução.
                  </p>
                  <Link href="#" onClick={() => setActiveTab('simulacoes')} className="btn btn-primary">
                    Iniciar Primeira Simulação
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 