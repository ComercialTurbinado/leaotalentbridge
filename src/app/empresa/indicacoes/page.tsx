'use client';

import { useState, useEffect } from 'react';
import { GrUser, GrBriefcase, GrLocation, GrMoney, GrClock, GrCheckmark, GrClose, GrPause } from 'react-icons/gr';
import styles from './indicacoes.module.css';

interface Indicacao {
  id: string;
  job: {
    id: string;
    title: string;
    category: string;
    location: {
      city?: string;
      state?: string;
      country?: string;
      remote?: boolean;
    };
    workType: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    status: string;
  };
  candidate: {
    id: string;
    name: string;
    profile: {
      skills: string[];
      experience: string;
      education: string;
      location: {
        city?: string;
        state?: string;
        country?: string;
      };
    };
  };
  status: 'pending' | 'accepted' | 'rejected';
  recommendedAt: string;
  respondedAt?: string;
  companyNotes?: string;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

export default function IndicacoesPage() {
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndicacao, setSelectedIndicacao] = useState<Indicacao | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [responseStatus, setResponseStatus] = useState<'accepted' | 'rejected'>('accepted');
  const [companyNotes, setCompanyNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    avgScore: 0
  });

  useEffect(() => {
    loadIndicacoes();
  }, []);

  const loadIndicacoes = async () => {
    try {
      setLoading(true);
      // Simular companyId - em produção viria da autenticação
      const companyId = '507f1f77bcf86cd799439011'; // ID de exemplo
      const response = await fetch(`/api/companies/${companyId}/recommendations`);
      const data = await response.json();
      
      if (data.success) {
        setIndicacoes(data.data);
        
        // Calcular estatísticas
        const total = data.data.length;
        const pending = data.data.filter((i: Indicacao) => i.status === 'pending').length;
        const accepted = data.data.filter((i: Indicacao) => i.status === 'accepted').length;
        const rejected = data.data.filter((i: Indicacao) => i.status === 'rejected').length;
        const avgScore = data.data.length > 0 
          ? Math.round(data.data.reduce((sum: number, i: Indicacao) => sum + (i.matchScore || 0), 0) / data.data.length)
          : 0;
        
        setStats({ total, pending, accepted, rejected, avgScore });
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
      const companyId = '507f1f77bcf86cd799439011'; // ID de exemplo
      const response = await fetch(`/api/companies/${companyId}/recommendations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recommendationId: selectedIndicacao.id,
          status: responseStatus,
          companyNotes
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Atualizar a lista de indicações
        setIndicacoes(prev => prev.map(ind => 
          ind.id === selectedIndicacao.id 
            ? { ...ind, status: responseStatus, companyNotes, respondedAt: new Date().toISOString() }
            : ind
        ));
        
        // Atualizar estatísticas
        loadIndicacoes();
        
        setShowModal(false);
        setSelectedIndicacao(null);
        setResponseStatus('accepted');
        setCompanyNotes('');
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
      rejected: { label: 'Recusada', class: 'red', icon: <GrClose /> }
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
              <h1>Candidatos Indicados</h1>
              <p>Profissionais recomendados para suas vagas</p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.stats}>
                <span className={styles.statItem}>
                  <strong>{stats.total}</strong> indicações
                </span>
                <span className={styles.statItem}>
                  <strong>{stats.pending}</strong> pendentes
                </span>
                <span className={styles.statItem}>
                  <strong>{stats.avgScore}%</strong> score médio
                </span>
              </div>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrUser />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.total}</h3>
                <p>Total de Indicações</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.pending}</h3>
                <p>Pendentes de Resposta</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrCheckmark />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.accepted}</h3>
                <p>Indicações Aceitas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClose />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.rejected}</h3>
                <p>Indicações Recusadas</p>
              </div>
            </div>
          </div>

          {/* Lista de Indicações */}
          <div className={styles.indicacoesGrid}>
            {indicacoes.length === 0 ? (
              <div className={styles.emptyState}>
                <GrUser size={64} />
                <h3>Nenhuma indicação encontrada</h3>
                <p>Você ainda não recebeu indicações de candidatos para suas vagas.</p>
              </div>
            ) : (
              indicacoes.map((indicacao) => (
                <div key={indicacao.id} className={styles.indicacaoCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.candidateInfo}>
                      <div className={styles.candidateAvatar}>
                        <GrUser />
                      </div>
                      <div className={styles.candidateDetails}>
                        <h3>{indicacao.candidate.name}</h3>
                        <p className={styles.candidateLocation}>
                          <GrLocation />
                          {indicacao.candidate.profile.location.city && 
                           `${indicacao.candidate.profile.location.city}${indicacao.candidate.profile.location.state ? `, ${indicacao.candidate.profile.location.state}` : ''}`}
                        </p>
                      </div>
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
                    <div className={styles.jobInfo}>
                      <h4>Vaga: {indicacao.job.title}</h4>
                      <p className={styles.jobCategory}>{indicacao.job.category}</p>
                    </div>

                    <div className={styles.candidateProfile}>
                      <div className={styles.profileSection}>
                        <h4>Experiência</h4>
                        <p>{indicacao.candidate.profile.experience}</p>
                      </div>
                      
                      <div className={styles.profileSection}>
                        <h4>Educação</h4>
                        <p>{indicacao.candidate.profile.education}</p>
                      </div>

                      <div className={styles.profileSection}>
                        <h4>Habilidades</h4>
                        <div className={styles.skillsList}>
                          {indicacao.candidate.profile.skills.slice(0, 6).map((skill, index) => (
                            <span key={index} className={styles.skillTag}>{skill}</span>
                          ))}
                          {indicacao.candidate.profile.skills.length > 6 && (
                            <span className={styles.skillMore}>+{indicacao.candidate.profile.skills.length - 6}</span>
                          )}
                        </div>
                      </div>
                    </div>

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
              <div className={styles.candidateSummary}>
                <h3>{selectedIndicacao.candidate.name}</h3>
                <p>Vaga: {selectedIndicacao.job.title}</p>
                <p>Score de compatibilidade: {selectedIndicacao.matchScore}%</p>
              </div>

              <div className={styles.responseForm}>
                <div className={styles.formGroup}>
                  <label>Status da Resposta:</label>
                  <select
                    value={responseStatus}
                    onChange={(e) => setResponseStatus(e.target.value as any)}
                    className={styles.formSelect}
                  >
                    <option value="accepted">Aceitar Candidato</option>
                    <option value="rejected">Recusar Candidato</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Observações (opcional):</label>
                  <textarea
                    value={companyNotes}
                    onChange={(e) => setCompanyNotes(e.target.value)}
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
