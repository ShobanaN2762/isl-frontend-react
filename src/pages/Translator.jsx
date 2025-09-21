import React, { useState } from "react";
import TextToSignView from "../components/translator/TextToSignView";
// We will create and import SignToTextView in the next step
// import SignToTextView from '../components/translator/SignToTextView';

function TranslatorPage() {
  const [mode, setMode] = useState("text-to-sign"); // 'text-to-sign' or 'sign-to-text'

  return (
    <div className="container py-5">
      {/* Mode Switcher Buttons */}
      <div className="d-flex justify-content-center mb-4">
        <div
          className="bg-navy p-1 rounded d-flex gap-2"
          style={{ maxWidth: "400px", width: "100%" }}
        >
          <button
            className={`btn rounded flex-fill px-4 py-2 ${
              mode === "text-to-sign" ? "btn-coral" : "btn-outline-light"
            }`}
            onClick={() => setMode("text-to-sign")}
          >
            Text to Sign
          </button>
          <button
            className={`btn rounded flex-fill px-4 py-2 ${
              mode === "sign-to-text" ? "btn-coral" : "btn-outline-light"
            }`}
            onClick={() => setMode("sign-to-text")}
          >
            Sign to Text
          </button>
        </div>
      </div>

      {/* Conditionally render the correct view based on the mode */}
      {mode === "text-to-sign" ? (
        <TextToSignView />
      ) : (
        // This will be the SignToTextView component in the next step
        <div className="text-center p-5 bg-white rounded shadow border">
          <h3 className="text-navy">Sign to Text (Coming Soon)</h3>
        </div>
      )}
    </div>
  );
}

export default TranslatorPage;
