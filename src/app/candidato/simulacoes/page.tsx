'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrPlay, GrClock, GrVideo, GrMicrophone, GrUser, GrNotification, GrLogout, GrStatusGood, GrStar, GrLineChart, GrFilter, GrSearch, GrAdd, GrPower, GrGroup, GrBriefcase, GrBarChart, GrShield, GrGlobe, GrCamera, GrUndo, GrNext, GrCode, GrTrophy, GrPaint, GrBook, GrTarget } from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { ApiService } from '@/lib/api';
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
  _id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: number;
  questionsCount: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  completed: boolean;
  score?: number;
  completedAt?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: {
    answeredQuestions: number;
    totalQuestions: number;
    percentage: number;
  };
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
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar simulações dinâmicas
  const loadSimulations = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.getCandidateSimulations(user._id) as any;
      
      if (response.success) {
        setSimulations(response.data.simulations || []);
        setStatistics(response.data.statistics || {});
      } else {
        setError('Erro ao carregar simulações');
      }
    } catch (error) {
      console.error('Erro ao carregar simulações:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  useEffect(() => {
    if (user) {
      loadSimulations();
    }
  }, [user, loadSimulations]);

  const handleLogout = () => {
    AuthService.logout();
    router.push('/');
  };

  // Categorias dinâmicas baseadas nas simulações carregadas
  const getCategoriesFromSimulations = () => {
    const categoryMap = new Map<string, SimulationCategory>();
    
    simulations.forEach(sim => {
      if (!categoryMap.has(sim.category)) {
        categoryMap.set(sim.category, {
          id: sim.category,
          name: getCategoryName(sim.category),
          description: getCategoryDescription(sim.category),
          icon: getCategoryIcon(sim.category),
          color: getCategoryColor(sim.category),
          questionsCount: 0,
          avgDuration: 0,
      difficulty: 'básico',
      unlocked: true
        });
      }
      
      const category = categoryMap.get(sim.category)!;
      category.questionsCount += sim.questionsCount;
    });
    
    // Calcular médias
    Array.from(categoryMap.values()).forEach(category => {
      const categorySimulations = simulations.filter(s => s.category === category.id);
      if (categorySimulations.length > 0) {
        category.avgDuration = Math.round(
          categorySimulations.reduce((sum, s) => sum + s.estimatedTime, 0) / categorySimulations.length
        );
      }
    });
    
    return Array.from(categoryMap.values());
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'behavioral': 'Entrevistas Comportamentais',
      'technical': 'Entrevistas Técnicas', 
      'situational': 'Situações e Problemas',
      'general': 'Conhecimentos Gerais'
    };
    return names[category] || category;
  };

  const getCategoryDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      'behavioral': 'Perguntas sobre experiências, motivações e fit cultural',
      'technical': 'Perguntas específicas da sua área de atuação',
      'situational': 'Situações hipotéticas e resolução de problemas',
      'general': 'Conhecimentos gerais e cultura organizacional'
    };
    return descriptions[category] || 'Simulações de entrevista';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'behavioral': <GrGroup size={24} />,
      'technical': <GrCode size={24} />,
      'situational': <GrTarget size={24} />,
      'general': <GrBook size={24} />
    };
    return icons[category] || <GrPlay size={24} />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'behavioral': '#3B82F6',
      'technical': '#10B981',
      'situational': '#F59E0B', 
      'general': '#8B5CF6'
    };
    return colors[category] || '#6B7280';
  };

  const categories: SimulationCategory[] = getCategoriesFromSimulations();

  // Funções auxiliares para renderização dinâmica
  const getDifficultyDisplayName = (difficulty: string) => {
    const map: Record<string, string> = {
      'basic': 'básico',
      'intermediate': 'intermediário', 
      'advanced': 'avançado'
    };
    return map[difficulty] || difficulty;
  };

  const filteredSimulations = simulations.filter(simulation => {
    const matchesSearch = simulation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         simulation.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || simulation.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || getDifficultyDisplayName(simulation.difficulty) === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const stats = statistics || {
    total: simulations.length,
    completed: simulations.filter(s => s.completed).length,
    averageScore: 0,
    completionRate: 0
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
      case 'comportamental': return <GrGroup size={16} />;
      case 'técnica': return <GrCode size={16} />;
      case 'cultural': return <GrGlobe size={16} />;
      case 'situacional': return <GrCode size={16} />;
      default: return <GrBook size={16} />;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando suas simulações...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Erro ao carregar simulações</h3>
        <p>{error}</p>
        <button onClick={loadSimulations} className="btn btn-primary">
          Tentar Novamente
        </button>
      </div>
    );
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
              <p>Simule entrevistas reais e desenvolva suas habilidades de comunicação</p>
            </div>
            
            <div className={styles.headerActions}>
              <Link href="/candidato/simulacoes/nova" className="btn btn-primary">
                <GrAdd size={20} />
                Nova Simulação
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrTarget size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.completed}/{stats.total}</h3>
                <p>Simulações Concluídas</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStar size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.averageScore || 0}%</h3>
                <p>Desempenho Médio</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{Math.round((stats.total * 25) / 60 * 10) / 10} h</h3>
                <p>Tempo Estimado</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrLineChart size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.completionRate || 0}%</h3>
                <p>Taxa de Conclusão</p>
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
                <GrBook size={18} />
                Por Categoria
              </button>
              
              <button 
                className={`${styles.tab} ${activeTab === 'simulacoes' ? styles.active : ''}`}
                onClick={() => setActiveTab('simulacoes')}
              >
                <GrPlay size={18} />
                Todas as Simulações
                <span className={styles.tabBadge}>{simulations.length}</span>
              </button>

              <button 
                className={`${styles.tab} ${activeTab === 'historico' ? styles.active : ''}`}
                onClick={() => setActiveTab('historico')}
              >
                <GrStatusGood size={18} />
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
                          <GrShield size={20} />
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.categoryStats}>
                      <div className={styles.categoryStat}>
                        <span className={styles.statNumber}>{category.questionsCount}</span>
                        <span className={styles.statLabel}>Perguntas</span>
                      </div>
                      <div className={styles.categoryStat}>
                        <span className={styles.statNumber}>{category.avgDuration} min</span>
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
                          <GrPlay size={16} />
                          Iniciar Simulação
                        </button>
                      ) : (
                        <button className="btn btn-secondary" disabled>
                          <GrShield size={16} />
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
                    <GrSearch size={20} />
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

              {/* Simulations GrList */}
              <div className={styles.simulationsList}>
                {filteredSimulations.map((simulation) => (
                  <div key={simulation._id} className={`${styles.simulationCard} ${simulation.completed ? styles.completed : ''}`}>
                    <div className={styles.simulationHeader}>
                      <div className={styles.simulationInfo}>
                        <div className={styles.simulationTitle}>
                          <h3>{simulation.title}</h3>
                          <div className={styles.simulationMeta}>
                            <div className={styles.metaItem}>
                              <GrBook size={14} />
                              <span>{getCategoryName(simulation.category)}</span>
                            </div>
                            <div className={styles.metaItem}>
                              <GrClock size={14} />
                              <span>{simulation.estimatedTime} min</span>
                            </div>
                            <div className={styles.metaItem}>
                              <GrBook size={14} />
                              <span>{simulation.questionsCount} perguntas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className={styles.simulationStatus}>
                        <div 
                          className={styles.difficultyBadge}
                          style={{ backgroundColor: getDifficultyColor(getDifficultyDisplayName(simulation.difficulty)) }}
                        >
                          {getDifficultyDisplayName(simulation.difficulty)}
                        </div>
                        
                        {simulation.completed && (
                          <div className={styles.completedBadge}>
                            <GrStatusGood size={16} />
                            <span>Concluída</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.simulationContent}>
                      <p>{simulation.description}</p>
                      
                      {simulation.status !== 'not_started' && (
                        <div className={styles.progressSection}>
                          <div className={styles.progressInfo}>
                            <span>Progresso: {simulation.progress.percentage}%</span>
                            <span>{simulation.progress.answeredQuestions}/{simulation.progress.totalQuestions} perguntas</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressFill}
                              style={{ width: `${simulation.progress.percentage}%` }}
                            />
                          </div>
                      </div>
                      )}

                      {simulation.completed && simulation.score && (
                        <div className={styles.simulationResult}>
                          <div className={styles.scoreDisplay}>
                            <GrStar size={16} />
                            <span className={styles.score}>{simulation.score}%</span>
                            {simulation.completedAt && (
                            <span className={styles.completedDate}>
                                Concluída em {new Date(simulation.completedAt).toLocaleDateString('pt-BR')}
                            </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={styles.simulationActions}>
                      {simulation.completed ? (
                        <>
                          <Link 
                            href={`/candidato/simulacoes/${simulation._id}/resultado`}
                            className="btn btn-secondary btn-small"
                          >
                            Ver Resultado
                          </Link>
                          <Link 
                            href={`/candidato/simulacoes/${simulation._id}`}
                            className="btn btn-primary btn-small"
                          >
                            <GrUndo size={16} />
                            Refazer
                          </Link>
                        </>
                      ) : (
                        <Link 
                          href={`/candidato/simulacoes/${simulation._id}`}
                          className="btn btn-primary btn-small"
                        >
                          <GrPlay size={16} />
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
                    <GrTarget size={48} />
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
                    <GrBarChart size={48} />
                    <p>Gráfico de evolução será exibido após mais simulações</p>
                  </div>
                </div>
              </div>

              <div className={styles.historicoList}>
                {simulations.filter(s => s.completed).map((simulation) => (
                  <div key={simulation._id} className={styles.historicoItem}>
                    <div className={styles.historicoInfo}>
                      <h4>{simulation.title}</h4>
                      <div className={styles.historicoMeta}>
                        {simulation.completedAt && (
                          <>
                            <span>Concluída em {new Date(simulation.completedAt).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                          </>
                        )}
                        <span>{simulation.estimatedTime} minutos</span>
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
                    <GrStatusGood size={48} />
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