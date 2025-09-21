// src/components/learning/FeedbackModal.jsx

import React from "react";

// This component uses simple Bootstrap classes for the modal. No external library needed.
function FeedbackModal({ show, onHide, result, expectedSign }) {
  if (!show || !result) {
    return null;
  }

  const CONFIDENCE_THRESHOLD = 0.3;
  const { predictedWord, confidence } = result;
  const confidencePct = (confidence * 100).toFixed(1);
  const isCorrect =
    predictedWord?.toLowerCase() === expectedSign?.toLowerCase();

  let title, message, iconClass, barClass;

  if (confidence < CONFIDENCE_THRESHOLD) {
    title = "Could you try that again?";
    message =
      "I'm not confident enough in my prediction. Please try performing the sign again, ensuring you are clearly in the frame.";
    iconClass = "text-warning";
    barClass = "bg-warning";
  } else if (isCorrect) {
    title = "Excellent!";
    message = `You correctly signed <strong>"${expectedSign}"</strong>. Keep up the great work!`;
    iconClass = "text-success";
    barClass = "bg-success";
  } else {
    title = "Almost There!";
    message = `I detected <strong>"${predictedWord}"</strong>, but was expecting <strong>"${expectedSign}"</strong>. Let's try that again!`;
    iconClass = "text-danger";
    barClass = "bg-danger";
  }

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title" id="feedback-title">
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
            ></button>
          </div>
          <div className="modal-body text-center">
            <div className={`fs-1 mb-3 ${iconClass}`}>
              {/* Placeholder for an icon, you can add one here */}
            </div>
            <p
              id="feedback-message"
              dangerouslySetInnerHTML={{ __html: message }}
            ></p>
            <div className="progress mt-4">
              <div
                className={`progress-bar ${barClass}`}
                style={{ width: `${confidencePct}%` }}
              >
                {confidencePct}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;
