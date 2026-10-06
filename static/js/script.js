/* ========================================
   初期スクロール位置

   iPhone Safariなどで
   再読み込み時に以前のスクロール位置が
   復元される問題への対策
======================================== */


/* ========================================
   ブラウザによる
   スクロール位置の自動復元を無効化
======================================== */

if (
    "scrollRestoration" in
    window.history
) {

    window.history.scrollRestoration =
        "manual";

}

/* ========================================
   URLに残っているハッシュを削除
   #
======================================== */

if (
    window.location.hash
) {

    window.history.replaceState(

        null,

        "",

        window.location.pathname +
        window.location.search

    );

}

/* ========================================
   目次リンク

   スクロールはするが
   URLに #～ を残さない
======================================== */

const navigationLinks =

    document.querySelectorAll(
        'nav a[href^="#"]'
    );


navigationLinks.forEach(

    function (link) {

        link.addEventListener(

            "click",

            function (event) {

                /* 通常のアンカー移動を停止 */
                event.preventDefault();


                /* hrefから移動先を取得 */
                const targetId =

                    link.getAttribute(
                        "href"
                    );


                /* 移動先の要素を取得 */
                const target =

                    document.querySelector(
                        targetId
                    );


                /* 移動先が存在しなければ終了 */
                if (
                    !target
                ) {

                    return;

                }


                /* 対象セクションまでスクロール */
                target.scrollIntoView({

                    block:
                        "start"

                });


                /* URLから #～ を消した状態を維持 */
                window.history.replaceState(

                    null,

                    "",

                    window.location.pathname +
                    window.location.search

                );

            }

        );

    }

);


/* ========================================
   ページ最上部へ戻す
======================================== */

function resetInitialScrollPosition() {

    const originalScrollBehavior =

        document.documentElement
            .style
            .scrollBehavior;


    /*
        smoothスクロールを
        一時的に無効化
    */

    document.documentElement
        .style
        .scrollBehavior =
        "auto";


    /*
        ページ最上部
    */

    window.scrollTo(
        0,
        0
    );


    /*
        Safari対策
    */

    document.documentElement.scrollTop =
        0;


    document.body.scrollTop =
        0;


    /*
        元の設定へ戻す
    */

    document.documentElement
        .style
        .scrollBehavior =
        originalScrollBehavior;

}


/* ========================================
   Safariページ復元対策
======================================== */

window.addEventListener(

    "pageshow",

    function () {

        resetInitialScrollPosition();


        requestAnimationFrame(

            function () {

                requestAnimationFrame(

                    function () {

                        resetInitialScrollPosition();

                    }

                );

            }

        );

    }

);


/* ========================================
   長押しメニューを禁止

   ・画像保存
   ・リンクメニュー
   ・コンテキストメニュー
======================================== */

document.addEventListener(

    "contextmenu",

    function (event) {

        event.preventDefault();

    }

);


/* ========================================
   テキスト選択を禁止
======================================== */

document.addEventListener(

    "selectstart",

    function (event) {

        /*
            input / textarea は
           文字選択できるようにする
        */

        if (

            event.target.closest(
                "input, textarea"
            )

        ) {

            return;

        }


        event.preventDefault();

    }

);


/* ========================================
   画像などのドラッグを禁止
======================================== */

document.addEventListener(

    "dragstart",

    function (event) {

        event.preventDefault();

    }

);


/* ========================================
   iPhone / iPad Safari
   長押しメニュー対策
======================================== */

const longPressStyle =
    document.createElement(
        "style"
    );


longPressStyle.textContent = `

    /*
        長押し時の
        Safariメニューを禁止
    */

    body,
    body * {

        -webkit-touch-callout:
            none;

        -webkit-user-select:
            none;

        user-select:
            none;

    }


    /*
        入力フォームだけは
        選択できるようにする
    */

    input,
    textarea {

        -webkit-user-select:
            text;

        user-select:
            text;

    }

`;


document.head.appendChild(
    longPressStyle
);


/* ========================================
   背景切替対象
======================================== */

const backgroundSections =

    Array.from(

        document.querySelectorAll(
            ".background-section"
        )

    );


/* ========================================
   背景レイヤー
======================================== */

const backgroundLayers = [

    document.querySelector(
        ".background-layer-1"
    ),

    document.querySelector(
        ".background-layer-2"
    )

];


/* ========================================
   背景状態
======================================== */

let activeLayerIndex =
    0;


let currentBackground =
    "";


let requestedBackground =
    "";


let backgroundBusy =
    false;


/* ========================================
   背景画像キャッシュ
======================================== */

const backgroundCache =
    new Map();


/* ========================================
   背景画像を先読み
======================================== */

function preloadBackground(
    imageUrl
) {

    if (
        !imageUrl
    ) {

        return Promise.resolve(
            null
        );

    }


    if (
        backgroundCache.has(
            imageUrl
        )
    ) {

        return backgroundCache.get(
            imageUrl
        );

    }


    const promise =

        new Promise(

            function (
                resolve
            ) {

                const image =
                    new Image();


                image.onload =

                    function () {

                        resolve(
                            image
                        );

                    };


                image.onerror =

                    function () {

                        console.error(

                            "背景画像を読み込めませんでした:",

                            imageUrl

                        );


                        resolve(
                            null
                        );

                    };


                image.src =
                    imageUrl;

            }

        );


    backgroundCache.set(

        imageUrl,

        promise

    );


    return promise;

}


/* ========================================
   全背景画像を先読み
======================================== */

backgroundSections.forEach(

    function (
        section
    ) {

        const imageUrl =
            section.dataset.bg;


        if (
            imageUrl
        ) {

            preloadBackground(
                imageUrl
            );

        }

    }

);


/* ========================================
   背景変更要求
======================================== */

function requestBackground(
    imageUrl
) {

    if (
        !imageUrl
    ) {

        return;

    }


    requestedBackground =
        imageUrl;


    if (
        backgroundBusy
    ) {

        return;

    }


    processBackgroundQueue();

}


/* ========================================
   背景クロスフェード
======================================== */

async function processBackgroundQueue() {

    if (
        backgroundBusy
    ) {

        return;

    }


    const targetBackground =
        requestedBackground;


    if (
        !targetBackground ||

        targetBackground ===
        currentBackground
    ) {

        return;

    }


    if (
        !backgroundLayers[0] ||

        !backgroundLayers[1]
    ) {

        return;

    }


    backgroundBusy =
        true;


    const loadedImage =

        await preloadBackground(
            targetBackground
        );


    if (
        !loadedImage
    ) {

        backgroundBusy =
            false;


        if (
            requestedBackground !==
            currentBackground
        ) {

            processBackgroundQueue();

        }


        return;

    }


    /*
        読み込み中に
        次の背景が要求された場合
    */

    if (
        targetBackground !==
        requestedBackground
    ) {

        backgroundBusy =
            false;


        processBackgroundQueue();


        return;

    }


    const currentLayer =

        backgroundLayers[
            activeLayerIndex
        ];


    const nextLayerIndex =

        activeLayerIndex === 0

            ? 1

            : 0;


    const nextLayer =

        backgroundLayers[
            nextLayerIndex
        ];


    nextLayer.style.backgroundImage =

        `url("${targetBackground}")`;


    nextLayer.style.opacity =
        "0";


    /*
        ブラウザに一度
        描画させる
    */

    nextLayer.offsetWidth;


    /*
        クロスフェード
    */

    requestAnimationFrame(

        function () {

            requestAnimationFrame(

                function () {

                    nextLayer.style.opacity =
                        "1";


                    currentLayer.style.opacity =
                        "0";

                }

            );

        }

    );


    let finished =
        false;


    /* ========================================
       背景切替完了
    ======================================== */

    function finishTransition() {

        if (
            finished
        ) {

            return;

        }


        finished =
            true;


        nextLayer.removeEventListener(

            "transitionend",

            transitionEndHandler

        );


        activeLayerIndex =
            nextLayerIndex;


        currentBackground =
            targetBackground;


        currentLayer.style.opacity =
            "0";


        currentLayer.style.backgroundImage =
            "";


        backgroundBusy =
            false;


        /*
            タイトル再描画
        */

        drawWorkTitle();


        /*
            次の背景が要求されている場合
        */

        if (
            requestedBackground !==
            currentBackground
        ) {

            processBackgroundQueue();

        }

    }


    /* ========================================
       transition終了
    ======================================== */

    function transitionEndHandler(
        event
    ) {

        if (
            event.propertyName !==
            "opacity"
        ) {

            return;

        }


        finishTransition();

    }


    nextLayer.addEventListener(

        "transitionend",

        transitionEndHandler

    );


    /*
        transitionendが
        発生しなかった場合の保険
    */

    setTimeout(

        finishTransition,

        1300

    );

}


/* ========================================
   最初の背景
======================================== */

if (
    backgroundSections.length > 0 &&

    backgroundLayers[0] &&

    backgroundLayers[1]
) {

    const firstBackground =

        backgroundSections[0]
            .dataset.bg;


    if (
        firstBackground
    ) {

        backgroundLayers[0]
            .style
            .backgroundImage =

            `url("${firstBackground}")`;


        backgroundLayers[0]
            .style
            .opacity =
            "1";


        backgroundLayers[1]
            .style
            .opacity =
            "0";


        currentBackground =
            firstBackground;


        requestedBackground =
            firstBackground;

    }

}


/* ========================================
   現在表示しているセクションを調べる
======================================== */

function updateBackgroundByScroll() {

    if (
        backgroundSections.length === 0
    ) {

        return;

    }


    const screenCenter =

        window.innerHeight /
        2;


    let selectedSection =

        backgroundSections[0];


    let smallestDistance =
        Infinity;


    backgroundSections.forEach(

        function (
            section
        ) {

            const rect =

                section
                    .getBoundingClientRect();


            /*
                画面中央に
                セクションが存在する場合
            */

            if (
                rect.top <=
                screenCenter &&

                rect.bottom >=
                screenCenter
            ) {

                selectedSection =
                    section;


                smallestDistance =
                    0;


                return;

            }


            /*
                セクション中央
            */

            const sectionCenter =

                rect.top +

                rect.height /
                2;


            /*
                画面中央との距離
            */

            const distance =

                Math.abs(

                    sectionCenter -

                    screenCenter

                );


            if (
                distance <
                smallestDistance
            ) {

                smallestDistance =
                    distance;


                selectedSection =
                    section;

            }

        }

    );


    requestBackground(

        selectedSection
            .dataset.bg

    );

}


/* ========================================
   「作品集@Youtube」Canvas
======================================== */

const titleCanvas =

    document.getElementById(
        "work-title"
    );


const titleContext =

    titleCanvas

        ? titleCanvas.getContext(

            "2d",

            {
                willReadFrequently:
                    true
            }

        )

        : null;


/* ========================================
   明るい背景
======================================== */

const lightTitleColor = {

    red:
        76,

    green:
        185,

    blue:
        255

};


/* ========================================
   暗い背景
======================================== */

const darkTitleColor = {

    red:
        255,

    green:
        255,

    blue:
        255

};


/* ========================================
   明るさ判定境界
======================================== */

const brightnessBorder =
    59;


/* ========================================
   「作品集@Youtube」を描画
======================================== */

async function drawWorkTitle() {

    if (
        !titleCanvas ||

        !titleContext ||

        !currentBackground
    ) {

        return;

    }


    const titleRect =

        titleCanvas
            .getBoundingClientRect();


    /*
        Canvasが画面外なら
        描画しない
    */

    if (
        titleRect.bottom < 0 ||

        titleRect.top >
        window.innerHeight
    ) {

        return;

    }


    const image =

        await preloadBackground(
            currentBackground
        );


    if (
        !image
    ) {

        return;

    }


    const width =

        Math.max(

            1,

            Math.round(
                titleRect.width
            )

        );


    const height =

        Math.max(

            1,

            Math.round(
                titleRect.height
            )

        );


    /*
        Canvas内部サイズ
    */

    titleCanvas.width =
        width;


    titleCanvas.height =
        height;


    titleContext.clearRect(

        0,

        0,

        width,

        height

    );


    /* ========================================
       文字サイズ
    ======================================== */

    const fontSize =

        window.innerWidth <=
        768

            ? 25

            : 30;


    titleContext.font =

        `bold ${fontSize}px Arial, sans-serif`;


    titleContext.textAlign =
        "center";


    titleContext.textBaseline =
        "middle";


    titleContext.fillStyle =
        "white";


    /*
        一度白で描画
    */

    titleContext.fillText(

        "作品集@Youtube",

        width /
        2,

        height /
        2

    );


    /* ========================================
       文字ピクセル取得
    ======================================== */

    const titleImageData =

        titleContext.getImageData(

            0,

            0,

            width,

            height

        );


    const titlePixels =

        titleImageData.data;


    /* ========================================
       背景Canvasを作る
    ======================================== */

    const backgroundCanvas =

        document.createElement(
            "canvas"
        );


    const backgroundContext =

        backgroundCanvas.getContext(

            "2d",

            {
                willReadFrequently:
                    true
            }

        );


    if (
        !backgroundContext
    ) {

        return;

    }


    backgroundCanvas.width =
        width;


    backgroundCanvas.height =
        height;


    /* ========================================
       背景画像 cover 計算
    ======================================== */

    const stageWidth =
        window.innerWidth;


    const stageHeight =
        window.innerHeight;


    const scale =

        Math.max(

            stageWidth /
            image.naturalWidth,

            stageHeight /
            image.naturalHeight

        );


    const imageWidth =

        image.naturalWidth *
        scale;


    const imageHeight =

        image.naturalHeight *
        scale;


    const imageX =

        (
            stageWidth -
            imageWidth
        ) /
        2;


    const imageY =

        (
            stageHeight -
            imageHeight
        ) /
        2;


    const startX =

        Math.round(
            titleRect.left
        );


    const startY =

        Math.round(
            titleRect.top
        );


    /*
        タイトル位置に対応する
        背景画像を描画
    */

    backgroundContext.drawImage(

        image,

        imageX -
        startX,

        imageY -
        startY,

        imageWidth,

        imageHeight

    );


    /* ========================================
       背景ピクセル取得
    ======================================== */

    const backgroundData =

        backgroundContext.getImageData(

            0,

            0,

            width,

            height

        );


    const backgroundPixels =

        backgroundData.data;


    /* ========================================
       文字色を
       ピクセルごとに変更
    ======================================== */

    for (
        let y = 0;

        y < height;

        y++
    ) {

        for (
            let x = 0;

            x < width;

            x++
        ) {

            const index =

                (
                    y *
                    width +
                    x
                ) *
                4;


            /*
                文字側の透明度
            */

            const alpha =

                titlePixels[
                    index +
                    3
                ];


            /*
                文字ではない場所
            */

            if (
                alpha === 0
            ) {

                continue;

            }


            /*
                背景色
            */

            const red =

                backgroundPixels[
                    index
                ];


            const green =

                backgroundPixels[
                    index +
                    1
                ];


            const blue =

                backgroundPixels[
                    index +
                    2
                ];


            /*
                背景の明るさ
            */

            const brightness =

                red *
                0.2126 +

                green *
                0.7152 +

                blue *
                0.0722;


            /*
                明るい背景
                ↓
                青文字
            */

            if (
                brightness >
                brightnessBorder
            ) {

                titlePixels[
                    index
                ] =

                    lightTitleColor.red;


                titlePixels[
                    index +
                    1
                ] =

                    lightTitleColor.green;


                titlePixels[
                    index +
                    2
                ] =

                    lightTitleColor.blue;

            }


            /*
                暗い背景
                ↓
                白文字
            */

            else {

                titlePixels[
                    index
                ] =

                    darkTitleColor.red;


                titlePixels[
                    index +
                    1
                ] =

                    darkTitleColor.green;


                titlePixels[
                    index +
                    2
                ] =

                    darkTitleColor.blue;

            }

        }

    }


    /*
        加工した文字を
        Canvasに戻す
    */

    titleContext.putImageData(

        titleImageData,

        0,

        0

    );

}


/* ========================================
   スクロール監視
======================================== */

let scrollTicking =
    false;


window.addEventListener(

    "scroll",

    function () {

        if (
            scrollTicking
        ) {

            return;

        }


        scrollTicking =
            true;


        requestAnimationFrame(

            function () {

                updateBackgroundByScroll();


                scheduleTitleRedraw();


                scrollTicking =
                    false;

            }

        );

    },

    {
        passive:
            true
    }

);

/* ========================================
   スクロール表示アニメーション
======================================== */


/* ========================================
   ふわっと表示する文字
======================================== */

const revealTextElements =

    document.querySelectorAll(

        [
            ".section-panel > h2",
            ".skill-description p",
            ".guide-description p",
            ".skill-point h3",
            ".skill-point p",
            ".guide-point h3",
            ".guide-point p"
        ].join(",")

    );


/* ========================================
   reveal-textクラスを自動追加
======================================== */

revealTextElements.forEach(

    function (
        element
    ) {

        element.classList.add(
            "reveal-text"
        );

    }

);


/* ========================================
   items
======================================== */

const revealItems =

    document.querySelectorAll(
        ".items"
    );


/* ========================================
   IntersectionObserver

   画面内に入ったか監視
======================================== */

const revealObserver =

    new IntersectionObserver(

        function (
            entries,
            observer
        ) {

            entries.forEach(

                function (
                    entry
                ) {

                    /*
                        まだ画面内に
                        入っていない
                    */

                    if (
                        !entry.isIntersecting
                    ) {

                        return;

                    }


                    /*
                        表示
                    */

                    entry.target
                        .classList
                        .add(
                            "is-visible"
                        );


                    /*
                        一度表示したら
                        監視終了
                    */

                    observer.unobserve(
                        entry.target
                    );

                }

            );

        },

        {

            /*
                要素の15%が
                画面内に入ったら開始
            */

            threshold:
                0.15,


            /*
                画面下端より
                少し手前から開始
            */

            rootMargin:
                "0px 0px -60px 0px"

        }

    );


/* ========================================
   文字を監視
======================================== */

revealTextElements.forEach(

    function (
        element
    ) {

        revealObserver.observe(
            element
        );

    }

);


/* ========================================
   itemsを監視
======================================== */

revealItems.forEach(

    function (
        item
    ) {

        revealObserver.observe(
            item
        );

    }

);


/* ========================================
   タイトル再描画予約
======================================== */

let titleRedrawTimer;


function scheduleTitleRedraw() {

    clearTimeout(
        titleRedrawTimer
    );


    titleRedrawTimer =

        setTimeout(

            drawWorkTitle,

            60

        );

}


/* ========================================
   水Canvas
======================================== */

const waterCanvas =

    document.getElementById(
        "water-effect"
    );


const waterContext =

    waterCanvas

        ? waterCanvas.getContext(
            "2d"
        )

        : null;


/* ========================================
   水Canvasサイズ変更
======================================== */

function resizeWaterCanvas() {

    if (
        !waterCanvas ||

        !waterContext
    ) {

        return;

    }


    const pixelRatio =

        window.devicePixelRatio ||
        1;


    waterCanvas.width =

        Math.round(

            window.innerWidth *
            pixelRatio

        );


    waterCanvas.height =

        Math.round(

            window.innerHeight *
            pixelRatio

        );


    waterCanvas.style.width =

        window.innerWidth +
        "px";


    waterCanvas.style.height =

        window.innerHeight +
        "px";


    waterContext.setTransform(

        pixelRatio,

        0,

        0,

        pixelRatio,

        0,

        0

    );

}


/* ========================================
   ウィンドウサイズ変更
======================================== */

let resizeTimer;


window.addEventListener(

    "resize",

    function () {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =

            setTimeout(

                function () {

                    updateBackgroundByScroll();


                    drawWorkTitle();


                    resizeWaterCanvas();

                },

                150

            );

    }

);


/* ========================================
   ページ読み込み完了
======================================== */

window.addEventListener(

    "load",

    function () {

        /*
            最上部
        */

        resetInitialScrollPosition();


        /*
            最初の背景
        */

        updateBackgroundByScroll();


        /*
            作品集タイトル
        */

        drawWorkTitle();


        /*
            水Canvas
        */

        resizeWaterCanvas();


        /*
            Safari対策
        */

        requestAnimationFrame(

            function () {

                resetInitialScrollPosition();

            }

        );


        /*
            最初の1秒後に
            コンテンツ表示
        */

        setTimeout(

            function () {

                document.body
                    .classList
                    .remove(
                        "page-intro"
                    );


                document.body
                    .classList
                    .add(
                        "page-loaded"
                    );

            },

            1000

        );

    }

);


/* ========================================
   水Canvas初期化
======================================== */

resizeWaterCanvas();


/* ========================================
   波紋一覧
======================================== */

const waterRipples =
    [];


/* ========================================
   波紋作成
======================================== */

function createWaterRipple(
    x,
    y
) {

    /*
        最初の1秒間は
        波紋を出さない
    */

    if (
        !document.body
            .classList
            .contains(
                "page-loaded"
            )
    ) {

        return;

    }


    waterRipples.push({

        x:
            x,

        y:
            y,

        radius:
            4,

        opacity:
            0.65,

        speed:
            1,

        lineWidth:
            1.7

    });

}


/* ========================================
   波紋描画
======================================== */

function drawWaterRipples() {

    if (
        !waterContext
    ) {

        return;

    }


    waterContext.clearRect(

        0,

        0,

        window.innerWidth,

        window.innerHeight

    );


    for (
        let i =
            waterRipples.length -
            1;

        i >= 0;

        i--
    ) {

        const ripple =
            waterRipples[i];


        /*
            波を広げる
        */

        ripple.radius +=

            0.87 *
            ripple.speed;


        /*
            少しずつ消える
        */

        ripple.opacity -=
            0.018;


        /* ========================================
           外側の波
        ======================================== */

        waterContext.beginPath();


        waterContext.arc(

            ripple.x,

            ripple.y,

            ripple.radius,

            0,

            Math.PI *
            2

        );


        waterContext.strokeStyle =

            `rgba(
                130,
                205,
                255,
                ${Math.max(
                    ripple.opacity,
                    0
                )}
            )`;


        waterContext.lineWidth =
            ripple.lineWidth;


        waterContext.stroke();


        /* ========================================
           内側の薄い波
        ======================================== */

        if (
            ripple.radius >
            12
        ) {

            waterContext.beginPath();


            waterContext.arc(

                ripple.x,

                ripple.y,

                ripple.radius -
                9,

                0,

                Math.PI *
                2

            );


            waterContext.strokeStyle =

                `rgba(
                    220,
                    245,
                    255,
                    ${Math.max(
                        ripple.opacity * 0.45,
                        0
                    )}
                )`;


            waterContext.lineWidth =
                1;


            waterContext.stroke();

        }


        /*
            完全に消えた波を削除
        */

        if (
            ripple.opacity <=
            0
        ) {

            waterRipples.splice(

                i,

                1

            );

        }

    }


    requestAnimationFrame(
        drawWaterRipples
    );

}


/* ========================================
   波紋アニメーション開始
======================================== */

drawWaterRipples();


/* ========================================
   PC

   マウス移動時
======================================== */

let lastMouseRippleTime =
    0;


window.addEventListener(

    "pointermove",

    function (
        event
    ) {

        if (
            event.pointerType !==
            "mouse"
        ) {

            return;

        }


        const now =
            performance.now();


        /*
            波を出しすぎない
        */

        if (
            now -
            lastMouseRippleTime <
            45
        ) {

            return;

        }


        lastMouseRippleTime =
            now;


        createWaterRipple(

            event.clientX,

            event.clientY

        );

    }

);


/* ========================================
   スマートフォン・タブレット
======================================== */

let touchPressed =
    false;


let touchX =
    0;


let touchY =
    0;


let touchRippleTimer =
    null;


/* ========================================
   指を押した瞬間
======================================== */

window.addEventListener(

    "pointerdown",

    function (
        event
    ) {

        if (
            event.pointerType ===
            "mouse"
        ) {

            return;

        }


        touchPressed =
            true;


        touchX =
            event.clientX;


        touchY =
            event.clientY;


        createWaterRipple(

            touchX,

            touchY

        );


        /*
            既存タイマー停止
        */

        if (
            touchRippleTimer
        ) {

            clearInterval(
                touchRippleTimer
            );

        }


        /*
            押している間
            波紋を生成
        */

        touchRippleTimer =

            setInterval(

                function () {

                    if (
                        touchPressed
                    ) {

                        createWaterRipple(

                            touchX,

                            touchY

                        );

                    }

                },

                180

            );

    }

);


/* ========================================
   指を動かした
======================================== */

window.addEventListener(

    "pointermove",

    function (
        event
    ) {

        if (
            event.pointerType ===
            "mouse"
        ) {

            return;

        }


        if (
            !touchPressed
        ) {

            return;

        }


        touchX =
            event.clientX;


        touchY =
            event.clientY;

    }

);


/* ========================================
   指を離した
======================================== */

function stopTouchRipple() {

    touchPressed =
        false;


    if (
        touchRippleTimer
    ) {

        clearInterval(
            touchRippleTimer
        );


        touchRippleTimer =
            null;

    }

}


window.addEventListener(

    "pointerup",

    stopTouchRipple

);


window.addEventListener(

    "pointercancel",

    stopTouchRipple

);


/* ========================================
   BGMコントローラー
======================================== */

const pianoBgm =

    document.getElementById(
        "piano-bgm"
    );


const audioButton =

    document.getElementById(
        "audio-button"
    );


const audioStatus =

    document.getElementById(
        "audio-status"
    );


const iconMuted =

    document.getElementById(
        "icon-muted"
    );


const iconLow =

    document.getElementById(
        "icon-low"
    );


const iconNormal =

    document.getElementById(
        "icon-normal"
    );


/* ========================================
   音量状態

   0 = ミュート
   1 = 小音量
   2 = 通常音量
======================================== */

let audioMode =
    0;


/* ========================================
   音量設定
======================================== */

const lowVolume =
    0.65;


const normalVolume =
    1.00;


/* ========================================
   全アイコン非表示
======================================== */

function hideAudioIcons() {

    if (
        iconMuted
    ) {

        iconMuted
            .classList
            .remove(
                "active"
            );

    }


    if (
        iconLow
    ) {

        iconLow
            .classList
            .remove(
                "active"
            );

    }


    if (
        iconNormal
    ) {

        iconNormal
            .classList
            .remove(
                "active"
            );

    }

}


/* ========================================
   音量表示更新
======================================== */

function updateAudioController() {

    if (
        !pianoBgm ||

        !audioButton ||

        !audioStatus
    ) {

        return;

    }


    hideAudioIcons();


    /* ========================================
       ミュート
    ======================================== */

    if (
        audioMode ===
        0
    ) {

        if (
            iconMuted
        ) {

            iconMuted
                .classList
                .add(
                    "active"
                );

        }


        audioStatus.textContent =
            "ミュート";


        audioButton.setAttribute(

            "aria-label",

            "音楽を小音量で再生する"

        );


        audioButton.setAttribute(

            "title",

            "ミュート"

        );

    }


    /* ========================================
       小音量
    ======================================== */

    else if (
        audioMode ===
        1
    ) {

        if (
            iconLow
        ) {

            iconLow
                .classList
                .add(
                    "active"
                );

        }


        audioStatus.textContent =
            "小音量";


        audioButton.setAttribute(

            "aria-label",

            "通常音量に変更する"

        );


        audioButton.setAttribute(

            "title",

            "小音量"

        );

    }


    /* ========================================
       通常音量
    ======================================== */

    else {

        if (
            iconNormal
        ) {

            iconNormal
                .classList
                .add(
                    "active"
                );

        }


        audioStatus.textContent =
            "通常音量";


        audioButton.setAttribute(

            "aria-label",

            "音楽をミュートする"

        );


        audioButton.setAttribute(

            "title",

            "通常音量"

        );

    }

}


/* ========================================
   BGMボタン
======================================== */

if (
    pianoBgm &&

    audioButton
) {

    audioButton.addEventListener(

        "click",

        async function () {


            /* ========================================
               ミュート
               ↓
               小音量
            ======================================== */

            if (
                audioMode ===
                0
            ) {

                audioMode =
                    1;


                pianoBgm.currentTime =
                    0;


                pianoBgm.volume =
                    lowVolume;


                pianoBgm.muted =
                    false;


                try {

                    await pianoBgm.play();

                }


                catch (
                    error
                ) {

                    console.error(

                        "音楽を再生できませんでした:",

                        error

                    );


                    audioMode =
                        0;


                    pianoBgm.pause();


                    pianoBgm.muted =
                        true;

                }

            }


            /* ========================================
               小音量
               ↓
               通常音量
            ======================================== */

            else if (
                audioMode ===
                1
            ) {

                audioMode =
                    2;


                pianoBgm.volume =
                    normalVolume;


                pianoBgm.muted =
                    false;

            }


            /* ========================================
               通常音量
               ↓
               ミュート
            ======================================== */

            else {

                audioMode =
                    0;


                pianoBgm.pause();


                pianoBgm.muted =
                    true;

            }


            updateAudioController();

        }

    );


    /* ========================================
       曲が最後まで再生された
    ======================================== */

    pianoBgm.addEventListener(

        "ended",

        function () {

            audioMode =
                0;


            pianoBgm.currentTime =
                0;


            pianoBgm.muted =
                true;


            updateAudioController();

        }

    );


    /* ========================================
       BGM初期状態
    ======================================== */

    pianoBgm.pause();


    pianoBgm.muted =
        true;


    pianoBgm.volume =
        lowVolume;


    updateAudioController();

}


/* ========================================
   YouTube外部リンク確認
======================================== */

const youtubeLinks =

    document.querySelectorAll(
        ".youtube-link"
    );


youtubeLinks.forEach(

    function (
        link
    ) {

        link.addEventListener(

            "click",

            function (
                event
            ) {

                /*
                    通常のリンク移動を
                    一度停止
                */

                event.preventDefault();


                /*
                    YouTube URL
                */

                const youtubeUrl =
                    link.href;


                /*
                    PCかどうか判定

                    Hover可能
                    細かいポインター操作可能
                */

                const isDesktop =

                    window.matchMedia(

                        "(hover: hover) and (pointer: fine)"

                    ).matches;


                /* ========================================
                   パソコン
                ======================================== */

                if (
                    isDesktop
                ) {

                    const confirmed =

                        window.confirm(

                            "YouTube（外部サイト）を別タブで開きます。\n\nよろしいですか？"

                        );


                    if (
                        !confirmed
                    ) {

                        return;

                    }


                    window.open(

                        youtubeUrl,

                        "_blank",

                        "noopener,noreferrer"

                    );


                    return;

                }


                /* ========================================
                   スマートフォン・タブレット
                ======================================== */

                const confirmed =

                    window.confirm(

                        "YouTube（外部サイト）を開きます。\n\nよろしいですか？"

                    );


                if (
                    !confirmed
                ) {

                    return;

                }


                /*
                    同じ画面で
                    YouTubeへ移動
                */

                window.location.href =
                    youtubeUrl;

            }

        );

    }

);

/* ========================================
   Service Worker
======================================== */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(

        "load",

        function () {

            navigator
                .serviceWorker
                .register(

                    "./service-worker-v4.js",

                    {
                        updateViaCache:
                            "none"
                    }

                )

                .then(

                    function (
                        registration
                    ) {

                        console.log(
                            "✅ Service Worker 登録成功"
                        );


                        console.log(
                            "Scope:",
                            registration.scope
                        );


                        if (
                            registration.active
                        ) {

                            console.log(
                                "Active Service Worker:",
                                registration.active.scriptURL
                            );

                        }

                    }

                )

                .catch(

                    function (
                        error
                    ) {

                        console.error(
                            "❌ Service Worker 登録失敗",
                            error
                        );

                    }

                );

        }

    );

}