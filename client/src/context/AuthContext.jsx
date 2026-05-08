import React, { createContext, useState, useEffect, useMemo, useContext } from "react";
import CryptoJS from "crypto-js";
import { subscribeToPushNotifications } from "../utils/pushNotification";

export const AuthContext = createContext(null);

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

/* ================== CRYPTO HELPERS ================== */
const encryptData = (data) =>
  CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();

const decryptData = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch {
    return null;
  }
};

/* ================== PROVIDER ================== */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  /* 🔑 Restore auth ONCE (on refresh) and Validate session */
  useEffect(() => {
    const validateSession = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          const decryptedUser = decryptData(storedUser);
          if (decryptedUser) {
            // Set initial state from storage immediately
            setToken(storedToken);
            setUser(decryptedUser);

            // 🛡️ Validate with server immediately to ensure session is still valid
            // We do this in the background but keep isLoading=true until it finishes
            // to avoid multiple "flashes" of content.
            await refetchUser(storedToken);
            
            // 🔔 Subscribe to push notifications
            subscribeToPushNotifications();
          }
        }
      } catch (error) {
        console.error("Session validation failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  /* 🔁 Sync storage whenever token/user changes */
  useEffect(() => {
    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", encryptData(user));
    }
  }, [token, user]);

  /* ================== ACTIONS ================== */

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", encryptData(userData));
    subscribeToPushNotifications();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  const refreshUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", encryptData(updatedUserData));
  };

  /**
   * Fetches fresh user data and a fresh token from the server.
   * Uses the /refresh-token endpoint which returns both.
   */
  const refetchUser = async (explicitToken = null) => {
    try {
      const activeToken = explicitToken || token || localStorage.getItem("token");
      if (!activeToken) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/refresh-token`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (res.status === 401 || res.status === 404) {
        logout();
        return;
      }

      const data = await res.json();

      if (data?.success && data?.user && data?.token) {
        // Update both user and token in one go
        setUser(data.user);
        setToken(data.token);
        
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", encryptData(data.user));
      } else {
        // If the refresh endpoint doesn't return success, we might want to logout
        // but only if it was a definitive failure.
        if (data?.error === "User not found") {
           logout();
        }
      }
    } catch (err) {
      console.error("refetchUser failed:", err);
    }
  };

  const isAuthenticated = useMemo(() => Boolean(user && token), [user, token]);

  const contextValue = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refetchUser,
    refreshUser,
    isLoginModalOpen,
    setLoginModalOpen,
  }), [user, token, isAuthenticated, isLoading, isLoginModalOpen]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
