'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrUser, GrBriefcase, GrCalendar, GrLineChart, GrStar, GrLocation, GrMoney, GrClock, GrStatusGood, GrStatusWarning, GrNotification, GrLogout, GrSearch, GrFilter, GrNext, GrDocument, GrUpload, GrStatusCritical, GrStatusInfo, GrCamera, GrGlobe, GrSend, GrView, GrTrophy, GrBook, GrTarget } from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import styles from './dashboard.module.css';
import DashboardHeader from '@/components/DashboardHeader';

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  type: 'curriculum' | 'photo' | 'diploma' | 'certificate' | 'recommendation' | 'identity';
  required: boolean;
  completed: boolean;
  icon: React.ReactNode;
}

interface CandidateStatus {
  overall: 'incomplete' | 'pending_approval' | 'approved' | 'active';
  profileCompletion: number;
  documentsCompletion: number;
  nextSteps: string[];
  canBeOfferedToCompanies: boolean;
}

interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  interviewsScheduled: number;
  jobOffers: number;
  profileViews: number;
}

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    companyId: {
      name: string;
    };
    location: {
      city: string;
      state: string;
    };
    salary: {
      min: number;
      max: number;
      currency: string;
    };
  };
  status: string;
  appliedAt: string;
  lastUpdate: string;
}

interface RecommendedJob {
  _id: string;
  title: string;
  companyId: {
    name: string;
    industry: string;
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
  requirements: {
    skills: string[];
  };
  publishedAt: string;
  matchScore?: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'interview' | 'offer' | 'profile_view';
  title: string;
  description: string;
  date: string;
  status?: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    activeApplications: 0,
    interviewsScheduled: 0,
    jobOffers: 0,
    profileViews: 0
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) return;

      // Carregar dados do candidato
      const [applicationsResponse, documentsResponse] = await Promise.all([
        ApiService.getCandidateApplications(user.id),
        ApiService.getCandidateDocuments(user.id)
      ]) as any[];
      
      // Calcular estatísticas baseadas nos dados reais
      const applications = applicationsResponse.success ? applicationsResponse.data : [];
      const documents = documentsResponse.success ? documentsResponse.data : [];
      
      const stats = {
        profileCompletion: calculateProfileCompletion(user),
        documentsCompletion: calculateDocumentsCompletion(documents),
        interviews: 0, // TODO: Implementar quando tivermos modelo de entrevistas
        processes: applications.filter((app: any) => app.status === 'applied' || app.status === 'reviewing').length
      };

      // Carregar oportunidades recentes (vagas recomendadas)
      const jobsResponse = await ApiService.getJobs({ 
        limit: 5,
        page: 1,
        status: 'ativa'
      }) as any;

      const recentOpportunities = jobsResponse.success ? jobsResponse.data.map((job: any) => ({
        id: job._id,
        title: job.title,
        company: job.companyId?.name || 'Empresa não informada',
        location: `${job.location?.city || 'Localização não informada'}, ${job.location?.state || ''}`,
        salary: `${job.salary?.min || 0} - ${job.salary?.max || 0} ${job.salary?.currency || 'AED'}`,
        matchScore: Math.floor(Math.random() * 30) + 70, // Score simulado por enquanto
        postedAt: new Date(job.createdAt).toLocaleDateString('pt-BR'),
        featured: Math.random() > 0.7
      })) : [];

      // Atividades recentes baseadas em candidaturas e documentos
      const recentActivity = [];
      
      // Adicionar candidaturas recentes
      applications.slice(0, 3).forEach((app: any) => {
        recentActivity.push({
          id: app._id,
          action: 'Candidatura enviada',
          target: app.jobId?.title || 'Vaga',
          company: app.jobId?.companyId?.name || '',
          timestamp: new Date(app.appliedAt).toLocaleDateString('pt-BR'),
          status: app.status
        });
      });

      // Adicionar documentos recentes
      documents.slice(0, 2).forEach((doc: any) => {
        recentActivity.push({
          id: doc.id || doc._id,
          action: 'Documento enviado',
          target: doc.name,
          company: '',
          timestamp: new Date(doc.uploadedAt).toLocaleDateString('pt-BR'),
          status: doc.status
        });
      });

      // Ordenar por data mais recente
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setDashboardData({
        stats,
        recentOpportunities,
        upcomingInterviews: [], // TODO: Implementar quando tivermos modelo de entrevistas
        recentActivity: recentActivity.slice(0, 5)
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = (user: UserType) => {
    if (!user.profile) return 0;
    
    const requiredFields = ['phone', 'company', 'position', 'linkedin', 'experience'];
    const completedFields = requiredFields.filter(field => user.profile[field as keyof typeof user.profile]);
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const calculateDocumentsCompletion = (documents: any[]) => {
    const requiredDocuments = ['curriculum', 'certificate'];
    const hasRequiredDocs = requiredDocuments.some(type => 
      documents.some(doc => doc.type === type && doc.status === 'approved')
    );
    
    return hasRequiredDocs ? 100 : 0;
  };

  const handleLogout = () => {
    AuthService.logout();
    router.push('/');
  };

  // Documentos obrigatórios do sistema
  const requiredDocuments: RequiredDocument[] = [
    {
      id: 'curriculum',
      name: 'Currículo Atualizado',
      description: 'Currículo completo com experiências mais recentes',
      type: 'curriculum',
      required: true,
      completed: true, // Mock - viria do backend
      icon: <GrDocument size={20} />
    },
    {
      id: 'photo',
      name: 'Foto Profissional',
      description: 'Foto profissional de alta qualidade para o perfil',
      type: 'photo',
      required: true,
      completed: false,
      icon: <GrCamera size={20} />
    },
    {
      id: 'diploma',
      name: 'Diplomas e Certificados',
      description: 'Diplomas de graduação e certificações relevantes',
      type: 'diploma',
      required: true,
      completed: true,
      icon: <GrBook size={20} />
    },
    {
      id: 'identity',
      name: 'Documento de Identidade',
      description: 'Passaporte ou RG com foto clara',
      type: 'identity',
      required: true,
      completed: false,
      icon: <GrUser size={20} />
    },
    {
      id: 'recommendations',
      name: 'Cartas de Recomendação',
      description: 'Pelo menos 2 cartas de recomendação profissionais',
      type: 'recommendation',
      required: true,
      completed: false,
      icon: <GrTrophy size={20} />
    },
    {
      id: 'experience_proof',
      name: 'Comprovantes de Experiência',
      description: 'Declarações ou contratos de trabalhos anteriores',
      type: 'certificate',
      required: false,
      completed: true,
      icon: <GrBriefcase size={20} />
    }
  ];

  // Cálculo do status do candidato
  const calculateCandidateStatus = (): CandidateStatus => {
    const requiredDocs = requiredDocuments.filter(doc => doc.required);
    const completedRequired = requiredDocs.filter(doc => doc.completed);
    
    const documentsCompletion = Math.round((completedRequired.length / requiredDocs.length) * 100);
    const profileCompletion = 85; // Mock - viria do perfil real
    
    let overall: CandidateStatus['overall'] = 'incomplete';
    let nextSteps: string[] = [];
    let canBeOfferedToCompanies = false;

    if (documentsCompletion < 100 || profileCompletion < 100) {
      overall = 'incomplete';
      if (profileCompletion < 100) {
        nextSteps.push('Complete seu perfil profissional');
      }
      if (documentsCompletion < 100) {
        nextSteps.push('Envie todos os documentos obrigatórios');
      }
    } else {
      overall = 'pending_approval';
      nextSteps.push('Aguardando análise da nossa equipe');
      nextSteps.push('Formatação de documentos em andamento');
    }

    // Mock para demonstração - candidato aprovado
    if (completedRequired.length >= 3) {
      overall = 'approved';
      canBeOfferedToCompanies = true;
      nextSteps = [
        'Perfil aprovado e ativo',
        'Sendo oferecido para empresas parceiras',
        'Complete simulações de entrevista'
      ];
    }

    return {
      overall,
      profileCompletion,
      documentsCompletion,
      nextSteps,
      canBeOfferedToCompanies
    };
  };

  const candidateStatus = calculateCandidateStatus();

  const getStatusInfo = (status: CandidateStatus['overall']) => {
    switch (status) {
      case 'incomplete':
        return {
          label: 'Perfil Incompleto',
          color: 'warning',
          icon: <GrStatusWarning size={20} />,
          message: 'Complete seu perfil para receber oportunidades exclusivas'
        };
      case 'pending_approval':
        return {
          label: 'Aguardando Aprovação',
          color: 'info',
          icon: <GrClock size={20} />,
          message: 'Documentos em análise. Formatação para padrões EAU em andamento'
        };
      case 'approved':
        return {
          label: 'Perfil Aprovado',
          color: 'success',
          icon: <GrStatusGood size={20} />,
          message: 'Seu perfil está ativo e sendo oferecido para empresas'
        };
      case 'active':
        return {
          label: 'Ativo em Processos',
          color: 'primary',
          icon: <GrLineChart size={20} />,
          message: 'Participando ativamente de processos seletivos'
        };
      default:
        return {
          label: 'Status Indefinido',
          color: 'secondary',
          icon: <GrStatusInfo size={20} />,
          message: 'Entre em contato com o suporte'
        };
    }
  };

  const statusInfo = getStatusInfo(candidateStatus.overall);

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'applied': 'Candidatura Enviada',
      'screening': 'Em Análise',
      'interview_scheduled': 'Entrevista Agendada',
      'interviewing': 'Em Entrevista',
      'offer_made': 'Oferta Recebida',
      'hired': 'Contratado',
      'rejected': 'Não Selecionado',
      'withdrawn': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'applied': 'blue',
      'screening': 'yellow',
      'interview_scheduled': 'purple',
      'interviewing': 'purple',
      'offer_made': 'green',
      'hired': 'green',
      'rejected': 'red',
      'withdrawn': 'gray'
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

  const mockData = {
    stats: {
      profileCompletion: candidateStatus.profileCompletion,
      documentsCompletion: candidateStatus.documentsCompletion,
      interviews: 3,
      processes: candidateStatus.canBeOfferedToCompanies ? 5 : 0
    },
    recentOpportunities: candidateStatus.canBeOfferedToCompanies ? [
      {
        id: 1,
        title: 'Desenvolvedor Full Stack Sênior',
        company: 'TECH-001',
        location: 'Dubai, EAU',
        salary: '$8,000 - $12,000',
        matchScore: 92,
        postedAt: '2 dias atrás',
        featured: true
      },
      {
        id: 2,
        title: 'Product Manager',
        company: 'INNOV-002',
        location: 'Abu Dhabi, EAU',
        salary: '$10,000 - $15,000',
        matchScore: 88,
        postedAt: '1 semana atrás',
        featured: false
      }
    ] : [],
    upcomingInterviews: [
      {
        id: 1,
        company: 'TECH-001',
        position: 'Desenvolvedor Full Stack',
        date: '15 Dezembro, 2024',
        time: '14:00',
        type: 'Online'
      }
    ],
    recentActivity: [
      {
        id: 1,
        action: 'Documento enviado',
        target: 'Currículo Atualizado',
        company: '',
        timestamp: '2 horas atrás',
        status: 'approved'
      },
      {
        id: 2,
        action: 'Perfil visualizado por',
        target: 'TECH-001',
        company: '',
        timestamp: '1 dia atrás',
        status: 'view'
      }
    ]
  };

  return (
    <div className={styles.dashboardPage}>
      <DashboardHeader user={user} userType="candidato" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className={styles.successMessage}>
              <GrStatusGood size={20} />
              <span>Cadastro realizado com sucesso! Bem-vindo ao Leão Talent Bridge!</span>
            </div>
          )}

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Olá, {user.name}!</h1>
              <p>Acompanhe suas candidaturas e encontre novas oportunidades</p>
            </div>
            <div className={styles.headerActions}>
              <Link href="/candidato/vagas" className="btn btn-primary">
                <GrSearch size={16} />
                Buscar Vagas
              </Link>
            </div>
          </div>

          {/* Stats GrApps */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrSend size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.totalApplications}</h3>
                <p>Candidaturas Enviadas</p>
                <span className={styles.statDetail}>{stats.activeApplications} ativas</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrCalendar size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.interviewsScheduled}</h3>
                <p>Entrevistas Agendadas</p>
                <span className={styles.statDetail}>Próximas etapas</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.jobOffers}</h3>
                <p>Ofertas Recebidas</p>
                <span className={styles.statDetail}>Aguardando resposta</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrView size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.profileViews}</h3>
                <p>Visualizações do Perfil</p>
                <span className={styles.statDetail}>Este mês</span>
              </div>
            </div>
          </div>

          {/* Content GrApps */}
          <div className={styles.contentGrid}>
            {/* Recent Applications */}
            <div className={styles.applicationsSection}>
              <div className={styles.sectionHeader}>
                <h2>Candidaturas Recentes</h2>
                <Link href="/candidato/candidaturas" className={styles.viewAll}>
                  Ver Todas
                  <GrNext size={16} />
                </Link>
              </div>
              
              <div className={styles.applicationsList}>
                {recentApplications.length > 0 ? (
                  recentApplications.map((application) => (
                    <div key={application._id} className={styles.applicationItem}>
                      <div className={styles.applicationInfo}>
                        <h4>{application.jobId.title}</h4>
                        <p>{application.jobId.companyId.name}</p>
                        <div className={styles.applicationMeta}>
                          <span className={styles.location}>
                            <GrLocation size={14} />
                            {application.jobId.location.city}, {application.jobId.location.state}
                          </span>
                          <span className={styles.salary}>
                            <GrMoney size={14} />
                            {formatSalary(application.jobId.salary)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.applicationStatus}>
                        <span className={`${styles.status} ${styles[getStatusColor(application.status)]}`}>
                          {getStatusLabel(application.status)}
                        </span>
                        <small>{new Date(application.appliedAt).toLocaleDateString('pt-BR')}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <GrSend size={48} />
                    <h3>Nenhuma candidatura ainda</h3>
                    <p>Comece explorando as vagas disponíveis</p>
                    <Link href="/candidato/vagas" className="btn btn-primary">
                      Buscar Vagas
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Jobs */}
            <div className={styles.recommendedSection}>
              <div className={styles.sectionHeader}>
                <h2>Vagas Recomendadas</h2>
                <Link href="/candidato/vagas" className={styles.viewAll}>
                  Ver mais
                  <GrNext size={16} />
                </Link>
              </div>
              
              <div className={styles.jobsList}>
                {recommendedJobs.length > 0 ? (
                  recommendedJobs.map((job) => (
                    <div key={job._id} className={styles.jobItem}>
                      <div className={styles.jobInfo}>
                        <h4>{job.title}</h4>
                        <p>{job.companyId.name}</p>
                        <div className={styles.jobMeta}>
                          <span className={styles.location}>
                            <GrLocation size={14} />
                            {job.location.city}, {job.location.state}
                            {job.location.isRemote && ' (Remoto)'}
                          </span>
                          <span className={styles.salary}>
                            <GrMoney size={14} />
                            {formatSalary(job.salary)}
                          </span>
                        </div>
                        {job.requirements.skills.length > 0 && (
                          <div className={styles.jobSkills}>
                            {job.requirements.skills.slice(0, 3).map((skill, index) => (
                              <span key={index} className={styles.skillTag}>
                                {skill}
                              </span>
                            ))}
                            {job.requirements.skills.length > 3 && (
                              <span className={styles.skillTag}>
                                +{job.requirements.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className={styles.jobActions}>
                        <Link 
                          href={`/candidato/vagas/${job._id}`} 
                          className={`${styles.btnOutline} ${styles.btnSm}`}
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <GrBriefcase size={48} />
                    <h3>Aguardando Liberação de Vagas</h3>
                    <p>Nossa equipe está analisando seu perfil e selecionando as melhores oportunidades para você. Vagas personalizadas aparecerão aqui em breve!</p>
                    <div className={styles.processSteps}>
                      <div className={styles.step}>
                        <GrStatusGood size={16} />
                        <span>Perfil analisado</span>
                      </div>
                      <div className={styles.step}>
                        <GrClock size={16} />
                        <span>Documentos em verificação</span>
                      </div>
                      <div className={styles.step}>
                        <GrClock size={16} />
                        <span>Seleção de vagas compatíveis</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className={styles.activitiesSection}>
            <h2>Atividades Recentes</h2>
            <div className={styles.activitiesList}>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {activity.type === 'application' && <GrSend size={16} />}
                      {activity.type === 'interview' && <GrCalendar size={16} />}
                      {activity.type === 'offer' && <GrStatusGood size={16} />}
                      {activity.type === 'profile_view' && <GrView size={16} />}
                    </div>
                    <div className={styles.activityContent}>
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                      <span className={styles.activityDate}>{activity.date}</span>
                    </div>
                    {activity.status && (
                      <div className={styles.activityStatus}>
                        <span className={`${styles.status} ${styles[getStatusColor(activity.status)]}`}>
                          {getStatusLabel(activity.status)}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <GrClock size={48} />
                  <h3>Nenhuma atividade recente</h3>
                  <p>Suas atividades aparecerão aqui</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <h2>Ações Rápidas</h2>
            <div className={styles.actionsGrid}>
              <Link href="/candidato/vagas" className={styles.actionCard}>
                <GrSearch size={32} />
                <h3>Buscar Vagas</h3>
                <p>Encontre novas oportunidades</p>
              </Link>

              <Link href="/candidato/perfil" className={styles.actionCard}>
                <GrUser size={32} />
                <h3>Editar Perfil</h3>
                <p>Mantenha seus dados atualizados</p>
              </Link>

              <Link href="/candidato/simulacoes" className={styles.actionCard}>
                <GrTarget size={32} />
                <h3>Simulações</h3>
                <p>Pratique para entrevistas</p>
              </Link>

              <Link href="/candidato/documentos" className={styles.actionCard}>
                <GrDocument size={32} />
                <h3>Documentos</h3>
                <p>Gerencie seus documentos</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CandidatoDashboard() {
  return (
    <Suspense fallback={
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
} 