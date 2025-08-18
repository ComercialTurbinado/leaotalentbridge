'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  GrBriefcase, 
  GrCalendar, 
  GrLocation, 
  GrMoney, 
  GrClock, 
  GrStatusCritical,
  GrStatusWarning,
  GrView,
  GrFilter,
  GrSearch,
  GrRefresh,
  GrDownload,
  GrTrash
} from 'react-icons/gr';
import styles from './candidaturas.module.css';

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    companyId: {
      name: string;
      logo?: string;
    };
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
    status: string;
  };
  status: string;
  appliedAt: string;
  updatedAt: string;
  coverLetter: string;
  source: string;
  notes?: string;
}

export default function CandidaturasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
    loadApplications();
  }, [router, user?.id]); // Adicionado user?.id para garantir que a função seja chamada quando o usuário for carregado

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) return;

      const response = await ApiService.getCandidateApplications(user.id) as any;
      
      if (response.success) {
        // Converter dados da API para o formato esperado pela interface
        const apiApplications = response.data.map((app: any) => ({
          _id: app._id,
          jobId: {
            _id: app.jobId._id,
            title: app.jobId.title,
            companyId: {
              name: app.jobId.companyId?.name || 'Empresa não informada',
              logo: app.jobId.companyId?.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&h=80&fit=crop&crop=face'
            },
            location: {
              city: app.jobId.location?.city || 'Localização não informada',
              state: app.jobId.location?.state || '',
              isRemote: app.jobId.location?.isRemote || false
            },
            salary: {
              min: app.jobId.salary?.min || 0,
              max: app.jobId.salary?.max || 0,
              currency: app.jobId.salary?.currency || 'AED'
            },
            workType: app.jobId.workType || 'full-time',
            status: app.jobId.status || 'ativa'
          },
          status: app.status,
          appliedAt: app.appliedAt,
          updatedAt: app.updatedAt,
          coverLetter: app.coverLetter || 'Candidatura enviada através da plataforma Leão Talent Bridge.',
          source: app.source || 'platform'
        }));

        setApplications(apiApplications);
      } else {
        setError('Erro ao carregar candidaturas');
      }
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
      setError('Erro ao carregar candidaturas');
      // Fallback para array vazio em caso de erro
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <GrClock size={16} className={styles.statusApplied} />;
      case 'reviewing':
        return <GrStatusWarning size={16} className={styles.statusReviewing} />;
      case 'approved':
        return <GrStatusCritical size={16} className={styles.statusApproved} />;
      case 'rejected':
        return <GrTrash size={16} className={styles.statusRejected} />;
      default:
        return <GrClock size={16} />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'applied': 'Candidatura Enviada',
      'reviewing': 'Em Análise',
      'approved': 'Aprovada',
      'rejected': 'Rejeitada',
      'interview': 'Entrevista Marcada',
      'offer': 'Oferta Recebida'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatSalary = (salary: Application['jobId']['salary']) => {
    if (!salary || (!salary.min && !salary.max)) return 'Salário a combinar';
    
    const formatValue = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: salary.currency || 'AED',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.jobId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.jobId.companyId.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      case 'company':
        return a.jobId.companyId.name.localeCompare(b.jobId.companyId.name);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatusCount = (status: string) => {
    return applications.filter(app => app.status === status).length;
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.candidaturasPage}>
      <DashboardHeader 
        user={user} 
        userType="candidato"
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <h1>Minhas Candidaturas</h1>
              <p>Acompanhe o status das suas candidaturas e oportunidades</p>
            </div>
            <div className={styles.headerActions}>
              <button onClick={loadApplications} className={styles.refreshButton}>
                <GrRefresh size={18} />
                Atualizar
              </button>
              <Link href="/candidato/vagas" className={styles.newApplicationButton}>
                <GrBriefcase size={18} />
                Ver Vagas
              </Link>
            </div>
          </div>

          {/* Estatísticas */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrBriefcase size={24} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{applications.length}</span>
                <span className={styles.statLabel}>Total de Candidaturas</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={24} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{getStatusCount('applied')}</span>
                <span className={styles.statLabel}>Aguardando Análise</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusWarning size={24} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{getStatusCount('reviewing')}</span>
                <span className={styles.statLabel}>Em Análise</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusCritical size={24} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{getStatusCount('approved')}</span>
                <span className={styles.statLabel}>Aprovadas</span>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <GrSearch size={18} />
              <input
                type="text"
                placeholder="Buscar por vaga ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.filterControls}>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todos os Status</option>
                <option value="applied">Candidatura Enviada</option>
                <option value="reviewing">Em Análise</option>
                <option value="approved">Aprovadas</option>
                <option value="rejected">Reprovadas</option>
              </select>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="date">Ordenar por Data</option>
                <option value="company">Ordenar por Empresa</option>
                <option value="status">Ordenar por Status</option>
              </select>
            </div>
          </div>

          {/* Lista de Candidaturas */}
          <div className={styles.applicationsSection}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {sortedApplications.length === 0 ? (
              <div className={styles.emptyState}>
                <GrBriefcase size={48} />
                <h3>Nenhuma Candidatura Encontrada</h3>
                <p>
                  {applications.length === 0 
                    ? 'Você ainda não se candidatou a nenhuma vaga.' 
                    : 'Nenhuma candidatura corresponde aos filtros selecionados.'
                  }
                </p>
                <Link href="/candidato/vagas" className={styles.emptyStateButton}>
                  Explorar Vagas
                </Link>
              </div>
            ) : (
              <div className={styles.applicationsList}>
                {sortedApplications.map((application) => (
                  <div key={application._id} className={styles.applicationCard}>
                    <div className={styles.applicationHeader}>
                      <div className={styles.jobInfo}>
                        <h3 className={styles.jobTitle}>{application.jobId.title}</h3>
                        <p className={styles.companyName}>{application.jobId.companyId.name}</p>
                      </div>
                      <div className={styles.applicationStatus}>
                        {getStatusIcon(application.status)}
                        <span>{getStatusLabel(application.status)}</span>
                      </div>
                    </div>

                    <div className={styles.applicationDetails}>
                      <div className={styles.jobMeta}>
                        <div className={styles.metaItem}>
                          <GrLocation size={16} />
                          <span>
                            {application.jobId.location.isRemote 
                              ? 'Remoto' 
                              : `${application.jobId.location.city}, ${application.jobId.location.state}`
                            }
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <GrMoney size={16} />
                          <span>{formatSalary(application.jobId.salary)}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <GrBriefcase size={16} />
                          <span>{getWorkTypeLabel(application.jobId.workType)}</span>
                        </div>
                      </div>

                      <div className={styles.applicationDates}>
                        <div className={styles.dateItem}>
                          <GrCalendar size={14} />
                          <span>Candidatura: {formatDate(application.appliedAt)}</span>
                        </div>
                        <div className={styles.dateItem}>
                          <GrClock size={14} />
                          <span>Última atualização: {formatDate(application.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.applicationActions}>
                      <Link 
                        href={`/candidato/vagas/${application.jobId._id}`}
                        className={styles.actionButton}
                      >
                        <GrView size={16} />
                        Ver Vaga
                      </Link>
                      <button className={styles.actionButton}>
                        <GrDownload size={16} />
                        Baixar Currículo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 