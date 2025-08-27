'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './vagas.module.css';

interface Job {
  _id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
    isRemote: boolean;
  };
  workType: 'full_time' | 'part_time' | 'contract' | 'internship';
  salary: {
    min: number;
    max: number;
    currency: string;
    isNegotiable: boolean;
  };
  status: 'draft' | 'published' | 'closed' | 'archived';
  applications: number;
  views: number;
  createdAt: string;
  expiresAt?: string;
}

export default function VagasPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/empresa/login');
        return;
      }

      const response = await fetch('/api/empresa/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        console.error('Erro ao carregar vagas');
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: 'Rascunho', class: 'draft' },
      published: { label: 'Publicada', class: 'published' },
      closed: { label: 'Fechada', class: 'closed' },
      archived: { label: 'Arquivada', class: 'archived' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, class: 'default' };
    return <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>{statusInfo.label}</span>;
  };

  const getWorkTypeLabel = (workType: string) => {
    const typeMap = {
      full_time: 'Tempo Integral',
      part_time: 'Meio Período',
      contract: 'Contrato',
      internship: 'Estágio'
    };
    return typeMap[workType as keyof typeof typeMap] || workType;
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando vagas...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Minhas Vagas</h1>
        <Link href="/empresa/vagas/nova" className={styles.createButton}>
          + Nova Vaga
        </Link>
      </div>

      <div className={styles.filters}>
        <button 
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas ({jobs.length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'published' ? styles.active : ''}`}
          onClick={() => setFilter('published')}
        >
          Publicadas ({jobs.filter(j => j.status === 'published').length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'draft' ? styles.active : ''}`}
          onClick={() => setFilter('draft')}
        >
          Rascunhos ({jobs.filter(j => j.status === 'draft').length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'closed' ? styles.active : ''}`}
          onClick={() => setFilter('closed')}
        >
          Fechadas ({jobs.filter(j => j.status === 'closed').length})
        </button>
      </div>

      {filteredJobs.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>Nenhuma vaga encontrada</h3>
          <p>Você ainda não criou nenhuma vaga ou não há vagas com o filtro selecionado.</p>
          <Link href="/empresa/vagas/nova" className={styles.createButton}>
            Criar Primeira Vaga
          </Link>
        </div>
      ) : (
        <div className={styles.jobsGrid}>
          {filteredJobs.map((job) => (
            <div key={job._id} className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <h3>{job.title}</h3>
                {getStatusBadge(job.status)}
              </div>
              
              <div className={styles.jobDetails}>
                <div className={styles.location}>
                  📍 {job.location.city}, {job.location.state}
                  {job.location.isRemote && ' (Remoto)'}
                </div>
                <div className={styles.workType}>
                  ⏰ {getWorkTypeLabel(job.workType)}
                </div>
                <div className={styles.salary}>
                  💰 {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                  {job.salary.isNegotiable && ' (Negociável)'}
                </div>
              </div>

              <div className={styles.jobStats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Visualizações</span>
                  <span className={styles.statValue}>{job.views}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Candidaturas</span>
                  <span className={styles.statValue}>{job.applications}</span>
                </div>
              </div>

              <div className={styles.jobActions}>
                <Link href={`/empresa/vagas/${job._id}`} className={styles.viewButton}>
                  Visualizar
                </Link>
                <Link href={`/empresa/vagas/${job._id}/edit`} className={styles.editButton}>
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
