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
} from "antd";
import { Plus, Trash2, Edit, AlertCircle, Clock, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import api from "@/services/api";
import CreateUserModal from "../components/CreateUserModal";

const { Title } = Typography;

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

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

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                        {text ? text.charAt(0) : "S"}
                    </div>
                    <span className="font-medium text-gray-900">{text || "Unnamed Seller"}</span>
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
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "active" ? "green" : "red"} className="rounded-full px-3">
                    {status ? status.toUpperCase() : "ACTIVE"}
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
                    <Tag color={color} className="flex items-center w-fit rounded-full px-3">
                        {icon}
                        {status.toUpperCase()}
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
                    <Tag color="blue" className="rounded-full px-3 flex items-center w-fit mx-auto">
                        <CheckCircle size={12} className="mr-1" /> VERIFIED
                    </Tag>
                ) : (
                    <Tag className="rounded-full px-3 w-fit mx-auto">NOT VERIFIED</Tag>
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
                        key: "edit",
                        label: (
                            <div className="flex items-center gap-2" onClick={() => handleEdit(record)}>
                                <Edit size={14} />
                                <span>Edit Details</span>
                            </div>
                        ),
                    },
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
                                <span>{record.badgeVerified ? "Remove Badge" : "Apply Verified Badge"}</span>
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
                <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    onClick={() => {
                        setEditingUser(null);
                        setIsModalVisible(true);
                    }}
                    className="w-auto"
                >
                    Add New Seller
                </Button>
            </div>

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
                            responsive: true
                        }}
                        scroll={{ x: "max-content" }}
                    />
                </div>
            </Card>

      <CreateUserModal
        visible={isModalVisible}
        onClose={handleModalClose}
        initialRole="seller"
        refreshData={fetchSellers}
        editingUser={editingUser}
      />
    </div>
  );
};

export default SellerList;
