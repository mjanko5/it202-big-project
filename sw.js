var cacheName = 'app_cache';

//INDICATE FILES TO BE CACHED:
var appShellFiles = [
    "./index.html",
    "./script.js",
    "./manifest.json",
    "https://script.google.com/macros/s/AKfycbyqZu5iwgp2C0Sk35PbTkJ1U3-lAfJej1TncdLxMAxaRmWdTg/exec",
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js",
    "https://code.jquery.com/jquery-3.4.1.min.js",
    "./"
];


//REGISTRATION TRIGGERS INSTALL EVENT, WHICH PERFORMS ACTIONS:
self.addEventListener('install', event => {
    //console.log('[Service Worker] Install');
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(appShellFiles);
        })
    );
});


//CACHING THE FILES:

//FETCH REQUEST
self.addEventListener('fetch', e => {
    //console.log("Fetch request...");

    //OVERWRITING BROWSER'S BUILT IN FETCH HANDLER
    e.respondWith(

        //LOOK UP THE CACHE & RETURN THE RESPONSE
        caches.match(e.request).then(r => {
            //console.log('[Service Worker] Fetching resource: '+ e.request.url);

            //IF THE MATCH RETURNS NULL, THIS WILL RUN THE FETCH REQUEST
            return r || fetch(e.request).then(response => {		

                //OPENS THE CACHE
                return caches.open(cacheName).then(cache => {
                    //console.log('[Service Worker] Caching new resource: ' + e.request.url);
//                      if not Yahoo weather:
//                         if (e.request.url in appShellFiles){
//                             console.log(e.request.url + " in appShellFiles");
                        cache.put(e.request, response.clone());
//                         }
                    return response;

                }); //end open cache

            }); //end fetch request

        }) //end caches.match

    ); //end respondWith

}); //end fetch listener
