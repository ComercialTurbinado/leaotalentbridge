'use client';

import { useState, useEffect, useCallback } from 'react';

interface CustomPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: CustomPushSubscription | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<CustomPushSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar suporte a push notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  // Verificar se já está inscrito
  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        // Converter PushSubscription nativo para CustomPushSubscription
        const customSubscription: CustomPushSubscription = {
          endpoint: existingSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(existingSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(existingSubscription.getKey('auth')!)
          }
        };
        setSubscription(customSubscription);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Erro ao verificar subscription:', error);
    }
  }, []);

  // Obter chave VAPID pública
  const getVapidPublicKey = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('/api/notifications/vapid-keys');
      const data = await response.json();
      
      if (data.success) {
        return data.publicKey;
      } else {
        throw new Error('Erro ao obter chave VAPID');
      }
    } catch (error) {
      console.error('Erro ao obter chave VAPID:', error);
      throw error;
    }
  }, []);

  // Inscrever-se nas notificações push
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications não são suportadas neste navegador');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Solicitar permissão
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Permissão para notificações foi negada');
        return false;
      }

      // Obter chave VAPID
      const vapidPublicKey = await getVapidPublicKey();
      
      // Converter chave para formato correto
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // Registrar service worker se necessário
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
      }

      // Criar subscription
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as ArrayBuffer
      });

      // Enviar subscription para o servidor
      const response = await fetch('/api/notifications/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: {
            endpoint: newSubscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(newSubscription.getKey('p256dh')!),
              auth: arrayBufferToBase64(newSubscription.getKey('auth')!)
            }
          }
        })
      });

      if (response.ok) {
        // Converter PushSubscription nativo para CustomPushSubscription
        const customSubscription: CustomPushSubscription = {
          endpoint: newSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(newSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(newSubscription.getKey('auth')!)
          }
        };
        setSubscription(customSubscription);
        setIsSubscribed(true);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao registrar subscription');
        return false;
      }
    } catch (error) {
      console.error('Erro ao inscrever-se:', error);
      setError('Erro ao inscrever-se nas notificações push');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, getVapidPublicKey]);

  // Cancelar inscrição
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      setError('Nenhuma subscription ativa encontrada');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar subscription nativa do navegador para cancelar
      const registration = await navigator.serviceWorker.ready;
      const nativeSubscription = await registration.pushManager.getSubscription();
      
      if (nativeSubscription) {
        // Cancelar subscription no navegador
        const success = await nativeSubscription.unsubscribe();
        
        if (success) {
          // Remover do servidor
          const response = await fetch(`/api/notifications/push-subscription?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            setSubscription(null);
            setIsSubscribed(false);
            return true;
          } else {
            setError('Erro ao remover subscription do servidor');
            return false;
          }
        } else {
          setError('Erro ao cancelar subscription');
          return false;
        }
      } else {
        setError('Subscription nativa não encontrada');
        return false;
      }
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      setError('Erro ao cancelar inscrição');
      return false;
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribe,
    unsubscribe,
    loading,
    error
  };
}

// Função auxiliar para converter chave VAPID
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array;
}

// Função auxiliar para converter ArrayBuffer para base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
