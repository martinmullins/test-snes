if(!self.define){let e,s={};const n=(n,t)=>(n=new URL(n+".js",t).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(t,a)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(s[c])return;let i={};const o=e=>n(e,c),r={module:{uri:c},exports:i,require:o};s[c]=Promise.all(t.map((e=>r[e]||o(e)))).then((e=>(a(...e),i)))}}define(["./workbox-946f13af"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/test-snes/_next/static/V6nT82rbBh0zaQJpfDK_b/_buildManifest.js",revision:"38ec5d8404a572468fba43207a6193c9"},{url:"/test-snes/_next/static/V6nT82rbBh0zaQJpfDK_b/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/test-snes/_next/static/chunks/0ac4af9d-c640a3b3c86c54e6.js",revision:"c640a3b3c86c54e6"},{url:"/test-snes/_next/static/chunks/c16184b3-de075af84e4023f8.js",revision:"de075af84e4023f8"},{url:"/test-snes/_next/static/chunks/framework-e70c6273bfe3f237.js",revision:"e70c6273bfe3f237"},{url:"/test-snes/_next/static/chunks/main-4c9650ce95a785f0.js",revision:"4c9650ce95a785f0"},{url:"/test-snes/_next/static/chunks/pages/_app-f4316c8b639c038c.js",revision:"f4316c8b639c038c"},{url:"/test-snes/_next/static/chunks/pages/_error-a4ba2246ff8fb532.js",revision:"a4ba2246ff8fb532"},{url:"/test-snes/_next/static/chunks/pages/index-2d72a29f27403d17.js",revision:"2d72a29f27403d17"},{url:"/test-snes/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/test-snes/_next/static/chunks/webpack-e0f7cdbd07de76e9.js",revision:"e0f7cdbd07de76e9"},{url:"/test-snes/_next/static/css/cdd7c4d6c7f38a99.css",revision:"cdd7c4d6c7f38a99"},{url:"/test-snes/favicon-16x16.png",revision:"d78b83bb609db18178ac660e4b5db4b8"},{url:"/test-snes/favicon-32x32.png",revision:"f874e44a0176524ab18eb1877ba4c87d"},{url:"/test-snes/favicon.ico",revision:"8c1d2a3e732a7c676740a4fa84572be3"},{url:"/test-snes/icon/about.txt",revision:"d57b3807526571fea285e12b297c6fa0"},{url:"/test-snes/icon/android-chrome-192x192.png",revision:"9e449a9da13103f507666e063aa47e95"},{url:"/test-snes/icon/android-chrome-512x512.png",revision:"efdffa8d2764f65363f71d2738f682a3"},{url:"/test-snes/icon/apple-touch-icon.png",revision:"d6dcfcc233d99da22f454fbcdf0cb205"},{url:"/test-snes/icon/favicon-16x16.png",revision:"d78b83bb609db18178ac660e4b5db4b8"},{url:"/test-snes/icon/favicon-32x32.png",revision:"f874e44a0176524ab18eb1877ba4c87d"},{url:"/test-snes/icon/favicon.ico",revision:"8c1d2a3e732a7c676740a4fa84572be3"},{url:"/test-snes/manifest.json",revision:"49a08bb316b9e6aa81008f773daa8597"},{url:"/test-snes/snes9x.data",revision:"624d728f40f76ff400ca9079cf683751"},{url:"/test-snes/snes9x.html",revision:"3efaff65b33cf936b61896f97e11a3a2"},{url:"/test-snes/snes9x.js",revision:"0d7c37b1469909350e714d247e96c022"},{url:"/test-snes/snes9x.wasm",revision:"46bb0d5a792e01d472b5d7bc635d6dc3"},{url:"/test-snes/vercel.svg",revision:"4b4f1876502eb6721764637fe5c41702"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/test-snes",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:n,state:t})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
