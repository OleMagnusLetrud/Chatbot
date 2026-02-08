import { useState } from "react";

function App() {
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");
  const [figure, setFigure] = useState("");

  async function testAPI() {
    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          figure: figure,
          message: message
        }),
      });

      const data = await res.json();
      setResponse(data.reply);
    } catch (err) {
      setResponse("Error: Could not reach backend");
    }
  }

  return (
    <div>
      <h2>API TEST RQ</h2>
     <button onClick={() => setFigure("napoleon")}>napoleon</button>
     <button onClick={() => setFigure("cleopatra")}>cleopatra</button>
     <button onClick={() => setFigure("caesar")}>caesar</button>


      <input type="text"
      placeholder="Ask napoleon something"
      value={message}
      onChange={(e)=> setMessage(e.target.value)} />
      <button onClick={testAPI}>SEND</button>
      <p>{response}</p>
    </div>
  );
}

export default App;
