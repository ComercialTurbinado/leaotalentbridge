'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import {
  GrUser, GrDocument, GrCalendar, GrConnect, GrStar, GrClock,
  GrMail, GrPhone, GrLocation, GrBriefcase, GrOrganization,
  GrDownload, GrUpload, GrEdit, GrTrash, GrView, GrAdd,
  GrStatusGood, GrStatusCritical, GrClock as GrPending,
  GrCheckmark, GrClose
} from 'react-icons/gr';
import styles from './candidato.module.css';

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

interface Document {
  _id: string;
  type: 'cv' | 'certificate' | 'contract' | 'form' | 'other';
  fileType: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png' | 'txt';
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedBy: 'candidate' | 'admin';
  createdAt: string;
  verifiedAt?: string;
  adminComments?: string;
}

type TabType = 'overview' | 'documents' | 'interviews' | 'connections' | 'evaluations' | 'timeline';

export default function AdminCandidatoPage() {
  const router = useRouter();
  const params = useParams();
  const candidatoId = params?.id as string;

  const [user, setUser] = useState<UserType | null>(null);
  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Estados para documentos
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    type: 'form' as const,
    fileType: 'pdf' as const,
    title: '',
    description: '',
    fileName: '',
    fileUrl: '',
    base64Data: '',
    fileSize: 0,
    mimeType: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Estados para entrevistas
  const [interviews, setInterviews] = useState<any[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    companyId: '',
    jobId: '',
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    type: 'online' as 'presential' | 'online' | 'phone',
    location: '',
    meetingUrl: '',
    interviewerName: '',
    interviewerEmail: '',
    interviewerPhone: '',
    notes: ''
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadCandidato();
  }, [router, candidatoId]);

  const loadCandidato = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${candidatoId}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidato(data.data);
      } else {
        console.error('Erro ao carregar candidato');
        router.push('/admin/candidatos');
      }
    } catch (error) {
      console.error('Erro ao carregar candidato:', error);
      router.push('/admin/candidatos');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!candidatoId) return;
    
    try {
      setDocumentsLoading(true);
      const response = await fetch(`/api/admin/candidates/${candidatoId}/documents`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const loadInterviews = async () => {
    if (!candidatoId) return;
    
    try {
      setInterviewsLoading(true);
      const response = await fetch(`/api/admin/candidates/${candidatoId}/interviews`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInterviews(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar entrevistas:', error);
    } finally {
      setInterviewsLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies', {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/admin/jobs', {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Validar tipo de arquivo
      const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        alert('Tipo de arquivo não permitido. Tipos aceitos: PDF, DOC, DOCX, JPG, PNG, TXT');
        return;
      }

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande. Tamanho máximo: 10MB');
        return;
      }

      // Atualizar formulário
      setDocumentForm(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        fileType: fileExtension as any
      }));
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove o prefixo "data:application/pdf;base64," para obter apenas o base64
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo');
      return;
    }

    try {
      setUploading(true);
      
      // Converter arquivo para base64
      const base64Data = await convertFileToBase64(selectedFile);
      
      const documentData = {
        ...documentForm,
        base64Data,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type
      };

      const response = await fetch(`/api/admin/candidates/${candidatoId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(documentData)
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments([data.data, ...documents]);
        setShowDocumentModal(false);
        setDocumentForm({
          type: 'form',
          fileType: 'pdf',
          title: '',
          description: '',
          fileName: '',
          fileUrl: '',
          base64Data: '',
          fileSize: 0,
          mimeType: ''
        });
        setSelectedFile(null);
      } else {
        const errorData = await response.json();
        alert(`Erro ao criar documento: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      alert('Erro ao processar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = (doc: Document) => {
    console.log('🔍 Tentando visualizar documento:', doc);
    console.log('📁 fileUrl:', doc.fileUrl);
    console.log('📄 fileName:', doc.fileName);
    console.log('🔧 mimeType:', doc.mimeType);
    
    // Para arquivos base64, converter para blob e abrir
    if (doc.fileUrl && !doc.fileUrl.startsWith('http')) {
      try {
        console.log('📝 Processando arquivo base64...');
        
        // Determinar o tipo MIME
        let mimeType = doc.mimeType;
        if (!mimeType) {
          const extension = doc.fileName.split('.').pop()?.toLowerCase();
          const mimeTypes: { [key: string]: string } = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'txt': 'text/plain'
          };
          mimeType = mimeTypes[extension || ''] || 'application/octet-stream';
          console.log('🔧 MIME type detectado:', mimeType);
        }

        // Converter base64 para blob
        const base64Data = doc.fileUrl.includes(',') ? doc.fileUrl.split(',')[1] : doc.fileUrl;
        console.log('📊 Tamanho base64:', base64Data.length);
        
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Criar URL do blob
        const blobUrl = URL.createObjectURL(blob);
        console.log('🔗 Blob URL criada:', blobUrl);

        // Abrir em nova aba ou download
        if (mimeType.startsWith('image/') || mimeType === 'application/pdf' || mimeType === 'text/plain') {
          console.log('🌐 Abrindo em nova aba...');
          window.open(blobUrl, '_blank');
        } else {
          console.log('⬇️ Fazendo download...');
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = doc.fileName;
          link.click();
        }

        // Limpar URL do blob
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        console.log('✅ Documento processado com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao visualizar documento:', error);
        alert('Erro ao visualizar documento: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      }
    } else if (doc.fileUrl && doc.fileUrl.startsWith('http')) {
      console.log('🌐 Abrindo URL externa...');
      window.open(doc.fileUrl, '_blank');
    } else {
      console.log('❌ Documento não pode ser visualizado - fileUrl:', doc.fileUrl);
      alert('Documento não pode ser visualizado - fileUrl inválido');
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const response = await fetch(`/api/admin/candidates/${candidatoId}/documents/${doc._id}/download`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        // Para arquivos base64, fazer download direto
        if (doc.fileUrl && !doc.fileUrl.startsWith('http')) {
          try {
            // Determinar o tipo MIME
            let mimeType = doc.mimeType;
            if (!mimeType) {
              const extension = doc.fileName.split('.').pop()?.toLowerCase();
              const mimeTypes: { [key: string]: string } = {
                'pdf': 'application/pdf',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'txt': 'text/plain'
              };
              mimeType = mimeTypes[extension || ''] || 'application/octet-stream';
            }

            // Converter base64 para blob e download
            const base64Data = doc.fileUrl.includes(',') ? doc.fileUrl.split(',')[1] : doc.fileUrl;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = doc.fileName;
            link.click();
            URL.revokeObjectURL(link.href);
          } catch (error) {
            console.error('Erro ao fazer download:', error);
            alert('Erro ao fazer download');
          }
        } else {
          // Para URLs externas, redirecionar
          window.open(doc.fileUrl, '_blank');
        }
      } else {
        const errorData = await response.json();
        alert(`Erro ao fazer download: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao fazer download');
    }
  };

  const handleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!interviewForm.companyId || !interviewForm.title || !interviewForm.scheduledDate || !interviewForm.scheduledTime) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Combinar data e hora
      const scheduledDateTime = new Date(`${interviewForm.scheduledDate}T${interviewForm.scheduledTime}`);
      
      const interviewData = {
        ...interviewForm,
        scheduledDate: scheduledDateTime.toISOString()
      };

      const response = await fetch(`/api/admin/candidates/${candidatoId}/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(interviewData)
      });

      if (response.ok) {
        const data = await response.json();
        setInterviews([data.data, ...interviews]);
        setShowInterviewModal(false);
        setInterviewForm({
          companyId: '',
          jobId: '',
          title: '',
          description: '',
          scheduledDate: '',
          scheduledTime: '',
          duration: 60,
          type: 'online',
          location: '',
          meetingUrl: '',
          interviewerName: '',
          interviewerEmail: '',
          interviewerPhone: '',
          notes: ''
        });
        alert('Entrevista agendada com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro ao agendar entrevista: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao agendar entrevista:', error);
      alert('Erro ao processar solicitação');
    }
  };

  const getInterviewStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Agendada', className: styles.statusPending, icon: <GrClock size={12} /> },
      completed: { label: 'Concluída', className: styles.statusApproved, icon: <GrCheckmark size={12} /> },
      cancelled: { label: 'Cancelada', className: styles.statusRejected, icon: <GrClose size={12} /> },
      no_show: { label: 'Não Compareceu', className: styles.statusSuspended, icon: <GrStatusCritical size={12} /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;

    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'presential':
        return <GrLocation size={16} />;
      case 'online':
        return <GrConnect size={16} />;
      case 'phone':
        return <GrPhone size={16} />;
      default:
        return <GrCalendar size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: styles.statusPending, icon: <GrPending size={14} /> },
      approved: { label: 'Aprovado', className: styles.statusApproved, icon: <GrStatusGood size={14} /> },
      rejected: { label: 'Rejeitado', className: styles.statusRejected, icon: <GrStatusCritical size={14} /> },
      suspended: { label: 'Suspenso', className: styles.statusSuspended, icon: <GrStatusCritical size={14} /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getDocumentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: styles.statusPending, icon: <GrPending size={12} /> },
      verified: { label: 'Verificado', className: styles.statusApproved, icon: <GrCheckmark size={12} /> },
      rejected: { label: 'Rejeitado', className: styles.statusRejected, icon: <GrClose size={12} /> }
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <GrUser size={16} /> },
    { id: 'documents', label: 'Documentos', icon: <GrDocument size={16} /> },
    { id: 'interviews', label: 'Entrevistas', icon: <GrCalendar size={16} /> },
    { id: 'connections', label: 'Conexões', icon: <GrConnect size={16} /> },
    { id: 'evaluations', label: 'Avaliações', icon: <GrStar size={16} /> },
    { id: 'timeline', label: 'Timeline', icon: <GrClock size={16} /> }
  ];

  // Carregar dados quando a aba for ativada
  useEffect(() => {
    if (activeTab === 'documents' && candidatoId) {
      loadDocuments();
    }
    if (activeTab === 'interviews' && candidatoId) {
      loadInterviews();
      loadCompanies();
      loadJobs();
    }
  }, [activeTab, candidatoId]);

  if (loading) {
    return (
      <div className={styles.candidatoPage}>
        <DashboardHeader user={user} userType="admin" />
        <main className={styles.mainContent}>
          <div className="container">
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Carregando candidato...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!candidato) {
    return (
      <div className={styles.candidatoPage}>
        <DashboardHeader user={user} userType="admin" />
        <main className={styles.mainContent}>
          <div className="container">
            <div className={styles.errorContainer}>
              <h2>Candidato não encontrado</h2>
              <p>O candidato solicitado não foi encontrado.</p>
              <button
                onClick={() => router.push('/admin/candidatos')}
                className="btn btn-primary"
              >
                Voltar para Candidatos
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.candidatoPage}>
      <DashboardHeader user={user} userType="admin" />
      <main className={styles.mainContent}>
        <div className="container">
          {/* Header do Candidato */}
          <div className={styles.candidatoHeader}>
            <div className={styles.candidatoInfo}>
              <div className={styles.candidatoAvatar}>
                {candidato.profile?.avatar ? (
                  <img src={candidato.profile.avatar} alt={candidato.name} />
                ) : (
                  <GrUser size={40} />
                )}
              </div>
              <div className={styles.candidatoDetails}>
                <h1>{candidato.name}</h1>
                <p className={styles.candidatoEmail}>
                  <GrMail size={16} />
                  {candidato.email}
                </p>
                {candidato.profile?.phone && (
                  <p className={styles.candidatoPhone}>
                    <GrPhone size={16} />
                    {candidato.profile.phone}
                  </p>
                )}
                <div className={styles.candidatoStatus}>
                  {getStatusBadge(candidato.status)}
                  {candidato.profileVerified && (
                    <span className={styles.verifiedBadge}>
                      <GrStatusGood size={12} />
                      Perfil Verificado
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.candidatoActions}>
              <button className="btn btn-secondary">
                <GrEdit size={16} />
                Editar
              </button>
              <button className="btn btn-primary">
                <GrMail size={16} />
                Enviar Mensagem
              </button>
            </div>
          </div>

          {/* Tabs de Navegação */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo das Tabs */}
          <div className={styles.tabContent}>
            {activeTab === 'overview' && (
              <div className={styles.overviewTab}>
                <div className={styles.overviewGrid}>
                  {/* Informações Básicas */}
                  <div className={styles.infoCard}>
                    <h3>Informações Básicas</h3>
                    <div className={styles.infoList}>
                      <div className={styles.infoItem}>
                        <label>Nome:</label>
                        <span>{candidato.name}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Email:</label>
                        <span>{candidato.email}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Status:</label>
                        <span>{getStatusBadge(candidato.status)}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Cadastro:</label>
                        <span>{formatDate(candidato.createdAt)}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Última Atividade:</label>
                        <span>{formatDate(candidato.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Perfil Profissional */}
                  <div className={styles.infoCard}>
                    <h3>Perfil Profissional</h3>
                    <div className={styles.infoList}>
                      <div className={styles.infoItem}>
                        <label>Empresa Atual:</label>
                        <span>{candidato.profile?.company || 'Não informado'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Cargo:</label>
                        <span>{candidato.profile?.position || 'Não informado'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>LinkedIn:</label>
                        <span>{candidato.profile?.linkedin || 'Não informado'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Website:</label>
                        <span>{candidato.profile?.website || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Permissões */}
                  <div className={styles.infoCard}>
                    <h3>Permissões</h3>
                    <div className={styles.permissionsList}>
                      <div className={styles.permissionItem}>
                        <GrBriefcase size={16} />
                        <span>Acessar Vagas</span>
                        <span className={candidato.permissions?.canAccessJobs ? styles.permissionActive : styles.permissionInactive}>
                          {candidato.permissions?.canAccessJobs ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className={styles.permissionItem}>
                        <GrAdd size={16} />
                        <span>Candidatar-se</span>
                        <span className={candidato.permissions?.canApplyToJobs ? styles.permissionActive : styles.permissionInactive}>
                          {candidato.permissions?.canApplyToJobs ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className={styles.permissionItem}>
                        <GrUser size={16} />
                        <span>Ver Cursos</span>
                        <span className={candidato.permissions?.canViewCourses ? styles.permissionActive : styles.permissionInactive}>
                          {candidato.permissions?.canViewCourses ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className={styles.permissionItem}>
                        <GrStar size={16} />
                        <span>Simulações</span>
                        <span className={candidato.permissions?.canAccessSimulations ? styles.permissionActive : styles.permissionInactive}>
                          {candidato.permissions?.canAccessSimulations ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className={styles.permissionItem}>
                        <GrMail size={16} />
                        <span>Contatar Empresas</span>
                        <span className={candidato.permissions?.canContactCompanies ? styles.permissionActive : styles.permissionInactive}>
                          {candidato.permissions?.canContactCompanies ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className={styles.infoCard}>
                    <h3>Métricas</h3>
                    <div className={styles.metricsGrid}>
                      <div className={styles.metricItem}>
                        <div className={styles.metricValue}>0</div>
                        <div className={styles.metricLabel}>Candidaturas</div>
                      </div>
                      <div className={styles.metricItem}>
                        <div className={styles.metricValue}>{interviews.length}</div>
                        <div className={styles.metricLabel}>Entrevistas</div>
                      </div>
                      <div className={styles.metricItem}>
                        <div className={styles.metricValue}>{documents.length}</div>
                        <div className={styles.metricLabel}>Documentos</div>
                      </div>
                      <div className={styles.metricItem}>
                        <div className={styles.metricValue}>0</div>
                        <div className={styles.metricLabel}>Conexões</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className={styles.documentsTab}>
                <div className={styles.tabHeader}>
                  <h2>Gestão de Documentos</h2>
                  <div className={styles.tabActions}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowDocumentModal(true)}
                    >
                      <GrUpload size={16} />
                      Enviar Documento
                    </button>
                  </div>
                </div>

                {documentsLoading ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Carregando documentos...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className={styles.emptyState}>
                    <GrDocument size={48} />
                    <h3>Nenhum documento encontrado</h3>
                    <p>Este candidato ainda não possui documentos cadastrados.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowDocumentModal(true)}
                    >
                      <GrAdd size={16} />
                      Adicionar Primeiro Documento
                    </button>
                  </div>
                ) : (
                  <div className={styles.documentsGrid}>
                    {documents.map((doc) => (
                      <div key={doc._id} className={styles.documentCard}>
                        <div className={styles.documentHeader}>
                          <div className={styles.documentType}>
                            <GrDocument size={20} />
                            <span className={styles.documentTypeLabel}>
                              {doc.type === 'cv' && 'Currículo'}
                              {doc.type === 'certificate' && 'Certificado'}
                              {doc.type === 'contract' && 'Contrato'}
                              {doc.type === 'form' && 'Formulário'}
                              {doc.type === 'other' && 'Outro'}
                            </span>
                            <span className={styles.fileTypeBadge}>
                              {doc.fileType?.toUpperCase()}
                            </span>
                          </div>
                          {getDocumentStatusBadge(doc.status)}
                        </div>
                        
                        <div className={styles.documentContent}>
                          <h4>{doc.title}</h4>
                          {doc.description && (
                            <p className={styles.documentDescription}>{doc.description}</p>
                          )}
                          
                          <div className={styles.documentInfo}>
                            <div className={styles.documentMeta}>
                              <span><strong>Arquivo:</strong> {doc.fileName}</span>
                              <span><strong>Tamanho:</strong> {formatFileSize(doc.fileSize)}</span>
                              <span><strong>Enviado por:</strong> {doc.uploadedBy === 'admin' ? 'Admin' : 'Candidato'}</span>
                              <span><strong>Data:</strong> {formatDate(doc.createdAt)}</span>
                            </div>
                          </div>

                          {doc.adminComments && (
                            <div className={styles.documentComments}>
                              <strong>Comentários:</strong>
                              <p>{doc.adminComments}</p>
                            </div>
                          )}
                        </div>

                        <div className={styles.documentActions}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <GrView size={14} />
                            Visualizar
                          </button>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <GrDownload size={14} />
                            Download
                          </button>
                          <button className="btn btn-danger btn-sm">
                            <GrTrash size={14} />
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'interviews' && (
              <div className={styles.interviewsTab}>
                <div className={styles.tabHeader}>
                  <h2>Gestão de Entrevistas</h2>
                  <div className={styles.tabActions}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowInterviewModal(true)}
                    >
                      <GrAdd size={16} />
                      Agendar Entrevista
                    </button>
                  </div>
                </div>

                {interviewsLoading ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Carregando entrevistas...</p>
                  </div>
                ) : interviews.length === 0 ? (
                  <div className={styles.emptyState}>
                    <GrCalendar size={48} />
                    <h3>Nenhuma entrevista encontrada</h3>
                    <p>Este candidato ainda não possui entrevistas agendadas.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowInterviewModal(true)}
                    >
                      <GrAdd size={16} />
                      Agendar Primeira Entrevista
                    </button>
                  </div>
                ) : (
                  <div className={styles.interviewsGrid}>
                    {interviews.map((interview) => (
                      <div key={interview._id} className={styles.interviewCard}>
                        <div className={styles.interviewHeader}>
                          <div className={styles.interviewType}>
                            {getInterviewTypeIcon(interview.type)}
                            <span className={styles.interviewTypeLabel}>
                              {interview.type === 'presential' && 'Presencial'}
                              {interview.type === 'online' && 'Online'}
                              {interview.type === 'phone' && 'Telefone'}
                            </span>
                          </div>
                          {getInterviewStatusBadge(interview.status)}
                        </div>
                        
                        <div className={styles.interviewContent}>
                          <h4>{interview.title}</h4>
                          {interview.description && (
                            <p className={styles.interviewDescription}>{interview.description}</p>
                          )}
                          
                          <div className={styles.interviewInfo}>
                            <div className={styles.interviewMeta}>
                              <span><strong>Empresa:</strong> {interview.companyId?.name || 'N/A'}</span>
                              {interview.jobId && (
                                <span><strong>Vaga:</strong> {interview.jobId.title}</span>
                              )}
                              <span><strong>Data:</strong> {new Date(interview.scheduledDate).toLocaleDateString('pt-BR')}</span>
                              <span><strong>Hora:</strong> {new Date(interview.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              <span><strong>Duração:</strong> {interview.duration} min</span>
                            </div>
                          </div>

                          {interview.type === 'presential' && interview.location && (
                            <div className={styles.interviewLocation}>
                              <strong>Local:</strong> {interview.location}
                            </div>
                          )}

                          {interview.type === 'online' && interview.meetingUrl && (
                            <div className={styles.interviewMeeting}>
                              <strong>Link da Reunião:</strong> 
                              <a href={interview.meetingUrl} target="_blank" rel="noopener noreferrer">
                                {interview.meetingUrl}
                              </a>
                            </div>
                          )}

                          {interview.interviewerName && (
                            <div className={styles.interviewerInfo}>
                              <strong>Entrevistador:</strong> {interview.interviewerName}
                              {interview.interviewerEmail && ` (${interview.interviewerEmail})`}
                            </div>
                          )}

                          {interview.notes && (
                            <div className={styles.interviewNotes}>
                              <strong>Observações:</strong>
                              <p>{interview.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className={styles.interviewActions}>
                          <button className="btn btn-secondary btn-sm">
                            <GrEdit size={14} />
                            Editar
                          </button>
                          <button className="btn btn-primary btn-sm">
                            <GrView size={14} />
                            Detalhes
                          </button>
                          {interview.status === 'scheduled' && (
                            <button className="btn btn-danger btn-sm">
                              <GrClose size={14} />
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'connections' && (
              <div className={styles.connectionsTab}>
                <div className={styles.tabHeader}>
                  <h2>Conexões com Empresas</h2>
                  <div className={styles.tabActions}>
                    <button className="btn btn-primary">
                      <GrConnect size={16} />
                      Conectar Empresa
                    </button>
                  </div>
                </div>
                <p>Funcionalidade de conexões em desenvolvimento...</p>
              </div>
            )}

            {activeTab === 'evaluations' && (
              <div className={styles.evaluationsTab}>
                <div className={styles.tabHeader}>
                  <h2>Avaliações e Feedback</h2>
                  <div className={styles.tabActions}>
                    <button className="btn btn-primary">
                      <GrStar size={16} />
                      Nova Avaliação
                    </button>
                  </div>
                </div>
                <p>Funcionalidade de avaliações em desenvolvimento...</p>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className={styles.timelineTab}>
                <div className={styles.tabHeader}>
                  <h2>Timeline de Atividades</h2>
                </div>
                <p>Funcionalidade de timeline em desenvolvimento...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal para Upload de Documento */}
      {showDocumentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Enviar Documento</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setShowDocumentModal(false)}
              >
                <GrClose size={20} />
              </button>
            </div>
            
            <form onSubmit={handleDocumentSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Arquivo</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  required
                  className={styles.fileInput}
                />
                <small className={styles.fileHelp}>
                  Tipos aceitos: PDF, DOC, DOCX, JPG, PNG, TXT. Tamanho máximo: 10MB
                </small>
                {selectedFile && (
                  <div className={styles.fileInfo}>
                    <strong>Arquivo selecionado:</strong> {selectedFile.name} 
                    ({formatFileSize(selectedFile.size)})
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Tipo de Documento</label>
                <select
                  value={documentForm.type}
                  onChange={(e) => setDocumentForm({...documentForm, type: e.target.value as any})}
                  required
                >
                  <option value="form">Formulário</option>
                  <option value="contract">Contrato</option>
                  <option value="certificate">Certificado</option>
                  <option value="cv">Currículo</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Título</label>
                <input
                  type="text"
                  value={documentForm.title}
                  onChange={(e) => setDocumentForm({...documentForm, title: e.target.value})}
                  placeholder="Ex: Contrato de Trabalho"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Descrição (opcional)</label>
                <textarea
                  value={documentForm.description}
                  onChange={(e) => setDocumentForm({...documentForm, description: e.target.value})}
                  placeholder="Descrição do documento..."
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Nome do Arquivo (opcional)</label>
                <input
                  type="text"
                  value={documentForm.fileName}
                  onChange={(e) => setDocumentForm({...documentForm, fileName: e.target.value})}
                  placeholder="Deixe em branco para usar o nome original"
                />
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDocumentModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <GrUpload size={16} />
                      Enviar Documento
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Agendar Entrevista */}
      {showInterviewModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Agendar Entrevista</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setShowInterviewModal(false)}
              >
                <GrClose size={20} />
              </button>
            </div>
            
            <form onSubmit={handleInterviewSubmit} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Empresa *</label>
                  <select
                    value={interviewForm.companyId}
                    onChange={(e) => setInterviewForm({...interviewForm, companyId: e.target.value})}
                    required
                  >
                    <option value="">Selecione uma empresa</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Vaga (opcional)</label>
                  <select
                    value={interviewForm.jobId}
                    onChange={(e) => setInterviewForm({...interviewForm, jobId: e.target.value})}
                  >
                    <option value="">Sem vaga específica</option>
                    {jobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Título da Entrevista *</label>
                <input
                  type="text"
                  value={interviewForm.title}
                  onChange={(e) => setInterviewForm({...interviewForm, title: e.target.value})}
                  placeholder="Ex: Entrevista para Desenvolvedor Frontend"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Descrição (opcional)</label>
                <textarea
                  value={interviewForm.description}
                  onChange={(e) => setInterviewForm({...interviewForm, description: e.target.value})}
                  placeholder="Descrição da entrevista..."
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Data *</label>
                  <input
                    type="date"
                    value={interviewForm.scheduledDate}
                    onChange={(e) => setInterviewForm({...interviewForm, scheduledDate: e.target.value})}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Hora *</label>
                  <input
                    type="time"
                    value={interviewForm.scheduledTime}
                    onChange={(e) => setInterviewForm({...interviewForm, scheduledTime: e.target.value})}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Duração (min)</label>
                  <select
                    value={interviewForm.duration}
                    onChange={(e) => setInterviewForm({...interviewForm, duration: parseInt(e.target.value)})}
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1h 30min</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Tipo de Entrevista *</label>
                <select
                  value={interviewForm.type}
                  onChange={(e) => setInterviewForm({...interviewForm, type: e.target.value as any})}
                  required
                >
                  <option value="online">Online</option>
                  <option value="presential">Presencial</option>
                  <option value="phone">Telefone</option>
                </select>
              </div>

              {interviewForm.type === 'presential' && (
                <div className={styles.formGroup}>
                  <label>Local</label>
                  <input
                    type="text"
                    value={interviewForm.location}
                    onChange={(e) => setInterviewForm({...interviewForm, location: e.target.value})}
                    placeholder="Endereço ou local da entrevista"
                  />
                </div>
              )}

              {interviewForm.type === 'online' && (
                <div className={styles.formGroup}>
                  <label>Link da Reunião</label>
                  <input
                    type="url"
                    value={interviewForm.meetingUrl}
                    onChange={(e) => setInterviewForm({...interviewForm, meetingUrl: e.target.value})}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Nome do Entrevistador</label>
                  <input
                    type="text"
                    value={interviewForm.interviewerName}
                    onChange={(e) => setInterviewForm({...interviewForm, interviewerName: e.target.value})}
                    placeholder="Nome do entrevistador"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email do Entrevistador</label>
                  <input
                    type="email"
                    value={interviewForm.interviewerEmail}
                    onChange={(e) => setInterviewForm({...interviewForm, interviewerEmail: e.target.value})}
                    placeholder="email@empresa.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Telefone do Entrevistador</label>
                  <input
                    type="tel"
                    value={interviewForm.interviewerPhone}
                    onChange={(e) => setInterviewForm({...interviewForm, interviewerPhone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Observações (opcional)</label>
                <textarea
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm({...interviewForm, notes: e.target.value})}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowInterviewModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <GrCalendar size={16} />
                  Agendar Entrevista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
