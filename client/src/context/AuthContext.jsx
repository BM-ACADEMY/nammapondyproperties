
import { createContext, useState, useEffect } from "react";
import CryptoJS from "crypto-js";

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

    /* 🔑 Restore auth ONCE (on refresh) */
    useEffect(() => {
        try {
            const storedToken = sessionStorage.getItem("token");
            const storedUser = sessionStorage.getItem("user");

            if (storedToken && storedUser) {
                const decryptedUser = decryptData(storedUser);
                if (decryptedUser) {
                    setToken(storedToken);
                    setUser(decryptedUser);
                }
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    /* 🔁 Sync storage (NO AUTO LOGOUT HERE) */
    useEffect(() => {
        if (token && user) {
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("user", encryptData(user));
        }
        // ❌ DO NOT clear storage here
    }, [token, user]);

    /* ================== ACTIONS ================== */

    const login = (userData, authToken) => {
        console.log(userData, 'token data');

        setUser(userData);
        setToken(authToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        sessionStorage.clear(); // ✅ explicit logout only
    };

    const refreshUser = (updatedUserData) => {
        setUser(updatedUserData);
        sessionStorage.setItem("user", encryptData(updatedUserData));
    };

    const refetchUser = async () => {
        try {
            const oldToken = sessionStorage.getItem("token");
            if (!oldToken) return;

            // 1️⃣ Get fresh user
            const userRes = await fetch(
                `${import.meta.env.VITE_API_URL}/users/me`,
                {
                    headers: {
                        Authorization: `Bearer ${oldToken}`,
                    },
                }
            );
            const userData = await userRes.json();

            if (!userData?.success) return;

            // 2️⃣ Get fresh token (UPDATED ROLE)
            const tokenRes = await fetch(
                `${import.meta.env.VITE_API_URL}/users/refresh-token`,
                {
                    headers: {
                        Authorization: `Bearer ${oldToken}`,
                    },
                }
            );
            const tokenData = await tokenRes.json();

            if (tokenData?.success) {
                setUser({
                    success: true,
                    message: "User fetched successfully",
                    user: userData.user,
                });
                setToken(tokenData.token);

                sessionStorage.setItem("token", tokenData.token);
                sessionStorage.setItem(
                    "user",
                    encryptData({
                        success: true,
                        message: "User fetched successfully",
                        user: userData.user,
                    })
                );
            }
        } catch (err) {
            console.error("refetchUser failed", err);
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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
