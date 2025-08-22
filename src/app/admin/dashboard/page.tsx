'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { GrGroup, GrOrganization, GrLineChart, GrView, GrFilter, GrStatusGood, GrStatusCritical, GrClock, GrStatusWarning, GrBarChart, GrAdd, GrDownload, GrDocument, GrBriefcase, GrStar, GrUser, GrBook, GrTarget } from 'react-icons/gr';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Carregar estatísticas administrativas
      const statsResponse = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      } else {
        console.warn('Erro ao carregar estatísticas, usando dados mock');
        // Fallback para dados mock
        setStats({
          users: { total: 0, candidates: 0, companies: 0, admins: 0, pending: 0 },
          companies: { total: 0, pending: 0, active: 0 },
          jobs: { total: 0, active: 0, draft: 0, closed: 0, expired: 0 },
          applications: { total: 0, applied: 0, reviewing: 0, interviewed: 0, hired: 0, rejected: 0 },
          courses: { total: 0, active: 0 },
          simulations: { total: 0, active: 0 },
          platform: { monthlyGrowth: 0, activeProcesses: 0, totalRevenue: 0 }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Fallback para dados mock em caso de erro
      setStats({
        users: { total: 0, candidates: 0, companies: 0, admins: 0, pending: 0 },
        companies: { total: 0, pending: 0, active: 0 },
        jobs: { total: 0, active: 0, draft: 0, closed: 0, expired: 0 },
        applications: { total: 0, applied: 0, reviewing: 0, interviewed: 0, hired: 0, rejected: 0 },
        courses: { total: 0, active: 0 },
        simulations: { total: 0, active: 0 },
        platform: { monthlyGrowth: 0, activeProcesses: 0, totalRevenue: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user || !stats) {
    return null;
  }

  return (
    <div className={styles.adminPage}>
      <DashboardHeader user={user} userType="admin" />

      <main className={styles.mainContent}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Dashboard Administrativo</h1>
            <p>Bem-vindo, {user?.name}. Aqui está um resumo das atividades da plataforma.</p>
          </div>

          {/* Stats Cards */}
          <section className={styles.statsSection}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <GrUser size={24} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.users.total}</h3>
                  <p>Total de Usuários</p>
                  <span className={styles.statDetail}>
                    {stats.users.pending} pendentes
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <GrOrganization size={24} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.companies.total}</h3>
                  <p>Empresas</p>
                  <span className={styles.statDetail}>
                    {stats.companies.pending} pendentes
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <GrBriefcase size={24} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.jobs.total}</h3>
                  <p>Vagas</p>
                  <span className={styles.statDetail}>
                    {stats.jobs.active} ativas
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <GrLineChart size={24} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.applications.total}</h3>
                  <p>Candidaturas</p>
                  <span className={styles.statDetail}>
                    {stats.applications.reviewing} em análise
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <GrBook size={24} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.courses.total}</h3>
                  <p>Cursos</p>
                  <span className={styles.statDetail}>
                    {stats.courses.active} ativos
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <GrTarget size={24} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.simulations.total}</h3>
                  <p>Simulações</p>
                  <span className={styles.statDetail}>
                    {stats.simulations.active} ativas
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Metrics */}
          <section className={styles.metricsSection}>
            <div className={styles.sectionHeader}>
              <h2>Métricas de Performance</h2>
            </div>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <h3>Crescimento Mensal</h3>
                  <GrLineChart size={20} />
                </div>
                <div className={styles.metricValue}>
                  <span className={styles.metricNumber}>+{stats.platform.monthlyGrowth}%</span>
                  <span className={styles.metricLabel}>vs. mês anterior</span>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <h3>Processos Ativos</h3>
                  <GrClock size={20} />
                </div>
                <div className={styles.metricValue}>
                  <span className={styles.metricNumber}>{stats.platform.activeProcesses}</span>
                  <span className={styles.metricLabel}>candidaturas em análise</span>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <h3>Taxa de Conversão</h3>
                  <GrStar size={20} />
                </div>
                <div className={styles.metricValue}>
                  <span className={styles.metricNumber}>
                    {stats.applications.total > 0 
                      ? Math.round((stats.applications.hired / stats.applications.total) * 100)
                      : 0}%
                  </span>
                  <span className={styles.metricLabel}>candidaturas contratadas</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className={styles.actionsSection}>
            <div className={styles.sectionHeader}>
              <h2>Ações Rápidas</h2>
            </div>
            <div className={styles.actionsGrid}>
              <Link href="/admin/usuarios" className={styles.actionCard}>
                <GrUser size={24} />
                <h3>Gerenciar Usuários</h3>
                <p>{stats.users.pending} pendentes de aprovação</p>
              </Link>

              <Link href="/admin/empresas" className={styles.actionCard}>
                <GrOrganization size={24} />
                <h3>Gerenciar Empresas</h3>
                <p>{stats.companies.pending} pendentes de aprovação</p>
              </Link>

              <Link href="/admin/vagas" className={styles.actionCard}>
                <GrBriefcase size={24} />
                <h3>Gerenciar Vagas</h3>
                <p>{stats.jobs.total} vagas no sistema</p>
              </Link>

              <Link href="/admin/relatorios" className={styles.actionCard}>
                <GrBarChart size={24} />
                <h3>Relatórios</h3>
                <p>Análises e métricas detalhadas</p>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
} 