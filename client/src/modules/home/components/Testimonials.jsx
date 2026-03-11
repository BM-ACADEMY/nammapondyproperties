import { useEffect, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

const STAR_LABELS = ["Poor", "Fair", "Average", "Good", "Excellent"];
const ROLE_OPTIONS = ["Owner", "Tenant", "Former Resident", "Real Estate Agent"];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const [submitLoading, setSubmitLoading] = useState(false);

  // Step 1: hover/selected rating
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  // Step 2: form expansion
  const [showForm, setShowForm] = useState(false);
  const [city, setCity] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [reviewerName, setReviewerName] = useState(
    user?.user?.name || user?.name || ""
  );
  const [reviewText, setReviewText] = useState("");

  // Brand Colors
  const brandBlue = "#1a65a4";
  const brandYellow = "#eeb920";

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/testimonials/approved`
        );
        setTestimonials(res.data);
      } catch (error) {
        console.error("Error fetching testimonials", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Pre-fill name when user loads
  useEffect(() => {
    setReviewerName(user?.user?.name || user?.name || "");
  }, [user]);

  const handleStarClick = (rating) => {
    if (!isAuthenticated) {
      toast.error("Please login to write a review");
      return;
    }
    setSelectedRating(rating);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!city.trim()) return toast.error("Please enter your city");
    if (!selectedRole) return toast.error("Please select how you're described");
    if (!reviewerName.trim()) return toast.error("Please enter your name");
    if (!reviewText.trim()) return toast.error("Please write your review");

    setSubmitLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/testimonials`, {
        rating: selectedRating,
        content: reviewText,
        city,
        role: selectedRole,
        name: reviewerName,
        user_id: user?.user?._id || user?._id,
      });
      toast.success("Review submitted for approval!");
      // Reset
      setSelectedRating(0);
      setHoverRating(0);
      setShowForm(false);
      setCity("");
      setSelectedRole("");
      setReviewText("");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Scrolling card renderer
  const halfLength = Math.ceil(testimonials.length / 2);
  const row1Data = testimonials.length < 4 ? testimonials : testimonials.slice(0, halfLength);
  const row2Data = testimonials.length < 4 ? testimonials : testimonials.slice(halfLength);

  const renderCard = (item, index) => (
    <div
      key={`${item._id}-${index}`}
      className="bg-white border-2 border-slate-200 hover:border-slate-300 rounded-2xl p-6 shrink-0 w-[350px] transition-colors duration-300"
    >
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < item.rating ? "fill-[#eeb920] text-[#eeb920]" : "text-gray-200"}`}
          />
        ))}
      </div>
      <p className="text-slate-700 text-sm mb-6 whitespace-normal line-clamp-4 leading-relaxed">
        &ldquo;{item.content}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold shadow-sm bg-[#1a65a4]/10 text-[#1a65a4]">
          {item.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-medium text-slate-800 text-sm">{item.name}</p>
          <p className="text-slate-500 text-xs">{item.role || "User"}</p>
        </div>
      </div>
    </div>
  );

  const displayRating = hoverRating || selectedRating;

  return (
    <>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll { animation: scroll 25s linear infinite; }
        .animate-scroll-reverse { animation: scrollReverse 25s linear infinite; }
        .review-form-enter {
          animation: reviewFormSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes reviewFormSlideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section className="bg-slate-50 py-20 px-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">

          {/* ── Rating Banner ── */}
          {/* CHANGED: Background to the soft light gray/cyan theme, added Outfit font, added subtle gold border */}
          <div className="rounded-[24px] mb-10 overflow-hidden bg-[#f6f9fa] border border-[#c19b48]/10 font-['Outfit',_sans-serif]">
            <div className="flex flex-col sm:flex-row items-center gap-6 px-8 py-7">

              {/* Illustration */}
              <div className="shrink-0 w-28 sm:w-36 select-none">
                <svg viewBox="0 0 160 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                  {/* Chat bubble 1 - CHANGED to Gold */}
                  <rect x="72" y="10" width="52" height="28" rx="8" fill="#c19b48" opacity="0.85" />
                  <polygon points="80,38 88,46 96,38" fill="#c19b48" opacity="0.85" />
                  <rect x="78" y="17" width="12" height="3" rx="1.5" fill="white" opacity="0.8" />
                  <rect x="78" y="23" width="20" height="3" rx="1.5" fill="white" opacity="0.6" />
                  {/* Chat bubble 2 - CHANGED to Slate */}
                  <rect x="60" y="20" width="16" height="16" rx="6" fill="#38526e" opacity="0.75" />
                  <text x="68" y="32" textAnchor="middle" fontSize="9" fill="white">👍</text>
                  {/* Heart bubble - CHANGED to Deep Navy */}
                  <rect x="44" y="46" width="22" height="22" rx="6" fill="#0e182b" opacity="0.8" />
                  <text x="55" y="62" textAnchor="middle" fontSize="11" fill="#c19b48">♥</text>
                  {/* Couch - Adjusted tones */}
                  <rect x="12" y="86" width="110" height="30" rx="10" fill="#e2e8f0" opacity="0.5" />
                  <rect x="8" y="78" width="20" height="38" rx="8" fill="#cbd5e1" opacity="0.6" />
                  <rect x="104" y="78" width="20" height="38" rx="8" fill="#cbd5e1" opacity="0.6" />
                  {/* Person body - CHANGED to Slate */}
                  <rect x="38" y="68" width="56" height="32" rx="8" fill="#38526e" opacity="0.9" />
                  {/* Head */}
                  <circle cx="65" cy="58" r="14" fill="#f4c09a" />
                  {/* Hair */}
                  <ellipse cx="65" cy="48" rx="13" ry="7" fill="#0e182b" />
                  <path d="M52 52 Q48 72 50 80" stroke="#0e182b" strokeWidth="7" strokeLinecap="round" fill="none" />
                  {/* Laptop - CHANGED to Deep Navy */}
                  <rect x="34" y="88" width="64" height="36" rx="5" fill="#0e182b" opacity="0.9" />
                  <rect x="36" y="90" width="60" height="30" rx="4" fill="#1a2b4c" opacity="0.9" />
                  <rect x="22" y="122" width="88" height="5" rx="3" fill="#0e182b" opacity="0.7" />
                  {/* Screen glow - CHANGED to Gold glow */}
                  <rect x="38" y="92" width="56" height="26" rx="3" fill="#c19b48" opacity="0.2" />
                </svg>
              </div>

              {/* Rating Content */}
              <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
                <div className="text-center sm:text-left">
                  {/* CHANGED: Text to Deep Navy */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0e182b] mb-4 leading-snug">
                    How would you rate your locality / society?
                  </h3>

                  {/* Stars */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleStarClick(star)}
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        {/* CHANGED: Star colors to Gold */}
                        <svg
                          width="34" height="34" viewBox="0 0 24 24"
                          fill={star <= displayRating ? "#c19b48" : "none"}
                          stroke={star <= displayRating ? "#c19b48" : "#cbd5e1"}
                          strokeWidth="1.5"
                          className="transition-all duration-150"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Label */}
                  <div className="h-6 mt-2">
                    {displayRating > 0 && (
                      <p
                        className="text-sm font-bold tracking-wide transition-all duration-200"
                        // CHANGED: Label text color to Gold
                        style={{ color: "#c19b48", paddingLeft: `${(displayRating - 1) * 42 + 8}px` }}
                      >
                        {STAR_LABELS[displayRating - 1]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Expandable Form (Step 2) ── */}
          {showForm && (
            <div className="review-form-enter mb-12 font-['Outfit',_sans-serif]">
              {/* CHANGED: Softened border and rounded corners */}
              <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(14,24,43,0.04)] border border-gray-100 flex flex-col lg:flex-row overflow-hidden">

                {/* Left: Form */}
                <div className="flex-1 p-8 lg:p-10">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-8">
                    {/* CHANGED: Icon background to Gold tint, stroke to Navy/Gold */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#c19b48]/10 border border-[#c19b48]/20">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="3" fill="#c19b48" opacity="0.2" />
                        <path d="M8 12h8M8 8h5M8 16h6" stroke="#0e182b" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M17 16l2-2-2-2" stroke="#c19b48" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      {/* CHANGED: Text to Navy */}
                      <h3 className="text-xl font-bold text-[#0e182b] leading-tight">Write a Review</h3>
                      <p className="text-sm text-[#38526e] mt-0.5">Review your society/locality &amp; help others in making a right decision</p>
                    </div>
                  </div>

                  {/* Selected Rating Display */}
                  <div className="flex items-center gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setSelectedRating(s)} className="focus:outline-none">
                        {/* CHANGED: Star colors to Gold */}
                        <svg width="22" height="22" viewBox="0 0 24 24"
                          fill={s <= selectedRating ? "#c19b48" : "none"}
                          stroke={s <= selectedRating ? "#c19b48" : "#cbd5e1"}
                          strokeWidth="1.5">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                    {/* CHANGED: Text to Gold */}
                    <span className="ml-2 text-xs font-bold text-[#c19b48] uppercase tracking-wider">
                      {STAR_LABELS[selectedRating - 1]}
                    </span>
                  </div>

                  {/* Add Location */}
                  <div className="mb-5">
                    {/* CHANGED: Label text to Navy */}
                    <label className="block text-sm font-bold text-[#0e182b] mb-2">Add location</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      // CHANGED: Focus rings updated to Navy/Gold
                      className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0e182b] placeholder-slate-400 focus:outline-none focus:border-[#c19b48] focus:ring-1 focus:ring-[#c19b48]/30 transition-all bg-[#f6f9fa]/50 focus:bg-white"
                    />
                  </div>

                  {/* Role Chips */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-[#0e182b] mb-3">You&rsquo;re best described as...</label>
                    <div className="flex flex-wrap gap-2.5">
                      {ROLE_OPTIONS.map((role) => (
                        <button
                          key={role}
                          onClick={() => setSelectedRole(role)}
                          // CHANGED: Active state to Navy/Gold, Inactive state subtle
                          className={`px-5 py-2 rounded-full border text-sm font-semibold transition-all duration-300
                            ${selectedRole === role
                              ? "border-[#0e182b] bg-[#0e182b] text-white shadow-md shadow-[#0e182b]/10"
                              : "border-gray-200 text-[#38526e] hover:border-[#c19b48] hover:text-[#0e182b] bg-white"
                            }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reviewer Name */}
                  <div className="mb-5">
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="Your name"
                      className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0e182b] placeholder-slate-400 focus:outline-none focus:border-[#c19b48] focus:ring-1 focus:ring-[#c19b48]/30 transition-all bg-[#f6f9fa]/50 focus:bg-white"
                    />
                    <p className="text-xs text-[#38526e] mt-2 font-medium">This name will be shown on your review.</p>
                  </div>

                  {/* Review Text */}
                  <div className="mb-8">
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience with this locality..."
                      rows={4}
                      maxLength={400}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0e182b] placeholder-slate-400 focus:outline-none focus:border-[#c19b48] focus:ring-1 focus:ring-[#c19b48]/30 transition-all resize-none bg-[#f6f9fa]/50 focus:bg-white"
                    />
                    <p className="text-xs text-[#38526e] mt-1.5 text-right font-medium">{reviewText.length}/400</p>
                  </div>

                  {/* Submit */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleSubmit}
                      disabled={submitLoading}
                      // CHANGED: Submit button is now Deep Navy
                      className="px-8 py-3 rounded-full bg-[#0e182b] text-white font-bold text-sm transition-all hover:bg-[#1a2b4c] active:scale-[0.98] disabled:opacity-60 shadow-md shadow-[#0e182b]/20"
                    >
                      {submitLoading ? "Submitting..." : "Post Review"}
                    </button>
                    <button
                      onClick={() => { setShowForm(false); setSelectedRating(0); }}
                      // CHANGED: Cancel button to Slate
                      className="text-sm font-semibold text-[#38526e] hover:text-[#c19b48] transition-colors px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Right: Tips Card */}
                {/* CHANGED: Background to Theme's Light Cyan/Gray */}
                <div className="lg:w-80 bg-[#f6f9fa] border-t lg:border-t-0 lg:border-l border-gray-100 p-8 flex flex-col">
                  {/* Tips icon */}
                  <div className="mb-6">
                    <div className="w-12 h-12 relative">
                      {/* CHANGED: Accent boxes to Navy and Gold */}
                      <div className="absolute bottom-0 left-0 w-9 h-9 rounded-xl bg-[#c19b48]" style={{ opacity: 0.8 }}></div>
                      <div className="absolute top-0 right-0 w-8 h-8 rounded-xl bg-[#0e182b]" style={{ opacity: 0.95 }}></div>
                    </div>
                  </div>
                  {/* CHANGED: Typography updated */}
                  <h4 className="text-lg font-bold text-[#0e182b] mb-1">Tips for a good review</h4>
                  <p className="text-xs text-[#38526e] font-medium mb-8">Your opinion &amp; contribution matters!</p>

                  <div className="space-y-6">
                    {[
                      {
                        icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c19b48" strokeWidth="2" strokeLinecap="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        ),
                        title: "Write about your experiences",
                        desc: "About your lifestyle, commute, safety etc.",
                      },
                      {
                        icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c19b48" strokeWidth="2" strokeLinecap="round">
                            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                            <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                          </svg>
                        ),
                        title: "Highlight both Positives & Negatives",
                        desc: "Mention your likes, dislikes, concerns",
                      },
                      {
                        icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c19b48" strokeWidth="2" strokeLinecap="round">
                            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                          </svg>
                        ),
                        title: "Follow our Community Guidelines",
                        desc: (
                          <>Don&rsquo;t use offensive language.{" "}
                            <span className="text-[#c19b48] font-bold cursor-pointer hover:underline transition-all">Read Guidelines</span>
                          </>
                        ),
                      },
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-4">
                        {/* CHANGED: Icon containers have subtle gold border */}
                        <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-white border border-[#c19b48]/20 flex items-center justify-center shadow-sm">
                          {tip.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0e182b]">{tip.title}</p>
                          <p className="text-xs text-[#38526e] mt-1 leading-relaxed font-medium">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Section Header ── */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">
                What people are saying
              </h2>
              <p className="text-slate-600 text-lg font-light max-w-md md:mx-0 mx-auto leading-relaxed">
                Real feedback from happy homeowners and property buyers who found their perfect match in Pondicherry.
              </p>
            </div>
          </div>

          {/* ── Scrolling Cards ── */}
          {loading ? (
            <div className="text-center py-12 text-slate-500 animate-pulse">
              Loading amazing reviews...
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
              <p className="text-slate-500 mb-4">No reviews yet. Be the first to share your experience!</p>
              {!isAuthenticated && (
                <p className="text-sm text-slate-400">Please login to write a review.</p>
              )}
            </div>
          ) : (
            <div
              className="space-y-8 relative"
              style={{
                maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
              }}
            >
              {row1Data.length > 0 && (
                <div className="flex w-fit animate-scroll gap-6 hover:[animation-play-state:paused] pt-1 pb-1">
                  {[...row1Data, ...row1Data, ...row1Data].map((t, i) => renderCard(t, `row1-${i}`))}
                </div>
              )}
              {row2Data.length > 0 && (
                <div className="flex w-fit animate-scroll-reverse gap-6 hover:[animation-play-state:paused] pb-1">
                  {[...row2Data, ...row2Data, ...row2Data].map((t, i) => renderCard(t, `row2-${i}`))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Testimonials;