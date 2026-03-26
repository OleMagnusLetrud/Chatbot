import sqlite3
from datetime import datetime

DB_PATH = "chat_history.db"

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            figure     TEXT NOT NULL,
            role       TEXT NOT NULL,
            text       TEXT NOT NULL,
            timestamp  DATETIME DEFAULT CURRENT_TIMESTAMP
        )          
    """)
    conn.commit()
    conn.close()

def save_message(session_id: str, figure: str, role: str, text: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (session_id, figure, role, text) VALUES (?, ?, ?, ?)",
        (session_id, figure, role, text)
    )
    conn.commit()
    conn.close()

def load_messages(session_id: str) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT role, text FROM messages WHERE session_id = ? ORDER BY timestamp ASC",
        (session_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [{"role": row[0], "text": row[1]} for row in rows]