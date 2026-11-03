// El build reemplaza estas marcas (vite.config.ts); en desarrollo quedan vacías y todo va a la red.
const BUILD_ID = '__BUILD_ID__';
const MAP_ID = '__MAP_ID__';
const APP_ASSETS = [/*__APP_ASSETS__*/];
const MAP_ASSETS = [/*__MAP_ASSETS__*/];
const APP_CACHE = `volcan-app-${BUILD_ID}`;
const MAP_CACHE = `volcan-mapa-${MAP_ID}`;
const MEDIA_CACHE = 'volcan-fotos-v1';
const PRECACHED = new Set([...APP_ASSETS, ...MAP_ASSETS]);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const appCache = await caches.open(APP_CACHE);
    await appCache.addAll(APP_ASSETS);
    // El mapa solo se vuelve a bajar si cambió: cuida los datos móviles en cada despliegue.
    const mapCache = await caches.open(MAP_CACHE);
    const saved = await Promise.all(MAP_ASSETS.map((url) => mapCache.match(url)));
    await mapCache.addAll(MAP_ASSETS.filter((_, index) => !saved[index]));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  const keep = new Set([APP_CACHE, MAP_CACHE, MEDIA_CACHE]);
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

// Cada URL firmada trae otro token: la foto se guarda por su ruta para encontrarla sin
// conexión. Se pide con CORS porque una respuesta opaca de <img> no se puede validar.
async function routeMediaResponse(event, url) {
  const key = url.origin + url.pathname;
  const cache = await caches.open(MEDIA_CACHE);
  const saved = await cache.match(key);
  const fresh = fetch(url.href, { mode: 'cors', credentials: 'omit' }).then(async (response) => {
    if (response.ok) await cache.put(key, response.clone());
    return response;
  });
  if (!saved) return fresh;
  event.waitUntil(fresh.catch(() => undefined));
  return saved;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.includes('/storage/v1/object/sign/route-media/')) {
    event.respondWith(routeMediaResponse(event, url));
    return;
  }
  if (url.origin !== self.location.origin) return;
  const asset = event.request.mode === 'navigate' && PRECACHED.size ? '/' : url.pathname;
  if (PRECACHED.has(asset)) {
    event.respondWith(caches.match(asset).then((saved) => saved ?? fetch(event.request)));
  }
});

self.addEventListener('push', (event) => { let payload = {}; try { payload = event.data?.json() ?? {}; } catch { payload = { body: event.data?.text() }; } const title = payload.title || 'Volcán Santa María'; event.waitUntil(self.registration.showNotification(title, { body: payload.body || '', image: payload.image || undefined, icon: '/favicon.svg', badge: '/favicon.svg', data: { notificationId: payload.notification_id, url: payload.url || '/?view=notifications' }, tag: payload.notification_id ? `notification-${payload.notification_id}` : undefined })); });
self.addEventListener('notificationclick', (event) => { event.notification.close(); const url = new URL(event.notification.data?.url || '/?view=notifications', self.location.origin).href; event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => { const client = clients.find((item) => item.url.startsWith(self.location.origin)); if (client) { void client.navigate(url); return client.focus(); } return self.clients.openWindow(url); })); });
