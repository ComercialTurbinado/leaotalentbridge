'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { GrAdd, GrSearch, GrFilter, GrEdit, GrView, GrGroup, GrLocation, GrCalendar, GrCurrency, GrMore, GrBriefcase, GrNext, GrClock, GrTrash, GrPlay, GrPause, GrStatusCritical, GrStatusWarning, GrClose } from 'react-icons/gr';
import styles from './vagas.module.css';

interface Job {
  _id: string;
  title: string;
  description: string;
  location: {
    city: string;
    state: string;
    isRemote: boolean;
  };
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  workType: string;
  experienceLevel: string;
  status: string;
  publishedAt: string;
  expiresAt: string;
  applicationsCount?: number;
  requirements: {
    skills: string[];
    education: string;
    experience: string;
  };
}

export default function EmpresaVagasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'empresa') {
      router.push('/empresa/login');
      return;
    }
    setUser(currentUser);
    loadJobs();
  }, [router]);

  const loadJobs = async () => {
    try {
      const response = await ApiService.getJobs({ 
        limit: 100,
        page: 1 
      }) as any;
      
      const jobsData = response.data || [];
      
      // Carregar contagem de candidaturas para cada vaga
      const jobsWithApplications = await Promise.all(
        jobsData.map(async (job: Job) => {
          try {
            const applicationsResponse = await ApiService.getApplications({
              jobId: job._id,
              limit: 1,
              page: 1
            }) as any;
            
            return {
              ...job,
              applicationsCount: applicationsResponse.total || 0
            };
          } catch (error) {
            return {
              ...job,
              applicationsCount: 0
            };
          }
        })
      );
      
      setJobs(jobsWithApplications);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
      setErrorMessage('Erro ao carregar vagas');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    setActionLoading(jobId);
    try {
      await ApiService.updateJob(jobId, { status: newStatus });
      
      // Atualizar estado local
      setJobs(prev => prev.map(job => 
        job._id === jobId ? { ...job, status: newStatus } : job
      ));
      
      setSuccessMessage(`Vaga ${newStatus === 'active' ? 'ativada' : 'pausada'} com sucesso!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setErrorMessage('Erro ao alterar status da vaga');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setActionLoading(jobId);
    try {
      await ApiService.deleteJob(jobId);
      
      // Remover do estado local
      setJobs(prev => prev.filter(job => job._id !== jobId));
      
      setSuccessMessage('Vaga excluída com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Erro ao excluir vaga:', error);
      setErrorMessage('Erro ao excluir vaga');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesType = typeFilter === 'all' || job.workType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Ativa',
      'paused': 'Pausada',
      'closed': 'Fechada',
      'draft': 'Rascunho',
      'expired': 'Expirada'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'active': 'green',
      'paused': 'yellow',
      'closed': 'red',
      'draft': 'gray',
      'expired': 'red'
    };
    return colorMap[status] || 'gray';
  };

  const formatSalary = (salary: any) => {
    if (!salary.min && !salary.max) return 'A combinar';
    
    const formatter = new Intl.NumberFormat('pt-BR');
    const currency = salary.currency === 'AED' ? 'AED' : salary.currency;
    
    if (salary.min && salary.max) {
      return `${currency} ${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
    } else if (salary.min) {
      return `A partir de ${currency} ${formatter.format(salary.min)}`;
    } else {
      return `Até ${currency} ${formatter.format(salary.max)}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.vagasPage}>
      <DashboardHeader user={user} userType="empresa" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className={styles.successMessage}>
              <GrStatusCritical size={20} />
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage('')}>
                <GrClose size={16} />
              </button>
            </div>
          )}
          
          {errorMessage && (
            <div className={styles.errorMessage}>
              <GrStatusWarning size={20} />
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')}>
                <GrClose size={16} />
              </button>
            </div>
          )}

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <h1>Gerenciar Vagas</h1>
              <p>Crie, edite e gerencie suas oportunidades de trabalho</p>
            </div>
            <Link href="/empresa/vagas/nova" className="btn btn-primary">
              <GrAdd size={20} />
              NOVA VAGA
            </Link>
          </div>

          {/* Stats Summary */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrBriefcase size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{jobs.length}</h3>
                <p>Total de Vagas</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrPlay size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{jobs.filter(job => job.status === 'active').length}</h3>
                <p>Vagas Ativas</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrGroup size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{jobs.reduce((total, job) => total + (job.applicationsCount || 0), 0)}</h3>
                <p>Total de Candidaturas</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{jobs.filter(job => isExpired(job.expiresAt)).length}</h3>
                <p>Vagas Expiradas</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <GrSearch size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar por título ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterDropdowns}>
              <div className={styles.dropdown}>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativa</option>
                  <option value="paused">Pausada</option>
                  <option value="closed">Fechada</option>
                  <option value="draft">Rascunho</option>
                  <option value="expired">Expirada</option>
                </select>
                <GrNext size={16} className={styles.dropdownIcon} />
              </div>
              
              <div className={styles.dropdown}>
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="full-time">Tempo Integral</option>
                  <option value="part-time">Meio Período</option>
                  <option value="contract">Contrato</option>
                  <option value="freelance">Freelance</option>
                  <option value="remote">Remoto</option>
                </select>
                <GrNext size={16} className={styles.dropdownIcon} />
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className={styles.jobsList}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div key={job._id} className={styles.jobCard}>
                  <div className={styles.jobHeader}>
                    <div className={styles.jobTitle}>
                      <h3>{job.title}</h3>
                      <div className={styles.jobMeta}>
                        <span className={styles.location}>
                          <GrLocation size={14} />
                          {job.location?.city || 'N/A'}, {job.location?.state || 'N/A'}
                          {job.location?.isRemote && ' (Remoto)'}
                        </span>
                        <span className={styles.salary}>
                          <GrCurrency size={14} />
                          {job.salary ? formatSalary(job.salary) : 'A combinar'}
                        </span>
                        <span className={styles.workType}>
                          <GrBriefcase size={14} />
                          {job.workType}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.jobStatus}>
                      <span className={`status ${getStatusColor(job.status)}`}>
                        {getStatusLabel(job.status)}
                      </span>
                      {isExpired(job.expiresAt) && job.status === 'active' && (
                        <span className="status red">Expirada</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.jobDescription}>
                    <p>{job.description ? job.description.substring(0, 150) : 'Sem descrição disponível'}...</p>
                  </div>

                  <div className={styles.jobSkills}>
                    {(job.requirements?.skills && Array.isArray(job.requirements.skills) ? job.requirements.skills : []).slice(0, 4).map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                    {(job.requirements?.skills && Array.isArray(job.requirements.skills) && job.requirements.skills.length > 4) && (
                      <span className={styles.skillTag}>
                        +{job.requirements.skills.length - 4}
                      </span>
                    )}
                  </div>

                  <div className={styles.jobFooter}>
                    <div className={styles.jobStats}>
                      <span className={styles.stat}>
                        <GrGroup size={14} />
                        {job.applicationsCount || 0} candidaturas
                      </span>
                      <span className={styles.stat}>
                        <GrCalendar size={14} />
                        Publicada em {formatDate(job.publishedAt)}
                      </span>
                      <span className={styles.stat}>
                        <GrClock size={14} />
                        Expira em {formatDate(job.expiresAt)}
                      </span>
                    </div>

                    <div className={styles.jobActions}>
                      <Link 
                        href={`/empresa/candidaturas?jobId=${job._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        <GrGroup size={16} />
                        Ver Candidatos
                      </Link>
                      
                      <Link 
                        href={`/empresa/vagas/${job._id}/editar`}
                        className="btn btn-outline btn-sm"
                      >
                        <GrEdit size={16} />
                        Editar
                      </Link>

                      {job.status === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(job._id, 'paused')}
                          className="btn btn-outline btn-sm"
                          disabled={actionLoading === job._id}
                        >
                          {actionLoading === job._id ? (
                            <div className={styles.spinner}></div>
                          ) : (
                            <>
                              <GrPause size={16} />
                              Pausar
                            </>
                          )}
                        </button>
                      ) : job.status === 'paused' ? (
                        <button
                          onClick={() => handleStatusChange(job._id, 'active')}
                          className="btn btn-outline btn-sm"
                          disabled={actionLoading === job._id}
                        >
                          {actionLoading === job._id ? (
                            <div className={styles.spinner}></div>
                          ) : (
                            <>
                              <GrPlay size={16} />
                              Ativar
                            </>
                          )}
                        </button>
                      ) : null}

                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="btn btn-outline btn-sm btn-danger"
                        disabled={actionLoading === job._id}
                      >
                        {actionLoading === job._id ? (
                          <div className={styles.spinner}></div>
                        ) : (
                          <>
                            <GrTrash size={16} />
                            Excluir
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <GrBriefcase size={64} />
                <h3>Nenhuma Vaga Encontrada</h3>
                <p>
                  {jobs.length === 0 
                    ? 'Você ainda não criou nenhuma vaga. Comece criando sua primeira oportunidade!'
                    : 'Nenhuma vaga corresponde aos filtros selecionados.'
                  }
                </p>
                {jobs.length === 0 && (
                  <Link href="/empresa/vagas/nova" className="btn btn-primary">
                    <GrAdd size={16} />
                    Criar Primeira Vaga
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 