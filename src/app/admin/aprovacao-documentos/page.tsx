'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { GrDocument, GrStatusGood, GrClose, GrView, GrSearch, GrFilter, GrClock, GrUser, GrDownload, GrEdit, GrUpload } from 'react-icons/gr';
import styles from './aprovacao-documentos.module.css';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    type: 'candidato' | 'empresa';
  };
}

export default function AdminAprovacaoDocumentosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterType, setFilterType] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadDocuments();
  }, [router]);

  const loadDocuments = async () => {
    try {
      // Simular carregamento de documentos
      // Esta função seria conectada à API real
      const mockDocuments: Document[] = [
        {
          id: '1',
          name: 'Curriculo_JoaoSilva.pdf',
          type: 'curriculum',
          url: 'https://example.com/doc1.pdf',
          status: 'pending',
          uploadedAt: '2024-12-15T10:00:00Z',
          userId: {
            _id: 'user1',
            name: 'João Silva',
            email: 'joao@email.com',
            type: 'candidato'
          }
        },
        {
          id: '2',
          name: 'Certificado_AWS.pdf',
          type: 'certificate',
          url: 'https://example.com/doc2.pdf',
          status: 'pending',
          uploadedAt: '2024-12-14T15:30:00Z',
          userId: {
            _id: 'user2',
            name: 'Maria Santos',
            email: 'maria@email.com',
            type: 'candidato'
          }
        },
        {
          id: '3',
          name: 'Portfolio_Designer.pdf',
          type: 'portfolio',
          url: 'https://example.com/doc3.pdf',
          status: 'approved',
          uploadedAt: '2024-12-13T09:15:00Z',
          reviewedBy: 'Admin',
          reviewedAt: '2024-12-13T14:20:00Z',
          feedback: 'Portfolio excelente, muito bem organizado!',
          userId: {
            _id: 'user3',
            name: 'Ana Costa',
            email: 'ana@email.com',
            type: 'candidato'
          }
        }
      ];

      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setErrorMessage('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDocument = async (documentId: string) => {
    if (!feedback.trim()) {
      setErrorMessage('Feedback é obrigatório para aprovação');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    setActionLoading(documentId);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status: 'approved' as const,
              reviewedBy: user?.name || 'Admin',
              reviewedAt: new Date().toISOString(),
              feedback
            }
          : doc
      ));

      setSuccessMessage('Documento aprovado com sucesso!');
      setFeedback('');
      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Erro ao aprovar documento:', error);
      setErrorMessage('Erro ao aprovar documento');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectDocument = async (documentId: string) => {
    if (!feedback.trim()) {
      setErrorMessage('Motivo da rejeição é obrigatório');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    setActionLoading(documentId);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status: 'rejected' as const,
              reviewedBy: user?.name || 'Admin',
              reviewedAt: new Date().toISOString(),
              feedback
            }
          : doc
      ));

      setSuccessMessage('Documento rejeitado');
      setFeedback('');
      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Erro ao rejeitar documento:', error);
      setErrorMessage('Erro ao rejeitar documento');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.userId.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || doc.status === filterStatus;
    const matchesType = !filterType || doc.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <GrStatusGood size={16} className={styles.statusApproved} />;
      case 'rejected':
        return <GrClose size={16} className={styles.statusRejected} />;
      case 'pending':
        return <GrClock size={16} className={styles.statusPending} />;
      default:
        return <GrClock size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'curriculum': return 'Currículo';
      case 'certificate': return 'Certificado';
      case 'portfolio': return 'Portfólio';
      case 'diploma': return 'Diploma';
      case 'identity': return 'Documento de Identidade';
      case 'recommendation': return 'Carta de Recomendação';
      default: return type;
    }
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
              <h1>Aprovação de Documentos</h1>
              <p>Revise e aprove documentos enviados pelos usuários</p>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{documents.filter(d => d.status === 'pending').length}</h3>
                <p>Pendentes</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{documents.filter(d => d.status === 'approved').length}</h3>
                <p>Aprovados</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClose size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{documents.filter(d => d.status === 'rejected').length}</h3>
                <p>Rejeitados</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrDocument size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{documents.length}</h3>
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
                  placeholder="Buscar por documento, usuário ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className={styles.filters}>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="pending">Pendentes</option>
                  <option value="approved">Aprovados</option>
                  <option value="rejected">Rejeitados</option>
                </select>

                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  <option value="curriculum">Currículo</option>
                  <option value="certificate">Certificado</option>
                  <option value="portfolio">Portfólio</option>
                  <option value="diploma">Diploma</option>
                  <option value="identity">Identidade</option>
                  <option value="recommendation">Recomendação</option>
                </select>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className={styles.documentsList}>
            {filteredDocuments.length === 0 ? (
              <div className={styles.emptyState}>
                <GrDocument size={48} />
                <h3>Nenhum documento encontrado</h3>
                <p>Ajuste os filtros ou aguarde novos envios.</p>
              </div>
            ) : (
              filteredDocuments.map((document) => (
                <div key={document.id} className={styles.documentCard}>
                  <div className={styles.documentHeader}>
                    <div className={styles.documentInfo}>
                      <div className={styles.documentIcon}>
                        <GrDocument size={20} />
                      </div>
                      <div className={styles.documentDetails}>
                        <h3>{document.name}</h3>
                        <p>{getTypeText(document.type)}</p>
                        <div className={styles.documentMeta}>
                          <div className={styles.metaItem}>
                            <GrUser size={14} />
                            <span>{document.userId.name}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <GrUpload size={14} />
                            <span>{new Date(document.uploadedAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.documentStatus}>
                      <div className={`${styles.status} ${styles[document.status]}`}>
                        {getStatusIcon(document.status)}
                        <span>{getStatusText(document.status)}</span>
                      </div>
                    </div>
                  </div>

                  {document.feedback && (
                    <div className={styles.documentFeedback}>
                      <h4>Feedback:</h4>
                      <p>"{document.feedback}"</p>
                      <small>
                        Por {document.reviewedBy} em {new Date(document.reviewedAt!).toLocaleDateString('pt-BR')}
                      </small>
                    </div>
                  )}

                  <div className={styles.documentActions}>
                    <a 
                      href={document.url}
                      className="btn btn-secondary btn-small"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GrDownload size={16} />
                      Download
                    </a>
                    
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => {
                        setSelectedDocument(document);
                        setFeedback(document.feedback || '');
                        setShowModal(true);
                      }}
                    >
                      <GrView size={16} />
                      Revisar
                    </button>
                    
                    {document.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success btn-small"
                          onClick={() => handleApproveDocument(document.id)}
                          disabled={actionLoading === document.id}
                        >
                          {actionLoading === document.id ? (
                            <div className={styles.spinner}></div>
                          ) : (
                            <>
                              <GrStatusGood size={16} />
                              Aprovar
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal de Revisão */}
      {showModal && selectedDocument && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Revisar Documento</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.documentDetailSection}>
                <h3>Informações do Documento</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>Nome:</label>
                    <span>{selectedDocument.name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Tipo:</label>
                    <span>{getTypeText(selectedDocument.type)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Usuário:</label>
                    <span>{selectedDocument.userId.name} ({selectedDocument.userId.email})</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Enviado em:</label>
                    <span>{new Date(selectedDocument.uploadedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className={styles.feedbackSection}>
                <h3>Feedback</h3>
                <textarea
                  className={styles.feedbackInput}
                  placeholder="Digite seu feedback sobre o documento..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
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
              
              <a 
                href={selectedDocument.url}
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GrDownload size={16} />
                Visualizar
              </a>
              
              {selectedDocument.status === 'pending' && (
                <>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRejectDocument(selectedDocument.id)}
                    disabled={actionLoading === selectedDocument.id || !feedback.trim()}
                  >
                    {actionLoading === selectedDocument.id ? (
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
                    onClick={() => handleApproveDocument(selectedDocument.id)}
                    disabled={actionLoading === selectedDocument.id || !feedback.trim()}
                  >
                    {actionLoading === selectedDocument.id ? (
                      <div className={styles.spinner}></div>
                    ) : (
                      <>
                        <GrStatusGood size={16} />
                        Aprovar
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
