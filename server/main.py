import base64
import io
import json
import os
import re
from typing import List, Dict, Any

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageDraw
import pytesseract
from openai import OpenAI

# Load environment variables from .env
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app)  # allow all origins for dev; tighten later if needed

# --- PII patterns (you can tweak later) ---
PII_PATTERNS = {
    "email": r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
    "phone": r"(\+?\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}",
    "name": r"\b[A-Z][a-z]+ [A-Z][a-z]+\b",
}


@app.get("/api/health")
def health() -> Any:
    return jsonify({"status": "ok"})


# ---------- TEXT-ONLY CHAT ----------

@app.post("/api/chat")
def chat() -> Any:
    message = request.form.get("message", "")
    if not message:
        return jsonify({"error": "message is required"}), 400

    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant in a secure chat app."},
                {"role": "user", "content": message},
            ],
        )
        reply = completion.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as e:
        # 👇 NEW: log error in terminal and send message back
        print("ERROR in /api/chat:", repr(e))
        return jsonify({"error": f"Chat failed: {e}"}), 500



# ---------- PII DETECTION (OCR) ----------

@app.post("/api/pii/detect")
def detect_pii() -> Any:
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "file is required"}), 400

    try:
        img = Image.open(file.stream).convert("RGB")
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)

        items: List[Dict[str, Any]] = []
        full_text_parts: List[str] = []

        n_boxes = len(data["text"])
        for i in range(n_boxes):
            word = (data["text"][i] or "").strip()
            if not word:
                continue

            full_text_parts.append(word)

            x = int(data["left"][i])
            y = int(data["top"][i])
            w = int(data["width"][i])
            h = int(data["height"][i])

            for pii_type, pattern in PII_PATTERNS.items():
                if re.fullmatch(pattern, word):
                    items.append(
                        {
                            "id": i,  # index for later
                            "type": pii_type,
                            "text": word,
                            "bbox": {"left": x, "top": y, "width": w, "height": h},
                        }
                    )

        return jsonify(
            {
                "text": " ".join(full_text_parts),
                "items": items,
                "count": len(items),
            }
        )
    except Exception as e:
        return jsonify({"error": f"PII detection failed: {str(e)}"}), 500


# ---------- REDACT + CHAT WITH IMAGE ----------

@app.post("/api/pii/redact-and-chat")
def redact_and_chat() -> Any:
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "file is required"}), 400

    message = request.form.get("message", "") or "Analyze this redacted image."
    selected_ids_raw = request.form.get("selected_ids", "[]")

    try:
        selected_ids: List[int] = json.loads(selected_ids_raw)
    except json.JSONDecodeError:
        selected_ids = []

    try:
        img = Image.open(file.stream).convert("RGB")
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        draw = ImageDraw.Draw(img)

        id_set = set(selected_ids)

        n_boxes = len(data["text"])
        for i in range(n_boxes):
            if i in id_set:
                x = int(data["left"][i])
                y = int(data["top"][i])
                w = int(data["width"][i])
                h = int(data["height"][i])
                draw.rectangle([(x, y), (x + w, y + h)], fill="black")

        # Encode redacted image as base64
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        b64_img = base64.b64encode(buf.read()).decode("utf-8")
        data_url = f"data:image/png;base64,{b64_img}"

        # Send to OpenAI
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": message},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
        )
        reply = completion.choices[0].message.content

        return jsonify(
            {
                "reply": reply,
                "redacted_image_base64": b64_img,
            }
        )

    except Exception as e:
        return jsonify({"error": f"Redaction or AI call failed: {str(e)}"}), 500


if __name__ == "__main__":
    # Run Flask dev server on port 8000 to match frontend baseURL
    app.run(host="0.0.0.0", port=8000, debug=True)
