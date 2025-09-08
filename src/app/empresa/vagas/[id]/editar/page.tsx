'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { GrSave, GrClose, GrEdit, GrLocation, GrCurrency, GrBriefcase, GrCalendar, GrDocument, GrAdd } from 'react-icons/gr';
import styles from './editar-vaga.module.css';

interface Job {
  _id: string;
  title: string;
  description: string;
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
  experienceLevel: string;
  status: string;
  publishedAt: string;
  expiresAt: string;
  requirements: {
    skills: string[];
    education: string;
    experience: string;
  };
  benefits?: string[];
}

export default function EditarVagaPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: {
      city: '',
      state: '',
      isRemote: false
    },
    salary: {
      min: 0,
      max: 0,
      currency: 'BRL'
    },
    workType: '',
    experienceLevel: '',
    status: 'active',
    expiresAt: '',
    requirements: {
      skills: [] as string[],
      education: '',
      experience: ''
    },
    benefits: [] as string[]
  });
  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = AuthService.getUser();
        if (!userData || userData.type !== 'empresa') {
          router.push('/empresa/login');
          return;
        }
        setUser(userData);
        await loadJob();
      } catch (error) {
        console.error('Erro na autenticação:', error);
        router.push('/empresa/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadJob = async () => {
    try {
      const response = await ApiService.getJob(jobId);
      const jobData = (response as any).data;
      setJob(jobData);
      
      // Preencher o formulário com os dados da vaga
      setFormData({
        title: jobData.title || '',
        description: jobData.description || '',
        location: {
          city: jobData.location?.city || '',
          state: jobData.location?.state || '',
          isRemote: jobData.location?.isRemote || false
        },
        salary: {
          min: jobData.salary?.min || 0,
          max: jobData.salary?.max || 0,
          currency: jobData.salary?.currency || 'BRL'
        },
        workType: jobData.workType || '',
        experienceLevel: jobData.experienceLevel || '',
        status: jobData.status || 'active',
        expiresAt: jobData.expiresAt ? new Date(jobData.expiresAt).toISOString().split('T')[0] : '',
        requirements: {
          skills: jobData.requirements?.skills || [],
          education: jobData.requirements?.education || '',
          experience: jobData.requirements?.experience || ''
        },
        benefits: jobData.benefits || []
      });
    } catch (error) {
      console.error('Erro ao carregar vaga:', error);
      setError('Erro ao carregar dados da vaga');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.requirements.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          skills: [...prev.requirements.skills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        skills: prev.requirements.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefitToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit !== benefitToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await ApiService.updateJob(jobId, formData);
      setSuccess('Vaga atualizada com sucesso!');
      setTimeout(() => {
        router.push('/empresa/vagas');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao atualizar vaga:', error);
      setError(error.response?.data?.message || 'Erro ao atualizar vaga');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className={styles.errorPage}>
        <h2>Vaga não encontrada</h2>
        <p>A vaga que você está tentando editar não foi encontrada.</p>
        <button onClick={() => router.push('/empresa/vagas')} className="btn btn-primary">
          Voltar para Vagas
        </button>
      </div>
    );
  }

  return (
    <div className={styles.editarVagaPage}>
      <DashboardHeader user={user} userType={user?.type || 'empresa'} />
      
      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <h1>
                <GrEdit size={32} />
                Editar Vaga
              </h1>
              <p>Atualize as informações da vaga &quot;{job.title}&quot;</p>
            </div>
            
            <button
              onClick={() => router.push('/empresa/vagas')}
              className="btn btn-outline"
            >
              <GrClose size={16} />
              Cancelar
            </button>
          </div>

          {/* Messages */}
          {success && (
            <div className={styles.successMessage}>
              <span>{success}</span>
              <button onClick={() => setSuccess('')}>
                <GrClose size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <span>{error}</span>
              <button onClick={() => setError('')}>
                <GrClose size={16} />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              {/* Informações Básicas */}
              <div className={styles.formSection}>
                <h3>Informações Básicas</h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="title">Título da Vaga *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                    placeholder="Ex: Desenvolvedor Full Stack"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Descrição *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className={styles.formTextarea}
                    placeholder="Descreva a vaga, responsabilidades e o que você espera do candidato..."
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="workType">Tipo de Trabalho *</label>
                    <select
                      id="workType"
                      name="workType"
                      value={formData.workType}
                      onChange={handleInputChange}
                      required
                      className={styles.formSelect}
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="full-time">Tempo Integral</option>
                      <option value="part-time">Meio Período</option>
                      <option value="contract">Contrato</option>
                      <option value="freelance">Freelance</option>
                      <option value="remote">Remoto</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="experienceLevel">Nível de Experiência *</label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      required
                      className={styles.formSelect}
                    >
                      <option value="">Selecione o nível</option>
                      <option value="junior">Júnior</option>
                      <option value="pleno">Pleno</option>
                      <option value="senior">Sênior</option>
                      <option value="lead">Lead</option>
                      <option value="manager">Gerente</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="status">Status da Vaga</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                    >
                      <option value="active">Ativa</option>
                      <option value="paused">Pausada</option>
                      <option value="closed">Fechada</option>
                      <option value="draft">Rascunho</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="expiresAt">Data de Expiração</label>
                    <input
                      type="date"
                      id="expiresAt"
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div className={styles.formSection}>
                <h3>
                  <GrLocation size={20} />
                  Localização
                </h3>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="location.city">Cidade *</label>
                    <input
                      type="text"
                      id="location.city"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      required
                      className={styles.formInput}
                      placeholder="Ex: São Paulo"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="location.state">Estado *</label>
                    <input
                      type="text"
                      id="location.state"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleInputChange}
                      required
                      className={styles.formInput}
                      placeholder="Ex: SP"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="location.isRemote"
                      checked={formData.location.isRemote}
                      onChange={handleInputChange}
                      className={styles.formCheckbox}
                    />
                    Trabalho Remoto
                  </label>
                </div>
              </div>

              {/* Salário */}
              <div className={styles.formSection}>
                <h3>
                  <GrCurrency size={20} />
                  Salário
                </h3>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="salary.min">Salário Mínimo (R$)</label>
                    <input
                      type="number"
                      id="salary.min"
                      name="salary.min"
                      value={formData.salary.min}
                      onChange={handleInputChange}
                      min="0"
                      step="100"
                      className={styles.formInput}
                      placeholder="Ex: 5000"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="salary.max">Salário Máximo (R$)</label>
                    <input
                      type="number"
                      id="salary.max"
                      name="salary.max"
                      value={formData.salary.max}
                      onChange={handleInputChange}
                      min="0"
                      step="100"
                      className={styles.formInput}
                      placeholder="Ex: 8000"
                    />
                  </div>
                </div>
              </div>

              {/* Requisitos */}
              <div className={styles.formSection}>
                <h3>
                  <GrDocument size={20} />
                  Requisitos
                </h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="requirements.education">Escolaridade</label>
                  <select
                    id="requirements.education"
                    name="requirements.education"
                    value={formData.requirements.education}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    <option value="">Selecione a escolaridade</option>
                    <option value="ensino-medio">Ensino Médio</option>
                    <option value="tecnico">Técnico</option>
                    <option value="superior-incompleto">Superior Incompleto</option>
                    <option value="superior-completo">Superior Completo</option>
                    <option value="pos-graduacao">Pós-graduação</option>
                    <option value="mestrado">Mestrado</option>
                    <option value="doutorado">Doutorado</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="requirements.experience">Experiência Necessária</label>
                  <textarea
                    id="requirements.experience"
                    name="requirements.experience"
                    value={formData.requirements.experience}
                    onChange={handleInputChange}
                    rows={3}
                    className={styles.formTextarea}
                    placeholder="Descreva a experiência necessária..."
                  />
                </div>

                {/* Skills */}
                <div className={styles.formGroup}>
                  <label>Habilidades Técnicas</label>
                  <div className={styles.skillsInput}>
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className={styles.formInput}
                      placeholder="Digite uma habilidade e pressione Enter"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="btn btn-outline btn-sm"
                    >
                      <GrAdd size={16} />
                      Adicionar
                    </button>
                  </div>
                  
                  <div className={styles.skillsTags}>
                    {formData.requirements.skills.map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className={styles.removeTag}
                        >
                          <GrClose size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Benefícios */}
              <div className={styles.formSection}>
                <h3>Benefícios</h3>
                
                <div className={styles.formGroup}>
                  <div className={styles.skillsInput}>
                    <input
                      type="text"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                      className={styles.formInput}
                      placeholder="Digite um benefício e pressione Enter"
                    />
                    <button
                      type="button"
                      onClick={addBenefit}
                      className="btn btn-outline btn-sm"
                    >
                      <GrAdd size={16} />
                      Adicionar
                    </button>
                  </div>
                  
                  <div className={styles.skillsTags}>
                    {formData.benefits.map((benefit, index) => (
                      <span key={index} className={styles.skillTag}>
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeBenefit(benefit)}
                          className={styles.removeTag}
                        >
                          <GrClose size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => router.push('/empresa/vagas')}
                className="btn btn-outline"
                disabled={saving}
              >
                <GrClose size={16} />
                Cancelar
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className={styles.spinner}></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <GrSave size={16} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 