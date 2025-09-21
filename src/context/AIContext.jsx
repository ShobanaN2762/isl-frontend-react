import React, { createContext, useContext, useState, useEffect } from "react";

const tf = window.tf;
const Holistic = window.Holistic;
const Hands = window.Hands;

const AIContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAI() {
  return useContext(AIContext);
}

export function AIProvider({ children }) {
  const [models, setModels] = useState({ static: null, dynamic: null });
  const [labels, setLabels] = useState({ static: [], dynamic: [] });
  const [holistic, setHolistic] = useState(null);
  const [hands, setHands] = useState(null);
  const [isAIReady, setIsAIReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        console.log("--- 🧠 AIContext: Initializing AI resources ---");

        const [staticModel, dynamicModel, staticLabels, dynamicLabels] =
          await Promise.all([
            tf.loadGraphModel("/isl_static_model_tfjs/model.json"),
            tf.loadGraphModel("/isl_dynamic_model_tfjs/model.json"),
            fetch("/label_mapping_static.json").then((res) => res.json()),
            fetch("/label_mapping_dynamic.json").then((res) => res.json()),
          ]);

        setModels({ static: staticModel, dynamic: dynamicModel });
        setLabels({
          static: Object.values(staticLabels),
          dynamic: Object.values(dynamicLabels),
        });
        console.log("✅ TensorFlow models and labels loaded");

        const holisticInstance = new Holistic({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
        });
        holisticInstance.setOptions({
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // --- THIS IS THE CORRECTED PART ---
        const handsInstance = new Hands({
          locateFile: (file) =>
            // It must load from the '/hands/' folder, not '/holistic/'
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        handsInstance.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        console.log("⏳ Initializing MediaPipe libraries...");
        await Promise.all([
          holisticInstance.initialize(),
          handsInstance.initialize(),
        ]);

        setHolistic(holisticInstance);
        setHands(handsInstance);
        console.log("✅ MediaPipe libraries initialized");

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
  }, []);

  const value = { models, labels, holistic, hands, isAIReady, error };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}
