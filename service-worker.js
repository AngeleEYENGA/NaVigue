const CACHE_NAME = "navigue-app-shell-v12";
const APP_SHELL = [
  "./",
  "./index.html",
  "./navigation-core.js?v=1",
  "./transit-directions.js?v=1",
  "./address-suggestions.css?v=1",
  "./address-suggestions.js?v=1",
  "./icon.svg",
  "./outing.css?v=1",
  "./groups.css?v=1",
  "./groups-core.js?v=1",
  "./groups.js?v=1",
  "./outing-core.js?v=1",
  "./outing.js?v=1",
  "./wordmark-navigue.svg",
  "./supabase-config.js?v=2",
  "./family-auth.js?v=4"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith("navigue-app-shell-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (response.ok) {
          const copy = response.clone();
          await (await caches.open(CACHE_NAME)).put(request, copy);
        }
        return response;
      })
      .catch(async () => caches.match(request))
  );
});
