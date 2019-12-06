// //based off of "Say It!" app sw:

// var cacheName = 'app-v1';
// 	var appShellFiles = [
//         "./index.html",
//         "./script.js"
// 	];


// 	//REGISTRATION TRIGGERS INSTALL EVENT
// 	self.addEventListener('install', e => {
// 		console.log('[Service Worker] Install');
// 	});


// 	//CACHING THE FILES:

// 	//FETCH REQUEST
// 	self.addEventListener('fetch', e => {
// 		console.log("Fetch request...");

//         //OVERWRITING BROWSER'S BUILT IN FETCH HANDLER
// 		e.respondWith(	

//             //LOOK UP THE CACHE & RETURN THE RESPONSE
// 			caches.match(e.request).then(r => {   
// 				console.log('[Service Worker] Fetching resource: '+ e.request.url);
				
//                 //IF THE MATCH RETURNS NULL, THIS WILL RUN THE FETCH REQUEST
// 				return r || fetch(e.request).then(response => {		

//                     //OPENS THE CACHE
//                     return caches.open(cacheName).then(cache => {
//                         console.log('[Service Worker] Caching new resource: '+e.request.url);
//                         cache.put(e.request, response.clone());
//                         return response;
                        
// 					}); //end open cache

// 				}); //end fetch request

// 			}) //end caches.match

// 		); //end respondWith
		
// 	}); //end fetch listener






// // var cacheName = 'hello-pwa';
// // var filesToCache = [
// //   '/',
// //   '/index.html',
// //   '/styles.css',
// //   '/scripts.js',
// //   'https://script.google.com/macros/s/AKfycbyqZu5iwgp2C0Sk35PbTkJ1U3-lAfJej1TncdLxMAxaRmWdTg/exec'
// // ];

// // /* Start the service worker and cache all of the app's content */
// // self.addEventListener('install', function(e) {
// //   e.waitUntil(
// //     caches.open(cacheName).then(function(cache) {
// //       return cache.addAll(filesToCache);
// //     })
// //   );
// // });

// // /* Serve cached content when offline */
// // self.addEventListener('fetch', function(e) {
// //   e.respondWith(
// //     caches.match(e.request).then(function(response) {
// //       return response || fetch(e.request);
// //     })
// //   );
// // });