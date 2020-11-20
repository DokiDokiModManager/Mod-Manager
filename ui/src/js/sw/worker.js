importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

console.log("Service worker is running. Workbox is " + (workbox ? "loaded" : "not loaded"));

workbox.setConfig({
    debug: true
});

workbox.routing.registerRoute(
    "/",
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'static-html',
    })
);

workbox.routing.registerRoute(
    /\.(?:js)$/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'static-js',
    })
);

workbox.routing.registerRoute(
    /\.(?:css)$/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'static-css',
    })
);

workbox.routing.registerRoute(
    /\.(?:ttf|svg|woff|woff2|eot)$/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'static-fonts',
    })
);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
workbox.routing.registerRoute(
    /^https:\/\/fonts\.googleapis\.com/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
    })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
workbox.routing.registerRoute(
    /^https:\/\/fonts\.gstatic\.com/,
    new workbox.strategies.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200],
            }),
            new workbox.expiration.Plugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30,
            }),
        ],
    })
);
