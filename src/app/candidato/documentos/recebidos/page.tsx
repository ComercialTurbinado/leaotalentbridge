'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GrDownload, GrDocument, GrView, GrSearch, GrFilter, GrCalendar, GrClock, GrStatusGood, GrStatusWarning, GrStatusCritical, GrUser, GrNotification, GrLogout, GrSend, GrStar, GrMore, GrShare, GrFolderOpen, GrLineChart, GrTrophy, GrEdit, GrImage, GrVideo, GrInbox, GrFormPrevious, GrUserAdmin } from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import styles from './recebidos.module.css';

interface Document {
  _id: string;
  id?: string;
  type: 'cv' | 'certificate' | 'contract' | 'form' | 'passport' | 'visa' | 'diploma' | 'other';
  fileType: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png' | 'txt';
  title: string;
  name?: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'verified' | 'rejected' | 'under_review';
  priority: 'low' | 'medium' | 'high';
  uploadedBy: 'candidate' | 'admin';
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: {
    _id: string;
    name: string;
  };
  adminComments?: string;
  rejectionReason?: string;
  validationResults?: {
    fileIntegrity: boolean;
    formatValid: boolean;
    sizeValid: boolean;
    contentValid?: boolean;
    errors: string[];
  };
}

export default function CandidatoDocumentosRecebidos() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  useEffect(() => {
    if (user?._id) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?._id) {
        console.log('❌ Usuário não definido');
        return;
      }

      console.log('🔍 Carregando documentos recebidos para usuário:', user._id);

      const token = AuthService.getToken();
      if (!token) {
        console.error('❌ Token não encontrado');
        setError('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch(`/api/candidates/${user._id}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Filtrar apenas documentos enviados pelo admin
          const receivedDocuments = result.data.filter((doc: Document) => doc.uploadedBy === 'admin');
          console.log('✅ Documentos recebidos carregados:', receivedDocuments.length);
          setDocuments(receivedDocuments);
        } else {
          console.error('❌ Erro na resposta da API:', result.message);
          setError('Erro ao carregar documentos');
        }
      } else {
        console.error('❌ Erro HTTP:', response.status);
        setError('Erro ao carregar documentos');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar documentos:', error);
      setError('Erro ao carregar documentos');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (doc: Document) => {
    if (doc.fileUrl && !doc.fileUrl.startsWith('http')) {
      try {
        const base64Data = doc.fileUrl.includes(',') ? doc.fileUrl.split(',')[1] : doc.fileUrl;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: doc.mimeType || 'application/octet-stream' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (error) {
        console.error('Erro ao visualizar documento:', error);
        alert('Erro ao visualizar documento');
      }
    } else if (doc.fileUrl && doc.fileUrl.startsWith('http')) {
      window.open(doc.fileUrl, '_blank');
    } else {
      alert('Documento não pode ser visualizado');
    }
  };

  const handleDownloadDocument = (doc: Document) => {
    if (doc.fileUrl && !doc.fileUrl.startsWith('http')) {
      try {
        const base64Data = doc.fileUrl.includes(',') ? doc.fileUrl.split(',')[1] : doc.fileUrl;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: doc.mimeType || 'application/octet-stream' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = doc.fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (error) {
        console.error('Erro ao baixar documento:', error);
        alert('Erro ao baixar documento');
      }
    } else if (doc.fileUrl && doc.fileUrl.startsWith('http')) {
      window.open(doc.fileUrl, '_blank');
    } else {
      alert('Documento não pode ser baixado');
    }
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

  const getFileIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <GrDocument size={20} />;
      case 'doc':
      case 'docx':
        return <GrDocument size={20} />;
      case 'xls':
      case 'xlsx':
        return <GrDocument size={20} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <GrImage size={20} />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <GrVideo size={20} />;
      default:
        return <GrDocument size={20} />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = (doc.title || doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !selectedType || doc.type === selectedType;
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'verified').length,
    pending: documents.filter(d => d.status === 'pending').length,
    underReview: documents.filter(d => d.status === 'under_review').length,
    rejected: documents.filter(d => d.status === 'rejected').length
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
    <div className={styles.documentosPage}>
      <DashboardHeader user={user} userType="candidato" />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className="container">
          {/* Navigation Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link href="/candidato/documentos" className={styles.breadcrumbLink}>
              <GrFormPrevious size={16} />
              Voltar para Documentos
            </Link>
          </div>

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Documentos Recebidos</h1>
              <p>Visualize os documentos enviados pelo administrador</p>
            </div>
            
            <div className={styles.headerActions}>
              <div className={styles.adminInfo}>
                <GrUserAdmin size={20} />
                <span>Documentos do Administrador</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrDocument size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.total}</h3>
                <p>Total Recebidos</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.approved}</h3>
                <p>Aprovados</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.pending + stats.underReview}</h3>
                <p>Em Análise</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusWarning size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.rejected}</h3>
                <p>Rejeitados</p>
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
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className={styles.filters}>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  <option value="cv">Currículo</option>
                  <option value="passport">Passaporte</option>
                  <option value="diploma">Diploma</option>
                  <option value="visa">Visto</option>
                  <option value="certificate">Certificado</option>
                  <option value="other">Outro</option>
                </select>
                
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="pending">Pendente</option>
                  <option value="under_review">Em Análise</option>
                  <option value="verified">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className={styles.documentsList}>
            {error && (
              <div className={styles.errorMessage}>
                <p>{error}</p>
                <button onClick={loadDocuments} className="btn btn-secondary btn-small">
                  Tentar Novamente
                </button>
              </div>
            )}

            {filteredDocuments.length === 0 && !error && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <GrInbox size={48} />
                </div>
                <h3>Nenhum documento recebido</h3>
                <p>Você ainda não recebeu nenhum documento do administrador.</p>
                <div className={styles.emptyStateInfo}>
                  <p>Os documentos enviados pelo administrador aparecerão aqui quando disponíveis.</p>
                  <p>Entre em contato com o suporte se precisar de documentos específicos.</p>
                </div>
              </div>
            )}

            {filteredDocuments.map((document) => (
              <div key={document._id || document.id} className={styles.documentCard}>
                <div className={styles.documentHeader}>
                  <div className={styles.documentInfo}>
                    <div className={styles.documentTitle}>
                      <h3>{document.title || document.name}</h3>
                      <div className={styles.documentMeta}>
                        <div className={styles.metaItem}>
                          <GrDocument size={14} />
                          <span>{document.type}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <GrCalendar size={14} />
                          <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span>{Math.round(document.fileSize / 1024)} KB</span>
                        </div>
                        <div className={styles.metaItem}>
                          <GrUserAdmin size={14} />
                          <span>Enviado pelo Admin</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.documentStatus}>
                    {getStatusBadge(document.status)}
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
                            {document.validationResults.fileIntegrity ? '✅' : '❌'} Integridade do arquivo
                          </span>
                        </div>
                        <div className={styles.validationItem}>
                          <span className={document.validationResults.formatValid ? styles.valid : styles.invalid}>
                            {document.validationResults.formatValid ? '✅' : '❌'} Formato válido
                          </span>
                        </div>
                        <div className={styles.validationItem}>
                          <span className={document.validationResults.sizeValid ? styles.valid : styles.invalid}>
                            {document.validationResults.sizeValid ? '✅' : '❌'} Porte válido
                          </span>
                        </div>
                      </div>
                      {document.validationResults.errors && document.validationResults.errors.length > 0 && (
                        <div className={styles.validationErrors}>
                          <strong>Erros encontrados:</strong>
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
                      <h4>Comentários do Administrador:</h4>
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
                    className="btn btn-secondary btn-small"
                    onClick={() => handleDownloadDocument(document)}
                  >
                    <GrDownload size={16} />
                    Download
                  </button>
                  
                  <button 
                    className="btn btn-primary btn-small"
                    onClick={() => handleViewDocument(document)}
                  >
                    <GrView size={16} />
                    Visualizar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
