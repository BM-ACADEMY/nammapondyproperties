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
  ShieldCheck,
  Globe,
  Facebook,
  Instagram,
  Linkedin
} from "lucide-react";
import api from "@/services/api";
import { useSocket } from "@/context/SocketContext";

const { Title } = Typography;

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const socket = useSocket();

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

  useEffect(() => {
    if (socket) {
      const handleBadgeRequest = (data) => {
        // We can just fetch the sellers again, or update the specific seller if we want to be more efficient
        // For simplicity and to ensure data consistency, we'll fetch sellers
        fetchSellers();
        if (data && data.message) {
           message.info(data.message);
        }
      };

      socket.on("badge-verification-requested", handleBadgeRequest);

      return () => {
        socket.off("badge-verification-requested", handleBadgeRequest);
      };
    }
  }, [socket]);

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
      render: (status, record) => {
        const isBuilder = record.businessType?.name?.match(/Builder|Promoter/i);
        let color = "default";
        let icon = null;
        if (status === "pending") { color = "orange"; icon = <Clock size={12} className="mr-1" />; }
        else if (status === "approved") { color = "green"; icon = <CheckCircle size={12} className="mr-1" />; }
        else if (status === "rejected") { color = "error"; icon = <XCircle size={12} className="mr-1" />; }
        
        return (
          <div className="flex items-center gap-3">
            {status && status !== "none" ? (
              <Tag color={color} className="rounded-full px-3 m-0">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  {icon}
                  <span className="leading-none">{status.toUpperCase()}</span>
                </span>
              </Tag>
            ) : (
              <span className="text-gray-400 text-xs">NONE</span>
            )}
            
            {isBuilder && (
              <Button 
                type="primary" 
                shape="circle" 
                size="small"
                className="bg-indigo-600 hover:!bg-indigo-700 shadow-md flex items-center justify-center"
                icon={<Briefcase size={12} className="text-white" />}
                onClick={() => {
                  setSelectedSeller(record);
                  setIsDetailModalVisible(true);
                }}
                title="View Builder Details"
              />
            )}
          </div>
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

      {/* Builder Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-gray-300 pb-4 mb-0">
            <Briefcase size={20} className="text-indigo-600" />
            <span className="text-lg font-bold">Builder Professional Profile</span>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)} className="rounded-lg h-10 px-6">
            Close
          </Button>
        ]}
        width={850}
        centered
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto', padding: '24px' } }}
        className="builder-detail-modal"
      >
        {selectedSeller?.builderProfile ? (
          <div className="py-2">
            <div className="flex flex-col sm:flex-row gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex-shrink-0">
                <Avatar 
                  src={getImageUrl(selectedSeller.builderProfile.companyLogo)} 
                  size={100} 
                  shape="square"
                  className="rounded-xl border-2 border-white shadow-md bg-white p-1"
                >
                  {selectedSeller.builderProfile.companyName?.charAt(0)}
                </Avatar>
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedSeller.builderProfile.companyName}</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Tag color="blue" className="rounded-full px-3 m-0">RERA: {selectedSeller.builderProfile.reraNumber || "N/A"}</Tag>
                  <Tag color="cyan" className="rounded-full px-3 m-0">GST: {selectedSeller.builderProfile.gstNumber || "N/A"}</Tag>
                  <Tag color="purple" className="rounded-full px-3 m-0">{selectedSeller.builderProfile.experienceYears} Years Exp.</Tag>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <AlertCircle size={14} />
                  <span>Verified Identity: {selectedSeller.name}</span>
                </div>
              </div>
            </div>

            <Row gutter={[24, 24]}>
              <Col span={24}>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertCircle size={14} className="text-indigo-500" />
                    Office Address
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-0">
                    {selectedSeller.builderProfile.officeAddress || "No address provided"}
                  </p>
                </div>
              </Col>
              
              <Col span={24}>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Briefcase size={14} className="text-indigo-500" />
                    About Company
                  </div>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line mb-0 italic">
                    {selectedSeller.builderProfile.aboutCompany || "No bio provided"}
                  </p>
                </div>
              </Col>

              <Col span={12}>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Primary Contact</div>
                  <div className="text-slate-800 font-semibold">{selectedSeller.builderProfile.phonePrimary || selectedSeller.phone}</div>
                </div>
              </Col>
              
              <Col span={12}>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-full">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Business Email</div>
                  <div className="text-slate-800 font-semibold">{selectedSeller.builderProfile.email || selectedSeller.email || "N/A"}</div>
                </div>
              </Col>

              <Col span={24}>
                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Social & Web Links</div>
                  <div className="flex flex-wrap gap-3">
                    {selectedSeller.builderProfile.socialLinks?.website && (
                      <a href={selectedSeller.builderProfile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                        <Globe size={16} />
                        <span className="font-medium">Website</span>
                      </a>
                    )}
                    {selectedSeller.builderProfile.socialLinks?.linkedin && (
                      <a href={selectedSeller.builderProfile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors">
                        <Linkedin size={16} />
                        <span className="font-medium">LinkedIn</span>
                      </a>
                    )}
                    {selectedSeller.builderProfile.socialLinks?.instagram && (
                      <a href={selectedSeller.builderProfile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-xl border border-pink-100 hover:bg-pink-100 transition-colors">
                        <Instagram size={16} />
                        <span className="font-medium">Instagram</span>
                      </a>
                    )}
                    {selectedSeller.builderProfile.socialLinks?.facebook && (
                      <a href={selectedSeller.builderProfile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                        <Facebook size={16} />
                        <span className="font-medium">Facebook</span>
                      </a>
                    )}
                    {!selectedSeller.builderProfile.socialLinks?.website && 
                     !selectedSeller.builderProfile.socialLinks?.linkedin && 
                     !selectedSeller.builderProfile.socialLinks?.instagram && 
                     !selectedSeller.builderProfile.socialLinks?.facebook && (
                      <span className="text-slate-400 italic text-sm">No social links provided</span>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <AlertCircle size={40} className="mx-auto mb-4 opacity-20" />
            <p>No builder details found for this seller.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SellerList;
