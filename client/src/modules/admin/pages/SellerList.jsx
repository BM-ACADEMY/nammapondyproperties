import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Typography,
  Tag,
  Space,
  message,
  Modal,
  Switch,
  Dropdown,
  Menu,
  Row,
  Col,
  Statistic,
  Avatar,
} from "antd";
import { Hash, UserPlus } from "lucide-react";
import { getImageUrl } from "@/utils/imageUrl";
import { 
  Trash2, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MoreVertical,
  Briefcase,
  UserCheck,
  UserX,
  ShieldCheck
} from "lucide-react";
import api from "@/services/api";

const { Title } = Typography;

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      // Fetch only sellers
      const response = await api.get("/users/get-all-users?role=seller");
      setSellers(response.data);
    } catch (error) {
      console.error("Failed to fetch sellers", error);
      message.error("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this seller?",
      icon: <AlertCircle className="text-red-500" />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await api.delete(`/users/delete-user-by-id/${id}`);
          message.success("Seller deleted successfully");
          fetchSellers();
        } catch (error) {
          message.error("Failed to delete seller");
          console.error(error);
        }
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            src={getImageUrl(record.profile_image)} 
            size={40}
            className="bg-indigo-100 text-indigo-600 border border-indigo-200"
          >
            {text ? text.charAt(0).toUpperCase() : "S"}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{text || "Unnamed Seller"}</span>
            <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{record.userId || "NO ID"}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Referral ID",
      dataIndex: "referralCode",
      key: "referralCode",
      render: (code) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 w-fit">
          <UserPlus size={12} className="text-gray-400" />
          <span>{code || "---"}</span>
        </div>
      ),
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{record.phone || "No Phone"}</span>
          <span className="text-xs text-gray-500">{record.email}</span>
        </div>
      ),
    },
    {
      title: "Business Type",
      dataIndex: "businessType",
      key: "businessType",
      render: (bt) => (
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="text-indigo-400" />
          <span className="text-sm font-semibold text-indigo-600">
            {bt?.name || "---"}
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"} className="rounded-full px-3">
          <span className="inline-flex items-center whitespace-nowrap">
            {status ? status.toUpperCase() : "ACTIVE"}
          </span>
        </Tag>
      ),
    },
    {
      title: "Badge Request",
      dataIndex: "badgeRequestStatus",
      key: "badgeRequestStatus",
      render: (status) => {
        let color = "default";
        let icon = null;
        if (status === "pending") { color = "orange"; icon = <Clock size={12} className="mr-1" />; }
        else if (status === "approved") { color = "green"; icon = <CheckCircle size={12} className="mr-1" />; }
        else if (status === "rejected") { color = "error"; icon = <XCircle size={12} className="mr-1" />; }
        
        if (!status || status === "none") return <span className="text-gray-400 text-xs">NONE</span>;
        
        return (
          <Tag color={color} className="rounded-full px-3">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              {icon}
              <span className="leading-none">{status.toUpperCase()}</span>
            </span>
          </Tag>
        );
      },
    },
    {
      title: "Verified",
      dataIndex: "badgeVerified",
      key: "badgeVerified",
      align: "center",
      render: (verified) => (
        verified ? (
          <Tag color="blue" className="rounded-full px-3">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <CheckCircle size={14} /> 
              <span>VERIFIED</span>
            </span>
          </Tag>
        ) : (
          <Tag className="rounded-full px-3">
            <span className="inline-flex items-center whitespace-nowrap text-gray-400">
              NOT VERIFIED
            </span>
          </Tag>
        )
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => {
        const items = [
          {
            key: "toggleStatus",
            label: (
              <div
                className="flex items-center gap-2"
                onClick={async () => {
                  try {
                    await api.put(`/users/update-user-by-id/${record._id}`, {
                      status: record.status === "active" ? "inactive" : "active",
                    });
                    message.success(`Seller ${record.status === "active" ? "deactivated" : "activated"} successfully`);
                    fetchSellers();
                  } catch (error) {
                    message.error("Failed to update status");
                  }
                }}
              >
                <AlertCircle size={14} />
                <span>{record.status === "active" ? "Deactivate Seller" : "Activate Seller"}</span>
              </div>
            ),
          },
          {
            key: "verifyBadge",
            label: (
              <div
                className="flex items-center gap-2"
                onClick={async () => {
                  try {
                    await api.put(`/users/update-user-by-id/${record._id}`, {
                      badgeVerified: !record.badgeVerified,
                      badgeRequestStatus: !record.badgeVerified ? "approved" : "none",
                    });
                    message.success(`Verified badge ${record.badgeVerified ? "removed" : "applied"} successfully`);
                    fetchSellers();
                  } catch (error) {
                    message.error("Failed to update badge");
                  }
                }}
              >
                <CheckCircle size={14} />
                <span>{record.badgeVerified ? "Unverify Seller" : "Verify Seller"}</span>
              </div>
            ),
          },
          record.badgeRequestStatus === "pending" && {
            key: "rejectBadge",
            danger: true,
            label: (
              <div
                className="flex items-center gap-2"
                onClick={async () => {
                  try {
                    await api.put(`/users/update-user-by-id/${record._id}`, {
                      badgeRequestStatus: "rejected",
                      badgeVerified: false
                    });
                    message.success("Badge request rejected");
                    fetchSellers();
                  } catch (error) {
                    message.error("Failed to reject badge");
                  }
                }}
              >
                <XCircle size={14} />
                <span>Reject Badge Request</span>
              </div>
            ),
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            danger: true,
            label: (
              <div className="flex items-center gap-2" onClick={() => handleDelete(record._id)}>
                <Trash2 size={14} />
                <span>Delete Seller</span>
              </div>
            ),
          },
        ].filter(Boolean);

        return (
          <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
            <Button type="text" icon={<MoreVertical size={20} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-6">
        <Title level={3} className="mb-0! w-full sm:w-auto text-left">Seller Management</Title>
      </div>

      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-indigo-50/50 hover:bg-indigo-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <Briefcase size={24} />
              </div>
              <div>
                <div className="text-indigo-600 font-semibold text-xs uppercase tracking-wider">Total Sellers</div>
                <div className="text-2xl font-bold text-gray-800">{loading ? "..." : sellers.length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-emerald-50/50 hover:bg-emerald-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                <UserCheck size={24} />
              </div>
              <div>
                <div className="text-emerald-600 font-semibold text-xs uppercase tracking-wider">Active Sellers</div>
                <div className="text-2xl font-bold text-gray-800">{loading ? "..." : sellers.filter(s => s.status === 'active').length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-rose-50/50 hover:bg-rose-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                <UserX size={24} />
              </div>
              <div>
                <div className="text-rose-600 font-semibold text-xs uppercase tracking-wider">Inactive Sellers</div>
                <div className="text-2xl font-bold text-gray-800">{loading ? "..." : sellers.filter(s => s.status !== 'active').length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-blue-50/50 hover:bg-blue-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-blue-600 font-semibold text-xs uppercase tracking-wider">Verified Sellers</div>
                <div className="text-2xl font-bold text-gray-800">{loading ? "..." : sellers.filter(s => s.badgeVerified).length}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={sellers}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              size: "small",
              responsive: true,
              className: "px-4"
            }}
            scroll={{ x: "max-content" }}
          />
        </div>
      </Card>
    </div>
  );
};

export default SellerList;
