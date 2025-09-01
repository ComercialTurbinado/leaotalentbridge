'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  adminApprovedBy?: { _id: string; name: string };
  adminApprovedAt?: string;
  
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
  feedbackAdminComments?: string;
  
  // Relacionamentos
  candidateId: { _id: string; name: string; email: string };
  companyId: { _id: string; name: string };
  jobId?: { _id: string; title: string };
  applicationId?: string;
  createdBy: { _id: string; name: string };
  createdAt: string;
}

export default function AdminEntrevistas() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState('');

  useEffect(() => {
    loadInterviews();
  }, [activeTab]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (activeTab === 'pending') {
        params.append('adminStatus', 'pending');
      } else if (activeTab === 'feedback') {
        params.append('feedbackStatus', 'pending');
      } else if (activeTab === 'all') {
        // Buscar todas
      }

      const response = await fetch(`/api/admin/interviews?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
      }
    } catch (error) {
      console.error('Erro ao carregar entrevistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveInterview = async (interviewId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/admin/interviews/${interviewId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          comments: comments.trim() || undefined
        })
      });

      if (response.ok) {
        await loadInterviews();
        setShowModal(false);
        setSelectedInterview(null);
        setComments('');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao processar solicitação');
      }
    } catch (error) {
      console.error('Erro ao aprovar/rejeitar entrevista:', error);
      alert('Erro ao processar solicitação');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveFeedback = async (interviewId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/admin/interviews/${interviewId}/feedback/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          comments: comments.trim() || undefined
        })
      });

      if (response.ok) {
        await loadInterviews();
        setShowModal(false);
        setSelectedInterview(null);
        setComments('');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao processar solicitação');
      }
    } catch (error) {
      console.error('Erro ao aprovar/rejeitar feedback:', error);
      alert('Erro ao processar solicitação');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (interview: Interview) => {
    setSelectedInterview(interview);
    setComments('');
    setShowModal(true);
  };

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

  const getFeedbackStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', class: 'pending' },
      approved: { label: 'Aprovado', class: 'approved' },
      rejected: { label: 'Rejeitado', class: 'rejected' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, class: 'default' };
    return <span className={`${styles.feedbackStatusBadge} ${styles[config.class]}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando entrevistas...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🎯 Moderação de Entrevistas</h1>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {interviews.filter(i => i.adminStatus === 'pending').length}
            </span>
            <span className={styles.statLabel}>Pendentes</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {interviews.filter(i => i.feedbackStatus === 'pending').length}
            </span>
            <span className={styles.statLabel}>Feedback Pendente</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'pending' ? styles.active : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Aguardando Aprovação ({interviews.filter(i => i.adminStatus === 'pending').length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'feedback' ? styles.active : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          📝 Feedback Pendente ({interviews.filter(i => i.feedbackStatus === 'pending').length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
        >
          📋 Todas as Entrevistas
        </button>
      </div>

      {/* Lista de entrevistas */}
      <div className={styles.interviewsList}>
        {interviews.length > 0 ? (
          interviews.map(interview => (
            <div key={interview._id} className={styles.interviewCard}>
              <div className={styles.interviewHeader}>
                <div className={styles.interviewInfo}>
                  <h3>{interview.title}</h3>
                  <div className={styles.interviewMeta}>
                    <span>👤 {interview.candidateId.name}</span>
                    <span>🏢 {interview.companyId.name}</span>
                    {interview.jobId && <span>💼 {interview.jobId.title}</span>}
                    <span>📅 {new Date(interview.scheduledDate).toLocaleDateString('pt-BR')}</span>
                    <span>⏰ {new Date(interview.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className={styles.interviewStatus}>
                  {getStatusBadge(interview.status)}
                  {getAdminStatusBadge(interview.adminStatus)}
                  {interview.feedbackStatus && getFeedbackStatusBadge(interview.feedbackStatus)}
                </div>
              </div>

              <div className={styles.interviewDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tipo:</span>
                  <span className={styles.detailValue}>
                    {interview.type === 'presential' ? '🏢 Presencial' :
                     interview.type === 'online' ? '💻 Online' : '📞 Telefone'}
                  </span>
                </div>
                
                {interview.location && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Local:</span>
                    <span className={styles.detailValue}>{interview.location}</span>
                  </div>
                )}
                
                {interview.meetingUrl && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Link:</span>
                    <span className={styles.detailValue}>
                      <a href={interview.meetingUrl} target="_blank" rel="noopener noreferrer">
                        {interview.meetingUrl}
                      </a>
                    </span>
                  </div>
                )}

                {interview.interviewerName && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Entrevistador:</span>
                    <span className={styles.detailValue}>{interview.interviewerName}</span>
                  </div>
                )}

                {interview.description && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Descrição:</span>
                    <span className={styles.detailValue}>{interview.description}</span>
                  </div>
                )}

                {interview.notes && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Observações:</span>
                    <span className={styles.detailValue}>{interview.notes}</span>
                  </div>
                )}
              </div>

              {/* Resposta do candidato */}
              {interview.candidateResponse && interview.candidateResponse !== 'pending' && (
                <div className={styles.candidateResponse}>
                  <h4>Resposta do Candidato:</h4>
                  <div className={`${styles.response} ${styles[interview.candidateResponse]}`}>
                    <span>
                      {interview.candidateResponse === 'accepted' ? '✅ Aceitou' : '❌ Rejeitou'}
                    </span>
                    {interview.candidateComments && (
                      <p>{interview.candidateComments}</p>
                    )}
                    <small>
                      {interview.candidateResponseAt && 
                        new Date(interview.candidateResponseAt).toLocaleString('pt-BR')
                      }
                    </small>
                  </div>
                </div>
              )}

              {/* Feedback da empresa */}
              {interview.companyFeedback && (
                <div className={styles.companyFeedback}>
                  <h4>Avaliação da Empresa:</h4>
                  <div className={styles.feedbackScores}>
                    <div className={styles.scoreItem}>
                      <span>Técnico:</span>
                      <span className={styles.score}>{interview.companyFeedback.technical}/5</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span>Comunicação:</span>
                      <span className={styles.score}>{interview.companyFeedback.communication}/5</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span>Experiência:</span>
                      <span className={styles.score}>{interview.companyFeedback.experience}/5</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span>Geral:</span>
                      <span className={styles.score}>{interview.companyFeedback.overall}/5</span>
                    </div>
                  </div>
                  {interview.companyFeedback.comments && (
                    <p className={styles.feedbackComments}>{interview.companyFeedback.comments}</p>
                  )}
                </div>
              )}

              {/* Feedback do candidato */}
              {interview.candidateFeedback && (
                <div className={styles.candidateFeedback}>
                  <h4>Avaliação do Candidato:</h4>
                  <div className={styles.feedbackScores}>
                    <div className={styles.scoreItem}>
                      <span>Avaliação:</span>
                      <span className={styles.score}>{interview.candidateFeedback.rating}/5</span>
                    </div>
                  </div>
                  {interview.candidateFeedback.comments && (
                    <p className={styles.feedbackComments}>{interview.candidateFeedback.comments}</p>
                  )}
                </div>
              )}

              {/* Ações */}
              <div className={styles.actions}>
                {interview.adminStatus === 'pending' && (
                  <>
                    <button 
                      className={styles.approveBtn}
                      onClick={() => openModal(interview)}
                    >
                      ✅ Aprovar
                    </button>
                    <button 
                      className={styles.rejectBtn}
                      onClick={() => openModal(interview)}
                    >
                      ❌ Rejeitar
                    </button>
                  </>
                )}

                {interview.feedbackStatus === 'pending' && interview.companyFeedback && (
                  <>
                    <button 
                      className={styles.approveBtn}
                      onClick={() => openModal(interview)}
                    >
                      ✅ Aprovar Feedback
                    </button>
                    <button 
                      className={styles.rejectBtn}
                      onClick={() => openModal(interview)}
                    >
                      ❌ Rejeitar Feedback
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <h3>Nenhuma entrevista encontrada</h3>
            <p>Não há entrevistas para moderar no momento.</p>
          </div>
        )}
      </div>

      {/* Modal de ação */}
      {showModal && selectedInterview && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                {selectedInterview.adminStatus === 'pending' ? 'Aprovar/Rejeitar Entrevista' : 'Aprovar/Rejeitar Feedback'}
              </h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.interviewSummary}>
                <h4>{selectedInterview.title}</h4>
                <p><strong>Candidato:</strong> {selectedInterview.candidateId.name}</p>
                <p><strong>Empresa:</strong> {selectedInterview.companyId.name}</p>
                <p><strong>Data:</strong> {new Date(selectedInterview.scheduledDate).toLocaleString('pt-BR')}</p>
              </div>

              <div className={styles.commentsSection}>
                <label htmlFor="comments">Comentários (opcional):</label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Adicione comentários sobre sua decisão..."
                  rows={4}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              >
                Cancelar
              </button>
              
              {selectedInterview.adminStatus === 'pending' ? (
                <>
                  <button 
                    className={styles.approveBtn}
                    onClick={() => handleApproveInterview(selectedInterview._id, 'approve')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processando...' : '✅ Aprovar'}
                  </button>
                  <button 
                    className={styles.rejectBtn}
                    onClick={() => handleApproveInterview(selectedInterview._id, 'reject')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processando...' : '❌ Rejeitar'}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={styles.approveBtn}
                    onClick={() => handleApproveFeedback(selectedInterview._id, 'approve')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processando...' : '✅ Aprovar Feedback'}
                  </button>
                  <button 
                    className={styles.rejectBtn}
                    onClick={() => handleApproveFeedback(selectedInterview._id, 'reject')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processando...' : '❌ Rejeitar Feedback'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
