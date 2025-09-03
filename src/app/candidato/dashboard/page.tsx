'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  GrTrophy
} from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import styles from './dashboard.module.css';

interface DashboardStats {
  totalApplications: number;
  pendingDocuments: number;
  upcomingInterviews: number;
  profileCompletion: number;
}

interface DashboardSummary {
  alerts: any[];
  quickStats: {
    pendingDocuments: number;
    upcomingInterviews: number;
    pendingApplications: number;
    completedSimulations: number;
    profileCompletion: number;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingDocuments: 0,
    upcomingInterviews: 0,
    profileCompletion: 85
  });
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);

        // Carregar dados do dashboard
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const summaryRes = await fetch('/api/candidates/dashboard-summary');
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setDashboardSummary(summaryData.summary || null);
        
        // Atualizar stats com dados reais
        if (summaryData.summary?.quickStats) {
          setStats({
            totalApplications: summaryData.summary.quickStats.pendingApplications || 0,
            pendingDocuments: summaryData.summary.quickStats.pendingDocuments || 0,
            upcomingInterviews: summaryData.summary.quickStats.upcomingInterviews || 0,
            profileCompletion: summaryData.summary.quickStats.profileCompletion || 0
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.dashboardPage}>
      <DashboardHeader user={user} userType="candidato" />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Page Title */}
          <div className={styles.pageHeader}>
            <h1>Dashboard</h1>
            <p>Acompanhe suas candidaturas, documentos e oportunidades de carreira</p>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrDashboard size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.totalApplications}</h3>
                <p>Total de Candidaturas</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrCalendar size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.upcomingInterviews}</h3>
                <p>Próximas Entrevistas</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrCheckmark size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.profileCompletion}%</h3>
                <p>Perfil Completo</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStar size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.pendingDocuments}</h3>
                <p>Documentos Pendentes</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <h2>Ações Rápidas</h2>
            <div className={styles.actionButtons}>
              
              <Link href="/candidato/documentos" className={styles.actionButton}>
                <GrCheckmark size={20} />
                Gerenciar Documentos
              </Link>
              <Link href="/candidato/perfil" className={styles.actionButton}>
                <GrUser size={20} />
                Completar Perfil
              </Link>
              <Link href="/candidato/simulacoes" className={styles.actionButton}>
                <GrCalendar size={20} />
                Fazer Simulações
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
                      <p>{activity.message}</p>
                      <span>{activity.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyActivity}>
                  <p>Nenhuma atividade recente</p>
                  <span>Suas atividades aparecerão aqui</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
