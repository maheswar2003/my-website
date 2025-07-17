// Enhanced Service Worker for Portfolio Website
// Version 2.0.0 - Optimized Performance

const CACHE_VERSION = 'v2.0.0';
const CACHE_PREFIX = 'maheswar-portfolio';
const STATIC_CACHE = `${CACHE_PREFIX}-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `${CACHE_PREFIX}-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images-${CACHE_VERSION}`;

// Cache configuration
const CACHE_CONFIG = {
    static: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxItems: 50
    },
    dynamic: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        maxItems: 30
    },
    images: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxItems: 20
    }
};

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/ms.jpg',
    // Fonts
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    // Icons
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    // Libraries
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollToPlugin.min.js',
    'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js'
];

// Offline fallback page HTML
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - Maheswar Sahoo</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-align: center;
        }
        .offline-container {
            padding: 2rem;
            max-width: 400px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }
        .btn {
            display: inline-block;
            padding: 1rem 2rem;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <h1>📡</h1>
        <h1>Offline</h1>
        <p>It seems you're offline. Please check your internet connection and try again.</p>
        <a href="/" class="btn" onclick="window.location.reload()">Try Again</a>
    </div>
</body>
</html>
`;

// Utility functions
const getCurrentTime = () => Date.now();

const isExpired = (response, maxAge) => {
    const fetchTime = response.headers.get('sw-fetch-time');
    if (!fetchTime) return true;
    return getCurrentTime() - parseInt(fetchTime) > maxAge;
};

const createTimestampedResponse = async (response) => {
    const clonedResponse = response.clone();
    const headers = new Headers(clonedResponse.headers);
    headers.set('sw-fetch-time', getCurrentTime().toString());
    
    const body = await clonedResponse.blob();
    return new Response(body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: headers
    });
};

const getCache = async (cacheName) => {
    return await caches.open(cacheName);
};

const getCacheConfig = (url) => {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
        return { cacheName: IMAGE_CACHE, config: CACHE_CONFIG.images };
    }
    if (STATIC_ASSETS.includes(url.pathname) || STATIC_ASSETS.includes(url.href)) {
        return { cacheName: STATIC_CACHE, config: CACHE_CONFIG.static };
    }
    return { cacheName: DYNAMIC_CACHE, config: CACHE_CONFIG.dynamic };
};

const cleanupCache = async (cacheName, maxItems) => {
    const cache = await getCache(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxItems) {
        const keysToDelete = keys.slice(0, keys.length - maxItems);
        await Promise.all(keysToDelete.map(key => cache.delete(key)));
    }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
    // Installing new service worker
    
    event.waitUntil(
        (async () => {
            const cache = await getCache(STATIC_CACHE);
            
            // Cache static assets in parallel
            const cachePromises = STATIC_ASSETS.map(async (url) => {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const timestampedResponse = await createTimestampedResponse(response);
                        await cache.put(url, timestampedResponse);
                    }
                } catch (error) {
                    // Failed to cache resource
                }
            });
            
            await Promise.allSettled(cachePromises);
            
            // Cache offline page
            const offlineResponse = new Response(OFFLINE_HTML, {
                headers: { 'Content-Type': 'text/html' }
            });
            await cache.put('/offline.html', offlineResponse);
            
            // Installation complete
            await self.skipWaiting();
        })()
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    // Activating new service worker
    
    event.waitUntil(
        (async () => {
            // Clean up old caches
            const cacheNames = await caches.keys();
            const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
            
            await Promise.all(
                cacheNames.map(async (cacheName) => {
                    if (!validCaches.includes(cacheName)) {
                        // Deleting old cache
                        await caches.delete(cacheName);
                    }
                })
            );
            
            // Take control of all pages
            await self.clients.claim();
            // Activation complete
        })()
    );
});

// Fetch event - implement advanced caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip non-HTTP(S) requests
    if (!request.url.startsWith('http')) return;
    
    // Skip requests to different origins (except allowed CDNs)
    const allowedOrigins = [
        self.location.origin,
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net'
    ];
    
    if (!allowedOrigins.some(origin => request.url.startsWith(origin))) {
        return;
    }
    
    event.respondWith(handleRequest(request, url));
});

// Main request handler
async function handleRequest(request, url) {
    // Special handling for navigation requests
    if (request.mode === 'navigate') {
        return handleNavigationRequest(request);
    }
    
    // Get cache configuration
    const { cacheName, config } = getCacheConfig(url);
    
    // Try cache first for static assets
    if (cacheName === STATIC_CACHE) {
        return cacheFirst(request, cacheName, config);
    }
    
    // Use stale-while-revalidate for dynamic content
    return staleWhileRevalidate(request, cacheName, config);
}

// Handle navigation requests (HTML pages)
async function handleNavigationRequest(request) {
    try {
        // Try network first
        const response = await fetch(request);
        if (response.ok) {
            const cache = await getCache(DYNAMIC_CACHE);
            const timestampedResponse = await createTimestampedResponse(response);
            cache.put(request, timestampedResponse);
            return response;
        }
        throw new Error('Network response not ok');
    } catch (error) {
        // Try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page
        const offlineResponse = await caches.match('/offline.html');
        return offlineResponse || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Cache-first strategy
async function cacheFirst(request, cacheName, config) {
    const cache = await getCache(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, config.maxAge)) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const timestampedResponse = await createTimestampedResponse(networkResponse);
            await cache.put(request, timestampedResponse);
            await cleanupCache(cacheName, config.maxItems);
        }
        return networkResponse;
    } catch (error) {
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName, config) {
    const cache = await getCache(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(async (networkResponse) => {
        if (networkResponse.ok) {
            const timestampedResponse = await createTimestampedResponse(networkResponse);
            await cache.put(request, timestampedResponse);
            await cleanupCache(cacheName, config.maxItems);
        }
        return networkResponse;
    }).catch(() => null);
    
    if (cachedResponse && !isExpired(cachedResponse, config.maxAge)) {
        return cachedResponse;
    }
    
    const networkResponse = await fetchPromise;
    return networkResponse || cachedResponse || createOfflineResponse(request);
}

// Create offline response
function createOfflineResponse(request) {
    const url = new URL(request.url);
    
    // Return appropriate offline response based on request type
    if (request.headers.get('accept')?.includes('image/')) {
        return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                <rect width="200" height="200" fill="#f3f4f6"/>
                <text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif">Offline</text>
            </svg>`,
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
    
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CLEAR_CACHE':
            event.waitUntil(
                caches.keys().then(cacheNames => 
                    Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
                ).then(() => {
                    event.ports[0].postMessage({ success: true });
                })
            );
            break;
            
        case 'CACHE_URLS':
            event.waitUntil(
                cacheUrls(data.urls).then(() => {
                    event.ports[0].postMessage({ success: true });
                })
            );
            break;
    }
});

// Cache specific URLs on demand
async function cacheUrls(urls) {
    if (!Array.isArray(urls)) return;
    
    const cache = await getCache(DYNAMIC_CACHE);
    const cachePromises = urls.map(async (url) => {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const timestampedResponse = await createTimestampedResponse(response);
                await cache.put(url, timestampedResponse);
            }
        } catch (error) {
            // Failed to cache resource
        }
    });
    
    await Promise.allSettled(cachePromises);
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncOfflineForms());
    }
});

async function syncOfflineForms() {
    // This would sync any offline form submissions
    // Implementation depends on your backend API
    // Syncing offline forms
}

// Push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const options = {
        body: event.data.text(),
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        vibrate: [200, 100, 200],
        tag: 'portfolio-notification',
        requireInteraction: true,
        actions: [
            { action: 'view', title: 'View Portfolio' },
            { action: 'close', title: 'Close' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Maheswar Sahoo', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Periodic background sync for cache cleanup
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cleanup-caches') {
        event.waitUntil(performCacheCleanup());
    }
});

async function performCacheCleanup() {
    // Performing periodic cache cleanup
    
    const cacheNames = [
        { name: STATIC_CACHE, config: CACHE_CONFIG.static },
        { name: DYNAMIC_CACHE, config: CACHE_CONFIG.dynamic },
        { name: IMAGE_CACHE, config: CACHE_CONFIG.images }
    ];
    
    for (const { name, config } of cacheNames) {
        await cleanupCache(name, config.maxItems);
        
        // Remove expired items
        const cache = await getCache(name);
        const keys = await cache.keys();
        
        for (const request of keys) {
            const response = await cache.match(request);
            if (response && isExpired(response, config.maxAge)) {
                await cache.delete(request);
            }
        }
    }
}

// Enhanced Service Worker loaded 