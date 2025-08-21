'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { ApiService } from '@/lib/api';
import { GrOrganization, GrSearch, GrFilter, GrAdd, GrEdit, GrTrash, GrView, GrStatusGood, GrStatusCritical, GrClock, GrStatusWarning, GrLocation, GrGroup, GrBriefcase, GrGlobe, GrMail, GrPhone, GrCalendar, GrStar, GrDownload, GrClose, GrCheckbox } from 'react-icons/gr';
import styles from './empresas.module.css';

interface Empresa {
  _id: string;
  name: string;
  email: string;
  cnpj?: string;
  registrationNumber?: string;
  status: 'pending' | 'active' | 'inactive' | 'suspended' | 'rejected';
  createdAt: string;
  lastLogin?: string;
  phone?: string;
  address: {
    city: string;
    state: string;
    country: string;
    street: string;
  };
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  logo?: string;
  totalJobs: number;
  activeJobs: number;
  totalHires: number;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  verificationDate?: string;
  plan: {
    type: 'basic' | 'premium' | 'enterprise';
    isActive: boolean;
    maxJobs: number;
  };
  primaryContact: {
    name: string;
    position: string;
    email: string;
    phone?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Função para carregar empresas do banco de dados
  const loadEmpresas = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams: any = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (filtroStatus !== 'todas') {
        queryParams.status = filtroStatus;
      }
      
      if (filtroTamanho !== 'todos') {
        queryParams.size = filtroTamanho;
      }
      
      if (busca.trim()) {
        queryParams.search = busca.trim();
      }
      
      const response = await ApiService.getCompanies(queryParams) as any;
      
      if (response.success) {
        setEmpresas(response.data || []);
        setPagination({
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 10,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 0
        });
      } else {
        setError('Erro ao carregar empresas');
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filtroStatus, filtroTamanho, busca]);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
  }, [router]);
  
  useEffect(() => {
    if (user) {
      loadEmpresas();
    }
  }, [user, loadEmpresas]);

  // Empresas já são filtradas pelo backend, mas aplicamos filtros locais se necessário
  const empresasFiltradas = empresas;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'pending': return 'yellow';
      case 'rejected': return 'red';
      case 'suspended': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <GrStatusGood size={14} />;
      case 'inactive': return <GrStatusCritical size={14} />;
      case 'pending': return <GrClock size={14} />;
      case 'rejected': return <GrStatusWarning size={14} />;
      case 'suspended': return <GrStatusWarning size={14} />;
      default: return <GrStatusCritical size={14} />;
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'inactive': return 'Inativa';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitada';
      case 'suspended': return 'Suspensa';
      default: return status;
    }
  };

  const getSizeDisplayName = (size: string) => {
    switch (size) {
      case 'startup': return 'Startup';
      case 'small': return 'Pequena';
      case 'medium': return 'Média';
      case 'large': return 'Grande';
      case 'enterprise': return 'Enterprise';
      default: return size;
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

  const handleStatusChange = async (empresaId: string, novoStatus: string) => {
    try {
      const response = await ApiService.updateCompany(empresaId, {
        status: novoStatus,
        ...(novoStatus === 'active' && { isVerified: true, verificationDate: new Date().toISOString() })
      }) as any;
      
      if (response.success) {
        loadEmpresas();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const confirmDeleteEmpresa = async (empresa: Empresa) => {
    try {
      const response = await ApiService.deleteCompany(empresa._id) as any;
      
      if (response.success) {
        loadEmpresas();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
    }
  };

  const exportarEmpresas = () => {
    alert('Exportando lista de empresas...');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <GrStar 
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
                <GrDownload size={16} />
                Exportar
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrOrganization size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{empresas.length}</h3>
                <p>Total de Empresas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{empresas.filter(e => e.status === 'active').length}</h3>
                <p>Ativas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{empresas.filter(e => e.status === 'pending').length}</h3>
                <p>Pendentes</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrBriefcase size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{empresas.reduce((acc, e) => acc + e.totalJobs, 0)}</h3>
                <p>Vagas Publicadas</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <GrSearch size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou setor..."
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
                <option value="rejeitada">Reprovadas</option>
              </select>

              <select
                value={filtroTamanho}
                onChange={(e) => setFiltroTamanho(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="todos">Todos os Portes</option>
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
                    <th>Porte</th>
                    <th>Vagas</th>
                    <th>Total de Contratações</th>
                    <th>Avaliação</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {empresasFiltradas.map((empresa) => (
                    <tr key={empresa._id}>
                      <td>
                        <div className={styles.empresaInfo}>
                          <img src={empresa.logo || '/default-company-logo.png'} alt={empresa.name} />
                          <div className={styles.empresaDetails}>
                            <h4>{empresa.name}</h4>
                            <p>{empresa.email}</p>
                            <span className={styles.empresaLocation}>
                              <GrLocation size={12} />
                              {empresa.address?.city}, {empresa.address?.country}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={`${styles.statusBadge} ${styles[getStatusColor(empresa.status)]}`}>
                          {getStatusIcon(empresa.status)}
                          <span>{getStatusDisplayName(empresa.status)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.setorText}>{empresa.industry}</span>
                      </td>
                      <td>
                        <span className={styles.tamanhoText}>{getSizeDisplayName(empresa.size)}</span>
                      </td>
                      <td>
                        <div className={styles.vagasInfo}>
                          <span className={styles.vagasCount}>{empresa.totalJobs}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.contratacoesInfo}>
                          <span className={styles.contratacoesCount}>{empresa.totalHires}</span>
                          <span className={styles.contratacoesLabel}>contratações</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.avaliacaoInfo}>
                          <div className={styles.stars}>
                            {renderStars(empresa.averageRating)}
                          </div>
                          <span className={styles.avaliacaoNumero}>
                            {empresa.averageRating > 0 ? empresa.averageRating.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {new Date(empresa.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => handleViewEmpresa(empresa)}
                            className={styles.actionBtn}
                            title="Visualizar"
                          >
                            <GrView size={16} />
                          </button>
                          
                          {empresa.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApproveEmpresa(empresa)}
                                className={`${styles.actionBtn} ${styles.success}`}
                                title="Aprovar"
                              >
                                <GrCheckbox size={16} />
                              </button>
                              <button 
                                onClick={() => handleRejectEmpresa(empresa)}
                                className={`${styles.actionBtn} ${styles.danger}`}
                                title="Rejeitar"
                              >
                                <GrStatusCritical size={16} />
                              </button>
                            </>
                          )}
                          
                          <button 
                            onClick={() => handleDeleteEmpresa(empresa)}
                            className={`${styles.actionBtn} ${styles.danger}`}
                            title="Excluir"
                          >
                            <GrTrash size={16} />
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
                <GrOrganization size={48} />
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
                <GrClose size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {modalType === 'view' && (
                <div className={styles.empresaDetails}>
                  <div className={styles.empresaHeader}>
                    <img src={empresaSelecionada.logo || '/default-company-logo.png'} alt={empresaSelecionada.name} />
                    <div>
                      <h3>{empresaSelecionada.name}</h3>
                      <p>{empresaSelecionada.email}</p>
                      <div className={`${styles.statusBadge} ${styles[getStatusColor(empresaSelecionada.status)]}`}>
                        {getStatusIcon(empresaSelecionada.status)}
                        <span>{empresaSelecionada.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.empresaInfoGrid}>
                    <div className={styles.infoItem}>
                      <GrOrganization size={16} />
                      <div>
                        <span className={styles.infoLabel}>Business ID</span>
                        <span className={styles.infoValue}>{empresaSelecionada.cnpj}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrPhone size={16} />
                      <div>
                        <span className={styles.infoLabel}>Telefone</span>
                        <span className={styles.infoValue}>{empresaSelecionada.phone || 'Não informado'}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrLocation size={16} />
                      <div>
                        <span className={styles.infoLabel}>Localização</span>
                        <span className={styles.infoValue}>{empresaSelecionada.address?.city}, {empresaSelecionada.address?.country}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrBriefcase size={16} />
                      <div>
                        <span className={styles.infoLabel}>Setor</span>
                        <span className={styles.infoValue}>{empresaSelecionada.industry}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrGroup size={16} />
                      <div>
                        <span className={styles.infoLabel}>Porte</span>
                        <span className={styles.infoValue}>{getSizeDisplayName(empresaSelecionada.size)}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrGlobe size={16} />
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
                        <h5>{empresaSelecionada.primaryContact.name}</h5>
                        <p>{empresaSelecionada.primaryContact.position}</p>
                        <span>{empresaSelecionada.primaryContact.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'approve' && (
                <div className={styles.confirmationContent}>
                  <div className={styles.confirmationIcon}>
                    <GrStatusGood size={48} />
                  </div>
                  <h3>Aprovar empresa {empresaSelecionada.name}?</h3>
                  <p>
                    A empresa será ativada e poderá começar a publicar vagas na plataforma.
                  </p>
                </div>
              )}

              {modalType === 'reject' && (
                <div className={styles.confirmationContent}>
                  <div className={styles.warningIcon}>
                                            <GrStatusCritical size={48} />
                  </div>
                  <h3>Rejeitar empresa {empresaSelecionada.name}?</h3>
                  <p>
                    A empresa será rejeitada e não poderá acessar a plataforma.
                  </p>
                </div>
              )}

              {modalType === 'delete' && (
                <div className={styles.confirmationContent}>
                  <div className={styles.dangerIcon}>
                    <GrStatusWarning size={48} />
                  </div>
                  <h3>Excluir empresa {empresaSelecionada.name}?</h3>
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
                  onClick={() => handleStatusChange(empresaSelecionada._id, 'active')}
                  className="btn btn-success"
                >
                  <GrCheckbox size={16} />
                  Aprovar Empresa
                </button>
              )}
              
              {modalType === 'reject' && (
                <button 
                  onClick={() => handleStatusChange(empresaSelecionada._id, 'rejected')}
                  className="btn btn-warning"
                >
                                                <GrStatusCritical size={16} />
                  Rejeitar Empresa
                </button>
              )}
              
              {modalType === 'delete' && (
                <button 
                  onClick={() => confirmDeleteEmpresa(empresaSelecionada)}
                  className="btn btn-danger"
                >
                  <GrTrash size={16} />
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