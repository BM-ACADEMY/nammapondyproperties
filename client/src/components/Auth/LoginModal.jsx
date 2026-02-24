import { useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const LoginModal = ({ open, onCancel }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success("Login successful!");
            onCancel();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Login failed");
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
                    Welcome back
                </h2>
                <p className="text-center text-gray-400 text-xs mb-6">
                    Sign in to access your account
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <input
                        className="w-full bg-transparent border my-1 border-gray-300/60 outline-none rounded-full py-2.5 px-4 text-gray-700 placeholder-gray-400 focus:border-indigo-400 transition-colors"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {/* Password Input */}
                    <input
                        className="w-full bg-transparent border mt-3 border-gray-300/60 outline-none rounded-full py-2.5 px-4 text-gray-700 placeholder-gray-400 focus:border-indigo-400 transition-colors"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* Forgot Password */}
                    <div className="text-right py-3">
                        <Link
                            to="/forgot-password"
                            onClick={onCancel}
                            className="text-indigo-500 hover:text-indigo-700 text-xs font-medium"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mb-3 bg-indigo-500 hover:bg-indigo-600 py-2.5 rounded-full text-white font-medium transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing in..." : "Log in"}
                    </button>
                </form>

                {/* Sign up link */}
                <p className="text-center text-xs mt-2">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/signup"
                        onClick={onCancel}
                        className="text-indigo-500 hover:text-indigo-700 font-medium"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginModal;
