import os
from dotenv import load_dotenv
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import OpenAI

# Load environment variables from .env
load_dotenv()

app = FastAPI(title="Secure AI Chat (Backend Minimal Test)")

# Allow frontend dev server to talk to backend (we'll use localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in real prod, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/chat")
async def chat(message: str = Form(...)):
    """
    Simple text-only chat endpoint to test OpenAI + FastAPI.
    """
    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant in a secure chat app."},
                {"role": "user", "content": message},
            ],
        )
        reply = completion.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Chat failed: {str(e)}"}
        )
