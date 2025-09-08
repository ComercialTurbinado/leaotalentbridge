'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  GrUser, 
  GrMail, 
  GrPhone, 
  GrLocation, 
  GrBriefcase, 
  GrCalendar,
  GrDocument,
  GrDownload,
  GrStar,
  GrStatusCritical,
  GrStatusWarning,
  GrFormPrevious,
  GrSend,
  GrView,
  GrBook,
  GrTrophy,
  GrGlobe,
  GrLinkedin
} from 'react-icons/gr';
import styles from './candidato-perfil.module.css';

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profile: {
    avatar?: string;
    bio?: string;
    location: {
      city: string;
      state: string;
      country: string;
    };
    birthDate?: string;
    nationality?: string;
    languages: string[];
    website?: string;
    linkedin?: string;
    github?: string;
  };
  education: {
    degree: string;
    institution: string;
    year: number;
    description?: string;
  }[];
  experience: {
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
    current: boolean;
  }[];
  skills: {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
  }[];
  documents: {
    type: string;
    name: string;
    url: string;
    uploadedAt: string;
  }[];
  applications: {
    jobId: string;
    jobTitle: string;
    status: string;
    appliedAt: string;
  }[];
}

export default function CandidatoPerfilPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params?.id as string;
  
  const [user, setUser] = useState<UserType | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'empresa') {
      router.push('/empresa/login');
      return;
    }
    setUser(currentUser);
    loadCandidate();
  }, [router, candidateId]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulando dados do candidato
      const mockCandidate: Candidate = {
        _id: candidateId,
        name: 'João Silva Santos',
        email: 'joao.silva@email.com',
        phone: '+971 50 123 4567',
        profile: {
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
          bio: 'Desenvolvedor Full Stack com 5 anos de experiência em React, Node.js e Python. Apaixonado por tecnologia e sempre em busca de novos desafios. Experiência em desenvolvimento de aplicações web escaláveis e APIs robustas.',
          location: {
            city: 'São Paulo',
            state: 'SP',
            country: 'Brasil'
          },
          birthDate: '1990-05-15',
          nationality: 'Brasileira',
          languages: ['Português (Nativo)', 'Inglês (Avançado)', 'Árabe (Básico)'],
          website: 'https://joaosilva.dev',
          linkedin: 'https://linkedin.com/in/joaosilva',
          github: 'https://github.com/joaosilva'
        },
        education: [
          {
            degree: 'Bacharelado em Ciência da Computação',
            institution: 'Universidade de São Paulo (USP)',
            year: 2015,
            description: 'Formação com foco em desenvolvimento de software, algoritmos e estruturas de dados.'
          },
          {
            degree: 'MBA em Gestão de Projetos',
            institution: 'FGV',
            year: 2018,
            description: 'Especialização em metodologias ágeis e gestão de equipes de desenvolvimento.'
          }
        ],
        experience: [
          {
            position: 'Desenvolvedor Full Stack Sênior',
            company: 'Tech Solutions Brasil',
            startDate: '2020-01-01',
            endDate: '2023-12-31',
            description: 'Desenvolvimento de aplicações web usando React, Node.js e MongoDB. Liderança de equipe de 4 desenvolvedores.',
            current: false
          },
          {
            position: 'Desenvolvedor Frontend',
            company: 'StartupXYZ',
            startDate: '2018-03-01',
            endDate: '2019-12-31',
            description: 'Criação de interfaces responsivas e otimizadas para aplicações SaaS.',
            current: false
          }
        ],
        skills: [
          { name: 'React', level: 'expert', category: 'Frontend' },
          { name: 'Node.js', level: 'advanced', category: 'Backend' },
          { name: 'Python', level: 'advanced', category: 'Backend' },
          { name: 'TypeScript', level: 'advanced', category: 'Languages' },
          { name: 'MongoDB', level: 'intermediate', category: 'Database' },
          { name: 'AWS', level: 'intermediate', category: 'Cloud' }
        ],
        certifications: [
          {
            name: 'AWS Certified Developer',
            issuer: 'Amazon Web Services',
            date: '2023-06-15',
            credentialId: 'AWS-DEV-2023-001'
          },
          {
            name: 'React Advanced Certification',
            issuer: 'Meta',
            date: '2022-11-20',
            credentialId: 'META-REACT-2022-456'
          }
        ],
        documents: [
          {
            type: 'CV',
            name: 'Currículo_João_Silva_2024.pdf',
            url: '/documents/cv-joao-silva.pdf',
            uploadedAt: '2024-01-15T10:30:00Z'
          },
          {
            type: 'Portfólio',
            name: 'Portfólio_Projetos.pdf',
            url: '/documents/portfolio-joao-silva.pdf',
            uploadedAt: '2024-01-15T10:35:00Z'
          }
        ],
        applications: [
          {
            jobId: '1',
            jobTitle: 'Desenvolvedor Full Stack',
            status: 'applied',
            appliedAt: '2024-01-10T14:20:00Z'
          }
        ]
      };
      
      setCandidate(mockCandidate);
    } catch (error) {
      console.error('Erro ao carregar candidato:', error);
      setError('Erro ao carregar perfil do candidato');
    } finally {
      setLoading(false);
    }
  };

  const getSkillLevelLabel = (level: string) => {
    const levels = {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
      expert: 'Especialista'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getSkillLevelColor = (level: string) => {
    const colors = {
      beginner: styles.levelBeginner,
      intermediate: styles.levelIntermediate,
      advanced: styles.levelAdvanced,
      expert: styles.levelExpert
    };
    return colors[level as keyof typeof colors] || '';
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorContent}>
          <h2>Erro ao carregar perfil</h2>
          <p>{error || 'Candidato não encontrado'}</p>
          <Link href="/empresa/candidatos" className="btn btn-primary">
            Voltar aos Candidatos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.candidatoPerfilPage}>
      <DashboardHeader 
        user={user} 
        userType="empresa"
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <Link href="/empresa/candidatos" className={styles.breadcrumbLink}>
              <GrFormPrevious size={16} />
              Voltar aos Candidatos
            </Link>
          </div>

          {/* Header do Perfil */}
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              <Image
                src={candidate.profile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'}
                alt={candidate.name}
                width={120}
                height={120}
              />
            </div>
            <div className={styles.profileInfo}>
              <h1>{candidate.name}</h1>
              <div className={styles.profileMeta}>
                <div className={styles.metaItem}>
                  <GrLocation size={16} />
                  <span>{candidate.profile.location.city}, {candidate.profile.location.state}</span>
                </div>
                <div className={styles.metaItem}>
                  <GrMail size={16} />
                  <span>{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className={styles.metaItem}>
                    <GrPhone size={16} />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.profile.birthDate && (
                  <div className={styles.metaItem}>
                    <GrCalendar size={16} />
                    <span>{calculateAge(candidate.profile.birthDate)} anos</span>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.profileActions}>
              <button className={styles.actionButton}>
                <GrSend size={16} />
                Enviar Mensagem
              </button>
              <button className={styles.actionButton}>
                <GrDownload size={16} />
                Baixar Currículo
              </button>
            </div>
          </div>

          {/* Navegação por Tabs */}
          <div className={styles.tabsNavigation}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <GrUser size={16} />
              Visão Geral
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'experience' ? styles.active : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              <GrBriefcase size={16} />
              Experiência
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'education' ? styles.active : ''}`}
              onClick={() => setActiveTab('education')}
            >
              <GrBook size={16} />
              Educação
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'skills' ? styles.active : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <GrTrophy size={16} />
              Habilidades
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'documents' ? styles.active : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <GrDocument size={16} />
              Documentos
            </button>
          </div>

          {/* Conteúdo das Tabs */}
          <div className={styles.tabContent}>
            {activeTab === 'overview' && (
              <div className={styles.overviewTab}>
                <div className={styles.contentGrid}>
                  <div className={styles.contentSection}>
                    <h2>Sobre</h2>
                    <p>{candidate.profile.bio}</p>
                  </div>
                  
                  <div className={styles.contentSection}>
                    <h2>Informações Pessoais</h2>
                    <div className={styles.infoList}>
                      <div className={styles.infoItem}>
                        <strong>Nacionalidade:</strong>
                        <span>{candidate.profile.nationality}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <strong>Idiomas:</strong>
                        <span>{candidate.profile.languages.join(', ')}</span>
                      </div>
                      {candidate.profile.website && (
                        <div className={styles.infoItem}>
                          <strong>Website:</strong>
                          <a href={candidate.profile.website} target="_blank" rel="noopener noreferrer">
                            <GrGlobe size={16} />
                            {candidate.profile.website}
                          </a>
                        </div>
                      )}
                      {candidate.profile.linkedin && (
                        <div className={styles.infoItem}>
                          <strong>LinkedIn:</strong>
                          <a href={candidate.profile.linkedin} target="_blank" rel="noopener noreferrer">
                            <GrLinkedin size={16} />
                            Ver Perfil
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className={styles.experienceTab}>
                <h2>Experiência Profissional</h2>
                <div className={styles.experienceList}>
                  {candidate.experience.map((exp, index) => (
                    <div key={index} className={styles.experienceItem}>
                      <div className={styles.experienceHeader}>
                        <h3>{exp.position}</h3>
                        <span className={styles.experiencePeriod}>
                          {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Atual'}
                        </span>
                      </div>
                      <p className={styles.experienceCompany}>{exp.company}</p>
                      <p className={styles.experienceDescription}>{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className={styles.educationTab}>
                <h2>Formação Acadêmica</h2>
                <div className={styles.educationList}>
                  {candidate.education.map((edu, index) => (
                    <div key={index} className={styles.educationItem}>
                      <div className={styles.educationHeader}>
                        <h3>{edu.degree}</h3>
                        <span className={styles.educationYear}>{edu.year}</span>
                      </div>
                      <p className={styles.educationInstitution}>{edu.institution}</p>
                      {edu.description && (
                        <p className={styles.educationDescription}>{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                {candidate.certifications.length > 0 && (
                  <div className={styles.certificationsSection}>
                    <h2>Certificações</h2>
                    <div className={styles.certificationsList}>
                      {candidate.certifications.map((cert, index) => (
                        <div key={index} className={styles.certificationItem}>
                          <div className={styles.certificationHeader}>
                            <h3>{cert.name}</h3>
                            <span className={styles.certificationDate}>
                              {new Date(cert.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className={styles.certificationIssuer}>{cert.issuer}</p>
                          {cert.credentialId && (
                            <p className={styles.certificationId}>ID: {cert.credentialId}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className={styles.skillsTab}>
                <h2>Habilidades Técnicas</h2>
                <div className={styles.skillsGrid}>
                  {candidate.skills.map((skill, index) => (
                    <div key={index} className={styles.skillItem}>
                      <div className={styles.skillHeader}>
                        <span className={styles.skillName}>{skill.name}</span>
                        <span className={`${styles.skillLevel} ${getSkillLevelColor(skill.level)}`}>
                          {getSkillLevelLabel(skill.level)}
                        </span>
                      </div>
                      <div className={styles.skillCategory}>{skill.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className={styles.documentsTab}>
                <h2>Documentos</h2>
                <div className={styles.documentsList}>
                  {candidate.documents.map((doc, index) => (
                    <div key={index} className={styles.documentItem}>
                      <div className={styles.documentIcon}>
                        <GrDocument size={24} />
                      </div>
                      <div className={styles.documentInfo}>
                        <h3>{doc.name}</h3>
                        <p>Tipo: {doc.type}</p>
                        <p>Enviado em: {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className={styles.documentActions}>
                        <button className={styles.documentAction}>
                          <GrView size={16} />
                          Visualizar
                        </button>
                        <button className={styles.documentAction}>
                          <GrDownload size={16} />
                          Baixar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 