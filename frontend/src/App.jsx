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
//Thank you too my girlfreind for drwaing the historic figures<3
   return (
    <>
    <div className="page_wrapper">
      <div className="app-container">
        <h2>Historic chatbot</h2>
        <h3>Choose the historic figure you want to talk to</h3>
        <div className="button-row">
          <div className="img_buttons">
            <img src="/images/napoleon_art.png" alt="napoleon.png" />
            <button onClick={() => changeFigure("Napoleon")}>Napoleon</button>
          </div>
          <div className="img_buttons"> 
            <img src="/images/cleopatra_art.png" alt="cleopatra.png" />
            <button onClick={() => changeFigure("Cleopatra")}>Cleopatra</button>
          </div>
          <div className="img_buttons">
            <img src="/images/ceasar_art.png" alt="ceasar.png"/>
            <button onClick={() => changeFigure("Caesar")}>Caesar</button>
          </div>
        </div>
      </div>
      <div className="app-container2">
        <div className="response">
          {chat.map((msg, index) => (
            <div key={index} className={`message ${msg.role ==="user"? "message-user" : "message-bot"}`}>
              <strong>
                {msg.role === "user" ? "You" : figure}:
              </strong>{" "}
              {msg.text}
            </div>
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
          <button onClick={testAPI} disabled={loading} className="send_button">
            {loading ? "..." : "SEND"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;
