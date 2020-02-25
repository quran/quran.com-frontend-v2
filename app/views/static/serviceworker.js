importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js"
);

if (workbox) {
  workbox.googleAnalytics.initialize();
  // Enable navigation preload.
  // workbox.navigationPreload.enable();

  workbox.routing.registerRoute(
    new RegExp(
      "^https://(cdn|audio|download).(?:qurancdn|quran|quranicaudio).com/(.*)"
    ),
    new workbox.strategies.CacheFirst({
      cacheName: "quran-audio",
      plugins: [
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 1000]
        }),
        new workbox.expiration.Plugin({
          maxAgeSeconds: 12 * 30 * 24 * 60 * 60, //one year
          maxEntries: 500
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    new RegExp(
      "^https://(cdnjs|fonts|oss|maxcdn).(?:googleapis|gstatic|cloudflare|maxcdn|bootstrapcdn|ravenjs).com/(.*)"
    ),
    new workbox.strategies.CacheFirst({
      cacheName: "quran-external-libs",
      plugins: [
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 1000]
        }),
        new workbox.expiration.Plugin({
          maxAgeSeconds: 12 * 30 * 24 * 60 * 60, //one year
          maxEntries: 50
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    /\.(?:js|css|eot|ttf|woff|woff2|otf)$/,

    new workbox.strategies.CacheFirst({
      cacheName: "quran-static",
      plugins: [
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 200]
        }),
        new workbox.expiration.Plugin({
          maxAgeSeconds: 12 * 30 * 24 * 60 * 60, //one year
          maxEntries: 1000
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|svg|mp3|ogg)$/,
    new workbox.strategies.CacheFirst({
      cacheName: "images",
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 200,
          maxAgeSeconds: 12 * 30 * 24 * 60 * 60 // 1 year
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    new RegExp("^https://(www|beta)?.(?:quran).com/(.*)"),

    new workbox.strategies.NetworkFirst({
      cacheName: "quran-pwa",
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 2000,
          maxAgeSeconds: 6 * 30 * 24 * 60 * 60 // 6 month
        })
      ]
    })
  );

  console.log("Workbox is ready");
} else {
  console.log("Boo! Workbox didn't load 😬");
}
