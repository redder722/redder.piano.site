/* ========================================
   旧Service Worker
   移行専用
======================================== */

self.addEventListener(
    "install",
    function (event) {

        event.waitUntil(
            self.skipWaiting()
        );

    }
);


self.addEventListener(
    "activate",
    function (event) {

        event.waitUntil(

            caches
                .keys()
                .then(
                    function (cacheNames) {

                        return Promise.all(

                            cacheNames.map(
                                function (cacheName) {

                                    if (
                                        cacheName.startsWith(
                                            "redder-piano-"
                                        )
                                    ) {

                                        return caches.delete(
                                            cacheName
                                        );

                                    }

                                }
                            )

                        );

                    }
                )
                .then(
                    function () {

                        return self.clients.claim();

                    }
                )

        );

    }
);


/* ========================================
   fetchには介入しない
======================================== */

self.addEventListener(
    "fetch",
    function () {

        // 何もしない

    }
);