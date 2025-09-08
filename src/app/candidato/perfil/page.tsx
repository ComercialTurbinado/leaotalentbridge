'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrUser, GrMail, GrPhone, GrLocation, GrCalendar, GrBriefcase, GrStar, GrSave, GrClose, GrAdd, GrTrash, GrNotification, GrLogout, GrCamera, GrView, GrHide, GrGlobe, GrLink, GrUpload, GrDownload, GrDocument, GrLineChart, GrStatusGood, GrStatusWarning, GrEdit, GrBook, GrLanguage, GrTrophy } from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import { ApiService } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import styles from './perfil.module.css';

interface ProfileData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    birthDate: string;
    nationality: string;
    aboutMe: string;
    avatar?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  experience: Array<{
    id: number;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: number;
    institution: string;
    degree: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: Array<{
    id: number;
    name: string;
    level: string;
    years: number;
  }>;
  languages: Array<{
    id: number;
    language: string;
    level: string;
  }>;
  certifications: Array<{
    id: number;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
}

export default function CandidatoPerfil() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('pessoal');
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileData, setProfileData] = useState<ProfileData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      birthDate: '',
      nationality: 'Brasileira',
      aboutMe: '',
      avatar: '',
      linkedin: '',
      github: '',
      website: ''
    },
    experience: [],
    education: [],
    skills: [],
    languages: [
      { id: 1, language: 'Português', level: 'Nativo' }
    ],
    certifications: []
  });

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
    loadProfileData();
  }, [router]);

  const loadProfileData = async () => {
    try {
      const currentUser = AuthService.getUser();
      if (!currentUser) return;
      
      const response = await fetch(`/api/candidates/${currentUser._id}/profile`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar perfil');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Erro ao carregar perfil');
      }

      const userData = result.data;
      
      // Mapear dados do usuário para o formato do perfil
      const mappedData: ProfileData = {
        personalInfo: {
          fullName: userData?.name || '',
          email: userData?.email || '',
          phone: userData?.phone || '',
          location: userData?.address ? 
            `${userData.address.city}, ${userData.address.state}` : '',
          birthDate: userData?.birthDate || '',
          nationality: userData?.nationality || 'Brasileira',
          aboutMe: userData?.professionalInfo?.summary || '',
          avatar: userData?.avatar || '',
          linkedin: userData?.socialMedia?.linkedin || '',
          github: userData?.socialMedia?.github || '',
          website: userData?.socialMedia?.website || ''
        },
        experience: userData?.professionalInfo?.experience?.map((exp: any, index: number) => ({
          id: index + 1,
          company: exp.company || '',
          position: exp.position || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          description: exp.description || ''
        })) || [],
        education: userData?.education?.map((edu: any, index: number) => ({
          id: index + 1,
          institution: edu.institution || '',
          degree: edu.degree || '',
          location: edu.location || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa || ''
        })) || [],
        skills: userData?.skills?.map((skill: string, index: number) => ({
          id: index + 1,
          name: skill,
          level: 'Intermediário', // Default
          year: 2 // Default
        })) || [],
        languages: userData?.languages?.map((lang: any, index: number) => ({
          id: index + 1,
          language: lang.language || '',
          level: lang.level || ''
        })) || [{ id: 1, language: 'Português', level: 'Nativo' }],
        certifications: userData?.certifications?.map((cert: any, index: number) => ({
          id: index + 1,
          name: cert.name || '',
          issuer: cert.issuer || '',
          date: cert.date || '',
          url: cert.url || ''
        })) || []
      };

      setProfileData(mappedData);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setErrorMessage('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage('');
    
    try {
      const currentUser = AuthService.getUser();
      if (!currentUser) return;
      
      // Mapear dados do perfil de volta para o formato da API
      const updateData = {
        name: profileData.personalInfo.fullName,
        phone: profileData.personalInfo.phone,
        birthDate: profileData.personalInfo.birthDate,
        nationality: profileData.personalInfo.nationality,
        address: {
          city: profileData.personalInfo.location.split(',')[0]?.trim() || '',
          state: profileData.personalInfo.location.split(',')[1]?.trim() || ''
        },
        professionalInfo: {
          summary: profileData.personalInfo.aboutMe,
          experience: profileData.experience.map(exp => ({
            company: exp.company,
            position: exp.position,
            location: exp.location,
            startDate: exp.startDate,
            endDate: exp.endDate,
            description: exp.description
          }))
        },
        education: profileData.education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          location: edu.location,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa
        })),
        skills: profileData.skills.map(skill => skill.name),
        languages: profileData.languages.map(lang => ({
          language: lang.language,
          level: lang.level
        })),
        certifications: profileData.certifications.map(cert => ({
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
          url: cert.url
        })),
        socialMedia: {
          linkedin: profileData.personalInfo.linkedin,
          github: profileData.personalInfo.github,
          website: profileData.personalInfo.website
        }
      };

      const response = await fetch(`/api/candidates/${currentUser._id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar perfil');
      }
      
      setEditMode(false);
      setSuccessMessage('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setErrorMessage('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    router.push('/');
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setProfileData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const removeExperience = (id: number) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const updateExperience = (id: number, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addSkill = () => {
    const newSkill = {
      id: Date.now(),
      name: '',
      level: 'Básico',
      years: 1
    };
    setProfileData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  const removeSkill = (id: number) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  const updateSkill = (id: number, field: string, value: string | number) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now(),
      institution: '',
      degree: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const removeEducation = (id: number) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const updateEducation = (id: number, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addCertification = () => {
    const newCert = {
      id: Date.now(),
      name: '',
      issuer: '',
      date: '',
      url: ''
    };
    setProfileData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
  };

  const removeCertification = (id: number) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const updateCertification = (id: number, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const addLanguage = () => {
    const newLang = {
      id: Date.now(),
      language: '',
      level: 'Básico'
    };
    setProfileData(prev => ({
      ...prev,
      languages: [...prev.languages, newLang]
    }));
  };

  const removeLanguage = (id: number) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id)
    }));
  };

  const updateLanguage = (id: number, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.map(lang => 
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    }));
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
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
    <div className={styles.perfilPage}>
      <DashboardHeader user={user} userType="candidato" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className={styles.successMessage}>
              <GrStatusGood size={20} />
              <span>{successMessage}</span>
            </div>
          )}
          
          {errorMessage && (
            <div className={styles.errorMessage}>
              <GrStatusWarning size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Meu Perfil</h1>
              <p>Mantenha suas informações sempre atualizadas</p>
            </div>
            <div className={styles.headerActions}>
              {editMode ? (
                <div className={styles.editActions}>
                  <button 
                    onClick={() => setEditMode(false)} 
                    className="btn btn-outline"
                    disabled={saving}
                  >
                    <GrClose size={16} />
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSave} 
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
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setEditMode(true)} 
                  className={`${styles.editProfileBtn} ${styles.splitButton}`}
                >
                  <span className={styles.btnLeft}>
                    <GrEdit size={16} />
                  </span>
                  <span className={styles.btnRight}>
                    EDITAR PERFIL
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className={styles.profileContent}>
            {/* Tabs Navigation */}
            <div className={styles.tabsNav}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'pessoal' ? styles.active : ''}`}
                onClick={() => setActiveTab('pessoal')}
              >
                <GrUser size={16} />
                Dados Pessoais
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'experiencia' ? styles.active : ''}`}
                onClick={() => setActiveTab('experiencia')}
              >
                <GrBriefcase size={16} />
                Experiência
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'educacao' ? styles.active : ''}`}
                onClick={() => setActiveTab('educacao')}
              >
                <GrBook size={16} />
                Educação
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'habilidades' ? styles.active : ''}`}
                onClick={() => setActiveTab('habilidades')}
              >
                <GrStar size={16} />
                Habilidades
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'idiomas' ? styles.active : ''}`}
                onClick={() => setActiveTab('idiomas')}
              >
                <GrGlobe size={16} />
                Idiomas
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'certificacoes' ? styles.active : ''}`}
                onClick={() => setActiveTab('certificacoes')}
              >
                <GrTrophy size={16} />
                Certificações
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {/* Dados Pessoais */}
              {activeTab === 'pessoal' && (
                <div className={styles.tabPanel}>
                  <h2>Dados Pessoais</h2>
                  
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Nome Completo</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={profileData.personalInfo.fullName}
                          onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                          className={styles.formInput}
                        />
                      ) : (
                        <p>{profileData.personalInfo.fullName || 'Não informado'}</p>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                              <label>E-mail</label>
        <p>{profileData.personalInfo.email}</p>
        <small>E-mail não pode ser alterado</small>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Telefone</label>
                      {editMode ? (
                        <input
                          type="tel"
                          value={profileData.personalInfo.phone}
                          onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                          className={styles.formInput}
                        />
                      ) : (
                        <p>{profileData.personalInfo.phone || 'Não informado'}</p>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>Localização</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={profileData.personalInfo.location}
                          onChange={(e) => updatePersonalInfo('location', e.target.value)}
                          placeholder="Cidade, Estado"
                          className={styles.formInput}
                        />
                      ) : (
                        <p>{profileData.personalInfo.location || 'Não informado'}</p>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>Data de Nascimento</label>
                      {editMode ? (
                        <input
                          type="date"
                          value={profileData.personalInfo.birthDate}
                          onChange={(e) => updatePersonalInfo('birthDate', e.target.value)}
                          className={styles.formInput}
                        />
                      ) : (
                        <p>{profileData.personalInfo.birthDate ? 
                          new Date(profileData.personalInfo.birthDate).toLocaleDateString('pt-BR') : 
                          'Não informado'
                        }</p>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>Nacionalidade</label>
                      {editMode ? (
                        <select
                          value={profileData.personalInfo.nationality}
                          onChange={(e) => updatePersonalInfo('nationality', e.target.value)}
                          className={styles.formInput}
                        >
                          <option value="Brasileira">Brasileira</option>
                          <option value="Portuguesa">Portuguesa</option>
                          <option value="Italiana">Italiana</option>
                          <option value="Espanhola">Espanhola</option>
                          <option value="Outra">Outra</option>
                        </select>
                      ) : (
                        <p>{profileData.personalInfo.nationality}</p>
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Sobre Mim</label>
                    {editMode ? (
                      <textarea
                        value={profileData.personalInfo.aboutMe}
                        onChange={(e) => updatePersonalInfo('aboutMe', e.target.value)}
                        placeholder="Descreva sua experiência profissional e objetivos..."
                        rows={4}
                        className={styles.formTextarea}
                      />
                    ) : (
                      <p>{profileData.personalInfo.aboutMe || 'Não informado'}</p>
                    )}
                  </div>

                  <h3>Redes Sociais</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>LinkedIn</label>
                      {editMode ? (
                        <input
                          type="url"
                          value={profileData.personalInfo.linkedin}
                          onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/in/seuperfil"
                          className={styles.formInput}
                        />
                      ) : (
                        <p>
                          {profileData.personalInfo.linkedin ? (
                            <a href={profileData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                              {profileData.personalInfo.linkedin}
                              <GrLink size={14} />
                            </a>
                          ) : (
                            'Não informado'
                          )}
                        </p>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>GitHub</label>
                      {editMode ? (
                        <input
                          type="url"
                          value={profileData.personalInfo.github}
                          onChange={(e) => updatePersonalInfo('github', e.target.value)}
                          placeholder="https://github.com/seuusuario"
                          className={styles.formInput}
                        />
                      ) : (
                        <p>
                          {profileData.personalInfo.github ? (
                            <a href={profileData.personalInfo.github} target="_blank" rel="noopener noreferrer">
                              {profileData.personalInfo.github}
                              <GrLink size={14} />
                            </a>
                          ) : (
                            'Não informado'
                          )}
                        </p>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>Website/Portfólio</label>
                      {editMode ? (
                        <input
                          type="url"
                          value={profileData.personalInfo.website}
                          onChange={(e) => updatePersonalInfo('website', e.target.value)}
                          placeholder="https://seusite.com"
                          className={styles.formInput}
                        />
                      ) : (
                        <p>
                          {profileData.personalInfo.website ? (
                            <a href={profileData.personalInfo.website} target="_blank" rel="noopener noreferrer">
                              {profileData.personalInfo.website}
                              <GrLink size={14} />
                            </a>
                          ) : (
                            'Não informado'
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Experiência Profissional */}
              {activeTab === 'experiencia' && (
                <div className={styles.tabPanel}>
                  <div className={styles.sectionHeader}>
                    <h2>Experiência Profissional</h2>
                    {editMode && (
                      <button onClick={addExperience} className="btn btn-outline btn-sm">
                        <GrAdd size={16} />
                        Adicionar
                      </button>
                    )}
                  </div>

                  <div className={styles.itemsList}>
                    {profileData.experience.length > 0 ? (
                      profileData.experience.map((exp) => (
                        <div key={exp.id} className={styles.experienceItem}>
                          {editMode && (
                            <button 
                              onClick={() => removeExperience(exp.id)}
                              className={styles.removeButton}
                            >
                              <GrTrash size={16} />
                            </button>
                          )}
                          
                          <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                              <label>Empresa</label>
                              {editMode ? (
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{exp.company || 'Não informado'}</p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Cargo</label>
                              {editMode ? (
                                <input
                                  type="text"
                                  value={exp.position}
                                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{exp.position || 'Não informado'}</p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Localização</label>
                              {editMode ? (
                                <input
                                  type="text"
                                  value={exp.location}
                                  onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{exp.location || 'Não informado'}</p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Data de Início</label>
                              {editMode ? (
                                <input
                                  type="month"
                                  value={exp.startDate}
                                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{exp.startDate || 'Não informado'}</p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Data de Fim</label>
                              {editMode ? (
                                <input
                                  type="month"
                                  value={exp.endDate}
                                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{exp.endDate || 'Atual'}</p>
                              )}
                            </div>
                          </div>

                          <div className={styles.formGroup}>
                            <label>Descrição</label>
                            {editMode ? (
                              <textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                rows={3}
                                className={styles.formTextarea}
                              />
                            ) : (
                              <p>{exp.description || 'Não informado'}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        <GrBriefcase size={48} />
                        <h3>Nenhuma experiência cadastrada</h3>
                        <p>Adicione suas experiências profissionais</p>
                        {editMode && (
                          <button onClick={addExperience} className="btn btn-primary">
                            <GrAdd size={16} />
                            Adicionar Experiência
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Educação */}
              {activeTab === 'educacao' && (
                <div className={styles.tabPanel}>
                  <div className={styles.sectionHeader}>
                    <h2>Educação</h2>
                    {editMode && (
                      <button onClick={addEducation} className="btn btn-outline btn-sm">
                        <GrAdd size={16} />
                        Adicionar
                      </button>
                    )}
                  </div>

                  <div className={styles.itemsList}>
                    {profileData.education.length > 0 ? (
                      profileData.education.map((edu) => (
                        <div key={edu.id} className={styles.educationItem}>
                          {editMode && (
                            <button 
                              onClick={() => removeEducation(edu.id)}
                              className={styles.removeButton}
                            >
                              <GrTrash size={16} />
                            </button>
                          )}
                          
                          <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                              <label>Instituição</label>
                              {editMode ? (
                                <input
                                  type="text"
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{edu.institution || 'Não informado'}</p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Curso/Grau</label>
                              {editMode ? (
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{edu.degree || 'Não informado'}</p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Localização</label>
                              {editMode ? (
                                <input
                                  type="text"
                                  value={edu.location}
                                  onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{edu.location || 'Não informado'}</p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Data de Início</label>
                              {editMode ? (
                                <input
                                  type="month"
                                  value={edu.startDate}
                                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{edu.startDate || 'Não informado'}</p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Data de Conclusão</label>
                              {editMode ? (
                                <input
                                  type="month"
                                  value={edu.endDate}
                                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{edu.endDate || 'Em andamento'}</p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Nota/GPA (opcional)</label>
                              {editMode ? (
                                <input
                                  type="text"
                                  value={edu.gpa}
                                  onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                  placeholder="Ex: 8.5/10"
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{edu.gpa || 'Não informado'}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        <GrBook size={48} />
                        <h3>Nenhuma formação cadastrada</h3>
                        <p>Adicione sua formação acadêmica</p>
                        {editMode && (
                          <button onClick={addEducation} className="btn btn-primary">
                            <GrAdd size={16} />
                            Adicionar Formação
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Habilidades */}
              {activeTab === 'habilidades' && (
                <div className={styles.tabPanel}>
                  <div className={styles.sectionHeader}>
                    <h2>Habilidades</h2>
                    {editMode && (
                      <button onClick={addSkill} className="btn btn-outline btn-sm">
                        <GrAdd size={16} />
                        Adicionar
                      </button>
                    )}
                  </div>

                  <div className={styles.skillsGrid}>
                    {profileData.skills.length > 0 ? (
                      profileData.skills.map((skill) => (
                        <div key={skill.id} className={styles.skillItem}>
                          {editMode && (
                            <button 
                              onClick={() => removeSkill(skill.id)}
                              className={styles.removeButton}
                            >
                              <GrTrash size={16} />
                            </button>
                          )}
                          
                          <div className={styles.formGroup}>
                            <label>Habilidade</label>
                            {editMode ? (
                              <input
                                type="text"
                                value={skill.name}
                                onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                                className={styles.formInput}
                              />
                            ) : (
                              <p>{skill.name || 'Não informado'}</p>
                            )}
                          </div>

                          <div className={styles.formGroup}>
                            <label>Nível</label>
                            {editMode ? (
                              <select
                                value={skill.level}
                                onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                                className={styles.formInput}
                              >
                                <option value="Básico">Básico</option>
                                <option value="Intermediário">Intermediário</option>
                                <option value="Avançado">Avançado</option>
                                <option value="Especialista">Especialista</option>
                              </select>
                            ) : (
                              <p>{skill.level}</p>
                            )}
                          </div>

                          <div className={styles.formGroup}>
                            <label>Anos de Experiência</label>
                            {editMode ? (
                              <input
                                type="number"
                                min="0"
                                max="50"
                                value={skill.years}
                                onChange={(e) => updateSkill(skill.id, 'years', parseInt(e.target.value) || 0)}
                                className={styles.formInput}
                              />
                            ) : (
                              <p>{skill.years} {skill.years === 1 ? 'ano' : 'anos'}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        <GrStar size={48} />
                        <h3>Nenhuma habilidade cadastrada</h3>
                        <p>Adicione suas principais habilidades</p>
                        {editMode && (
                          <button onClick={addSkill} className="btn btn-primary">
                            <GrAdd size={16} />
                            Adicionar Habilidade
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Idiomas */}
              {activeTab === 'idiomas' && (
                <div className={styles.tabPanel}>
                  <div className={styles.sectionHeader}>
                    <h2>Idiomas</h2>
                    {editMode && (
                      <button onClick={addLanguage} className="btn btn-outline btn-sm">
                        <GrAdd size={16} />
                        Adicionar
                      </button>
                    )}
                  </div>

                  <div className={styles.languagesGrid}>
                    {profileData.languages.map((lang) => (
                      <div key={lang.id} className={styles.languageItem}>
                        {editMode && lang.language !== 'Português' && (
                          <button 
                            onClick={() => removeLanguage(lang.id)}
                            className={styles.removeButton}
                          >
                            <GrTrash size={16} />
                          </button>
                        )}
                        
                        <div className={styles.formGroup}>
                          <label>Idioma</label>
                          {editMode && lang.language !== 'Português' ? (
                            <input
                              type="text"
                              value={lang.language}
                              onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)}
                              className={styles.formInput}
                            />
                          ) : (
                            <p>{lang.language}</p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label>Nível</label>
                          {editMode ? (
                            <select
                              value={lang.level}
                              onChange={(e) => updateLanguage(lang.id, 'level', e.target.value)}
                              className={styles.formInput}
                            >
                              <option value="Básico">Básico</option>
                              <option value="Intermediário">Intermediário</option>
                              <option value="Avançado">Avançado</option>
                              <option value="Fluente">Fluente</option>
                              <option value="Nativo">Nativo</option>
                            </select>
                          ) : (
                            <p>{lang.level}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificações */}
              {activeTab === 'certificacoes' && (
                <div className={styles.tabPanel}>
                  <div className={styles.sectionHeader}>
                    <h2>Certificações</h2>
                    {editMode && (
                      <button onClick={addCertification} className="btn btn-outline btn-sm">
                        <GrAdd size={16} />
                        Adicionar
                      </button>
                    )}
                  </div>

                  <div className={styles.itemsList}>
                    {profileData.certifications.length > 0 ? (
                      profileData.certifications.map((cert) => (
                        <div key={cert.id} className={styles.certificationItem}>
                          {editMode && (
                            <button 
                              onClick={() => removeCertification(cert.id)}
                              className={styles.removeButton}
                            >
                              <GrTrash size={16} />
                            </button>
                          )}
                          
                          <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                              <label>Nome da Certificação</label>
                              {editMode ? (
                                <input
                                  type="text"
                                  value={cert.name}
                                  onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{cert.name || 'Não informado'}</p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Emissor</label>
                              {editMode ? (
                                <input
                                  type="text"
                                  value={cert.issuer}
                                  onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{cert.issuer || 'Não informado'}</p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Data de Emissão</label>
                              {editMode ? (
                                <input
                                  type="month"
                                  value={cert.date}
                                  onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>{cert.date || 'Não informado'}</p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>URL da Certificação (opcional)</label>
                              {editMode ? (
                                <input
                                  type="url"
                                  value={cert.url}
                                  onChange={(e) => updateCertification(cert.id, 'url', e.target.value)}
                                  placeholder="https://..."
                                  className={styles.formInput}
                                />
                              ) : (
                                <p>
                                  {cert.url ? (
                                    <a href={cert.url} target="_blank" rel="noopener noreferrer">
                                      Ver Certificação
                                      <GrLink size={14} />
                                    </a>
                                  ) : (
                                    'Não informado'
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        <GrTrophy size={48} />
                        <h3>Nenhuma certificação cadastrada</h3>
                        <p>Adicione suas certificações profissionais</p>
                        {editMode && (
                          <button onClick={addCertification} className="btn btn-primary">
                            <GrAdd size={16} />
                            Adicionar Certificação
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 