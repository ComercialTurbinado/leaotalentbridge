'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  GrDocument, 
  GrStatusGood, 
  GrStatusWarning, 
  GrClock, 
  GrSearch, 
  GrFilter,
  GrCheckmark,
  GrClose,
  GrView,
  GrDownload,
  GrUser,
  GrCalendar,
  GrAlert
} from 'react-icons/gr';
import styles from './documentos.module.css';

interface Document {
  _id: string;
  candidateId: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      phone?: string;
    };
  };
  type: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'verified' | 'rejected' | 'under_review';
  priority: 'low' | 'medium' | 'high';
  uploadedBy: 'candidate' | 'admin';
  validationResults?: {
    fileIntegrity: boolean;
    formatValid: boolean;
    sizeValid: boolean;
    contentValid?: boolean;
    errors: string[];
  };
  adminComments?: string;
  rejectionReason?: string;
  verifiedBy?: {
    _id: string;
    name: string;
  };
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentStats {
  pending: number;
  under_review: number;
  verified: number;
  rejected: number;
  total: number;
}

export default function AdminDocumentosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats>({
    pending: 0,
    under_review: 0,
    verified: 0,
    rejected: 0,
    total: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'approve' | 'reject' | 'change_status'>('view');
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadDocuments();
  }, [router, currentPage, statusFilter, typeFilter, priorityFilter]);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        status: statusFilter,
        type: typeFilter,
        priority: priorityFilter
      });

      const response = await fetch(`/api/admin/documents/pending?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDocuments(data.data.documents);
          setStats(data.data.stats);
          setTotalPages(data.data.pagination.pages);
        } else {
          console.error('Erro ao carregar documentos:', data.message);
        }
      } else {
        throw new Error('Erro ao carregar documentos');
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter, priorityFilter]);

  const handleApproveDocument = async () => {
    if (!selectedDocument) return;

    try {
      setActionLoading(true);
      
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`/api/admin/documents/${selectedDocument._id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comments })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowModal(false);
          setComments('');
          loadDocuments();
          alert('Documento aprovado com sucesso!');
        } else {
          alert('Erro ao aprovar documento: ' + data.message);
        }
      } else {
        throw new Error('Erro ao aprovar documento');
      }
    } catch (error) {
      console.error('Erro ao aprovar documento:', error);
      alert('Erro ao aprovar documento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDocument = async () => {
    if (!selectedDocument || !rejectionReason) return;

    try {
      setActionLoading(true);
      
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`/api/admin/documents/${selectedDocument._id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          reason: rejectionReason,
          comments 
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowModal(false);
          setRejectionReason('');
          setComments('');
          loadDocuments();
          alert('Documento rejeitado com sucesso!');
        } else {
          alert('Erro ao rejeitar documento: ' + data.message);
        }
      } else {
        throw new Error('Erro ao rejeitar documento');
      }
    } catch (error) {
      console.error('Erro ao rejeitar documento:', error);
      alert('Erro ao rejeitar documento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedDocument || !newStatus) return;

    try {
      setActionLoading(true);
      
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`/api/admin/documents/${selectedDocument._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          comments,
          rejectionReason: newStatus === 'rejected' ? rejectionReason : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowModal(false);
          setNewStatus('');
          setComments('');
          setRejectionReason('');
          loadDocuments();
          alert(`Status do documento alterado para ${newStatus} com sucesso!`);
        } else {
          alert('Erro ao alterar status: ' + data.message);
        }
      } else {
        throw new Error('Erro ao alterar status do documento');
      }
    } catch (error) {
      console.error('Erro ao alterar status do documento:', error);
      alert('Erro ao alterar status do documento');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (document: Document, type: 'view' | 'approve' | 'reject' | 'change_status') => {
    setSelectedDocument(document);
    setModalType(type);
    setShowModal(true);
    setComments('');
    setRejectionReason('');
    setNewStatus(document.status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className={styles.statusBadge + ' ' + styles.statusVerified}>✅ Aprovado</span>;
      case 'rejected':
        return <span className={styles.statusBadge + ' ' + styles.statusRejected}>❌ Reprovado</span>;
      case 'under_review':
        return <span className={styles.statusBadge + ' ' + styles.statusUnderReview}>🔍 Em Análise</span>;
      case 'pending':
      default:
        return <span className={styles.statusBadge + ' ' + styles.statusPending}>⏳ Pendente</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className={styles.priorityBadge + ' ' + styles.priorityHigh}>🔴 Alta</span>;
      case 'medium':
        return <span className={styles.priorityBadge + ' ' + styles.priorityMedium}>🟡 Média</span>;
      case 'low':
        return <span className={styles.priorityBadge + ' ' + styles.priorityLow}>🟢 Baixa</span>;
      default:
        return <span className={styles.priorityBadge + ' ' + styles.priorityMedium}>🟡 Média</span>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.candidateId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.candidateId.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className={styles.documentosPage}>
        <DashboardHeader user={user} userType="admin" />
        <main className={styles.mainContent}>
          <div className="container">
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <p>Carregando documentos...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.documentosPage}>
      <DashboardHeader user={user} userType="admin" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Gerenciamento de Documentos</h1>
              <p>Analise e aprove documentos enviados pelos candidatos</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.pending}</h3>
                <p>Pendentes</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusWarning size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.under_review}</h3>
                <p>Em Análise</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.verified}</h3>
                <p>Aprovados</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrDocument size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.total}</h3>
                <p>Total</p>
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
                  placeholder="Buscar por título, candidato ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className={styles.filters}>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendente</option>
                  <option value="under_review">Em Análise</option>
                  <option value="verified">Aprovado</option>
                  <option value="rejected">Reprovado</option>
                </select>
                
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Todos os tipos</option>
                  <option value="cv">Currículo</option>
                  <option value="passport">Passaporte</option>
                  <option value="diploma">Diploma</option>
                  <option value="visa">Visto</option>
                  <option value="certificate">Certificado</option>
                  <option value="other">Outro</option>
                </select>

                <select 
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">Todas as prioridades</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>
            
            {/* Ações em lote */}
            <div className={styles.batchActions}>
              <button 
                className="btn btn-warning btn-sm"
                onClick={async () => {
                  const pendingDocs = documents.filter(doc => doc.status === 'pending');
                  if (pendingDocs.length === 0) {
                    alert('Não há documentos pendentes para colocar em análise');
                    return;
                  }
                  
                  if (!confirm(`Colocar ${pendingDocs.length} documento(s) pendente(s) em análise?`)) {
                    return;
                  }
                  
                  try {
                    const token = AuthService.getToken();
                    if (!token) throw new Error('Token não encontrado');
                    
                    let successCount = 0;
                    for (const doc of pendingDocs) {
                      const response = await fetch(`/api/admin/documents/${doc._id}/status`, {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                          status: 'under_review',
                          comments: 'Documento colocado em análise em lote pelo administrador'
                        })
                      });
                      
                      if (response.ok) successCount++;
                    }
                    
                    loadDocuments();
                    alert(`${successCount} documento(s) colocado(s) em análise com sucesso!`);
                  } catch (error) {
                    console.error('Erro:', error);
                    alert('Erro ao processar documentos em lote');
                  }
                }}
              >
                🔍 Colocar Pendentes em Análise
              </button>
            </div>
          </div>

          {/* Documents List */}
          <div className={styles.documentsList}>
            {filteredDocuments.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <GrDocument size={48} />
                </div>
                <h3>Nenhum documento encontrado</h3>
                <p>Não há documentos que correspondam aos filtros selecionados.</p>
              </div>
            ) : (
              filteredDocuments.map((document) => (
                <div key={document._id} className={styles.documentCard}>
                  <div className={styles.documentHeader}>
                    <div className={styles.documentInfo}>
                      <div className={styles.documentTitle}>
                        <h3>{document.title}</h3>
                        <div className={styles.documentMeta}>
                          <div className={styles.metaItem}>
                            <GrUser size={14} />
                            <span>{document.candidateId.name}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <GrDocument size={14} />
                            <span>{document.type}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <GrCalendar size={14} />
                            <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <span>{formatFileSize(document.fileSize)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.documentStatus}>
                      {getStatusBadge(document.status)}
                      {getPriorityBadge(document.priority)}
                    </div>
                  </div>

                  <div className={styles.documentContent}>
                    {document.description && (
                      <p>{document.description}</p>
                    )}

                    {/* Validation Results */}
                    {document.validationResults && (
                      <div className={styles.validationInfo}>
                        <h4>Status da Validação:</h4>
                        <div className={styles.validationDetails}>
                          <div className={styles.validationItem}>
                            <span className={document.validationResults.fileIntegrity ? styles.valid : styles.invalid}>
                              {document.validationResults.fileIntegrity ? '✅' : '❌'} Integridade
                            </span>
                          </div>
                          <div className={styles.validationItem}>
                            <span className={document.validationResults.formatValid ? styles.valid : styles.invalid}>
                              {document.validationResults.formatValid ? '✅' : '❌'} Formato
                            </span>
                          </div>
                          <div className={styles.validationItem}>
                            <span className={document.validationResults.sizeValid ? styles.valid : styles.invalid}>
                              {document.validationResults.sizeValid ? '✅' : '❌'} Porte
                            </span>
                          </div>
                        </div>
                        {document.validationResults.errors && document.validationResults.errors.length > 0 && (
                          <div className={styles.validationErrors}>
                            <strong>Erros:</strong>
                            <ul>
                              {document.validationResults.errors.map((error: string, index: number) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Comments */}
                    {document.adminComments && (
                      <div className={styles.adminComments}>
                        <h4>Comentários:</h4>
                        <p>{document.adminComments}</p>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {document.rejectionReason && (
                      <div className={styles.rejectionReason}>
                        <h4>Motivo da Rejeição:</h4>
                        <p>{document.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  <div className={styles.documentActions}>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => openModal(document, 'view')}
                    >
                      <GrView size={16} />
                      Visualizar
                    </button>
                    
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => openModal(document, 'change_status')}
                    >
                      🔄 Mudar Status
                    </button>
                    
                    {document.status === 'pending' && (
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={async () => {
                          try {
                            const token = AuthService.getToken();
                            if (!token) throw new Error('Token não encontrado');
                            
                            const response = await fetch(`/api/admin/documents/${document._id}/status`, {
                              method: 'PUT',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ 
                                status: 'under_review',
                                comments: 'Documento colocado em análise pelo administrador'
                              })
                            });
                            
                            if (response.ok) {
                              loadDocuments();
                              alert('Documento colocado em análise!');
                            } else {
                              throw new Error('Erro ao alterar status');
                            }
                          } catch (error) {
                            console.error('Erro:', error);
                            alert('Erro ao colocar documento em análise');
                          }
                        }}
                      >
                        🔍 Em Análise
                      </button>
                    )}
                    
                    {document.status === 'pending' || document.status === 'under_review' ? (
                      <>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => openModal(document, 'approve')}
                        >
                          <GrCheckmark size={16} />
                          Aprovar
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => openModal(document, 'reject')}
                        >
                          <GrClose size={16} />
                          Rejeitar
                        </button>
                      </>
                    ) : (
                      <div className={styles.verifiedInfo}>
                        {document.verifiedBy && (
                          <span>Verificado por: {document.verifiedBy.name}</span>
                        )}
                        {document.verifiedAt && (
                          <span>em {new Date(document.verifiedAt).toLocaleDateString()}</span>
                        )}
                        
                        {(document.status === 'verified' || document.status === 'rejected') && (
                          <button 
                            className="btn btn-outline btn-xs"
                            onClick={async () => {
                              try {
                                const token = AuthService.getToken();
                                if (!token) throw new Error('Token não encontrado');
                                
                                const response = await fetch(`/api/admin/documents/${document._id}/status`, {
                                  method: 'PUT',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ 
                                    status: 'under_review',
                                    comments: 'Status revertido para análise pelo administrador'
                                  })
                                });
                                
                                if (response.ok) {
                                  loadDocuments();
                                  alert('Documento retornado para análise!');
                                } else {
                                  throw new Error('Erro ao alterar status');
                                }
                              } catch (error) {
                                console.error('Erro:', error);
                                alert('Erro ao retornar documento para análise');
                              }
                            }}
                            style={{ marginTop: '8px' }}
                          >
                            🔄 Retornar para Análise
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                className="btn btn-outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Anterior
              </button>
              
              <span className={styles.pageInfo}>
                Página {currentPage} de {totalPages}
              </span>
              
              <button 
                className="btn btn-outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && selectedDocument && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>
                {modalType === 'view' && 'Visualizar Documento'}
                {modalType === 'approve' && 'Aprovar Documento'}
                {modalType === 'reject' && 'Rejeitar Documento'}
                {modalType === 'change_status' && 'Mudar Status do Documento'}
              </h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                <GrClose size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.documentPreview}>
                <h3>{selectedDocument.title}</h3>
                <p><strong>Candidato:</strong> {selectedDocument.candidateId.name}</p>
                <p><strong>E-mail:</strong> {selectedDocument.candidateId.email}</p>
                <p><strong>Tipo:</strong> {selectedDocument.type}</p>
                <p><strong>Porte:</strong> {formatFileSize(selectedDocument.fileSize)}</p>
                <p><strong>Enviado em:</strong> {new Date(selectedDocument.createdAt).toLocaleString()}</p>
                
                {selectedDocument.description && (
                  <div className={styles.description}>
                    <strong>Descrição:</strong>
                    <p>{selectedDocument.description}</p>
                  </div>
                )}
              </div>

              {modalType === 'approve' && (
                <div className={styles.approveForm}>
                  <label>
                    <strong>Comentários (opcional):</strong>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Adicione comentários sobre a aprovação..."
                      rows={4}
                    />
                  </label>
                </div>
              )}

              {modalType === 'reject' && (
                <div className={styles.rejectForm}>
                  <label>
                    <strong>Motivo da rejeição *:</strong>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                    >
                      <option value="">Selecione um motivo</option>
                      <option value="documento_invalido">Documento inválido ou corrompido</option>
                      <option value="formato_nao_aceito">Formato não aceito</option>
                      <option value="tamanho_excedido">Porte excedido</option>
                      <option value="conteudo_inadequado">Conteúdo inadequado</option>
                      <option value="documento_duplicado">Documento duplicado</option>
                      <option value="qualidade_baixa">Qualidade muito baixa</option>
                      <option value="outro">Outro motivo</option>
                    </select>
                  </label>
                  
                  <label>
                    <strong>Comentários adicionais:</strong>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Explique o motivo da rejeição..."
                      rows={4}
                    />
                  </label>
                </div>
              )}

              {modalType === 'change_status' && (
                <div className={styles.changeStatusForm}>
                  <label>
                    <strong>Novo Status *:</strong>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      required
                    >
                      <option value="">Selecione um status</option>
                      <option value="pending">⏳ Pendente</option>
                      <option value="under_review">🔍 Em Análise</option>
                      <option value="verified">✅ Aprovado</option>
                      <option value="rejected">❌ Rejeitado</option>
                    </select>
                  </label>
                  
                  {newStatus === 'rejected' && (
                    <label>
                      <strong>Motivo da rejeição *:</strong>
                      <select
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                      >
                        <option value="">Selecione um motivo</option>
                        <option value="documento_invalido">Documento inválido ou corrompido</option>
                        <option value="formato_nao_aceito">Formato não aceito</option>
                        <option value="tamanho_excedido">Porte excedido</option>
                        <option value="conteudo_inadequado">Conteúdo inadequado</option>
                        <option value="documento_duplicado">Documento duplicado</option>
                        <option value="qualidade_baixa">Qualidade muito baixa</option>
                        <option value="outro">Outro motivo</option>
                      </select>
                    </label>
                  )}
                  
                  <label>
                    <strong>Comentários (opcional):</strong>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Adicione comentários sobre a mudança de status..."
                      rows={4}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button 
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              
              {modalType === 'approve' && (
                <button 
                  className="btn btn-primary"
                  onClick={handleApproveDocument}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Aprovando...' : 'Aprovar Documento'}
                </button>
              )}
              
              {modalType === 'reject' && (
                <button 
                  className="btn btn-danger"
                  onClick={handleRejectDocument}
                  disabled={actionLoading || !rejectionReason}
                >
                  {actionLoading ? 'Rejeitando...' : 'Rejeitar Documento'}
                </button>
              )}

              {modalType === 'change_status' && (
                <button 
                  className="btn btn-primary"
                  onClick={handleChangeStatus}
                  disabled={actionLoading || !newStatus || (newStatus === 'rejected' && !rejectionReason)}
                >
                  {actionLoading ? 'Alterando...' : 'Alterar Status'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
