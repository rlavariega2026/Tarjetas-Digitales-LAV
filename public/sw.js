/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "22225c3cc25cd8ae1c8c0a87a6c79fc2"
  }, {
    "url": "pwa-512x512.png",
    "revision": "22225c3cc25cd8ae1c8c0a87a6c79fc2"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9344282098b802595d5f12db6e33cdc6"
  }, {
    "url": "index.html",
    "revision": "f3b3312db1258d084e25b4bbc34a789f"
  }, {
    "url": "icon.svg",
    "revision": "26bbe9a272fb0e840887714b7744c4e5"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "8c38d36b2f39e07979696e1800e86c33"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/index-DaDKYNg_.css",
    "revision": null
  }, {
    "url": "assets/index-CpjiI9Od.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "8c38d36b2f39e07979696e1800e86c33"
  }, {
    "url": "icon.svg",
    "revision": "26bbe9a272fb0e840887714b7744c4e5"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9344282098b802595d5f12db6e33cdc6"
  }, {
    "url": "pwa-512x512.png",
    "revision": "22225c3cc25cd8ae1c8c0a87a6c79fc2"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "22225c3cc25cd8ae1c8c0a87a6c79fc2"
  }, {
    "url": "manifest.webmanifest",
    "revision": "bffe7e5d616504fb57441c01e57589a9"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
