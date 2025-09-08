'use client';

import { useState, useEffect } from 'react';
import { GrBriefcase, GrLocation, GrMoney, GrClock, GrCheckmark, GrClose, GrPause } from 'react-icons/gr';
import styles from './indicacoes.module.css';

interface Indicacao {
  id: string;
  job: {
    id: string;
    title: string;
    description: string;
    summary: string;
    category: string;
    location: {
      city?: string;
      state?: string;
      country?: string;
      remote?: boolean;
    };
    workType: string;
    workSchedule: string;
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
    tags: string[];
    status: string;
    publishedAt: string;
    expiresAt: string;
  };
  company: {
    name: string;
    industry: string;
    logo?: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  recommendedAt: string;
  respondedAt?: string;
  candidateNotes?: string;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

export default function IndicacoesPage() {
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndicacao, setSelectedIndicacao] = useState<Indicacao | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [responseStatus, setResponseStatus] = useState<'pending' | 'accepted' | 'rejected' | 'withdrawn'>('pending');
  const [candidateNotes, setCandidateNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadIndicacoes();
  }, []);

  const loadIndicacoes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/candidates/recommendations');
      const data = await response.json();
      
      if (data.success) {
        setIndicacoes(data.data);
      } else {
        console.error('Erro ao carregar indicações:', data.message);
      }
    } catch (error) {
      console.error('Erro ao carregar indicações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToIndicacao = async () => {
    if (!selectedIndicacao) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/candidates/recommendations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recommendationId: selectedIndicacao.id,
          status: responseStatus,
          candidateNotes
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Atualizar a lista de indicações
        setIndicacoes(prev => prev.map(ind => 
          ind.id === selectedIndicacao.id 
            ? { ...ind, status: responseStatus, candidateNotes, respondedAt: new Date().toISOString() }
            : ind
        ));
        setShowModal(false);
        setSelectedIndicacao(null);
        setResponseStatus('pending');
        setCandidateNotes('');
      } else {
        alert('Erro ao responder à indicação: ' + data.message);
      }
    } catch (error) {
      console.error('Erro ao responder à indicação:', error);
      alert('Erro ao responder à indicação');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', class: 'yellow', icon: <GrClock /> },
      accepted: { label: 'Aceita', class: 'green', icon: <GrCheckmark /> },
      rejected: { label: 'Recusada', class: 'red', icon: <GrClose /> },
      withdrawn: { label: 'Retirada', class: 'gray', icon: <GrPause /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`${styles.statusBadge} ${styles[config.class]}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.indicacoesPage}>
      <div className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Minhas Indicações</h1>
              <p>Vagas recomendadas especialmente para você</p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.stats}>
                <span className={styles.statItem}>
                  <strong>{indicacoes.length}</strong> indicações
                </span>
                <span className={styles.statItem}>
                  <strong>{indicacoes.filter(i => i.status === 'pending').length}</strong> pendentes
                </span>
              </div>
            </div>
          </div>

          {/* Lista de Indicações */}
          <div className={styles.indicacoesGrid}>
            {indicacoes.length === 0 ? (
              <div className={styles.emptyState}>
                <GrBriefcase size={64} />
                <h3>Nenhuma indicação encontrada</h3>
                <p>Você ainda não recebeu indicações de vagas. Continue atualizando seu perfil!</p>
              </div>
            ) : (
              indicacoes.map((indicacao) => (
                <div key={indicacao.id} className={styles.indicacaoCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.jobInfo}>
                      <h3>{indicacao.job.title}</h3>
                      <p className={styles.jobCategory}>{indicacao.job.category}</p>
                    </div>
                    <div className={styles.cardActions}>
                      {getStatusBadge(indicacao.status)}
                      {indicacao.matchScore && (
                        <div className={styles.scoreInfo}>
                          <span className={styles.scoreValue}>{indicacao.matchScore}%</span>
                          <div className={styles.scoreBar}>
                            <div 
                              className={styles.scoreFill} 
                              style={{ width: `${indicacao.matchScore}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.jobDetails}>
                      <div className={styles.detailItem}>
                        <GrLocation />
                        <span>
                          {indicacao.job.location.remote ? 'Remoto' : 
                           `${indicacao.job.location.city || ''}${indicacao.job.location.state ? `, ${indicacao.job.location.state}` : ''}`}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <GrClock />
                        <span>{indicacao.job.workType}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <GrMoney />
                        <span>{formatSalary(indicacao.job.salary)}</span>
                      </div>
                    </div>

                    <div className={styles.jobDescription}>
                      <p>{indicacao.job.summary}</p>
                    </div>

                    <div className={styles.jobSkills}>
                      <h4>Habilidades Requeridas:</h4>
                      <div className={styles.skillsList}>
                        {indicacao.job.requirements.skills.slice(0, 5).map((skill, index) => (
                          <span key={index} className={styles.skillTag}>{skill}</span>
                        ))}
                        {indicacao.job.requirements.skills.length > 5 && (
                          <span className={styles.skillMore}>+{indicacao.job.requirements.skills.length - 5}</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.jobTags}>
                      {indicacao.job.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.dateInfo}>
                      <span>Indicado em: {formatDate(indicacao.recommendedAt)}</span>
                      {indicacao.respondedAt && (
                        <span>Respondido em: {formatDate(indicacao.respondedAt)}</span>
                      )}
                    </div>
                    
                    {indicacao.status === 'pending' && (
                      <button
                        className={styles.respondButton}
                        onClick={() => {
                          setSelectedIndicacao(indicacao);
                          setShowModal(true);
                        }}
                      >
                        Responder à Indicação
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Resposta */}
      {showModal && selectedIndicacao && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Responder à Indicação</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.jobSummary}>
                <h3>{selectedIndicacao.job.title}</h3>
                <p>{selectedIndicacao.job.summary}</p>
              </div>

              <div className={styles.responseForm}>
                <div className={styles.formGroup}>
                  <label>Status da Resposta:</label>
                  <select
                    value={responseStatus}
                    onChange={(e) => setResponseStatus(e.target.value as any)}
                    className={styles.formSelect}
                  >
                    <option value="accepted">Aceitar Indicação</option>
                    <option value="rejected">Recusar Indicação</option>
                    <option value="withdrawn">Retirar Candidatura</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Observações (opcional):</label>
                  <textarea
                    value={candidateNotes}
                    onChange={(e) => setCandidateNotes(e.target.value)}
                    placeholder="Adicione observações sobre sua decisão..."
                    className={styles.formTextarea}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                className={styles.submitButton}
                onClick={handleRespondToIndicacao}
                disabled={submitting}
              >
                {submitting ? 'Enviando...' : 'Confirmar Resposta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
