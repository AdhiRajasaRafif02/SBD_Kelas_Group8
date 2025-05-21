import { createContext, useState, useEffect } from "react";
import { api } from "../Services/serviceApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is in localStorage
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Optional session verification - skip if endpoint not available
        const verifySession = async () => {
          try {
            const response = await api.get("/auth/verify");
            // If role differs from localStorage, update it
            if (response.data.role !== parsedUser.role) {
              const updatedUser = { ...parsedUser, role: response.data.role };
              setUser(updatedUser);
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          } catch (error) {
            // Only log out the user for auth errors (401/403), not for 404
            if (
              error.response &&
              (error.response.status === 401 || error.response.status === 403)
            ) {
              console.error("Session expired:", error);
              localStorage.removeItem("user");
              setUser(null);
            } else if (error.response && error.response.status === 404) {
              // Just log a warning if the endpoint doesn't exist
              console.warn("Auth verification endpoint not available");
              // Keep the user logged in from localStorage
            } else {
              console.error("Error verifying session:", error);
            }
          }
        };

        verifySession();
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const register = async (username, email, password, role = "student") => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
      role,
    });
    return response.data;
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Raw login response:", response.data);

      // Ekstraksi data pengguna dari respons backend
      const userData = {
        id: response.data.userId || response.data.user?.id || "",
        username: response.data.username || response.data.user?.username || "",
        email: response.data.email || email,
        // Pastikan role dikonversi ke lowercase untuk konsistensi
        role: (
          response.data.role ||
          response.data.user?.role ||
          "student"
        ).toLowerCase(),
      };

      console.log("Extracted user data:", userData);
      console.log("Role is:", userData.role);

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      return {
        user: userData,
        token: response.data.token,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const updateProfile = async (userData) => {
    const response = await api.put("/auth/profile", userData);

    const updatedUser = {
      ...user,
      username: userData.username,
      email: userData.email,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return response.data;
  };

  const isInstructor = () => {
    if (!user) return false;
    const role = user.role?.toLowerCase() || "";
    return role === "instructor" || role === "admin";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        isInstructor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
