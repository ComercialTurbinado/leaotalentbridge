'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import { useJobs } from '@/lib/hooks/useApiData';
import DashboardHeader from '@/components/DashboardHeader';
import SkeletonLoader from '@/components/SkeletonLoader';
import { GrSearch, GrLocation, GrMoney, GrBriefcase, GrClock, GrOrganization, GrFilter, GrFavorite, GrSend, GrStatusGood } from 'react-icons/gr';
import styles from './vagas.module.css';

interface Job {
  _id: string;
  title: string;
  description: string;
  summary: string;
  companyId: {
    name: string;
    logo?: string;
    industry: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
    isRemote: boolean;
    isHybrid: boolean;
  };
  workType: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  requirements: {
    education: string;
    experience: string;
    skills: string[];
  };
  category: string;
  publishedAt: string;
  expiresAt: string;
  status: string;
  tags: string[];
}

interface Application {
  _id: string;
  jobId: string;
  status: string;
}

export default function CandidatoVagasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [applyingToJob, setApplyingToJob] = useState<string | null>(null);

  // Usar o hook otimizado para vagas
  const {
    data: jobs,
    loading,
    error,
    hasMore,
    totalCount,
    currentPage,
    loadMore,
    refresh,
    search,
    clearSearch
  } = useJobs({
    status: 'active',
    ...(user && { candidateId: user._id }),
    ...(selectedCategory && { category: selectedCategory }),
    ...(selectedLocation && { location: selectedLocation }),
    ...(selectedWorkType && { workType: selectedWorkType })
  });

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
    loadApplications();
  }, [router]);

  const loadApplications = async () => {
    try {
      const currentUser = AuthService.getUser();
      if (!currentUser) return;

      // Carregar candidaturas do usuário (apenas campos essenciais)
      const applicationsResponse = await ApiService.getApplications({
        candidateId: currentUser._id,
        limit: 100,
        page: 1,
        fields: 'jobId,status' // Apenas campos necessários
      }) as any;
      
      const applicationsData = applicationsResponse.data || [];
      setApplications(applicationsData);

    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;

    setApplyingToJob(jobId);

    try {
      await ApiService.createApplication({
        jobId,
        coverLetter: 'Candidatura enviada através da plataforma UAE Careers.',
        source: 'platform'
      });

      // Atualizar lista de candidaturas localmente
      const newApplication: Application = {
        _id: Date.now().toString(),
        jobId,
        status: 'applied'
      };
      setApplications(prev => [...prev, newApplication]);
      
      alert('Candidatura enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao se candidatar:', error);
      alert(error instanceof Error ? error.message : 'Erro ao enviar candidatura. Tente novamente.');
    } finally {
      setApplyingToJob(null);
    }
  };

  const isApplied = (jobId: string) => {
    return applications.some(app => app.jobId === jobId);
  };

  const getApplicationStatus = (jobId: string) => {
    const application = applications.find(app => app.jobId === jobId);
    return application?.status;
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary.min && !salary.max) return 'Salário a combinar';
    
    const formatValue = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: salary.currency || 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };

    if (salary.min && salary.max) {
      return `${formatValue(salary.min)} - ${formatValue(salary.max)}`;
    } else if (salary.min) {
      return `A partir de ${formatValue(salary.min)}`;
    } else {
      return `Até ${formatValue(salary.max)}`;
    }
  };

  const getWorkTypeLabel = (workType: string) => {
    const types = {
      'full-time': 'Tempo Integral',
      'part-time': 'Meio Período',
      'contract': 'Contrato',
      'freelance': 'Freelance',
      'internship': 'Estágio'
    };
    return types[workType as keyof typeof types] || workType;
  };

  const getLocationLabel = (location: Job['location']) => {
    if (location.isRemote) {
      return 'Remoto';
    } else if (location.isHybrid) {
      return `${location.city}, ${location.state} (Híbrido)`;
    } else {
      return `${location.city}, ${location.state}`;
    }
  };

  const handleSearch = (query: string) => {
    search(query);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'location':
        setSelectedLocation(value);
        break;
      case 'workType':
        setSelectedWorkType(value);
        break;
    }
    // Os filtros serão aplicados automaticamente via useEffect do hook
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.vagasPage}>
      <DashboardHeader user={user} userType="candidato" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Header da página */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Vagas Disponíveis</h1>
              <p>Encontre oportunidades perfeitas para você nos Emirados Árabes Unidos</p>
              {totalCount > 0 && (
                <span className={styles.totalCount}>
                  {totalCount} {totalCount === 1 ? 'vaga encontrada' : 'vagas encontradas'}
                </span>
              )}
            </div>
          </div>

          {/* Barra de busca e filtros */}
          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <GrSearch size={20} />
              <input
                type="text"
                placeholder="Buscar vagas por título, empresa ou habilidades..."
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <button 
              className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <GrFilter size={18} />
              Filtros
            </button>
          </div>

          {/* Filtros avançados */}
          {showFilters && (
            <div className={styles.filtersPanel}>
              <div className={styles.filterGroup}>
                <label>Categoria:</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="technology">Tecnologia</option>
                  <option value="engineering">Engenharia</option>
                  <option value="healthcare">Saúde</option>
                  <option value="finance">Finanças</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Vendas</option>
                  <option value="other">Outros</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Localização:</label>
                <select 
                  value={selectedLocation} 
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="Dubai">Dubai</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Remoto">Remoto</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Tipo:</label>
                <select 
                  value={selectedWorkType} 
                  onChange={(e) => handleFilterChange('workType', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="full-time">Tempo Integral</option>
                  <option value="part-time">Meio Período</option>
                  <option value="contract">Contrato</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <button 
                className={styles.clearFiltersButton}
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedLocation('');
                  setSelectedWorkType('');
                  clearSearch();
                }}
              >
                Limpar Filtros
              </button>
            </div>
          )}

          {/* Mensagem de erro */}
          {error && (
            <div className={styles.errorMessage}>
              <p>Erro ao carregar vagas: {error}</p>
              <button onClick={refresh} className="btn btn-primary">
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Lista de vagas com skeleton loading */}
          <div className={styles.vagasGrid}>
            {loading && jobs.length === 0 ? (
              <SkeletonLoader type="card" count={6} height="200px" />
            ) : (
              <>
                {jobs.map((job: Job) => (
                  <div key={job._id} className={styles.vagaCard}>
                    <div className={styles.vagaHeader}>
                      <div className={styles.empresaInfo}>
                        <div className={styles.empresaLogo}>
                          <GrOrganization size={24} />
                        </div>
                        <div>
                          <h3 className={styles.vagaTitulo}>{job.title}</h3>
                          <p className={styles.empresaNome}>{job.companyId.name}</p>
                        </div>
                      </div>
                      
                      {isApplied(job._id) ? (
                        <div className={styles.appliedBadge}>
                          <GrStatusGood size={16} />
                          Candidatura Enviada
                        </div>
                      ) : (
                        <button
                          className={styles.candidatarButton}
                          onClick={() => handleApply(job._id)}
                          disabled={applyingToJob === job._id}
                        >
                          {applyingToJob === job._id ? (
                            <>Enviando...</>
                          ) : (
                            <>
                              <GrSend size={16} />
                              Candidatar-se
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className={styles.vagaInfo}>
                      <div className={styles.infoItem}>
                        <GrLocation size={16} />
                        <span>{getLocationLabel(job.location)}</span>
                      </div>
                      
                      <div className={styles.infoItem}>
                        <GrMoney size={16} />
                        <span>{formatSalary(job.salary)}</span>
                      </div>
                      
                      <div className={styles.infoItem}>
                        <GrBriefcase size={16} />
                        <span>{getWorkTypeLabel(job.workType)}</span>
                      </div>
                      
                      <div className={styles.infoItem}>
                        <GrClock size={16} />
                        <span>Publicada em {new Date(job.publishedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className={styles.vagaDescricao}>
                      <p>{job.summary || job.description.substring(0, 150)}...</p>
                    </div>

                    {job.requirements.skills.length > 0 && (
                      <div className={styles.vagaSkills}>
                        {job.requirements.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className={styles.skillTag}>
                            {skill}
                          </span>
                        ))}
                        {job.requirements.skills.length > 3 && (
                          <span className={styles.skillTag}>
                            +{job.requirements.skills.length - 3} mais
                          </span>
                        )}
                      </div>
                    )}

                    <div className={styles.vagaFooter}>
                      <Link href={`/candidato/vagas/${job._id}`} className={styles.verDetalhesLink}>
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Botão carregar mais */}
                {hasMore && !loading && (
                  <div className={styles.loadMoreSection}>
                    <button 
                      onClick={loadMore}
                      className="btn btn-outline"
                      disabled={loading}
                    >
                      {loading ? 'Carregando...' : 'Carregar Mais Vagas'}
                    </button>
                  </div>
                )}

                {/* Mensagem quando não há vagas */}
                {!loading && jobs.length === 0 && (
                  <div className={styles.emptyState}>
                    <GrBriefcase size={48} />
                    <h3>Nenhuma Vaga Encontrada</h3>
                    <p>Não encontramos vagas que correspondem aos seus critérios de busca.</p>
                    <button 
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedLocation('');
                        setSelectedWorkType('');
                        clearSearch();
                      }}
                      className="btn btn-primary"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 