import { useState } from "react";

function App() {
  const [response, setResponse] = useState("");

  async function testAPI() {
    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          figure: "napoleon",
          message: "What is your greatest victory?"
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
      <h2>API TEST RQ napoleon</h2>
      <button onClick={testAPI}>What is your greatest victory?</button>
      <p>{response}</p>
    </div>
  );
}

export default App;
