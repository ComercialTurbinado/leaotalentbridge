'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { GrCalendar, GrClock, GrGroup, GrLocation, GrVideo, GrPhone, GrStatusGood, GrClose, GrEdit, GrPrevious, GrNext, GrFilter, GrAdd } from 'react-icons/gr';
import styles from './entrevistas.module.css';

interface Interview {
  _id: string;
  title: string;
  description?: string;
  scheduledDate: string;
  duration: number;
  type: 'presential' | 'online' | 'phone';
  status: 'pending_approval' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rejected';
  location?: string;
  meetingUrl?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  notes?: string;
  
  // Sistema de moderação
  adminStatus: 'pending' | 'approved' | 'rejected';
  adminComments?: string;
  
  // Resposta do candidato
  candidateResponse?: 'pending' | 'accepted' | 'rejected';
  candidateResponseAt?: string;
  candidateComments?: string;
  
  // Feedback
  companyFeedback?: {
    technical: number;
    communication: number;
    experience: number;
    overall: number;
    comments?: string;
    submittedAt?: string;
  };
  candidateFeedback?: {
    rating: number;
    comments?: string;
    submittedAt?: string;
  };
  feedbackStatus: 'pending' | 'approved' | 'rejected';
  
  // Relacionamentos
  candidateId: { _id: string; name: string; email: string };
  companyId: { _id: string; name: string };
  jobId?: { _id: string; title: string };
  applicationId?: string;
  createdBy: { _id: string; name: string };
  createdAt: string;
}

interface Application {
  _id: string;
  candidateId: { _id: string; name: string; email: string };
  jobId: { _id: string; title: string };
  status: string;
  appliedAt: string;
}

export default function EmpresaEntrevistasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'empresa') {
      router.push('/empresa/login');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar entrevistas
      const interviewsResponse = await fetch('/api/empresa/interviews');
      if (interviewsResponse.ok) {
        const interviewsData = await interviewsResponse.json();
        setInterviews(interviewsData.interviews || []);
      }

      // Carregar candidaturas para criar entrevistas
      const applicationsResponse = await fetch('/api/empresa/applications');
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData.applications || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    if (statusFilter === 'todas') return true;
    if (statusFilter === 'pending_approval') return interview.adminStatus === 'pending';
    if (statusFilter === 'scheduled') return interview.status === 'scheduled';
    if (statusFilter === 'confirmed') return interview.status === 'confirmed';
    if (statusFilter === 'completed') return interview.status === 'completed';
    if (statusFilter === 'cancelled') return interview.status === 'cancelled';
    return interview.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_approval: { label: 'Aguardando Aprovação', class: 'pending' },
      scheduled: { label: 'Agendada', class: 'scheduled' },
      confirmed: { label: 'Confirmada', class: 'confirmed' },
      completed: { label: 'Concluída', class: 'completed' },
      cancelled: { label: 'Cancelada', class: 'cancelled' },
      no_show: { label: 'Não Compareceu', class: 'no-show' },
      rejected: { label: 'Rejeitada', class: 'rejected' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, class: 'default' };
    return <span className={`${styles.statusBadge} ${styles[config.class]}`}>{config.label}</span>;
  };

  const getAdminStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', class: 'pending' },
      approved: { label: 'Aprovado', class: 'approved' },
      rejected: { label: 'Rejeitado', class: 'rejected' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, class: 'default' };
    return <span className={`${styles.adminStatusBadge} ${styles[config.class]}`}>{config.label}</span>;
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'online':
        return <GrVideo size={16} />;
      case 'phone':
        return <GrPhone size={16} />;
      case 'presential':
        return <GrLocation size={16} />;
      default:
        return <GrCalendar size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInterviewsDoMes = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return filteredInterviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledDate);
      return interviewDate.getFullYear() === year && interviewDate.getMonth() === month;
    });
  };

  const getDiasDoMes = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getInterviewsNoDia = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return getInterviewsDoMes().filter(interview => {
      const interviewDate = new Date(interview.scheduledDate).toISOString().split('T')[0];
      return interviewDate === dateString;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleCreateInterview = async (interviewData: any) => {
    try {
      setActionLoading(true);
      
      const response = await fetch('/api/empresa/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
      });

      if (response.ok) {
        await loadData();
        setShowCreateModal(false);
        alert('Entrevista solicitada com sucesso! Aguardando aprovação do administrador.');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar entrevista');
      }
    } catch (error) {
      console.error('Erro ao criar entrevista:', error);
      alert('Erro ao criar entrevista');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitFeedback = async (interviewId: string, feedback: any) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/empresa/interviews/${interviewId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });

      if (response.ok) {
        await loadData();
        setShowFeedbackModal(false);
        setSelectedInterview(null);
        alert('Feedback enviado com sucesso! Aguardando aprovação do administrador.');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao enviar feedback');
      }
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      alert('Erro ao enviar feedback');
    } finally {
      setActionLoading(false);
    }
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
    <div className={styles.entrevistasPage}>
      <DashboardHeader user={user} userType="empresa" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Calendário de Entrevistas</h1>
              <p>Gerencie e acompanhe suas entrevistas agendadas</p>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                className={styles.createBtn}
                onClick={() => setShowCreateModal(true)}
              >
                <GrAdd size={16} />
                Agendar Entrevista
              </button>
              <div className={styles.viewToggle}>
                <button 
                  className={viewMode === 'calendar' ? styles.active : ''}
                  onClick={() => setViewMode('calendar')}
                >
                  <GrCalendar size={16} />
                  Calendário
                </button>
                <button 
                  className={viewMode === 'list' ? styles.active : ''}
                  onClick={() => setViewMode('list')}
                >
                  <GrGroup size={16} />
                  Lista
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.filters}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="todas">Todos os Status</option>
                <option value="pending_approval">Aguardando Aprovação</option>
                <option value="scheduled">Agendadas</option>
                <option value="confirmed">Confirmadas</option>
                <option value="completed">Concluídas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className={styles.calendarSection}>
              <div className={styles.calendarHeader}>
                <button onClick={() => navigateMonth('prev')} className={styles.navButton}>
                  <GrPrevious size={20} />
                </button>
                <h2>
                  {currentDate.toLocaleDateString('pt-BR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h2>
                <button onClick={() => navigateMonth('next')} className={styles.navButton}>
                  <GrNext size={20} />
                </button>
              </div>

              <div className={styles.calendar}>
                <div className={styles.weekDays}>
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className={styles.weekDay}>{day}</div>
                  ))}
                </div>
                
                <div className={styles.calendarGrid}>
                  {getDiasDoMes().map((day, index) => {
                    const interviewsNoDia = getInterviewsNoDia(day);
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = day.toDateString() === new Date().toDateString();
                    
                    return (
                      <div 
                        key={index} 
                        className={`${styles.calendarDay} ${!isCurrentMonth ? styles.otherMonth : ''} ${isToday ? styles.today : ''}`}
                      >
                        <span className={styles.dayNumber}>{day.getDate()}</span>
                        {interviewsNoDia.length > 0 && (
                          <div className={styles.entrevistasIndicator}>
                            {interviewsNoDia.slice(0, 2).map(interview => (
                              <div 
                                key={interview._id} 
                                className={`${styles.entrevistaItem} ${styles[`status${interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}`]}`}
                                title={`${formatTime(interview.scheduledDate)} - ${interview.candidateId.name}`}
                              >
                                {getTipoIcon(interview.type)}
                                <span>{formatTime(interview.scheduledDate)}</span>
                              </div>
                            ))}
                            {interviewsNoDia.length > 2 && (
                              <div className={styles.moreIndicator}>
                                +{interviewsNoDia.length - 2}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className={styles.listSection}>
              {filteredInterviews.length === 0 ? (
                <div className={styles.emptyState}>
                  <GrCalendar size={48} className={styles.emptyIcon} />
                  <h3>Nenhuma entrevista encontrada</h3>
                  <p>Não há entrevistas agendadas com os filtros selecionados.</p>
                </div>
              ) : (
                <div className={styles.entrevistasList}>
                  {filteredInterviews
                    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                    .map((interview) => (
                    <div key={interview._id} className={styles.entrevistaCard}>
                      <div className={styles.entrevistaHeader}>
                        <div className={styles.entrevistaInfo}>
                          <h3>{interview.title}</h3>
                          <p className={styles.vagaTitulo}>
                            👤 {interview.candidateId.name} 
                            {interview.jobId && ` • 💼 ${interview.jobId.title}`}
                          </p>
                        </div>
                        <div className={styles.entrevistaStatus}>
                          {getStatusBadge(interview.status)}
                          {getAdminStatusBadge(interview.adminStatus)}
                        </div>
                      </div>

                      <div className={styles.entrevistaMeta}>
                        <div className={styles.metaItem}>
                          <GrCalendar size={16} />
                          <span>{formatDate(interview.scheduledDate)}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <GrClock size={16} />
                          <span>{formatTime(interview.scheduledDate)}</span>
                        </div>
                        <div className={styles.metaItem}>
                          {getTipoIcon(interview.type)}
                          <span>
                            {interview.type === 'online' && 'Videoconferência'}
                            {interview.type === 'phone' && 'Telefone'}
                            {interview.type === 'presential' && 'Presencial'}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <span>⏱️ {interview.duration} min</span>
                        </div>
                      </div>

                      {(interview.location || interview.meetingUrl) && (
                        <div className={styles.entrevistaLocal}>
                          {interview.location && (
                            <div className={styles.localInfo}>
                              <GrLocation size={16} />
                              <span>{interview.location}</span>
                            </div>
                          )}
                          {interview.meetingUrl && (
                            <div className={styles.linkInfo}>
                              <GrVideo size={16} />
                              <a href={interview.meetingUrl} target="_blank" rel="noopener noreferrer">
                                Acessar Videoconferência
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {interview.description && (
                        <div className={styles.observacoes}>
                          <strong>Descrição:</strong>
                          <p>{interview.description}</p>
                        </div>
                      )}

                      {interview.notes && (
                        <div className={styles.observacoes}>
                          <strong>Observações:</strong>
                          <p>{interview.notes}</p>
                        </div>
                      )}

                      {/* Resposta do candidato */}
                      {interview.candidateResponse && interview.candidateResponse !== 'pending' && (
                        <div className={styles.candidateResponse}>
                          <strong>Resposta do Candidato:</strong>
                          <div className={`${styles.response} ${styles[interview.candidateResponse]}`}>
                            <span>
                              {interview.candidateResponse === 'accepted' ? '✅ Aceitou' : '❌ Rejeitou'}
                            </span>
                            {interview.candidateComments && (
                              <p>{interview.candidateComments}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Feedback da empresa */}
                      {interview.companyFeedback && (
                        <div className={styles.companyFeedback}>
                          <strong>Avaliação Enviada:</strong>
                          <div className={styles.feedbackScores}>
                            <span>Técnico: {interview.companyFeedback.technical}/5</span>
                            <span>Comunicação: {interview.companyFeedback.communication}/5</span>
                            <span>Experiência: {interview.companyFeedback.experience}/5</span>
                            <span>Geral: {interview.companyFeedback.overall}/5</span>
                          </div>
                          {interview.companyFeedback.comments && (
                            <p>{interview.companyFeedback.comments}</p>
                          )}
                        </div>
                      )}

                      <div className={styles.entrevistaActions}>
                        {interview.status === 'completed' && !interview.companyFeedback && (
                          <button 
                            className="btn btn-primary btn-small"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setShowFeedbackModal(true);
                            }}
                          >
                            📝 Avaliar
                          </button>
                        )}
                        
                        {interview.status === 'completed' && interview.companyFeedback && (
                          <span className={styles.feedbackStatus}>
                            {interview.feedbackStatus === 'pending' && '⏳ Feedback aguardando aprovação'}
                            {interview.feedbackStatus === 'approved' && '✅ Feedback aprovado'}
                            {interview.feedbackStatus === 'rejected' && '❌ Feedback rejeitado'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal para criar entrevista */}
      {showCreateModal && (
        <CreateInterviewModal
          applications={applications}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateInterview}
          loading={actionLoading}
        />
      )}

      {/* Modal para feedback */}
      {showFeedbackModal && selectedInterview && (
        <FeedbackModal
          interview={selectedInterview}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedInterview(null);
          }}
          onSubmit={(feedback) => handleSubmitFeedback(selectedInterview._id, feedback)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

// Componente para modal de criar entrevista
function CreateInterviewModal({ applications, onClose, onSubmit, loading }: {
  applications: Application[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    candidateId: '',
    applicationId: '',
    jobId: '',
    title: '',
    description: '',
    scheduledDate: '',
    duration: 60,
    type: 'online' as 'presential' | 'online' | 'phone',
    location: '',
    meetingUrl: '',
    interviewerName: '',
    interviewerEmail: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Agendar Nova Entrevista</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>Candidatura:</label>
            <select
              value={formData.applicationId}
              onChange={(e) => {
                const app = applications.find(a => a._id === e.target.value);
                setFormData({
                  ...formData,
                  applicationId: e.target.value,
                  candidateId: app?.candidateId._id || '',
                  jobId: app?.jobId._id || '',
                  title: app ? `Entrevista - ${app.candidateId.name}` : ''
                });
              }}
              required
            >
              <option value="">Selecione uma candidatura</option>
              {applications.map(app => (
                <option key={app._id} value={app._id}>
                  {app.candidateId.name} - {app.jobId.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Título:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Data e Hora:</label>
            <input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Duração (minutos):</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              min="15"
              max="240"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tipo:</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              required
            >
              <option value="online">Videoconferência</option>
              <option value="presential">Presencial</option>
              <option value="phone">Telefone</option>
            </select>
          </div>

          {formData.type === 'presential' && (
            <div className={styles.formGroup}>
              <label>Local:</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Endereço ou local da entrevista"
              />
            </div>
          )}

          {formData.type === 'online' && (
            <div className={styles.formGroup}>
              <label>Link da Videoconferência:</label>
              <input
                type="url"
                value={formData.meetingUrl}
                onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Nome do Entrevistador:</label>
            <input
              type="text"
              value={formData.interviewerName}
              onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>E-mail do Entrevistador:</label>
            <input
              type="email"
              value={formData.interviewerEmail}
              onChange={(e) => setFormData({ ...formData, interviewerEmail: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Descrição:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Descrição da entrevista, objetivos, etc."
            />
          </div>

          <div className={styles.formGroup}>
            <label>Observações:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Observações adicionais"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Enviando...' : 'Solicitar Entrevista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente para modal de feedback
function FeedbackModal({ interview, onClose, onSubmit, loading }: {
  interview: Interview;
  onClose: () => void;
  onSubmit: (feedback: any) => void;
  loading: boolean;
}) {
  const [feedback, setFeedback] = useState({
    technical: 5,
    communication: 5,
    experience: 5,
    overall: 5,
    comments: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feedback);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Avaliar Entrevista</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.interviewSummary}>
            <h4>{interview.title}</h4>
            <p><strong>Candidato:</strong> {interview.candidateId.name}</p>
            <p><strong>Data:</strong> {new Date(interview.scheduledDate).toLocaleString('pt-BR')}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.feedbackForm}>
              <div className={styles.ratingGroup}>
                <label>Avaliação Técnica:</label>
                <select
                  value={feedback.technical}
                  onChange={(e) => setFeedback({ ...feedback, technical: parseInt(e.target.value) })}
                  required
                >
                  <option value={1}>1 - Insuficiente</option>
                  <option value={2}>2 - Regular</option>
                  <option value={3}>3 - Bom</option>
                  <option value={4}>4 - Muito Bom</option>
                  <option value={5}>5 - Excelente</option>
                </select>
              </div>

              <div className={styles.ratingGroup}>
                <label>Comunicação:</label>
                <select
                  value={feedback.communication}
                  onChange={(e) => setFeedback({ ...feedback, communication: parseInt(e.target.value) })}
                  required
                >
                  <option value={1}>1 - Insuficiente</option>
                  <option value={2}>2 - Regular</option>
                  <option value={3}>3 - Bom</option>
                  <option value={4}>4 - Muito Bom</option>
                  <option value={5}>5 - Excelente</option>
                </select>
              </div>

              <div className={styles.ratingGroup}>
                <label>Experiência:</label>
                <select
                  value={feedback.experience}
                  onChange={(e) => setFeedback({ ...feedback, experience: parseInt(e.target.value) })}
                  required
                >
                  <option value={1}>1 - Insuficiente</option>
                  <option value={2}>2 - Regular</option>
                  <option value={3}>3 - Bom</option>
                  <option value={4}>4 - Muito Bom</option>
                  <option value={5}>5 - Excelente</option>
                </select>
              </div>

              <div className={styles.ratingGroup}>
                <label>Avaliação Geral:</label>
                <select
                  value={feedback.overall}
                  onChange={(e) => setFeedback({ ...feedback, overall: parseInt(e.target.value) })}
                  required
                >
                  <option value={1}>1 - Insuficiente</option>
                  <option value={2}>2 - Regular</option>
                  <option value={3}>3 - Bom</option>
                  <option value={4}>4 - Muito Bom</option>
                  <option value={5}>5 - Excelente</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Comentários:</label>
                <textarea
                  value={feedback.comments}
                  onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                  rows={4}
                  placeholder="Comentários sobre a entrevista, pontos fortes, áreas de melhoria, etc."
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 