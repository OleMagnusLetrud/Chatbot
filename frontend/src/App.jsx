import { useState } from "react";
import "./index.css";

function App() {
  const [sessionId] = useState(crypto.randomUUID());
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");
  const [figure, setFigure] = useState("");

  const handleKeypress = e => {
    if (e.keyCode === 13) {
      testAPI();
    }
  };

  async function testAPI() {
    if (!figure) {
    setResponse("Please select a historical figure.");
    return;
  }

  if (!message.trim()) {
    setResponse("Please enter a message.");
    return;
  }
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
      setResponse(data.reply);
      setMessage("");
    } catch (err) {
      setResponse("Error: Could not reach backend");
    }
  }

   return (
    <>
    <div className="app-container">
      <h2>Historic chatbot</h2>

      <div className="button-row">
        <button onClick={() => setFigure("napoleon")}>Napoleon</button>
        <button onClick={() => setFigure("cleopatra")}>Cleopatra</button>
        <button onClick={() => setFigure("caesar")}>Caesar</button>
      </div>

    </div>
    <div className="app-container2">
       <div className="response">
        <p>{response}</p>
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder={`Ask ${figure || "someone"} something`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeypress}
          />
        <button onClick={testAPI}>SEND</button>
      </div>
    </div>
    </>
  );
}

export default App;
