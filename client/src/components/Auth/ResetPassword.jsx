import { useState } from "react";
import { message } from "antd";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, identifier } = location.state || {};

  if (!email && !identifier) {
    navigate("/forgot-password");
    return null;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      message.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const isPhoneIdentifier = identifier && !identifier.includes("@");
      const payload = {
        newPassword,
        email: !isPhoneIdentifier ? identifier || email : email,
        phone: isPhoneIdentifier ? identifier : undefined,
      };
      await api.post("/users/reset-password", payload);
      message.success("Password reset successfully! Please login.");
      navigate("/login");
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }) => show ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-1 text-center text-gray-800">
          Set new password
        </h2>
        <p className="text-center text-gray-400 text-xs mb-6">
          For{" "}
          <span className="font-medium text-gray-600">{identifier || email}</span>
        </p>

        <form onSubmit={onSubmit}>
          {/* New Password */}
          <div className="relative my-1">
            <input
              className="w-full bg-transparent border border-gray-300/60 outline-none rounded-full py-2.5 pl-4 pr-10 text-gray-700 placeholder-gray-400 focus:border-indigo-400 transition-colors"
              type={showNew ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <EyeIcon show={showNew} />
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative mt-3">
            <input
              className="w-full bg-transparent border border-gray-300/60 outline-none rounded-full py-2.5 pl-4 pr-10 text-gray-700 placeholder-gray-400 focus:border-indigo-400 transition-colors"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <EyeIcon show={showConfirm} />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 bg-indigo-500 hover:bg-indigo-600 py-2.5 rounded-full text-white font-medium transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
