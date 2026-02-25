import { useState } from "react";
import { message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

const API = import.meta.env.VITE_API_URL;

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      message.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        email: activeTab === "email" ? identifier : undefined,
        phone: activeTab === "phone" ? identifier : undefined,
        password,
      };
      const res = await axios.post(`${API}/users/create-user`, payload);
      if (res.data.success) {
        message.success(res.data.message || "Account created successfully!");
        localStorage.setItem("token", res.data.token);
        login(res.data.user, res.data.token);
        navigate("/");
      }
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axios.post(`${API}/users/google-login`, {
        credential: response.credential,
      });
      if (res.data.success) {
        message.success("Login successful!");
        localStorage.setItem("token", res.data.token);
        login(res.data.user, res.data.token);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.error || "Google authentication failed",
      );
    }
  };

  return (
    <div 
      className="flex items-center justify-center lg:justify-end min-h-[calc(100vh-80px)] p-4 lg:pr-24 xl:pr-90 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/authbackground.png')`
      }}
    >
      <div className="bg-white text-gray-500 w-full max-w-sm mx-4 md:p-8 p-6 text-left text-sm rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.15)]">
        {/* Header */}
        <h2 className="text-2xl font-semibold mb-1 text-center text-gray-800">
          Create account
        </h2>
        <p className="text-center text-gray-400 text-xs mb-6">
          Join Namma Pondy Properties today
        </p>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("email");
              setIdentifier("");
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
              activeTab === "email"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("phone");
              setIdentifier("");
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
              activeTab === "phone"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Phone
          </button>
        </div>

        <form onSubmit={onSubmit}>
          {/* Identifier Input */}
          <input
            className="w-full bg-transparent border my-1 border-gray-300/60 outline-none rounded-full py-2.5 px-4 text-gray-700 placeholder-gray-400 focus:border-indigo-400 transition-colors"
            type={activeTab === "email" ? "email" : "tel"}
            placeholder={
              activeTab === "email"
                ? "Enter your email"
                : "Enter WhatsApp number"
            }
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            maxLength={activeTab === "phone" ? 10 : undefined}
            inputMode={activeTab === "phone" ? "numeric" : undefined}
            required
          />

          {/* Password Input */}
          <input
            className="w-full bg-transparent border mt-3 border-gray-300/60 outline-none rounded-full py-2.5 px-4 text-gray-700 placeholder-gray-400 focus:border-indigo-400 transition-colors"
            type="password"
            placeholder="Create a password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 mb-3 bg-indigo-500 hover:bg-indigo-600 py-2.5 rounded-full text-white font-medium transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-xs mt-2 mb-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-500 hover:text-indigo-700 font-medium"
          >
            Log in
          </Link>
        </p>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Login */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => message.error("Google Login Failed")}
            useOneTap
            theme="outline"
            shape="pill"
            width="100%"
            text="continue_with"
          />
        </div>
      </div>
    </div>
  );
}