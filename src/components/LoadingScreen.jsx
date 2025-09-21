import React from "react";

function LoadingScreen({ message, error }) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: "100vh", backgroundColor: "#0a192f", color: "white" }}
    >
      <h3 className="h4 mb-3">{message}</h3>
      {error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <div
          className="spinner-border text-coral"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      )}
    </div>
  );
}

export default LoadingScreen;
