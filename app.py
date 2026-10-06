from flask import (
    Flask,
    render_template,
    jsonify,
    send_from_directory
)

# ========================================
# Flaskアプリを作成
# ========================================

app = Flask(__name__)


# ========================================
# バージョン情報
# ========================================

APP_VERSION = "2026.10.07.3"

# CSS / JavaScript のキャッシュ更新用
ASSET_VERSION = APP_VERSION

# Service Worker
SERVICE_WORKER_VERSION = "v4"


# ========================================
# 全テンプレートへ
# バージョン情報を自動で渡す
# ========================================

@app.context_processor
def inject_version():

    return {

        "app_version":
            APP_VERSION,

        "asset_version":
            ASSET_VERSION,

        "service_worker_version":
            SERVICE_WORKER_VERSION

    }

# ========================================
# PWA Manifest
# ========================================

@app.route("/manifest.json")
def pwa_manifest():

    return send_from_directory(

        app.root_path,

        "manifest.json",

        mimetype=
            "application/manifest+json"

    )


# ========================================
# Service Worker
# ========================================

@app.route("/service-worker-v4.js")
def service_worker():

    response = send_from_directory(

        app.root_path,

        "service-worker-v4.js",

        mimetype=
            "application/javascript"

    )


    # Service Worker本体を
    # 古いキャッシュから取得しにくくする
    response.headers[
        "Cache-Control"
    ] = "no-cache"


    return response


# ========================================
# バージョン確認用API
# ========================================

@app.route("/version")
def version():

    return jsonify({

        "app_version":
            APP_VERSION,

        "asset_version":
            ASSET_VERSION,

        "service_worker_version":
            SERVICE_WORKER_VERSION

    })


# ========================================
# トップページ
# ========================================

@app.route("/")
def index():

    articles = [

        {
            "playStyle": "ピアノソロ",
            "text": "内声が美しいアレンジです",
            "image": "images/tn_0.webp",
            "url": "https://youtu.be/iRgUJKuDuZE"
        },

        {
            "playStyle": "ピアノソロ",
            "text": "テンポ感がよく堂々としたアレンジです",
            "image": "images/tn_1.jpg",
            "url": "https://youtu.be/8uuDAclg654"
        },

        {
            "playStyle": "ピアノソロ",
            "text": "最初はシンプルでラストが迫力あるアレンジに仕上げました",
            "image": "images/tn_2.jpg",
            "url": "https://youtu.be/JThn0uH_pDQ"
        },

        {
            "playStyle": "ピアノソロ",
            "text": "シンプルかつ迫力がありながら美しさも残したアレンジに仕上げました",
            "image": "images/tn_3.webp",
            "url": "https://youtu.be/X9r3feLzLhg"
        },

    ]


    return render_template(

        "index.html",

        articles=articles

    )


# ========================================
# Flask起動
# ========================================

if __name__ == "__main__":

    print(
        "========================================"
    )

    print(
        "Redder Piano"
    )

    print(
        f"APP VERSION   : {APP_VERSION}"
    )

    print(
        f"ASSET VERSION : {ASSET_VERSION}"
    )

    print(
        f"SERVICE WORKER: {SERVICE_WORKER_VERSION}"
    )

    print(
        "========================================"
    )


    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )