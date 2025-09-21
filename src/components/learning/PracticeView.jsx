import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAI } from "../../context/AIContext";
import FeedbackModal from "./FeedbackModal";

const tf = window.tf;
const drawConnectors = window.drawConnectors;
const drawLandmarks = window.drawLandmarks;
const HAND_CONNECTIONS = window.HAND_CONNECTIONS;
const POSE_CONNECTIONS = window.POSE_CONNECTIONS;
const DYNAMIC_SEQUENCE_LENGTH = 45;

const extractStaticFeatures = (results) => {
  const HAND_PAD = Array(63).fill(0);
  const right = results.rightHandLandmarks
    ? results.rightHandLandmarks.flatMap((lm) => [lm.x, lm.y, lm.z])
    : HAND_PAD.slice();
  const left = results.leftHandLandmarks
    ? results.leftHandLandmarks.flatMap((lm) => [lm.x, lm.y, lm.z])
    : HAND_PAD.slice();
  return [...right, ...left];
};

const extractDynamicFeatures = (results) => {
  const posePad = Array(33 * 4).fill(0);
  const handPad = Array(21 * 3).fill(0);
  const pose = results.poseLandmarks
    ? results.poseLandmarks.flatMap((lm) => [lm.x, lm.y, lm.z, lm.visibility])
    : posePad;
  const lh = results.leftHandLandmarks
    ? results.leftHandLandmarks.flatMap((lm) => [lm.x, lm.y, lm.z])
    : handPad;
  const rh = results.rightHandLandmarks
    ? results.rightHandLandmarks.flatMap((lm) => [lm.x, lm.y, lm.z])
    : handPad;
  return [...pose, ...lh, ...rh];
};

function PracticeView({ sign, onExit }) {
  const { models, labels, holistic, isAIReady, error: aiError } = useAI();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const lastDetection = useRef(null);
  const keypointSequence = useRef([]);

  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [feedback, setFeedback] = useState("Enable your camera to begin.");
  const [stream, setStream] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState(null);

  const handleDynamicPrediction = useCallback(async () => {
    const dynamicModel = models.dynamic;
    if (
      !dynamicModel ||
      keypointSequence.current.length < DYNAMIC_SEQUENCE_LENGTH
    )
      return;

    setFeedback("Analyzing your recording...");
    const result = tf.tidy(() => {
      const sequence = keypointSequence.current.slice(-DYNAMIC_SEQUENCE_LENGTH);
      const inputTensor = tf.tensor([sequence]);
      const prediction = dynamicModel.predict(inputTensor);
      const probabilities = prediction.dataSync();
      const predictedIndex = prediction.as1D().argMax().dataSync()[0];
      return {
        predictedWord: labels.dynamic[predictedIndex],
        confidence: probabilities[predictedIndex],
      };
    });

    setFeedbackResult(result);
    setShowFeedbackModal(true);
    keypointSequence.current = [];
  }, [models.dynamic, labels.dynamic]);

  const onResults = useCallback(
    (results) => {
      lastDetection.current = results;
      const canvasCtx = canvasRef.current.getContext("2d");
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      if (results.poseLandmarks)
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "#00CC00",
          lineWidth: 2,
        });
      if (results.leftHandLandmarks) {
        drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
          color: "#CC0000",
          lineWidth: 3,
        });
        drawLandmarks(canvasCtx, results.leftHandLandmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });
      }
      if (results.rightHandLandmarks) {
        drawConnectors(
          canvasCtx,
          results.rightHandLandmarks,
          HAND_CONNECTIONS,
          { color: "#00CC00", lineWidth: 3 }
        );
        drawLandmarks(canvasCtx, results.rightHandLandmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });
      }

      if (isRecording) {
        keypointSequence.current.push(extractDynamicFeatures(results));
        const currentProgress =
          (keypointSequence.current.length / DYNAMIC_SEQUENCE_LENGTH) * 100;
        setProgress(currentProgress);

        if (keypointSequence.current.length >= DYNAMIC_SEQUENCE_LENGTH) {
          setIsRecording(false);
          setProgress(0);
          handleDynamicPrediction();
        }
      }
    },
    [isRecording, handleDynamicPrediction]
  );

  useEffect(() => {
    if (holistic) {
      holistic.onResults(onResults);
    }
  }, [holistic, onResults]);

  const detectionLoop = useCallback(async () => {
    if (videoRef.current && videoRef.current.readyState >= 3 && holistic) {
      await holistic.send({ image: videoRef.current });
    }
    animationFrameId.current = requestAnimationFrame(detectionLoop);
  }, [holistic]);

  useEffect(() => {
    if (isCameraEnabled && !stream) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 640, height: 360 } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setStream(stream);
            videoRef.current.onloadedmetadata = () => {
              if (canvasRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
              }
              animationFrameId.current = requestAnimationFrame(detectionLoop);
            };
          }
        });
    }

    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [isCameraEnabled, stream, detectionLoop]);

  // --- THIS IS THE UPDATED FUNCTION ---
  const handleCheckSign = () => {
    const staticModel = models.static;
    if (!staticModel || !labels.static)
      return setFeedback("Static model or labels are not ready yet.");

    if (
      !lastDetection.current ||
      (!lastDetection.current.leftHandLandmarks &&
        !lastDetection.current.rightHandLandmarks)
    ) {
      return setFeedback(
        "Couldn't see your hands clearly. Please position them in the frame and try again."
      );
    }

    setFeedback("Analyzing your sign...");
    const features = extractStaticFeatures(lastDetection.current);

    // Get the prediction result
    const result = tf.tidy(() => {
      const inputTensor = tf.tensor2d([features]);
      const prediction = staticModel.predict(inputTensor);
      const probabilities = prediction.dataSync();
      const predictedIndex = prediction.as1D().argMax().dataSync()[0];
      return {
        predictedWord: labels.static[predictedIndex],
        confidence: probabilities[predictedIndex],
      };
    });

    // Set the result and show the modal
    setFeedbackResult(result);
    setShowFeedbackModal(true);
    setFeedback("Enable your camera to begin."); // Reset instructional text
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    keypointSequence.current = [];
    setProgress(0);
    setFeedback("Recording... Perform the sign now.");
  };

  const handleStopCamera = () => {
    setIsCameraEnabled(false);
  };

  if (!isAIReady) {
    return (
      <div className="container py-5 text-center">
        <h4>Loading AI Models...</h4>
        <p>{aiError || "Please wait."}</p>
      </div>
    );
  }

  return (
    <>
      <FeedbackModal
        show={showFeedbackModal}
        onHide={() => setShowFeedbackModal(false)}
        result={feedbackResult}
        expectedSign={sign.name}
      />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 text-navy mb-0">Practice Mode: {sign.name}</h3>
          <button className="btn btn-sm btn-secondary" onClick={onExit}>
            <i className="fa-solid fa-arrow-left me-1"></i> Back to Lesson
          </button>
        </div>

        {isRecording && (
          <div className="progress mb-3" style={{ height: "10px" }}>
            <div
              className="progress-bar bg-coral"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <div className="row g-4">
          <div className="col-md-6">
            <h6 className="text-muted">Reference Video</h6>
            <video
              src={sign.videoSrc}
              className="img-fluid rounded border bg-light"
              controls
              muted
              loop
              autoPlay
            ></video>
          </div>
          <div className="col-md-6">
            <h6 className="text-muted">Your Camera</h6>
            <div
              className="bg-dark rounded overflow-hidden position-relative"
              style={{ aspectRatio: "16 / 9" }}
            >
              <video
                ref={videoRef}
                className="w-100 h-100"
                autoPlay
                muted
                playsInline
                style={{}}
              ></video>
              <canvas
                ref={canvasRef}
                className="position-absolute top-0 start-0 w-100 h-100"
              ></canvas>
              {!isCameraEnabled && (
                <div className="text-white d-flex flex-column align-items-center justify-content-center h-100">
                  <i className="fa-solid fa-video fs-2 mb-2"></i>
                  <p>Camera is off</p>
                </div>
              )}
            </div>
            <div className="d-flex gap-2 justify-content-center mt-3">
              {!isCameraEnabled ? (
                <button
                  onClick={() => setIsCameraEnabled(true)}
                  className="btn btn-primary"
                >
                  Enable Camera
                </button>
              ) : (
                <>
                  {sign.modelType === "static" && (
                    <button
                      onClick={handleCheckSign}
                      className="btn btn-success"
                    >
                      Check My Sign
                    </button>
                  )}
                  {sign.modelType === "dynamic" && (
                    <button
                      onClick={handleStartRecording}
                      disabled={isRecording}
                      className="btn btn-success"
                    >
                      {isRecording ? "Recording..." : "Start Recording"}
                    </button>
                  )}
                  <button onClick={handleStopCamera} className="btn btn-danger">
                    Stop Camera
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="alert alert-info mt-4">{feedback}</div>
      </div>
    </>
  );
}

export default PracticeView;
