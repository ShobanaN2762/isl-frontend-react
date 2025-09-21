import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAI } from "../../context/AIContext";

const tf = window.tf;
const drawConnectors = window.drawConnectors;
const drawLandmarks = window.drawLandmarks;
const HAND_CONNECTIONS = window.HAND_CONNECTIONS;

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

function SignToTextView() {
  const { models, labels, holistic, isAIReady, error: aiError } = useAI();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  const predictionBuffer = useRef([]);
  const noHandFrames = useRef(0);

  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [stream, setStream] = useState(null);

  const [sentence, setSentence] = useState([]);
  const [stablePrediction, setStablePrediction] = useState("");
  const [lastAppendedSign, setLastAppendedSign] = useState(null);

  const BUFFER_SIZE = 8;
  const CONF_THRESHOLD = 0.85;
  const onResults = useCallback(
    (results) => {
      const canvasCtx = canvasRef.current.getContext("2d");
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

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

      const handsDetected =
        results.leftHandLandmarks || results.rightHandLandmarks;

      if (handsDetected) {
        noHandFrames.current = 0;
        const features = extractStaticFeatures(results);
        const prediction = tf.tidy(() => {
          const inputTensor = tf.tensor2d([features]);
          const pred = models.static.predict(inputTensor);
          const probabilities = pred.dataSync();
          const predictedIndex = pred.as1D().argMax().dataSync()[0];
          return {
            sign: labels.static[predictedIndex],
            confidence: probabilities[predictedIndex],
          };
        });

        // Update the ref without causing a re-render
        predictionBuffer.current.push(prediction);
        predictionBuffer.current = predictionBuffer.current.slice(-BUFFER_SIZE);

        // Check for stability inside the loop
        if (predictionBuffer.current.length === BUFFER_SIZE) {
          const firstSign = predictionBuffer.current[0].sign;
          const allSame = predictionBuffer.current.every(
            (p) => p.sign === firstSign
          );
          const highConf = predictionBuffer.current.every(
            (p) => p.confidence >= CONF_THRESHOLD
          );

          if (allSame && highConf) {
            // ONLY update state when we have a stable prediction
            setStablePrediction(firstSign);
          }
        }
      } else {
        noHandFrames.current++;
        if (noHandFrames.current > 20) {
          // This 'if' statement reads lastAppendedSign, so it must be a dependency
          if (lastAppendedSign !== " ") {
            setSentence((prev) => [...prev, " "]);
            setLastAppendedSign(" ");
          }
          noHandFrames.current = 0;
        }
      }
    },
    [models.static, labels.static, lastAppendedSign]
  );

  // Effect to append the stable prediction to the sentence
  useEffect(() => {
    // This 'if' statement also reads lastAppendedSign
    if (stablePrediction && lastAppendedSign !== stablePrediction) {
      setSentence((prev) => {
        let newSentence = [...prev];
        if (newSentence[newSentence.length - 1] === " ") newSentence.pop();
        return [...newSentence, stablePrediction];
      });
      setLastAppendedSign(stablePrediction);
    }
  }, [stablePrediction, lastAppendedSign, sentence]);

  // Effects for camera and MediaPipe setup (unchanged)
  useEffect(() => {
    if (holistic) holistic.onResults(onResults);
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
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [isCameraEnabled, stream, detectionLoop]);

  const stopCamera = () => {
    setIsCameraEnabled(false);
    setSentence([]);
    predictionBuffer.current = [];
    setStablePrediction("");
    setLastAppendedSign(null);
  };

  if (aiError)
    return <div className="alert alert-danger">Error loading AI models.</div>;
  if (!isAIReady)
    return <div className="text-center p-5">Loading AI Resources...</div>;

  return (
    <div className="row g-4">
      <div className="col-md-6">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h5 className="card-title">Live Camera Feed</h5>
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
              ></video>
              <canvas
                ref={canvasRef}
                className="position-absolute top-0 start-0 w-100 h-100"
              ></canvas>
              {!isCameraEnabled && (
                <div className="text-white position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                  <i className="fa-solid fa-video fs-2 mb-2"></i>
                  <p>Enable camera to start</p>
                </div>
              )}
            </div>
            <div className="d-flex gap-3 justify-content-center align-items-center mt-3">
              {!isCameraEnabled ? (
                <button
                  onClick={() => setIsCameraEnabled(true)}
                  className="btn btn-primary"
                >
                  Enable Camera
                </button>
              ) : (
                <button onClick={stopCamera} className="btn btn-danger">
                  Stop Camera
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card shadow-sm h-100">
          <div className="card-body d-flex flex-column">
            <h5 className="card-title">Detected Sign (Real-time)</h5>
            <div
              className="bg-light p-3 rounded d-flex align-items-center justify-content-center"
              style={{ minHeight: "80px" }}
            >
              <p className="fw-bold text-primary display-4 m-0">
                {stablePrediction || "..."}
              </p>
            </div>
            <h5 className="card-title mt-3">Output Sentence</h5>
            <textarea
              className="form-control flex-grow-1"
              rows="5"
              value={sentence.join("")}
              readOnly
            ></textarea>
            <button
              onClick={() => {
                setSentence([]);
                setLastAppendedSign(null);
              }}
              className="btn btn-sm btn-outline-danger mt-2"
            >
              Clear Output
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignToTextView;
