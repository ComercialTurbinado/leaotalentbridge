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
    submittedAt?: string;
  };
  candidateFeedback?: {
    rating: number;
    comments?: string;
    submittedAt?: string;
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

export default function CandidateDashboard() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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
      <div className={styles.header}>
        <h1>Dashboard do Candidato</h1>
        <div className={styles.headerActions}>
          <button 
            className={styles.refreshBtn}
            onClick={loadDashboardData}
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Tabs de navegação */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Visão Geral
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'alerts' ? styles.active : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🚨 Alertas
          {(dashboardSummary?.alerts?.filter(alert => alert.priority === 'urgent' || alert.priority === 'high').length || 0) > 0 && (
            <span className={styles.alertBadge}>
              {dashboardSummary?.alerts?.filter(alert => alert.priority === 'urgent' || alert.priority === 'high').length || 0}
            </span>
          )}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'recommendations' ? styles.active : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          💼 Vagas Recomendadas
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'timeline' ? styles.active : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          📅 Timeline
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'metrics' ? styles.active : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          📈 Métricas
        </button>
      </div>

      {/* Conteúdo das tabs */}
      <div className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            {/* Alertas importantes */}
            {(dashboardSummary?.alerts?.filter(alert => alert.priority === 'urgent' || alert.priority === 'high').length || 0) > 0 && (
              <div className={styles.urgentAlerts}>
                <h2>🚨 Atenção Necessária</h2>
                <div className={styles.alertsGrid}>
                  {dashboardSummary?.alerts
                    ?.filter(alert => alert.priority === 'urgent' || alert.priority === 'high')
                    .slice(0, 3)
                    .map(alert => (
                      <div key={alert.id} className={`${styles.alertCard} ${styles[alert.priority]}`}>
                        <div className={styles.alertHeader}>
                          <h3>{alert.title}</h3>
                          <span className={styles.alertPriority}>{alert.priority.toUpperCase()}</span>
                        </div>
                        <p>{alert.message}</p>
                        {alert.action && (
                          <button 
                            className={styles.alertAction}
                            onClick={() => router.push(alert.action!.url)}
                          >
                            {alert.action.label}
                          </button>
                        )}
                      </div>
                    ))}
                </div>
            </div>
          )}

            {/* Widgets informativos */}
            <div className={styles.infoWidgets}>
              <div className={styles.widget}>
                <div className={styles.widgetHeader}>
                  <h3>📄 Documentos</h3>
                  <span className={styles.widgetCount}>{dashboardSummary?.quickStats.pendingDocuments || 0}</span>
            </div>
                <div className={styles.widgetContent}>
                  <p>{dashboardSummary?.quickStats.pendingDocuments || 0} documento(s) pendente(s)</p>
                  <button 
                    className={styles.widgetAction}
                    onClick={() => router.push('/candidato/documentos')}
                  >
                    Gerenciar Documentos
                  </button>
            </div>
          </div>

              <div className={styles.widget}>
                <div className={styles.widgetHeader}>
                  <h3>🎯 Entrevistas</h3>
                  <span className={styles.widgetCount}>{dashboardSummary?.quickStats.upcomingInterviews || 0}</span>
              </div>
                <div className={styles.widgetContent}>
                  <p>{dashboardSummary?.quickStats.upcomingInterviews || 0} entrevista(s) próxima(s)</p>
                  <button 
                    className={styles.widgetAction}
                    onClick={() => router.push('/candidato/entrevistas')}
                  >
                    Ver Entrevistas
                  </button>
              </div>
            </div>

              <div className={styles.widget}>
                <div className={styles.widgetHeader}>
                  <h3>📝 Candidaturas</h3>
                  <span className={styles.widgetCount}>{dashboardSummary?.quickStats.pendingApplications || 0}</span>
              </div>
                <div className={styles.widgetContent}>
                  <p>{dashboardSummary?.quickStats.pendingApplications || 0} candidatura(s) pendente(s)</p>
                  <button 
                    className={styles.widgetAction}
                    onClick={() => router.push('/candidato/candidaturas')}
                  >
                    Ver Candidaturas
                  </button>
              </div>
            </div>

              <div className={styles.widget}>
                <div className={styles.widgetHeader}>
                  <h3>🎮 Simulações</h3>
                  <span className={styles.widgetCount}>{dashboardSummary?.quickStats.completedSimulations || 0}</span>
              </div>
                <div className={styles.widgetContent}>
                  <p>{dashboardSummary?.quickStats.completedSimulations || 0} simulação(ões) concluída(s)</p>
                  <button 
                    className={styles.widgetAction}
                    onClick={() => router.push('/candidato/simulacoes')}
                  >
                    Fazer Simulações
                  </button>
              </div>
            </div>

              <div className={styles.widget}>
                <div className={styles.widgetHeader}>
                  <h3>👤 Perfil</h3>
                  <span className={styles.widgetCount}>{dashboardSummary?.quickStats.profileCompletion || 0}%</span>
              </div>
                <div className={styles.widgetContent}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${dashboardSummary?.quickStats.profileCompletion || 0}%` }}
                    ></div>
                  </div>
                  <button 
                    className={styles.widgetAction}
                    onClick={() => router.push('/candidato/perfil')}
                  >
                    Completar Perfil
                  </button>
              </div>
            </div>
          </div>

            {/* Cards de métricas principais */}
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>📊</div>
                <div className={styles.metricContent}>
                  <h3>Score Geral</h3>
                  <div className={styles.metricValue}>
                    {metrics?.overallScore || 0}
                    <span className={styles.metricUnit}>/100</span>
                  </div>
                  <div 
                    className={styles.rankingBadge}
                    style={{ backgroundColor: getRankingColor(metrics?.ranking.category || 'average') }}
                  >
                    {metrics?.ranking.category === 'top' ? 'Top' :
                     metrics?.ranking.category === 'above_average' ? 'Acima da Média' :
                     metrics?.ranking.category === 'average' ? 'Média' : 'Abaixo da Média'}
                  </div>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>📝</div>
                <div className={styles.metricContent}>
                  <h3>Candidaturas</h3>
                  <div className={styles.metricValue}>
                    {metrics?.applications.total || 0}
                        </div>
                  <div className={styles.metricSubtext}>
                    {metrics?.applications.successRate || 0}% de sucesso
                      </div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>👁️</div>
                <div className={styles.metricContent}>
                  <h3>Visualizações</h3>
                  <div className={styles.metricValue}>
                    {metrics?.profile.views || 0}
                  </div>
                  <div className={styles.metricSubtext}>
                    {(metrics?.trends.profileViewsGrowth || 0) > 0 ? '+' : ''}{metrics?.trends.profileViewsGrowth || 0}% este mês
                  </div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>📄</div>
                <div className={styles.metricContent}>
                  <h3>Documentos</h3>
                  <div className={styles.metricValue}>
                    {metrics?.documents.verified || 0}/{metrics?.documents.total || 0}
                  </div>
                  <div className={styles.metricSubtext}>
                    {metrics?.documents.completionRate || 0}% completos
                  </div>
                </div>
              </div>
            </div>

            {/* Notificações recentes */}
            <div className={styles.section}>
              <NotificationCenter 
                userId="current-user" 
                maxNotifications={5}
                showUnreadOnly={false}
              />
            </div>

            {/* Vagas recomendadas */}
            <div className={styles.section}>
              <h2>💼 Vagas Recomendadas</h2>
              <div className={styles.recommendationsGrid}>
                {recommendations.length > 0 ? (
                  recommendations.map(rec => (
                    <div key={rec.recommendation._id} className={styles.recommendationCard}>
                      <div className={styles.recommendationHeader}>
                        <h3>{rec.job.title}</h3>
                        <div 
                          className={styles.matchScore}
                          style={{ 
                            backgroundColor: rec.matchPercentage > 80 ? '#4caf50' : 
                                           rec.matchPercentage > 60 ? '#ff9800' : '#f44336'
                          }}
                        >
                          {rec.matchPercentage}% match
                        </div>
                      </div>
                      <div className={styles.recommendationDetails}>
                        <p><strong>Localização:</strong> {rec.job.location}</p>
                        <p><strong>Setor:</strong> {rec.job.company.industry}</p>
                        {rec.job.salaryRange && (
                          <p><strong>Salário:</strong> R$ {rec.job.salaryRange.min.toLocaleString()} - R$ {rec.job.salaryRange.max.toLocaleString()}</p>
                        )}
                      </div>
                      <div className={styles.recommendationReasons}>
                        <h4>Por que recomendamos:</h4>
                        <ul>
                          {rec.recommendation.reasons.slice(0, 2).map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.recommendationActions}>
                        <button 
                          className={styles.applyBtn}
                          onClick={() => router.push(`/candidato/vagas/${rec.job._id}`)}
                        >
                          Ver Vaga
                        </button>
                        <button 
                          className={styles.dismissBtn}
                          onClick={() => {
                            // Implementar descarte
                          }}
                        >
                          Descartar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.emptyState}>Nenhuma vaga recomendada no momento</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className={styles.alertsTab}>
            <div className={styles.tabHeader}>
              <h2>🚨 Alertas e Avisos</h2>
              <div className={styles.alertsSummary}>
                <span className={styles.urgentCount}>
                  {dashboardSummary?.alerts.filter(alert => alert.priority === 'urgent').length || 0} Urgentes
                </span>
                <span className={styles.highCount}>
                  {dashboardSummary?.alerts.filter(alert => alert.priority === 'high').length || 0} Importantes
                </span>
                <span className={styles.mediumCount}>
                  {dashboardSummary?.alerts.filter(alert => alert.priority === 'medium').length || 0} Médios
                </span>
                <span className={styles.lowCount}>
                  {dashboardSummary?.alerts.filter(alert => alert.priority === 'low').length || 0} Baixos
                </span>
              </div>
              </div>
              
            <div className={styles.alertsList}>
              {(dashboardSummary?.alerts?.length || 0) > 0 ? (
                dashboardSummary?.alerts?.map(alert => (
                  <div key={alert.id} className={`${styles.alertItem} ${styles[alert.priority]}`}>
                    <div className={styles.alertIcon}>
                      {alert.type === 'document' && '📄'}
                      {alert.type === 'interview' && '🎯'}
                      {alert.type === 'simulation' && '🎮'}
                      {alert.type === 'application' && '📝'}
                      {alert.type === 'profile' && '👤'}
                      {alert.type === 'general' && 'ℹ️'}
                    </div>
                    <div className={styles.alertContent}>
                      <div className={styles.alertHeader}>
                        <h3>{alert.title}</h3>
                        <div className={styles.alertMeta}>
                          <span className={`${styles.priorityBadge} ${styles[alert.priority]}`}>
                            {alert.priority.toUpperCase()}
                          </span>
                          <span className={styles.alertDate}>
                            {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <p className={styles.alertMessage}>{alert.message}</p>
                      {alert.data && (
                        <div className={styles.alertData}>
                          {alert.data.rejectedCount && (
                            <span className={styles.dataItem}>
                              📄 {alert.data.rejectedCount} documento(s) rejeitado(s)
                              </span>
                          )}
                          {alert.data.pendingCount && (
                            <span className={styles.dataItem}>
                              ⏳ {alert.data.pendingCount} documento(s) pendente(s)
                              </span>
                            )}
                          {alert.data.missingTypes && (
                            <span className={styles.dataItem}>
                              ❌ Faltando: {alert.data.missingTypes.join(', ')}
                            </span>
                          )}
                          {alert.data.upcomingCount && (
                            <span className={styles.dataItem}>
                              🎯 {alert.data.upcomingCount} entrevista(s) próxima(s)
                            </span>
                          )}
                          {alert.data.completion && (
                            <span className={styles.dataItem}>
                              📊 Perfil {alert.data.completion}% completo
                            </span>
                        )}
                      </div>
                      )}
                      {alert.action && (
                        <button 
                          className={styles.alertActionBtn}
                          onClick={() => router.push(alert.action!.url)}
                        >
                          {alert.action.label}
                        </button>
                      )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                  <h3>🎉 Nenhum alerta!</h3>
                  <p>Tudo está em ordem. Continue assim!</p>
                      </div>
              )}
                      </div>

            {/* Atividade recente */}
            {(dashboardSummary?.recentActivity?.length || 0) > 0 && (
              <div className={styles.recentActivity}>
                <h3>📋 Atividade Recente</h3>
                <div className={styles.activityList}>
                  {dashboardSummary?.recentActivity?.slice(0, 5).map((activity, index) => (
                    <div key={index} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        {activity.type === 'document' && '📄'}
                        {activity.type === 'interview' && '🎯'}
                        {activity.type === 'application' && '📝'}
                      </div>
                      <div className={styles.activityContent}>
                        <h4>{activity.title}</h4>
                        <p>{activity.description}</p>
                        <span className={styles.activityDate}>
                          {new Date(activity.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className={`${styles.activityStatus} ${styles[activity.status]}`}>
                        {activity.status}
                      </div>
                    </div>
                  ))}
                    </div>
                  </div>
                )}
              </div>
        )}

        {activeTab === 'recommendations' && (
          <div className={styles.recommendationsTab}>
            <div className={styles.tabHeader}>
              <h2>💼 Vagas Recomendadas para Você</h2>
              <button 
                className={styles.generateBtn}
                onClick={() => {
                  // Implementar geração de novas recomendações
                }}
              >
                🔄 Gerar Novas Recomendações
              </button>
            </div>
            <div className={styles.recommendationsList}>
              {recommendations.length > 0 ? (
                recommendations.map(rec => (
                  <div key={rec.recommendation._id} className={styles.recommendationItem}>
                    <div className={styles.recommendationMain}>
                      <div className={styles.recommendationInfo}>
                        <h3>{rec.job.title}</h3>
                        <p className={styles.companyInfo}>
                          {rec.job.company.name} • {rec.job.company.industry} • {rec.job.location}
                        </p>
                        <div className={styles.jobDetails}>
                          {rec.job.salaryRange && (
                            <span className={styles.salary}>
                              R$ {rec.job.salaryRange.min.toLocaleString()} - R$ {rec.job.salaryRange.max.toLocaleString()}
                            </span>
                          )}
                          <span className={styles.companySize}>
                            {rec.job.company.size} funcionários
                          </span>
          </div>
                      </div>
                      <div className={styles.matchInfo}>
                        <div 
                          className={styles.matchScore}
                          style={{ 
                            backgroundColor: rec.matchPercentage > 80 ? '#4caf50' : 
                                           rec.matchPercentage > 60 ? '#ff9800' : '#f44336'
                          }}
                        >
                          {rec.matchPercentage}%
                        </div>
                        <p>Compatibilidade</p>
                      </div>
                    </div>
                    <div className={styles.recommendationReasons}>
                      <h4>Por que esta vaga é ideal para você:</h4>
                      <ul>
                        {rec.recommendation.reasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.recommendationActions}>
                      <button 
                        className={styles.viewJobBtn}
                        onClick={() => router.push(`/candidato/vagas/${rec.job._id}`)}
                      >
                        Ver Detalhes da Vaga
                      </button>
                      <button 
                        className={styles.applyBtn}
                        onClick={() => {
                          // Implementar candidatura
                        }}
                      >
                        Candidatar-se
                      </button>
                      <button 
                        className={styles.dismissBtn}
                        onClick={() => {
                          // Implementar descarte
                        }}
                      >
                        Não me interessa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <h3>Nenhuma vaga recomendada</h3>
                  <p>Complete seu perfil para receber recomendações personalizadas</p>
                  <button 
                    className={styles.completeProfileBtn}
                    onClick={() => router.push('/candidato/perfil')}
                  >
                    Completar Perfil
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className={styles.timelineTab}>
            <h2>📅 Timeline de Candidaturas</h2>
            <div className={styles.timelineList}>
              {timeline.length > 0 ? (
                timeline.map(item => (
                  <div key={item.application.id} className={styles.timelineItem}>
                    <div className={styles.timelineHeader}>
                      <h3>{item.application.jobTitle}</h3>
                      <div className={styles.timelineMeta}>
                        <span className={styles.company}>{item.application.companyName}</span>
                        <span className={styles.date}>
                          {new Date(item.application.appliedAt).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                      <span className={styles.progressText}>{item.progress}%</span>
                    </div>
                    <div className={styles.timelineEvents}>
                      {item.timeline.map(event => (
                        <div key={event.id} className={styles.timelineEvent}>
                          <div 
                            className={styles.eventIndicator}
                            style={{ backgroundColor: getStatusColor(event.status) }}
                          ></div>
                          <div className={styles.eventContent}>
                            <h4>{event.title}</h4>
                            <p>{event.description}</p>
                            <span className={styles.eventDate}>
                              {new Date(event.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <h3>Nenhuma candidatura encontrada</h3>
                  <p>Comece se candidatando a vagas para acompanhar seu progresso</p>
                  <button 
                    className={styles.browseJobsBtn}
                    onClick={() => router.push('/candidato/vagas')}
                  >
                    Buscar Vagas
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className={styles.metricsTab}>
            <h2>📈 Métricas de Performance</h2>
            {metrics && (
              <div className={styles.metricsContent}>
                <div className={styles.metricsOverview}>
                  <div className={styles.overallScore}>
                    <h3>Score Geral</h3>
                    <div className={styles.scoreCircle}>
                      <div className={styles.scoreValue}>{metrics.overallScore}</div>
                      <div className={styles.scoreMax}>/100</div>
                    </div>
                    <div 
                      className={styles.rankingBadge}
                      style={{ backgroundColor: getRankingColor(metrics.ranking.category) }}
                    >
                      {metrics.ranking.percentile}º percentil
                    </div>
                  </div>
                </div>

                <div className={styles.metricsDetails}>
                  <div className={styles.metricSection}>
                    <h3>📝 Candidaturas</h3>
                    <div className={styles.metricStats}>
                      <div className={styles.stat}>
                        <span className={styles.statValue}>{metrics.applications.total}</span>
                        <span className={styles.statLabel}>Total</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statValue}>{metrics.applications.successRate}%</span>
                        <span className={styles.statLabel}>Taxa de Sucesso</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statValue}>{metrics.applications.pending}</span>
                        <span className={styles.statLabel}>Pendentes</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.metricSection}>
                    <h3>📄 Documentos</h3>
                    <div className={styles.metricStats}>
                      <div className={styles.stat}>
                        <span className={styles.statValue}>{metrics.documents.verified}</span>
                        <span className={styles.statLabel}>Verificados</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statValue}>{metrics.documents.completionRate}%</span>
                        <span className={styles.statLabel}>Completude</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.metricSection}>
                    <h3>🎯 Entrevistas</h3>
                    <div className={styles.metricStats}>
                      <div className={styles.stat}>
                        <span className={styles.statValue}>{metrics.interviews.total}</span>
                        <span className={styles.statLabel}>Total</span>
            </div>
                      <div className={styles.stat}>
                        <span className={styles.statValue}>{metrics.interviews.successRate}%</span>
                        <span className={styles.statLabel}>Taxa de Sucesso</span>
          </div>
                      <div className={styles.stat}>
                        <span className={styles.statValue}>{metrics.interviews.upcoming}</span>
                        <span className={styles.statLabel}>Próximas</span>
        </div>
    </div>
                  </div>
                </div>

                <div className={styles.trendsSection}>
                  <h3>📊 Tendências</h3>
                  <div className={styles.trendsGrid}>
                    <div className={styles.trendItem}>
                      <span className={styles.trendLabel}>Candidaturas</span>
                      <span className={`${styles.trendValue} ${metrics.trends.applicationsGrowth >= 0 ? styles.positive : styles.negative}`}>
                        {metrics.trends.applicationsGrowth > 0 ? '+' : ''}{metrics.trends.applicationsGrowth}%
                      </span>
      </div>
                    <div className={styles.trendItem}>
                      <span className={styles.trendLabel}>Visualizações</span>
                      <span className={`${styles.trendValue} ${metrics.trends.profileViewsGrowth >= 0 ? styles.positive : styles.negative}`}>
                        {metrics.trends.profileViewsGrowth > 0 ? '+' : ''}{metrics.trends.profileViewsGrowth}%
                      </span>
                    </div>
                    <div className={styles.trendItem}>
                      <span className={styles.trendLabel}>Sucesso em Entrevistas</span>
                      <span className={`${styles.trendValue} ${metrics.trends.interviewSuccessGrowth >= 0 ? styles.positive : styles.negative}`}>
                        {metrics.trends.interviewSuccessGrowth > 0 ? '+' : ''}{metrics.trends.interviewSuccessGrowth}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 