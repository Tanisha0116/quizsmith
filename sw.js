/* =========================================================
   QUIZSMITH · SERVICE WORKER
   Saves the whole app on first visit so it works with no
   internet. When online it always loads the newest files, so
   updates appear straight away. Change VERSION when you update.
   ========================================================= */
const VERSION = 'quizsmith-v1.0.5';
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
  // cache: 'reload' skips Chrome's own file cache, so a new version never saves old files
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Pages, code and styles: NETWORK FIRST, so you always get the newest version when online,
   and the saved copy when offline. Fonts and icons: CACHE FIRST, since they never change. */
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  const isStatic = /\.(woff2|png|svg)$/.test(url.pathname);

  if (isStatic) {
    event.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
    return;
  }
  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
