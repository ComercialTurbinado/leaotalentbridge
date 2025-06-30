'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Crown, 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Bell,
  Settings,
  LogOut,
  File,
  FileImage,
  FileSpreadsheet,
  FileVideo,
  Paperclip,
  Send,
  Inbox,
  Archive,
  Star,
  MoreVertical,
  Edit3,
  Share2,
  FolderOpen,
  History,
  TrendingUp,
  Award
} from 'lucide-react';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import styles from './documentos.module.css';

interface Document {
  id: number;
  name: string;
  type: 'curriculum' | 'certificate' | 'diploma' | 'portfolio' | 'other';
  category: 'sent' | 'received';
  size: string;
  format: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
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

  const [documents, setDocuments] = useState<Document[]>([
    // Documentos Enviados
    {
      id: 1,
      name: 'Currículo_João_Silva_2024.pdf',
      type: 'curriculum',
      category: 'sent',
      size: '2.3 MB',
      format: 'PDF',
      uploadDate: '2024-01-15',
      status: 'approved',
      description: 'Currículo atualizado com experiências mais recentes',
      feedback: 'Excelente estrutura e apresentação. Aprovado para processos seletivos.',
      version: 3,
      tags: ['currículo', 'principal', 'aprovado']
    },
    {
      id: 2,
      name: 'Certificado_AWS_Solutions_Architect.pdf',
      type: 'certificate',
      category: 'sent',
      size: '1.8 MB',
      format: 'PDF',
      uploadDate: '2024-01-10',
      status: 'approved',
      description: 'Certificação AWS Solutions Architect Associate',
      feedback: 'Certificação válida e relevante para posições em cloud.',
      tags: ['certificação', 'aws', 'cloud']
    },
    {
      id: 3,
      name: 'Portfolio_Projetos_2024.zip',
      type: 'portfolio',
      category: 'sent',
      size: '15.7 MB',
      format: 'ZIP',
      uploadDate: '2024-01-08',
      status: 'under_review',
      description: 'Portfolio com projetos desenvolvidos nos últimos 2 anos',
      tags: ['portfolio', 'projetos', 'desenvolvimento']
    },
    {
      id: 4,
      name: 'Diploma_Ciencia_Computacao_USP.pdf',
      type: 'diploma',
      category: 'sent',
      size: '3.1 MB',
      format: 'PDF',
      uploadDate: '2024-01-05',
      status: 'approved',
      description: 'Diploma de Bacharelado em Ciência da Computação - USP',
      feedback: 'Documento validado com sucesso.',
      tags: ['diploma', 'graduação', 'usp']
    },
    
    // Documentos Recebidos
    {
      id: 5,
      name: 'Feedback_Currículo_Análise_Detalhada.pdf',
      type: 'other',
      category: 'received',
      size: '1.2 MB',
      format: 'PDF',
      uploadDate: '2024-01-16',
      status: 'approved',
      description: 'Análise detalhada do currículo com sugestões de melhoria',
      downloadUrl: '#',
      tags: ['feedback', 'análise', 'currículo']
    },
    {
      id: 6,
      name: 'Guia_Preparação_Entrevistas_Dubai.pdf',
      type: 'other',
      category: 'received',
      size: '2.8 MB',
      format: 'PDF',
      uploadDate: '2024-01-12',
      status: 'approved',
      description: 'Guia completo para preparação de entrevistas no mercado de Dubai',
      downloadUrl: '#',
      tags: ['guia', 'entrevistas', 'dubai', 'preparação']
    },
    {
      id: 7,
      name: 'Template_Currículo_Internacional.docx',
      type: 'other',
      category: 'received',
      size: '856 KB',
      format: 'DOCX',
      uploadDate: '2024-01-09',
      status: 'approved',
      description: 'Template otimizado para currículos internacionais',
      downloadUrl: '#',
      tags: ['template', 'currículo', 'internacional']
    },
    {
      id: 8,
      name: 'Checklist_Documentação_Visto_UAE.pdf',
      type: 'other',
      category: 'received',
      size: '1.5 MB',
      format: 'PDF',
      uploadDate: '2024-01-07',
      status: 'approved',
      description: 'Lista completa de documentos necessários para visto de trabalho nos Emirados Árabes',
      downloadUrl: '#',
      tags: ['checklist', 'visto', 'uae', 'documentação']
    }
  ]);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

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
        id: Date.now() + Math.random(),
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
        return <FileText size={20} />;
      case 'doc':
      case 'docx':
        return <FileText size={20} />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet size={20} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage size={20} />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo size={20} />;
      default:
        return <File size={20} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className={styles.statusApproved} />;
      case 'rejected':
        return <XCircle size={16} className={styles.statusRejected} />;
      case 'under_review':
        return <Clock size={16} className={styles.statusReview} />;
      case 'pending':
        return <AlertCircle size={16} className={styles.statusPending} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'under_review':
        return 'Em Análise';
      case 'pending':
        return 'Pendente';
      default:
        return 'Desconhecido';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesTab = activeTab === 'enviados' ? doc.category === 'sent' : doc.category === 'received';
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || doc.type === selectedType;
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    
    return matchesTab && matchesSearch && matchesType && matchesStatus;
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
              <p>Gerencie seus currículos, certificados e documentos recebidos da nossa equipe</p>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload size={16} />
                Enviar Documento
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Send size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.total}</h3>
                <p>Documentos Enviados</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CheckCircle size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.approved}</h3>
                <p>Aprovados</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Clock size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.pending}</h3>
                <p>Pendentes</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Inbox size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.received}</h3>
                <p>Recebidos</p>
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
                <Send size={18} />
                Documentos Enviados
                <span className={styles.tabBadge}>{stats.total}</span>
              </button>
              
              <button 
                className={`${styles.tab} ${activeTab === 'recebidos' ? styles.active : ''}`}
                onClick={() => setActiveTab('recebidos')}
              >
                <Inbox size={18} />
                Documentos Recebidos
                <span className={styles.tabBadge}>{stats.received}</span>
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBar}>
              <div className={styles.searchInput}>
                <Search size={20} />
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
                  <option value="diploma">Diploma</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="other">Outros</option>
                </select>
                
                {activeTab === 'enviados' && (
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">Todos os status</option>
                    <option value="pending">Pendente</option>
                    <option value="under_review">Em Análise</option>
                    <option value="approved">Aprovado</option>
                    <option value="rejected">Rejeitado</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className={styles.documentsSection}>
            <div className={styles.documentsHeader}>
              <h2>
                {filteredDocuments.length} {filteredDocuments.length === 1 ? 'documento' : 'documentos'}
              </h2>
              <div className={styles.viewOptions}>
                <button className={styles.viewBtn}>
                  <FolderOpen size={16} />
                  Lista
                </button>
              </div>
            </div>

            <div className={styles.documentsList}>
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className={styles.documentCard}>
                  <div className={styles.docHeader}>
                    <div className={styles.docIcon}>
                      {getFileIcon(doc.format)}
                    </div>
                    
                    <div className={styles.docInfo}>
                      <h3>{doc.name}</h3>
                      <p className={styles.docDescription}>{doc.description}</p>
                      
                      <div className={styles.docMeta}>
                        <span className={styles.docSize}>{doc.size}</span>
                        <span className={styles.docFormat}>{doc.format}</span>
                        <span className={styles.docDate}>
                          <Calendar size={14} />
                          {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                        </span>
                        {doc.version && (
                          <span className={styles.docVersion}>v{doc.version}</span>
                        )}
                      </div>
                      
                      {doc.tags && (
                        <div className={styles.docTags}>
                          {doc.tags.map((tag, index) => (
                            <span key={index} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.docActions}>
                      {activeTab === 'enviados' && (
                        <div className={styles.docStatus}>
                          {getStatusIcon(doc.status)}
                          <span className={styles.statusText}>
                            {getStatusText(doc.status)}
                          </span>
                        </div>
                      )}
                      
                      <div className={styles.actionButtons}>
                        <button className={styles.actionBtn} title="Visualizar">
                          <Eye size={16} />
                        </button>
                        
                        {doc.downloadUrl && (
                          <button className={styles.actionBtn} title="Download">
                            <Download size={16} />
                          </button>
                        )}
                        
                        {activeTab === 'enviados' && (
                          <>
                            <button className={styles.actionBtn} title="Editar">
                              <Edit3 size={16} />
                            </button>
                            <button className={styles.actionBtn} title="Excluir">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        
                        <button className={styles.actionBtn} title="Mais opções">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {doc.feedback && (
                    <div className={styles.docFeedback}>
                      <div className={styles.feedbackHeader}>
                        <Award size={16} />
                        <span>Feedback da Equipe</span>
                      </div>
                      <p>{doc.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredDocuments.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <FileText size={48} />
                </div>
                <h3>Nenhum documento encontrado</h3>
                <p>
                  {activeTab === 'enviados' 
                    ? 'Você ainda não enviou nenhum documento. Clique em "Enviar Documento" para começar.'
                    : 'Você ainda não recebeu nenhum documento da nossa equipe.'
                  }
                </p>
                {activeTab === 'enviados' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <Upload size={16} />
                    Enviar Primeiro Documento
                  </button>
                )}
              </div>
            )}
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
                <Upload size={48} />
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
                  <li>• Portfolios podem ser enviados em ZIP</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 