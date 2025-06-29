// Service Worker for 食費管理アプリ - 節約マスター
const CACHE_NAME = 'food-expense-app-v1';
const urlsToCache = [
  '/new-household-app.html',
  '/new-household-script.js',
  '/new-household-style.css',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Service Workerのインストール
self.addEventListener('install', function(event) {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('[SW] Cache failed:', error);
      })
  );
});

// Service Workerのアクティベーション
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// ネットワークリクエストのフェッチイベント
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // キャッシュにヒットした場合はキャッシュから返す
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }

        // キャッシュにない場合はネットワークから取得
        console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request).then(function(response) {
          // レスポンスが有効でない場合はそのまま返す
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 有効なレスポンスをキャッシュに保存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function(error) {
          console.log('[SW] Fetch failed:', error);
          // オフライン時のフォールバック処理
          if (event.request.destination === 'document') {
            return caches.match('/new-household-app.html');
          }
        });
      })
  );
});

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    // 将来的にオフラインデータの同期処理を実装
  }
});

// プッシュ通知（将来の拡張用）
self.addEventListener('push', function(event) {
  console.log('[SW] Push notification received');
  const options = {
    body: event.data ? event.data.text() : '新しい通知があります',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('節約マスター', options)
  );
});

// 通知クリック処理
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification click received');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/new-household-app.html')
  );
});