'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  Building2,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Users,
  Briefcase,
  Globe,
  Mail,
  Phone,
  Calendar,
  Star,
  Download,
  X,
  Check,
  Ban
} from 'lucide-react';
import styles from './empresas.module.css';

interface Empresa {
  id: string;
  nome: string;
  email: string;
  cnpj: string;
  status: 'ativa' | 'inativa' | 'pendente' | 'rejeitada';
  dataCadastro: string;
  ultimoAcesso: string;
  telefone?: string;
  localizacao: string;
  setor: string;
  tamanho: 'startup' | 'pequena' | 'media' | 'grande';
  website?: string;
  logo?: string;
  vagasPublicadas: number;
  candidatosContratados: number;
  avaliacaoMedia: number;
  responsavel: {
    nome: string;
    cargo: string;
    email: string;
  };
}

export default function AdminEmpresasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [filtroTamanho, setFiltroTamanho] = useState('todos');
  const [busca, setBusca] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'approve' | 'reject' | 'delete'>('view');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadEmpresas();
    setLoading(false);
  }, [router]);

  const loadEmpresas = () => {
    // Dados simulados de empresas
    const empresasSimuladas: Empresa[] = [
      {
        id: '1',
        nome: 'TechCorp Dubai',
        email: 'contato@techcorp.ae',
        cnpj: '12.345.678/0001-90',
        status: 'ativa',
        dataCadastro: '2024-01-10',
        ultimoAcesso: '2024-06-13',
        telefone: '+971 50 123-4567',
        localizacao: 'Dubai, UAE',
        setor: 'Tecnologia',
        tamanho: 'media',
        website: 'https://techcorp.ae',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop',
        vagasPublicadas: 15,
        candidatosContratados: 8,
        avaliacaoMedia: 4.5,
        responsavel: {
          nome: 'Maria Santos',
          cargo: 'Recrutadora Sênior',
          email: 'maria.santos@techcorp.ae'
        }
      },
      {
        id: '2',
        nome: 'Innovation Hub',
        email: 'rh@innovhub.ae',
        cnpj: '98.765.432/0001-10',
        status: 'ativa',
        dataCadastro: '2024-02-20',
        ultimoAcesso: '2024-06-11',
        telefone: '+971 55 987-6543',
        localizacao: 'Abu Dhabi, UAE',
        setor: 'Consultoria',
        tamanho: 'grande',
        website: 'https://innovhub.ae',
        logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=60&h=60&fit=crop',
        vagasPublicadas: 32,
        candidatosContratados: 18,
        avaliacaoMedia: 4.8,
        responsavel: {
          nome: 'Ana Costa',
          cargo: 'HR Manager',
          email: 'ana.costa@innovhub.ae'
        }
      },
      {
        id: '3',
        nome: 'StartupXYZ',
        email: 'team@startupxyz.ae',
        cnpj: '11.222.333/0001-44',
        status: 'pendente',
        dataCadastro: '2024-06-10',
        ultimoAcesso: '2024-06-12',
        telefone: '+971 52 456-7890',
        localizacao: 'Sharjah, UAE',
        setor: 'Fintech',
        tamanho: 'startup',
        website: 'https://startupxyz.ae',
        logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=60&h=60&fit=crop',
        vagasPublicadas: 3,
        candidatosContratados: 0,
        avaliacaoMedia: 0,
        responsavel: {
          nome: 'Carlos Silva',
          cargo: 'Founder & CEO',
          email: 'carlos@startupxyz.ae'
        }
      },
      {
        id: '4',
        nome: 'Global Solutions',
        email: 'hr@globalsolutions.ae',
        cnpj: '55.666.777/0001-88',
        status: 'inativa',
        dataCadastro: '2024-03-15',
        ultimoAcesso: '2024-05-20',
        telefone: '+971 50 111-2222',
        localizacao: 'Dubai, UAE',
        setor: 'Logística',
        tamanho: 'grande',
        website: 'https://globalsolutions.ae',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=60&h=60&fit=crop',
        vagasPublicadas: 8,
        candidatosContratados: 3,
        avaliacaoMedia: 3.2,
        responsavel: {
          nome: 'Roberto Lima',
          cargo: 'HR Director',
          email: 'roberto@globalsolutions.ae'
        }
      },
      {
        id: '5',
        nome: 'HealthTech Solutions',
        email: 'contact@healthtech.ae',
        cnpj: '99.888.777/0001-66',
        status: 'rejeitada',
        dataCadastro: '2024-05-05',
        ultimoAcesso: '2024-05-06',
        telefone: '+971 54 333-4444',
        localizacao: 'Dubai, UAE',
        setor: 'Saúde',
        tamanho: 'pequena',
        website: 'https://healthtech.ae',
        logo: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=60&h=60&fit=crop',
        vagasPublicadas: 0,
        candidatosContratados: 0,
        avaliacaoMedia: 0,
        responsavel: {
          nome: 'Dra. Fernanda Costa',
          cargo: 'CTO',
          email: 'fernanda@healthtech.ae'
        }
      }
    ];

    setEmpresas(empresasSimuladas);
  };

  const empresasFiltradas = empresas.filter(empresa => {
    const matchStatus = filtroStatus === 'todas' || empresa.status === filtroStatus;
    const matchTamanho = filtroTamanho === 'todos' || empresa.tamanho === filtroTamanho;
    const matchBusca = busca === '' || 
      empresa.nome.toLowerCase().includes(busca.toLowerCase()) ||
      empresa.email.toLowerCase().includes(busca.toLowerCase()) ||
      empresa.setor.toLowerCase().includes(busca.toLowerCase());
    
    return matchStatus && matchTamanho && matchBusca;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'green';
      case 'inativa': return 'gray';
      case 'pendente': return 'yellow';
      case 'rejeitada': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativa': return <CheckCircle size={14} />;
      case 'inativa': return <XCircle size={14} />;
      case 'pendente': return <Clock size={14} />;
      case 'rejeitada': return <AlertTriangle size={14} />;
      default: return <XCircle size={14} />;
    }
  };

  const getTamanhoLabel = (tamanho: string) => {
    switch (tamanho) {
      case 'startup': return 'Startup';
      case 'pequena': return 'Pequena';
      case 'media': return 'Média';
      case 'grande': return 'Grande';
      default: return tamanho;
    }
  };

  const handleViewEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setModalType('view');
    setShowModal(true);
  };

  const handleApproveEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setModalType('approve');
    setShowModal(true);
  };

  const handleRejectEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setModalType('reject');
    setShowModal(true);
  };

  const handleDeleteEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setModalType('delete');
    setShowModal(true);
  };

  const handleStatusChange = (empresaId: string, novoStatus: string) => {
    setEmpresas(prev => 
      prev.map(e => e.id === empresaId ? { ...e, status: novoStatus as any } : e)
    );
    setShowModal(false);
  };

  const exportarEmpresas = () => {
    alert('Exportando lista de empresas...');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={12} 
        className={i < rating ? styles.starFilled : styles.starEmpty}
      />
    ));
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
    <div className={styles.empresasPage}>
      <DashboardHeader user={user} userType="admin" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Gestão de Empresas</h1>
              <p>Gerencie todas as empresas cadastradas na plataforma</p>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                onClick={exportarEmpresas}
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
                <Building2 size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{empresas.length}</h3>
                <p>Total de Empresas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{empresas.filter(e => e.status === 'ativa').length}</h3>
                <p>Ativas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Clock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{empresas.filter(e => e.status === 'pendente').length}</h3>
                <p>Pendentes</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Briefcase size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{empresas.reduce((acc, e) => acc + e.vagasPublicadas, 0)}</h3>
                <p>Vagas Publicadas</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, email ou setor..."
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
                <option value="inativa">Inativas</option>
                <option value="pendente">Pendentes</option>
                <option value="rejeitada">Rejeitadas</option>
              </select>

              <select
                value={filtroTamanho}
                onChange={(e) => setFiltroTamanho(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="todos">Todos os Tamanhos</option>
                <option value="startup">Startup</option>
                <option value="pequena">Pequena</option>
                <option value="media">Média</option>
                <option value="grande">Grande</option>
              </select>
            </div>
          </div>

          {/* Companies Table */}
          <div className={styles.tableSection}>
            <div className={styles.tableContainer}>
              <table className={styles.empresasTable}>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Status</th>
                    <th>Setor</th>
                    <th>Tamanho</th>
                    <th>Vagas</th>
                    <th>Avaliação</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {empresasFiltradas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td>
                        <div className={styles.empresaInfo}>
                          <img src={empresa.logo} alt={empresa.nome} />
                          <div className={styles.empresaDetails}>
                            <h4>{empresa.nome}</h4>
                            <p>{empresa.email}</p>
                            <span className={styles.empresaLocation}>
                              <MapPin size={12} />
                              {empresa.localizacao}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={`${styles.statusBadge} ${styles[getStatusColor(empresa.status)]}`}>
                          {getStatusIcon(empresa.status)}
                          <span>{empresa.status}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.setorText}>{empresa.setor}</span>
                      </td>
                      <td>
                        <span className={styles.tamanhoText}>{getTamanhoLabel(empresa.tamanho)}</span>
                      </td>
                      <td>
                        <div className={styles.vagasInfo}>
                          <span className={styles.vagasCount}>{empresa.vagasPublicadas}</span>
                          <span className={styles.contratacoes}>
                            {empresa.candidatosContratados} contratações
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.avaliacaoInfo}>
                          <div className={styles.stars}>
                            {renderStars(empresa.avaliacaoMedia)}
                          </div>
                          <span className={styles.avaliacaoNumero}>
                            {empresa.avaliacaoMedia > 0 ? empresa.avaliacaoMedia.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {new Date(empresa.dataCadastro).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => handleViewEmpresa(empresa)}
                            className={styles.actionBtn}
                            title="Visualizar"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {empresa.status === 'pendente' && (
                            <>
                              <button 
                                onClick={() => handleApproveEmpresa(empresa)}
                                className={`${styles.actionBtn} ${styles.success}`}
                                title="Aprovar"
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                onClick={() => handleRejectEmpresa(empresa)}
                                className={`${styles.actionBtn} ${styles.danger}`}
                                title="Rejeitar"
                              >
                                <Ban size={16} />
                              </button>
                            </>
                          )}
                          
                          <button 
                            onClick={() => handleDeleteEmpresa(empresa)}
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

            {empresasFiltradas.length === 0 && (
              <div className={styles.emptyState}>
                <Building2 size={48} />
                <h3>Nenhuma empresa encontrada</h3>
                <p>Tente ajustar os filtros de busca.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && empresaSelecionada && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>
                {modalType === 'view' && 'Detalhes da Empresa'}
                {modalType === 'approve' && 'Aprovar Empresa'}
                {modalType === 'reject' && 'Rejeitar Empresa'}
                {modalType === 'delete' && 'Confirmar Exclusão'}
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
                <div className={styles.empresaDetails}>
                  <div className={styles.empresaHeader}>
                    <img src={empresaSelecionada.logo} alt={empresaSelecionada.nome} />
                    <div>
                      <h3>{empresaSelecionada.nome}</h3>
                      <p>{empresaSelecionada.email}</p>
                      <div className={`${styles.statusBadge} ${styles[getStatusColor(empresaSelecionada.status)]}`}>
                        {getStatusIcon(empresaSelecionada.status)}
                        <span>{empresaSelecionada.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.empresaInfoGrid}>
                    <div className={styles.infoItem}>
                      <Building2 size={16} />
                      <div>
                        <span className={styles.infoLabel}>CNPJ</span>
                        <span className={styles.infoValue}>{empresaSelecionada.cnpj}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <Phone size={16} />
                      <div>
                        <span className={styles.infoLabel}>Telefone</span>
                        <span className={styles.infoValue}>{empresaSelecionada.telefone}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <MapPin size={16} />
                      <div>
                        <span className={styles.infoLabel}>Localização</span>
                        <span className={styles.infoValue}>{empresaSelecionada.localizacao}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <Briefcase size={16} />
                      <div>
                        <span className={styles.infoLabel}>Setor</span>
                        <span className={styles.infoValue}>{empresaSelecionada.setor}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <Users size={16} />
                      <div>
                        <span className={styles.infoLabel}>Tamanho</span>
                        <span className={styles.infoValue}>{getTamanhoLabel(empresaSelecionada.tamanho)}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <Globe size={16} />
                      <div>
                        <span className={styles.infoLabel}>Website</span>
                        <span className={styles.infoValue}>{empresaSelecionada.website}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.responsavelInfo}>
                    <h4>Responsável</h4>
                    <div className={styles.responsavelCard}>
                      <div className={styles.responsavelDetails}>
                        <h5>{empresaSelecionada.responsavel.nome}</h5>
                        <p>{empresaSelecionada.responsavel.cargo}</p>
                        <span>{empresaSelecionada.responsavel.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'approve' && (
                <div className={styles.confirmationContent}>
                  <div className={styles.confirmationIcon}>
                    <CheckCircle size={48} />
                  </div>
                  <h3>Aprovar empresa {empresaSelecionada.nome}?</h3>
                  <p>
                    A empresa será ativada e poderá começar a publicar vagas na plataforma.
                  </p>
                </div>
              )}

              {modalType === 'reject' && (
                <div className={styles.confirmationContent}>
                  <div className={styles.warningIcon}>
                    <Ban size={48} />
                  </div>
                  <h3>Rejeitar empresa {empresaSelecionada.nome}?</h3>
                  <p>
                    A empresa será rejeitada e não poderá acessar a plataforma.
                  </p>
                </div>
              )}

              {modalType === 'delete' && (
                <div className={styles.confirmationContent}>
                  <div className={styles.dangerIcon}>
                    <AlertTriangle size={48} />
                  </div>
                  <h3>Excluir empresa {empresaSelecionada.nome}?</h3>
                  <p>
                    Esta ação não pode ser desfeita. Todos os dados da empresa serão 
                    permanentemente removidos do sistema.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button 
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              
              {modalType === 'approve' && (
                <button 
                  onClick={() => handleStatusChange(empresaSelecionada.id, 'ativa')}
                  className="btn btn-success"
                >
                  <Check size={16} />
                  Aprovar Empresa
                </button>
              )}
              
              {modalType === 'reject' && (
                <button 
                  onClick={() => handleStatusChange(empresaSelecionada.id, 'rejeitada')}
                  className="btn btn-warning"
                >
                  <Ban size={16} />
                  Rejeitar Empresa
                </button>
              )}
              
              {modalType === 'delete' && (
                <button 
                  onClick={() => {
                    setEmpresas(prev => prev.filter(e => e.id !== empresaSelecionada?.id));
                    setShowModal(false);
                  }}
                  className="btn btn-danger"
                >
                  <Trash2 size={16} />
                  Confirmar Exclusão
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 