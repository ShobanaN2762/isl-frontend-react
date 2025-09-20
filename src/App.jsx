import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import AuthModal from "./components/AuthModal.jsx";

import HomePage from "./pages/HomePage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Learning from "./pages/Learning.jsx";
import Translator from "./pages/Translator.jsx";
import Profile from "./pages/Profile.jsx";

// A helper component to decide whether to show the header and footer
function AppLayout() {
  const location = useLocation();
  // Don't show header/footer on the homepage.
  const showHeaderFooter = location.pathname !== "/";

  return (
    <div className="d-flex flex-column min-vh-100">
      {showHeaderFooter && <Header />}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Protected Routes */}
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
                <Learning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/translate"
            element={
              <ProtectedRoute>
                <Translator />
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
          {/* Redirect any other path to the home page or dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
}

// A component to protect routes that require authentication
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
}

// The main App component now just sets up the Router
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
