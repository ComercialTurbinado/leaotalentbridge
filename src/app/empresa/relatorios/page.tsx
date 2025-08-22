'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { GrDocument, GrDownload, GrFilter, GrCalendar, GrOrganization, GrUser, GrBriefcase, GrPieChart, GrBarChart, GrLineChart, GrRefresh, GrPrint } from 'react-icons/gr';
import styles from './relatorios.module.css';

interface ReportData {
  overview?: {
    totalJobs: number;
    totalApplications: number;
    activeJobs: number;
    approvedApplications: number;
    hiredApplications: number;
    conversionRate: number;
  };
  jobStats?: Record<string, number>;
  applicationStats?: Record<string, number>;
  monthlyTrends?: Array<{ _id: string; applications: number; approved: number; hired: number }>;
  trends?: Array<{ _id: string; count: number }>;
  byJob?: Array<{ _id: string; count: number; approved: number; hired: number }>;
  byStatus?: Array<{ _id: string; count: number }>;
  byCategory?: Array<{ _id: string; count: number }>;
  byLocation?: Array<{ _id: string; count: number }>;
  performance?: Array<{
    title: string;
    applicationsCount: number;
    approvedApplications: number;
    hiredApplications: number;
  }>;
  topJobs?: Array<{
    title: string;
    category: string;
    applicationsCount: number;
    approvedApplications: number;
  }>;
  quality?: {
    avgScreeningScore: number;
    highQualityRate: number;
  };
  responseTime?: {
    avg: number;
    min: number;
    max: number;
  };
}

export default function EmpresaRelatoriosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [reportData, setReportData] = useState<ReportData>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [jobId, setJobId] = useState('');
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'empresa') {
      router.push('/empresa/login');
      return;
    }
    setUser(currentUser);
    loadCompanyId();
  }, [router]);

  useEffect(() => {
    if (companyId) {
      loadReport();
    }
  }, [companyId, reportType, startDate, endDate, jobId]);

  const loadCompanyId = async () => {
    try {
      // Buscar o ID da empresa do usuário atual
      const response = await fetch('/api/companies', {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setCompanyId(data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar empresa:', error);
    }
  };

  const loadReport = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        type: reportType,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(jobId && { jobId })
      });

      const response = await fetch(`/api/companies/${companyId}/reports?${params}`, {
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
  }, [companyId, reportType, startDate, endDate, jobId]);

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
    <div className={styles.empresaPage}>
      <DashboardHeader user={user!} userType="empresa" />

      <main className={styles.mainContent}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Relatórios da Empresa</h1>
            <p>Análises detalhadas e métricas de performance da sua empresa</p>
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
                <option value="jobs">Vagas</option>
                <option value="applications">Candidaturas</option>
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
                      <GrBriefcase size={24} />
                    </div>
                    <div className={styles.metricContent}>
                      <h3>{formatNumber(reportData.overview?.totalJobs || 0)}</h3>
                      <p>Total de Vagas</p>
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

                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                      <GrUser size={24} />
                    </div>
                    <div className={styles.metricContent}>
                      <h3>{formatNumber(reportData.overview?.approvedApplications || 0)}</h3>
                      <p>Candidatos Aprovados</p>
                    </div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                      <GrOrganization size={24} />
                    </div>
                    <div className={styles.metricContent}>
                      <h3>{formatPercentage(reportData.overview?.conversionRate || 0)}</h3>
                      <p>Taxa de Conversão</p>
                    </div>
                  </div>
                </div>

                {/* Gráficos */}
                <div className={styles.chartsGrid}>
                  <div className={styles.chartCard}>
                    <h3>Status das Vagas</h3>
                    <div className={styles.pieChart}>
                      {reportData.jobStats && Object.entries(reportData.jobStats).map(([status, count]) => (
                        <div key={status} className={styles.pieSlice}>
                          <span className={styles.sliceLabel}>{getStatusLabel(status)}</span>
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

                {/* Tendências Mensais */}
                <div className={styles.monthlyTrends}>
                  <h3>Tendências Mensais</h3>
                  <div className={styles.trendsChart}>
                    {reportData.monthlyTrends?.map((month) => (
                      <div key={month._id} className={styles.monthItem}>
                        <span className={styles.monthLabel}>{month._id}</span>
                        <div className={styles.monthBars}>
                          <div className={styles.monthBar}>
                            <span>Total: {month.applications}</span>
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

                {/* Top Vagas */}
                <div className={styles.topJobs}>
                  <h3>Top Vagas</h3>
                  <div className={styles.jobsList}>
                    {reportData.topJobs?.map((job, index) => (
                      <div key={index} className={styles.jobItem}>
                        <div className={styles.jobRank}>#{index + 1}</div>
                        <div className={styles.jobInfo}>
                          <h4>{job.title}</h4>
                          <p>{job.category}</p>
                        </div>
                        <div className={styles.jobStats}>
                          <span>{job.applicationsCount} candidaturas</span>
                          <span>{job.approvedApplications} aprovadas</span>
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

            {reportType === 'applications' && (
              <div className={styles.applicationsReport}>
                {/* Qualidade dos Candidatos */}
                <div className={styles.candidateQuality}>
                  <h3>Qualidade dos Candidatos</h3>
                  <div className={styles.qualityMetrics}>
                    <div className={styles.qualityCard}>
                      <h4>{reportData.quality?.avgScreeningScore || 0}%</h4>
                      <p>Score Médio de Triagem</p>
                    </div>
                    <div className={styles.qualityCard}>
                      <h4>{formatPercentage(reportData.quality?.highQualityRate || 0)}</h4>
                      <p>Taxa de Candidatos de Alta Qualidade</p>
                    </div>
                  </div>
                </div>

                {/* Tempo de Resposta */}
                <div className={styles.responseTime}>
                  <h3>Tempo de Resposta</h3>
                  <div className={styles.responseMetrics}>
                    <div className={styles.responseCard}>
                      <h4>{reportData.responseTime?.avg || 0} dias</h4>
                      <p>Tempo Médio de Resposta</p>
                    </div>
                    <div className={styles.responseCard}>
                      <h4>{reportData.responseTime?.min || 0} dias</h4>
                      <p>Resposta Mais Rápida</p>
                    </div>
                    <div className={styles.responseCard}>
                      <h4>{reportData.responseTime?.max || 0} dias</h4>
                      <p>Resposta Mais Lenta</p>
                    </div>
                  </div>
                </div>

                {/* Candidaturas por Vaga */}
                <div className={styles.applicationsByJob}>
                  <h3>Candidaturas por Vaga</h3>
                  <div className={styles.applicationsList}>
                    {reportData.byJob?.map((job) => (
                      <div key={job._id} className={styles.applicationItem}>
                        <div className={styles.jobTitle}>
                          <h4>{job._id}</h4>
                        </div>
                        <div className={styles.applicationStats}>
                          <span>{job.count} total</span>
                          <span>{job.approved} aprovadas</span>
                          <span>{job.hired} contratadas</span>
                        </div>
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
