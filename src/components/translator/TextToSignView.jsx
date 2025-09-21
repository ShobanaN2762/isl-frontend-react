import React, { useState, useRef, useEffect, useCallback } from "react";

function TextToSignView() {
  const [text, setText] = useState("");
  // 1. Initialize videoSrc with null instead of an empty string
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoStatus, setVideoStatus] = useState("idle");
  const videoRef = useRef(null);

  const suggestions = [
    "Good Morning",
    "Thank You",
    "What Is Your Name",
    "I don't know",
    "I know",
    "I don't understand",
    "I understand",
  ];

  // --- 1. Wrap handleTranslate in useCallback ---
  // This function now only gets recreated when 'text' changes.
  const handleTranslate = useCallback(() => {
    if (!text.trim()) return;
    setVideoStatus("loading");
    const formattedText = text.trim().toLowerCase().replace(/ /g, "_");
    setVideoSrc(`/videos/sentences/${formattedText}.mp4`);
  }, [text]);

  const handleClear = () => {
    setText("");
    // 2. Set videoSrc back to null on clear
    setVideoSrc(null);
    setVideoStatus("idle");
  };

  const handleSuggestionClick = (suggestion) => {
    setText(suggestion);
  };

  useEffect(() => {
    if (!text.trim()) {
      handleClear();
      return;
    }
    const handler = setTimeout(() => {
      handleTranslate();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [text, handleTranslate]);

  return (
    <div className="row g-4">
      <div className="col-md-6">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h5 className="card-title">Enter Text</h5>
            <textarea
              id="text-input"
              className="form-control mb-2"
              rows="6"
              maxLength="500"
              placeholder="e.g., Good Morning"
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
            <div className="text-end small text-muted">{text.length}/500</div>
            <div className="mt-2">
              <small className="text-muted">Suggestions:</small>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {suggestions.map((s) => (
                  <span
                    key={s}
                    className="badge bg-light text-dark border suggestion-item cursor-pointer"
                    onClick={() => handleSuggestionClick(s)}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3 d-flex flex-wrap gap-2">
              <button
                onClick={handleTranslate}
                className="btn btn-success"
                disabled={!text.trim() || videoStatus === "loading"}
              >
                {videoStatus === "loading" ? "Loading..." : "Translate"}
              </button>
              <button onClick={handleClear} className="btn btn-secondary">
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h5 className="card-title">ISL Video Preview</h5>
            <div
              id="sign-display"
              className="bg-dark text-white d-flex align-items-center justify-content-center text-center rounded"
              style={{ aspectRatio: "16 / 9" }}
            >
              {videoStatus === "idle" && (
                <div>
                  <i className="fa-solid fa-hands-asl-interpreting fs-2 mb-2"></i>
                  <p>Sign animations will appear here</p>
                </div>
              )}
              {videoStatus === "loading" && (
                <div>
                  <div className="spinner-border" role="status"></div>
                  <p className="mt-2">Loading...</p>
                </div>
              )}
              {videoStatus === "error" && (
                <div>
                  <i className="fa-solid fa-circle-exclamation fs-2 text-warning"></i>
                  <p className="mt-2">
                    Sorry, a video for that phrase was not found.
                  </p>
                </div>
              )}
              <video
                ref={videoRef}
                src={videoSrc}
                className={`img-fluid ${
                  videoStatus === "playing" ? "" : "d-none"
                }`}
                controls
                autoPlay
                muted
                onCanPlay={() => setVideoStatus("playing")}
                onError={() => setVideoStatus("error")}
              ></video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextToSignView;
