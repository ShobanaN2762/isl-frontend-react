import React, { createContext, useState, useContext, useEffect } from "react";

// 1. Create the context
const AuthContext = createContext();

// 2. Create a custom hook for easy access to the context
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

// 3. Create the Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Add state for the modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("login"); // 'login' or 'register'

  // --- Functions to control the modal ---
  const openAuthModal = (mode = "login") => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsModalOpen(false);
  };

  // Check for existing user in localStorage when app starts
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("isl_auth_token"));
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse auth token from localStorage", error);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Logic from your handleLogin function
    // try {
    //   const response = await fetch("/api/users/login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email, password }),
    //   });
    //   const data = await response.json();
    //   if (!response.ok) {
    //     throw new Error(data.message || "Login failed");
    //   }
    //   localStorage.setItem("isl_auth_token", JSON.stringify(data));
    //   setUser(data);
    //   // We will add toast notifications later
    //   console.log(`Welcome back, ${data.name}!`);
    //   return { success: true };
    // } catch (error) {
    //   console.error("Login error:", error);
    //   return { success: false, message: error.message };
    // }

    return new Promise((resolve) => {
      setTimeout(() => {
        // Check against our hardcoded credentials
        if (email === "test@example.com" && password === "password123") {
          // Create a mock user object
          const mockUser = {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            // You can add any other user properties you need
          };

          localStorage.setItem("isl_auth_token", JSON.stringify(mockUser));
          setUser(mockUser);
          console.log(`Welcome back, ${mockUser.name}!`);
          resolve({ success: true });
        } else {
          // If credentials don't match, return an error
          resolve({ success: false, message: "Invalid email or password." });
        }
      }, 1000); // 1-second delay
    });
  };

  const register = async (name, email, password) => {
    // Logic from your handleRegister function
    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration failed");
      }
      console.log("Registration successful! Please log in.");
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    // Logic from your logout function
    setUser(null);
    localStorage.removeItem("isl_auth_token");
    localStorage.removeItem("completedLessons"); // Also clear lesson data
    console.log("You have been logged out.");
  };

  // The value provided to all children components
  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isModalOpen,
    modalMode,
    openAuthModal,
    closeAuthModal,
  };

  // We don't render the app until we've checked for a user
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
