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
  GrFilter
} from 'react-icons/gr';
import styles from './dashboard.module.css';

interface DashboardStats {
  totalApplications: number;
  pendingDocuments: number;
  upcomingInterviews: number;
  profileCompletion: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingDocuments: 0,
    upcomingInterviews: 0,
    profileCompletion: 85
  });

  useEffect(() => {
    // Simular carregamento de dados
    setStats({
      totalApplications: 12,
      pendingDocuments: 2,
      upcomingInterviews: 1,
      profileCompletion: 85
    });
  }, []);

  return (
    <div className={styles.dashboardPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Logo */}
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <div className={styles.logoEmblem}>
                <div className={styles.logoGreen}></div>
                <div className={styles.logoRed}></div>
              </div>
            </div>
            <div className={styles.logoText}>
              <h1>UAE careers</h1>
              <p>Connecting talent to the future</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className={styles.navigation}>
            <Link href="/candidato/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
            <Link href="/candidato/entrevistas" className={styles.navLink}>
              Entrevistas
            </Link>
            <Link href="/candidato/simulacoes" className={styles.navLink}>
              Simulações
            </Link>
            <Link href="/candidato/documentos" className={styles.navLink}>
              Documentos
            </Link>
            <Link href="/candidato/cultura" className={styles.navLink}>
              Cultura
            </Link>
            <Link href="/candidato/perfil" className={styles.navLink}>
              Perfil
            </Link>
          </nav>

          {/* User Actions */}
          <div className={styles.userActions}>
            {/* Notifications */}
            <div className={styles.notifications}>
              <GrNotification size={20} />
              <span className={styles.notificationBadge}>3</span>
            </div>

            {/* User Profile */}
            <div className={styles.userProfile}>
              <div className={styles.profilePicture}>
                <GrUser size={20} />
              </div>
              <Link href="/candidato/perfil" className={styles.profileLink}>
                <GrUser size={16} />
                Perfil
              </Link>
              <Link href="/candidato/login" className={styles.logoutLink}>
                Sair
                <GrLogout size={16} />
              </Link>
            </div>
          </div>
        </div>
      </header>

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
              <Link href="/candidato/vagas" className={styles.actionButton}>
                <GrSearch size={20} />
                Buscar Vagas
              </Link>
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
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <GrCheckmark size={16} />
                </div>
                <div className={styles.activityContent}>
                  <p>Perfil atualizado com sucesso</p>
                  <span>Há 2 horas</span>
                </div>
              </div>
              
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <GrCalendar size={16} />
                </div>
                <div className={styles.activityContent}>
                  <p>Nova vaga recomendada: Desenvolvedor Full Stack</p>
                  <span>Há 1 dia</span>
                </div>
              </div>
              
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <GrStar size={16} />
                </div>
                <div className={styles.activityContent}>
                  <p>Documento CV verificado e aprovado</p>
                  <span>Há 3 dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
