from flask import Flask, render_template


# ========================================
# Flaskアプリを作成
# ========================================

app = Flask(__name__)


# ========================================
# トップページ
# ========================================

@app.route("/")
def index():

    # ========================================
    # 記事データ
    # ========================================

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


    # ========================================
    # index.htmlへ記事データを渡す
    # ========================================

    return render_template(
        "index.html",
        articles=articles
    )


# ========================================
# Flask起動
# ========================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )