import { createContext, useState, useEffect } from "react";
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
            setToken(storedToken);
            setUser(decryptedUser);

            // 🛡️ Validate with server immediately to ensure user still exists in DB
            await refetchUser();
            
            // 🔔 Subscribe to push notifications
            subscribeToPushNotifications();
          }

        }
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  /* 🔁 Sync storage (NO AUTO LOGOUT HERE) */
  useEffect(() => {
    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", encryptData(user));
    }
    // ❌ DO NOT clear storage here
  }, [token, user]);

  /* ================== ACTIONS ================== */

  const login = (userData, authToken) => {
    console.log(userData, "token data");

    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", encryptData(userData));

    // 🔔 Subscribe to push notifications
    subscribeToPushNotifications();
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear(); // ✅ explicit logout only
  };

  const refreshUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", encryptData(updatedUserData));
  };

  const refetchUser = async () => {
    try {
      const oldToken = localStorage.getItem("token");
      if (!oldToken) return;

      // 1️⃣ Get fresh user
      const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${oldToken}`,
        },
      });

      // 🚨 Handle User Not Found / Invalid Token
      if (userRes.status === 401 || userRes.status === 404) {
        logout();
        return;
      }

      const userData = await userRes.json();

      if (!userData?.success) {
        logout();
        return;
      }

      // 2️⃣ Get fresh token (UPDATED ROLE)
      const tokenRes = await fetch(
        `${import.meta.env.VITE_API_URL}/users/refresh-token`,
        {
          headers: {
            Authorization: `Bearer ${oldToken}`,
          },
        },
      );
      const tokenData = await tokenRes.json();

      if (tokenData?.success) {
        setUser(userData.user);
        setToken(tokenData.token);

        localStorage.setItem("token", tokenData.token);
        localStorage.setItem("user", encryptData(userData.user));
      }
    } catch (err) {
      console.error("refetchUser failed", err);
      // Optional: logout on massive failure?
      // logout();
    }
  };

  const isAuthenticated = Boolean(user && token);
  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import React from "react";
