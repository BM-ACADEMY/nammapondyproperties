import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const LoginPage = () => {
    const [mode, setMode] = useState("login"); // "login" or "signup"
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || "/";

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API}/users/google-login`, {
                tokenId: credentialResponse.credential,
            });

            if (res.data.success) {
                login(res.data.user, res.data.token);
                toast.success("Login successful with Google!");
                navigate(from, { replace: true });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Google login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = mode === "login" ? "/users/login" : "/users/register";
            const payload = { phone, password };

            const res = await axios.post(`${API}${endpoint}`, payload);

            if (res.data.success) {
                login(res.data.user, res.data.token);
                toast.success(
                    mode === "login"
                        ? "Login successful!"
                        : "Account created and logged in!",
                );
                navigate(from, { replace: true });
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
        <div
            className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url("/authbackground.png")' }}
        >
            <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-10 rounded-3xl shadow-none">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {mode === "login" ? "Welcome back" : "Create Account"}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {mode === "login"
                            ? "Sign in to access your account"
                            : "Join us with your phone number"}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                required
                                className="appearance-none rounded-full relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                maxLength={10}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-full relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70"
                        >
                            {loading
                                ? mode === "login"
                                    ? "Signing in..."
                                    : "Creating account..."
                                : mode === "login"
                                    ? "Log in"
                                    : "Sign up"}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error("Google login failed")}
                            useOneTap
                            theme="outline"
                            shape="pill"
                            text="continue_with"
                            width="100%"
                        />
                    </div>
                </div>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        {mode === "login" ? (
                            <>
                                Don&apos;t have an account?{" "}
                                <button
                                    onClick={() => setMode("signup")}
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <button
                                    onClick={() => setMode("login")}
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    Log in
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
