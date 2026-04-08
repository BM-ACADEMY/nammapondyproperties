import { useState, useEffect, useCallback } from "react";
import { Table, Card, Typography, message, Tag, Row, Col, Progress, Button, Empty } from "antd";
import { 
  Clock, 
  IndianRupee, 
  CreditCard, 
  ArrowUpCircle, 
  Zap, 
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import api from "@/services/api";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const { Title, Text } = Typography;

const SellerPaymentHistory = () => {
  const [history, setHistory] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [propertyCount, setPropertyCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [historyRes, subRes, propertiesRes] = await Promise.all([
        api.get("/subscriptions/my-history"),
        api.get("/subscriptions/my-subscription"),
        api.get(`/properties/fetch-all-property?limit=100&seller_id=${user._id}`)
      ]);
      
      setHistory(historyRes.data);
      setSubscription(subRes.data);
      if (propertiesRes.data && propertiesRes.data.properties) {
        setPropertyCount(propertiesRes.data.properties.length);
      }
    } catch (error) {
      console.error("Failed to fetch billing data", error);
      message.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const planName = subscription?.plan?.name || "Free Plan";
  const planPrice = subscription?.plan?.price || 0;
  const propertyLimit = subscription?.plan?.propertyLimit || 3;
  const usagePercent = propertyLimit === -1 ? 0 : Math.min(100, (propertyCount / propertyLimit) * 100);

  const columns = [
    {
      title: "Date",
      dataIndex: "transactionDate",
      key: "date",
      render: (date) => (
        <span className="text-gray-500 font-medium">
          {moment(date).format("MMM DD, YYYY")}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "planName",
      key: "description",
      render: (name) => (
        <span className="font-semibold text-gray-700 capitalize">
          {name} - {subscription?.plan?.duration ? `${subscription.plan.duration} Days` : "Lifetime"}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (val) => (
        <span className="font-bold text-gray-900 flex items-center">
          <IndianRupee size={12} className="mr-0.5" />
          {parseFloat(val).toLocaleString('en-IN')}.00
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      key: "status",
      render: (status) => {
        const isSuccess = status === "completed" || status === "success";
        return (
          <Tag 
            icon={isSuccess ? <CheckCircle2 size={12} className="mr-1" /> : <AlertCircle size={12} className="mr-1" />}
            color={isSuccess ? "green" : "red"} 
            className="rounded-full px-3 py-0.5 border-none font-bold flex items-center w-fit capitalize"
          >
            {isSuccess ? "Paid" : "Failed"}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-white px-8 py-12 border-b border-gray-100">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Title level={1} className="mb-2! text-4xl! font-bold tracking-tight text-gray-900">Billing</Title>
          <Text className="text-gray-500 text-lg">
            Manage your subscription, view payment history, and update your billing details — all in one place.
          </Text>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <Title level={4} className="mb-6! text-gray-800 flex items-center gap-2">
          Subscription Overview
        </Title>

        <Row gutter={[24, 24]} className="mb-12">
          {/* Current Plan Card */}
          <Col xs={24} lg={12}>
            <Card className="rounded-3xl border-gray-200/60 shadow-sm h-full hover:shadow-md transition-all group overflow-hidden">
               <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                        <Text className="text-gray-400 font-semibold uppercase tracking-widest text-xs mb-2 block">Current Plan</Text>
                        <div className="flex items-center gap-3">
                            <Tag color="green" className="bg-green-50 text-green-600 border-green-100 rounded-full px-4 py-1 font-bold">
                                {planName}
                            </Tag>
                        </div>
                    </div>
                    <Button 
                      type="primary" 
                      size="large"
                      onClick={() => navigate("/seller/upgrade-plan")}
                      className="bg-[#1F2937] hover:bg-gray-800! border-none h-12 px-8 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-gray-200 transition-transform group-hover:scale-[1.02]"
                    >
                      Upgrade <Zap size={18} fill="currentColor" />
                    </Button>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">₹{planPrice.toLocaleString('en-IN')}</span>
                        <Text className="text-gray-400 font-medium">/ {subscription?.plan?.duration ? `${subscription.plan.duration} Days` : "Lifetime"}</Text>
                    </div>
                  </div>
               </div>
            </Card>
          </Col>

          {/* Usage Summary Card */}
          <Col xs={24} lg={12}>
            <Card className="rounded-3xl border-gray-200/60 shadow-sm h-full hover:shadow-md transition-all">
                <Text className="text-gray-400 font-semibold uppercase tracking-widest text-xs mb-6 block">Usage Summary</Text>
                
                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <span className="text-2xl font-bold text-gray-900">{propertyCount}</span>
                                <span className="text-gray-400 text-lg font-medium"> / {propertyLimit === -1 ? "Unlimited" : propertyLimit}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{Math.round(usagePercent)}% USED</span>
                        </div>
                        <Progress 
                            percent={usagePercent} 
                            showInfo={false} 
                            strokeColor="#64748B" 
                            trailColor="#F1F5F9"
                            strokeWidth={10}
                            className="rounded-full"
                        />
                        <Text className="text-gray-400 text-xs mt-2 block font-medium">Properties Uploaded</Text>
                    </div>
                </div>
            </Card>
          </Col>
        </Row>

        <div className="flex justify-between items-center mb-6">
            <Title level={4} className="m-0! text-gray-800">Billing History</Title>
        </div>

        <Card className="rounded-3xl border-gray-100 shadow-xl shadow-slate-200/20 overflow-hidden" bodyStyle={{ padding: 0 }}>
          <Table
            dataSource={history}
            columns={columns}
            loading={loading}
            rowKey="_id"
            pagination={{ 
              pageSize: 10,
              className: "px-6 py-4",
            }}
            scroll={{ x: true }}
            className="billing-table"
            locale={{
              emptyText: <Empty description="No transactions found" className="py-20" />
            }}
          />
        </Card>
      </div>

      <style jsx>{`
        .billing-table :global(.ant-table-thead > tr > th) {
          background: #F8FAFC;
          color: #94A3B8;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #F1F5F9;
          padding: 16px 24px;
        }
        .billing-table :global(.ant-table-tbody > tr > td) {
          padding: 20px 24px;
          border-bottom: 1px solid #F8FAFC;
        }
        .billing-table :global(.ant-table-tbody > tr:hover > td) {
          background: #FBFDFF !important;
        }
      `}</style>
    </div>
  );
};

export default SellerPaymentHistory;
