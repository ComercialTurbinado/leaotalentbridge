'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { GrGroup, GrSearch, GrFilter, GrCalendar, GrStar, GrLocation, GrBriefcase, GrClock, GrStatusGood, GrClose, GrView, GrPhone, GrVideo, GrDown, GrDownload, GrDocument, GrMail, GrGlobe, GrStatusWarning, GrSend, GrUser } from 'react-icons/gr';
import styles from './candidatos.module.css';

interface Application {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: {
      city: string;
      state: string;
    };
    professionalInfo?: {
      summary: string;
      experience: Array<{
        company: string;
        position: string;
        location: string;
        startDate: string;
        endDate: string;
        description: string;
      }>;
    };
    education?: Array<{
      institution: string;
      degree: string;
      location: string;
      startDate: string;
      endDate: string;
    }>;
    skills?: string[];
    languages?: Array<{
      language: string;
      level: string;
    }>;
    socialMedia?: {
      linkedin?: string;
      github?: string;
      website?: string;
    };
  };
  jobId: {
    _id: string;
    title: string;
    companyId: {
      name: string;
    };
  };
  status: string;
  appliedAt: string;
  lastUpdate: string;
  coverLetter?: string;
  score?: number;
}

function CandidatosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [filtroVaga, setFiltroVaga] = useState('all');
  const [jobIdFilter, setJobIdFilter] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Application | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      const currentUser = AuthService.getUser();
      if (!currentUser) return;

      // Carregar apenas candidaturas aprovadas pelo admin
      const applicationsResponse = await ApiService.getApplications({
        adminApproved: true, // Filtrar apenas candidaturas aprovadas pelo admin
        limit: 100,
        page: 1,
        ...(jobIdFilter && { jobId: jobIdFilter })
      }) as any;
      
      const applicationsData = applicationsResponse.data || [];
      setApplications(applicationsData);

      // Carregar vagas para o filtro
      const jobsResponse = await ApiService.getJobs({
        limit: 100,
        page: 1
      }) as any;
      
      setJobs(jobsResponse.data || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErrorMessage('Erro ao carregar candidaturas');
    } finally {
      setLoading(false);
    }
  }, [jobIdFilter]);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'empresa') {
      router.push('/empresa/login');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [router, loadData]);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setActionLoading(applicationId);
    try {
      await ApiService.updateApplication(applicationId, { status: newStatus });
      
      // Atualizar estado local
      setApplications(prev => prev.map(app => 
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      setSuccessMessage(`Status atualizado para ${getStatusLabel(newStatus)}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setErrorMessage('Erro ao atualizar status');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.userId.name.toLowerCase().includes(busca.toLowerCase()) ||
                         app.userId.email.toLowerCase().includes(busca.toLowerCase()) ||
                         app.jobId.title.toLowerCase().includes(busca.toLowerCase());
    const matchesStatus = filtroStatus === 'all' || app.status === filtroStatus;
    const matchesJob = filtroVaga === 'all' || app.jobId._id === filtroVaga;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'applied': 'Candidatura Enviada',
      'screening': 'Em Análise',
      'interview_scheduled': 'Entrevista Agendada',
      'interviewing': 'Em Entrevista',
      'offer_made': 'Oferta Feita',
      'hired': 'Contratado',
              'rejected': 'Reprovado',
      'withdrawn': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'applied': 'blue',
      'screening': 'yellow',
      'interview_scheduled': 'purple',
      'interviewing': 'purple',
      'offer_made': 'green',
      'hired': 'green',
      'rejected': 'red',
      'withdrawn': 'gray'
    };
    return colorMap[status] || 'gray';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateScore = (application: Application) => {
    // Algoritmo simples de score baseado em dados disponíveis
    let score = 50; // Base
    
    if (application.userId.professionalInfo?.experience?.length) {
      score += Math.min(application.userId.professionalInfo.experience.length * 10, 30);
    }
    
    if (application.userId.education?.length) {
      score += Math.min(application.userId.education.length * 5, 15);
    }
    
    if (application.userId.skills?.length) {
      score += Math.min(application.userId.skills.length * 2, 20);
    }
    
    if (application.coverLetter && application.coverLetter.length > 100) {
      score += 10;
    }
    
    return Math.min(score, 100);
  };

  const handleVerDetalhes = (application: Application) => {
    setCandidatoSelecionado(application);
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.candidatosPage}>
      <DashboardHeader user={user} userType="empresa" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className={styles.successMessage}>
              <GrStatusGood size={20} />
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage('')}>
                <GrClose size={16} />
              </button>
            </div>
          )}
          
          {errorMessage && (
            <div className={styles.errorMessage}>
              <GrStatusWarning size={20} />
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')}>
                <GrClose size={16} />
              </button>
            </div>
          )}

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <h1>Candidaturas Recebidas</h1>
              <p>Descubra os melhores profissionais qualificados para as suas vagas</p>
            </div>
            <div className={styles.headerStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{applications.length}</span>
                <span className={styles.statLabel}>Total</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {applications.filter(app => app.status === 'applied').length}
                </span>
                <span className={styles.statLabel}>Novas</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {applications.filter(app => app.status === 'interview_scheduled').length}
                </span>
                <span className={styles.statLabel}>Entrevistas</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <GrSearch size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou vaga..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterDropdowns}>
              <div className={styles.dropdown}>
                <select 
                  value={filtroStatus} 
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Todos os Status</option>
                  <option value="applied">Candidatura Enviada</option>
                  <option value="screening">Em Análise</option>
                  <option value="interview_scheduled">Entrevista Agendada</option>
                  <option value="interviewing">Em Entrevista</option>
                  <option value="offer_made">Oferta Feita</option>
                  <option value="hired">Contratado</option>
                  <option value="rejected">Reprovado</option>
                </select>
                <GrDown size={16} className={styles.dropdownIcon} />
              </div>
              
              <div className={styles.dropdown}>
                <select 
                  value={filtroVaga} 
                  onChange={(e) => setFiltroVaga(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Todas as Vagas</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
                <GrDown size={16} className={styles.dropdownIcon} />
              </div>
            </div>
          </div>

          {/* Applications GrList */}
          <div className={styles.candidatosList}>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <div key={application._id} className={styles.candidatoCard}>
                  <div className={styles.candidatoHeader}>
                    <div className={styles.candidatoInfo}>
                      <div className={styles.candidatoNome}>
                        <h3>{application.userId.name}</h3>
                        <div className={styles.candidatoScore}>
                          <GrStar size={16} />
                          <span>{calculateScore(application)}% match</span>
                        </div>
                      </div>
                      <div className={styles.candidatoMeta}>
                        <span className={styles.vaga}>
                          <GrBriefcase size={14} />
                          {application.jobId.title}
                        </span>
                        <span className={styles.localizacao}>
                          <GrLocation size={14} />
                          {application.userId.address ? 
                            `${application.userId.address.city}, ${application.userId.address.state}` : 
                            'Localização não informada'
                          }
                        </span>
                        <span className={styles.dataAplicacao}>
                          <GrCalendar size={14} />
                          Aplicou em {formatDate(application.appliedAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.candidatoStatus}>
                      <span className={`status ${getStatusColor(application.status)}`}>
                        {getStatusLabel(application.status)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.candidatoResumo}>
                    <p>
                      {application.userId.professionalInfo?.summary || 
                       'Resumo profissional não disponível'}
                    </p>
                  </div>

                  <div className={styles.candidatoHabilidades}>
                    {application.userId.skills?.slice(0, 5).map((skill, index) => (
                      <span key={index} className={styles.habilidadeTag}>
                        {skill}
                      </span>
                    ))}
                    {(application.userId.skills?.length || 0) > 5 && (
                      <span className={styles.habilidadeTag}>
                        +{(application.userId.skills?.length || 0) - 5}
                      </span>
                    )}
                  </div>

                  <div className={styles.candidatoFooter}>
                    <div className={styles.candidatoContato}>
                      <a href={`mailto:${application.userId.email}`} className={styles.contatoBtn}>
                        <GrMail size={16} />
                        E-mail
                      </a>
                      {application.userId.phone && (
                        <a href={`tel:${application.userId.phone}`} className={styles.contatoBtn}>
                          <GrPhone size={16} />
                          Telefone
                        </a>
                      )}
                      {application.userId.socialMedia?.linkedin && (
                        <a 
                          href={application.userId.socialMedia.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.contatoBtn}
                        >
                          <GrGlobe size={16} />
                          LinkedIn
                        </a>
                      )}
                    </div>

                    <div className={styles.candidatoActions}>
                      <button
                        onClick={() => handleVerDetalhes(application)}
                        className="btn btn-outline btn-sm"
                      >
                        <GrView size={16} />
                        Ver Detalhes
                      </button>

                      {application.status === 'applied' && (
                        <button
                          onClick={() => handleStatusChange(application._id, 'screening')}
                          className="btn btn-outline btn-sm"
                          disabled={actionLoading === application._id}
                        >
                          {actionLoading === application._id ? (
                            <div className={styles.spinner}></div>
                          ) : (
                            <>
                              <GrUser size={16} />
                              Selecionar Talento
                            </>
                          )}
                        </button>
                      )}

                      {application.status === 'screening' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(application._id, 'interview_scheduled')}
                            className="btn btn-primary btn-sm"
                            disabled={actionLoading === application._id}
                          >
                            {actionLoading === application._id ? (
                              <div className={styles.spinner}></div>
                            ) : (
                              <>
                                <GrCalendar size={16} />
                                Entrevista
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleStatusChange(application._id, 'rejected')}
                            className="btn btn-outline btn-sm btn-danger"
                            disabled={actionLoading === application._id}
                          >
                            {actionLoading === application._id ? (
                              <div className={styles.spinner}></div>
                            ) : (
                              <>
                                <GrUser size={16} />
                                Rejeitar
                              </>
                            )}
                          </button>
                        </>
                      )}

                      {application.status === 'interview_scheduled' && (
                        <button
                          onClick={() => handleStatusChange(application._id, 'offer_made')}
                          className="btn btn-primary btn-sm"
                          disabled={actionLoading === application._id}
                        >
                          {actionLoading === application._id ? (
                            <div className={styles.spinner}></div>
                          ) : (
                            <>
                              <GrSend size={16} />
                              Fazer Oferta
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <GrGroup size={64} />
                <h3>Nenhuma Candidatura Encontrada</h3>
                <p>
                  {applications.length === 0 
                    ? 'Ainda não há candidaturas para suas vagas.'
                    : 'Nenhuma candidatura corresponde aos filtros selecionados.'
                  }
                </p>
                {applications.length === 0 && (
                  <Link href="/empresa/vagas" className="btn btn-primary">
                    <GrBriefcase size={16} />
                    Ver Minhas Vagas
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Modal de Detalhes do Candidato */}
          {candidatoSelecionado && (
            <div className={styles.modalOverlay} onClick={() => setCandidatoSelecionado(null)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>Detalhes do Candidato</h2>
                  <button 
                    onClick={() => setCandidatoSelecionado(null)}
                    className={styles.modalClose}
                  >
                    <GrClose size={24} />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.candidatoDetalhes}>
                    <div className={styles.candidatoInfoCompleta}>
                      <h3>{candidatoSelecionado.userId.name}</h3>
                      <div className={styles.candidatoContatos}>
                        <span>
                          <GrMail size={16} />
                          {candidatoSelecionado.userId.email}
                        </span>
                        {candidatoSelecionado.userId.phone && (
                          <span>
                            <GrPhone size={16} />
                            {candidatoSelecionado.userId.phone}
                          </span>
                        )}
                        <span>
                          <GrLocation size={16} />
                          {candidatoSelecionado.userId.address ? 
                            `${candidatoSelecionado.userId.address.city}, ${candidatoSelecionado.userId.address.state}` : 
                            'Localização não informada'
                          }
                        </span>
                      </div>
                    </div>

                    {candidatoSelecionado.userId.professionalInfo?.summary && (
                      <div className={styles.secaoDetalhes}>
                        <h4>Resumo Profissional</h4>
                        <p>{candidatoSelecionado.userId.professionalInfo.summary}</p>
                      </div>
                    )}

                    {candidatoSelecionado.coverLetter && (
                      <div className={styles.secaoDetalhes}>
                        <h4>Carta de Apresentação</h4>
                        <p>{candidatoSelecionado.coverLetter}</p>
                      </div>
                    )}

                    {candidatoSelecionado.userId.professionalInfo?.experience && 
                     candidatoSelecionado.userId.professionalInfo.experience.length > 0 && (
                      <div className={styles.secaoDetalhes}>
                        <h4>Experiência Profissional</h4>
                        {candidatoSelecionado.userId.professionalInfo.experience.map((exp, index) => (
                          <div key={index} className={styles.experienciaItem}>
                            <h5>{exp.position} - {exp.company}</h5>
                            <p className={styles.periodo}>{exp.startDate} - {exp.endDate || 'Atual'}</p>
                            <p className={styles.localizacao}>{exp.location}</p>
                            <p>{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {candidatoSelecionado.userId.education && 
                     candidatoSelecionado.userId.education.length > 0 && (
                      <div className={styles.secaoDetalhes}>
                        <h4>Formação Acadêmica</h4>
                        {candidatoSelecionado.userId.education.map((edu, index) => (
                          <div key={index} className={styles.educacaoItem}>
                            <h5>{edu.degree}</h5>
                            <p>{edu.institution} - {edu.location}</p>
                            <p className={styles.periodo}>{edu.startDate} - {edu.endDate}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {candidatoSelecionado.userId.skills && 
                     candidatoSelecionado.userId.skills.length > 0 && (
                      <div className={styles.secaoDetalhes}>
                        <h4>Habilidades</h4>
                        <div className={styles.habilidadesList}>
                          {candidatoSelecionado.userId.skills.map((skill, index) => (
                            <span key={index} className={styles.habilidadeTag}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {candidatoSelecionado.userId.languages && 
                     candidatoSelecionado.userId.languages.length > 0 && (
                      <div className={styles.secaoDetalhes}>
                        <h4>Idiomas</h4>
                        <div className={styles.idiomasList}>
                          {candidatoSelecionado.userId.languages.map((lang, index) => (
                            <div key={index} className={styles.idiomaItem}>
                              <span className={styles.idioma}>{lang.language}</span>
                              <span className={styles.nivel}>{lang.level}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <div className={styles.statusActions}>
                    <label>Alterar Status:</label>
                    <select
                      value={candidatoSelecionado.status}
                      onChange={(e) => {
                        handleStatusChange(candidatoSelecionado._id, e.target.value);
                        setCandidatoSelecionado({
                          ...candidatoSelecionado,
                          status: e.target.value
                        });
                      }}
                      className={styles.statusSelect}
                    >
                      <option value="applied">Candidatura Enviada</option>
                      <option value="screening">Em Análise</option>
                      <option value="interview_scheduled">Entrevista Agendada</option>
                      <option value="interviewing">Em Entrevista</option>
                      <option value="offer_made">Oferta Feita</option>
                      <option value="hired">Contratado</option>
                      <option value="rejected">Reprovado</option>
                    </select>
                  </div>
                  
                  <div className={styles.modalActions}>
                    <a 
                      href={`mailto:${candidatoSelecionado.userId.email}`}
                      className="btn btn-primary"
                    >
                      <GrMail size={16} />
                      Enviar E-mail
                    </a>
                    <button 
                      onClick={() => setCandidatoSelecionado(null)}
                      className="btn btn-outline"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function EmpresaCandidatosPage() {
  return (
    <Suspense fallback={
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    }>
      <CandidatosContent />
    </Suspense>
  );
} 