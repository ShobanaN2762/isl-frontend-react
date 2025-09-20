import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AuthModal() {
  const {
    isModalOpen,
    modalMode,
    closeAuthModal,
    openAuthModal,
    login,
    register,
  } = useAuth();
  const navigate = useNavigate();
  // State for form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isModalOpen) {
      setError("");
      setName("");
      setEmail("");
      setPassword("");
    }
  }, [isModalOpen, modalMode]);

  if (!isModalOpen) {
    return null; // Don't render anything if the modal is closed
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      closeAuthModal();
      navigate("/dashboard"); // 3. Navigate to dashboard on success
    } else {
      setError(result.message || "Failed to log in.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await register(name, email, password);
    setLoading(false);
    if (result.success) {
      openAuthModal("login");
    } else {
      setError(result.message || "Failed to register.");
    }
  };

  const renderLoginForm = () => (
    <>
      <h2 className="h4 fw-bold text-center text-dark mb-2">Welcome Back!</h2>
      <p className="text-center text-muted mb-4">
        Sign in to continue your journey.
      </p>
      <form onSubmit={handleLoginSubmit} className="vstack gap-3">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            placeholder="Email Address"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            placeholder="Password"
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-coral w-100 fw-semibold"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div className="text-center small text-muted pt-2">
          Don’t have an account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openAuthModal("register");
            }}
            className="text-coral text-decoration-underline"
          >
            Create one
          </a>
        </div>
      </form>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <h2 className="h4 fw-bold text-center text-dark mb-2">Create Account</h2>
      <p className="text-center text-muted mb-4">
        Start learning ISL for free today.
      </p>
      <form onSubmit={handleRegisterSubmit} className="vstack gap-3">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
            placeholder="Full Name"
            required
          />
        </div>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            placeholder="Email Address"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            placeholder="Password (min. 8 characters)"
            required
            minLength="8"
          />
        </div>
        <button
          type="submit"
          className="btn btn-coral w-100 fw-semibold"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
        <div className="text-center small text-muted pt-2">
          Already have an account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openAuthModal("login");
            }}
            className="text-coral text-decoration-underline"
          >
            Sign In
          </a>
        </div>
      </form>
    </>
  );

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
      onClick={closeAuthModal} // Close when clicking the background
    >
      <div
        className="bg-white p-4 rounded shadow-lg position-relative"
        style={{ maxWidth: "450px", width: "100%" }}
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling up to the background
      >
        <button
          className="btn-close position-absolute top-0 end-0 m-3"
          aria-label="Close"
          onClick={closeAuthModal}
        ></button>
        {error && (
          <div className="alert alert-danger small p-2 mb-3">{error}</div>
        )}
        {modalMode === "login" ? renderLoginForm() : renderRegisterForm()}
      </div>
    </div>
  );
}

export default AuthModal;
