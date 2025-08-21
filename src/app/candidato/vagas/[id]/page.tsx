// src/app/candidato/vagas/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  GrLocation, 
  GrMoney, 
  GrBriefcase, 
  GrClock, 
  GrOrganization, 
  GrSend, 
  GrStatusCritical, 
  GrBook,
  GrUser,
  GrCertificate,
  GrCheckmark,
  GrFormPrevious
} from 'react-icons/gr';
import styles from './detalhes-vaga.module.css';

interface Job {
  _id: string;
  title: string;
  description: string;
  summary: string;
  companyId: {
    _id: string;
    name: string;
    logo?: string;
    industry: string;
    description?: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
    isRemote: boolean;
    isHybrid: boolean;
  };
  workType: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  requirements: {
    education: string;
    experience: string;
    skills: string[];
  };
  benefits: string[];
  category: string;
  publishedAt: string;
  expiresAt: string;
  status: string;
  tags: string[];
}

interface Application {
  _id: string;
  jobId: string;
  status: string;
}

export default function DetalhesVagaPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  
  const [user, setUser] = useState<UserType | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applyingToJob, setApplyingToJob] = useState<boolean>(false);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
    loadJobDetails();
    loadApplications();
  }, [router, jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const jobData = await ApiService.getJob(jobId) as Job;
      setJob(jobData);
    } catch (error) {
      console.error('Erro ao carregar detalhes da vaga:', error);
      setError('Erro ao carregar detalhes da vaga');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const currentUser = AuthService.getUser();
      if (!currentUser) return;

      const applicationsResponse = await ApiService.getApplications({
        candidateId: currentUser._id,
        jobId: jobId,
        limit: 1,
        page: 1
      }) as any;
      
      const applicationsData = applicationsResponse.data || [];
      setApplications(applicationsData);
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
    }
  };

  const handleApply = async () => {
    if (!user || !job) return;

    setApplyingToJob(true);

    try {
      await ApiService.createApplication({
        jobId: job._id,
        coverLetter: 'Candidatura enviada através da plataforma Leão Talent Bridge.',
        source: 'platform'
      });

      const newApplication: Application = {
        _id: Date.now().toString(),
        jobId: job._id,
        status: 'applied'
      };
      setApplications([newApplication]);
      
      alert('Candidatura enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao se candidatar:', error);
      alert(error instanceof Error ? error.message : 'Erro ao enviar candidatura. Tente novamente.');
    } finally {
      setApplyingToJob(false);
    }
  };

  const isApplied = () => {
    return applications.length > 0;
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary || (!salary.min && !salary.max)) return 'Salário a combinar';
    
    const formatValue = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: salary.currency || 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };

    if (salary.min && salary.max) {
      return `${formatValue(salary.min)} - ${formatValue(salary.max)}`;
    } else if (salary.min) {
      return `A partir de ${formatValue(salary.min)}`;
    } else {
      return `Até ${formatValue(salary.max)}`;
    }
  };

  const getWorkTypeLabel = (workType: string) => {
    const types = {
      'full-time': 'Tempo Integral',
      'part-time': 'Meio Período',
      'contract': 'Contrato',
      'freelance': 'Freelance',
      'internship': 'Estágio'
    };
    return types[workType as keyof typeof types] || workType;
  };

  const getLocationLabel = (location: Job['location']) => {
    if (!location) return 'Não especificado';
    
    if (location.isRemote) {
      return 'Remoto';
    } else if (location.isHybrid) {
      return `${location.city}, ${location.state} (Híbrido)`;
    } else {
      return `${location.city}, ${location.state}`;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      'technology': 'Tecnologia',
      'engineering': 'Engenharia',
      'healthcare': 'Saúde',
      'finance': 'Finanças',
      'marketing': 'Marketing',
      'sales': 'Vendas',
      'other': 'Outros'
    };
    return categories[category as keyof typeof categories] || category;
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorContent}>
          <h2>Erro ao carregar vaga</h2>
          <p>{error || 'Vaga não encontrada'}</p>
          <Link href="/candidato/vagas" className="btn btn-primary">
            Voltar para Vagas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.detalhesPage}>
      <DashboardHeader 
        user={user} 
        userType="candidato"
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <Link href="/candidato/vagas" className={styles.breadcrumbLink}>
              <GrFormPrevious size={16} />
              Voltar para Vagas
            </Link>
          </div>

          <div className={styles.jobHeader}>
            <div className={styles.jobHeaderContent}>
              <div className={styles.companyInfo}>
                <div className={styles.companyLogo}>
                  <GrOrganization size={32} />
                </div>
                <div>
                  <h1 className={styles.jobTitle}>{job.title}</h1>
                  <p className={styles.companyName}>{job.companyId.name}</p>
                  <p className={styles.jobCategory}>{getCategoryLabel(job.category)}</p>
                </div>
              </div>

              <div className={styles.jobActions}>
                {isApplied() ? (
                  <div className={styles.appliedStatus}>
                    <GrStatusCritical size={20} />
                    <span>Candidatura Enviada</span>
                  </div>
                ) : (
                  <button
                    className={styles.applyButton}
                    onClick={handleApply}
                    disabled={applyingToJob}
                  >
                    {applyingToJob ? (
                      <>Enviando...</>
                    ) : (
                      <>
                        <GrSend size={20} />
                        Candidatar-se
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.jobDetailsGrid}>
            <div className={styles.jobMainContent}>
              {job.summary && (
                <div className={styles.jobSection}>
                  <h2>Resumo da Vaga</h2>
                  <p className={styles.jobSummary}>{job.summary}</p>
                </div>
              )}

              <div className={styles.jobSection}>
                <h2>Descrição da Vaga</h2>
                <div className={styles.jobDescription}>
                  {job.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className={styles.jobSection}>
                <h2>Requisitos</h2>
                <div className={styles.requirements}>
                  {job.requirements?.education && (
                    <div className={styles.requirement}>
                      <GrBook size={18} />
                      <div>
                        <h4>Educação</h4>
                        <p>{job.requirements.education}</p>
                      </div>
                    </div>
                  )}
                  
                  {job.requirements?.experience && (
                    <div className={styles.requirement}>
                      <GrUser size={18} />
                      <div>
                        <h4>Experiência</h4>
                        <p>{job.requirements.experience}</p>
                      </div>
                    </div>
                  )}
                  
                  {job.requirements?.skills && job.requirements.skills.length > 0 && (
                    <div className={styles.requirement}>
                      <GrCertificate size={18} />
                      <div>
                        <h4>Habilidades Técnicas</h4>
                        <div className={styles.skillsList}>
                          {job.requirements.skills.map((skill, index) => (
                            <span key={index} className={styles.skillTag}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {job.benefits && job.benefits.length > 0 && (
                <div className={styles.jobSection}>
                  <h2>Benefícios</h2>
                  <div className={styles.benefitsList}>
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className={styles.benefit}>
                        <GrCheckmark size={16} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.jobSidebar}>
              <div className={styles.jobInfoCard}>
                <h3>Informações da Vaga</h3>
                
                <div className={styles.jobInfo}>
                  <div className={styles.infoItem}>
                    <GrLocation size={18} />
                    <div>
                      <span className={styles.infoLabel}>Localização</span>
                      <span className={styles.infoValue}>{getLocationLabel(job.location)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <GrMoney size={18} />
                    <div>
                      <span className={styles.infoLabel}>Salário</span>
                      <span className={styles.infoValue}>{formatSalary(job.salary)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <GrBriefcase size={18} />
                    <div>
                      <span className={styles.infoLabel}>Tipo de Trabalho</span>
                      <span className={styles.infoValue}>{getWorkTypeLabel(job.workType)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <GrClock size={18} />
                    <div>
                      <span className={styles.infoLabel}>Publicada em</span>
                      <span className={styles.infoValue}>
                        {new Date(job.publishedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <GrClock size={18} />
                    <div>
                      <span className={styles.infoLabel}>Expira em</span>
                      <span className={styles.infoValue}>
                        {new Date(job.expiresAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.companyInfoCard}>
                <h3>Sobre a Empresa</h3>
                <div className={styles.companyDetails}>
                  <div className={styles.companyHeader}>
                    <div className={styles.companyLogo}>
                      <GrOrganization size={24} />
                    </div>
                    <div>
                      <h4>{job.companyId.name}</h4>
                      <p>{job.companyId.industry}</p>
                    </div>
                  </div>
                  
                  {job.companyId.description && (
                    <p className={styles.companyDescription}>
                      {job.companyId.description}
                    </p>
                  )}
                </div>
              </div>

              {!isApplied() && (
                <div className={styles.sidebarApplySection}>
                  <button
                    className={styles.sidebarApplyButton}
                    onClick={handleApply}
                    disabled={applyingToJob}
                  >
                    {applyingToJob ? (
                      <>Enviando...</>
                    ) : (
                      <>
                        <GrSend size={18} />
                        Candidatar-se Agora
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
