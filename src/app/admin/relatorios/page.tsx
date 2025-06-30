'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  Download,
  Filter,
  Target,
  Clock,
  Award,
  MapPin,
  Briefcase,
  Star,
  ChevronDown,
  FileText,
  Building2
} from 'lucide-react';
import styles from './relatorios.module.css';

interface MetricaCard {
  titulo: string;
  valor: string;
  variacao: string;
  tipo: 'positivo' | 'negativo' | 'neutro';
  icon: any;
}

interface DadosGrafico {
  periodo: string;
  vagas: number;
  candidatos: number;
  entrevistas: number;
  contratacoes: number;
  empresas: number;
}

interface TopEmpresa {
  id: number;
  nome: string;
  vagas_ativas: number;
  candidatos_totais: number;
  taxa_conversao: number;
}

interface CandidatoPorRegiao {
  regiao: string;
  quantidade: number;
  percentual: number;
}

export default function AdminRelatoriosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('30dias');
  const [tipoRelatorio, setTipoRelatorio] = useState('geral');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  // Dados simulados para administração da plataforma
  const metricas: MetricaCard[] = [
    {
      titulo: 'Empresas Ativas',
      valor: '127',
      variacao: '+18%',
      tipo: 'positivo',
      icon: Building2
    },
    {
      titulo: 'Candidatos Totais',
      valor: '8,943',
      variacao: '+32%',
      tipo: 'positivo',
      icon: Users
    },
    {
      titulo: 'Vagas Publicadas',
      valor: '456',
      variacao: '+24%',
      tipo: 'positivo',
      icon: Briefcase
    },
    {
      titulo: 'Taxa de Match Global',
      valor: '12.3%',
      variacao: '+5%',
      tipo: 'positivo',
      icon: Target
    }
  ];

  const dadosGrafico: DadosGrafico[] = [
    { periodo: 'Jan', vagas: 298, candidatos: 1245, entrevistas: 432, contratacoes: 89, empresas: 98 },
    { periodo: 'Fev', vagas: 342, candidatos: 1512, entrevistas: 567, contratacoes: 124, empresas: 105 },
    { periodo: 'Mar', vagas: 389, candidatos: 1689, entrevistas: 634, contratacoes: 156, empresas: 112 },
    { periodo: 'Abr', vagas: 425, candidatos: 1898, entrevistas: 723, contratacoes: 189, empresas: 118 },
    { periodo: 'Mai', vagas: 468, candidatos: 2145, entrevistas: 834, contratacoes: 234, empresas: 125 },
    { periodo: 'Jun', vagas: 456, candidatos: 2378, entrevistas: 912, contratacoes: 267, empresas: 127 }
  ];

  const topEmpresas: TopEmpresa[] = [
    {
      id: 1,
      nome: 'Tech Solutions DMCC',
      vagas_ativas: 24,
      candidatos_totais: 1247,
      taxa_conversao: 8.2
    },
    {
      id: 2,
      nome: 'Emirates Digital Hub',
      vagas_ativas: 18,
      candidatos_totais: 892,
      taxa_conversao: 7.8
    },
    {
      id: 3,
      nome: 'Dubai Innovation Labs',
      vagas_ativas: 15,
      candidatos_totais: 634,
      taxa_conversao: 7.1
    },
    {
      id: 4,
      nome: 'Gulf Tech Partners',
      vagas_ativas: 21,
      candidatos_totais: 1089,
      taxa_conversao: 6.9
    },
    {
      id: 5,
      nome: 'Middle East Ventures',
      vagas_ativas: 12,
      candidatos_totais: 456,
      taxa_conversao: 6.5
    }
  ];

  const candidatosPorRegiao: CandidatoPorRegiao[] = [
    { regiao: 'São Paulo', quantidade: 2456, percentual: 27.5 },
    { regiao: 'Rio de Janeiro', quantidade: 1678, percentual: 18.8 },
    { regiao: 'Minas Gerais', quantidade: 1234, percentual: 13.8 },
    { regiao: 'Paraná', quantidade: 987, percentual: 11.0 },
    { regiao: 'Rio Grande do Sul', quantidade: 876, percentual: 9.8 },
    { regiao: 'Outros Estados', quantidade: 1712, percentual: 19.1 }
  ];

  const setoresMaisAtivos = [
    { setor: 'Tecnologia', empresas: 45, percentual: 35.4 },
    { setor: 'Financeiro', empresas: 28, percentual: 22.0 },
    { setor: 'Saúde', empresas: 18, percentual: 14.2 },
    { setor: 'Educação', empresas: 12, percentual: 9.4 },
    { setor: 'Varejo', empresas: 11, percentual: 8.7 },
    { setor: 'Outros', empresas: 13, percentual: 10.3 }
  ];

  const exportarRelatorio = (tipo: string) => {
    // Simular exportação
    alert(`Exportando relatório ${tipo}...`);
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
    <div className={styles.relatoriosPage}>
      <DashboardHeader user={user} userType="admin" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Relatórios da Plataforma</h1>
              <p>Visão geral do desempenho e métricas da plataforma Leao Talent Bridge</p>
            </div>
            
            <div className={styles.headerActions}>
              <div className={styles.filters}>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                  <option value="90dias">Últimos 90 dias</option>
                  <option value="6meses">Últimos 6 meses</option>
                  <option value="1ano">Último ano</option>
                </select>

                <select
                  value={tipoRelatorio}
                  onChange={(e) => setTipoRelatorio(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="geral">Relatório Geral</option>
                  <option value="empresas">Desempenho de Empresas</option>
                  <option value="candidatos">Análise de Candidatos</option>
                  <option value="plataforma">Métricas da Plataforma</option>
                </select>
              </div>

              <button 
                onClick={() => exportarRelatorio('PDF')}
                className="btn btn-secondary"
              >
                <Download size={16} />
                Exportar PDF
              </button>
            </div>
          </div>

          {/* Métricas Principais */}
          <div className={styles.metricsGrid}>
            {metricas.map((metrica, index) => (
              <div key={index} className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <div className={styles.metricIcon}>
                    <metrica.icon size={24} />
                  </div>
                  <div className={`${styles.metricVariacao} ${styles[metrica.tipo]}`}>
                    {metrica.variacao}
                  </div>
                </div>
                <div className={styles.metricContent}>
                  <h3>{metrica.valor}</h3>
                  <p>{metrica.titulo}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico Principal */}
          <div className={styles.chartSection}>
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h2>Evolução da Plataforma</h2>
                <div className={styles.chartLegend}>
                  <div className={styles.legendItem}>
                    <div className={`${styles.legendColor} ${styles.empresas}`}></div>
                    <span>Empresas</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={`${styles.legendColor} ${styles.vagas}`}></div>
                    <span>Vagas</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={`${styles.legendColor} ${styles.candidatos}`}></div>
                    <span>Candidatos</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={`${styles.legendColor} ${styles.entrevistas}`}></div>
                    <span>Entrevistas</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={`${styles.legendColor} ${styles.contratacoes}`}></div>
                    <span>Contratações</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.chartContainer}>
                <div className={styles.chartGrid}>
                  {dadosGrafico.map((dados, index) => (
                    <div key={index} className={styles.chartColumn}>
                      <div className={styles.chartBars}>
                        <div 
                          className={`${styles.chartBar} ${styles.empresas}`}
                          style={{ height: `${(dados.empresas / 150) * 100}%` }}
                          title={`Empresas: ${dados.empresas}`}
                        ></div>
                        <div 
                          className={`${styles.chartBar} ${styles.vagas}`}
                          style={{ height: `${(dados.vagas / 500) * 100}%` }}
                          title={`Vagas: ${dados.vagas}`}
                        ></div>
                        <div 
                          className={`${styles.chartBar} ${styles.candidatos}`}
                          style={{ height: `${(dados.candidatos / 2500) * 100}%` }}
                          title={`Candidatos: ${dados.candidatos}`}
                        ></div>
                        <div 
                          className={`${styles.chartBar} ${styles.entrevistas}`}
                          style={{ height: `${(dados.entrevistas / 1000) * 100}%` }}
                          title={`Entrevistas: ${dados.entrevistas}`}
                        ></div>
                        <div 
                          className={`${styles.chartBar} ${styles.contratacoes}`}
                          style={{ height: `${(dados.contratacoes / 300) * 100}%` }}
                          title={`Contratações: ${dados.contratacoes}`}
                        ></div>
                      </div>
                      <div className={styles.chartLabel}>{dados.periodo}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.reportsGrid}>
            {/* Top Empresas */}
            <div className={styles.reportCard}>
              <div className={styles.reportHeader}>
                <h3>Top 5 Empresas por Performance</h3>
                <button className={styles.exportBtn}>
                  <Download size={14} />
                </button>
              </div>
              <div className={styles.topVagasList}>
                {topEmpresas.map((empresa, index) => (
                  <div key={empresa.id} className={styles.topVagaItem}>
                    <div className={styles.vagaRank}>#{index + 1}</div>
                    <div className={styles.vagaInfo}>
                      <h4>{empresa.nome}</h4>
                      <div className={styles.vagaStats}>
                        <span><Briefcase size={12} /> {empresa.vagas_ativas} vagas ativas</span>
                        <span><Users size={12} /> {empresa.candidatos_totais} candidatos</span>
                      </div>
                    </div>
                    <div className={styles.vagaConversao}>
                      <span className={styles.conversaoValue}>{empresa.taxa_conversao}%</span>
                      <span className={styles.conversaoLabel}>conversão</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidatos por Região */}
            <div className={styles.reportCard}>
              <div className={styles.reportHeader}>
                <h3>Candidatos por Região</h3>
                <button className={styles.exportBtn}>
                  <Download size={14} />
                </button>
              </div>
              <div className={styles.regiaoList}>
                {candidatosPorRegiao.map((regiao, index) => (
                  <div key={index} className={styles.regiaoItem}>
                    <div className={styles.regiaoInfo}>
                      <span className={styles.regiaoNome}>{regiao.regiao}</span>
                      <span className={styles.regiaoQuantidade}>{regiao.quantidade} candidatos</span>
                    </div>
                    <div className={styles.regiaoBar}>
                      <div 
                        className={styles.regiaoProgress}
                        style={{ width: `${regiao.percentual}%` }}
                      ></div>
                    </div>
                    <span className={styles.regiaoPercentual}>{regiao.percentual}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Setores Mais Ativos */}
            <div className={styles.reportCard}>
              <div className={styles.reportHeader}>
                <h3>Setores Mais Ativos</h3>
                <button className={styles.exportBtn}>
                  <Download size={14} />
                </button>
              </div>
              <div className={styles.habilidadesList}>
                {setoresMaisAtivos.map((item, index) => (
                  <div key={index} className={styles.habilidadeItem}>
                    <div className={styles.habilidadeInfo}>
                      <span className={styles.habilidadeNome}>{item.setor}</span>
                      <span className={styles.habilidadeDemanda}>{item.empresas} empresas</span>
                    </div>
                    <div className={styles.habilidadeBar}>
                      <div 
                        className={styles.habilidadeProgress}
                        style={{ width: `${item.percentual}%` }}
                      ></div>
                    </div>
                    <span className={styles.habilidadePercentual}>{item.percentual}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Métricas da Plataforma */}
            <div className={styles.reportCard}>
              <div className={styles.reportHeader}>
                <h3>Métricas da Plataforma</h3>
                <button className={styles.exportBtn}>
                  <Download size={14} />
                </button>
              </div>
              <div className={styles.performanceList}>
                <div className={styles.performanceItem}>
                  <div className={styles.performanceIcon}>
                    <Clock size={16} />
                  </div>
                  <div className={styles.performanceInfo}>
                    <span className={styles.performanceLabel}>Tempo Médio de Match</span>
                    <span className={styles.performanceValue}>3.2 dias</span>
                  </div>
                </div>
                
                <div className={styles.performanceItem}>
                  <div className={styles.performanceIcon}>
                    <Star size={16} />
                  </div>
                  <div className={styles.performanceInfo}>
                    <span className={styles.performanceLabel}>Satisfação das Empresas</span>
                    <span className={styles.performanceValue}>4.6/5.0</span>
                  </div>
                </div>
                
                <div className={styles.performanceItem}>
                  <div className={styles.performanceIcon}>
                    <Award size={16} />
                  </div>
                  <div className={styles.performanceInfo}>
                    <span className={styles.performanceLabel}>Taxa de Sucesso Global</span>
                    <span className={styles.performanceValue}>78%</span>
                  </div>
                </div>
                
                <div className={styles.performanceItem}>
                  <div className={styles.performanceIcon}>
                    <TrendingUp size={16} />
                  </div>
                  <div className={styles.performanceInfo}>
                    <span className={styles.performanceLabel}>Crescimento Mensal</span>
                    <span className={styles.performanceValue}>+22%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ações de Exportação */}
          <div className={styles.exportSection}>
            <h3>Exportar Relatórios da Plataforma</h3>
            <div className={styles.exportButtons}>
              <button 
                onClick={() => exportarRelatorio('Excel')}
                className="btn btn-secondary"
              >
                <FileText size={16} />
                Relatório Completo (Excel)
              </button>
              <button 
                onClick={() => exportarRelatorio('CSV')}
                className="btn btn-secondary"
              >
                <Download size={16} />
                Dados Brutos (CSV)
              </button>
              <button 
                onClick={() => exportarRelatorio('Dashboard')}
                className="btn btn-primary"
              >
                <BarChart3 size={16} />
                Dashboard Executivo
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 