import { useState, useEffect } from "react";
import { Table, Tag, message, Card } from "antd";
import { CreditCard, IndianRupee, User, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import axios from "axios";
import moment from "moment";

const API = import.meta.env.VITE_API_URL;

const PaymentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

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
        <div className="flex items-center gap-1 font-bold text-gray-900">
          <IndianRupee size={14} />
          {record.amountPaid || record.plan?.price || 0}
        </div>
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => {
        let color = "orange";
        let icon = <Clock size={14} />;
        if (status === "completed") { color = "green"; icon = <CheckCircle size={14} />; }
        if (status === "failed") { color = "red"; icon = <XCircle size={14} />; }
        
        return (
          <Tag color={color} className="flex items-center gap-1 w-fit rounded-lg px-3 py-1 border-none shadow-sm capitalize font-semibold">
            {icon} {status}
          </Tag>
        );
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
        return (
          <div className="flex flex-col text-xs text-red-500 font-bold bg-red-50/50 p-1 rounded-lg text-center">
            <span>{moment(date).format("DD MMM YYYY")}</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
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

      <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={history}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10, position: ["bottomCenter"] }}
          className="admin-table"
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default PaymentHistory;
