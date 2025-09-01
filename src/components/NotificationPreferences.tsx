'use client';

import React, { useState, useEffect } from 'react';
import styles from './NotificationPreferences.module.css';

interface NotificationPreferences {
  _id?: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  preferences: {
    // Candidato
    newJobRecommendations?: boolean;
    applicationStatusUpdates?: boolean;
    interviewInvitations?: boolean;
    interviewReminders?: boolean;
    feedbackAvailable?: boolean;
    documentRequests?: boolean;
    simulationInvitations?: boolean;
    
    // Empresa
    newApplications?: boolean;
    applicationUpdates?: boolean;
    interviewResponses?: boolean;
    candidateFeedback?: boolean;
    jobExpiryReminders?: boolean;
    systemUpdates?: boolean;
    
    // Admin
    newInterviews?: boolean;
    feedbackPending?: boolean;
    systemAlerts?: boolean;
    userReports?: boolean;
    maintenanceAlerts?: boolean;
  };
  frequency: {
    email: 'immediate' | 'daily' | 'weekly' | 'never';
    push: 'immediate' | 'daily' | 'weekly' | 'never';
    sms: 'immediate' | 'daily' | 'weekly' | 'never';
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  allowedDays: number[];
}

interface NotificationPreferencesProps {
  userId: string;
  userRole: 'candidato' | 'empresa' | 'admin';
}

export default function NotificationPreferences({ userId, userRole }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();

      if (data.success) {
        setPreferences(data.preferences);
      } else {
        setError('Erro ao carregar preferências');
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      setError('Erro ao carregar preferências');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Preferências salvas com sucesso!');
        setPreferences(data.preferences);
      } else {
        setError('Erro ao salvar preferências');
      }
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      setError('Erro ao salvar preferências');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (path: string, value: any) => {
    if (!preferences) return;

    const newPreferences = { ...preferences };
    const keys = path.split('.');
    let current = newPreferences as any;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setPreferences(newPreferences);
  };

  const getRoleSpecificPreferences = () => {
    if (!preferences) return [];

    const rolePreferences = {
      candidato: [
        { key: 'newJobRecommendations', label: 'Novas recomendações de vagas', icon: '💼' },
        { key: 'applicationStatusUpdates', label: 'Atualizações de candidaturas', icon: '📋' },
        { key: 'interviewInvitations', label: 'Convites para entrevistas', icon: '🎯' },
        { key: 'interviewReminders', label: 'Lembretes de entrevistas', icon: '⏰' },
        { key: 'feedbackAvailable', label: 'Feedback disponível', icon: '📊' },
        { key: 'documentRequests', label: 'Solicitações de documentos', icon: '📄' },
        { key: 'simulationInvitations', label: 'Convites para simulações', icon: '🎮' }
      ],
      empresa: [
        { key: 'newApplications', label: 'Novas candidaturas', icon: '📝' },
        { key: 'applicationUpdates', label: 'Atualizações de candidaturas', icon: '📋' },
        { key: 'interviewResponses', label: 'Respostas de entrevistas', icon: '✅' },
        { key: 'candidateFeedback', label: 'Feedback de candidatos', icon: '💬' },
        { key: 'jobExpiryReminders', label: 'Lembretes de expiração de vagas', icon: '⏰' },
        { key: 'systemUpdates', label: 'Atualizações do sistema', icon: '🔔' }
      ],
      admin: [
        { key: 'newInterviews', label: 'Novas entrevistas', icon: '🎯' },
        { key: 'feedbackPending', label: 'Feedback pendente', icon: '⏳' },
        { key: 'systemAlerts', label: 'Alertas do sistema', icon: '🚨' },
        { key: 'userReports', label: 'Relatórios de usuários', icon: '📊' },
        { key: 'maintenanceAlerts', label: 'Alertas de manutenção', icon: '🔧' }
      ]
    };

    return rolePreferences[userRole] || [];
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando preferências...</div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Erro ao carregar preferências</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Configurações de Notificação</h2>
        <p className={styles.subtitle}>
          Configure como e quando você deseja receber notificações
        </p>
      </div>

      {error && (
        <div className={styles.alertError}>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.alertSuccess}>
          {success}
        </div>
      )}

      <div className={styles.sections}>
        {/* Configurações gerais */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Canais de Notificação</h3>
          <div className={styles.preferenceGroup}>
            <div className={styles.preference}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceIcon}>📧</span>
                <div>
                  <label className={styles.preferenceLabel}>Notificações por E-mail</label>
                  <p className={styles.preferenceDescription}>
                    Receber notificações por email
                  </p>
                </div>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.preference}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceIcon}>🔔</span>
                <div>
                  <label className={styles.preferenceLabel}>Notificações Push</label>
                  <p className={styles.preferenceDescription}>
                    Receber notificações push no navegador
                  </p>
                </div>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) => updatePreference('pushNotifications', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.preference}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceIcon}>📱</span>
                <div>
                  <label className={styles.preferenceLabel}>Notificações SMS</label>
                  <p className={styles.preferenceDescription}>
                    Receber notificações por SMS (em breve)
                  </p>
                </div>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={preferences.smsNotifications}
                  onChange={(e) => updatePreference('smsNotifications', e.target.checked)}
                  disabled
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Preferências específicas por tipo */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Tipos de Notificação</h3>
          <div className={styles.preferenceGroup}>
            {getRoleSpecificPreferences().map((pref) => (
              <div key={pref.key} className={styles.preference}>
                <div className={styles.preferenceInfo}>
                  <span className={styles.preferenceIcon}>{pref.icon}</span>
                  <div>
                    <label className={styles.preferenceLabel}>{pref.label}</label>
                  </div>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={preferences.preferences[pref.key as keyof typeof preferences.preferences] || false}
                    onChange={(e) => updatePreference(`preferences.${pref.key}`, e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Frequência */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Frequência</h3>
          <div className={styles.preferenceGroup}>
            <div className={styles.preference}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceIcon}>📧</span>
                <label className={styles.preferenceLabel}>Frequência de E-mail</label>
              </div>
              <select
                className={styles.select}
                value={preferences.frequency.email}
                onChange={(e) => updatePreference('frequency.email', e.target.value)}
              >
                <option value="immediate">Imediato</option>
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="never">Nunca</option>
              </select>
            </div>

            <div className={styles.preference}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceIcon}>🔔</span>
                <label className={styles.preferenceLabel}>Frequência de Push</label>
              </div>
              <select
                className={styles.select}
                value={preferences.frequency.push}
                onChange={(e) => updatePreference('frequency.push', e.target.value)}
              >
                <option value="immediate">Imediato</option>
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="never">Nunca</option>
              </select>
            </div>
          </div>
        </div>

        {/* Horário de silêncio */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Horário de Silêncio</h3>
          <div className={styles.preferenceGroup}>
            <div className={styles.preference}>
              <div className={styles.preferenceInfo}>
                <span className={styles.preferenceIcon}>🌙</span>
                <div>
                  <label className={styles.preferenceLabel}>Ativar Horário de Silêncio</label>
                  <p className={styles.preferenceDescription}>
                    Não receber notificações durante este período
                  </p>
                </div>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={preferences.quietHours.enabled}
                  onChange={(e) => updatePreference('quietHours.enabled', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            {preferences.quietHours.enabled && (
              <>
                <div className={styles.preference}>
                  <div className={styles.preferenceInfo}>
                    <span className={styles.preferenceIcon}>🕐</span>
                    <label className={styles.preferenceLabel}>Início</label>
                  </div>
                  <input
                    type="time"
                    className={styles.timeInput}
                    value={preferences.quietHours.startTime}
                    onChange={(e) => updatePreference('quietHours.startTime', e.target.value)}
                  />
                </div>

                <div className={styles.preference}>
                  <div className={styles.preferenceInfo}>
                    <span className={styles.preferenceIcon}>🕐</span>
                    <label className={styles.preferenceLabel}>Fim</label>
                  </div>
                  <input
                    type="time"
                    className={styles.timeInput}
                    value={preferences.quietHours.endTime}
                    onChange={(e) => updatePreference('quietHours.endTime', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.saveButton}
          onClick={savePreferences}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Preferências'}
        </button>
      </div>
    </div>
  );
}
