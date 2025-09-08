'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { GrGroup, GrBriefcase, GrSearch, GrFilter, GrStatusGood, GrClose, GrView, GrSend, GrOrganization, GrLocation, GrMoney, GrClock, GrStatusWarning, GrAdd, GrTrash, GrUser } from 'react-icons/gr';
import styles from './liberacao-vagas.module.css';

interface Job {
  _id: string;
  title: string;
  description: string;
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
  workType: string;
  status: string;
  publishedAt: string;
  requirements: {
    skills: string[];
    education: string;
    experience: string;
  };
}

interface Candidate {
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
      startDate: string;
      endDate: string;
    }>;
  };
  skills?: string[];
  profileStatus: 'incomplete' | 'complete' | 'verified';
  documentsStatus: 'pending' | 'verified' | 'rejected';
}

interface JobRelease {
  _id: string;
  jobId: Job;
  candidateId: Candidate;
  releasedAt: string;
  releasedBy: string;
}

export default function AdminLiberacaoVagasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobReleases, setJobReleases] = useState<JobRelease[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      // Carregar vagas ativas
      const jobsResponse = await ApiService.getJobs({
        status: 'active',
        limit: 100,
        page: 1
      }) as any;
      
      setJobs(jobsResponse.data || []);

      // Carregar candidatos com perfil completo
      const candidatesResponse = await ApiService.getCandidatesWithCompleteProfile() as any;
      setCandidates(candidatesResponse.data || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErrorMessage('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseJob = (job: Job) => {
    setSelectedJob(job);
    setSelectedCandidates([]);
    setShowModal(true);
  };

  const handleCandidateToggle = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleConfirmRelease = async () => {
    if (!selectedJob || selectedCandidates.length === 0) return;

    setActionLoading(true);
    try {
      await ApiService.releaseJobToCandidates(selectedJob._id, selectedCandidates);
      
      setSuccessMessage(`Vaga "${selectedJob.title}" liberada para ${selectedCandidates.length} candidato(s)!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      
      setShowModal(false);
      setSelectedJob(null);
      setSelectedCandidates([]);
      
    } catch (error) {
      console.error('Erro ao liberar vaga:', error);
      setErrorMessage('Erro ao liberar vaga. Tente novamente.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.companyId.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || candidate.profileStatus === filterStatus;
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

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'complete': 'green',
      'verified': 'blue',
      'incomplete': 'yellow',
      'pending': 'yellow',
      'rejected': 'red'
    };
    return colorMap[status] || 'gray';
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'complete': 'Completo',
      'verified': 'Verificado',
      'incomplete': 'Incompleto',
      'pending': 'Pendente',
              'rejected': 'Reprovado'
    };
    return statusMap[status] || status;
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
    <div className={styles.liberacaoPage}>
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
              <h1>Liberação de Vagas</h1>
              <p>Libere vagas específicas para candidatos qualificados</p>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrBriefcase size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{jobs.length}</h3>
                <p>Vagas Ativas</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrGroup size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{candidates.length}</h3>
                <p>Candidatos Qualificados</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrUser size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{candidates.filter(c => c.profileStatus === 'verified').length}</h3>
                <p>Perfis Verificados</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className={styles.searchSection}>
            <div className={styles.searchBox}>
              <GrSearch size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar vagas por título ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* Jobs GrList */}
          <div className={styles.jobsList}>
            <h2>Vagas Disponíveis</h2>
            {filteredJobs.length > 0 ? (
              <div className={styles.jobsGrid}>
                {filteredJobs.map((job) => (
                  <div key={job._id} className={styles.jobCard}>
                    <div className={styles.jobHeader}>
                      <h3>{job.title}</h3>
                      <div className={styles.jobCompany}>
                        <GrOrganization size={16} />
                        {job.companyId.name}
                      </div>
                    </div>

                    <div className={styles.jobMeta}>
                      <span className={styles.location}>
                        <GrLocation size={14} />
                        {job.location.city}, {job.location.state}
                        {job.location.isRemote && ' (Remoto)'}
                      </span>
                      <span className={styles.salary}>
                        <GrMoney size={14} />
                        {formatSalary(job.salary)}
                      </span>
                      <span className={styles.workType}>
                        <GrBriefcase size={14} />
                        {job.workType}
                      </span>
                    </div>

                    <div className={styles.jobSkills}>
                      {job.requirements.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                      {job.requirements.skills.length > 3 && (
                        <span className={styles.skillTag}>
                          +{job.requirements.skills.length - 3}
                        </span>
                      )}
                    </div>

                    <div className={styles.jobActions}>
                      <button
                        onClick={() => handleReleaseJob(job)}
                        className="btn btn-primary btn-sm"
                      >
                        <GrSend size={16} />
                        Liberar para Candidatos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <GrBriefcase size={64} />
                <h3>Nenhuma Vaga Encontrada</h3>
                <p>Não há vagas ativas disponíveis para liberação</p>
              </div>
            )}
          </div>

          {/* Modal de Liberação */}
          {showModal && selectedJob && (
            <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>Liberar Vaga: {selectedJob.title}</h2>
                  <button 
                    onClick={() => setShowModal(false)}
                    className={styles.modalClose}
                  >
                    <GrClose size={24} />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.jobInfo}>
                    <h3>{selectedJob.title}</h3>
                    <p>{selectedJob.companyId.name}</p>
                    <div className={styles.jobDetails}>
                      <span>
                        <GrLocation size={14} />
                        {selectedJob.location.city}, {selectedJob.location.state}
                      </span>
                      <span>
                        <GrMoney size={14} />
                        {formatSalary(selectedJob.salary)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.candidatesSection}>
                    <h4>Selecionar Candidatos ({selectedCandidates.length} selecionados)</h4>
                    
                    <div className={styles.candidatesList}>
                      {filteredCandidates.map((candidate) => (
                        <div key={candidate._id} className={styles.candidateItem}>
                          <div className={styles.candidateInfo}>
                            <div className={styles.candidateHeader}>
                              <h5>{candidate.name}</h5>
                              <div className={styles.candidateStatus}>
                                <span className={`status ${getStatusColor(candidate.profileStatus)}`}>
                                  {getStatusLabel(candidate.profileStatus)}
                                </span>
                              </div>
                            </div>
                            <p>{candidate.email}</p>
                            {candidate.address && (
                              <span className={styles.candidateLocation}>
                                <GrLocation size={12} />
                                {candidate.address.city}, {candidate.address.state}
                              </span>
                            )}
                            {candidate.professionalInfo?.summary && (
                              <p className={styles.candidateSummary}>
                                {candidate.professionalInfo.summary.substring(0, 100)}...
                              </p>
                            )}
                          </div>
                          
                          <div className={styles.candidateActions}>
                            <label className={styles.checkbox}>
                              <input
                                type="checkbox"
                                checked={selectedCandidates.includes(candidate._id)}
                                onChange={() => handleCandidateToggle(candidate._id)}
                              />
                              <span className={styles.checkmark}></span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="btn btn-outline"
                    disabled={actionLoading}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirmRelease}
                    className="btn btn-primary"
                    disabled={selectedCandidates.length === 0 || actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <div className={styles.spinner}></div>
                        Liberando...
                      </>
                    ) : (
                      <>
                        <GrSend size={16} />
                        Liberar para {selectedCandidates.length} candidato(s)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 