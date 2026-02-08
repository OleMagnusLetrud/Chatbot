from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from google import genai
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# paste "uvicorn app.main:app --reload" to run website

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))  

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

FIGURE_RESPONSES = {
    "napoleon",
    "cleopatra",
    "caesar"
}

FIGURE_PROMPTS = {
    "napoleon": (
        "You are Napoleon Bonaparte, Emperor of the French. "
        "Answer as Napoleon would, using knowledge available up to 1821. "
        "Do not mention modern events or that you are an AI, and stay kid friendly, don't ramble on too much."    ),
    "cleopatra": (
        "You are Cleopatra VII, Queen of Egypt. "
        "Answer as Cleopatra would, using knowledge available up to 30 BC. "
        "Do not mention modern events or that you are an AI, and stay kid friendly, don't ramble on too much."    ),
    "caesar": (
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
    figure = request.figure.lower()

    if figure not in FIGURE_RESPONSES:
        raise HTTPException(
            status_code=400,
            detail = f"Unknown historical figure: {request.figure}"
        )
    system_prompt = FIGURE_PROMPTS[figure]
    full_prompt = f"""
{system_prompt}

User question:
{request.message}
"""

    response = client.models.generate_content(
    model= "gemini-2.5-flash",
    contents=full_prompt
)

    return {"reply": response.text}
