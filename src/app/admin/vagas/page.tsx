'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { GrBriefcase, GrSearch, GrFilter, GrAdd, GrEdit, GrTrash, GrView, GrMail, GrPhone, GrCalendar, GrLocation, GrGlobe, GrOrganization, GrDownload, GrUpload, GrMore, GrStatusGood, GrStatusCritical, GrClock, GrStatusWarning, GrClose, GrUser, GrStar, GrBriefcase as GrJob, GrMoney, GrSchedule } from 'react-icons/gr';
import styles from './vagas.module.css';

interface Vaga {
  _id: string;
  title: string;
  description: string;
  summary: string;
  companyId: {
    _id: string;
    name: string;
    industry: string;
    logo?: string;
  };
  category: string;
  location: {
    city?: string;
    state?: string;
    country?: string;
    remote?: boolean;
  };
  workType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  workSchedule: 'flexible' | 'fixed' | 'hybrid';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: {
    skills: string[];
    education: string;
    experience: string;
  };
  tags: string[];
  status: 'active' | 'inactive' | 'draft' | 'closed' | 'expired';
  publishedAt: string;
  expiresAt: string;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Empresa {
  _id: string;
  name: string;
  industry: string;
}

export default function AdminVagasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [filtroCategoria, setFiltroCategoria] = useState('all');
  const [filtroEmpresa, setFiltroEmpresa] = useState('all');
  const [busca, setBusca] = useState('');
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create' | 'delete'>('view');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    summary: '',
    companyId: '',
    category: '',
    location: { city: '', state: '', country: '', remote: false },
    workType: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance',
    workSchedule: 'flexible' as 'flexible' | 'fixed' | 'hybrid',
    salary: { min: 0, max: 0, currency: 'BRL' },
    requirements: { skills: [] as string[], education: '', experience: '' },
    tags: [] as string[],
    status: 'active' as 'active' | 'inactive' | 'draft' | 'closed' | 'expired',
    expiresAt: ''
  });

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadVagas();
    loadEmpresas();
  }, [router, currentPage, filtroStatus, filtroCategoria, filtroEmpresa, busca]);

  const loadVagas = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filtroStatus !== 'all' && { status: filtroStatus }),
        ...(filtroCategoria !== 'all' && { category: filtroCategoria }),
        ...(filtroEmpresa !== 'all' && { companyId: filtroEmpresa }),
        ...(busca && { search: busca })
      });

      const response = await fetch(`/api/admin/jobs?${params}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVagas(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Erro ao carregar vagas');
      }
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filtroStatus, filtroCategoria, filtroEmpresa, busca]);

  const loadEmpresas = async () => {
    try {
      const response = await fetch('/api/admin/companies?limit=100', {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmpresas(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const handleCreateVaga = async () => {
    try {
      setActionLoading('create');
      
      const response = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadVagas();
        setShowModal(false);
        resetFormData();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao criar vaga');
      }
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
      alert('Erro ao criar vaga');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateVaga = async () => {
    if (!vagaSelecionada) return;
    
    try {
      setActionLoading('update');
      
      const response = await fetch(`/api/admin/jobs/${vagaSelecionada._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadVagas();
        setShowModal(false);
        resetFormData();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao atualizar vaga');
      }
    } catch (error) {
      console.error('Erro ao atualizar vaga:', error);
      alert('Erro ao atualizar vaga');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteVaga = async () => {
    if (!vagaSelecionada) return;
    
    try {
      setActionLoading('delete');
      
      const response = await fetch(`/api/admin/jobs/${vagaSelecionada._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        await loadVagas();
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao deletar vaga');
      }
    } catch (error) {
      console.error('Erro ao deletar vaga:', error);
      alert('Erro ao deletar vaga');
    } finally {
      setActionLoading(null);
    }
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      description: '',
      summary: '',
      companyId: '',
      category: '',
      location: { city: '', state: '', country: '', remote: false },
      workType: 'full-time',
      workSchedule: 'flexible',
      salary: { min: 0, max: 0, currency: 'BRL' },
      requirements: { skills: [], education: '', experience: '' },
      tags: [],
      status: 'active',
      expiresAt: ''
    });
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Ativa',
      inactive: 'Inativa',
      draft: 'Rascunho',
      closed: 'Fechada',
      expired: 'Expirada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'draft': return 'yellow';
      case 'closed': return 'red';
      case 'expired': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <GrStatusGood size={14} />;
      case 'inactive': return <GrStatusCritical size={14} />;
      case 'draft': return <GrClock size={14} />;
      case 'closed': return <GrStatusWarning size={14} />;
      case 'expired': return <GrStatusWarning size={14} />;
      default: return <GrStatusCritical size={14} />;
    }
  };

  const getWorkTypeLabel = (workType: string) => {
    const labels = {
      'full-time': 'Tempo Integral',
      'part-time': 'Meio Período',
      'contract': 'Contrato',
      'internship': 'Estágio',
      'freelance': 'Freelance'
    };
    return labels[workType as keyof typeof labels] || workType;
  };

  const formatSalary = (salary: any) => {
    if (!salary || salary.min === 0) return 'A combinar';
    const min = salary.min.toLocaleString('pt-BR');
    const max = salary.max.toLocaleString('pt-BR');
    const currency = salary.currency === 'BRL' ? 'R$' : salary.currency;
    return `${currency} ${min} - ${currency} ${max}`;
  };

  const handleViewVaga = (vaga: Vaga) => {
    setVagaSelecionada(vaga);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditVaga = (vaga: Vaga) => {
    setVagaSelecionada(vaga);
    setFormData({
      title: vaga.title,
      description: vaga.description,
      summary: vaga.summary,
      companyId: vaga.companyId._id,
      category: vaga.category,
      location: {
        city: vaga.location.city || '',
        state: vaga.location.state || '',
        country: vaga.location.country || '',
        remote: vaga.location.remote || false
      },
      workType: vaga.workType,
      workSchedule: vaga.workSchedule,
      salary: vaga.salary,
      requirements: {
        skills: vaga.requirements.skills || [],
        education: vaga.requirements.education || '',
        experience: vaga.requirements.experience || ''
      },
      tags: vaga.tags || [],
      status: vaga.status,
      expiresAt: vaga.expiresAt ? new Date(vaga.expiresAt).toISOString().split('T')[0] : ''
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteVagaClick = (vaga: Vaga) => {
    setVagaSelecionada(vaga);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateVagaClick = () => {
    setVagaSelecionada(null);
    resetFormData();
    setModalType('create');
    setShowModal(true);
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
              <p>Gerencie todas as vagas publicadas na plataforma Leão Talent Bridge</p>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                onClick={handleCreateVagaClick}
                className="btn btn-primary"
              >
                <GrAdd size={16} />
                Nova Vaga
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrBriefcase size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{vagas.length}</h3>
                <p>Total de Vagas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{vagas.filter(v => v.status === 'active').length}</h3>
                <p>Vagas Ativas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{vagas.filter(v => v.status === 'draft').length}</h3>
                <p>Rascunhos</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrOrganization size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{new Set(vagas.map(v => v.companyId._id)).size}</h3>
                <p>Empresas</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <GrSearch size={20} />
              <input
                type="text"
                placeholder="Buscar por título, descrição ou empresa..."
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
                <option value="all">Todos os Status</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
                <option value="draft">Rascunhos</option>
                <option value="closed">Fechadas</option>
                <option value="expired">Expiradas</option>
              </select>

              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todas as Categorias</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="marketing">Marketing</option>
                <option value="vendas">Vendas</option>
                <option value="rh">Recursos Humanos</option>
                <option value="financeiro">Financeiro</option>
                <option value="operacoes">Operações</option>
              </select>

              <select
                value={filtroEmpresa}
                onChange={(e) => setFiltroEmpresa(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todas as Empresas</option>
                {empresas.map(empresa => (
                  <option key={empresa._id} value={empresa._id}>
                    {empresa.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Jobs Table */}
          <div className={styles.tableSection}>
            <div className={styles.tableContainer}>
              <table className={styles.jobsTable}>
                <thead>
                  <tr>
                    <th>Vaga</th>
                    <th>Empresa</th>
                    <th>Categoria</th>
                    <th>Localização</th>
                    <th>Tipo</th>
                    <th>Salário</th>
                    <th>Status</th>
                    <th>Candidaturas</th>
                    <th>Publicação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vagas.map((vaga) => (
                    <tr key={vaga._id}>
                      <td>
                        <div className={styles.jobInfo}>
                          <div className={styles.jobDetails}>
                            <h4>{vaga.title}</h4>
                            <p>{vaga.summary}</p>
                            <div className={styles.jobTags}>
                              {vaga.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className={styles.tag}>
                                  {tag}
                                </span>
                              ))}
                              {vaga.tags.length > 3 && (
                                <span className={styles.tagMore}>
                                  +{vaga.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.companyInfo}>
                          <img 
                            src={vaga.companyId.logo || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=face'} 
                            alt={vaga.companyId.name} 
                          />
                          <div>
                            <h5>{vaga.companyId.name}</h5>
                            <span>{vaga.companyId.industry}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.categoryBadge}>
                          {vaga.category}
                        </span>
                      </td>
                      <td>
                        <div className={styles.locationInfo}>
                          <GrLocation size={14} />
                          <span>
                            {vaga.location.remote ? 'Remoto' : 
                             vaga.location.city && vaga.location.state 
                               ? `${vaga.location.city}, ${vaga.location.state}`
                               : vaga.location.country || 'Não informado'
                            }
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.workTypeBadge}>
                          {getWorkTypeLabel(vaga.workType)}
                        </span>
                      </td>
                      <td>
                        <span className={styles.salaryText}>
                          {formatSalary(vaga.salary)}
                        </span>
                      </td>
                      <td>
                        <div className={`${styles.statusBadge} ${styles[getStatusColor(vaga.status)]}`}>
                          {getStatusIcon(vaga.status)}
                          <span>{getStatusLabel(vaga.status)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.applicationsCount}>
                          {vaga.applicationsCount || 0}
                        </span>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {new Date(vaga.publishedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => handleViewVaga(vaga)}
                            className={styles.actionBtn}
                            title="Visualizar"
                          >
                            <GrView size={16} />
                          </button>
                          <button 
                            onClick={() => handleEditVaga(vaga)}
                            className={styles.actionBtn}
                            title="Editar"
                          >
                            <GrEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteVagaClick(vaga)}
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

            {vagas.length === 0 && (
              <div className={styles.emptyState}>
                <GrBriefcase size={48} />
                <h3>Nenhuma vaga encontrada</h3>
                <p>Tente ajustar os filtros ou criar uma nova vaga.</p>
              </div>
            )}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={styles.paginationBtn}
              >
                Anterior
              </button>
              
              <span className={styles.pageInfo}>
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={styles.paginationBtn}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>
                {modalType === 'view' && 'Detalhes da Vaga'}
                {modalType === 'edit' && 'Editar Vaga'}
                {modalType === 'create' && 'Nova Vaga'}
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
              {modalType === 'view' && vagaSelecionada && (
                <div className={styles.jobDetails}>
                  <div className={styles.jobHeader}>
                    <div className={styles.jobTitleSection}>
                      <h3>{vagaSelecionada.title}</h3>
                      <div className={`${styles.statusBadge} ${styles[getStatusColor(vagaSelecionada.status)]}`}>
                        {getStatusIcon(vagaSelecionada.status)}
                        <span>{getStatusLabel(vagaSelecionada.status)}</span>
                      </div>
                    </div>
                    <div className={styles.companyInfo}>
                      <img 
                        src={vagaSelecionada.companyId.logo || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=face'} 
                        alt={vagaSelecionada.companyId.name} 
                      />
                      <div>
                        <h4>{vagaSelecionada.companyId.name}</h4>
                        <span>{vagaSelecionada.companyId.industry}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.jobInfoGrid}>
                    <div className={styles.infoItem}>
                      <GrBriefcase size={16} />
                      <div>
                        <span className={styles.infoLabel}>Categoria</span>
                        <span className={styles.infoValue}>{vagaSelecionada.category}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrLocation size={16} />
                      <div>
                        <span className={styles.infoLabel}>Localização</span>
                        <span className={styles.infoValue}>
                          {vagaSelecionada.location.remote ? 'Remoto' : 
                           vagaSelecionada.location.city && vagaSelecionada.location.state 
                             ? `${vagaSelecionada.location.city}, ${vagaSelecionada.location.state}`
                             : vagaSelecionada.location.country || 'Não informado'
                          }
                        </span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrSchedule size={16} />
                      <div>
                        <span className={styles.infoLabel}>Tipo de Trabalho</span>
                        <span className={styles.infoValue}>{getWorkTypeLabel(vagaSelecionada.workType)}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrMoney size={16} />
                      <div>
                        <span className={styles.infoLabel}>Salário</span>
                        <span className={styles.infoValue}>{formatSalary(vagaSelecionada.salary)}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrCalendar size={16} />
                      <div>
                        <span className={styles.infoLabel}>Data de Publicação</span>
                        <span className={styles.infoValue}>
                          {new Date(vagaSelecionada.publishedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrUser size={16} />
                      <div>
                        <span className={styles.infoLabel}>Candidaturas</span>
                        <span className={styles.infoValue}>{vagaSelecionada.applicationsCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.descriptionSection}>
                    <h4>Descrição</h4>
                    <p>{vagaSelecionada.description}</p>
                  </div>

                  {vagaSelecionada.requirements.skills.length > 0 && (
                    <div className={styles.requirementsSection}>
                      <h4>Habilidades Requeridas</h4>
                      <div className={styles.skillsList}>
                        {vagaSelecionada.requirements.skills.map((skill, index) => (
                          <span key={index} className={styles.skillTag}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {vagaSelecionada.tags.length > 0 && (
                    <div className={styles.tagsSection}>
                      <h4>Tags</h4>
                      <div className={styles.tagsList}>
                        {vagaSelecionada.tags.map((tag, index) => (
                          <span key={index} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(modalType === 'create' || modalType === 'edit') && (
                <div className={styles.formSection}>
                  <div className={styles.formGroup}>
                    <label>Título da Vaga</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Desenvolvedor Full Stack"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Resumo</label>
                    <input
                      type="text"
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="Breve descrição da vaga"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Descrição Completa</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição detalhada da vaga..."
                      rows={6}
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Empresa</label>
                      <select
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                      >
                        <option value="">Selecione uma empresa</option>
                        {empresas.map(empresa => (
                          <option key={empresa._id} value={empresa._id}>
                            {empresa.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label>Categoria</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="">Selecione uma categoria</option>
                        <option value="tecnologia">Tecnologia</option>
                        <option value="marketing">Marketing</option>
                        <option value="vendas">Vendas</option>
                        <option value="rh">Recursos Humanos</option>
                        <option value="financeiro">Financeiro</option>
                        <option value="operacoes">Operações</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Tipo de Trabalho</label>
                      <select
                        value={formData.workType}
                        onChange={(e) => setFormData({ ...formData, workType: e.target.value as any })}
                      >
                        <option value="full-time">Tempo Integral</option>
                        <option value="part-time">Meio Período</option>
                        <option value="contract">Contrato</option>
                        <option value="internship">Estágio</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      >
                        <option value="active">Ativa</option>
                        <option value="inactive">Inativa</option>
                        <option value="draft">Rascunho</option>
                        <option value="closed">Fechada</option>
                        <option value="expired">Expirada</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.locationSection}>
                    <h4>Localização</h4>
                    <div className={styles.locationGrid}>
                      <div className={styles.formGroup}>
                        <label>Cidade</label>
                        <input
                          type="text"
                          value={formData.location.city}
                          onChange={(e) => setFormData({
                            ...formData,
                            location: { ...formData.location, city: e.target.value }
                          })}
                          placeholder="Cidade"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Estado</label>
                        <input
                          type="text"
                          value={formData.location.state}
                          onChange={(e) => setFormData({
                            ...formData,
                            location: { ...formData.location, state: e.target.value }
                          })}
                          placeholder="Estado"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>País</label>
                        <input
                          type="text"
                          value={formData.location.country}
                          onChange={(e) => setFormData({
                            ...formData,
                            location: { ...formData.location, country: e.target.value }
                          })}
                          placeholder="País"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>
                          <input
                            type="checkbox"
                            checked={formData.location.remote}
                            onChange={(e) => setFormData({
                              ...formData,
                              location: { ...formData.location, remote: e.target.checked }
                            })}
                          />
                          Trabalho Remoto
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.salarySection}>
                    <h4>Salário</h4>
                    <div className={styles.salaryGrid}>
                      <div className={styles.formGroup}>
                        <label>Mínimo</label>
                        <input
                          type="number"
                          value={formData.salary.min}
                          onChange={(e) => setFormData({
                            ...formData,
                            salary: { ...formData.salary, min: parseInt(e.target.value) || 0 }
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Máximo</label>
                        <input
                          type="number"
                          value={formData.salary.max}
                          onChange={(e) => setFormData({
                            ...formData,
                            salary: { ...formData.salary, max: parseInt(e.target.value) || 0 }
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Moeda</label>
                        <select
                          value={formData.salary.currency}
                          onChange={(e) => setFormData({
                            ...formData,
                            salary: { ...formData.salary, currency: e.target.value }
                          })}
                        >
                          <option value="BRL">Real (R$)</option>
                          <option value="USD">Dólar ($)</option>
                          <option value="EUR">Euro (€)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Data de Expiração</label>
                    <input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {modalType === 'delete' && vagaSelecionada && (
                <div className={styles.deleteConfirmation}>
                  <div className={styles.warningIcon}>
                    <GrStatusWarning size={48} />
                  </div>
                  <h3>Tem certeza que deseja excluir esta vaga?</h3>
                  <p>
                    Esta ação não pode ser desfeita. A vaga <strong>{vagaSelecionada.title}</strong> será 
                    permanentemente removida do sistema.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button 
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                {modalType === 'delete' ? 'Cancelar' : 'Fechar'}
              </button>
              
              {modalType === 'create' && (
                <button 
                  onClick={handleCreateVaga}
                  className="btn btn-primary"
                  disabled={actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? 'Criando...' : 'Criar Vaga'}
                </button>
              )}
              
              {modalType === 'edit' && (
                <button 
                  onClick={handleUpdateVaga}
                  className="btn btn-primary"
                  disabled={actionLoading === 'update'}
                >
                  {actionLoading === 'update' ? 'Atualizando...' : 'Atualizar Vaga'}
                </button>
              )}
              
              {modalType === 'delete' && (
                <button 
                  onClick={handleDeleteVaga}
                  className="btn btn-danger"
                  disabled={actionLoading === 'delete'}
                >
                  {actionLoading === 'delete' ? 'Deletando...' : 'Confirmar Exclusão'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 