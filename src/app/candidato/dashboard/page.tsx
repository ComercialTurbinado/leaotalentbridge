'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import NotificationCenter from '@/components/NotificationCenter';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  priority: string;
  createdAt: string;
  data?: any;
}

interface JobRecommendation {
  job: {
    _id: string;
    title: string;
    location: string;
    salaryRange?: {
      min: number;
      max: number;
    };
    company: {
      name: string;
      industry: string;
      size: string;
    };
  };
  recommendation: {
    _id: string;
    score: number;
    reasons: string[];
  };
  matchPercentage: number;
}

interface Metrics {
  overallScore: number;
  ranking: {
    percentile: number;
    category: string;
  };
  applications: {
    total: number;
    successRate: number;
    pending: number;
    shortlisted: number;
    rejected: number;
  };
  profile: {
    completionRate: number;
    views: number;
    lastUpdate: string;
  };
  documents: {
    total: number;
    verified: number;
    completionRate: number;
  };
  interviews: {
    total: number;
    successRate: number;
    upcoming: number;
  };
  trends: {
    applicationsGrowth: number;
    profileViewsGrowth: number;
    interviewSuccessGrowth: number;
  };
}

interface TimelineItem {
  application: {
    id: string;
    jobTitle: string;
    companyName: string;
    status: string;
    appliedAt: string;
  };
  progress: number;
  timeline: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    date: string;
    status: string;
  }>;
}

interface Interview {
  _id: string;
  title: string;
  description?: string;
  scheduledDate: string;
  duration: number;
  type: 'presential' | 'online' | 'phone';
  status: 'pending_approval' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rejected';
  location?: string;
  meetingUrl?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  notes?: string;
  
  // Sistema de moderação
  adminStatus: 'pending' | 'approved' | 'rejected';
  adminComments?: string;
  
  // Resposta do candidato
  candidateResponse?: 'pending' | 'accepted' | 'rejected';
  candidateResponseAt?: string;
  candidateComments?: string;
  
  // Feedback
  companyFeedback?: {
    technical: number;
    communication: number;
    experience: number;
    overall: number;
    comments?: string;
    submittedAt: string;
  };
  candidateFeedback?: {
    rating: number;
    comments?: string;
    submittedAt: string;
  };
  feedbackStatus: 'pending' | 'approved' | 'rejected';
  
  // Relacionamentos
  candidateId: { _id: string; name: string; email: string };
  companyId: { _id: string; name: string };
  jobId?: { _id: string; title: string };
  applicationId?: string;
  createdBy: { _id: string; name: string };
  createdAt: string;
}

interface DashboardAlert {
  id: string;
  type: 'document' | 'interview' | 'simulation' | 'application' | 'profile' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  data?: any;
  createdAt: string;
}

interface DashboardSummary {
  alerts: DashboardAlert[];
  quickStats: {
    pendingDocuments: number;
    upcomingInterviews: number;
    pendingApplications: number;
    completedSimulations: number;
    profileCompletion: number;
  };
  recentActivity: Array<{
    type: string;
    title: string;
    description: string;
    date: string;
    status: string;
  }>;
}

export default function Dashboard() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Push notifications
  const { isSupported, isSubscribed, subscribe, loading: pushLoading } = usePushNotifications();

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Solicitar permissão para push notifications
  useEffect(() => {
    if (isSupported && !isSubscribed && !pushLoading) {
      // Aguardar um pouco antes de solicitar permissão
      const timer = setTimeout(() => {
        subscribe();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSupported, isSubscribed, pushLoading, subscribe]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [notificationsRes, recommendationsRes, metricsRes, timelineRes, interviewsRes, summaryRes] = await Promise.all([
        fetch('/api/candidates/notifications?limit=5'),
        fetch('/api/candidates/recommendations?limit=3'),
        fetch('/api/candidates/metrics'),
        fetch('/api/candidates/timeline?limit=5'),
        fetch('/api/candidates/interviews'),
        fetch('/api/candidates/dashboard-summary')
      ]);

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData.notifications || []);
      }

      if (recommendationsRes.ok) {
        const recommendationsData = await recommendationsRes.json();
        setRecommendations(recommendationsData.recommendations || []);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.metrics || null);
      }

      if (timelineRes.ok) {
        const timelineData = await timelineRes.json();
        setTimeline(timelineData.timeline || []);
      }

      if (interviewsRes.ok) {
        const interviewsData = await interviewsRes.json();
        setInterviews(interviewsData.interviews || []);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setDashboardSummary(summaryData.summary || null);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/candidates/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_read',
          notificationId
        })
      });

      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ff4757';
      case 'high': return '#ff6b35';
      case 'medium': return '#ffa726';
      case 'low': return '#66bb6a';
      default: return '#90a4ae';
    }
  };

  const handleInterviewResponse = async (interviewId: string, response: 'accepted' | 'rejected', comments?: string) => {
    try {
      setActionLoading(true);
      
      const responseData = await fetch(`/api/candidates/interviews/${interviewId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response, comments })
      });

      if (responseData.ok) {
        await loadDashboardData();
        setShowInterviewModal(false);
        setSelectedInterview(null);
        alert(`Entrevista ${response === 'accepted' ? 'aceita' : 'rejeitada'} com sucesso!`);
      } else {
        const error = await responseData.json();
        alert(error.error || 'Erro ao responder entrevista');
      }
    } catch (error) {
      console.error('Erro ao responder entrevista:', error);
      alert('Erro ao responder entrevista');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitFeedback = async (interviewId: string, feedback: { rating: number; comments?: string }) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/candidates/interviews/${interviewId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });

      if (response.ok) {
        await loadDashboardData();
        setShowInterviewModal(false);
        setSelectedInterview(null);
        alert('Feedback enviado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao enviar feedback');
      }
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      alert('Erro ao enviar feedback');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#90a4ae';
    }
  };

  const getRankingColor = (category: string) => {
    switch (category) {
      case 'top': return '#4caf50';
      case 'above_average': return '#8bc34a';
      case 'average': return '#ff9800';
      case 'below_average': return '#f44336';
      default: return '#90a4ae';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header com navegação */}
      <div className={styles.header}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <span className={styles.logoUae}>UAE</span>
            <span className={styles.logoCareers}>Careers</span>
          </div>
          <p className={styles.slogan}>Conectando talentos às melhores oportunidades</p>
        </div>
        
        <div className={styles.navigation}>
          <button className={`${styles.navButton} ${styles.active}`}>
            Dashboard
          </button>
          <button className={styles.navButton}>
            Vagas
          </button>
          <button className={styles.navButton}>
            Candidaturas
          </button>
          <button className={styles.navButton}>
            Entrevistas
          </button>
          <button className={styles.navButton}>
            Documentos
          </button>
        </div>
        
        <div className={styles.userSection}>
          <div className={styles.profileInfo}>
            <img 
              src="/images/profile-placeholder.png" 
              alt="Perfil" 
              className={styles.profileImage}
            />
            <span>João Silva</span>
          </div>
          <button className={styles.logoutButton}>
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className={styles.mainContent}>
        <div className={styles.pageTitle}>
          <h1>Gerenciamento de Interação - Dashboard</h1>
          <p>Controle total sobre suas candidaturas, entrevistas e oportunidades</p>
        </div>

        {/* Cards de estatísticas críticas */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#00732F' }}>
              📊
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{metrics?.applications?.total || 0}</div>
              <div className={styles.statLabel}>Candidaturas Ativas</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#FF0000' }}>
              🎯
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{interviews?.length || 0}</div>
              <div className={styles.statLabel}>Entrevistas Pendentes</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#D4AF37' }}>
              📄
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{dashboardSummary?.quickStats.pendingDocuments || 0}</div>
              <div className={styles.statLabel}>Documentos Pendentes</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#00732F' }}>
              ⭐
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{metrics?.overallScore || 0}</div>
              <div className={styles.statLabel}>Score de Perfil</div>
            </div>
          </div>
        </div>

        {/* Seção de Ações Críticas */}
        <div className={styles.section}>
          <h2>🚨 Ações Críticas - Requer Atenção Imediata</h2>
          <div className={styles.criticalActionsGrid}>
            {/* Documentos Pendentes */}
            {(dashboardSummary?.quickStats?.pendingDocuments || 0) > 0 && (
              <div className={styles.criticalActionCard} style={{ borderLeftColor: '#FF0000' }}>
                <div className={styles.criticalActionHeader}>
                  <h3>📄 Documentos Pendentes</h3>
                  <span className={styles.criticalBadge}>Urgente</span>
                </div>
                <p>{dashboardSummary?.quickStats?.pendingDocuments || 0} documento(s) aguardando upload ou verificação</p>
                <button 
                  className={styles.criticalActionButton}
                  onClick={() => router.push('/candidato/documentos')}
                >
                  Gerenciar Documentos
                </button>
              </div>
            )}

            {/* Entrevistas Próximas */}
            {(dashboardSummary?.quickStats?.upcomingInterviews || 0) > 0 && (
              <div className={styles.criticalActionCard} style={{ borderLeftColor: '#FFA500' }}>
                <div className={styles.criticalActionHeader}>
                  <h3>🎯 Entrevistas Próximas</h3>
                  <span className={styles.criticalBadge}>Importante</span>
                </div>
                <p>{dashboardSummary?.quickStats?.upcomingInterviews || 0} entrevista(s) aguardando confirmação</p>
                <button 
                  className={styles.criticalActionButton}
                  onClick={() => router.push('/candidato/entrevistas')}
                >
                  Ver Entrevistas
                </button>
              </div>
            )}

            {/* Candidaturas Pendentes */}
            {(dashboardSummary?.quickStats?.pendingApplications || 0) > 0 && (
              <div className={styles.criticalActionCard} style={{ borderLeftColor: '#00732F' }}>
                <div className={styles.criticalActionHeader}>
                  <h3>📝 Candidaturas Pendentes</h3>
                  <span className={styles.criticalBadge}>Ação Necessária</span>
                </div>
                <p>{dashboardSummary?.quickStats?.pendingApplications || 0} candidatura(s) aguardando resposta</p>
                <button 
                  className={styles.criticalActionButton}
                  onClick={() => router.push('/candidato/candidaturas')}
                >
                  Acompanhar Status
                </button>
              </div>
            )}

            {/* Perfil Incompleto */}
            {(dashboardSummary?.quickStats?.profileCompletion || 0) < 80 && (
              <div className={styles.criticalActionCard} style={{ borderLeftColor: '#D4AF37' }}>
                <div className={styles.criticalActionHeader}>
                  <h3>👤 Perfil Incompleto</h3>
                  <span className={styles.criticalBadge}>Melhorar</span>
                </div>
                <p>Seu perfil está {dashboardSummary?.quickStats?.profileCompletion || 0}% completo</p>
                <button 
                  className={styles.criticalActionButton}
                  onClick={() => router.push('/candidato/perfil')}
                >
                  Completar Perfil
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Seção de recomendações */}
        <div className={styles.section}>
          <h2>💼 Vagas Recomendadas para Você</h2>
          <div className={styles.recommendationsGrid}>
            {recommendations?.slice(0, 3).map((rec, index) => (
              <div key={index} className={styles.recommendationCard}>
                <div className={styles.jobHeader}>
                  <h3>{rec.job.title}</h3>
                  <span className={styles.matchBadge}>
                    {rec.matchPercentage}% Match
                  </span>
                </div>
                <div className={styles.companyInfo}>
                  <strong>{rec.job.company.name}</strong>
                  <span>• {rec.job.company.industry}</span>
                  <span>• {rec.job.company.size}</span>
                </div>
                <div className={styles.jobDetails}>
                  <span>{rec.job.location}</span>
                  {rec.job.salaryRange && (
                    <span>R$ {rec.job.salaryRange.min.toLocaleString()} - {rec.job.salaryRange.max.toLocaleString()}</span>
                  )}
                </div>
                <div className={styles.salary}>
                  Salário: {rec.job.salaryRange ? `R$ ${rec.job.salaryRange.min.toLocaleString()} - ${rec.job.salaryRange.max.toLocaleString()}` : 'A combinar'}
                </div>
                <div className={styles.recommendationActions}>
                  <button className={styles.applyButton}>
                    Candidatar-se
                  </button>
                  <button className={styles.viewButton}>
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de entrevistas */}
        <div className={styles.section}>
          <h2>🎯 Gestão de Entrevistas</h2>
          <div className={styles.interviewsGrid}>
            {interviews?.slice(0, 3).map((interview) => (
              <div key={interview._id} className={styles.interviewCard}>
                <div className={styles.interviewHeader}>
                  <h3>{interview.title}</h3>
                  <span className={styles.interviewType}>
                    {interview.type}
                  </span>
                </div>
                <div className={styles.interviewDetails}>
                  <p><strong>Data:</strong> {new Date(interview.scheduledDate).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Duração:</strong> {interview.duration} minutos</p>
                  <p><strong>Local:</strong> {interview.location || 'Online'}</p>
                  <p><strong>Status:</strong> <span style={{ color: getStatusColor(interview.status) }}>{interview.status}</span></p>
                </div>
                <div className={styles.interviewActions}>
                  <button 
                    className={styles.acceptButton}
                    onClick={() => handleInterviewResponse(interview._id, 'accepted')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processando...' : 'Aceitar'}
                  </button>
                  <button 
                    className={styles.rejectButton}
                    onClick={() => handleInterviewResponse(interview._id, 'rejected')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processando...' : 'Recusar'}
                  </button>
                  <button 
                    className={styles.detailsButton}
                    onClick={() => {
                      setSelectedInterview(interview);
                      setShowInterviewModal(true);
                    }}
                  >
                    Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de timeline */}
        <div className={styles.section}>
          <h2>📅 Timeline de Candidaturas</h2>
          <div className={styles.timelineContainer}>
            {timeline?.slice(0, 3).map((item, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.timelineHeader}>
                  <h3>{item.application.jobTitle}</h3>
                  <span className={styles.companyName}>{item.application.companyName}</span>
                  <span className={styles.status}>{item.application.status}</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                <div className={styles.timelineSteps}>
                  {item.timeline.slice(0, 3).map((step, stepIndex) => (
                    <div key={stepIndex} className={styles.timelineStep}>
                      <div className={styles.stepIcon}>✓</div>
                      <div className={styles.stepContent}>
                        <strong>{step.title}</strong>
                        <p>{step.description}</p>
                        <small>{new Date(step.date).toLocaleDateString('pt-BR')}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de métricas */}
        <div className={styles.section}>
          <h2>📈 Métricas de Performance</h2>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <h3>Taxa de Sucesso</h3>
              <div className={styles.metricValue}>{metrics?.applications?.successRate || 0}%</div>
              <div className={styles.metricLabel}>Candidaturas Aprovadas</div>
            </div>
            <div className={styles.metricCard}>
              <h3>Perfil Visualizado</h3>
              <div className={styles.metricValue}>{metrics?.profile?.views || 0}</div>
              <div className={styles.metricLabel}>Visualizações</div>
            </div>
            <div className={styles.metricCard}>
              <h3>Documentos Verificados</h3>
              <div className={styles.metricValue}>{metrics?.documents?.verified || 0}</div>
              <div className={styles.metricLabel}>Verificados</div>
            </div>
            <div className={styles.metricCard}>
              <h3>Entrevistas Realizadas</h3>
              <div className={styles.metricValue}>{metrics?.interviews?.total || 0}</div>
              <div className={styles.metricLabel}>Total</div>
            </div>
          </div>
        </div>

        {/* Seção de alertas */}
        <div className={styles.section}>
          <h2>🚨 Alertas e Notificações</h2>
          <div className={styles.alertsContainer}>
            {dashboardSummary?.alerts?.slice(0, 3).map((alert) => (
              <div key={alert.id} className={styles.alertItem}>
                <div className={styles.alertIcon}>⚠️</div>
                <div className={styles.alertContent}>
                  <strong>{alert.title}</strong>
                  <p>{alert.message}</p>
                  <small>{new Date(alert.createdAt).toLocaleDateString('pt-BR')}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Center */}
        <NotificationCenter userId="current-user" />
      </div>

      {/* Modal de entrevista */}
      {showInterviewModal && selectedInterview && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Detalhes da Entrevista</h2>
            <p><strong>Título:</strong> {selectedInterview.title}</p>
            <p><strong>Data:</strong> {new Date(selectedInterview.scheduledDate).toLocaleDateString('pt-BR')}</p>
            <p><strong>Duração:</strong> {selectedInterview.duration} minutos</p>
            <p><strong>Tipo:</strong> {selectedInterview.type}</p>
            {selectedInterview.location && (
              <p><strong>Local:</strong> {selectedInterview.location}</p>
            )}
            {selectedInterview.description && (
              <p><strong>Descrição:</strong> {selectedInterview.description}</p>
            )}
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowInterviewModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
