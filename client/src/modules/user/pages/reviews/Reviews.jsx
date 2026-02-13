import { useEffect, useState } from "react";
import axios from "axios";
import {
  Star,
  Edit2,
  Trash2,
  Plus,
  Home as HomeIcon,
  Quote,
  Calendar,
  Award,
} from "lucide-react";
import { Modal, Form, Input, Rate, Button, message, Popconfirm } from "antd";
import { useAuth } from "@/context/AuthContext";

const { TextArea } = Input;

const Reviews = () => {
  const { user, isAuthenticated } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserTestimonials();
    }
  }, [isAuthenticated, user]);

  const fetchUserTestimonials = async () => {
    try {
      setLoading(true);
      const userId = user?.user?._id || user?._id;
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/testimonials/user/${userId}`,
      );
      console.log("User testimonials data:", res.data); // Debug log
      setTestimonials(res.data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      message.error("Failed to load your reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateTestimonial = async (values) => {
    setSubmitLoading(true);
    try {
      const userId = user?.user?._id || user?._id;
      const userName = user?.user?.name || user?.name || "User";
      const testimonialData = {
        ...values,
        user_id: userId,
        name: userName,
      };

      if (editingTestimonial) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/testimonials/${editingTestimonial._id}`,
          testimonialData,
        );
        message.success("Review updated successfully!");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/testimonials`,
          testimonialData,
        );
        message.success("Review submitted for approval!");
      }

      setIsModalOpen(false);
      setEditingTestimonial(null);
      form.resetFields();
      fetchUserTestimonials();
    } catch (error) {
      message.error(
        editingTestimonial
          ? "Failed to update review"
          : "Failed to submit review",
      );
      console.error("Error:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    form.setFieldsValue({
      role: testimonial.role,
      rating: testimonial.rating,
      content: testimonial.content,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (testimonialId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/testimonials/${testimonialId}`,
      );
      message.success("Review deleted successfully");
      fetchUserTestimonials();
    } catch (error) {
      message.error("Failed to delete review");
      console.error("Error:", error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    form.resetFields();
  };

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500 text-white border-emerald-600";
      case "pending":
        return "bg-amber-500 text-white border-amber-600";
      case "rejected":
        return "bg-rose-500 text-white border-rose-600";
      default:
        return "bg-slate-500 text-white border-slate-600";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-slate-100">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <HomeIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-slate-500 mb-6">
            Please log in to manage your reviews.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-800">
              My Reviews
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Share your experiences and help others make informed decisions.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Write New Review
          </button>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse h-80"
              >
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-20 bg-slate-200 rounded mb-4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="max-w-md mx-auto">
              <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-800 mb-3">
                No Reviews Yet
              </h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                You haven't shared any experiences yet. Your reviews help others
                make better choices.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all"
              >
                Start writing your first review &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>

                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <Award className="w-8 h-8 text-amber-400" />
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur-sm bg-opacity-90 ${getStatusBadgeStyles(testimonial.status)}`}
                    >
                      {testimonial.status}
                    </span>
                  </div>

                  {/* User Info */}
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {testimonial.name}
                    </h3>
                    <p className="text-slate-300 text-sm">
                      {testimonial.role || "User"}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-600 text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Review Text */}
                  <div className="relative bg-slate-50 rounded-xl p-4 mb-6 flex-1">
                    <Quote className="absolute top-3 left-3 w-5 h-5 text-slate-300 opacity-50 transform scale-x-[-1]" />
                    <p className="text-slate-600 text-sm italic leading-relaxed pl-4 line-clamp-4">
                      "{testimonial.content}"
                    </p>
                  </div>

                  {/* Footer Info & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center text-xs font-medium text-slate-400">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(testimonial.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(testimonial)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit Review"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <Popconfirm
                        title="Delete Review"
                        description="Are you sure you want to remove this review?"
                        onConfirm={() => handleDelete(testimonial._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true, size: "small" }}
                        cancelButtonProps={{ size: "small" }}
                      >
                        <button
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - Write/Edit Review */}
      <Modal
        title={
          <div className="text-xl font-serif font-bold text-slate-800">
            {editingTestimonial ? "Edit Your Review" : "Share Your Experience"}
          </div>
        }
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        className="rounded-2xl"
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdateTestimonial}
          className="mt-6"
        >
          {/* Display User Name */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {(user?.user?.name || user?.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                  Reviewing as
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {user?.user?.name || user?.name || "User"}
                </p>
              </div>
            </div>
          </div>

          <Form.Item
            name="rating"
            label={
              <span className="font-medium text-slate-700">Overall Rating</span>
            }
            rules={[{ required: true, message: "Please provide a rating" }]}
          >
            <Rate className="text-amber-400 text-2xl" />
          </Form.Item>

          <Form.Item
            name="content"
            label={
              <span className="font-medium text-slate-700">Your Review</span>
            }
            rules={[{ required: true, message: "Please share your thoughts" }]}
          >
            <TextArea
              rows={5}
              placeholder="Share your experience with our service..."
              maxLength={500}
              showCount
              className="rounded-lg border-slate-300 focus:border-slate-500 hover:border-slate-400"
            />
          </Form.Item>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <Button
              size="large"
              onClick={handleModalClose}
              className="border-slate-300 text-slate-600 hover:text-slate-800 hover:border-slate-400"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              size="large"
              className="bg-slate-900 hover:bg-slate-800 border-none shadow-md"
            >
              {editingTestimonial ? "Update Review" : "Submit Review"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Reviews;
