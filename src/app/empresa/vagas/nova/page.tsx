'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { GrPrevious, GrSave, GrLocation, GrMoney, GrBriefcase, GrGroup, GrCalendar, GrDocument, GrAdd, GrClose } from 'react-icons/gr';
import styles from './nova-vaga.module.css';

interface FormData {
  titulo: string;
  descricao: string;
  localizacao: string;
  salarioMin: string;
  salarioMax: string;
  tipo: 'CLT' | 'PJ' | 'Freelancer' | 'Estágio' | '';
  nivel: 'Junior' | 'Pleno' | 'Sênior' | 'Especialista' | '';
  modalidade: 'presencial' | 'remoto' | 'hibrido' | '';
  area: string;
  habilidadesRequeridas: string[];
  habilidadesDesejaveis: string[];
  beneficios: string[];
  requisitos: string[];
  dataExpiracao: string;
}

export default function NovaVagaPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    localizacao: '',
    salarioMin: '',
    salarioMax: '',
    tipo: '',
    nivel: '',
    modalidade: '',
    area: '',
    habilidadesRequeridas: [],
    habilidadesDesejaveis: [],
    beneficios: [],
    requisitos: [],
    dataExpiracao: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newRequirement, setNewRequirement] = useState('');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'empresa') {
      router.push('/empresa/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = (type: 'habilidadesRequeridas' | 'habilidadesDesejaveis') => {
    if (!newSkill.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], newSkill.trim()]
    }));
    setNewSkill('');
  };

  const removeSkill = (type: 'habilidadesRequeridas' | 'habilidadesDesejaveis', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      beneficios: [...prev.beneficios, newBenefit.trim()]
    }));
    setNewBenefit('');
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      beneficios: prev.beneficios.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (!newRequirement.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      requisitos: [...prev.requisitos, newRequirement.trim()]
    }));
    setNewRequirement('');
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requisitos: prev.requisitos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Obter token do AuthService
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }

      // Preparar dados da vaga
      const vagaData = {
        title: formData.titulo,
        description: formData.descricao,
        summary: formData.descricao.substring(0, 500), // Resumo dos primeiros 500 caracteres
        location: {
          city: formData.localizacao.split(',')[0]?.trim() || formData.localizacao,
          state: formData.localizacao.split(',')[1]?.trim() || 'Dubai',
          country: 'EAU',
          isRemote: formData.modalidade === 'remoto',
          isHybrid: formData.modalidade === 'hibrido'
        },
        workType: formData.tipo === 'CLT' ? 'full_time' : 
                  formData.tipo === 'PJ' ? 'contract' : 
                  formData.tipo === 'Freelancer' ? 'freelance' : 'full_time',
        salary: {
          min: parseInt(formData.salarioMin) || 0,
          max: parseInt(formData.salarioMax) || 0,
          currency: 'AED',
          period: 'monthly'
        },
        requirements: {
          education: formData.nivel,
          experience: formData.nivel === 'Junior' ? '0-2' :
                    formData.nivel === 'Pleno' ? '2-5' :
                    formData.nivel === 'Sênior' ? '5-8' : '8+',
          skills: formData.habilidadesRequeridas,
          languages: ['Portuguese', 'English'],
          certifications: [],
          other: formData.requisitos
        },
        category: formData.area,
        expiresAt: new Date(formData.dataExpiracao),
        status: 'active',
        benefits: formData.beneficios,
        tags: [...formData.habilidadesRequeridas, ...formData.habilidadesDesejaveis]
      };

      // Criar vaga via API
      const result = await ApiService.createJob(vagaData);

      // Redirecionar para lista de vagas
      router.push('/empresa/vagas?created=success');
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar vaga. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return formData.titulo && 
           formData.descricao && 
           formData.localizacao && 
           formData.tipo && 
           formData.nivel && 
           formData.area &&
           formData.dataExpiracao;
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
    <div className={styles.novaVagaPage}>
      <DashboardHeader user={user} userType="empresa" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <Link href="/empresa/vagas" className={styles.backButton}>
                <GrPrevious size={20} />
                Voltar às Vagas
              </Link>
              <h1>Criar Nova Vaga</h1>
              <p>Preencha as informações para publicar uma nova oportunidade</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.vagaForm}>
            <div className={styles.formGrid}>
              {/* Informações Básicas */}
              <div className={styles.formSection}>
                <h2>Informações Básicas</h2>
                
                <div className={styles.formGroup}>
                  <label htmlFor="titulo">Título da Vaga *</label>
                  <input
                    type="text"
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Ex: Desenvolvedor Full Stack Sênior"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="descricao">Descrição da Vaga *</label>
                  <textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    placeholder="Descreva as responsabilidades e objetivos da posição..."
                    rows={4}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="area">Área de Atuação *</label>
                    <select
                      id="area"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      required
                    >
                      <option value="">Selecione a área</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Vendas">Vendas</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Recursos Humanos">Recursos Humanos</option>
                      <option value="Operações">Operações</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="nivel">Nível de Senioridade *</label>
                    <select
                      id="nivel"
                      value={formData.nivel}
                      onChange={(e) => handleInputChange('nivel', e.target.value as any)}
                      required
                    >
                      <option value="">Selecione o nível</option>
                      <option value="Junior">Junior</option>
                      <option value="Pleno">Pleno</option>
                      <option value="Sênior">Sênior</option>
                      <option value="Especialista">Especialista</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Localização e Modalidade */}
              <div className={styles.formSection}>
                <h2>Localização e Modalidade</h2>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="localizacao">Localização *</label>
                    <input
                      type="text"
                      id="localizacao"
                      value={formData.localizacao}
                      onChange={(e) => handleInputChange('localizacao', e.target.value)}
                      placeholder="Ex: Dubai, EAU"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="modalidade">Modalidade de Trabalho</label>
                    <select
                      id="modalidade"
                      value={formData.modalidade}
                      onChange={(e) => handleInputChange('modalidade', e.target.value as any)}
                    >
                      <option value="">Selecione a modalidade</option>
                      <option value="presencial">Presencial</option>
                      <option value="remoto">Remoto</option>
                      <option value="hibrido">Híbrido</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Remuneração e Tipo */}
              <div className={styles.formSection}>
                <h2>Remuneração e Contratação</h2>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="salarioMin">Salário Mínimo (AED)</label>
                    <input
                      type="number"
                      id="salarioMin"
                      value={formData.salarioMin}
                      onChange={(e) => handleInputChange('salarioMin', e.target.value)}
                      placeholder="5000"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="salarioMax">Salário Máximo (AED)</label>
                    <input
                      type="number"
                      id="salarioMax"
                      value={formData.salarioMax}
                      onChange={(e) => handleInputChange('salarioMax', e.target.value)}
                      placeholder="8000"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="tipo">Tipo de Contratação *</label>
                    <select
                      id="tipo"
                      value={formData.tipo}
                      onChange={(e) => handleInputChange('tipo', e.target.value as any)}
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="CLT">CLT</option>
                      <option value="PJ">PJ</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Estágio">Estágio</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Habilidades */}
              <div className={styles.formSection}>
                <h2>Habilidades e Competências</h2>
                
                <div className={styles.skillsSection}>
                  <div className={styles.skillGroup}>
                    <label>Habilidades Obrigatórias</label>
                    <div className={styles.skillInput}>
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Digite uma habilidade..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('habilidadesRequeridas'))}
                      />
                      <button 
                        type="button" 
                        onClick={() => addSkill('habilidadesRequeridas')}
                        className={styles.addBtn}
                      >
                        <GrAdd size={16} />
                      </button>
                    </div>
                    <div className={styles.skillTags}>
                      {formData.habilidadesRequeridas.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                          <button 
                            type="button"
                            onClick={() => removeSkill('habilidadesRequeridas', index)}
                          >
                            <GrClose size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.skillGroup}>
                    <label>Habilidades Desejáveis</label>
                    <div className={styles.skillInput}>
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Digite uma habilidade..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('habilidadesDesejaveis'))}
                      />
                      <button 
                        type="button" 
                        onClick={() => addSkill('habilidadesDesejaveis')}
                        className={styles.addBtn}
                      >
                        <GrAdd size={16} />
                      </button>
                    </div>
                    <div className={styles.skillTags}>
                      {formData.habilidadesDesejaveis.map((skill, index) => (
                        <span key={index} className={`${styles.skillTag} ${styles.optional}`}>
                          {skill}
                          <button 
                            type="button"
                            onClick={() => removeSkill('habilidadesDesejaveis', index)}
                          >
                            <GrClose size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data de Expiração */}
              <div className={styles.formSection}>
                <h2>Configurações da Vaga</h2>
                
                <div className={styles.formGroup}>
                  <label htmlFor="dataExpiracao">Data de Expiração *</label>
                  <input
                    type="date"
                    id="dataExpiracao"
                    value={formData.dataExpiracao}
                    onChange={(e) => handleInputChange('dataExpiracao', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <Link href="/empresa/vagas" className="btn btn-secondary">
                Cancelar
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!isFormValid() || saving}
              >
                {saving ? (
                  <>
                    <div className="loading"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <GrSave size={16} />
                    Publicar Vaga
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