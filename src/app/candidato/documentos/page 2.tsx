'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrUpload, GrDocument, GrDownload, GrView, GrTrash, GrAdd, GrSearch, GrFilter, GrCalendar, GrClock, GrStatusGood, GrStatusWarning, GrStatusCritical, GrUser, GrNotification, GrLogout, GrSend, GrStar, GrMore, GrShare, GrFolderOpen, GrLineChart, GrTrophy, GrEdit, GrImage, GrVideo, GrInbox } from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import styles from './documentos.module.css';

interface Document {
  _id: string;
  id?: string; // Para compatibilidade com código existente
  type: 'cv' | 'certificate' | 'contract' | 'form' | 'passport' | 'visa' | 'diploma' | 'other';
  fileType: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png' | 'txt';
  title: string;
  name?: string; // Para compatibilidade com código existente
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
  category?: 'sent' | 'received'; // Para compatibilidade com código existente
  uploadDate?: string; // Para compatibilidade com código existente
  size?: string; // Para compatibilidade com código existente
  tags?: string[]; // Para compatibilidade com código existente
  feedback?: string; // Para compatibilidade com código existente
  downloadUrl?: string; // Para compatibilidade com código existente
}

export default function CandidatoDocumentos() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enviados');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      console.log('🔍 Carregando documentos para usuário:', user._id);

      const token = AuthService.getToken();
      if (!token) {
        console.error('❌ Token não encontrado');
        setError('Token de autenticação não encontrado');
        return;
      }

      console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');

      const response = await fetch(`/api/candidates/${user._id}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📄 Resultado da API:', result);
        
        if (result.success) {
          console.log('✅ Documentos carregados:', result.data.length);
          console.log('📋 Documentos:', result.data.map((d: any) => ({ 
            title: d.title, 
            uploadedBy: d.uploadedBy, 
            status: d.status 
          })));
          setDocuments(result.data);
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

  const handleLogout = () => {
    AuthService.logout();
    router.push('/');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!user?._id) return;

    for (const file of Array.from(files)) {
      try {
        // Converter arquivo para base64
        const base64 = await fileToBase64(file);
        
        // Determinar tipo de arquivo
        const fileType = getFileType(file.name);
        
        // Preparar dados do documento
        const documentData = {
          title: file.name,
          type: 'other', // Pode ser melhorado para detectar tipo automaticamente
          fileType: fileType,
          fileName: file.name,
          fileUrl: base64,
          fileSize: file.size,
          mimeType: file.type,
          description: 'Documento enviado para análise'
        };

        // Fazer upload via API
        const token = AuthService.getToken();
        if (!token) {
          console.error('❌ Token não encontrado para upload');
          alert('Token de autenticação não encontrado');
          return;
        }

        const response = await fetch(`/api/candidates/${user._id}/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(documentData)
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Recarregar documentos
            await loadDocuments();
          } else {
            alert('Erro ao enviar documento: ' + result.message);
          }
        } else {
          alert('Erro ao enviar documento');
        }
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        alert('Erro ao processar arquivo');
      }
    }
    
    setShowUploadModal(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'doc': return 'doc';
      case 'docx': return 'docx';
      case 'jpg':
      case 'jpeg': return 'jpg';
      case 'png': return 'png';
      case 'txt': return 'txt';
      default: return 'pdf';
    }
  };

  const handleViewDocument = (doc: Document) => {
    if (doc.fileUrl && !doc.fileUrl.startsWith('http')) {
      try {
        // Para arquivos base64, abrir em nova aba
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <GrStatusGood size={16} className={styles.statusApproved} />;
      case 'rejected':
        return <GrStatusCritical size={16} className={styles.statusRejected} />;
      case 'under_review':
        return <GrClock size={16} className={styles.statusReview} />;
      case 'pending':
        return <GrStatusWarning size={16} className={styles.statusPending} />;
      default:
        return <GrClock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Em Análise';
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
      case 'other': return 'Outro';
      default: return type;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = (doc.title || doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !selectedType || doc.type === selectedType;
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    const matchesCategory = activeTab === 'enviados' ? doc.uploadedBy === 'candidate' : doc.uploadedBy === 'admin';
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const stats = {
    total: documents.filter(d => d.uploadedBy === 'candidate').length,
    approved: documents.filter(d => d.uploadedBy === 'candidate' && d.status === 'verified').length,
    pending: documents.filter(d => d.uploadedBy === 'candidate' && d.status === 'pending').length,
    received: documents.filter(d => d.uploadedBy === 'admin').length
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
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Meus Documentos</h1>
              <p>Gerencie seus documentos e acompanhe o status de análise</p>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                <GrUpload size={20} />
                Enviar Documento
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrDocument size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{documents.length}</h3>
                <p>Total de Documentos</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{documents.filter(d => d.status === 'verified').length}</h3>
                <p>Verificados</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{documents.filter(d => d.status === 'pending').length}</h3>
                <p>Em Análise</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusWarning size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{documents.filter(d => d.status === 'rejected').length}</h3>
                <p>Rejeitados</p>
              </div>
            </div>
          </div>

          {/* Documentos Info */}
          <div className={styles.documentsInfo}>
            <div className={styles.infoCard}>
              <GrUpload size={20} />
              <span>Enviados: {documents.filter(d => d.uploadedBy === 'candidate').length}</span>
            </div>
            <div className={styles.infoCard}>
              <GrDownload size={20} />
              <span>Recebidos: {documents.filter(d => d.uploadedBy === 'admin').length}</span>
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
                  <option value="curriculum">Currículo</option>
                  <option value="certificate">Certificado</option>
                  <option value="portfolio">Portfólio</option>
                  <option value="diploma">Diploma</option>
                  <option value="other">Outro</option>
                </select>
                
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="approved">Aprovado</option>
                  <option value="pending">Em Análise</option>
                  <option value="rejected">Reprovado</option>
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
                  <GrDocument size={48} />
                </div>
                <h3>Nenhum documento encontrado</h3>
                <p>
                  {activeTab === 'enviados' 
                    ? 'Você ainda não enviou nenhum documento. Comece enviando seu currículo ou certificados.'
                    : 'Você ainda não recebeu nenhum documento do admin.'
                  }
                </p>
                {activeTab === 'enviados' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <GrUpload size={16} />
                    Enviar Primeiro Documento
                  </button>
                )}
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
                          <GrClock size={14} />
                          <span>{document.uploadDate || new Date(document.createdAt).toLocaleDateString()}</span>
                        </div>
                        {document.size && (
                          <div className={styles.metaItem}>
                            <span>{document.size}</span>
                          </div>
                        )}
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

                  {/* Informações de validação */}
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
                    </div>
                  )}

                  {/* Comentários do admin */}
                  {document.adminComments && (
                    <div className={styles.adminComments}>
                      <h4>Comentários do Administrador:</h4>
                      <p>{document.adminComments}</p>
                    </div>
                  )}

                  {/* Motivo da rejeição */}
                  {document.rejectionReason && (
                    <div className={styles.rejectionReason}>
                      <h4>Motivo da Rejeição:</h4>
                      <p>{document.rejectionReason}</p>
                    </div>
                  )}
                  
                  {document.tags && document.tags.length > 0 && (
                    <div className={styles.documentTags}>
                      {document.tags.map((tag: string, index: number) => (
                        <span key={index} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {document.adminComments && (
                    <div className={styles.feedback}>
                      <h4>Feedback do Admin:</h4>
                      <p>&ldquo;{document.adminComments}&rdquo;</p>
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
                  
                  {document.uploadedBy === 'candidate' && (
                    <button className="btn btn-danger btn-small">
                      <GrTrash size={16} />
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUploadModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Enviar Documento</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div 
                className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <GrUpload size={48} />
                <h3>Arraste arquivos aqui ou clique para selecionar</h3>
                <p>Suportamos PDF, DOC, DOCX, JPG, PNG e ZIP até 25MB</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  style={{ display: 'none' }}
                />
              </div>
              
              <div className={styles.uploadTips}>
                <h4>Dicas para upload:</h4>
                <ul>
                  <li>• Use nomes descritivos para seus arquivos</li>
                  <li>• Currículos em PDF têm melhor compatibilidade</li>
                  <li>• Certificados devem estar em alta resolução</li>
                  <li>• Portfólios podem ser enviados em ZIP</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 