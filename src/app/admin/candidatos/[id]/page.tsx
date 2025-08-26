'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  GrUser, GrDocument, GrCalendar, GrConnect, GrStar, GrClock, 
  GrMail, GrPhone, GrLocation, GrBriefcase, GrOrganization,
  GrDownload, GrUpload, GrEdit, GrTrash, GrView, GrAdd,
  GrStatusGood, GrStatusCritical, GrClock as GrPending
} from 'react-icons/gr';
import styles from './candidato.module.css';

interface Candidato {
  _id: string;
  name: string;
  email: string;
  type: 'candidato';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  profile?: {
    phone?: string;
    avatar?: string;
    company?: string;
    position?: string;
    linkedin?: string;
    website?: string;
    experience?: string;
    skills?: string[];
    education?: string;
    languages?: Array<{
      language: string;
      level: string;
    }>;
  };
  permissions?: {
    canAccessJobs: boolean;
    canApplyToJobs: boolean;
    canViewCourses: boolean;
    canAccessSimulations: boolean;
    canContactCompanies: boolean;
  };
  profileVerified?: boolean;
  documentsVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'overview' | 'documents' | 'interviews' | 'connections' | 'evaluations' | 'timeline';

export default function AdminCandidatoPage() {
  const router = useRouter();
  const params = useParams();
  const candidatoId = params.id as string;
  
  const [user, setUser] = useState<UserType | null>(null);
  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadCandidato();
  }, [router, candidatoId]);

  const loadCandidato = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${candidatoId}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidato(data.data);
      } else {
        console.error('Erro ao carregar candidato');
        router.push('/admin/candidatos');
      }
    } catch (error) {
      console.error('Erro ao carregar candidato:', error);
      router.push('/admin/candidatos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: styles.statusPending, icon: <GrPending size={14} /> },
      approved: { label: 'Aprovado', className: styles.statusApproved, icon: <GrStatusGood size={14} /> },
      rejected: { label: 'Rejeitado', className: styles.statusRejected, icon: <GrStatusCritical size={14} /> },
      suspended: { label: 'Suspenso', className: styles.statusSuspended, icon: <GrStatusCritical size={14} /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <GrUser size={16} /> },
    { id: 'documents', label: 'Documentos', icon: <GrDocument size={16} /> },
    { id: 'interviews', label: 'Entrevistas', icon: <GrCalendar size={16} /> },
    { id: 'connections', label: 'Conexões', icon: <GrConnect size={16} /> },
    { id: 'evaluations', label: 'Avaliações', icon: <GrStar size={16} /> },
    { id: 'timeline', label: 'Timeline', icon: <GrClock size={16} /> }
  ];

  if (loading) {
    return (
      <div className={styles.candidatoPage}>
        <DashboardHeader user={user} userType="admin" />
        <main className={styles.mainContent}>
          <div className="container">
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Carregando candidato...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!candidato) {
    return (
      <div className={styles.candidatoPage}>
        <DashboardHeader user={user} userType="admin" />
        <main className={styles.mainContent}>
          <div className="container">
            <div className={styles.errorContainer}>
              <h2>Candidato não encontrado</h2>
              <p>O candidato solicitado não foi encontrado.</p>
              <button 
                onClick={() => router.push('/admin/candidatos')}
                className="btn btn-primary"
              >
                Voltar para Candidatos
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.candidatoPage}>
      <DashboardHeader user={user} userType="admin" />
      <main className={styles.mainContent}>
        <div className="container">
          {/* Header do Candidato */}
          <div className={styles.candidatoHeader}>
            <div className={styles.candidatoInfo}>
              <div className={styles.candidatoAvatar}>
                {candidato.profile?.avatar ? (
                  <img src={candidato.profile.avatar} alt={candidato.name} />
                ) : (
                  <GrUser size={40} />
                )}
              </div>
              <div className={styles.candidatoDetails}>
                <h1>{candidato.name}</h1>
                <p className={styles.candidatoEmail}>
                  <GrMail size={16} />
                  {candidato.email}
                </p>
                {candidato.profile?.phone && (
                  <p className={styles.candidatoPhone}>
                    <GrPhone size={16} />
                    {candidato.profile.phone}
                  </p>
                )}
                <div className={styles.candidatoStatus}>
                  {getStatusBadge(candidato.status)}
                  {candidato.profileVerified && (
                    <span className={styles.verifiedBadge}>
                      <GrStatusGood size={12} />
                      Perfil Verificado
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.candidatoActions}>
              <button className="btn btn-secondary">
                <GrEdit size={16} />
                Editar
              </button>
              <button className="btn btn-primary">
                <GrMail size={16} />
                Enviar Mensagem
              </button>
            </div>
          </div>

          {/* Tabs de Navegação */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo das Tabs */}
          <div className={styles.tabContent}>
            {activeTab === 'overview' && (
              <div className={styles.overviewTab}>
                <div className={styles.overviewGrid}>
                  {/* Informações Básicas */}
                  <div className={styles.infoCard}>
                    <h3>Informações Básicas</h3>
                    <div className={styles.infoList}>
                      <div className={styles.infoItem}>
                        <label>Nome:</label>
                        <span>{candidato.name}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Email:</label>
                        <span>{candidato.email}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Status:</label>
                        <span>{getStatusBadge(candidato.status)}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Cadastro:</label>
                        <span>{formatDate(candidato.createdAt)}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Última Atividade:</label>
                        <span>{formatDate(candidato.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Perfil Profissional */}
                  <div className={styles.infoCard}>
                    <h3>Perfil Profissional</h3>
                    <div className={styles.infoList}>
                      <div className={styles.infoItem}>
                        <label>Empresa Atual:</label>
                        <span>{candidato.profile?.company || 'Não informado'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Cargo:</label>
                        <span>{candidato.profile?.position || 'Não informado'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>LinkedIn:</label>
                        <span>{candidato.profile?.linkedin || 'Não informado'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Website:</label>
                        <span>{candidato.profile?.website || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Permissões */}
                  <div className={styles.infoCard}>
                    <h3>Permissões</h3>
                    <div className={styles.permissionsList}>
                      <div className={styles.permissionItem}>
                        <GrBriefcase size={16} />
                        <span>Acessar Vagas</span>
                        <span className={candidato.permissions?.canAccessJobs ? styles.permissionActive : styles.permissionInactive}>
                          {candidato.permissions?.canAccessJobs ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className={styles.permissionItem}>
                        <GrAdd size={16} />
                        <span>Candidatar-se</span>
                        <span className={candidato.permissions?.canApplyToJobs ? styles.permissionActive : styles.permissionInactive}>
                          {candidato.permissions?.canApplyToJobs ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className={styles.permissionItem}>
                        <GrUser size={16} />
                        <span>Ver Cursos</span>
                        <span className={candidato.permissions?.canViewCourses ? styles.permissionActive : styles.permissionInactive}>
                          {candidato.permissions?.canViewCourses ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className={styles.permissionItem}>
                        <GrStar size={16} />
                        <span>Simulações</span>
                        <span className={candidato.permissions?.canAccessSimulations ? styles.permissionActive : styles.permissionInactive}>
                          {candidato.permissions?.canAccessSimulations ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className={styles.permissionItem}>
                        <GrMail size={16} />
                        <span>Contatar Empresas</span>
                        <span className={candidato.permissions?.canContactCompanies ? styles.permissionActive : styles.permissionInactive}>
                          {candidato.permissions?.canContactCompanies ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className={styles.infoCard}>
                    <h3>Métricas</h3>
                    <div className={styles.metricsGrid}>
                      <div className={styles.metricItem}>
                        <div className={styles.metricValue}>0</div>
                        <div className={styles.metricLabel}>Candidaturas</div>
                      </div>
                      <div className={styles.metricItem}>
                        <div className={styles.metricValue}>0</div>
                        <div className={styles.metricLabel}>Entrevistas</div>
                      </div>
                      <div className={styles.metricItem}>
                        <div className={styles.metricValue}>0</div>
                        <div className={styles.metricLabel}>Documentos</div>
                      </div>
                      <div className={styles.metricItem}>
                        <div className={styles.metricValue}>0</div>
                        <div className={styles.metricLabel}>Conexões</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className={styles.documentsTab}>
                <div className={styles.tabHeader}>
                  <h2>Gestão de Documentos</h2>
                  <div className={styles.tabActions}>
                    <button className="btn btn-primary">
                      <GrUpload size={16} />
                      Enviar Documento
                    </button>
                  </div>
                </div>
                <p>Funcionalidade de documentos em desenvolvimento...</p>
              </div>
            )}

            {activeTab === 'interviews' && (
              <div className={styles.interviewsTab}>
                <div className={styles.tabHeader}>
                  <h2>Gestão de Entrevistas</h2>
                  <div className={styles.tabActions}>
                    <button className="btn btn-primary">
                      <GrAdd size={16} />
                      Agendar Entrevista
                    </button>
                  </div>
                </div>
                <p>Funcionalidade de entrevistas em desenvolvimento...</p>
              </div>
            )}

            {activeTab === 'connections' && (
              <div className={styles.connectionsTab}>
                <div className={styles.tabHeader}>
                  <h2>Conexões com Empresas</h2>
                  <div className={styles.tabActions}>
                    <button className="btn btn-primary">
                      <GrConnect size={16} />
                      Conectar Empresa
                    </button>
                  </div>
                </div>
                <p>Funcionalidade de conexões em desenvolvimento...</p>
              </div>
            )}

            {activeTab === 'evaluations' && (
              <div className={styles.evaluationsTab}>
                <div className={styles.tabHeader}>
                  <h2>Avaliações e Feedback</h2>
                  <div className={styles.tabActions}>
                    <button className="btn btn-primary">
                      <GrStar size={16} />
                      Nova Avaliação
                    </button>
                  </div>
                </div>
                <p>Funcionalidade de avaliações em desenvolvimento...</p>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className={styles.timelineTab}>
                <div className={styles.tabHeader}>
                  <h2>Timeline de Atividades</h2>
                </div>
                <p>Funcionalidade de timeline em desenvolvimento...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
