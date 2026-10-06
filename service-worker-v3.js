/* ========================================
   Redder Piano
   Service Worker v3

   旧ユーザー移行専用
======================================== */


/* ========================================
   インストール
======================================== */

self.addEventListener(

    "install",

    function (event) {

        event.waitUntil(

            self.skipWaiting()

        );

    }

);


/* ========================================
   有効化

   古いキャッシュをすべて削除
======================================== */

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

                                    return caches.delete(
                                        cacheName
                                    );

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
   Fetch

   旧v3では通信に介入しない
======================================== */

self.addEventListener(

    "fetch",

    function () {

        /*
            何もしない

            HTML / CSS / JS / 画像 / 音声は
            ブラウザから直接取得させる
        */

    }

);