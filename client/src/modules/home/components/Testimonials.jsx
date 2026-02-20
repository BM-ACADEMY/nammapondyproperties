import { useEffect, useState } from "react";
import axios from "axios";
import { Star, MessageSquarePlus } from "lucide-react";
import { Modal, Form, Input, Rate, Button, message } from "antd";
import { useAuth } from "@/context/AuthContext";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [submitLoading, setSubmitLoading] = useState(false);

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

  const handleCreateReview = async (values) => {
    if (!isAuthenticated) return message.error("Please login to write a review");

    setSubmitLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/testimonials`, {
        ...values,
        user_id: user?.user?._id || user?._id,
        name: user?.user?.name || user?.name || "User",
        role: "User",
      });
      message.success("Review submitted");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Submission error:", error);
      message.error("Failed to submit review");
    } finally {
      setSubmitLoading(false);
    }
  };

  const halfLength = Math.ceil(testimonials.length / 2);
  const row1Data = testimonials.length < 4 ? testimonials : testimonials.slice(0, halfLength);
  const row2Data = testimonials.length < 4 ? testimonials : testimonials.slice(halfLength);

  const renderCard = (item, index) => (
    <div
      key={`${item._id}-${index}`}
      // CHANGED: Replaced border-[0.5px] with standard 'border' (1px thick) for better visibility
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
        "{item.content}"
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

  return (
    <>
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scrollReverse {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-scroll {
            animation: scroll 25s linear infinite;
          }
          .animate-scroll-reverse {
            animation: scrollReverse 25s linear infinite;
          }
          .animate-scroll:hover, .animate-scroll-reverse:hover {
             animation-play-state: paused;
          }
        `}
      </style>

      <section className="bg-slate-50 py-20 px-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="text-center md:text-left">
              <div className="inline-block px-4 py-1.5 mb-6 border border-[#eeb920] rounded-full bg-yellow-50/50">
                <span className="uppercase tracking-[0.2em] text-xs font-bold text-[#eeb920]">
                  Loved by clients
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">
                What people are saying
              </h2>
              <p className="text-slate-600 text-lg font-light max-w-md md:mx-0 mx-auto leading-relaxed">
                Real feedback from happy homeowners and property buyers who found their perfect match in Pondicherry.
              </p>
            </div>

            {isAuthenticated && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 rounded-md transition-all flex items-center shadow-md hover:shadow-lg font-medium shrink-0 text-slate-900 hover:-translate-y-0.5 duration-300"
                style={{ backgroundColor: brandYellow }}
              >
                <MessageSquarePlus className="w-5 h-5 mr-2" />
                Write a Review
              </button>
            )}
          </div>

          {/* Testimonials Marquee Section */}
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
                maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
              }}
            >
              {row1Data.length > 0 && (
                <div className="flex w-fit animate-scroll gap-6 hover:[animation-play-state:paused] pt-1 pb-1">
                  {[...row1Data, ...row1Data, ...row1Data].map((testimonial, index) =>
                    renderCard(testimonial, `row1-${index}`)
                  )}
                </div>
              )}

              {row2Data.length > 0 && (
                <div className="flex w-fit animate-scroll-reverse gap-6 hover:[animation-play-state:paused] pb-1">
                  {[...row2Data, ...row2Data, ...row2Data].map((testimonial, index) =>
                    renderCard(testimonial, `row2-${index}`)
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Logic */}
        <Modal
          title={<span className="text-slate-800 font-medium text-lg">Write a Review</span>}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={500}
        >
          <Form layout="vertical" onFinish={handleCreateReview} className="mt-4">
            {/* CHANGED: Reverted to standard 'border' here as well */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner"
                  style={{ backgroundColor: brandBlue }}
                >
                  {(user?.user?.name || user?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    Reviewing as
                  </p>
                  <p className="text-lg font-medium text-slate-800">
                    {user?.user?.name || user?.name || "User"}
                  </p>
                </div>
              </div>
            </div>

            <Form.Item
              name="rating"
              label={<span className="text-slate-700 font-medium">Rating</span>}
              rules={[{ required: true, message: "Please provide a rating" }]}
            >
              <Rate style={{ color: brandYellow }} />
            </Form.Item>
            
            <Form.Item
              name="content"
              label={<span className="text-slate-700 font-medium">Review</span>}
              rules={[{ required: true, message: "Please write something" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Share your experience with Namma Pondy..."
                maxLength={300}
                showCount
                className="rounded-lg hover:border-[#1a65a4] focus:border-[#1a65a4]"
              />
            </Form.Item>
            
            <div className="flex gap-3 justify-end mt-8">
              <Button onClick={() => setIsModalOpen(false)} className="rounded-md h-10 px-6">
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitLoading}
                className="rounded-md h-10 px-6 border-none text-slate-900 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: brandYellow }}
              >
                Submit Review
              </Button>
            </div>
          </Form>
        </Modal>
      </section>
    </>
  );
};

export default Testimonials;