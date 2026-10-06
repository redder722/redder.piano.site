/* ========================================
   Redder Piano
   Service Worker v4
======================================== */

const CACHE_NAME =
    "redder-piano-v4";


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

   古いキャッシュを削除
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

                                    if (
                                        cacheName !==
                                        CACHE_NAME
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
   Fetch
======================================== */

self.addEventListener(

    "fetch",

    function (event) {

        const request =
            event.request;


        /* ====================================
           GET以外は処理しない
        ==================================== */

        if (
            request.method !== "GET"
        ) {

            return;

        }


        const url =
            new URL(
                request.url
            );


        /* ====================================
           他サイトの通信は処理しない
        ==================================== */

        if (
            url.origin !==
            self.location.origin
        ) {

            return;

        }


        /* ====================================
           Rangeリクエストは処理しない

           MP3や動画などで使用される
           206 Partial Content 対策
        ==================================== */

        if (
            request.headers.has("range")
        ) {

            return;

        }


        /* ====================================
           音声ファイルは処理しない

           ブラウザに直接通信させる
        ==================================== */

        if (
            request.destination === "audio" ||

            url.pathname.endsWith(".mp3")
        ) {

            return;

        }


        /* ====================================
           HTML

           ネットワーク優先
        ==================================== */

        if (
            request.mode === "navigate"
        ) {

            event.respondWith(

                networkFirst(
                    request
                )

            );


            return;

        }


        /* ====================================
           CSS
           JavaScript
           フォント

           常にネットワークを優先
        ==================================== */

        if (
            request.destination === "style" ||

            request.destination === "script" ||

            request.destination === "font"
        ) {

            event.respondWith(

                networkFirst(
                    request
                )

            );


            return;

        }


        /* ====================================
           画像

           キャッシュ優先
        ==================================== */

        if (
            request.destination === "image"
        ) {

            event.respondWith(

                cacheFirst(
                    request
                )

            );


            return;

        }


        /* ====================================
           その他

           ネットワーク優先
        ==================================== */

        event.respondWith(

            networkFirst(
                request
            )

        );

    }

);


/* ========================================
   Network First

   1. ネットワークへ接続
   2. 成功したらキャッシュ更新
   3. オフラインならキャッシュ
======================================== */

async function networkFirst(
    request
) {

    try {

        const response =

            await fetch(

                request,

                {
                    cache:
                        "no-store"
                }

            );


        /* ====================================
           200 OK の場合だけキャッシュする

           206 Partial Contentなどは
           キャッシュしない
        ==================================== */

        if (
            response.ok &&
            response.status === 200
        ) {

            const cache =

                await caches.open(
                    CACHE_NAME
                );


            await cache.put(

                request,

                response.clone()

            );

        }


        return response;

    }


    catch (
        error
    ) {

        const cachedResponse =

            await caches.match(
                request
            );


        if (
            cachedResponse
        ) {

            return cachedResponse;

        }


        throw error;

    }

}


/* ========================================
   Cache First

   画像向け
======================================== */

async function cacheFirst(
    request
) {

    const cachedResponse =

        await caches.match(
            request
        );


    if (
        cachedResponse
    ) {

        return cachedResponse;

    }


    const response =

        await fetch(
            request
        );


    /* ====================================
       200 OK の場合だけキャッシュする
    ==================================== */

    if (
        response.ok &&
        response.status === 200
    ) {

        const cache =

            await caches.open(
                CACHE_NAME
            );


        await cache.put(

            request,

            response.clone()

        );

    }


    return response;

}