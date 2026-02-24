from flask import Flask, request, jsonify
from flask_cors import CORS
from translator import translate_text, get_all_languages, detect_language
from db import save_translation, get_history

app = Flask(__name__)
CORS(app)

@app.route("/languages", methods=["GET"])
def languages():
    return jsonify(get_all_languages())

@app.route("/detect-language", methods=["POST"])
def detect_lang():
    data = request.json
    text = data.get("text", "")
    
    if not text or len(text.strip()) < 3:
        return jsonify({"detected_language": None, "confidence": 0})
    
    detected_lang = detect_language(text)
    return jsonify({"detected_language": detected_lang})

@app.route("/translate", methods=["POST"])
def translate():
    data = request.json
    
    text = data.get("text")
    src_lang = data.get("src_lang")
    tgt_lang = data.get("tgt_lang")
    
    result = translate_text(text, src_lang, tgt_lang)

    save_translation({
        "text": text,
        "translated_text": result,
        "src_lang": src_lang,
        "tgt_lang": tgt_lang
    })
    
    return jsonify({"translated_text": result})


@app.route("/history", methods=["GET"])
def history():
    return jsonify(get_history())


if __name__ == "__main__":
    app.run(debug=True)