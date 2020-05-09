importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js"
);

if (workbox) {
  var WORKBOX_DEBUG=false;

  workbox.setConfig({debug: WORKBOX_DEBUG});

  workbox.googleAnalytics.initialize();
  // Enable navigation preload.
  // workbox.navigationPreload.enable();

  workbox.routing.registerRoute(
    new RegExp(
      "^https://(cdn|audio|download|verses).(?:qurancdn|quran|quranicaudio).com/(.*)"
    ),
    new workbox.strategies.CacheFirst({
      cacheName: "quran-audio",
      plugins: [
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 200, 206, 304]
        }),
        new workbox.expiration.Plugin({
          maxAgeSeconds: 12 * 30 * 24 * 60 * 60, //one year
          maxEntries: 500
        }),
        new workbox.rangeRequests.Plugin()
      ],
      matchOptions: {
        ignoreSearch: true,
      }
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
          statuses: [0, 200, 206, 304]
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
          statuses: [0, 200, 206, 304]
        }),
        new workbox.expiration.Plugin({
          maxAgeSeconds: 12 * 30 * 24 * 60 * 60, //one year
          maxEntries: 1000
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|svg|ogg)$/,
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
    new RegExp("^https://(www|beta|staging)?.(?:quran).com/(.*)"),

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
