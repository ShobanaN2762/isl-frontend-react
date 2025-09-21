import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useAI } from "./context/AIContext";

// Import Components and Pages
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import LoadingScreen from "./components/LoadingScreen";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import LearningPage from "./pages/Learning";
import TranslatorPage from "./pages/Translator";
import Profile from "./pages/Profile";

// A component to protect routes that require authentication
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
}

// The main App component now handles the initial loading screen
function App() {
  const { isAIReady, error: aiError } = useAI();

  // Show the splash screen until the AI models are fully loaded
  if (!isAIReady) {
    return <LoadingScreen message="Loading AI Models..." error={aiError} />;
  }

  // Once AI is ready, show the main application
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

// The AppLayout component contains the main structure
function AppLayout() {
  const location = useLocation();
  const showHeaderFooter = location.pathname !== "/";

  return (
    <div className="d-flex flex-column min-vh-100">
      {showHeaderFooter && <Header />}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <LearningPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/translate"
            element={
              <ProtectedRoute>
                <TranslatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {showHeaderFooter && <Footer />}
      <AuthModal />
    </div>
  );
}

export default App;
