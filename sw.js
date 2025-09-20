// Community Hub Service Worker
const CACHE_NAME = 'community-hub-v1.0.0';
const APP_VERSION = '1.0.0';

// Files to cache for offline functionality
const STATIC_CACHE_FILES = [
  'Index.html',
  'request.html',
  'listed.html', 
  'progress.html',
  'map.html',
  'test.html',
  'global-enhancements.css',
  'request-modern.css',
  'listed-modern.css',
  'progress-modern.css',
  'request.js',
  'listed.js',
  'progress.js',
  'theme-system.js',
  'notification-system.js',
  'map-system.js',
  'voice-recorder.js',
  'manifest.json'
];

// API cache patterns (for future external API integration)
const API_CACHE_NAME = 'community-hub-api-v1';
const API_CACHE_PATTERNS = [
  /api\.bigdatacloud\.net/,
  // Add other API patterns as needed
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_CACHE_FILES.map(url => {
          return new Request(url, { cache: 'reload' });
        }));
      })
      .then(() => {
        console.log('✅ Service Worker: Static files cached successfully');
        self.skipWaiting(); // Force activation
      })
      .catch(error => {
        console.error('❌ Service Worker: Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Remove old versions of our cache
              return cacheName.startsWith('community-hub-') && 
                     cacheName !== CACHE_NAME && 
                     cacheName !== API_CACHE_NAME;
            })
            .map(cacheName => {
              console.log('🗑️ Service Worker: Removing old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activated successfully');
        return self.clients.claim(); // Take control of all clients
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method !== 'GET') {
    return; // Only handle GET requests
  }
  
  // Check if it's an API request
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static resources with cache-first strategy
  if (STATIC_CACHE_FILES.some(file => url.pathname.includes(file))) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Handle other requests with network-first strategy
  event.respondWith(handleNetworkFirst(request));
});

// Cache-first strategy for static resources
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📁 Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('🌐 Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Static request failed:', error);
    
    // Return offline fallback if available
    if (request.destination === 'document') {
      return caches.match('Index.html');
    }
    
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network-first strategy for API requests
async function handleApiRequest(request) {
  try {
    console.log('🌐 API request:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📁 API network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a fallback response for API failures
    return new Response(JSON.stringify({
      error: 'Network unavailable',
      message: 'This feature requires internet connection',
      offline: true
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Network-first strategy for other requests
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed for:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📁 Serving from cache:', request.url);
      return cachedResponse;
    }
    
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Handle background sync (future enhancement)
self.addEventListener('sync', event => {
  console.log('🔄 Background sync event:', event.tag);
  
  if (event.tag === 'background-sync-problems') {
    event.waitUntil(syncProblems());
  }
});

// Sync problems with server (future enhancement)
async function syncProblems() {
  try {
    console.log('🔄 Syncing problems with server...');
    // Implementation would sync local storage with server
    // For now, just log the action
    console.log('✅ Problems synced successfully');
  } catch (error) {
    console.error('❌ Failed to sync problems:', error);
  }
}

// Handle push notifications (future enhancement)
self.addEventListener('push', event => {
  console.log('🔔 Push notification received:', event);
  
  let title = 'Community Hub';
  let body = 'You have new notifications';
  let icon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌱</text></svg>';
  
  if (event.data) {
    const data = event.data.json();
    title = data.title || title;
    body = data.body || body;
    icon = data.icon || icon;
  }
  
  const options = {
    body,
    icon,
    badge: icon,
    vibrate: [200, 100, 200],
    data: {
      url: 'Index.html',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: icon
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || 'Index.html')
    );
  }
});

// Periodic background sync (future enhancement)
self.addEventListener('periodicsync', event => {
  console.log('⏰ Periodic sync event:', event.tag);
  
  if (event.tag === 'update-problems') {
    event.waitUntil(syncProblems());
  }
});

// Message handling from main thread
self.addEventListener('message', event => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: APP_VERSION });
  }
});

console.log('🌱 Community Hub Service Worker loaded successfully');
