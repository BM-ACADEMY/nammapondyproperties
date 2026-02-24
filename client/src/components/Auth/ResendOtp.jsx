import { useState } from "react";
import { message } from "antd";
import { Link } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function ResendOtp() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/users/send-otp`, { email });
      message.success(res.data.message || "OTP sent successfully!");
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-4">
      <div className="bg-white text-gray-500 w-full max-w-sm mx-4 md:p-8 p-6 text-left text-sm rounded-2xl shadow-[0px_0px_20px_0px_rgba(0,0,0,0.08)]">

        {/* Back link */}
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-500 transition-colors text-xs font-medium mb-6 w-fit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to login
        </Link>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-1 text-center text-gray-800">
          Resend OTP
        </h2>
        <p className="text-center text-gray-400 text-xs mb-6">
          Enter your email to receive a new verification code
        </p>

        <form onSubmit={onSubmit}>
          <input
            className="w-full bg-transparent border my-1 border-gray-300/60 outline-none rounded-full py-2.5 px-4 text-gray-700 placeholder-gray-400 focus:border-indigo-400 transition-colors"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 py-2.5 rounded-full text-white font-medium transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
