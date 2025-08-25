'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { GrUser, GrBriefcase, GrSearch, GrFilter, GrAdd, GrEdit, GrTrash, GrView, GrMail, GrPhone, GrCalendar, GrLocation, GrGlobe, GrOrganization, GrDownload, GrUpload, GrMore, GrStatusGood, GrStatusCritical, GrClock, GrStatusWarning, GrClose, GrStar, GrBriefcase as GrJob, GrMoney, GrSchedule, GrCheckmark, GrFormClose, GrFormCheckmark } from 'react-icons/gr';
import styles from './indicacoes.module.css';

interface Indicação {
  id: string;
  job: {
    id: string;
    title: string;
    category: string;
    location: {
      city?: string;
      state?: string;
      country?: string;
      remote?: boolean;
    };
    workType: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    status: string;
  };
  candidate: {
    id: string;
    name: string;
    email: string;
    profile: any;
  };
  company: {
    id: string;
    name: string;
    industry: string;
    logo?: string;
  };
  recommendedBy: {
    id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  recommendedAt: string;
  respondedAt?: string;
  adminNotes?: string;
  candidateNotes?: string;
  companyNotes?: string;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

interface Vaga {
  _id: string;
  title: string;
  category: string;
  companyId: {
    _id: string;
    name: string;
  };
}

interface Candidato {
  _id: string;
  name: string;
  email: string;
  profile: any;
}

export default function AdminIndicacoesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [indicacoes, setIndicacoes] = useState<Indicação[]>([]);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [filtroVaga, setFiltroVaga] = useState('all');
  const [filtroCandidato, setFiltroCandidato] = useState('all');
  const [filtroEmpresa, setFiltroEmpresa] = useState('all');
  const [busca, setBusca] = useState('');
  const [indicacaoSelecionada, setIndicacaoSelecionada] = useState<Indicação | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'create' | 'edit' | 'delete'>('view');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    jobId: '',
    candidateId: '',
    adminNotes: '',
    matchScore: 0
  });

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadIndicacoes();
    loadVagas();
    loadCandidatos();
  }, [router, currentPage, filtroStatus, filtroVaga, filtroCandidato, filtroEmpresa, busca]);

  const loadIndicacoes = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filtroStatus !== 'all' && { status: filtroStatus }),
        ...(filtroVaga !== 'all' && { jobId: filtroVaga }),
        ...(filtroCandidato !== 'all' && { candidateId: filtroCandidato }),
        ...(filtroEmpresa !== 'all' && { companyId: filtroEmpresa }),
        ...(busca && { search: busca })
      });

      const response = await fetch(`/api/admin/recommendations?${params}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIndicacoes(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Erro ao carregar indicações');
      }
    } catch (error) {
      console.error('Erro ao carregar indicações:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filtroStatus, filtroVaga, filtroCandidato, filtroEmpresa, busca]);

  const loadVagas = async () => {
    try {
      const response = await fetch('/api/admin/jobs?limit=100', {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVagas(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
    }
  };

  const loadCandidatos = async () => {
    try {
      const response = await fetch('/api/admin/users?type=candidate&limit=100', {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidatos(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
    }
  };

  const handleCreateIndicacao = async () => {
    try {
      setActionLoading('create');
      
      const response = await fetch('/api/admin/recommendations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadIndicacoes();
        setShowModal(false);
        resetFormData();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao criar indicação');
      }
    } catch (error) {
      console.error('Erro ao criar indicação:', error);
      alert('Erro ao criar indicação');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteIndicacao = async () => {
    if (!indicacaoSelecionada) return;
    
    try {
      setActionLoading('delete');
      
      const response = await fetch(`/api/admin/recommendations/${indicacaoSelecionada.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        await loadIndicacoes();
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao deletar indicação');
      }
    } catch (error) {
      console.error('Erro ao deletar indicação:', error);
      alert('Erro ao deletar indicação');
    } finally {
      setActionLoading(null);
    }
  };

  const resetFormData = () => {
    setFormData({
      jobId: '',
      candidateId: '',
      adminNotes: '',
      matchScore: 0
    });
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      accepted: 'Aceita',
      rejected: 'Rejeitada',
      withdrawn: 'Retirada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'withdrawn': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <GrClock size={14} />;
      case 'accepted': return <GrCheckmark size={14} />;
      case 'rejected': return <GrFormClose size={14} />;
      case 'withdrawn': return <GrStatusWarning size={14} />;
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

  const handleViewIndicacao = (indicacao: Indicação) => {
    setIndicacaoSelecionada(indicacao);
    setModalType('view');
    setShowModal(true);
  };

  const handleCreateIndicacaoClick = () => {
    setIndicacaoSelecionada(null);
    resetFormData();
    setModalType('create');
    setShowModal(true);
  };

  const handleDeleteIndicacaoClick = (indicacao: Indicação) => {
    setIndicacaoSelecionada(indicacao);
    setModalType('delete');
    setShowModal(true);
  };

  const exportarIndicacoes = () => {
    // TODO: Implementar exportação
    alert('Exportação será implementada em breve');
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
    <div className={styles.indicacoesPage}>
      <DashboardHeader user={user} userType="admin" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Gestão de Indicações</h1>
              <p>Gerencie as indicações de candidatos às vagas da plataforma</p>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                onClick={exportarIndicacoes}
                className="btn btn-secondary"
              >
                <GrDownload size={16} />
                Exportar
              </button>
              <button 
                onClick={handleCreateIndicacaoClick}
                className="btn btn-primary"
              >
                <GrAdd size={16} />
                Nova Indicação
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrUser size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{indicacoes.length}</h3>
                <p>Total de Indicações</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{indicacoes.filter(i => i.status === 'pending').length}</h3>
                <p>Pendentes</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrCheckmark size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{indicacoes.filter(i => i.status === 'accepted').length}</h3>
                <p>Aceitas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStar size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{Math.round(indicacoes.reduce((acc, i) => acc + (i.matchScore || 0), 0) / Math.max(indicacoes.length, 1))}</h3>
                <p>Score Médio</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <GrSearch size={20} />
              <input
                type="text"
                placeholder="Buscar por candidato ou vaga..."
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
                <option value="pending">Pendentes</option>
                <option value="accepted">Aceitas</option>
                <option value="rejected">Rejeitadas</option>
                <option value="withdrawn">Retiradas</option>
              </select>

              <select
                value={filtroVaga}
                onChange={(e) => setFiltroVaga(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todas as Vagas</option>
                {vagas.map(vaga => (
                  <option key={vaga._id} value={vaga._id}>
                    {vaga.title}
                  </option>
                ))}
              </select>

              <select
                value={filtroCandidato}
                onChange={(e) => setFiltroCandidato(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todos os Candidatos</option>
                {candidatos.map(candidato => (
                  <option key={candidato._id} value={candidato._id}>
                    {candidato.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Indicações Table */}
          <div className={styles.tableSection}>
            <div className={styles.tableContainer}>
              <table className={styles.indicacoesTable}>
                <thead>
                  <tr>
                    <th>Candidato</th>
                    <th>Vaga</th>
                    <th>Empresa</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Indicado Por</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {indicacoes.map((indicacao) => (
                    <tr key={indicacao.id}>
                      <td>
                        <div className={styles.candidateInfo}>
                          <div className={styles.candidateDetails}>
                            <h4>{indicacao.candidate.name}</h4>
                            <p>{indicacao.candidate.email}</p>
                            <div className={styles.candidateSkills}>
                              {indicacao.candidate.profile?.skills?.slice(0, 3).map((skill: string, index: number) => (
                                <span key={index} className={styles.skillTag}>
                                  {skill}
                                </span>
                              ))}
                              {indicacao.candidate.profile?.skills?.length > 3 && (
                                <span className={styles.skillMore}>
                                  +{indicacao.candidate.profile.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.jobInfo}>
                          <h5>{indicacao.job.title}</h5>
                          <span className={styles.jobCategory}>{indicacao.job.category}</span>
                          <div className={styles.jobDetails}>
                            <span className={styles.workTypeBadge}>
                              {getWorkTypeLabel(indicacao.job.workType)}
                            </span>
                            <span className={styles.salaryText}>
                              {formatSalary(indicacao.job.salary)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.companyInfo}>
                          <img 
                            src={indicacao.company.logo || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=face'} 
                            alt={indicacao.company.name} 
                          />
                          <div>
                            <h5>{indicacao.company.name}</h5>
                            <span>{indicacao.company.industry}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.scoreInfo}>
                          <span className={styles.scoreValue}>
                            {indicacao.matchScore || 0}%
                          </span>
                          <div className={styles.scoreBar}>
                            <div 
                              className={styles.scoreFill} 
                              style={{ width: `${indicacao.matchScore || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={`${styles.statusBadge} ${styles[getStatusColor(indicacao.status)]}`}>
                          {getStatusIcon(indicacao.status)}
                          <span>{getStatusLabel(indicacao.status)}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.adminInfo}>
                          <span className={styles.adminName}>{indicacao.recommendedBy.name}</span>
                          <span className={styles.adminEmail}>{indicacao.recommendedBy.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {new Date(indicacao.recommendedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => handleViewIndicacao(indicacao)}
                            className={styles.actionBtn}
                            title="Visualizar"
                          >
                            <GrView size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteIndicacaoClick(indicacao)}
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

            {indicacoes.length === 0 && (
              <div className={styles.emptyState}>
                <GrUser size={48} />
                <h3>Nenhuma indicação encontrada</h3>
                <p>Tente ajustar os filtros ou criar uma nova indicação.</p>
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
                {modalType === 'view' && 'Detalhes da Indicação'}
                {modalType === 'create' && 'Nova Indicação'}
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
              {modalType === 'view' && indicacaoSelecionada && (
                <div className={styles.indicacaoDetails}>
                  <div className={styles.indicacaoHeader}>
                    <div className={styles.candidateSection}>
                      <h3>Candidato</h3>
                      <div className={styles.candidateCard}>
                        <h4>{indicacaoSelecionada.candidate.name}</h4>
                        <p>{indicacaoSelecionada.candidate.email}</p>
                        {indicacaoSelecionada.candidate.profile?.skills && (
                          <div className={styles.skillsList}>
                            {indicacaoSelecionada.candidate.profile.skills.map((skill: string, index: number) => (
                              <span key={index} className={styles.skillTag}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.jobSection}>
                      <h3>Vaga</h3>
                      <div className={styles.jobCard}>
                        <h4>{indicacaoSelecionada.job.title}</h4>
                        <p>{indicacaoSelecionada.job.category}</p>
                        <div className={styles.jobInfoGrid}>
                          <div className={styles.infoItem}>
                            <GrBriefcase size={16} />
                            <div>
                              <span className={styles.infoLabel}>Tipo</span>
                              <span className={styles.infoValue}>{getWorkTypeLabel(indicacaoSelecionada.job.workType)}</span>
                            </div>
                          </div>
                          <div className={styles.infoItem}>
                            <GrMoney size={16} />
                            <div>
                              <span className={styles.infoLabel}>Salário</span>
                              <span className={styles.infoValue}>{formatSalary(indicacaoSelecionada.job.salary)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.indicacaoInfo}>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <GrOrganization size={16} />
                        <div>
                          <span className={styles.infoLabel}>Empresa</span>
                          <span className={styles.infoValue}>{indicacaoSelecionada.company.name}</span>
                        </div>
                      </div>
                      <div className={styles.infoItem}>
                        <GrStar size={16} />
                        <div>
                          <span className={styles.infoLabel}>Score de Match</span>
                          <span className={styles.infoValue}>{indicacaoSelecionada.matchScore || 0}%</span>
                        </div>
                      </div>
                      <div className={styles.infoItem}>
                        <GrUser size={16} />
                        <div>
                          <span className={styles.infoLabel}>Indicado Por</span>
                          <span className={styles.infoValue}>{indicacaoSelecionada.recommendedBy.name}</span>
                        </div>
                      </div>
                      <div className={styles.infoItem}>
                        <GrCalendar size={16} />
                        <div>
                          <span className={styles.infoLabel}>Data da Indicação</span>
                          <span className={styles.infoValue}>
                            {new Date(indicacaoSelecionada.recommendedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {indicacaoSelecionada.adminNotes && (
                      <div className={styles.notesSection}>
                        <h4>Notas do Admin</h4>
                        <p>{indicacaoSelecionada.adminNotes}</p>
                      </div>
                    )}

                    {indicacaoSelecionada.candidateNotes && (
                      <div className={styles.notesSection}>
                        <h4>Notas do Candidato</h4>
                        <p>{indicacaoSelecionada.candidateNotes}</p>
                      </div>
                    )}

                    {indicacaoSelecionada.companyNotes && (
                      <div className={styles.notesSection}>
                        <h4>Notas da Empresa</h4>
                        <p>{indicacaoSelecionada.companyNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {modalType === 'create' && (
                <div className={styles.formSection}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Vaga</label>
                      <select
                        value={formData.jobId}
                        onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                      >
                        <option value="">Selecione uma vaga</option>
                        {vagas.map(vaga => (
                          <option key={vaga._id} value={vaga._id}>
                            {vaga.title} - {vaga.companyId.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label>Candidato</label>
                      <select
                        value={formData.candidateId}
                        onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                      >
                        <option value="">Selecione um candidato</option>
                        {candidatos.map(candidato => (
                          <option key={candidato._id} value={candidato._id}>
                            {candidato.name} - {candidato.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Score de Match (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.matchScore}
                        onChange={(e) => setFormData({ ...formData, matchScore: parseInt(e.target.value) || 0 })}
                        placeholder="Ex: 85"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Notas do Admin</label>
                    <textarea
                      value={formData.adminNotes}
                      onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                      placeholder="Observações sobre a indicação..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {modalType === 'delete' && indicacaoSelecionada && (
                <div className={styles.deleteConfirmation}>
                  <div className={styles.warningIcon}>
                    <GrStatusWarning size={48} />
                  </div>
                  <h3>Tem certeza que deseja excluir esta indicação?</h3>
                  <p>
                    Esta ação não pode ser desfeita. A indicação de <strong>{indicacaoSelecionada.candidate.name}</strong> 
                    para a vaga <strong>{indicacaoSelecionada.job.title}</strong> será permanentemente removida.
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
                  onClick={handleCreateIndicacao}
                  className="btn btn-primary"
                  disabled={actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? 'Criando...' : 'Criar Indicação'}
                </button>
              )}
              
              {modalType === 'delete' && (
                <button 
                  onClick={handleDeleteIndicacao}
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
