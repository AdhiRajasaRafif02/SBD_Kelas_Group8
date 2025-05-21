import { createContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          // Optional: verify the token is still valid with the backend
          try {
            await axios.get(`${API_URL}/auth/verify`, {
              headers: { Authorization: `Bearer ${parsedUser.id}` },
            });
            setUser(parsedUser);
          } catch (verifyError) {
            // If verification fails, clear stored user data
            console.log("Session expired or invalid, please login again");
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register new user
  const register = async (username, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
        role: "student",
      });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      // Store user in state and localStorage
      const userData = res.data.user;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // Notify backend about logout
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout API error:", err);
      // Continue with client-side logout even if API fails
    } finally {
      // Always clear local data
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const authHeaders = user
        ? { headers: { Authorization: `Bearer ${user.id}` } }
        : {};

      const res = await axios.put(
        `${API_URL}/auth/profile`,
        userData,
        authHeaders
      );

      // Update user in state and localStorage
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
