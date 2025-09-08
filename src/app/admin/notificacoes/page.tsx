'use client';

import { useState, useEffect } from 'react';
import { GrAnnounce, GrSend, GrMail, GrNotification, GrSettingsOption, GrRefresh, GrFilter, GrSearch, GrView, GrTrash, GrCheckmark, GrClose, GrInfo, GrAlert } from 'react-icons/gr';
import styles from './notificacoes.module.css';

interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
  urgent: number;
  byType: { [key: string]: number };
}

export default function NotificacoesAdmin() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/notifications/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
        fetchStats(); // Atualizar estatísticas
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markMultipleAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: selectedNotifications })
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            selectedNotifications.includes(n._id) ? { ...n, read: true } : n
          )
        );
        setSelectedNotifications([]);
        fetchStats();
      }
    } catch (error) {
      console.error('Erro ao marcar múltiplas como lidas:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        fetchStats();
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  const deleteMultipleNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications/delete-multiple', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: selectedNotifications })
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n._id)));
        setSelectedNotifications([]);
        fetchStats();
      }
    } catch (error) {
      console.error('Erro ao deletar múltiplas notificações:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <GrInfo className={styles.urgentIcon} />;
      case 'high': return <GrInfo className={styles.highIcon} />;
      case 'medium': return <GrInfo className={styles.mediumIcon} />;
      case 'low': return <GrInfo className={styles.lowIcon} />;
      default: return <GrInfo className={styles.mediumIcon} />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      'candidatura_status': 'Status da Candidatura',
      'entrevista_agendada': 'Entrevista Agendada',
      'feedback_disponivel': 'Feedback Disponível',
      'nova_candidatura': 'Nova Candidatura',
      'vaga_expirada': 'Vaga Expirada',
      'nova_empresa': 'Nova Empresa',
      'company_alert_security': 'Alerta de Segurança',
      'company_alert_maintenance': 'Alerta de Manutenção',
      'company_alert_update': 'Alerta de Atualização',
      'company_alert_warning': 'Alerta de Aviso',
      'company_alert_info': 'Alerta de Informação'
    };
    
    return typeLabels[type] || type;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read) ||
      (filter === 'high' && ['high', 'urgent'].includes(notification.priority));
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeLabel(notification.type).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando notificações...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1>Dashboard de Notificações</h1>
        <div className={styles.headerActions}>
          <button onClick={fetchNotifications} className={styles.refreshButton}>
            <GrRefresh size={20} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <GrAnnounce size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.total}</h3>
              <p>Total de Notificações</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <GrNotification size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.unread}</h3>
              <p>Não Lidas</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <GrAlert size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.highPriority}</h3>
              <p>Alta Prioridade</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <GrAlert size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.urgent}</h3>
              <p>Urgentes</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todas</option>
            <option value="unread">Não Lidas</option>
            <option value="read">Lidas</option>
            <option value="high">Alta Prioridade</option>
          </select>
          
          <div className={styles.searchBox}>
            <GrSearch size={18} />
            <input
              type="text"
              placeholder="Buscar notificações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {selectedNotifications.length > 0 && (
          <div className={styles.bulkActions}>
            <button onClick={markMultipleAsRead} className={styles.bulkButton}>
              <GrCheckmark size={16} />
              Marcar como Lidas ({selectedNotifications.length})
            </button>
            <button onClick={deleteMultipleNotifications} className={styles.bulkDeleteButton}>
              <GrTrash size={16} />
              Deletar ({selectedNotifications.length})
            </button>
          </div>
        )}
      </div>

      {/* Lista de Notificações */}
      <div className={styles.notificationsList}>
        {filteredNotifications.length === 0 ? (
                  <div className={styles.emptyState}>
          <GrAnnounce size={48} />
          <h3>Nenhuma notificação encontrada</h3>
          <p>Não há notificações que correspondam aos filtros selecionados.</p>
        </div>
        ) : (
          <>
            <div className={styles.listHeader}>
              <div className={styles.checkboxColumn}>
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onChange={handleSelectAll}
                  className={styles.checkbox}
                />
              </div>
              <div className={styles.notificationColumn}>Notificação</div>
              <div className={styles.typeColumn}>Tipo</div>
              <div className={styles.priorityColumn}>Prioridade</div>
              <div className={styles.dateColumn}>Data</div>
              <div className={styles.actionsColumn}>Ações</div>
            </div>

            {filteredNotifications.map(notification => (
              <div 
                key={notification._id} 
                className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
              >
                <div className={styles.checkboxColumn}>
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={() => handleSelectNotification(notification._id)}
                    className={styles.checkbox}
                  />
                </div>
                
                <div className={styles.notificationColumn}>
                  <div className={styles.notificationContent}>
                    <h4 className={styles.notificationTitle}>{notification.title}</h4>
                    <p className={styles.notificationMessage}>{notification.message}</p>
                    {notification.data && (
                      <div className={styles.notificationData}>
                        <small>Dados: {JSON.stringify(notification.data)}</small>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.typeColumn}>
                  <span className={styles.typeLabel}>{getTypeLabel(notification.type)}</span>
                </div>
                
                <div className={styles.priorityColumn}>
                  <div className={styles.priorityBadge}>
                    {getPriorityIcon(notification.priority)}
                    <span>{getPriorityLabel(notification.priority)}</span>
                  </div>
                </div>
                
                <div className={styles.dateColumn}>
                  <span className={styles.dateLabel}>
                    {new Date(notification.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className={styles.actionsColumn}>
                  <div className={styles.actionButtons}>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className={styles.actionButton}
                        title="Marcar como lida"
                      >
                        <GrView size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className={styles.deleteButton}
                      title="Deletar notificação"
                    >
                      <GrTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
