// Service Worker para Push Notifications
const CACHE_NAME = 'leao-careers-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retornar do cache se disponível
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Gerenciar notificações push
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Leão Talent Bridge',
        body: event.data.text() || 'Nova notificação',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png'
      };
    }
  }

  const options = {
    title: data.title || 'Leão Talent Bridge',
    body: data.body || 'Nova notificação',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    image: data.image,
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    tag: data.tag || 'default',
    renotify: data.renotify || false,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: data.timestamp || Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Gerenciar cliques em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Verificar se já existe uma janela aberta
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      
      // Abrir nova janela se não houver nenhuma aberta
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Gerenciar ações de notificação
self.addEventListener('notificationaction', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Enviar mensagem para a janela ativa
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.postMessage({
            type: 'NOTIFICATION_ACTION',
            action: action,
            data: data
          });
          client.focus();
          return;
        }
      }
      
      // Abrir nova janela se necessário
      if (clients.openWindow) {
        let url = '/dashboard';
        
        switch (action) {
          case 'accept':
            url = data.actionUrl || '/candidato/entrevistas';
            break;
          case 'reject':
            url = data.actionUrl || '/candidato/entrevistas';
            break;
          default:
            url = data.actionUrl || '/dashboard';
        }
        
        return clients.openWindow(url);
      }
    })
  );
});

// Gerenciar mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
