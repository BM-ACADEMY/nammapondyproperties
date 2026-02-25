import { useState, useEffect, useRef } from "react";
import { message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function OtpVerify() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { email, identifier, password, purpose, from } = location.state || {};
  const { login } = useAuth();

  useEffect(() => {
    if (!email && !identifier) navigate("/forgot-password");
  }, [email, identifier, navigate]);

  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => setCountdown((p) => p - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) setCanResend(true);
  }, [countdown, canResend]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      message.error("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    try {
      const isPhoneIdentifier = identifier && !identifier.includes("@");
      const payload = {
        otp: otpCode,
        email: !isPhoneIdentifier ? identifier || email : email,
        phone: isPhoneIdentifier ? identifier : undefined,
      };
      await api.post("/users/verify-otp", payload);
      message.success("OTP verified successfully!");

      if (from === "signup" && password) {
        try {
          const loginRes = await api.post("/users/login", { email, password });
          if (loginRes.data.success) {
            login(loginRes.data.user, loginRes.data.token);
            message.success("Logged in successfully!");
            navigate("/");
            return;
          }
        } catch {
          message.info("Verification successful. Please login manually.");
          navigate("/login");
          return;
        }
      }

      if (purpose === "reset") {
        navigate("/reset-password", { state: { email, identifier } });
      } else if (purpose === "seller-signup") {
        message.success("Seller account verified! Please login.");
        navigate("/login");
      } else {
        message.success("Account verified! Please login.");
        navigate("/login");
      }
    } catch (err) {
      message.error(err.response?.data?.error || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setResendLoading(true);
    try {
      const isPhoneIdentifier = identifier && !identifier.includes("@");
      const payload = {
        email: !isPhoneIdentifier ? identifier || email : undefined,
        phone: isPhoneIdentifier ? identifier : undefined,
        otpEmail: isPhoneIdentifier ? email : undefined,
      };
      await api.post("/users/send-otp", payload);
      message.success("New OTP sent!");
      setCanResend(false);
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div 
      className="flex items-center justify-center lg:justify-end min-h-[calc(100vh-80px)] p-4 lg:pr-24 xl:pr-90 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/authbackground.png')`
      }}
    >
      <div className="bg-white text-gray-500 w-full max-w-sm mx-4 md:p-8 p-6 text-left text-sm rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.15)]">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-500 transition-colors text-xs font-medium mb-6 w-fit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-1 text-center text-gray-800">
          Verify your email
        </h2>
        <p className="text-center text-gray-400 text-xs mb-6">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-600">{email}</span>
        </p>

        <form onSubmit={onSubmit}>
          {/* OTP Digit Boxes */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-11 text-center text-lg font-semibold border border-gray-300/60 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
              />
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mb-4 bg-indigo-500 hover:bg-indigo-600 py-2.5 rounded-full text-white font-medium transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        {/* Resend */}
        <p className="text-center text-xs text-gray-400">
          Didn&apos;t receive the code?{" "}
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="text-indigo-500 hover:text-indigo-700 font-medium disabled:opacity-60"
            >
              {resendLoading ? "Sending..." : "Resend OTP"}
            </button>
          ) : (
            <span className="text-gray-500">
              Resend in <span className="text-indigo-500 tabular-nums font-medium">{countdown}s</span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}