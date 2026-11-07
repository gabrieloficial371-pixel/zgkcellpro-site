const CACHE = 'gk-cell-shell-v3'
const SCOPE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '')
const scoped = path => `${SCOPE_PATH}/${path.replace(/^\/+/, '')}`
const STATIC_ASSETS = [scoped('offline.html'), scoped('assets/brand/logo-2.0.png'), scoped('favicon.png')]

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(STATIC_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))))
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(scoped('offline.html'))))
    return
  }
  if (STATIC_ASSETS.includes(url.pathname)) event.respondWith(caches.match(request).then(cached => cached || fetch(request)))
})
