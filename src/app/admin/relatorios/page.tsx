'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { GrDocument, GrDownload, GrFilter, GrCalendar, GrOrganization, GrUser, GrBriefcase, GrPieChart, GrBarChart, GrLineChart, GrRefresh, GrPrint } from 'react-icons/gr';
import styles from './relatorios.module.css';

interface ReportData {
  overview?: {
    totalUsers: number;
    totalCompanies: number;
    totalJobs: number;
    totalApplications: number;
    totalCourses: number;
    totalSimulations: number;
  };
  userStats?: Record<string, number>;
  applicationStats?: Record<string, number>;
  jobStats?: Record<string, number>;
  companyStats?: Record<string, number>;
  trends?: Array<{ _id: string; count: number }>;
  byCompany?: Array<{ _id: string; count: number; approved: number; hired: number }>;
  byJob?: Array<{ _id: string; count: number; approved: number; hired: number }>;
  byStatus?: Array<{ _id: string; count: number }>;
  byMonth?: Array<{ _id: string; count: number; approved: number; hired: number }>;
  topCandidates?: Array<{ _id: string; applications: number; approved: number; hired: number }>;
  conversionRates?: {
    approvalRate: number;
    interviewRate: number;
    hireRate: number;
    total: number;
  };
  byCategory?: Array<{ _id: string; count: number }>;
  byLocation?: Array<{ _id: string; count: number }>;
  performance?: Array<{
    title: string;
    applicationsCount: number;
    approvedApplications: number;
    hiredApplications: number;
  }>;
  byIndustry?: Array<{ _id: string; count: number }>;
  bySize?: Array<{ _id: string; count: number }>;
  topCompanies?: Array<{
    name: string;
    industry: string;
    jobsCount: number;
    applicationsCount: number;
    activeJobs: number;
  }>;
}

export default function AdminRelatoriosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [reportData, setReportData] = useState<ReportData>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [jobId, setJobId] = useState('');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadReport();
  }, [router, reportType, startDate, endDate, companyId, jobId]);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        type: reportType,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(companyId && { companyId }),
        ...(jobId && { jobId })
      });

      const response = await fetch(`/api/admin/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data.data);
      } else {
        console.error('Erro ao carregar relatório');
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  }, [reportType, startDate, endDate, companyId, jobId]);

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    // TODO: Implementar exportação
    console.log(`Exportando relatório em ${format}`);
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      applied: 'Aplicada',
      screening: 'Em Triagem',
      qualified: 'Qualificada',
      interviewing: 'Em Entrevista',
      interviewed: 'Entrevistada',
      offer: 'Proposta Enviada',
      hired: 'Contratada',
      rejected: 'Rejeitada',
      withdrawn: 'Retirada',
      active: 'Ativa',
      draft: 'Rascunho',
      closed: 'Fechada',
      expired: 'Expirada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <DashboardHeader user={user!} userType="admin" />

      <main className={styles.mainContent}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Relatórios e Analytics</h1>
            <p>Análises detalhadas e métricas de performance do sistema</p>
          </div>

          {/* Controles de Relatório */}
          <div className={styles.reportControls}>
            <div className={styles.reportTypeSelector}>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className={styles.reportSelect}
              >
                <option value="overview">Visão Geral</option>
                <option value="applications">Candidaturas</option>
                <option value="jobs">Vagas</option>
                <option value="companies">Empresas</option>
              </select>
            </div>

            <div className={styles.filters}>
              <div className={styles.dateFilters}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={styles.dateInput}
                  placeholder="Data Inicial"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={styles.dateInput}
                  placeholder="Data Final"
                />
              </div>

              <div className={styles.exportButtons}>
                <button
                  onClick={() => exportReport('pdf')}
                  className={`${styles.exportBtn} ${styles.pdfBtn}`}
                >
                  <GrDownload size={16} />
                  PDF
                </button>
                <button
                  onClick={() => exportReport('excel')}
                  className={`${styles.exportBtn} ${styles.excelBtn}`}
                >
                  <GrDownload size={16} />
                  Excel
                </button>
                <button
                  onClick={() => exportReport('csv')}
                  className={`${styles.exportBtn} ${styles.csvBtn}`}
                >
                  <GrDownload size={16} />
                  CSV
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo do Relatório */}
          <div className={styles.reportContent}>
            {reportType === 'overview' && (
              <div className={styles.overviewReport}>
                {/* Métricas Principais */}
                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                      <GrUser size={24} />
                    </div>
                    <div className={styles.metricContent}>
                      <h3>{formatNumber(reportData.overview?.totalUsers || 0)}</h3>
                      <p>Total de Usuários</p>
                    </div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                      <GrOrganization size={24} />
                    </div>
                    <div className={styles.metricContent}>
                      <h3>{formatNumber(reportData.overview?.totalCompanies || 0)}</h3>
                      <p>Empresas Cadastradas</p>
                    </div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                      <GrBriefcase size={24} />
                    </div>
                    <div className={styles.metricContent}>
                      <h3>{formatNumber(reportData.overview?.totalJobs || 0)}</h3>
                      <p>Vagas Publicadas</p>
                    </div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                      <GrDocument size={24} />
                    </div>
                    <div className={styles.metricContent}>
                      <h3>{formatNumber(reportData.overview?.totalApplications || 0)}</h3>
                      <p>Candidaturas Recebidas</p>
                    </div>
                  </div>
                </div>

                {/* Gráficos */}
                <div className={styles.chartsGrid}>
                  <div className={styles.chartCard}>
                    <h3>Distribuição de Usuários</h3>
                    <div className={styles.pieChart}>
                      {reportData.userStats && Object.entries(reportData.userStats).map(([type, count]) => (
                        <div key={type} className={styles.pieSlice}>
                          <span className={styles.sliceLabel}>{type}</span>
                          <span className={styles.sliceValue}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.chartCard}>
                    <h3>Status das Candidaturas</h3>
                    <div className={styles.barChart}>
                      {reportData.applicationStats && Object.entries(reportData.applicationStats).map(([status, count]) => (
                        <div key={status} className={styles.barItem}>
                          <span className={styles.barLabel}>{getStatusLabel(status)}</span>
                          <div className={styles.barContainer}>
                            <div 
                              className={styles.bar} 
                              style={{ width: `${(count / Math.max(...Object.values(reportData.applicationStats!))) * 100}%` }}
                            ></div>
                            <span className={styles.barValue}>{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'applications' && (
              <div className={styles.applicationsReport}>
                {/* Taxas de Conversão */}
                <div className={styles.conversionMetrics}>
                  <h3>Taxas de Conversão</h3>
                  <div className={styles.conversionGrid}>
                    <div className={styles.conversionCard}>
                      <h4>{formatPercentage(reportData.conversionRates?.approvalRate || 0)}</h4>
                      <p>Taxa de Aprovação</p>
                    </div>
                    <div className={styles.conversionCard}>
                      <h4>{formatPercentage(reportData.conversionRates?.interviewRate || 0)}</h4>
                      <p>Taxa de Entrevista</p>
                    </div>
                    <div className={styles.conversionCard}>
                      <h4>{formatPercentage(reportData.conversionRates?.hireRate || 0)}</h4>
                      <p>Taxa de Contratação</p>
                    </div>
                  </div>
                </div>

                {/* Top Candidatos */}
                <div className={styles.topCandidates}>
                  <h3>Top Candidatos</h3>
                  <div className={styles.candidatesList}>
                    {reportData.topCandidates?.map((candidate, index) => (
                      <div key={index} className={styles.candidateItem}>
                        <div className={styles.candidateRank}>#{index + 1}</div>
                        <div className={styles.candidateInfo}>
                          <h4>{candidate._id}</h4>
                          <p>{candidate.applications} candidaturas</p>
                        </div>
                        <div className={styles.candidateStats}>
                          <span>{candidate.approved} aprovadas</span>
                          <span>{candidate.hired} contratadas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tendências Mensais */}
                <div className={styles.monthlyTrends}>
                  <h3>Tendências Mensais</h3>
                  <div className={styles.trendsChart}>
                    {reportData.byMonth?.map((month) => (
                      <div key={month._id} className={styles.monthItem}>
                        <span className={styles.monthLabel}>{month._id}</span>
                        <div className={styles.monthBars}>
                          <div className={styles.monthBar}>
                            <span>Total: {month.count}</span>
                          </div>
                          <div className={styles.monthBar}>
                            <span>Aprovadas: {month.approved}</span>
                          </div>
                          <div className={styles.monthBar}>
                            <span>Contratadas: {month.hired}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {reportType === 'jobs' && (
              <div className={styles.jobsReport}>
                {/* Performance das Vagas */}
                <div className={styles.jobPerformance}>
                  <h3>Performance das Vagas</h3>
                  <div className={styles.performanceList}>
                    {reportData.performance?.map((job, index) => (
                      <div key={index} className={styles.jobPerformanceItem}>
                        <div className={styles.jobTitle}>
                          <h4>{job.title}</h4>
                        </div>
                        <div className={styles.jobMetrics}>
                          <span>{job.applicationsCount} candidaturas</span>
                          <span>{job.approvedApplications} aprovadas</span>
                          <span>{job.hiredApplications} contratadas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vagas por Categoria */}
                <div className={styles.jobCategories}>
                  <h3>Vagas por Categoria</h3>
                  <div className={styles.categoriesList}>
                    {reportData.byCategory?.map((category) => (
                      <div key={category._id} className={styles.categoryItem}>
                        <span className={styles.categoryName}>{category._id}</span>
                        <span className={styles.categoryCount}>{category.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {reportType === 'companies' && (
              <div className={styles.companiesReport}>
                {/* Top Empresas */}
                <div className={styles.topCompanies}>
                  <h3>Top Empresas</h3>
                  <div className={styles.companiesList}>
                    {reportData.topCompanies?.map((company, index) => (
                      <div key={index} className={styles.companyItem}>
                        <div className={styles.companyRank}>#{index + 1}</div>
                        <div className={styles.companyInfo}>
                          <h4>{company.name}</h4>
                          <p>{company.industry}</p>
                        </div>
                        <div className={styles.companyStats}>
                          <span>{company.jobsCount} vagas</span>
                          <span>{company.applicationsCount} candidaturas</span>
                          <span>{company.activeJobs} ativas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Empresas por Indústria */}
                <div className={styles.companiesByIndustry}>
                  <h3>Empresas por Indústria</h3>
                  <div className={styles.industryList}>
                    {reportData.byIndustry?.map((industry) => (
                      <div key={industry._id} className={styles.industryItem}>
                        <span className={styles.industryName}>{industry._id}</span>
                        <span className={styles.industryCount}>{industry.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 