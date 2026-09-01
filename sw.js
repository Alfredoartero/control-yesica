/* Service Worker · Centro de Control Importaciones Yesica
   Necesario para que las notificaciones funcionen en el celular (Android/Chrome)
   y para que la página se pueda instalar como app. */

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Al tocar la notificación: abre la app (o la trae al frente si ya está abierta)
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(lista => {
      for (const c of lista) {
        if ('focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
