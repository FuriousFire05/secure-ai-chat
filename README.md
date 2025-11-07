# 🧠 Secure AI Chat  
### Privacy-Preserving AI Assistant with PII Detection & Redaction  

A full-stack **Flask + React** app that detects and redacts sensitive data (PII) from images before sending them to an AI model.  
Built for hackathons and real-world privacy use-cases — your data is scrubbed **before** it reaches AI systems.  

---

## 🚀 Features  
- 🧩 **Text & Image Chat:** Talk to the AI or send screenshots/documents.  
- 🔍 **Automatic PII Detection (OCR + Regex):** Detects emails, phone numbers, and names.  
- 🕵️ **Selective Redaction:** Choose what to hide before sending.  
- 🧾 **Simulated AI Mode:** Works offline / without an API key (auto-switches when real key added).  
- 💬 **Local Chat History:** Stored safely in your browser.  
- 📤 **Export Chat:** One-click export as `.md`.  
- 🧰 **Clean UI:** Fast, minimal React interface with banners and loading states.  

---

## 🧱 Tech Stack  

| Layer | Tools |
|-------|-------|
| **Frontend** | React + Vite + Tailwind CSS |
| **Backend** | Flask (Python), Pillow, pytesseract |
| **AI Integration** | OpenAI GPT-4o (auto-fallback to simulation) |
| **OCR Engine** | Tesseract-OCR |
| **Environment** | Conda (Python) + npm (Node) |

---

## ⚙️ Setup Instructions  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/<your-username>/secure-ai-chat.git
cd secure-ai-chat
```

### 2️⃣ Backend (Flask) 
```bash
cd server
conda create -n secure-ai-chat-backend python=3.11 -y
conda activate secure-ai-chat-backend
pip install -r requirements.txt
```

### 3️⃣ Install Tesseract OCR (Windows)

1. Download → https://github.com/UB-Mannheim/tesseract/wiki 
2. Confirm this path exists:
```bash
C:\Program Files\Tesseract-OCR\tesseract.exe
```
3. If installed elsewhere, update in server/main.py: 
```bash
pytesseract.pytesseract.tesseract_cmd = r"<your-tesseract-path>"
``` 

### 4️⃣ Environment Variables

Create server/.env:
```bash
OPENAI_API_KEY=your-real-key-here
``` 
Leave blank → runs in simulated mode until real key available.

### 5️⃣ Run Backend
```bash
python main.py
``` 
Flask runs at 👉 http://127.0.0.1:8000

### 6️⃣ Frontend (React)
```bash
cd client
npm install
npm run dev
```
Vite runs at 👉 http://localhost:5173

---

## 💻 How It Works

**1.** Upload an image with text (e.g., ID card / document / screenshot).
**2.** Backend extracts text using Tesseract OCR.
**3.** Regex detects emails, phones, names, etc.
**4.** You select which items to redact.
**5.** Redacted image (black boxes) is generated locally.
**6.** Sent to AI (simulated until real key available).
**7.** AI replies while keeping your data private.

---

## 🎥 1-Minute Demo Script

- 👤 **You:** “This is Secure AI Chat, a privacy-first assistant that detects and redacts sensitive info before processing.”
- 1️⃣ Upload an image → see detected PII on the right.
- 2️⃣ Select items → click **Redact & Send.**
- 3️⃣ Show the black-boxed redacted preview.
- 4️⃣ Explain: “This ensures no private data ever reaches the AI.”
- 5️⃣ Send a text → see simulated AI reply.

#### 🎯 **Wrap up:**

“When the official API key is added, the same workflow runs with GPT-4o — keeping privacy fully intact.”

---

## 🧾 Folder Structure
```bash
secure-ai-chat/
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── api.js
│   │   └── index.css
│   └── package.json
│
├── server/                 # Flask backend
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

## 🧰 Future Enhancements

- Real-time highlighting of PII on image preview
- Support for IBAN / credit card / address detection
- Docker + CI/CD deployment
- End-to-end upload encryption

---

## 🏁 Hackathon Summary

- **Goal:** Build a secure AI chat system where data is sanitized before AI processing.
- **Deliverables:** Full stack prototype + README + Demo.
- **Impact:** Privacy-first AI — preventing accidental data leaks and enabling ethical AI use.

---

## 📦 Deployment & Submission
```bash
git add .
git commit -m "Final hackathon submission: Secure AI Chat"
git push origin main
```

💬 GitHub Repo Description:
Privacy-first AI assistant that detects and redacts sensitive data before sending to GPT-4o (Flask + React + Tesseract-OCR).

---

## 🧩 Developed by Thanika Natarajan

🔥 **Hackathon Project:** Secure AI Chat
🏆 Empowering safe and private AI interactions