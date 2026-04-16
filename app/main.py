from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from google import genai
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, save_message, load_messages

# paste ".\venv\Scripts\Activate.ps1" "uvicorn app.main:app --reload" to run website

init_db()
load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))  
conversations = {}
chat_lists = {}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest (BaseModel):
    figure: str
    message: str
    session_id: str

FIGURE_PROMPTS = {
    "Napoleon": (
        "You are Napoleon Bonaparte, Emperor of the French. "
        "Answer as Napoleon would, using knowledge available up to 1821. "
        "Do not mention modern events or that you are an AI, and stay kid friendly, don't ramble on too much."    ),
    "Cleopatra": (
        "You are Cleopatra VII, Queen of Egypt. "
        "Answer as Cleopatra would, using knowledge available up to 30 BC. "
        "Do not mention modern events or that you are an AI, and stay kid friendly, don't ramble on too much."    ),
    "Caesar": (
        "You are Gaius Julius Caesar. "
        "Answer as Caesar would, using knowledge available up to 44 BC. "
        "Do not mention modern events or that you are an AI, and stay kid friendly, don't ramble on too much."
    )
}

@app.get("/ping")
def ping():
    return {"status":"ok"}

@app.post("/chat")
def chat(request: ChatRequest):
    global chat_lists
    global conversations
    session_id = request.session_id
    figure = request.figure.capitalize()

    if figure not in FIGURE_PROMPTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown historical figure: {request.figure}"
        )

    if session_id not in conversations:
        past = load_messages(session_id)
        if past:
            history = FIGURE_PROMPTS[figure] + "\n\nConversation:\n"
            for msg in past:
                prefix = "User" if msg["role"] == "user" else figure
                history += f"{prefix}: {msg['text']}\n"
            conversations[session_id] = history
            chat_lists[session_id] = past
        else:
            conversations[session_id] = FIGURE_PROMPTS[figure] + "\n\nConversation:\n"
            chat_lists[session_id] = []

    history = conversations[session_id]
    session_chat = chat_lists[session_id]

    history += f"User: {request.message}\n"
    session_chat.append({
        "role": "user",
        "text": request.message
    })
    save_message(session_id, figure, "user", request.message)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=history,
        )
        reply = response.text
    except Exception as e:
        print(f"AI ERROR: {e}")
        reply = "AI error or quota exceeded."

    history += f"{figure.capitalize()}: {reply}\n"
    session_chat.append({
        "role": "bot",
        "text": reply
    })
    save_message(session_id, figure, "bot", reply)

    conversations[session_id] = history

    return {
        "reply": reply,
        "chat": session_chat
}
@app.get("/sessions")
def get_all_sessions():
    return get_sessions()

@app.get("/sessions/{session_id}")
def get_sessions(session_id: str):
    messages = load_messages(session_id)
    return {"chat": messages}