
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, MessageSquarePlus } from 'lucide-react';
import { Modal, Form, Input, Rate, Button, message } from 'antd';
import { useAuth } from '../../../context/AuthContext';


const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/testimonials/approved`);
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
                user_id: user.user._id || user._id, // Handle auth structure quirk
                name: user.user?.name || user?.name || 'User',
            });
            message.success("Review submitted for approval!");
            setIsModalOpen(false);
        } catch (error) {
            message.error("Failed to submit review");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-12">
                    <div className="text-left">
                        <h2 className="text-3xl font-bold text-gray-800">What Our Clients Say</h2>
                        <p className="text-gray-600 mt-2">Real stories from happy homeowners</p>
                    </div>
                    {isAuthenticated && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center shadow-lg"
                        >
                            <MessageSquarePlus className="w-5 h-5 mr-2" />
                            Write a Review
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading Reviews...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials?.map((item) => (
                            <div key={item._id} className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold mr-3">
                                        {item.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                        <span className="text-xs text-gray-500">{item.role}</span>
                                    </div>
                                </div>
                                <div className="flex text-yellow-500 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < item.rating ? 'fill-current' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm italic">"{item.content}"</p>
                            </div>
                        ))}
                        {testimonials?.length === 0 && <div className="col-span-3 text-center text-gray-500">No reviews yet. Be the first to write one!</div>}
                    </div>
                )}
            </div>

            <Modal title="Write a Review" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form layout="vertical" onFinish={handleCreateReview}>
                    <Form.Item name="rating" label="Rating" rules={[{ required: true }]}>
                        <Rate />
                    </Form.Item>
                    <Form.Item name="content" label="Review" rules={[{ required: true, message: 'Please write something' }]}>
                        <Input.TextArea rows={4} placeholder="Share your experience..." />
                    </Form.Item>
                    <div className="text-right">
                        <Button type="primary" htmlType="submit" loading={submitLoading}>Submit Review</Button>
                    </div>
                </Form>
            </Modal>
        </section>
    );
};

export default Testimonials;
