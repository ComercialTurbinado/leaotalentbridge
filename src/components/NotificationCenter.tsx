'use client';

import React, { useState, useEffect } from 'react';
import styles from './NotificationCenter.module.css';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  readAt?: string;
}

interface NotificationCenterProps {
  userId: string;
  maxNotifications?: number;
  showUnreadOnly?: boolean;
}

export default function NotificationCenter({ 
  userId, 
  maxNotifications = 10, 
  showUnreadOnly = false 
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, [userId, showUnreadOnly]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: maxNotifications.toString(),
        unreadOnly: showUnreadOnly.toString()
      });

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
      } else {
        setError('Erro ao carregar notificações');
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, read: true, readAt: new Date().toISOString() }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            read: true, 
            readAt: new Date().toISOString() 
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return 'ℹ️';
      case 'low': return '💡';
      default: return '📢';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'interview_invitation': return '🎯';
      case 'interview_response': return '✅';
      case 'feedback_available': return '📊';
      case 'new_application': return '📝';
      case 'application_update': return '📋';
      case 'job_recommendation': return '💼';
      case 'feedback_pending': return '⏳';
      case 'system_alert': return '🔔';
      default: return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando notificações...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Notificações
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount}</span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button 
            className={styles.markAllButton}
            onClick={markAllAsRead}
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className={styles.notificationsList}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <p>Nenhuma notificação encontrada</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`${styles.notification} ${!notification.read ? styles.unread : ''}`}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <div className={styles.notificationIcon}>
                {getTypeIcon(notification.type)}
              </div>
              
              <div className={styles.notificationContent}>
                <div className={styles.notificationHeader}>
                  <h4 className={styles.notificationTitle}>
                    {notification.title}
                  </h4>
                  <div className={styles.notificationMeta}>
                    <span className={styles.priority}>
                      {getPriorityIcon(notification.priority)}
                    </span>
                    <span className={styles.timestamp}>
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
                
                <p className={styles.notificationMessage}>
                  {notification.message}
                </p>
                
                {notification.data?.actionUrl && (
                  <a 
                    href={notification.data.actionUrl}
                    className={styles.actionLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver detalhes →
                  </a>
                )}
              </div>
              
              {!notification.read && (
                <div className={styles.unreadIndicator}></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
