'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { GrGroup, GrView, GrMail, GrPhone, GrLocation, GrDocument, GrStar, GrStatusCritical, GrStatusWarning, GrCalendar, GrClose, GrBriefcase } from 'react-icons/gr';
import styles from './candidaturas.module.css';

interface Application {
  _id: string;
  candidateId: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      avatar?: string;
      phone?: string;
      location?: {
        city: string;
        state: string;
      };
      experience?: string;
      skills?: string[];
      education?: string;
    };
  };
  jobId: {
    _id: string;
    title: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'interview' | 'hired';
  appliedAt: string;
  coverLetter?: string;
  resume?: string;
  adminApproved: boolean;
}

function CandidaturasPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams?.get('jobId');
  
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [job, setJob] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = AuthService.getUser();
        if (!userData || userData.type !== 'empresa') {
          router.push('/empresa/login');
          return;
        }
        setUser(userData);
        
        if (jobId) {
          await Promise.all([loadApplications(), loadJob()]);
        } else {
          setError('ID da vaga não fornecido');
        }
      } catch (error) {
        console.error('Erro na autenticação:', error);
        router.push('/empresa/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadApplications = async () => {
    if (!jobId) return;
    
    try {
      const response = await ApiService.getApplications({ jobId });
      setApplications((response as any).data || []);
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
      setError('Erro ao carregar candidaturas');
    }
  };

  const loadJob = async () => {
    if (!jobId) return;
    
    try {
      const response = await ApiService.getJob(jobId);
      setJob((response as any).data);
    } catch (error) {
      console.error('Erro ao carregar vaga:', error);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setActionLoading(applicationId);
    setError('');
    setSuccess('');

    try {
      await ApiService.updateApplication(applicationId, { status: newStatus });
      setSuccess(`Status da candidatura atualizado para ${getStatusLabel(newStatus)}`);
      await loadApplications(); // Recarregar lista
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      setError(error.message || 'Erro ao atualizar status da candidatura');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
              case 'rejected': return 'Reprovado';
      case 'interview': return 'Entrevista';
      case 'hired': return 'Contratado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'interview': return 'blue';
      case 'hired': return 'green';
      default: return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredApplications = applications.filter(application => {
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    const matchesSearch = !searchTerm || 
      application.candidateId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.candidateId.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!jobId) {
    return (
      <div className={styles.errorPage}>
        <h2>Vaga não especificada</h2>
        <p>Você precisa especificar uma vaga para ver as candidaturas.</p>
        <button onClick={() => router.push('/empresa/vagas')} className="btn btn-primary">
          Voltar para Vagas
        </button>
      </div>
    );
  }

  return (
    <div className={styles.candidaturasPage}>
      <DashboardHeader user={user} userType={user?.type || 'empresa'} />
      
      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <h1>
                <GrGroup size={32} />
                Candidatos da Vaga
              </h1>
              {job && (
                <p>Candidatos interessados na vaga: <strong>{job.title}</strong></p>
              )}
            </div>
            
            <button
              onClick={() => router.push('/empresa/vagas')}
              className="btn btn-outline"
            >
              <GrClose size={16} />
              Voltar
            </button>
          </div>

          {/* Messages */}
          {success && (
            <div className={styles.successMessage}>
              <span>{success}</span>
              <button onClick={() => setSuccess('')}>
                <GrClose size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <span>{error}</span>
              <button onClick={() => setError('')}>
                <GrClose size={16} />
              </button>
            </div>
          )}

          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrGroup size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{applications.length}</h3>
                <p>Total de Candidaturas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusCritical size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{applications.filter(app => app.status === 'pending').length}</h3>
                <p>Pendentes</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStar size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{applications.filter(app => app.status === 'approved').length}</h3>
                <p>Aprovados</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrBriefcase size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{applications.filter(app => app.status === 'hired').length}</h3>
                <p>Contratados</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterDropdowns}>
              <div className={styles.dropdown}>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">Pendentes</option>
                  <option value="approved">Aprovados</option>
                  <option value="rejected">Reprovados</option>
                  <option value="interview">Em Entrevista</option>
                  <option value="hired">Contratados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className={styles.applicationsList}>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <div key={application._id} className={styles.applicationCard}>
                  <div className={styles.candidateInfo}>
                    <div className={styles.candidateAvatar}>
                      {application.candidateId.profile?.avatar ? (
                        <img 
                          src={application.candidateId.profile.avatar} 
                          alt={application.candidateId.name}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {application.candidateId.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.candidateDetails}>
                      <h3>{application.candidateId.name}</h3>
                      
                      <div className={styles.candidateMeta}>
                        <span className={styles.metaItem}>
                          <GrMail size={14} />
                          {application.candidateId.email}
                        </span>
                        
                        {application.candidateId.profile?.phone && (
                          <span className={styles.metaItem}>
                            <GrPhone size={14} />
                            {application.candidateId.profile.phone}
                          </span>
                        )}
                        
                        {application.candidateId.profile?.location && (
                          <span className={styles.metaItem}>
                            <GrLocation size={14} />
                            {application.candidateId.profile.location.city}, {application.candidateId.profile.location.state}
                          </span>
                        )}
                      </div>

                      {application.candidateId.profile?.skills && application.candidateId.profile.skills.length > 0 && (
                        <div className={styles.candidateSkills}>
                          {application.candidateId.profile.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className={styles.skillTag}>
                              {skill}
                            </span>
                          ))}
                          {application.candidateId.profile.skills.length > 3 && (
                            <span className={styles.skillTag}>
                              +{application.candidateId.profile.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.applicationMeta}>
                    <div className={styles.applicationInfo}>
                      <div className={styles.statusBadge}>
                        <span className={`status ${getStatusColor(application.status)}`}>
                          {getStatusLabel(application.status)}
                        </span>
                        {!application.adminApproved && (
                          <span className="status orange">Aguardando Admin</span>
                        )}
                      </div>
                      
                      <div className={styles.dateInfo}>
                        <span className={styles.dateLabel}>Candidatou-se em:</span>
                        <span className={styles.dateValue}>
                          <GrCalendar size={14} />
                          {formatDate(application.appliedAt)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.applicationActions}>
                      <button
                        onClick={() => router.push(`/empresa/candidatos/${application.candidateId._id}`)}
                        className="btn btn-outline btn-sm"
                      >
                        <GrView size={16} />
                        Ver Perfil
                      </button>
                      
                      {application.resume && (
                        <a
                          href={application.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          <GrDocument size={16} />
                          Currículo
                        </a>
                      )}

                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(application._id, 'approved')}
                            className="btn btn-success btn-sm"
                            disabled={actionLoading === application._id}
                          >
                            {actionLoading === application._id ? (
                              <div className={styles.spinner}></div>
                            ) : (
                              'Aprovar'
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleStatusChange(application._id, 'rejected')}
                            className="btn btn-danger btn-sm"
                            disabled={actionLoading === application._id}
                          >
                            {actionLoading === application._id ? (
                              <div className={styles.spinner}></div>
                            ) : (
                              'Rejeitar'
                            )}
                          </button>
                        </>
                      )}

                      {application.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(application._id, 'interview')}
                          className="btn btn-primary btn-sm"
                          disabled={actionLoading === application._id}
                        >
                          {actionLoading === application._id ? (
                            <div className={styles.spinner}></div>
                          ) : (
                            'Entrevista'
                          )}
                        </button>
                      )}

                      {application.status === 'interview' && (
                        <button
                          onClick={() => handleStatusChange(application._id, 'hired')}
                          className="btn btn-success btn-sm"
                          disabled={actionLoading === application._id}
                        >
                          {actionLoading === application._id ? (
                            <div className={styles.spinner}></div>
                          ) : (
                            'Contratar'
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div className={styles.coverLetter}>
                      <h4>Carta de Apresentação:</h4>
                      <p>{application.coverLetter}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <GrGroup size={64} />
                <h3>Nenhuma Candidatura Encontrada</h3>
                <p>
                  {applications.length === 0 
                    ? 'Esta vaga ainda não recebeu candidaturas.'
                    : 'Nenhuma candidatura corresponde aos filtros selecionados.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CandidaturasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-3 border-yellow-300 border-t-yellow-500 rounded-full animate-spin"></div>
      </div>
    }>
      <CandidaturasPageContent />
    </Suspense>
  );
} 