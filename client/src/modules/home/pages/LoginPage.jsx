import { useState, useRef, useEffect } from "react";
import { ChevronDown, Pencil } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const LoginPage = () => {
    const [authStep, setAuthStep] = useState("phone"); // "phone" or "otp"
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || "/";

    // Refs for individual OTP inputs
    const inputRefs = useRef([]);

    useEffect(() => {
        if (authStep === "otp" && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [authStep]);

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        if (phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API}/users/send-otp`, { phone });
            if (res.data.success) {
                toast.success("OTP sent successfully!");
                setAuthStep("otp");
                setOtp(["", "", "", "", "", ""]); // Reset OTP fields
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        const fullOtp = otp.join("");
        if (fullOtp.length !== 6) {
            toast.error("Please enter a 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API}/users/verify-otp`, { phone, otp: fullOtp });
            if (res.data.success) {
                login(res.data.user, res.data.token);
                toast.success("Login successful!");
                navigate(from, { replace: true });
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1).replace(/\D/g, "");
        setOtp(newOtp);

        if (newOtp[index] !== "" && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const primaryColor = "#8ec4f5"; // Custom light blue

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url("/authbackground.png")' }}
        >
            <div className="bg-white/95 backdrop-blur-md text-gray-800 w-full max-w-[450px] p-10 text-left rounded-3xl shadow-2xl border border-white/20">
                
                {authStep === "phone" ? (
                    <>
                        <h2 className="text-[32px] font-bold text-[#11254a] mb-2">
                            Login / Register
                        </h2>
                        <p className="text-gray-500 text-[16px] mb-10 font-normal">
                            Please enter your Phone Number to continue
                        </p>

                        <form onSubmit={handleSendOtp}>
                            <div className="mb-10 relative transition-all duration-300">
                                {(isFocused || phone.length > 0) && (
                                    <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-blue-500 z-10">
                                        Phone Number
                                    </label>
                                )}
                                <div className={`flex items-center w-full border ${isFocused ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-200'} rounded-2xl hover:border-blue-300 transition-all overflow-hidden h-16 bg-white`}>
                                    {(isFocused || phone.length > 0) && (
                                        <div className="flex items-center px-5 gap-1 text-[#11254a] font-bold cursor-default select-none border-r border-gray-100 mr-4 h-[40%]">
                                            <span>+91</span>
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        </div>
                                    )}
                                    <input
                                        className="flex-1 bg-transparent border-none outline-none py-4 px-6 text-[18px] text-[#11254a] font-medium placeholder-gray-300 transition-all h-full"
                                        type="tel"
                                        placeholder={!isFocused ? "Phone Number" : ""}
                                        value={phone}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                        maxLength={10}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || phone.length !== 10}
                                style={{ backgroundColor: primaryColor }}
                                className="w-full h-16 rounded-2xl text-white text-xl font-bold hover:brightness-95 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:grayscale-[0.5]"
                            >
                                {loading ? "Sending OTP..." : "Continue"}
                            </button>
                        </form>

                        <p className="text-left text-[14px] text-gray-500 mt-10">
                            By clicking you agree to{" "}
                            <Link to="/terms-and-condition" className="text-blue-500 font-bold hover:underline transition-all">Terms and Conditions</Link>
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-[32px] font-bold text-[#11254a] mb-3">
                            Verify your number
                        </h2>
                        <div className="flex items-center gap-3 mb-10">
                            <span className="text-[24px] font-bold text-[#11254a]">
                                +91-{phone}
                            </span>
                            <button 
                                onClick={() => setAuthStep("phone")}
                                className="p-2 hover:bg-blue-50 rounded-full text-blue-500 transition-colors"
                            >
                                <Pencil className="w-6 h-6" />
                            </button>
                        </div>

                        <p className="text-[17px] font-bold text-[#11254a] mb-6">
                            Enter your 6 digit OTP
                        </p>

                        <form onSubmit={handleVerifyOtp}>
                            <div className="flex gap-3 mb-4 justify-between">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-16 sm:w-14 sm:h-16 border border-gray-200 outline-none rounded-xl text-center text-2xl font-bold text-[#11254a] focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-gray-50/50"
                                        maxLength={1}
                                    />
                                ))}
                            </div>

                            <p className="text-[15px] text-gray-500 mb-10 font-medium">
                                Haven't received yet?{" "}
                                <button 
                                    type="button"
                                    onClick={() => handleSendOtp()}
                                    className="text-blue-500 hover:underline font-bold"
                                >
                                    Resend OTP
                                </button>
                            </p>

                            <button
                                type="submit"
                                disabled={loading || otp.join("").length !== 6}
                                style={{ backgroundColor: primaryColor }}
                                className="w-full h-16 rounded-2xl text-white text-xl font-bold hover:brightness-95 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:grayscale-[0.5]"
                            >
                                {loading ? "Verifying..." : "Verify & Continue"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
