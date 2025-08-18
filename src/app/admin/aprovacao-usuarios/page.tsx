'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { GrUser, GrGroup, GrOrganization, GrStatusGood, GrClose, GrView, GrSearch, GrFilter, GrClock, GrDocument, GrMail, GrPhone, GrLocation, GrCalendar } from 'react-icons/gr';
import styles from './aprovacao-usuarios.module.css';

interface PendingUser {
  _id: string;
  email: string;
  name: string;
  type: 'candidato' | 'empresa';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: string;
  profile?: {
    completed: boolean;
    phone?: string;
    company?: string;
    position?: string;
    linkedin?: string;
    documents?: Array<{
      id: string;
      name: string;
      type: string;
      status: 'pending' | 'approved' | 'rejected';
      uploadedAt: string;
    }>;
  };
}

export default function AdminAprovacaoUsuariosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadPendingUsers();
  }, [router]);

  const loadPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/pending', {
        headers: AuthService.getAuthHeaders()
      });
      
      const data = await response.json();
      if (data.success) {
        setPendingUsers(data.data);
      } else {
        setErrorMessage('Erro ao carregar usuários pendentes');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setErrorMessage('Erro ao carregar usuários pendentes');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          userId,
          action: 'approve'
        })
      });

      const data = await response.json();
      if (data.success) {
        setPendingUsers(prev => prev.filter(u => u._id !== userId));
        setSuccessMessage(data.message);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(data.message);
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      setErrorMessage('Erro ao aprovar usuário');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!rejectionReason.trim()) {
      setErrorMessage('Motivo da rejeição é obrigatório');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          userId,
          action: 'reject',
          rejectionReason
        })
      });

      const data = await response.json();
      if (data.success) {
        setPendingUsers(prev => prev.filter(u => u._id !== userId));
        setSuccessMessage(data.message);
        setRejectionReason('');
        setShowModal(false);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(data.message);
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      setErrorMessage('Erro ao rejeitar usuário');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = pendingUsers.filter(pendingUser => {
    const matchesSearch = pendingUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pendingUser.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || pendingUser.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getUserTypeIcon = (type: string) => {
    return type === 'candidato' ? <GrUser size={20} /> : <GrOrganization size={20} />;
  };

  const getUserTypeLabel = (type: string) => {
    return type === 'candidato' ? 'Candidato' : 'Empresa';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.aprovacaoPage}>
      <DashboardHeader user={user} userType="admin" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Messages */}
          {successMessage && (
            <div className={styles.successMessage}>
              <GrStatusGood size={20} />
              <span>{successMessage}</span>
            </div>
          )}
          
          {errorMessage && (
            <div className={styles.errorMessage}>
              <GrClose size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Aprovação de Usuários</h1>
              <p>Gerencie novos cadastros pendentes de aprovação</p>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{pendingUsers.length}</h3>
                <p>Pendentes de Aprovação</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrUser size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{pendingUsers.filter(u => u.type === 'candidato').length}</h3>
                <p>Candidatos</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrOrganization size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{pendingUsers.filter(u => u.type === 'empresa').length}</h3>
                <p>Empresas</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBar}>
              <div className={styles.searchInput}>
                <GrSearch size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className={styles.filters}>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  <option value="candidato">Candidatos</option>
                  <option value="empresa">Empresas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className={styles.usersList}>
            {filteredUsers.length === 0 ? (
              <div className={styles.emptyState}>
                <GrStatusGood size={48} />
                <h3>Nenhum usuário pendente</h3>
                <p>Todos os novos cadastros foram processados.</p>
              </div>
            ) : (
              filteredUsers.map((pendingUser) => (
                <div key={pendingUser._id} className={styles.userCard}>
                  <div className={styles.userHeader}>
                    <div className={styles.userInfo}>
                      <div className={styles.userIcon}>
                        {getUserTypeIcon(pendingUser.type)}
                      </div>
                      <div className={styles.userDetails}>
                        <h3>{pendingUser.name}</h3>
                        <p>{pendingUser.email}</p>
                        <div className={styles.userMeta}>
                          <span className={styles.userType}>
                            {getUserTypeLabel(pendingUser.type)}
                          </span>
                          <span className={styles.userDate}>
                            <GrCalendar size={14} />
                            {new Date(pendingUser.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.userActions}>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => {
                          setSelectedUser(pendingUser);
                          setShowModal(true);
                        }}
                      >
                        <GrView size={16} />
                        Ver Detalhes
                      </button>
                      
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => handleApproveUser(pendingUser._id)}
                        disabled={actionLoading === pendingUser._id}
                      >
                        {actionLoading === pendingUser._id ? (
                          <div className={styles.spinner}></div>
                        ) : (
                          <>
                            <GrStatusGood size={16} />
                            Aprovar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {pendingUser.profile && (
                    <div className={styles.userProfile}>
                      {pendingUser.profile.phone && (
                        <div className={styles.profileItem}>
                          <GrPhone size={14} />
                          <span>{pendingUser.profile.phone}</span>
                        </div>
                      )}
                      {pendingUser.profile.company && (
                        <div className={styles.profileItem}>
                          <GrOrganization size={14} />
                          <span>{pendingUser.profile.company}</span>
                        </div>
                      )}
                      {pendingUser.profile.position && (
                        <div className={styles.profileItem}>
                          <GrUser size={14} />
                          <span>{pendingUser.profile.position}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal de Detalhes */}
      {showModal && selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalhes do {getUserTypeLabel(selectedUser.type)}</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.userDetailSection}>
                <h3>Informações Básicas</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>Nome:</label>
                    <span>{selectedUser.name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Tipo:</label>
                    <span>{getUserTypeLabel(selectedUser.type)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Data de Cadastro:</label>
                    <span>{new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {selectedUser.profile && (
                <div className={styles.userDetailSection}>
                  <h3>Perfil</h3>
                  <div className={styles.detailGrid}>
                    {selectedUser.profile.phone && (
                      <div className={styles.detailItem}>
                        <label>Telefone:</label>
                        <span>{selectedUser.profile.phone}</span>
                      </div>
                    )}
                    {selectedUser.profile.company && (
                      <div className={styles.detailItem}>
                        <label>Empresa:</label>
                        <span>{selectedUser.profile.company}</span>
                      </div>
                    )}
                    {selectedUser.profile.position && (
                      <div className={styles.detailItem}>
                        <label>Cargo:</label>
                        <span>{selectedUser.profile.position}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedUser.profile?.documents && selectedUser.profile.documents.length > 0 && (
                <div className={styles.userDetailSection}>
                  <h3>Documentos</h3>
                  <div className={styles.documentsList}>
                    {selectedUser.profile.documents.map((doc, index) => (
                      <div key={index} className={styles.documentItem}>
                        <GrDocument size={16} />
                        <span>{doc.name}</span>
                        <span className={`${styles.status} ${styles[doc.status]}`}>
                          {doc.status === 'pending' ? 'Pendente' : 
                           doc.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.rejectionSection}>
                <h3>Rejeitar Cadastro</h3>
                <textarea
                  className={styles.rejectionInput}
                  placeholder="Digite o motivo da rejeição..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              
              <button
                className="btn btn-danger"
                onClick={() => handleRejectUser(selectedUser._id)}
                disabled={actionLoading === selectedUser._id || !rejectionReason.trim()}
              >
                {actionLoading === selectedUser._id ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <>
                    <GrClose size={16} />
                    Rejeitar
                  </>
                )}
              </button>
              
              <button
                className="btn btn-success"
                onClick={() => {
                  handleApproveUser(selectedUser._id);
                  setShowModal(false);
                }}
                disabled={actionLoading === selectedUser._id}
              >
                {actionLoading === selectedUser._id ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <>
                    <GrStatusGood size={16} />
                    Aprovar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
