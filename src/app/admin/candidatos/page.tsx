'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { GrGroup, GrSearch, GrFilter, GrAdd, GrEdit, GrTrash, GrView, GrMail, GrPhone, GrCalendar, GrLocation, GrBriefcase, GrOrganization, GrMore, GrStatusGood, GrStatusCritical, GrClock, GrStatusWarning, GrClose, GrUser, GrStar } from 'react-icons/gr';
import styles from './candidatos.module.css';

interface Candidato {
  _id: string;
  name: string;
  email: string;
  type: 'candidato';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  profile?: {
    phone?: string;
    avatar?: string;
    company?: string;
    position?: string;
    linkedin?: string;
    website?: string;
    experience?: string;
    skills?: string[];
    education?: string;
    languages?: Array<{
      language: string;
      level: string;
    }>;
  };
  permissions?: {
    canAccessJobs: boolean;
    canApplyToJobs: boolean;
    canViewCourses: boolean;
    canAccessSimulations: boolean;
    canContactCompanies: boolean;
  };
  profileVerified?: boolean;
  documentsVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCandidatosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [busca, setBusca] = useState('');
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Candidato | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create' | 'delete'>('view');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'candidato' as 'candidato',
    status: 'approved' as 'pending' | 'approved' | 'rejected' | 'suspended',
    tempPassword: '',
    profile: {
      phone: '',
      company: '',
      position: '',
      linkedin: '',
      website: '',
      experience: '',
      skills: [] as string[],
      education: '',
      languages: [] as Array<{ language: string; level: string }>
    },
    permissions: {
      canAccessJobs: false,
      canApplyToJobs: false,
      canViewCourses: true,
      canAccessSimulations: false,
      canContactCompanies: false
    },
    profileVerified: false,
    documentsVerified: false
  });

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadCandidatos();
  }, [router, currentPage, filtroStatus, busca]);

  const loadCandidatos = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        type: 'candidato',
        ...(filtroStatus !== 'all' && { status: filtroStatus }),
        ...(busca && { search: busca })
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidatos(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Erro ao carregar candidatos');
      }
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filtroStatus, busca]);

  const handleCreateCandidatoClick = () => {
    setModalType('create');
    setCandidatoSelecionado(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      type: 'candidato',
      status: 'approved',
      tempPassword: '',
      profile: {
        phone: '',
        company: '',
        position: '',
        linkedin: '',
        website: '',
        experience: '',
        skills: [],
        education: '',
        languages: []
      },
      permissions: {
        canAccessJobs: false,
        canApplyToJobs: false,
        canViewCourses: true,
        canAccessSimulations: false,
        canContactCompanies: false
      },
      profileVerified: false,
      documentsVerified: false
    });
    setShowModal(true);
  };

  const handleViewCandidato = (candidato: Candidato) => {
    setModalType('view');
    setCandidatoSelecionado(candidato);
    setShowModal(true);
  };

  const handleEditCandidato = (candidato: Candidato) => {
    setModalType('edit');
    setCandidatoSelecionado(candidato);
    setFormData({
      name: candidato.name,
      email: candidato.email,
      password: '',
      type: candidato.type,
      status: candidato.status,
      tempPassword: '',
      profile: {
        phone: candidato.profile?.phone || '',
        company: candidato.profile?.company || '',
        position: candidato.profile?.position || '',
        linkedin: candidato.profile?.linkedin || '',
        website: candidato.profile?.website || '',
        experience: candidato.profile?.experience || '',
        skills: candidato.profile?.skills || [],
        education: candidato.profile?.education || '',
        languages: candidato.profile?.languages || []
      },
      permissions: {
        canAccessJobs: candidato.permissions?.canAccessJobs || false,
        canApplyToJobs: candidato.permissions?.canApplyToJobs || false,
        canViewCourses: candidato.permissions?.canViewCourses || true,
        canAccessSimulations: candidato.permissions?.canAccessSimulations || false,
        canContactCompanies: candidato.permissions?.canContactCompanies || false
      },
      profileVerified: candidato.profileVerified || false,
      documentsVerified: candidato.documentsVerified || false
    });
    setShowModal(true);
  };

  const handleDeleteCandidato = (candidato: Candidato) => {
    setModalType('delete');
    setCandidatoSelecionado(candidato);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidatoSelecionado && modalType !== 'create') return;

    setActionLoading(modalType);

    try {
      const url = modalType === 'create' 
        ? '/api/admin/users' 
        : `/api/admin/users/${candidatoSelecionado?._id}`;
      
      const method = modalType === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Operação realizada com sucesso!');
        setShowModal(false);
        loadCandidatos();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao realizar operação');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao realizar operação');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!candidatoSelecionado) return;

    setActionLoading('delete');

    try {
      const response = await fetch(`/api/admin/users/${candidatoSelecionado._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        alert('Candidato excluído com sucesso!');
        setShowModal(false);
        loadCandidatos();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao excluir candidato');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir candidato');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: styles.statusPending, icon: <GrClock size={14} /> },
      approved: { label: 'Aprovado', className: styles.statusApproved, icon: <GrStatusGood size={14} /> },
      rejected: { label: 'Rejeitado', className: styles.statusRejected, icon: <GrStatusCritical size={14} /> },
      suspended: { label: 'Suspenso', className: styles.statusSuspended, icon: <GrStatusWarning size={14} /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className={styles.candidatosPage}>
        <DashboardHeader user={user} userType="admin" />
        <main className={styles.mainContent}>
          <div className="container">
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Carregando candidatos...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.candidatosPage}>
      <DashboardHeader user={user} userType="admin" />
      <main className={styles.mainContent}>
        <div className="container">
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Gestão de Candidatos</h1>
              <p>Gerencie todos os candidatos cadastrados na plataforma UAE Careers</p>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                onClick={handleCreateCandidatoClick}
                className="btn btn-primary"
              >
                <GrAdd size={16} />
                Novo Candidato
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
                <h3>{candidatos.length}</h3>
                <p>Total de Candidatos</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{candidatos.filter(c => c.status === 'approved').length}</h3>
                <p>Aprovados</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{candidatos.filter(c => c.status === 'pending').length}</h3>
                <p>Pendentes</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStar size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{candidatos.filter(c => c.profileVerified).length}</h3>
                <p>Perfis Verificados</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <GrSearch size={20} />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
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
                <option value="approved">Aprovados</option>
                <option value="rejected">Rejeitados</option>
                <option value="suspended">Suspensos</option>
              </select>
            </div>
          </div>

          {/* Candidatos Table */}
          <div className={styles.tableContainer}>
            <table className={styles.candidatosTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Verificação</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {candidatos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      <div className={styles.emptyContent}>
                        <GrUser size={48} />
                        <h3>Nenhum candidato encontrado</h3>
                        <p>Comece criando o primeiro candidato da plataforma</p>
                        <button 
                          onClick={handleCreateCandidatoClick}
                          className="btn btn-primary"
                        >
                          <GrAdd size={16} />
                          Criar Candidato
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  candidatos.map((candidato) => (
                    <tr key={candidato._id}>
                      <td>
                        <div className={styles.userInfo}>
                          <div className={styles.userAvatar}>
                            {candidato.profile?.avatar ? (
                              <img src={candidato.profile.avatar} alt={candidato.name} />
                            ) : (
                              <GrUser size={20} />
                            )}
                          </div>
                          <div className={styles.userDetails}>
                            <strong>{candidato.name}</strong>
                            {candidato.profile?.position && (
                              <span className={styles.userPosition}>{candidato.profile.position}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.emailCell}>
                          <GrMail size={14} />
                          {candidato.email}
                        </div>
                      </td>
                      <td>
                        {candidato.profile?.phone ? (
                          <div className={styles.phoneCell}>
                            <GrPhone size={14} />
                            {candidato.profile.phone}
                          </div>
                        ) : (
                          <span className={styles.noData}>Não informado</span>
                        )}
                      </td>
                      <td>{getStatusBadge(candidato.status)}</td>
                      <td>
                        <div className={styles.verificationStatus}>
                          {candidato.profileVerified && (
                            <span className={styles.verifiedBadge}>
                              <GrStatusGood size={12} />
                              Perfil
                            </span>
                          )}
                          {candidato.documentsVerified && (
                            <span className={styles.verifiedBadge}>
                              <GrStatusGood size={12} />
                              Docs
                            </span>
                          )}
                          {!candidato.profileVerified && !candidato.documentsVerified && (
                            <span className={styles.notVerified}>Não verificado</span>
                          )}
                        </div>
                      </td>
                      <td>{formatDate(candidato.createdAt)}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => router.push(`/admin/candidatos/${candidato._id}`)}
                            className={styles.actionBtn}
                            title="Gerenciar"
                          >
                            <GrView size={16} />
                          </button>
                          <button
                            onClick={() => handleEditCandidato(candidato)}
                            className={styles.actionBtn}
                            title="Editar"
                          >
                            <GrEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCandidato(candidato)}
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            title="Excluir"
                          >
                            <GrTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={styles.paginationBtn}
              >
                Anterior
              </button>
              
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
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
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>
                {modalType === 'create' && 'Novo Candidato'}
                {modalType === 'view' && 'Detalhes do Candidato'}
                {modalType === 'edit' && 'Editar Candidato'}
                {modalType === 'delete' && 'Confirmar Exclusão'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={styles.closeBtn}
              >
                <GrClose size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              {modalType === 'delete' ? (
                <div className={styles.deleteConfirmation}>
                  <p>Tem certeza que deseja excluir o candidato <strong>{candidatoSelecionado?.name}</strong>?</p>
                  <p>Esta ação não pode ser desfeita.</p>
                  
                  <div className={styles.deleteActions}>
                    <button
                      onClick={() => setShowModal(false)}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={actionLoading === 'delete'}
                      className="btn btn-danger"
                    >
                      {actionLoading === 'delete' ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                </div>
              ) : modalType === 'view' ? (
                <div className={styles.candidatoDetails}>
                  <div className={styles.detailSection}>
                    <h3>Informações Básicas</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <label>Nome:</label>
                        <span>{candidatoSelecionado?.name}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>E-mail:</label>
                        <span>{candidatoSelecionado?.email}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Status:</label>
                        <span>{getStatusBadge(candidatoSelecionado?.status || 'pending')}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Telefone:</label>
                        <span>{candidatoSelecionado?.profile?.phone || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3>Perfil Profissional</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <label>Empresa:</label>
                        <span>{candidatoSelecionado?.profile?.company || 'Não informado'}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Cargo:</label>
                        <span>{candidatoSelecionado?.profile?.position || 'Não informado'}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>LinkedIn:</label>
                        <span>{candidatoSelecionado?.profile?.linkedin || 'Não informado'}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Website:</label>
                        <span>{candidatoSelecionado?.profile?.website || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3>Permissões</h3>
                    <div className={styles.permissionsGrid}>
                      <div className={styles.permissionItem}>
                        <GrBriefcase size={16} />
                        <span>Acessar Vagas</span>
                        <span className={candidatoSelecionado?.permissions?.canAccessJobs ? styles.permissionActive : styles.permissionInactive}>
                          {candidatoSelecionado?.permissions?.canAccessJobs ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className={styles.permissionItem}>
                        <GrAdd size={16} />
                        <span>Candidatar-se</span>
                        <span className={candidatoSelecionado?.permissions?.canApplyToJobs ? styles.permissionActive : styles.permissionInactive}>
                          {candidatoSelecionado?.permissions?.canApplyToJobs ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className={styles.permissionItem}>
                        <GrUser size={16} />
                        <span>Ver Cursos</span>
                        <span className={candidatoSelecionado?.permissions?.canViewCourses ? styles.permissionActive : styles.permissionInactive}>
                          {candidatoSelecionado?.permissions?.canViewCourses ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className={styles.permissionItem}>
                        <GrStar size={16} />
                        <span>Simulações</span>
                        <span className={candidatoSelecionado?.permissions?.canAccessSimulations ? styles.permissionActive : styles.permissionInactive}>
                          {candidatoSelecionado?.permissions?.canAccessSimulations ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className={styles.permissionItem}>
                        <GrMail size={16} />
                        <span>Contatar Empresas</span>
                        <span className={candidatoSelecionado?.permissions?.canContactCompanies ? styles.permissionActive : styles.permissionInactive}>
                          {candidatoSelecionado?.permissions?.canContactCompanies ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.candidatoForm}>
                  <div className={styles.formSection}>
                    <h3>Informações Básicas</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Nome *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>E-mail *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        >
                          <option value="pending">Pendente</option>
                          <option value="approved">Aprovado</option>
                          <option value="rejected">Reprovado</option>
                          <option value="suspended">Suspenso</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Telefone</label>
                        <input
                          type="tel"
                          value={formData.profile.phone}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, phone: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3>Perfil Profissional</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Empresa</label>
                        <input
                          type="text"
                          value={formData.profile.company}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, company: e.target.value}
                          })}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Cargo</label>
                        <input
                          type="text"
                          value={formData.profile.position}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, position: e.target.value}
                          })}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>LinkedIn</label>
                        <input
                          type="url"
                          value={formData.profile.linkedin}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, linkedin: e.target.value}
                          })}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Website</label>
                        <input
                          type="url"
                          value={formData.profile.website}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, website: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Experiência</label>
                      <textarea
                        value={formData.profile.experience}
                        onChange={(e) => setFormData({
                          ...formData, 
                          profile: {...formData.profile, experience: e.target.value}
                        })}
                        rows={3}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Educação</label>
                      <textarea
                        value={formData.profile.education}
                        onChange={(e) => setFormData({
                          ...formData, 
                          profile: {...formData.profile, education: e.target.value}
                        })}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3>Permissões</h3>
                    <div className={styles.checkboxGroup}>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          id="canAccessJobs"
                          checked={formData.permissions.canAccessJobs}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {...formData.permissions, canAccessJobs: e.target.checked}
                          })}
                        />
                        <span>Acessar Vagas</span>
                      </div>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          id="canApplyToJobs"
                          checked={formData.permissions.canApplyToJobs}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {...formData.permissions, canApplyToJobs: e.target.checked}
                          })}
                        />
                        <span>Candidatar-se a Vagas</span>
                      </div>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          id="canViewCourses"
                          checked={formData.permissions.canViewCourses}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {...formData.permissions, canViewCourses: e.target.checked}
                          })}
                        />
                        <span>Ver Cursos</span>
                      </div>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          id="canAccessSimulations"
                          checked={formData.permissions.canAccessSimulations}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {...formData.permissions, canAccessSimulations: e.target.checked}
                          })}
                        />
                        <span>Acessar Simulações</span>
                      </div>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          id="canContactCompanies"
                          checked={formData.permissions.canContactCompanies}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {...formData.permissions, canContactCompanies: e.target.checked}
                          })}
                        />
                        <span>Contatar Empresas</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3>Verificação</h3>
                    <div className={styles.checkboxGroup}>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          id="profileVerified"
                          checked={formData.profileVerified}
                          onChange={(e) => setFormData({
                            ...formData,
                            profileVerified: e.target.checked
                          })}
                        />
                        <span>Perfil Verificado</span>
                      </div>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          id="documentsVerified"
                          checked={formData.documentsVerified}
                          onChange={(e) => setFormData({
                            ...formData,
                            documentsVerified: e.target.checked
                          })}
                        />
                        <span>Documentos Verificados</span>
                      </div>
                    </div>
                  </div>

                  {modalType === 'create' && (
                    <div className={styles.formSection}>
                      <h3>Senha</h3>
                      <div className={styles.formGroup}>
                        <label>Senha Temporária (opcional)</label>
                        <input
                          type="text"
                          value={formData.tempPassword}
                          onChange={(e) => setFormData({...formData, tempPassword: e.target.value})}
                          placeholder="Deixe em branco para gerar automaticamente"
                        />
                        <small className={styles.helpText}>
                          Se não informada, uma senha será gerada automaticamente
                        </small>
                      </div>
                    </div>
                  )}

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading === modalType}
                      className="btn btn-primary"
                    >
                      {actionLoading === modalType ? 'Salvando...' : (modalType === 'create' ? 'Criar Candidato' : 'Salvar Alterações')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
