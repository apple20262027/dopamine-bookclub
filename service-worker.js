// Service Worker 版本号
const CACHE_NAME = 'book-club-cache-v1';

// 需要缓存的核心资源
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json'
];

// 安装事件 - 缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        // 跳过等待，直接激活
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 删除旧缓存
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 立即控制所有客户端
      return self.clients.claim();
    })
  );
});

// Fetch 事件 - 拦截网络请求
self.addEventListener('fetch', (event) => {
  // 只处理同源请求或GET请求
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有响应，则返回缓存的响应
        if (response) {
          return response;
        }
        
        // 否则，发起网络请求
        return fetch(event.request)
          .then(networkResponse => {
            // 如果响应有效，且是GET请求，且是同源请求，则缓存响应
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              // 克隆响应，因为响应流只能使用一次
              const responseToCache = networkResponse.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return networkResponse;
          })
          .catch(error => {
            console.error('Fetch error:', error);
            // 如果网络请求失败，返回默认响应（可选）
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// 推送通知事件（可选，可根据需要启用）
// self.addEventListener('push', (event) => {
//   if (event.data) {
//     const data = event.data.json();
//     const options = {
//       body: data.body,
//       icon: '/icon.png',
//       badge: '/badge.png',
//       data: {
//         url: data.url
//       }
//     };
//     
//     event.waitUntil(
//       self.registration.showNotification(data.title, options)
//     );
//   }
// });

// 通知点击事件（可选，可根据需要启用）
// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();
//   
//   if (event.notification.data && event.notification.data.url) {
//     event.waitUntil(
//       clients.openWindow(event.notification.data.url)
//     );
//   }
// });