import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAI } from "../../context/AIContext";

const tf = window.tf;
const drawConnectors = window.drawConnectors;
const drawLandmarks = window.drawLandmarks;
const HAND_CONNECTIONS = window.HAND_CONNECTIONS;
const POSE_CONNECTIONS = window.POSE_CONNECTIONS;

const extractStaticFeatures = (results) => {
  const HAND_PAD = Array(63).fill(0);
  let right = HAND_PAD.slice();
  let left = HAND_PAD.slice();
  if (results?.multiHandedness && results?.multiHandLandmarks) {
    results.multiHandedness.forEach((h, i) => {
      const side = (h.label || "").toLowerCase();
      const lms = results.multiHandLandmarks[i];
      if (!lms) return;
      const flat = lms.flatMap((lm) => [lm.x, lm.y, lm.z]);
      if (side === "right") right = flat;
      if (side === "left") left = flat;
    });
  }
  return [...right, ...left];
};

function PracticeView({ sign, onExit }) {
  const {
    models,
    labels,
    holistic,
    hands,
    isAIReady,
    error: aiError,
  } = useAI();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const lastDetection = useRef(null);

  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [feedback, setFeedback] = useState("Enable your camera to begin.");
  const [stream, setStream] = useState(null);

  const detectionLoop = useCallback(async () => {
    if (videoRef.current && holistic && hands) {
      const modelToUse = sign.modelType === "static" ? hands : holistic;
      if (videoRef.current.readyState >= 3) {
        // Check if video has enough data
        await modelToUse.send({ image: videoRef.current });
      }
    }
    animationFrameId.current = requestAnimationFrame(detectionLoop);
  }, [holistic, hands, sign.modelType]);

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
        })
        .catch((err) => {
          console.error("Camera error:", err);
          setFeedback("Could not access camera. Please check permissions.");
          setIsCameraEnabled(false);
        });
    } else if (!isCameraEnabled && stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    }

    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [isCameraEnabled, stream, detectionLoop]);

  useEffect(() => {
    const modelToUse = sign.modelType === "static" ? hands : holistic;
    if (!modelToUse) return;

    modelToUse.onResults((results) => {
      lastDetection.current = results;
      const canvasCtx = canvasRef.current.getContext("2d");
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      if (sign.modelType === "static" && results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5,
          });
          // --- THIS IS THE MISSING LINE TO ADD ---
          drawLandmarks(canvasCtx, landmarks, {
            color: "#FF0000",
            lineWidth: 2,
          });
        }
      } else if (sign.modelType === "dynamic") {
        if (results.poseLandmarks) {
          drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: "#00CC00",
            lineWidth: 2,
          });
          drawLandmarks(canvasCtx, results.poseLandmarks, {
            color: "#FF0000",
            lineWidth: 1,
          });
        }
        if (results.leftHandLandmarks) {
          drawConnectors(
            canvasCtx,
            results.leftHandLandmarks,
            HAND_CONNECTIONS,
            { color: "#CC0000", lineWidth: 3 }
          );
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
      }
    });
  }, [hands, holistic, sign.modelType]);

  const handleCheckSign = () => {
    const staticModel = models.static;
    if (!staticModel || !labels.static) {
      setFeedback("Static model or labels are not ready yet.");
      return;
    }
    if (
      sign.modelType !== "static" ||
      !lastDetection.current?.multiHandLandmarks
    ) {
      setFeedback(
        "Couldn't see your hands clearly. Please position them in the frame and try again."
      );
      return;
    }

    setFeedback("Analyzing your sign...");
    const features = extractStaticFeatures(lastDetection.current);

    tf.tidy(() => {
      const inputTensor = tf.tensor2d([features]);
      const prediction = staticModel.predict(inputTensor);
      const probabilities = prediction.dataSync();
      const predictedIndex = prediction.as1D().argMax().dataSync()[0];
      const predictedSign = labels.static[predictedIndex];
      const confidence = probabilities[predictedIndex];
      const confidencePercent = (confidence * 100).toFixed(1);

      if (predictedSign === sign.name) {
        setFeedback(
          `Great job! That looks correct. Detected "${predictedSign}" with ${confidencePercent}% confidence.`
        );
      } else {
        setFeedback(
          `Not quite. I detected "${predictedSign}" (${confidencePercent}%), but was expecting "${sign.name}". Try again!`
        );
      }
    });
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
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="h5 text-navy mb-0">Practice Mode: {sign.name}</h3>
        <button className="btn btn-sm btn-secondary" onClick={onExit}>
          <i className="fa-solid fa-arrow-left me-1"></i> Back to Lesson
        </button>
      </div>
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
              style={{ transform: "scaleX(-1)" }}
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
                  <button onClick={handleCheckSign} className="btn btn-success">
                    Check My Sign
                  </button>
                )}
                {sign.modelType === "dynamic" && (
                  <button className="btn btn-success">Start Recording</button>
                )}
                <button
                  onClick={() => setIsCameraEnabled(false)}
                  className="btn btn-danger"
                >
                  Stop Camera
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="alert alert-info mt-4">{feedback}</div>
    </div>
  );
}

export default PracticeView;
