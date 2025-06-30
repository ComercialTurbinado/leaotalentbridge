'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  Briefcase,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Download,
  X,
  UserCheck,
  Mail,
  Phone
} from 'lucide-react';
import styles from './vagas.module.css';

interface Candidato {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  experiencia: string;
  localizacao: string;
  avatar: string;
  compatibilidade: number;
  status: 'novo' | 'analisando' | 'entrevista' | 'aprovado' | 'rejeitado';
  dataAplicacao: string;
}

interface Vaga {
  id: string;
  titulo: string;
  empresa: {
    nome: string;
    logo: string;
  };
  localizacao: string;
  tipo: 'CLT' | 'PJ' | 'Freelance' | 'Estágio';
  modalidade: 'Presencial' | 'Remoto' | 'Híbrido';
  salario: {
    min: number;
    max: number;
    moeda: string;
  };
  nivel: 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista';
  status: 'ativa' | 'pausada' | 'fechada' | 'rascunho';
  dataPublicacao: string;
  dataExpiracao: string;
  totalCandidatos: number;
  candidatosRecomendados: Candidato[];
  descricao: string;
  requisitos: string[];
  beneficios: string[];
}

export default function AdminVagasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busca, setBusca] = useState('');
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'candidates' | 'edit' | 'delete'>('view');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadVagas();
    setLoading(false);
  }, [router]);

  const loadVagas = () => {
    // Dados simulados de vagas com candidatos recomendados
    const vagasSimuladas: Vaga[] = [
      {
        id: '1',
        titulo: 'Desenvolvedor Full Stack Sênior',
        empresa: {
          nome: 'TechCorp Dubai',
          logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop'
        },
        localizacao: 'Dubai, UAE',
        tipo: 'CLT',
        modalidade: 'Híbrido',
        salario: {
          min: 15000,
          max: 25000,
          moeda: 'AED'
        },
        nivel: 'Sênior',
        status: 'ativa',
        dataPublicacao: '2024-06-01',
        dataExpiracao: '2024-07-01',
        totalCandidatos: 24,
        descricao: 'Buscamos um desenvolvedor full stack experiente para liderar projetos inovadores.',
        requisitos: ['React', 'Node.js', 'TypeScript', '5+ anos de experiência'],
        beneficios: ['Plano de saúde', 'Vale alimentação', 'Home office'],
        candidatosRecomendados: [
          {
            id: '1',
            nome: 'João Silva',
            email: 'joao.silva@email.com',
            telefone: '+55 11 99999-9999',
            cargo: 'Desenvolvedor Full Stack',
            experiencia: '6 anos',
            localizacao: 'São Paulo, SP',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
            compatibilidade: 95,
            status: 'novo',
            dataAplicacao: '2024-06-13'
          },
          {
            id: '2',
            nome: 'Maria Santos',
            email: 'maria.santos@email.com',
            telefone: '+55 21 88888-8888',
            cargo: 'Desenvolvedor React',
            experiencia: '5 anos',
            localizacao: 'Rio de Janeiro, RJ',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
            compatibilidade: 88,
            status: 'analisando',
            dataAplicacao: '2024-06-12'
          },
          {
            id: '3',
            nome: 'Carlos Oliveira',
            email: 'carlos.oliveira@email.com',
            telefone: '+55 11 77777-7777',
            cargo: 'Full Stack Developer',
            experiencia: '7 anos',
            localizacao: 'São Paulo, SP',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            compatibilidade: 92,
            status: 'entrevista',
            dataAplicacao: '2024-06-10'
          }
        ]
      },
      {
        id: '2',
        titulo: 'Product Manager',
        empresa: {
          nome: 'Innovation Hub',
          logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=60&h=60&fit=crop'
        },
        localizacao: 'Abu Dhabi, UAE',
        tipo: 'CLT',
        modalidade: 'Presencial',
        salario: {
          min: 18000,
          max: 30000,
          moeda: 'AED'
        },
        nivel: 'Sênior',
        status: 'ativa',
        dataPublicacao: '2024-05-28',
        dataExpiracao: '2024-06-28',
        totalCandidatos: 18,
        descricao: 'Procuramos um Product Manager experiente para liderar nossa estratégia de produto.',
        requisitos: ['MBA ou superior', 'Experiência em produtos digitais', 'Inglês fluente'],
        beneficios: ['Seguro saúde premium', 'Bônus anual', 'Desenvolvimento profissional'],
        candidatosRecomendados: [
          {
            id: '4',
            nome: 'Ana Costa',
            email: 'ana.costa@email.com',
            telefone: '+55 85 66666-6666',
            cargo: 'Product Manager',
            experiencia: '8 anos',
            localizacao: 'Fortaleza, CE',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
            compatibilidade: 96,
            status: 'aprovado',
            dataAplicacao: '2024-06-08'
          },
          {
            id: '5',
            nome: 'Pedro Almeida',
            email: 'pedro.almeida@email.com',
            telefone: '+55 11 55555-5555',
            cargo: 'Senior Product Manager',
            experiencia: '10 anos',
            localizacao: 'São Paulo, SP',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
            compatibilidade: 89,
            status: 'entrevista',
            dataAplicacao: '2024-06-05'
          }
        ]
      },
      {
        id: '3',
        titulo: 'UX Designer',
        empresa: {
          nome: 'StartupXYZ',
          logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=60&h=60&fit=crop'
        },
        localizacao: 'Sharjah, UAE',
        tipo: 'PJ',
        modalidade: 'Remoto',
        salario: {
          min: 8000,
          max: 15000,
          moeda: 'AED'
        },
        nivel: 'Pleno',
        status: 'pausada',
        dataPublicacao: '2024-06-05',
        dataExpiracao: '2024-07-05',
        totalCandidatos: 12,
        descricao: 'Buscamos um UX Designer criativo para melhorar a experiência dos nossos usuários.',
        requisitos: ['Figma', 'Adobe Creative Suite', 'Experiência em mobile'],
        beneficios: ['Flexibilidade de horário', 'Equipamentos fornecidos'],
        candidatosRecomendados: [
          {
            id: '6',
            nome: 'Lucia Fernandes',
            email: 'lucia.fernandes@email.com',
            telefone: '+55 85 44444-4444',
            cargo: 'UX/UI Designer',
            experiencia: '4 anos',
            localizacao: 'Fortaleza, CE',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
            compatibilidade: 85,
            status: 'novo',
            dataAplicacao: '2024-06-11'
          }
        ]
      }
    ];

    setVagas(vagasSimuladas);
  };

  const vagasFiltradas = vagas.filter(vaga => {
    const matchStatus = filtroStatus === 'todas' || vaga.status === filtroStatus;
    const matchTipo = filtroTipo === 'todos' || vaga.tipo === filtroTipo;
    const matchBusca = busca === '' || 
      vaga.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      vaga.empresa.nome.toLowerCase().includes(busca.toLowerCase()) ||
      vaga.localizacao.toLowerCase().includes(busca.toLowerCase());
    
    return matchStatus && matchTipo && matchBusca;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'green';
      case 'pausada': return 'yellow';
      case 'fechada': return 'gray';
      case 'rascunho': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativa': return <CheckCircle size={14} />;
      case 'pausada': return <Clock size={14} />;
      case 'fechada': return <XCircle size={14} />;
      case 'rascunho': return <Edit size={14} />;
      default: return <XCircle size={14} />;
    }
  };

  const getCandidateStatusColor = (status: string) => {
    switch (status) {
      case 'novo': return 'blue';
      case 'analisando': return 'yellow';
      case 'entrevista': return 'purple';
      case 'aprovado': return 'green';
      case 'rejeitado': return 'red';
      default: return 'gray';
    }
  };

  const getCandidateStatusIcon = (status: string) => {
    switch (status) {
      case 'novo': return <Users size={12} />;
      case 'analisando': return <Eye size={12} />;
      case 'entrevista': return <Calendar size={12} />;
      case 'aprovado': return <CheckCircle size={12} />;
      case 'rejeitado': return <XCircle size={12} />;
      default: return <Users size={12} />;
    }
  };

  const handleViewVaga = (vaga: Vaga) => {
    setVagaSelecionada(vaga);
    setModalType('view');
    setShowModal(true);
  };

  const handleViewCandidates = (vaga: Vaga) => {
    setVagaSelecionada(vaga);
    setModalType('candidates');
    setShowModal(true);
  };

  const exportarVagas = () => {
    alert('Exportando lista de vagas...');
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
    <div className={styles.vagasPage}>
      <DashboardHeader user={user} userType="admin" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Gestão de Vagas</h1>
              <p>Gerencie todas as vagas e candidatos recomendados da plataforma</p>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                onClick={exportarVagas}
                className="btn btn-secondary"
              >
                <Download size={16} />
                Exportar
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Briefcase size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{vagas.length}</h3>
                <p>Total de Vagas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{vagas.filter(v => v.status === 'ativa').length}</h3>
                <p>Vagas Ativas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{vagas.reduce((acc, v) => acc + v.totalCandidatos, 0)}</h3>
                <p>Total de Candidatos</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Star size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{vagas.reduce((acc, v) => acc + v.candidatosRecomendados.length, 0)}</h3>
                <p>Candidatos Recomendados</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por título, empresa ou localização..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className={styles.filters}>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="todas">Todos os Status</option>
                <option value="ativa">Ativas</option>
                <option value="pausada">Pausadas</option>
                <option value="fechada">Fechadas</option>
                <option value="rascunho">Rascunhos</option>
              </select>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="todos">Todos os Tipos</option>
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="Freelance">Freelance</option>
                <option value="Estágio">Estágio</option>
              </select>
            </div>
          </div>

          {/* Vagas Table */}
          <div className={styles.tableSection}>
            <div className={styles.tableContainer}>
              <table className={styles.vagasTable}>
                <thead>
                  <tr>
                    <th>Vaga</th>
                    <th>Status</th>
                    <th>Candidatos</th>
                    <th>Recomendados</th>
                    <th>Salário</th>
                    <th>Publicação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vagasFiltradas.map((vaga) => (
                    <tr key={vaga.id}>
                      <td>
                        <div className={styles.vagaInfo}>
                          <img src={vaga.empresa.logo} alt={vaga.empresa.nome} />
                          <div className={styles.vagaDetails}>
                            <h4>{vaga.titulo}</h4>
                            <p>{vaga.empresa.nome}</p>
                            <span className={styles.vagaLocation}>
                              <MapPin size={12} />
                              {vaga.localizacao} • {vaga.modalidade}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={`${styles.statusBadge} ${styles[getStatusColor(vaga.status)]}`}>
                          {getStatusIcon(vaga.status)}
                          <span>{vaga.status}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.candidatosInfo}>
                          <span className={styles.candidatosCount}>{vaga.totalCandidatos}</span>
                          <span className={styles.candidatosLabel}>candidatos</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.recomendadosInfo}>
                          <span className={styles.recomendadosCount}>{vaga.candidatosRecomendados.length}</span>
                          <button 
                            onClick={() => handleViewCandidates(vaga)}
                            className={styles.viewCandidatesBtn}
                          >
                            Ver candidatos
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className={styles.salarioInfo}>
                          <span className={styles.salarioRange}>
                            {vaga.salario.moeda} {vaga.salario.min.toLocaleString()} - {vaga.salario.max.toLocaleString()}
                          </span>
                          <span className={styles.salarioTipo}>{vaga.tipo}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {new Date(vaga.dataPublicacao).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => handleViewVaga(vaga)}
                            className={styles.actionBtn}
                            title="Visualizar"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleViewCandidates(vaga)}
                            className={styles.actionBtn}
                            title="Ver Candidatos"
                          >
                            <Users size={16} />
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${styles.danger}`}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {vagasFiltradas.length === 0 && (
              <div className={styles.emptyState}>
                <Briefcase size={48} />
                <h3>Nenhuma vaga encontrada</h3>
                <p>Tente ajustar os filtros de busca.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && vagaSelecionada && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>
                {modalType === 'view' && 'Detalhes da Vaga'}
                {modalType === 'candidates' && 'Candidatos Recomendados'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {modalType === 'view' && (
                <div className={styles.vagaDetails}>
                  <div className={styles.vagaHeader}>
                    <img src={vagaSelecionada.empresa.logo} alt={vagaSelecionada.empresa.nome} />
                    <div>
                      <h3>{vagaSelecionada.titulo}</h3>
                      <p>{vagaSelecionada.empresa.nome}</p>
                      <div className={`${styles.statusBadge} ${styles[getStatusColor(vagaSelecionada.status)]}`}>
                        {getStatusIcon(vagaSelecionada.status)}
                        <span>{vagaSelecionada.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.vagaInfoGrid}>
                    <div className={styles.infoItem}>
                      <MapPin size={16} />
                      <div>
                        <span className={styles.infoLabel}>Localização</span>
                        <span className={styles.infoValue}>{vagaSelecionada.localizacao}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <DollarSign size={16} />
                      <div>
                        <span className={styles.infoLabel}>Salário</span>
                        <span className={styles.infoValue}>
                          {vagaSelecionada.salario.moeda} {vagaSelecionada.salario.min.toLocaleString()} - {vagaSelecionada.salario.max.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <Briefcase size={16} />
                      <div>
                        <span className={styles.infoLabel}>Tipo</span>
                        <span className={styles.infoValue}>{vagaSelecionada.tipo}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <Users size={16} />
                      <div>
                        <span className={styles.infoLabel}>Candidatos</span>
                        <span className={styles.infoValue}>{vagaSelecionada.totalCandidatos}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.vagaDescription}>
                    <h4>Descrição</h4>
                    <p>{vagaSelecionada.descricao}</p>
                  </div>

                  <div className={styles.vagaRequirements}>
                    <h4>Requisitos</h4>
                    <ul>
                      {vagaSelecionada.requisitos.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {modalType === 'candidates' && (
                <div className={styles.candidatesList}>
                  {vagaSelecionada.candidatosRecomendados.map((candidato) => (
                    <div key={candidato.id} className={styles.candidateCard}>
                      <div className={styles.candidateHeader}>
                        <img src={candidato.avatar} alt={candidato.nome} />
                        <div className={styles.candidateInfo}>
                          <h4>{candidato.nome}</h4>
                          <p>{candidato.cargo}</p>
                          <span className={styles.candidateLocation}>
                            <MapPin size={12} />
                            {candidato.localizacao}
                          </span>
                        </div>
                        <div className={styles.candidateCompatibility}>
                          <div className={styles.compatibilityScore}>
                            <Star size={16} />
                            <span>{candidato.compatibilidade}%</span>
                          </div>
                          <div className={`${styles.candidateStatus} ${styles[getCandidateStatusColor(candidato.status)]}`}>
                            {getCandidateStatusIcon(candidato.status)}
                            <span>{candidato.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.candidateDetails}>
                        <div className={styles.candidateContact}>
                          <span><Mail size={14} /> {candidato.email}</span>
                          <span><Phone size={14} /> {candidato.telefone}</span>
                        </div>
                        <div className={styles.candidateExperience}>
                          <span>Experiência: {candidato.experiencia}</span>
                          <span>Aplicação: {new Date(candidato.dataAplicacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      <div className={styles.candidateActions}>
                        <button className={`${styles.actionButton} ${styles.approve}`}>
                          <UserCheck size={16} />
                          Aprovar
                        </button>
                        <button className={styles.actionButton}>
                          <Eye size={16} />
                          Ver Perfil
                        </button>
                        <button className={styles.actionButton}>
                          <Mail size={16} />
                          Contatar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button 
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 