import { useState, useEffect } from "react";
import { Table, Tag, message, Card, Input, Row, Col } from "antd";

import { CreditCard, IndianRupee, User, Calendar, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import axios from "axios";
import moment from "moment";
import Loader from "@/components/Common/Loader";

const API = import.meta.env.VITE_API_URL;

const PaymentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredHistory = history.filter((record) => {
    const searchLower = searchText.toLowerCase();
    const nameMatch = record.user?.name?.toLowerCase().includes(searchLower);
    const phoneMatch = record.user?.phone?.toLowerCase().includes(searchLower);
    const txMatch = record.razorpayPaymentId?.toLowerCase().includes(searchLower);
    const planMatch = record.plan?.name?.toLowerCase().includes(searchLower);
    return nameMatch || phoneMatch || txMatch || planMatch;
  });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/subscriptions/admin/payments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setHistory(res.data);
    } catch {
      message.error("Failed to fetch payment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const columns = [
    {
      title: "Seller",
      key: "user",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{record.user?.name || "N/A"}</span>
          <span className="text-xs text-gray-500">{record.user?.phone || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Plan",
      key: "plan",
      render: (_, record) => (
        <Tag color="blue" className="rounded-lg font-semibold px-3 py-1 border-none shadow-sm">
          {record.plan?.name || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) => (
        <div className="flex items-center gap-1 font-bold text-gray-900 whitespace-nowrap">
          <IndianRupee size={14} />
          <span>{record.amountPaid || record.plan?.price || 0}</span>
        </div>
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => {
        let color = "orange";
        if (status === "completed") { color = "green"; }
        if (status === "failed") { color = "red"; }
        
        return (
          <Tag color={color} className="w-fit rounded-lg px-3 py-1 border-none shadow-sm capitalize font-semibold whitespace-nowrap">
            <span>{status}</span>
          </Tag>
        );
      },
    },
    {
      title: "Plan Status",
      key: "planStatus",
      render: (_, record) => {
        const expiryDate = record.expiryDate;
        if (!expiryDate) return <Tag color="default">N/A</Tag>;

        const now = moment();
        const expiry = moment(expiryDate);
        const diffDays = expiry.diff(now, 'days');

        if (expiry.isBefore(now)) {
          return <Tag color="red" className="rounded-lg px-3 py-1 font-semibold uppercase">Expired</Tag>;
        } else if (diffDays <= 7) {
          return <Tag color="orange" className="rounded-lg px-3 py-1 font-semibold uppercase">Expiring Soon</Tag>;
        } else {
          return <Tag color="green" className="rounded-lg px-3 py-1 font-semibold uppercase">Active</Tag>;
        }
      },
    },
    {
      title: "Transaction ID",
      dataIndex: "razorpayPaymentId",
      key: "razorpayPaymentId",
      render: (id) => <span className="text-xs font-mono text-gray-500">{id || "N/A"}</span>,
    },
    {
      title: "Date",
      key: "transactionDate",
      render: (_, record) => {
        const date = record.transactionDate || record.createdAt;
        return (
          <div className="flex flex-col text-xs text-gray-500 font-medium">
            <span>{moment(date).format("DD MMM YYYY")}</span>
            <span>{moment(date).format("hh:mm A")}</span>
          </div>
        );
      },
      sorter: (a, b) => new Date(a.transactionDate || a.createdAt) - new Date(b.transactionDate || b.createdAt),
    },
    {
      title: "Expire Date",
      key: "expiryDate",
      render: (_, record) => {
        const date = record.expiryDate;
        if (!date) return <span className="text-xs text-gray-400 font-medium italic">N/A</span>;

        const now = moment();
        const expiry = moment(date);
        const diffDays = expiry.diff(now, 'days');

        let textColor = "text-gray-500";
        let bgColor = "bg-gray-50";

        if (expiry.isBefore(now)) {
          textColor = "text-red-600";
          bgColor = "bg-red-50";
        } else if (diffDays <= 7) {
          textColor = "text-orange-600";
          bgColor = "bg-orange-50";
        }

        return (
          <div className={`flex flex-col text-xs ${textColor} font-bold ${bgColor} p-2 rounded-lg text-center border border-current/10 min-w-[100px]`}>
            <span>{expiry.format("DD MMM YYYY")}</span>
            {diffDays >= 0 && diffDays <= 7 && <span className="text-[9px] uppercase mt-0.5">{diffDays === 0 ? "Expires Today" : `In ${diffDays} Days`}</span>}
          </div>
        );
      },
    },

  ];

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shadow-inner">
              <Calendar size={24} />
            </div>
            Payment History
          </h1>
          <p className="text-gray-500 text-sm">
            Overview of all subscription transactions across the platform
          </p>
        </div>

        <div className="w-full md:w-80">
          <Input
            placeholder="Search by name, phone, plan or ID..."
            prefix={<Search size={16} className="text-gray-400 mr-2" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-xl px-4 py-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-10"
            allowClear
          />
        </div>
      </div>
      
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-blue-50/50 hover:bg-blue-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                <CreditCard size={24} />
              </div>
              <div>
                <div className="text-blue-600 font-semibold text-xs uppercase tracking-wider">Total Payments</div>
                <div className="text-2xl font-bold text-gray-800">{loading ? "..." : history.length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-emerald-50/50 hover:bg-emerald-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="text-emerald-600 font-semibold text-xs uppercase tracking-wider">Active Plans</div>
                <div className="text-2xl font-bold text-gray-800">
                  {loading ? "..." : history.filter(h => h.expiryDate && moment(h.expiryDate).isAfter(moment())).length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-orange-50/50 hover:bg-orange-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-orange-600 font-semibold text-xs uppercase tracking-wider">Expiring Soon</div>
                <div className="text-2xl font-bold text-gray-800">
                  {loading ? "..." : history.filter(h => {
                    if (!h.expiryDate) return false;
                    const expiry = moment(h.expiryDate);
                    const now = moment();
                    return expiry.isAfter(now) && expiry.diff(now, 'days') <= 7;
                  }).length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-rose-50/50 hover:bg-rose-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                <XCircle size={24} />
              </div>
              <div>
                <div className="text-rose-600 font-semibold text-xs uppercase tracking-wider">Expired Plans</div>
                <div className="text-2xl font-bold text-gray-800">
                  {loading ? "..." : history.filter(h => h.expiryDate && moment(h.expiryDate).isBefore(moment())).length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>


      <Card className="rounded-2xl border-none shadow-sm overflow-hidden relative min-h-[400px]" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filteredHistory}
          loading={{
            spinning: loading,
            indicator: <Loader variant="panel" />
          }}
          rowKey="_id"
          pagination={{ pageSize: 10, position: ["bottomCenter"] }}
          className="admin-table border-t border-gray-100"
          rowClassName="hover:bg-gray-50/50 transition-colors"
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default PaymentHistory;
