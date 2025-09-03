const CACHE = 'offline-ocr-box-v1';
const ASSETS = [
  './',
  './index.html',
  './ocr.js',
  './manifest.json',
  './tesseract/tesseract.min.js',
  './tesseract/worker.min.js',
  './tesseract/tesseract-core.wasm.js'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || new Response('Offline asset missing', {status: 404}))
  );
});