/* =========================================================
   QUIZSMITH · SERVICE WORKER
   Caches the whole app on first visit so it opens and works
   with no internet. To ship an update, change VERSION: every
   installed copy downloads the new files on its next launch.
   ========================================================= */
const VERSION = 'quizsmith-v1.0.3';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'questions.js',
  'styles.js',
  'app.js',
  'jss.min.js',
  'jss-preset-default.min.js',
  'fonts.css',
  'bricolage-grotesque-latin-500-normal.woff2',
  'bricolage-grotesque-latin-700-normal.woff2',
  'bricolage-grotesque-latin-800-normal.woff2',
  'atkinson-hyperlegible-latin-400-normal.woff2',
  'atkinson-hyperlegible-latin-700-normal.woff2',
  'ibm-plex-mono-latin-500-normal.woff2',
  'ibm-plex-mono-latin-600-normal.woff2',
  'icon.svg',
  'favicon-32.png',
  'icon-192.png',
  'icon-512.png',
  'maskable-192.png',
  'maskable-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Cache first (instant + offline), falling back to the network. Page loads fall back to the cached app. */
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error());
    })
  );
});
