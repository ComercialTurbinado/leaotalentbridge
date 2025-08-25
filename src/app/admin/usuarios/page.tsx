'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { GrGroup, GrSearch, GrFilter, GrAdd, GrEdit, GrTrash, GrView, GrMail, GrPhone, GrCalendar, GrLocation, GrBriefcase, GrOrganization, GrDownload, GrUpload, GrMore, GrStatusGood, GrStatusCritical, GrClock, GrStatusWarning, GrClose, GrUser, GrStar } from 'react-icons/gr';
import styles from './usuarios.module.css';

interface Usuario {
  _id: string;
  name: string;
  email: string;
  type: 'candidato' | 'empresa' | 'admin';
  status: 'active' | 'inactive' | 'pending' | 'blocked';
  profile?: {
    phone?: string;
    avatar?: string;
    experience?: string;
    skills?: string[];
    education?: string;
    languages?: Array<{
      language: string;
      level: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroTipo, setFiltroTipo] = useState('all');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [busca, setBusca] = useState('');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create' | 'delete'>('view');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'candidato' as 'candidato' | 'empresa' | 'admin',
    status: 'active' as 'active' | 'inactive' | 'pending' | 'blocked'
  });

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadUsuarios();
  }, [router, currentPage, filtroTipo, filtroStatus, busca]);

  const loadUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filtroTipo !== 'all' && { type: filtroTipo }),
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
        setUsuarios(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filtroTipo, filtroStatus, busca]);

  const handleCreateUser = async () => {
    try {
      setActionLoading('create');
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadUsuarios();
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', type: 'candidato', status: 'active' });
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUser = async () => {
    if (!usuarioSelecionado) return;
    
    try {
      setActionLoading('update');
      
      const response = await fetch(`/api/admin/users/${usuarioSelecionado._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadUsuarios();
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', type: 'candidato', status: 'active' });
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!usuarioSelecionado) return;
    
    try {
      setActionLoading('delete');
      
      const response = await fetch(`/api/admin/users/${usuarioSelecionado._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        await loadUsuarios();
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao deletar usuário');
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      alert('Erro ao deletar usuário');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente',
      blocked: 'Bloqueado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'pending': return 'yellow';
      case 'blocked': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <GrStatusGood size={14} />;
      case 'inactive': return <GrStatusCritical size={14} />;
      case 'pending': return <GrClock size={14} />;
      case 'blocked': return <GrStatusWarning size={14} />;
      default: return <GrStatusCritical size={14} />;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'candidato': return <GrGroup size={16} />;
      case 'empresa': return <GrOrganization size={16} />;
      case 'admin': return <GrStar size={16} />;
      default: return <GrGroup size={16} />;
    }
  };

  const handleViewUser = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditUser = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setFormData({
      name: usuario.name,
      email: usuario.email,
      password: '',
      type: usuario.type,
      status: usuario.status
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteUserClick = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateUserClick = () => {
    setUsuarioSelecionado(null);
    setFormData({ name: '', email: '', password: '', type: 'candidato', status: 'active' });
    setModalType('create');
    setShowModal(true);
  };

  const exportarUsuarios = () => {
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
    <div className={styles.usuariosPage}>
      <DashboardHeader user={user} userType="admin" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Gestão de Usuários</h1>
              <p>Gerencie todos os usuários da plataforma Leão Talent Bridge</p>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                onClick={exportarUsuarios}
                className="btn btn-secondary"
              >
                <GrDownload size={16} />
                Exportar
              </button>
              <button 
                onClick={handleCreateUserClick}
                className="btn btn-primary"
              >
                <GrAdd size={16} />
                Novo Usuário
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrGroup size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{usuarios.filter(u => u.type === 'candidato').length}</h3>
                <p>Candidatos</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrOrganization size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{usuarios.filter(u => u.type === 'empresa').length}</h3>
                <p>Empresas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{usuarios.filter(u => u.status === 'active').length}</h3>
                <p>Ativos</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{usuarios.filter(u => u.status === 'pending').length}</h3>
                <p>Pendentes</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <GrSearch size={20} />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className={styles.filters}>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todos os Tipos</option>
                <option value="candidato">Candidatos</option>
                <option value="empresa">Empresas</option>
                <option value="admin">Administradores</option>
              </select>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
                <option value="pending">Pendentes</option>
                <option value="blocked">Bloqueados</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className={styles.tableSection}>
            <div className={styles.tableContainer}>
              <table className={styles.usersTable}>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario._id}>
                      <td>
                        <div className={styles.userInfo}>
                          <img 
                            src={usuario.profile?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'} 
                            alt={usuario.name} 
                          />
                          <div className={styles.userDetails}>
                            <h4>{usuario.name}</h4>
                            <p>{usuario.email}</p>
                            {usuario.profile?.phone && (
                              <span className={styles.userPhone}>
                                <GrPhone size={12} />
                                {usuario.profile.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.userType}>
                          {getTipoIcon(usuario.type)}
                          <span>{usuario.type}</span>
                        </div>
                      </td>
                      <td>
                        <div className={`${styles.statusBadge} ${styles[getStatusColor(usuario.status)]}`}>
                          {getStatusIcon(usuario.status)}
                          <span>{getStatusLabel(usuario.status)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => handleViewUser(usuario)}
                            className={styles.actionBtn}
                            title="Visualizar"
                          >
                            <GrView size={16} />
                          </button>
                          <button 
                            onClick={() => handleEditUser(usuario)}
                            className={styles.actionBtn}
                            title="Editar"
                          >
                            <GrEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUserClick(usuario)}
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

            {usuarios.length === 0 && (
              <div className={styles.emptyState}>
                <GrGroup size={48} />
                <h3>Nenhum usuário encontrado</h3>
                <p>Tente ajustar os filtros ou criar um novo usuário.</p>
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
                {modalType === 'view' && 'Detalhes do Usuário'}
                {modalType === 'edit' && 'Editar Usuário'}
                {modalType === 'create' && 'Novo Usuário'}
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
              {modalType === 'view' && usuarioSelecionado && (
                <div className={styles.userDetails}>
                  <div className={styles.userHeader}>
                    <img 
                      src={usuarioSelecionado.profile?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'} 
                      alt={usuarioSelecionado.name} 
                    />
                    <div>
                      <h3>{usuarioSelecionado.name}</h3>
                      <p>{usuarioSelecionado.email}</p>
                      <div className={`${styles.statusBadge} ${styles[getStatusColor(usuarioSelecionado.status)]}`}>
                        {getStatusIcon(usuarioSelecionado.status)}
                        <span>{getStatusLabel(usuarioSelecionado.status)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.userInfoGrid}>
                    <div className={styles.infoItem}>
                      <GrMail size={16} />
                      <div>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{usuarioSelecionado.email}</span>
                      </div>
                    </div>
                    {usuarioSelecionado.profile?.phone && (
                      <div className={styles.infoItem}>
                        <GrPhone size={16} />
                        <div>
                          <span className={styles.infoLabel}>Telefone</span>
                          <span className={styles.infoValue}>{usuarioSelecionado.profile.phone}</span>
                        </div>
                      </div>
                    )}
                    <div className={styles.infoItem}>
                      <GrUser size={16} />
                      <div>
                        <span className={styles.infoLabel}>Tipo</span>
                        <span className={styles.infoValue}>{usuarioSelecionado.type}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrCalendar size={16} />
                      <div>
                        <span className={styles.infoLabel}>Data de Cadastro</span>
                        <span className={styles.infoValue}>
                          {new Date(usuarioSelecionado.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(modalType === 'create' || modalType === 'edit') && (
                <div className={styles.formSection}>
                  <div className={styles.formGroup}>
                    <label>Nome</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  
                  {modalType === 'create' && (
                    <div className={styles.formGroup}>
                      <label>Senha</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Senha"
                      />
                    </div>
                  )}
                  
                  <div className={styles.formGroup}>
                    <label>Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="candidato">Candidato</option>
                      <option value="empresa">Empresa</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="pending">Pendente</option>
                      <option value="blocked">Bloqueado</option>
                    </select>
                  </div>
                </div>
              )}

              {modalType === 'delete' && usuarioSelecionado && (
                <div className={styles.deleteConfirmation}>
                  <div className={styles.warningIcon}>
                    <GrStatusWarning size={48} />
                  </div>
                  <h3>Tem certeza que deseja excluir este usuário?</h3>
                  <p>
                    Esta ação não pode ser desfeita. O usuário <strong>{usuarioSelecionado.name}</strong> será 
                    permanentemente removido do sistema.
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
                  onClick={handleCreateUser}
                  className="btn btn-primary"
                  disabled={actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? 'Criando...' : 'Criar Usuário'}
                </button>
              )}
              
              {modalType === 'edit' && (
                <button 
                  onClick={handleUpdateUser}
                  className="btn btn-primary"
                  disabled={actionLoading === 'update'}
                >
                  {actionLoading === 'update' ? 'Atualizando...' : 'Atualizar Usuário'}
                </button>
              )}
              
              {modalType === 'delete' && (
                <button 
                  onClick={handleDeleteUser}
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