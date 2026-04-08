import { useState, useEffect } from "react";
import { Card, Button, message, Tag, Spin } from "antd";
import { Check, Zap, Award, Star, IndianRupee, ShieldCheck } from "lucide-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const UpgradePlan = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get("/subscriptions/plans");
      // Filter out Free plan from upgrade options if needed, 
      // but usually good to show all. 
      // Backend should prevent "upgrading" to a lower plan if applicable.
      setPlans(res.data);
    } catch {
      message.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchMySubscription = async () => {
    try {
      const res = await api.get("/subscriptions/my-subscription");
      setCurrentSubscription(res.data);
    } catch (error) {
      console.error("No active subscription");
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchMySubscription();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (plan) => {
    if (plan.price === 0) {
        message.info("Free plan is already your default.");
        return;
    }

    setProcessingId(plan._id);
    const resScript = await loadRazorpayScript();

    if (!resScript) {
      message.error("Razorpay SDK failed to load. Check your internet connection.");
      setProcessingId(null);
      return;
    }

    try {
      // 1. Create Order
      const { data: order } = await api.post("/subscriptions/create-order", {
        planId: plan._id,
      });

      // 2. Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Namma Pondy Properties",
        description: `Upgrade to ${plan.name} Plan`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post("/subscriptions/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan._id,
            });

            if (verifyRes.data.success) {
              message.success("Subscribed successfully!");
              navigate("/seller/my-properties");
            }
          } catch (err) {
            message.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.name,
          contact: user?.phone,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      message.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Choose Your Perfect Plan</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Scale your real estate business with our premium subscription plans. More visibility, more leads, more sales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = currentSubscription?.plan?._id === plan._id;
          const isBestValue = plan.name === "Standard";
          const isUnlimited = plan.propertyLimit === -1;

          return (
            <Card
              key={plan._id}
              className={`relative rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl border-2 ${
                isBestValue ? "border-blue-500 shadow-xl" : "border-gray-100"
              }`}
              styles={{ body: { padding: 0 } }}
            >
              {isBestValue && (
                <div className="bg-blue-500 text-white text-center py-2 text-xs font-bold uppercase tracking-widest">
                  Best Value
                </div>
              )}

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${isBestValue ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600"}`}>
                    {plan.name === "Free" ? <Star size={24} /> : plan.name === "Standard" ? <Zap size={24} /> : <Award size={24} />}
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-gray-900 flex items-center">
                    <IndianRupee size={28} /> {plan.price}
                  </span>
                  <span className="text-gray-400 font-medium">/ {plan.duration ? `${plan.duration} Days` : "Lifetime"}</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-600 p-1 rounded-full">
                      <Check size={14} />
                    </div>
                    <span className="text-gray-700 font-medium">
                        {isUnlimited ? "Unlimited" : plan.propertyLimit} Property Uploads
                    </span>
                  </div>
                  {plan.features?.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="bg-green-100 text-green-600 p-1 rounded-full">
                        <Check size={14} />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  type={isBestValue ? "primary" : "default"}
                  block
                  size="large"
                  loading={processingId === plan._id}
                  disabled={isCurrent || plan.price === 0}
                  onClick={() => handleUpgrade(plan)}
                  className={`h-12 rounded-xl font-bold flex items-center justify-center gap-2 ${
                    isBestValue ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" : ""
                  }`}
                >
                  {isCurrent ? "Current Plan" : plan.price === 0 ? "Default Plan" : "Upgrade Now"}
                </Button>
              </div>

              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} className="text-green-500" />
                Secure payment via Razorpay
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UpgradePlan;
