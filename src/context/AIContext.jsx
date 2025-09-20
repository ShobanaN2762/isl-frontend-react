import React, { createContext, useContext, useState, useEffect } from "react";

// Make sure to reference the global 'tf' and 'Holistic' from the scripts
const tf = window.tf;
const Holistic = window.Holistic;

const AIContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAI() {
  return useContext(AIContext);
}

export function AIProvider({ children }) {
  const [models, setModels] = useState({ static: null, dynamic: null });
  const [holistic, setHolistic] = useState(null);
  const [hands, setHands] = useState(null);
  const [isAIReady, setIsAIReady] = useState(false);
  const [error, setError] = useState(null);

  // This useEffect will run only once to load all AI resources
  useEffect(() => {
    const initializeAI = async () => {
      try {
        console.log("--- 🧠 AIContext: Initializing AI resources ---");

        // Load TensorFlow models in parallel
        const [staticModel, dynamicModel] = await Promise.all([
          tf.loadGraphModel("/isl_static_model_tfjs/model.json"),
          tf.loadGraphModel("/isl_dynamic_model_tfjs/model.json"),
        ]);
        setModels({ static: staticModel, dynamic: dynamicModel });
        console.log("✅ TensorFlow models loaded");

        // Load MediaPipe Holistic
        const holisticInstance = new Holistic({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
        });
        holisticInstance.setOptions({
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        setHolistic(holisticInstance);
        console.log("✅ MediaPipe Holistic loaded");

        // Load MediaPipe Hands
        const handsInstance = new window.Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        handsInstance.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        setHands(handsInstance);
        console.log("✅ MediaPipe Hands loaded");

        setIsAIReady(true);
        console.log(
          "--- ✅ AIContext: All resources initialized successfully! ---"
        );
      } catch (err) {
        console.error("--- ❌ AIContext: A critical error occurred ---", err);
        setError("Failed to load AI models. Please refresh the page.");
      }
    };

    initializeAI();
  }, []); // The empty array [] ensures this runs only once

  const value = { models, holistic, hands, isAIReady, error };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}
