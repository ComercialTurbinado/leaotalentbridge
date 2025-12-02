'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { 
  GrNotification, 
  GrUser, 
  GrLogout, 
  GrDashboard,
  GrCalendar,
  GrCheckmark,
  GrStar,
  GrSearch,
  GrFilter,
  GrSend,
  GrUpload,
  GrTrophy,
  GrRefresh
} from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import styles from './dashboard.module.css';

interface DashboardStats {
  totalApplications: number;
  pendingDocuments: number;
  upcomingInterviews: number;
  profileCompletion: number;
  completedSimulations: number;
  totalDocuments: number;
  verifiedDocuments: number;
}

interface DashboardSummary {
  alerts: any[];
  quickStats: {
    pendingDocuments: number;
    upcomingInterviews: number;
    pendingApplications: number;
    completedSimulations: number;
    profileCompletion: number;
    totalApplications: number;
    totalDocuments: number;
    verifiedDocuments: number;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
    title: string;
    description: string;
    date: Date;
    status: string;
  }>;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingDocuments: 0,
    upcomingInterviews: 0,
    profileCompletion: 0,
    completedSimulations: 0,
    totalDocuments: 0,
    verifiedDocuments: 0
  });
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);

    // Carregar dados do dashboard
    loadDashboardData();
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [router]);

  const loadDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      const summaryRes = await fetch('/api/candidates/dashboard-summary', {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken() || ''}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!summaryRes.ok) {
        throw new Error(`Erro ${summaryRes.status}: ${summaryRes.statusText}`);
      }
      
      const summaryData = await summaryRes.json();
      
      if (!summaryData.summary) {
        throw new Error('Dados do dashboard não encontrados');
      }
      
      setDashboardSummary(summaryData.summary);
      
      // Atualizar stats com dados reais
      if (summaryData.summary.quickStats) {
        const quickStats = summaryData.summary.quickStats;
        setStats({
          totalApplications: quickStats.totalApplications || 0,
          pendingDocuments: quickStats.pendingDocuments || 0,
          upcomingInterviews: quickStats.upcomingInterviews || 0,
          profileCompletion: quickStats.profileCompletion || 0,
          completedSimulations: quickStats.completedSimulations || 0,
          totalDocuments: quickStats.totalDocuments || 0,
          verifiedDocuments: quickStats.verifiedDocuments || 0
        });
      }
      
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados');
      
      // Fallback para dados básicos se houver erro
      if (!dashboardSummary) {
        setStats({
          totalApplications: 0,
          pendingDocuments: 0,
          upcomingInterviews: 0,
          profileCompletion: 0,
          completedSimulations: 0,
          totalDocuments: 0,
          verifiedDocuments: 0
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.dashboardPage}>
        <DashboardHeader user={user} userType="candidato" />
        <main className={styles.mainContent}>
          <div className={styles.container}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Carregando dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.dashboardPage}>
      <DashboardHeader user={user} userType="candidato" />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Page Title with Refresh */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div>
                <h1>{t('dashboard.title')}</h1>
                <p>{t('dashboard.description')}</p>
                {lastUpdate && (
                  <small className={styles.lastUpdate}>
                    {t('dashboard.lastUpdate')}: {lastUpdate.toLocaleTimeString('pt-BR')}
                  </small>
                )}
              </div>
              <button 
                className={styles.refreshButton}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <GrRefresh size={20} />
                {refreshing ? t('dashboard.refreshing') : t('dashboard.refresh')}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <p>⚠️ {error}</p>
              <button onClick={() => loadDashboardData(true)}>{t('dashboard.tryAgain')}</button>
            </div>
          )}

          {/* Stats Cards */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrDashboard size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.totalApplications}</h3>
                <p>{t('dashboard.totalApplications')}</p>
                <small>{t('dashboard.activeAndHistorical')}</small>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrCalendar size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.upcomingInterviews}</h3>
                <p>{t('dashboard.upcomingInterviews')}</p>
                <small>{t('dashboard.scheduled')}</small>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrCheckmark size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.profileCompletion}%</h3>
                <p>{t('dashboard.profileComplete')}</p>
                <small>{t('dashboard.currentProgress')}</small>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStar size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.pendingDocuments}</h3>
                <p>{t('dashboard.pendingDocuments')}</p>
                <small>{stats.verifiedDocuments}/{stats.totalDocuments} {t('dashboard.verifiedOf')}</small>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrTrophy size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.completedSimulations}</h3>
                <p>{t('dashboard.completedSimulations')}</p>
                <small>Performance avaliada</small>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <h2>Ações Rápidas</h2>
            <div className={styles.actionButtons}>
              <Link href="/candidato/documentos" className={styles.actionButton}>
                <GrCheckmark size={20} />
                <div>
                  <span>Gerenciar Documentos</span>
                  <small>{stats.pendingDocuments} pendentes</small>
                </div>
              </Link>
              <Link href="/candidato/perfil" className={styles.actionButton}>
                <GrUser size={20} />
                <div>
                  <span>Completar Perfil</span>
                  <small>{stats.profileCompletion}% completo</small>
                </div>
              </Link>
              <Link href="/candidato/simulacoes" className={styles.actionButton}>
                <GrCalendar size={20} />
                <div>
                  <span>Fazer Simulações</span>
                  <small>{stats.completedSimulations} concluídas</small>
                </div>
              </Link>
              <Link href="/candidato/candidaturas" className={styles.actionButton}>
                <GrSend size={20} />
                <div>
                  <span>Ver Candidaturas</span>
                  <small>{stats.totalApplications} total</small>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.recentActivity}>
            <h2>Atividade Recente</h2>
            <div className={styles.activityList}>
              {dashboardSummary?.recentActivity && dashboardSummary.recentActivity.length > 0 ? (
                dashboardSummary.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {activity.type === 'profile_update' && <GrUser size={16} />}
                      {activity.type === 'document_verified' && <GrCheckmark size={16} />}
                      {activity.type === 'interview_scheduled' && <GrCalendar size={16} />}
                      {activity.type === 'application_submitted' && <GrSend size={16} />}
                      {activity.type === 'document_uploaded' && <GrUpload size={16} />}
                      {activity.type === 'course_completed' && <GrTrophy size={16} />}
                      {activity.type === 'simulation_completed' && <GrStar size={16} />}
                      {!['profile_update', 'document_verified', 'interview_scheduled', 'application_submitted', 'document_uploaded', 'course_completed', 'simulation_completed'].includes(activity.type) && <GrNotification size={16} />}
                    </div>
                    <div className={styles.activityContent}>
                      <h4>{activity.title || activity.message}</h4>
                      <p>{activity.description || activity.message}</p>
                      <span className={styles.activityDate}>
                        {formatTimestamp(activity.timestamp || activity.date)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyActivity}>
                  <p>Nenhuma atividade recente</p>
                  <span>Suas atividades aparecerão aqui conforme você usar a plataforma</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
