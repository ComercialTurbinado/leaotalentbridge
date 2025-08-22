'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { GrGroup, GrDocument, GrSearch, GrFilter, GrStatusGood, GrClose, GrView, GrEdit, GrOrganization, GrLocation, GrMoney, GrClock, GrStatusWarning, GrSend, GrDownload, GrUpload, GrStar, GrBriefcase, GrUser, GrCheckmark, GrFormClose } from 'react-icons/gr';
import styles from './aprovacao-candidaturas.module.css';

interface Application {
  _id: string;
  candidateId: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      phone?: string;
      experience?: string;
      skills?: string[];
      education?: string;
      languages?: Array<{
        language: string;
        level: string;
      }>;
    };
  };
  jobId: {
    _id: string;
    title: string;
    companyId: {
      _id: string;
      name: string;
      industry: string;
    };
    location: {
      city: string;
      state: string;
      isRemote: boolean;
    };
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    requirements: {
      skills: string[];
      education: string;
      experience: string;
    };
  };
  status: string;
  appliedAt: string;
  coverLetter?: string;
  adminApproved?: boolean;
  screening?: {
    score: number;
    criteria: {
      education: number;
      experience: number;
      skills: number;
      overall: number;
    };
    passedScreening: boolean;
  };
  notes?: {
    admin?: string;
  };
}

export default function AdminAprovacaoCandidaturasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadApplications();
  }, [router, currentPage, statusFilter, approvalFilter]);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(approvalFilter !== 'all' && { adminApproved: approvalFilter === 'approved' ? 'true' : 'false' }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Erro ao carregar candidaturas');
      }
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, approvalFilter, searchTerm]);

  const handleApprove = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(applicationId);
      
      const response = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId,
          action,
          notes: adminNotes
        })
      });

      if (response.ok) {
        // Recarregar candidaturas
        await loadApplications();
        setSelectedApplication(null);
        setAdminNotes('');
      } else {
        console.error('Erro ao processar candidatura');
      }
    } catch (error) {
      console.error('Erro ao processar candidatura:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      applied: 'Aplicada',
      screening: 'Em Triagem',
      qualified: 'Qualificada',
      interviewing: 'Em Entrevista',
      interviewed: 'Entrevistada',
      offer: 'Proposta Enviada',
      hired: 'Contratada',
      rejected: 'Rejeitada',
      withdrawn: 'Retirada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      applied: 'blue',
      screening: 'orange',
      qualified: 'green',
      interviewing: 'purple',
      interviewed: 'blue',
      offer: 'yellow',
      hired: 'green',
      rejected: 'red',
      withdrawn: 'gray'
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <DashboardHeader user={user!} userType="admin" />

      <main className={styles.mainContent}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Aprovação de Candidaturas</h1>
            <p>Gerencie e aprove candidaturas antes de liberá-las para as empresas</p>
          </div>

          {/* Filtros */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <GrSearch size={20} />
              <input
                type="text"
                placeholder="Buscar por candidato, vaga ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadApplications()}
              />
            </div>

            <div className={styles.filterControls}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todos os Status</option>
                <option value="applied">Aplicada</option>
                <option value="screening">Em Triagem</option>
                <option value="qualified">Qualificada</option>
                <option value="interviewing">Em Entrevista</option>
                <option value="interviewed">Entrevistada</option>
                <option value="hired">Contratada</option>
                <option value="rejected">Rejeitada</option>
              </select>

              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todas as Aprovações</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovadas</option>
                <option value="rejected">Rejeitadas</option>
              </select>
            </div>
          </div>

          {/* Lista de Candidaturas */}
          <div className={styles.applicationsList}>
            {applications.map((application) => (
              <div key={application._id} className={styles.applicationCard}>
                <div className={styles.applicationHeader}>
                  <div className={styles.candidateInfo}>
                    <h3>{application.candidateId.name}</h3>
                    <p>{application.candidateId.email}</p>
                    <span className={styles.phone}>
                      {application.candidateId.profile?.phone || 'Telefone não informado'}
                    </span>
                  </div>

                  <div className={styles.jobInfo}>
                    <h4>{application.jobId.title}</h4>
                    <p>{application.jobId.companyId.name}</p>
                    <span className={styles.location}>
                      {application.jobId.location.city}, {application.jobId.location.state}
                    </span>
                  </div>

                  <div className={styles.statusSection}>
                    <span className={`${styles.status} ${styles[getStatusColor(application.status)]}`}>
                      {getStatusLabel(application.status)}
                    </span>
                    <span className={`${styles.approvalStatus} ${application.adminApproved ? styles.approved : styles.pending}`}>
                      {application.adminApproved ? 'Aprovada' : 'Pendente'}
                    </span>
                  </div>
                </div>

                <div className={styles.applicationDetails}>
                  <div className={styles.skillsSection}>
                    <h5>Habilidades:</h5>
                    <div className={styles.skillsList}>
                      {application.candidateId.profile?.skills?.slice(0, 5).map((skill, index) => (
                        <span key={index} className={styles.skillTag}>{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.screeningSection}>
                    {application.screening && (
                      <div className={styles.screeningScore}>
                        <h5>Score de Triagem: {application.screening.score}%</h5>
                        <div className={styles.scoreBreakdown}>
                          <span>Educação: {application.screening.criteria.education}%</span>
                          <span>Experiência: {application.screening.criteria.experience}%</span>
                          <span>Habilidades: {application.screening.criteria.skills}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.coverLetter}>
                    <h5>Carta de Apresentação:</h5>
                    <p>{application.coverLetter || 'Nenhuma carta de apresentação fornecida.'}</p>
                  </div>
                </div>

                <div className={styles.applicationActions}>
                  <button
                    className={`${styles.actionBtn} ${styles.viewBtn}`}
                    onClick={() => setSelectedApplication(application)}
                  >
                    <GrView size={16} />
                    Ver Detalhes
                  </button>

                  {!application.adminApproved && (
                    <>
                      <button
                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                        onClick={() => handleApprove(application._id, 'approve')}
                        disabled={actionLoading === application._id}
                      >
                        <GrCheckmark size={16} />
                        {actionLoading === application._id ? 'Processando...' : 'Aprovar'}
                      </button>

                      <button
                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                        onClick={() => handleApprove(application._id, 'reject')}
                        disabled={actionLoading === application._id}
                      >
                        <GrFormClose size={16} />
                        {actionLoading === application._id ? 'Processando...' : 'Rejeitar'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
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

      {/* Modal de Detalhes */}
      {selectedApplication && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Detalhes da Candidatura</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className={styles.closeBtn}
              >
                <GrClose size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.candidateDetails}>
                <h3>Candidato: {selectedApplication.candidateId.name}</h3>
                <p><strong>Email:</strong> {selectedApplication.candidateId.email}</p>
                <p><strong>Telefone:</strong> {selectedApplication.candidateId.profile?.phone || 'Não informado'}</p>
                <p><strong>Experiência:</strong> {selectedApplication.candidateId.profile?.experience || 'Não informado'}</p>
                <p><strong>Educação:</strong> {selectedApplication.candidateId.profile?.education || 'Não informado'}</p>
              </div>

              <div className={styles.jobDetails}>
                <h3>Vaga: {selectedApplication.jobId.title}</h3>
                <p><strong>Empresa:</strong> {selectedApplication.jobId.companyId.name}</p>
                <p><strong>Localização:</strong> {selectedApplication.jobId.location.city}, {selectedApplication.jobId.location.state}</p>
                <p><strong>Salário:</strong> {selectedApplication.jobId.salary.min} - {selectedApplication.jobId.salary.max} {selectedApplication.jobId.salary.currency}</p>
              </div>

              <div className={styles.notesSection}>
                <h3>Notas do Administrador</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione notas sobre esta candidatura..."
                  className={styles.notesTextarea}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={() => handleApprove(selectedApplication._id, 'approve')}
                className={`${styles.actionBtn} ${styles.approveBtn}`}
                disabled={actionLoading === selectedApplication._id}
              >
                <GrCheckmark size={16} />
                Aprovar Candidatura
              </button>

              <button
                onClick={() => handleApprove(selectedApplication._id, 'reject')}
                className={`${styles.actionBtn} ${styles.rejectBtn}`}
                disabled={actionLoading === selectedApplication._id}
              >
                <GrFormClose size={16} />
                Rejeitar Candidatura
              </button>

              <button
                onClick={() => setSelectedApplication(null)}
                className={`${styles.actionBtn} ${styles.cancelBtn}`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 