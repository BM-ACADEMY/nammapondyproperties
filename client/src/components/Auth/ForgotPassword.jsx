import { useState } from "react";
import { message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isEmail = identifier.includes("@");
      const payload = {
        email: isEmail ? identifier : undefined,
        phone: !isEmail ? identifier : undefined,
        otpEmail: showEmailField ? otpEmail : undefined,
      };
      const res = await api.post("/users/send-otp", payload);
      message.success("OTP sent to your email!");
      navigate("/otp-verify", {
        state: {
          email: res.data.email,
          identifier,
          purpose: "reset",
          from: "forgot-password",
        },
      });
    } catch (err) {
      if (err.response?.data?.requiresEmail) {
        setShowEmailField(true);
        message.info("Please provide an email to receive the OTP");
      } else {
        message.error(err.response?.data?.error || "Failed to send reset code");
      }
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

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-1 text-gray-800">
          Forgot password?
        </h2>
        <p className="text-gray-400 text-xs mb-6">
          {showEmailField
            ? "Enter an email address to receive your reset code."
            : "Enter your registered email or phone number."}
        </p>

        <form onSubmit={onSubmit}>
          {/* Identifier Input */}
          <input
            className="w-full bg-transparent border my-1 border-gray-300/60 outline-none rounded-full py-2.5 px-4 text-gray-700 placeholder-gray-400 focus:border-indigo-400 transition-colors disabled:opacity-60"
            type="text"
            placeholder="Email or phone number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={showEmailField}
            required
          />

          {/* OTP Email Field (shown when phone user needs email) */}
          {showEmailField && (
            <input
              className="w-full bg-transparent border mt-3 border-gray-300/60 outline-none rounded-full py-2.5 px-4 text-gray-700 placeholder-gray-400 focus:border-indigo-400 transition-colors"
              type="email"
              placeholder="Enter email for OTP"
              value={otpEmail}
              onChange={(e) => setOtpEmail(e.target.value)}
              required
            />
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 mb-4 bg-indigo-500 hover:bg-indigo-600 py-2.5 rounded-full text-white font-medium transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : showEmailField ? "Send Reset Code" : "Continue"}
          </button>
        </form>

        {/* Remember password link */}
        <p className="text-center text-xs">
          Remembered your password?{" "}
          <Link to="/login" className="text-indigo-500 hover:text-indigo-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
