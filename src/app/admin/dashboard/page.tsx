'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Eye, 
  UserCheck, 
  UserX, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Activity,
  Plus,
  Download,
  Settings,
  FileText,
  Briefcase,
  Star
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

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
      totalCandidates: 1247,
      pendingCandidates: 89,
      totalCompanies: 156,
      pendingCompanies: 23,
      activeProcesses: 342,
      monthlyGrowth: 15.2
    },
    recentCandidates: [
      {
        id: 1,
        name: 'João Silva',
        email: 'joao@email.com',
        position: 'Desenvolvedor Full Stack',
        experience: 'Sênior',
        status: 'pending',
        appliedAt: '2 horas atrás',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
      },
      {
        id: 2,
        name: 'Maria Santos',
        email: 'maria@email.com',
        position: 'Product Manager',
        experience: 'Sênior',
        status: 'approved',
        appliedAt: '5 horas atrás',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
      },
      {
        id: 3,
        name: 'Carlos Oliveira',
        email: 'carlos@email.com',
        position: 'UX Designer',
        experience: 'Pleno',
        status: 'reviewing',
        appliedAt: '1 dia atrás',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      }
    ],
    recentCompanies: [
      {
        id: 1,
        name: 'TechCorp Dubai',
        email: 'hr@techcorp.ae',
        industry: 'Tecnologia',
        size: '200-500',
        status: 'pending',
        registeredAt: '3 horas atrás',
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=40&h=40&fit=crop'
      },
      {
        id: 2,
        name: 'Innovation Hub',
        email: 'contact@innohub.ae',
        industry: 'Consultoria',
        size: '50-200',
        status: 'approved',
        registeredAt: '1 dia atrás',
        logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=40&h=40&fit=crop'
      }
    ],
    systemLogs: [
      {
        id: 1,
        action: 'Candidato aprovado',
        user: 'Admin',
        target: 'João Silva',
        timestamp: '10:30',
        type: 'success'
      },
      {
        id: 2,
        action: 'Empresa cadastrada',
        user: 'System',
        target: 'TechCorp Dubai',
        timestamp: '09:15',
        type: 'info'
      },
      {
        id: 3,
        action: 'Login administrativo',
        user: 'Admin',
        target: 'Sistema',
        timestamp: '08:45',
        type: 'warning'
      }
    ]
  };

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
                  <Users size={24} />
                </div>
                <div className={styles.statContent}>
                  <h3>{mockData.stats.totalCandidates.toLocaleString()}</h3>
                  <p>Total de Candidatos</p>
                  <span className={styles.statChange}>
                    +{mockData.stats.monthlyGrowth}% este mês
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Building2 size={24} />
                </div>
                <div className={styles.statContent}>
                  <h3>{mockData.stats.totalCompanies}</h3>
                  <p>Empresas Ativas</p>
                  <span className={styles.statChange}>
                    {mockData.stats.pendingCompanies} pendentes
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <TrendingUp size={24} />
                </div>
                <div className={styles.statContent}>
                  <h3>{mockData.stats.activeProcesses}</h3>
                  <p>Processos Ativos</p>
                  <span className={styles.statChange}>
                    Em andamento
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Clock size={24} />
                </div>
                <div className={styles.statContent}>
                  <h3>{mockData.stats.pendingCandidates}</h3>
                  <p>Aprovações Pendentes</p>
                  <span className={styles.statChange}>
                    Requer atenção
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Dashboard Grid */}
          <div className={styles.dashboardGrid}>
            {/* Recent Candidates */}
            <section className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h2>Candidatos Recentes</h2>
                <div className={styles.cardActions}>
                  <button className={styles.actionBtn}>
                    <Filter size={18} />
                  </button>
                  <Link href="/admin/usuarios" className="btn btn-secondary btn-small">
                    Ver Todos
                  </Link>
                </div>
              </div>

              <div className={styles.candidatesList}>
                {mockData.recentCandidates.map((candidate) => (
                  <div key={candidate.id} className={styles.candidateCard}>
                    <div className={styles.candidateInfo}>
                      <img src={candidate.avatar} alt={candidate.name} />
                      <div className={styles.candidateDetails}>
                        <h4>{candidate.name}</h4>
                        <p>{candidate.position}</p>
                        <span className={styles.candidateEmail}>{candidate.email}</span>
                      </div>
                    </div>
                    
                    <div className={styles.candidateStatus}>
                      <span className={`${styles.status} ${styles[candidate.status]}`}>
                        {candidate.status === 'pending' && <Clock size={14} />}
                        {candidate.status === 'approved' && <CheckCircle size={14} />}
                        {candidate.status === 'reviewing' && <Eye size={14} />}
                        {candidate.status === 'pending' ? 'Pendente' : 
                         candidate.status === 'approved' ? 'Aprovado' : 'Em Análise'}
                      </span>
                      <span className={styles.candidateTime}>{candidate.appliedAt}</span>
                    </div>
                    
                    <div className={styles.candidateActions}>
                      {candidate.status === 'pending' && (
                        <>
                          <button className={`${styles.actionButton} ${styles.approve}`}>
                            <UserCheck size={16} />
                          </button>
                          <button className={`${styles.actionButton} ${styles.reject}`}>
                            <UserX size={16} />
                          </button>
                        </>
                      )}
                      <button className={styles.actionButton}>
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Sidebar Content */}
            <aside className={styles.dashboardSidebar}>
              {/* Recent Companies */}
              <section className={styles.sidebarCard}>
                <div className={styles.sidebarCardHeader}>
                  <h3>Empresas Recentes</h3>
                  <Link href="/admin/empresas" className={styles.sidebarLink}>
                    Ver todas
                  </Link>
                </div>
                
                <div className={styles.companiesList}>
                  {mockData.recentCompanies.map((company) => (
                    <div key={company.id} className={styles.companyCard}>
                      <div className={styles.companyInfo}>
                        <img src={company.logo} alt={company.name} />
                        <div>
                          <h4>{company.name}</h4>
                          <p>{company.industry}</p>
                        </div>
                      </div>
                      <span className={`${styles.status} ${styles[company.status]}`}>
                        {company.status === 'pending' ? 'Pendente' : 'Aprovada'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* System Logs */}
              <section className={styles.sidebarCard}>
                <div className={styles.sidebarCardHeader}>
                  <h3>Logs do Sistema</h3>
                  <Link href="/admin/relatorios" className={styles.sidebarLink}>
                    Ver relatórios
                  </Link>
                </div>
                
                <div className={styles.logsList}>
                  {mockData.systemLogs.map((log) => (
                    <div key={log.id} className={styles.logItem}>
                      <div className={`${styles.logIcon} ${styles[log.type]}`}>
                        {log.type === 'success' && <CheckCircle size={14} />}
                        {log.type === 'info' && <Activity size={14} />}
                        {log.type === 'warning' && <AlertTriangle size={14} />}
                      </div>
                      
                      <div className={styles.logContent}>
                        <p>
                          <strong>{log.action}</strong> - {log.target}
                        </p>
                        <span className={styles.logTime}>
                          {log.user} • {log.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick Actions */}
              <section className={styles.sidebarCard}>
                <h3>Ações Rápidas</h3>
                
                <div className={styles.quickActions}>
                  <Link href="/admin/usuarios" className={styles.quickAction}>
                    <Users size={20} />
                    <span>Gerenciar Usuários</span>
                  </Link>
                  
                  <Link href="/admin/vagas" className={styles.quickAction}>
                    <Briefcase size={20} />
                    <span>Gerenciar Vagas</span>
                  </Link>
                  
                  <Link href="/admin/empresas" className={styles.quickAction}>
                    <Building2 size={20} />
                    <span>Gerenciar Empresas</span>
                  </Link>
                  
                  <Link href="/admin/relatorios" className={styles.quickAction}>
                    <BarChart3 size={20} />
                    <span>Ver Relatórios</span>
                  </Link>
                  
                  <button className={styles.quickAction}>
                    <Download size={20} />
                    <span>Exportar Dados</span>
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
} 