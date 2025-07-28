'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { GrGroup, GrDocument, GrSearch, GrFilter, GrStatusGood, GrClose, GrView, GrEdit, GrOrganization, GrLocation, GrMoney, GrClock, GrStatusWarning, GrSend, GrDownload, GrUpload, GrStar, GrBriefcase, GrUser } from 'react-icons/gr';
import styles from './aprovacao-candidaturas.module.css';

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
  adminApproved: boolean;
  adjustedResume?: any;
  documentsVerified: boolean;
}

export default function AdminAprovacaoCandidaturasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'adjust'>('view');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adjustedData, setAdjustedData] = useState<any>({});

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadApplications();
  }, [router]);

  const loadApplications = async () => {
    try {
      // Carregar candidaturas pendentes de aprovação
      const response = await ApiService.getPendingApplications() as any;
      setApplications(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
      setErrorMessage('Erro ao carregar candidaturas');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setModalType('view');
    setShowModal(true);
  };

  const handleAdjustResume = (application: Application) => {
    setSelectedApplication(application);
    setModalType('adjust');
    setAdjustedData({
      summary: application.userId.professionalInfo?.summary || '',
      experience: application.userId.professionalInfo?.experience || [],
      education: application.userId.education || [],
      skills: application.userId.skills || [],
      languages: application.userId.languages || []
    });
    setShowModal(true);
  };

  const handleApproveApplication = async (applicationId: string, withAdjustments = false) => {
    setActionLoading(applicationId);
    try {
      const adjustedResume = withAdjustments ? adjustedData : undefined;
      
      await ApiService.approveApplicationForCompany(applicationId, adjustedResume);
      
      // Atualizar lista local
      setApplications(prev => prev.map(app => 
        app._id === applicationId 
          ? { ...app, adminApproved: true, adjustedResume }
          : app
      ));
      
      setSuccessMessage('Candidatura aprovada e liberada para a empresa!');
      setTimeout(() => setSuccessMessage(''), 5000);
      
      setShowModal(false);
      setSelectedApplication(null);
      
    } catch (error) {
      console.error('Erro ao aprovar candidatura:', error);
      setErrorMessage('Erro ao aprovar candidatura. Tente novamente.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.jobId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.jobId.companyId.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'pending' && !app.adminApproved) ||
                         (filterStatus === 'approved' && app.adminApproved);
    
    return matchesSearch && matchesStatus;
  });

  const formatSalary = (salary: any) => {
    if (!salary.min && !salary.max) return 'A combinar';
    
    const formatter = new Intl.NumberFormat('pt-BR');
    const currency = salary.currency === 'AED' ? 'AED' : salary.currency;
    
    if (salary.min && salary.max) {
      return `${currency} ${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
    } else if (salary.min) {
      return `A partir de ${currency} ${formatter.format(salary.min)}`;
    } else {
      return `Até ${currency} ${formatter.format(salary.max)}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateMatchScore = (application: Application) => {
    // Algoritmo simples de compatibilidade
    let score = 50; // Base
    
    const jobSkills = application.jobId.requirements.skills || [];
    const candidateSkills = application.userId.skills || [];
    
    // Compatibilidade de habilidades
    const matchingSkills = jobSkills.filter(skill => 
      candidateSkills.some(cSkill => 
        cSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(cSkill.toLowerCase())
      )
    );
    
    score += Math.min((matchingSkills.length / jobSkills.length) * 30, 30);
    
    // Experiência
    if (application.userId.professionalInfo?.experience?.length) {
      score += Math.min(application.userId.professionalInfo.experience.length * 5, 20);
    }
    
    return Math.min(score, 100);
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
    <div className={styles.aprovacaoPage}>
      <DashboardHeader user={user} userType="admin" />

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
              <h1>Aprovação de Candidaturas</h1>
              <p>Analise, ajuste currículos e aprove candidaturas para empresas</p>
            </div>
          </div>

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
                <GrClock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{applications.filter(app => !app.adminApproved).length}</h3>
                <p>Pendentes de Aprovação</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{applications.filter(app => app.adminApproved).length}</h3>
                <p>Aprovadas</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <GrSearch size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar por candidato, vaga ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterDropdown}>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todas</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovadas</option>
              </select>
            </div>
          </div>

          {/* Applications GrList */}
          <div className={styles.applicationsList}>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <div key={application._id} className={styles.applicationCard}>
                  <div className={styles.applicationHeader}>
                    <div className={styles.candidateInfo}>
                      <h3>{application.userId.name}</h3>
                      <p>{application.userId.email}</p>
                      {application.userId.address && (
                        <span className={styles.location}>
                          <GrLocation size={14} />
                          {application.userId.address.city}, {application.userId.address.state}
                        </span>
                      )}
                    </div>
                    
                    <div className={styles.matchScore}>
                      <GrStar size={16} />
                      <span>{calculateMatchScore(application)}% match</span>
                    </div>
                  </div>

                  <div className={styles.jobInfo}>
                    <h4>{application.jobId.title}</h4>
                    <div className={styles.jobMeta}>
                      <span>
                        <GrOrganization size={14} />
                        {application.jobId.companyId.name}
                      </span>
                      <span>
                        <GrLocation size={14} />
                        {application.jobId.location.city}, {application.jobId.location.state}
                        {application.jobId.location.isRemote && ' (Remoto)'}
                      </span>
                      <span>
                        <GrMoney size={14} />
                        {formatSalary(application.jobId.salary)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.applicationMeta}>
                    <span className={styles.appliedDate}>
                      <GrClock size={14} />
                      Aplicou em {formatDate(application.appliedAt)}
                    </span>
                    <div className={styles.statusBadge}>
                      {application.adminApproved ? (
                        <span className="status green">
                          <GrStatusGood size={14} />
                          Aprovada
                        </span>
                      ) : (
                        <span className="status yellow">
                          <GrClock size={14} />
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.applicationActions}>
                    <button
                      onClick={() => handleViewApplication(application)}
                      className="btn btn-outline btn-sm"
                    >
                      <GrView size={16} />
                      Ver Detalhes
                    </button>

                    {!application.adminApproved && (
                      <>
                        <button
                          onClick={() => handleAdjustResume(application)}
                          className="btn btn-outline btn-sm"
                        >
                          <GrEdit size={16} />
                          Ajustar Currículo
                        </button>

                        <button
                          onClick={() => handleApproveApplication(application._id)}
                          className="btn btn-primary btn-sm"
                          disabled={actionLoading === application._id}
                        >
                          {actionLoading === application._id ? (
                            <div className={styles.spinner}></div>
                          ) : (
                            <>
                              <GrUser size={16} />
                              Aprovar
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <GrGroup size={64} />
                <h3>Nenhuma Candidatura Encontrada</h3>
                <p>
                  {applications.length === 0 
                    ? 'Não há candidaturas pendentes de aprovação.'
                    : 'Nenhuma candidatura corresponde aos filtros selecionados.'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Modal */}
          {showModal && selectedApplication && (
            <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>
                    {modalType === 'view' ? 'Detalhes da Candidatura' : 'Ajustar Currículo'}
                  </h2>
                  <button 
                    onClick={() => setShowModal(false)}
                    className={styles.modalClose}
                  >
                    <GrClose size={24} />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  {modalType === 'view' ? (
                    <div className={styles.candidateDetails}>
                      <div className={styles.candidateHeader}>
                        <h3>{selectedApplication.userId.name}</h3>
                        <p>{selectedApplication.userId.email}</p>
                        {selectedApplication.userId.phone && (
                          <p>{selectedApplication.userId.phone}</p>
                        )}
                      </div>

                      <div className={styles.jobSection}>
                        <h4>Vaga</h4>
                        <div className={styles.jobCard}>
                          <h5>{selectedApplication.jobId.title}</h5>
                          <p>{selectedApplication.jobId.companyId.name}</p>
                          <div className={styles.jobDetails}>
                            <span>
                              <GrLocation size={14} />
                              {selectedApplication.jobId.location.city}, {selectedApplication.jobId.location.state}
                            </span>
                            <span>
                              <GrMoney size={14} />
                              {formatSalary(selectedApplication.jobId.salary)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedApplication.coverLetter && (
                        <div className={styles.section}>
                          <h4>Carta de Apresentação</h4>
                          <p>{selectedApplication.coverLetter}</p>
                        </div>
                      )}

                      {selectedApplication.userId.professionalInfo?.summary && (
                        <div className={styles.section}>
                          <h4>Resumo Profissional</h4>
                          <p>{selectedApplication.userId.professionalInfo.summary}</p>
                        </div>
                      )}

                      {selectedApplication.userId.professionalInfo?.experience && 
                       selectedApplication.userId.professionalInfo.experience.length > 0 && (
                        <div className={styles.section}>
                          <h4>Experiência Profissional</h4>
                          {selectedApplication.userId.professionalInfo.experience.map((exp, index) => (
                            <div key={index} className={styles.experienceItem}>
                              <h5>{exp.position} - {exp.company}</h5>
                              <p>{exp.startDate} - {exp.endDate || 'Atual'}</p>
                              <p>{exp.location}</p>
                              <p>{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedApplication.userId.skills && 
                       selectedApplication.userId.skills.length > 0 && (
                        <div className={styles.section}>
                          <h4>Habilidades</h4>
                          <div className={styles.skillsList}>
                            {selectedApplication.userId.skills.map((skill, index) => (
                              <span key={index} className={styles.skillTag}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.adjustForm}>
                      <div className={styles.formSection}>
                        <h4>Resumo Profissional</h4>
                        <textarea
                          value={adjustedData.summary}
                          onChange={(e) => setAdjustedData((prev: any) => ({ ...prev, summary: e.target.value }))}
                          rows={4}
                          className={styles.textarea}
                          placeholder="Ajuste o resumo profissional para padrões internacionais..."
                        />
                      </div>

                      <div className={styles.formSection}>
                        <h4>Habilidades</h4>
                        <textarea
                          value={adjustedData.skills?.join(', ') || ''}
                          onChange={(e) => setAdjustedData((prev: any) => ({ 
                            ...prev, 
                            skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                          }))}
                          rows={3}
                          className={styles.textarea}
                          placeholder="Habilidades separadas por vírgula..."
                        />
                      </div>

                      <div className={styles.adjustmentNotes}>
                        <h4>Ajustes Realizados</h4>
                        <ul>
                          <li>✓ Formatação para padrões EAU</li>
                          <li>✓ Tradução de termos técnicos</li>
                          <li>✓ Adequação cultural</li>
                          <li>✓ Verificação de documentos</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.modalFooter}>
                  {modalType === 'view' ? (
                    <div className={styles.viewActions}>
                      {!selectedApplication.adminApproved && (
                        <>
                          <button
                            onClick={() => {
                              setModalType('adjust');
                              setAdjustedData({
                                summary: selectedApplication.userId.professionalInfo?.summary || '',
                                skills: selectedApplication.userId.skills || []
                              });
                            }}
                            className="btn btn-outline"
                          >
                            <GrEdit size={16} />
                            Ajustar Currículo
                          </button>
                          <button
                            onClick={() => handleApproveApplication(selectedApplication._id)}
                            className="btn btn-primary"
                            disabled={actionLoading === selectedApplication._id}
                          >
                            {actionLoading === selectedApplication._id ? (
                              <div className={styles.spinner}></div>
                            ) : (
                              <>
                                <GrUser size={16} />
                                Aprovar
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className={styles.adjustActions}>
                      <button 
                        onClick={() => setModalType('view')}
                        className="btn btn-outline"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={() => handleApproveApplication(selectedApplication._id, true)}
                        className="btn btn-primary"
                        disabled={actionLoading === selectedApplication._id}
                      >
                        {actionLoading === selectedApplication._id ? (
                          <div className={styles.spinner}></div>
                        ) : (
                          <>
                            <GrUser size={16} />
                            Aprovar com Ajustes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 