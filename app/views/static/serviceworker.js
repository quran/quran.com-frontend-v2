importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.0/workbox-sw.js');

if (workbox) {
    workbox.googleAnalytics.initialize();
    // Enable navigation preload.
    workbox.navigationPreload.enable();

    workbox.routing.registerRoute(
        new RegExp('^https://(cdnjs|fonts|oss|maxcdn|cdn|audio).(?:googleapis|gstatic|cloudflare|maxcdn|bootstrapcdn|ravenjs|qurancdn).com/(.*)'),
        new workbox.strategies.CacheFirst({
            cacheName: 'quran-static',
            plugins: [
                new workbox.cacheableResponse.Plugin({
                    statuses: [0, 200],
                }),
                new workbox.expiration.Plugin({
                    maxAgeSeconds: 60 * 60 * 24 * 365, //one year
                    maxEntries: 50,
                }),
            ],
        })
    );

    workbox.routing.registerRoute(
        /\.(?:js|css|eot|ttf|woff|woff2|otf)$/,
        new workbox.strategies.CacheFirst()
    );

    workbox.routing.registerRoute(
        /\.(?:png|gif|jpg|jpeg|svg)$/,
       new workbox.strategies.CacheFirst({
            cacheName: 'images',
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 200,
                    maxAgeSeconds: 12 * 30 * 24 * 60 * 60, // 1 year
                }),
            ],
        })
    );

    workbox.routing.registerRoute(
        new RegExp('^https://(www|beta)?.(?:quran).com/(.*)'),
        new workbox.strategies.NetworkFirst({
            cacheName: 'quran-pages',
            plugins: [
                new workbox.cacheableResponse.Plugin({
                    statuses: [0, 200],
                }),
                new workbox.expiration.Plugin({
                    maxAgeSeconds: 60 * 60 * 24 * 365, //one year
                    maxEntries: 50,
                })
            ],
        })
    );
    console.log("Workbox is ready");
} else {
    console.log("Boo! Workbox didn't load 😬");
}
