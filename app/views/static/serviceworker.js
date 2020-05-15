var WORKBOX_DEBUG=true;

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js"
);

function swlog(message, object) {
  if(WORKBOX_DEBUG){
    console.log(`[Service Worker] ${message}`, object ? object : '');
  }
}

if (workbox) {
  workbox.setConfig({debug: WORKBOX_DEBUG});
  workbox.googleAnalytics.initialize();

  workbox.routing.registerRoute(
    new RegExp(
      "^https://(cdn|audio|download|verses).(?:qurancdn|quran|quranicaudio).com/(.*)"
    ),
    new workbox.strategies.CacheFirst({
      cacheName: "quran-audio",
      plugins: [
        new workbox.cacheableResponse.CacheableResponse({
          statuses: [0, 200]
        }),
        new workbox.expiration.CacheExpiration(
          'quran-audio',
          {
            maxEntries: 500
          }),
        new workbox.rangeRequests.RangeRequestsPlugin()
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
        new workbox.cacheableResponse.CacheableResponse({
          statuses: [0, 200, 206, 304]
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    /\.(?:js|css|eot|ttf|woff|woff2|otf)$/,

    new workbox.strategies.CacheFirst({
      cacheName: "quran-static",
      plugins: [
        new workbox.cacheableResponse.CacheableResponse({
          statuses: [0, 200, 206, 304]
        }),
        new workbox.expiration.CacheExpiration(
          'quran-static',
          {
            maxEntries: 500
          })
      ]
    })
  );

  workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|svg|ogg)$/,
    new workbox.strategies.CacheFirst({
      cacheName: "images"
    })
  );

  workbox.routing.registerRoute(
    new RegExp("^https://(www|beta|staging)?.(?:quran).com/(.*)"),

    new workbox.strategies.NetworkFirst({
      cacheName: "quran-pwa",
      plugins: [
        new workbox.expiration.CacheExpiration(
          'quran-pwa',
          {
          maxEntries: 2000,
          maxAgeSeconds: 6 * 30 * 24 * 60 * 60 // 6 month
        })
      ]
    })
  );

  workbox.routing.setCatchHandler(({event}) => {
    return fetch(event.request);
  });

  // This immediately deploys the service worker w/o requiring a refresh
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  swlog("Workbox is ready");
} else {
  swlog("Boo! Workbox didn't load 😬");
}
