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
  // --- ADD NEW STATE FOR LABELS ---
  const [labels, setLabels] = useState({ static: [], dynamic: [] });
  const [holistic, setHolistic] = useState(null);
  const [hands, setHands] = useState(null);
  const [isAIReady, setIsAIReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        console.log("--- 🧠 AIContext: Initializing AI resources ---");

        // --- UPDATE PROMISE.ALL TO INCLUDE LABELS ---
        const [staticModel, dynamicModel, staticLabels, dynamicLabels] =
          await Promise.all([
            tf.loadGraphModel("/isl_static_model_tfjs/model.json"),
            tf.loadGraphModel("/isl_dynamic_model_tfjs/model.json"),
            fetch("/label_mapping_static.json").then((res) => res.json()),
            fetch("/label_mapping_dynamic.json").then((res) => res.json()),
          ]);

        setModels({ static: staticModel, dynamic: dynamicModel });
        // --- SET THE LABELS STATE ---
        setLabels({
          static: Object.values(staticLabels),
          dynamic: Object.values(dynamicLabels),
        });
        console.log("✅ TensorFlow models and labels loaded");

        // ... (MediaPipe loading remains the same)
        const holisticInstance = new Holistic({
          /* ... */
        });
        setHolistic(holisticInstance);
        const handsInstance = new Hands({
          /* ... */
        });
        setHands(handsInstance);

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

  // --- PASS LABELS THROUGH THE CONTEXT ---
  const value = { models, labels, holistic, hands, isAIReady, error };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}
