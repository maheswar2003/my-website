// Service Worker for Portfolio Website
// Version 1.0.0

const CACHE_NAME = 'maheswar-portfolio-v1.0.0';
const STATIC_CACHE = 'static-cache-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-cache-v1.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/ms.jpg',
    '/manifest.json'
];

// External resources to cache
const EXTERNAL_RESOURCES = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// URLs that should always be fetched from network
const NETWORK_FIRST_URLS = [
    'https://formsubmit.co/',
    '/api/'
];

// Utility functions
const isStaticAsset = (url) => {
    return STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset));
};

const isExternalResource = (url) => {
    return EXTERNAL_RESOURCES.some(resource => url.href.startsWith(resource));
};

const isNetworkFirst = (url) => {
    return NETWORK_FIRST_URLS.some(pattern => url.href.includes(pattern));
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Install event');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE).then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Cache external resources
            caches.open(DYNAMIC_CACHE).then((cache) => {
                console.log('[SW] Caching external resources');
                return Promise.allSettled(
                    EXTERNAL_RESOURCES.map(url => 
                        cache.add(url).catch(err => console.warn(`[SW] Failed to cache ${url}:`, err))
                    )
                );
            })
        ]).then(() => {
            console.log('[SW] All caches populated');
            // Force the waiting service worker to become the active service worker
            return self.skipWaiting();
        })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate event');
    
    event.waitUntil(
        Promise.all([
            // Cleanup old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all pages
            self.clients.claim()
        ]).then(() => {
            console.log('[SW] Service worker activated and ready');
        })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(handleRequest(event.request, requestUrl));
});

// Main request handler with different caching strategies
async function handleRequest(request, requestUrl) {
    try {
        // Strategy 1: Network First (for API calls and forms)
        if (isNetworkFirst(requestUrl)) {
            return await networkFirst(request);
        }
        
        // Strategy 2: Cache First (for static assets)
        if (isStaticAsset(requestUrl)) {
            return await cacheFirst(request);
        }
        
        // Strategy 3: Stale While Revalidate (for external resources)
        if (isExternalResource(requestUrl)) {
            return await staleWhileRevalidate(request);
        }
        
        // Strategy 4: Network First with fallback (for everything else)
        return await networkFirst(request);
        
    } catch (error) {
        console.error('[SW] Request failed:', error);
        return await getCacheOrOfflinePage(request);
    }
}

// Cache First Strategy
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        console.log('[SW] Serving from cache:', request.url);
        return cachedResponse;
    }
    
    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache the response
    if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Network First Strategy
async function networkFirst(request) {
    try {
        console.log('[SW] Network first for:', request.url);
        const networkResponse = await fetch(request);
        
        // Cache successful responses (except for form submissions)
        if (networkResponse && 
            networkResponse.status === 200 && 
            !request.url.includes('formsubmit.co')) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    // Start fetch in background
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
            const cache = caches.open(DYNAMIC_CACHE);
            cache.then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(() => {
        console.log('[SW] Network failed for:', request.url);
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        console.log('[SW] Serving stale content:', request.url);
        return cachedResponse;
    }
    
    // Otherwise wait for network
    console.log('[SW] No cache, waiting for network:', request.url);
    return await fetchPromise;
}

// Fallback for offline scenarios
async function getCacheOrOfflinePage(request) {
    // Try to get from any cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // For HTML requests, return the main page as fallback
    if (request.headers.get('accept')?.includes('text/html')) {
        const mainPage = await caches.match('/');
        if (mainPage) {
            return mainPage;
        }
    }
    
    // For images, return a placeholder
    if (request.headers.get('accept')?.includes('image/')) {
        return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                <rect width="200" height="200" fill="#f3f4f6"/>
                <text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Image Unavailable</text>
            </svg>`,
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
    
    // Return a generic offline response
    return new Response(
        JSON.stringify({ 
            error: 'Offline', 
            message: 'This content is not available offline' 
        }),
        { 
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'GET_CACHE_STATUS':
                getCacheStatus().then(status => {
                    event.ports[0].postMessage(status);
                });
                break;
            case 'CLEAR_CACHE':
                clearAllCaches().then(() => {
                    event.ports[0].postMessage({ success: true });
                });
                break;
            default:
                console.log('[SW] Unknown message type:', event.data.type);
        }
    }
});

// Get cache status
async function getCacheStatus() {
    const cacheNames = await caches.keys();
    const status = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        status[cacheName] = keys.length;
    }
    
    return status;
}

// Clear all caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] All caches cleared');
}

// Background sync for form submissions (if supported)
if ('sync' in self.registration) {
    self.addEventListener('sync', (event) => {
        if (event.tag === 'contact-form-sync') {
            event.waitUntil(syncContactForm());
        }
    });
}

// Sync contact form submissions
async function syncContactForm() {
    try {
        // Get stored form data from IndexedDB (if implemented)
        console.log('[SW] Syncing contact form submissions');
        // This would sync any pending form submissions when back online
    } catch (error) {
        console.error('[SW] Failed to sync contact form:', error);
    }
}

// Push notifications (if implemented)
self.addEventListener('push', (event) => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/icon-192x192.png',
            badge: '/icon-72x72.png',
            tag: 'portfolio-notification',
            renotify: true,
            actions: [
                {
                    action: 'view',
                    title: 'View Portfolio'
                },
                {
                    action: 'close',
                    title: 'Close'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification('Portfolio Update', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', (event) => {
        if (event.tag === 'cache-cleanup') {
            event.waitUntil(performCacheCleanup());
        }
    });
}

// Perform cache cleanup
async function performCacheCleanup() {
    try {
        // Clean up old entries from dynamic cache
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        
        // Remove entries older than 7 days
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        const cutoff = Date.now() - maxAge;
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const dateHeader = response.headers.get('date');
                if (dateHeader && new Date(dateHeader).getTime() < cutoff) {
                    await cache.delete(request);
                    console.log('[SW] Cleaned up old cache entry:', request.url);
                }
            }
        }
        
        console.log('[SW] Cache cleanup completed');
    } catch (error) {
        console.error('[SW] Cache cleanup failed:', error);
    }
}

// Error handling
self.addEventListener('error', (event) => {
    console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service Worker loaded successfully'); 