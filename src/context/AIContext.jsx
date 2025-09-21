import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

// Get libraries from the global window object
const tf = window.tf;
const Holistic = window.Holistic;

// Create the context
const AIContext = createContext();

// Create a custom hook for easy access
// eslint-disable-next-line react-refresh/only-export-components
export function useAI() {
  return useContext(AIContext);
}

// Create the provider component
export function AIProvider({ children }) {
  const [models, setModels] = useState({ static: null, dynamic: null });
  const [labels, setLabels] = useState({ static: [], dynamic: [] });
  const [holistic, setHolistic] = useState(null);
  const [isAIReady, setIsAIReady] = useState(false);
  const [error, setError] = useState(null);

  // This ref flag prevents re-initialization in React's Strict Mode
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const initializeAI = async () => {
      try {
        console.log(
          "--- 🧠 AIContext: Initializing AI resources (Holistic only) ---"
        );

        // Concurrently load TensorFlow models and their labels
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

        // Create and configure the Holistic instance
        const holisticInstance = new Holistic({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
        });
        holisticInstance.setOptions({
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // Wait for MediaPipe to be fully initialized
        console.log("⏳ Initializing MediaPipe Holistic library...");
        await holisticInstance.initialize();

        setHolistic(holisticInstance);
        console.log("✅ MediaPipe Holistic initialized");

        // Signal that all AI components are now ready
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
  }, []); // Empty dependency array ensures this runs only once on mount

  const value = { models, labels, holistic, isAIReady, error };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}
