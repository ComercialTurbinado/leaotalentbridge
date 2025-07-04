'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { GrBriefcase, GrGroup, GrCalendar, GrAdd, GrLineChart, GrClock, GrView, GrUser } from 'react-icons/gr';
import styles from './dashboard.module.css';

interface DashboardStats {
  totalVagas: number;
  vagasAtivas: number;
  candidatosIndicados: number;
  entrevistasAgendadas: number;
  contratacoes: number;
}

interface RecentActivity {
  id: string;
  type: 'vaga' | 'candidato' | 'entrevista' | 'contratacao';
  title: string;
  description: string;
  date: string;
}

interface Job {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  metrics?: {
    applications: number;
    qualified: number;
  };
}

interface Application {
  _id: string;
  jobId: {
    title: string;
  };
  candidateId: {
    name: string;
  };
  status: string;
  appliedAt: string;
}

export default function EmpresaDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalVagas: 0,
    vagasAtivas: 0,
    candidatosIndicados: 0,
    entrevistasAgendadas: 0,
    contratacoes: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'empresa') {
      router.push('/empresa/login');
      return;
    }
    setUser(currentUser);
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Carregar vagas da empresa
      const jobsResponse = await ApiService.getJobs({ 
        limit: 50,
        page: 1 
      }) as any;
      
      const jobs = jobsResponse.data || [];
      setRecentJobs(jobs.slice(0, 5)); // Últimas 5 vagas

      // Carregar candidaturas
      const applicationsResponse = await ApiService.getApplications({ 
        limit: 50,
        page: 1 
      }) as any;
      
      const applications = applicationsResponse.data || [];
      setRecentApplications(applications.slice(0, 5)); // Últimas 5 candidaturas

      // Calcular estatísticas
      const totalVagas = jobs.length;
      const vagasAtivas = jobs.filter((job: Job) => job.status === 'active').length;
      const candidatosIndicados = applications.length;
      const entrevistasAgendadas = applications.filter((app: Application) => 
        app.status === 'interview_scheduled' || app.status === 'interviewing'
      ).length;
      const contratacoes = applications.filter((app: Application) => 
        app.status === 'hired'
      ).length;

      setStats({
        totalVagas,
        vagasAtivas,
        candidatosIndicados,
        entrevistasAgendadas,
        contratacoes
      });

      // Gerar atividades recentes baseadas nos dados reais
      const activities: RecentActivity[] = [];

      // Adicionar vagas recentes
      jobs.slice(0, 3).forEach((job: Job) => {
        activities.push({
          id: job._id,
          type: 'vaga',
          title: 'Nova vaga publicada',
          description: job.title,
          date: new Date(job.createdAt).toLocaleDateString('pt-BR')
        });
      });

      // Adicionar candidaturas recentes
      applications.slice(0, 3).forEach((app: Application) => {
        activities.push({
          id: app._id,
          type: 'candidato',
          title: 'Talentos recomendados',
          description: `${app.candidateId.name} se candidatou para ${app.jobId.title}`,
          date: new Date(app.appliedAt).toLocaleDateString('pt-BR')
        });
      });

      // Ordenar por data mais recente
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Fallback para dados mock em caso de erro
      setStats({
        totalVagas: 0,
        vagasAtivas: 0,
        candidatosIndicados: 0,
        entrevistasAgendadas: 0,
        contratacoes: 0
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

  if (!user) {
    return null;
  }

  return (
    <div className={styles.dashboardPage}>
      <DashboardHeader user={user} userType="empresa" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Dashboard</h1>
              <p>Visão geral da sua empresa no Leão Talent Bridge</p>
            </div>
            <div className={styles.headerActions}>
              <Link href="/empresa/vagas/nova" className="btn btn-primary">
                <GrAdd size={16} />
                Nova Vaga
              </Link>
            </div>
          </div>

          {/* Stats GrApps */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrBriefcase size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.totalVagas}</h3>
                <p>Total de Vagas</p>
                <span className={styles.statDetail}>{stats.vagasAtivas} ativas</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrGroup size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.candidatosIndicados}</h3>
                <p>Talentos Indicados</p>
                <span className={styles.statDetail}>Este mês</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrCalendar size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.entrevistasAgendadas}</h3>
                <p>Entrevistas Agendadas</p>
                <span className={styles.statDetail}>Em andamento</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrUser size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.contratacoes}</h3>
                <p>Contratações</p>
                <span className={styles.statDetail}>Realizadas</span>
              </div>
            </div>
          </div>

          {/* Content GrApps */}
          <div className={styles.contentGrid}>
            {/* Recent Activities */}
            <div className={styles.activitySection}>
              <h2>Atividades Recentes</h2>
              <div className={styles.activityList}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        {activity.type === 'vaga' && <GrBriefcase size={16} />}
                        {activity.type === 'candidato' && <GrGroup size={16} />}
                        {activity.type === 'entrevista' && <GrCalendar size={16} />}
                        {activity.type === 'contratacao' && <GrUser size={16} />}
                      </div>
                      <div className={styles.activityContent}>
                        <h4>{activity.title}</h4>
                        <p>{activity.description}</p>
                        <span className={styles.activityDate}>{activity.date}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>Nenhuma atividade recente</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Jobs */}
            <div className={styles.jobsSection}>
              <h2>Vagas Recentes</h2>
              <div className={styles.jobsList}>
                {recentJobs.length > 0 ? (
                  recentJobs.map((job) => (
                    <div key={job._id} className={styles.jobItem}>
                      <div className={styles.jobContent}>
                        <h4>{job.title}</h4>
                        <p>Status: <span className={`status ${job.status}`}>{job.status}</span></p>
                        <span className={styles.jobDate}>
                          {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className={styles.jobStats}>
                        <span>{job.metrics?.applications || 0} candidaturas</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>Nenhuma vaga criada ainda</p>
                    <Link href="/empresa/vagas/nova" className="btn btn-primary btn-sm">
                      Criar primeira vaga
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <h2>Ações Rápidas</h2>
            <div className={styles.actionsGrid}>
              <Link href="/empresa/vagas" className={styles.actionCard}>
                <GrBriefcase size={32} />
                <h3>Gerenciar Vagas</h3>
                <p>Criar, editar e visualizar suas vagas</p>
              </Link>

              <Link href="/empresa/candidatos" className={styles.actionCard}>
                <GrGroup size={32} />
                <h3>Ver Talentos</h3>
                <p>Avalie os melhores perfis indicados para suas posições</p>
              </Link>

              <Link href="/empresa/entrevistas" className={styles.actionCard}>
                <GrCalendar size={32} />
                <h3>Calendário</h3>
                <p>Agendar e gerenciar entrevistas</p>
              </Link>

              <Link href="/empresa/perfil" className={styles.actionCard}>
                <GrLineChart size={32} />
                <h3>Perfil da Empresa</h3>
                <p>Editar informações e preferências</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 