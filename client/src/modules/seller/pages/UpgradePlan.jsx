import { useState, useEffect } from "react";
import { Card, Button, message, Row, Col } from "antd";
import { Check, X, Zap, Award, Star, IndianRupee, ShieldCheck } from "lucide-react";
import api from "@/services/api";
import Loader from "@/components/Common/Loader";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const UpgradePlan = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);

  // Static Free Plan definition
  const freePlan = {
    _id: "static_free",
    name: (settings?.defaultPlanName || "BASIC").toUpperCase(),
    price: 0,
    duration: 0,
    propertyLimit: settings?.sellerPropertyLimit || 3,
    description: "Start listing for free",
    features: [
      `Upload up to ${settings?.sellerPropertyLimit || 3} properties`,
      "Medium visibility",
      "Properties appear in normal listing order"
    ],
    notIncluded: [
      "Leads available on seller dashboard",
      "WhatsApp lead integration",
      "Priority listing / top placement",
      "Advanced analytics"
    ],
    isPopular: false
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get("/subscriptions/plans");
      // Filter out any "Free" plans from backend to ensure only static one shows
      const dynamicPlans = res.data.filter(p => p.price > 0).map(p => ({
        ...p,
        name: p.name.toUpperCase(), 
        features: p.features || [],
        notIncluded: p.notIncluded || [],
        isPopular: p.isPopular || false
      }));
      
      setPlans([freePlan, ...dynamicPlans]);
    } catch {
      message.error("Failed to load plans");
      setPlans([freePlan]); // Still show free plan
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

  const fetchSettings = async () => {
    try {
      const res = await api.get("/website-settings");
      if (res.data && res.data.length > 0) {
        setSettings(res.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchMySubscription();
    fetchSettings();
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
        message.info(`${plan.name} plan is already your default.`);
        return;
    }

    setProcessingId(plan._id);
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!keyId) {
      message.error("Razorpay Key is missing. Please contact support.");
      setProcessingId(null);
      return;
    }

    const resScript = await loadRazorpayScript();

    if (!resScript) {
      message.error("Razorpay SDK failed to load. Check your internet connection.");
      setProcessingId(null);
      return;
    }

    try {
      const { data: order } = await api.post("/subscriptions/create-order", {
        planId: plan._id,
      });

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Namma Pondy Properties",
        description: `Upgrade to ${plan.name} Plan`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
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
            console.error("Payment Verification Error:", err);
            message.error(err.response?.data?.error || "Payment verification failed");
          }
        },
        prefill: {
          name: user?.name || "Customer",
          contact: user?.phone || "",
          email: user?.builderProfile?.email,
        },
        theme: {
          color: "#002B49",
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        modal: {
          confirm_close: true,
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Razorpay Order Creation Error:", error);
      message.error(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader variant="inline" /></div>;

  return (
    <div className="bg-[#F1F5F9] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">Upgrade Your Plan</h1>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto font-medium">
            Scale your real estate business with our premium subscription plans. More visibility, more leads, more sales.
          </p>
        </div>

        <Row gutter={[32, 32]} justify="center">
          {plans && plans.length > 0 ? plans.map((plan, index) => {
            const isCurrent = currentSubscription?.plan?._id === plan._id || (plan._id === 'static_free' && !currentSubscription);
            const isPopular = plan.isPopular;

            return (
              <Col xs={24} sm={12} lg={8} key={plan._id} style={{ display: 'flex' }}>
                <Card
                  className="relative w-full rounded-2xl border-none shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col bg-white"
                  bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}
                >
                  {/* Ribbon for Popular */}
                  {isPopular && (
                    <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none">
                      <div className="absolute top-6 -left-12 w-44 bg-[#e00d0d] text-white text-[10px] font-black uppercase py-1 text-center -rotate-45 shadow-xl border-b border-white/20">
                        Popular
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="py-4 text-center border-b border-gray-50 bg-white">
                    <h2 className="text-2xl font-black text-[#002B49] tracking-widest">{plan.name || "PLAN"}</h2>
                  </div>

                  {/* Price Banner */}
                  <div className={`py-3 text-center ${isPopular ? "bg-[#f97316]" : "bg-[#002B49]"}`}>
                    <div className="flex items-center justify-center text-white gap-1">
                      {plan.price === 0 ? (
                        <span className="text-xl font-bold uppercase tracking-wider">Free</span>
                      ) : (
                        <>
                          <IndianRupee size={18} strokeWidth={3} />
                          <span className="text-2xl font-black">{plan.price}</span>
                          <span className="text-xs font-bold opacity-70">/ {plan.duration} Days</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="p-6 flex-1">
                    <div className="space-y-3">
                      {plan.features && plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-4 group">
                          <Check size={18} className="text-green-500 shrink-0" strokeWidth={3} />
                          <span className="text-gray-700 font-semibold text-sm leading-tight">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.notIncluded && plan.notIncluded.map((feature, idx) => (
                        <div key={`not-${idx}`} className="flex items-center gap-4 opacity-30">
                          <X size={18} className="text-red-500 shrink-0" strokeWidth={3} />
                          <span className="text-gray-500 font-medium text-sm line-through">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Button Section */}
                  <div className="p-5 mt-auto pt-0">
                    <Button
                      type={isPopular ? "primary" : "default"}
                      block
                      size="large"
                      loading={processingId === plan._id}
                      disabled={isCurrent || (plan.price === 0 && !currentSubscription) || plan.isAlreadyPurchased}
                      onClick={() => handleUpgrade(plan)}
                      className={`h-14 rounded-md font-black text-sm uppercase tracking-widest transition-all ${
                        isPopular 
                          ? "premium-orange-btn border-none shadow-lg shadow-orange-100" 
                          : "premium-navy-btn border-2"
                      }`}
                    >
                      {isCurrent ? "Active Now" : plan.isAlreadyPurchased ? "Already Purchased" : plan.price === 0 ? "Default Plan" : "Upgrade"}
                    </Button>
                  </div>

                  <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-auto">
                    <ShieldCheck size={14} className="text-green-500" />
                    SECURE CHECKOUT
                  </div>
                </Card>
              </Col>
            );
          }) : (
            <div className="text-center p-10 bg-white rounded-xl shadow-sm w-full max-w-md">
                <p className="text-gray-500 font-medium">No plans available at the moment.</p>
                <Button onClick={fetchPlans} type="primary" className="mt-4">Retry Loading</Button>
            </div>
          )}
        </Row>
      </div>
      
      <style>{`
        .ant-card {
            border-radius: 12px !important;
        }
        .premium-orange-btn {
            background-color: #f97316 !important;
            color: #ffffff !important;
        }
        .premium-orange-btn:hover:not(:disabled) {
            background-color: #ea580c !important;
            color: #ffffff !important;
            transform: scale(1.02);
        }
        .premium-navy-btn {
            border-color: #002B49 !important;
            color: #002B49 !important;
            background: transparent !important;
        }
        .premium-navy-btn:hover:not(:disabled) {
            background-color: #002B49 !important;
            color: #ffffff !important;
            transform: scale(1.02);
        }
        .ant-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default UpgradePlan;
