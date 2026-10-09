/* Service Worker — تاج الفيصلية للديكور
   يجعل التطبيق يعمل بدون إنترنت. ارفعه بجانب index.html في نفس المجلد.
   عند تحديث index.html غيّر رقم النسخة أدناه ليتحدّث التطبيق عند العملاء. */
const CACHE = 'taj-alfaisaliah-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // ملفات التطبيق: الشبكة أولًا (لتصل التحديثات) ثم النسخة المخزّنة عند انقطاع الإنترنت
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })
        .catch(() => caches.match(req).then(m => m || caches.match('./index.html')))
    );
    return;
  }
  // الخطوط ومكتبة تصوير الفاتورة: من المخزّن إن وُجد، ويُحدَّث في الخلفية
  if (/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(url.host)) {
    e.respondWith(caches.match(req).then(m => {
      const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => m);
      return m || net;
    }));
  }
});
