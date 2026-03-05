import { useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const API = import.meta.env.VITE_API_URL;

const LoginModal = ({ open, onCancel }) => {
    const [mode, setMode] = useState("login"); // "login" or "signup"
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    if (!open) return null;

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API}/users/google-login`, {
                tokenId: credentialResponse.credential,
            });

            if (res.data.success) {
                login(res.data.user, res.data.token);
                toast.success("Login successful with Google!");
                onCancel();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Google login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        // ... (omitted for brevity, will use replace_file_content with full block)

        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = mode === "login" ? "/users/login" : "/users/register";
            const payload = { phone, password };

            const res = await axios.post(`${API}${endpoint}`, payload);

            if (res.data.success) {
                login(res.data.user, res.data.token);
                toast.success(mode === "login" ? "Login successful!" : "Account created and logged in!");
                onCancel();
                // Reset form
                setPhone("");
                setPassword("");
                setMode("login");
            } else {
                toast.error(res.data.message || "Action failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Action failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white text-gray-500 w-full max-w-sm mx-4 p-7 text-left text-sm rounded-2xl shadow-[0px_0px_20px_0px_rgba(0,0,0,0.1)] relative">

                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-semibold mb-1 text-center text-gray-800">
                    {mode === "login" ? "Welcome back" : "Create Account"}
                </h2>
                <p className="text-center text-gray-400 text-xs mb-6">
                    {mode === "login" ? "Sign in to access your account" : "Join us with your phone number"}
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Phone Input */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-500 mb-1 ml-4">
                            Phone Number
                        </label>
                        <input
                            className="w-full bg-transparent border border-gray-300/60 outline-none rounded-full py-2.5 px-4 text-gray-700 placeholder-gray-400 focus:border-indigo-400 transition-colors"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            maxLength={10}
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-6">
                        <label className="block text-xs font-medium text-gray-500 mb-1 ml-4">
                            Password
                        </label>
                        <input
                            className="w-full bg-transparent border border-gray-300/60 outline-none rounded-full py-2.5 px-4 text-gray-700 placeholder-gray-400 focus:border-indigo-400 transition-colors"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mb-4 bg-indigo-500 hover:bg-indigo-600 py-2.5 rounded-full text-white font-medium transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (mode === "login" ? "Signing in..." : "Creating account...") : (mode === "login" ? "Log in" : "Sign up")}
                    </button>
                </form>

                {/* Toggle Mode */}
                <p className="text-center text-xs mt-2">
                    {mode === "login" ? (
                        <>
                            Don&apos;t have an account?{" "}
                            <button
                                onClick={() => setMode("signup")}
                                className="text-indigo-500 hover:text-indigo-700 font-medium"
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                onClick={() => setMode("login")}
                                className="text-indigo-500 hover:text-indigo-700 font-medium"
                            >
                                Log in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default LoginModal;
