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
  id: string;
  name: string;
  type: string;
  category?: 'sent' | 'received';
  size?: string;
  format?: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  feedback?: string;
  downloadUrl?: string;
  version?: number;
  tags?: string[];
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
    loadDocuments();
  }, [router]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) return;

      const response = await ApiService.getCandidateDocuments(user.id) as any;
      
      if (response.success) {
        // Converter dados da API para o formato esperado pela interface
        const apiDocuments = response.data.map((doc: any) => ({
          id: doc.id || doc._id,
          name: doc.name,
          type: doc.type,
          category: 'sent', // Documentos enviados pelo candidato
          size: doc.size || '',
          format: doc.format || '',
          uploadDate: new Date(doc.uploadedAt).toISOString().split('T')[0],
          status: doc.status,
          description: doc.description || '',
          feedback: doc.feedback || '',
          downloadUrl: doc.url,
          version: doc.version || 1,
          tags: doc.tags || []
        }));

        setDocuments(apiDocuments);
      } else {
        setError('Erro ao carregar documentos');
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setError('Erro ao carregar documentos');
      // Fallback para array vazio em caso de erro
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

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      // Simular upload
      const newDoc: Document = {
        id: Date.now() + Math.random().toString(), // Gerar um ID único para simulação
        name: file.name,
        type: 'other',
        category: 'sent',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        format: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        description: 'Documento enviado para análise',
        tags: ['novo', 'pendente']
      };
      
      setDocuments(prev => [newDoc, ...prev]);
    });
    
    setShowUploadModal(false);
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
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !selectedType || doc.type === selectedType;
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    const matchesCategory = activeTab === 'enviados' ? doc.category === 'sent' : doc.category === 'received';
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const stats = {
    total: documents.filter(d => d.category === 'sent').length,
    approved: documents.filter(d => d.category === 'sent' && d.status === 'approved').length,
    pending: documents.filter(d => d.category === 'sent' && d.status === 'pending').length,
    received: documents.filter(d => d.category === 'received').length
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
                <h3>{documents.filter(d => d.status === 'approved').length}</h3>
                <p>Aprovados</p>
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

          {/* Navigation Tabs */}
          <div className={styles.tabsSection}>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'enviados' ? styles.active : ''}`}
                onClick={() => setActiveTab('enviados')}
              >
                <GrUpload size={18} />
                Documentos Enviados
                <span className={styles.tabBadge}>{documents.filter(d => d.category === 'sent').length}</span>
              </button>
              
              <button 
                className={`${styles.tab} ${activeTab === 'recebidos' ? styles.active : ''}`}
                onClick={() => setActiveTab('recebidos')}
              >
                <GrDownload size={18} />
                Documentos Recebidos
                <span className={styles.tabBadge}>{documents.filter(d => d.category === 'received').length}</span>
              </button>
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
              <div key={document.id} className={styles.documentCard}>
                <div className={styles.documentHeader}>
                  <div className={styles.documentInfo}>
                    <div className={styles.documentTitle}>
                      <h3>{document.name}</h3>
                      <div className={styles.documentMeta}>
                        <div className={styles.metaItem}>
                          <GrDocument size={14} />
                          <span>{document.type}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <GrClock size={14} />
                          <span>{document.uploadDate}</span>
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
                    <div 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(document.status) }}
                    >
                      {getStatusText(document.status)}
                    </div>
                  </div>
                </div>

                <div className={styles.documentContent}>
                  {document.description && (
                    <p>{document.description}</p>
                  )}
                  
                  {document.tags && document.tags.length > 0 && (
                    <div className={styles.documentTags}>
                      {document.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {document.feedback && (
                    <div className={styles.feedback}>
                      <h4>Feedback do Admin:</h4>
                      <p>&ldquo;{document.feedback}&rdquo;</p>
                    </div>
                  )}
                </div>

                <div className={styles.documentActions}>
                  {document.downloadUrl && (
                    <a 
                      href={document.downloadUrl}
                      className="btn btn-secondary btn-small"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GrDownload size={16} />
                      Download
                    </a>
                  )}
                  
                  <button className="btn btn-primary btn-small">
                    <GrView size={16} />
                    Visualizar
                  </button>
                  
                  {document.category === 'sent' && (
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