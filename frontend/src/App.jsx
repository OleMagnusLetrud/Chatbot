import { useState, useRef, useEffect } from "react";
import "./index.css";

function App() {
  const [sessionId, setSessionID] = useState(crypto.randomUUID());
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");
  const [figure, setFigure] = useState("");
  const [chat, setChat] = useState([])
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const handleKeypress = e => {
    if (e.keyCode === 13) {
      testAPI();
    }
  };
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);
  
  function changeFigure(newFigure){
    setFigure(newFigure);
    
    setSessionID(crypto.randomUUID());

    setChat([]);
    setResponse("");
    setMessage("");
    
  }

  async function testAPI() {
    if (!figure) {
    setResponse("Please select a historical figure.");
    return;
  }

  if (!message.trim()) {
    setResponse("Please enter a message.");
    return;
  }
   const userText = message;
    setMessage("");

    setChat((prev) => [
      ...prev,
      { role: "user", text: userText }
    ]);
    
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          figure: figure,
          message: message,
          session_id: sessionId,
        }),
      });

      const data = await res.json();
      setChat(data.chat);
      setLoading(false);
      } catch (err) {
        setLoading(false);
        setChat((prev) => [
          ...prev,
          { role: "bot", text: "Error: Could not reach backend" }
        ]);
      }
  }

   return (
    <>
    <div className="app-container">
      <h2>Historic chatbot</h2>
      <h3>Chose the historic figure you want to talk</h3>
      <div className="button-row">
        <button onClick={() => changeFigure("napoleon")}>Napoleon</button>
        <button onClick={() => changeFigure("cleopatra")}>Cleopatra</button>
        <button onClick={() => changeFigure("caesar")}>Caesar</button>
      </div>

    </div>
    <div className="app-container2">
       <div className="response">
        {chat.map((msg, index) => (
          <p key={index}>
            <strong>
              {msg.role === "user" ? "you" : figure}:
            </strong>{" "}
            {msg.text}
          </p>
          ))} 
          {loading && (
        <p>
          <strong>{figure}:</strong> <em>thinking...</em>
        </p>
)}
          <div ref={bottomRef} />
        </div>
      <div className="input-area">
        <input
          type="text"
          placeholder={`Ask ${figure || "someone"} something`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeypress}
          />
        <button onClick={testAPI} disabled={loading}>
          {loading ? "..." : "SEND"}
        </button>
      </div>
    </div>
    </>
  );
}

export default App;
