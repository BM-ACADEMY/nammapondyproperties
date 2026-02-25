import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleRedirect = (user) => {
    const role =
      user?.role?.name?.toUpperCase() ||
      user?.role_id?.role_name?.toUpperCase();
    if (location.state?.from) navigate(location.state.from);
    else if (role === "ADMIN") navigate("/admin/dashboard");
    else if (role === "SELLER") navigate("/seller/dashboard");
    else navigate("/");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/users/login`, {
        email: identifier,
        password,
      });
      if (res.data.success) {
        message.success("Login successful!");
        localStorage.setItem("token", res.data.token);
        login(res.data.user, res.data.token);
        handleRedirect(res.data.user);
      } else {
        message.error(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.error || "Login failed");
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
        handleRedirect(res.data.user);
      } else {
        message.error(res.data.message || "Google Login failed");
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
          Welcome back
        </h2>
        <p className="text-center text-gray-400 text-xs mb-6">
          Sign in to access your account
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
                : "Enter your phone number"
            }
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            maxLength={activeTab === "phone" ? 10 : undefined}
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
        <p className="text-center text-xs mt-2 mb-5">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-indigo-500 hover:text-indigo-700 font-medium"
          >
            Sign up
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