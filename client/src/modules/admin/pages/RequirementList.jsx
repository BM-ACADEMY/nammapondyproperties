import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Typography,
  Tag,
  Space,
  message,
  Modal,
  Tooltip,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import { 
  Trash2, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle,
  Search,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
  Share2,
  Info
} from "lucide-react";
import { 
  getRequirements, 
  updateRequirementStatus, 
  deleteRequirement,
  getSubscriptionStats,
  shareRequirement
} from "@/services/api";

const { Title, Text } = Typography;
const { Option } = Select;

const RequirementList = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [subscriptionStats, setSubscriptionStats] = useState([]);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [fetchingStats, setFetchingStats] = useState(false);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const response = await getRequirements();
      setRequirements(response.data.data);
    } catch (error) {
      console.error("Failed to fetch requirements", error);
      message.error("Failed to load requirements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRequirementStatus(id, newStatus);
      message.success(`Status updated to ${newStatus}`);
      fetchRequirements();
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this requirement?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteRequirement(id);
          message.success("Requirement deleted successfully");
          fetchRequirements();
        } catch (error) {
          message.error("Failed to delete requirement");
        }
      },
    });
  };

  const showDetails = (record) => {
    setSelectedRequirement(record);
    setIsDetailModalOpen(true);
  };

  const showShareModal = async (record) => {
    setSelectedRequirement(record);
    setIsShareModalOpen(true);
    fetchStats();
  };

  const fetchStats = async () => {
    setFetchingStats(true);
    try {
      const response = await getSubscriptionStats();
      setSubscriptionStats(response.data.data);
    } catch (error) {
      message.error("Failed to load subscription statistics");
    } finally {
      setFetchingStats(false);
    }
  };

  const handleShare = async (planId) => {
    setSharingLoading(true);
    try {
      await shareRequirement(selectedRequirement._id, planId);
      message.success("Lead shared successfully!");
      setIsShareModalOpen(false);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to share lead");
    } finally {
      setSharingLoading(false);
    }
  };

  const filteredData = requirements.filter((item) => {
    const searchLower = searchText.toLowerCase();
    return (
      item.fullName?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower) ||
      item.phoneNumber?.includes(searchText) ||
      item.propertyType?.toLowerCase().includes(searchLower) ||
      item.preferredLocation?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      title: "User Details",
      key: "user",
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong>{record.fullName}</Text>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <Mail size={12} /> {record.email}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Phone size={12} /> {record.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      title: "Requirement",
      key: "requirement",
      render: (_, record) => (
        <div className="flex flex-col">
          <Tag color="blue">{record.category}</Tag>
          <Text className="text-xs mt-1">
            <span className="font-semibold">{record.usageType}:</span> {record.propertyType}
          </Text>
          {record.preferredLocation && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 italic">
              <MapPin size={10} /> {record.preferredLocation}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Budget",
      key: "budget",
      render: (_, record) => (
        <div className="flex flex-col text-xs">
          {record.minBudget || record.maxBudget ? (
            <>
              {record.minBudget && <span>Min: ₹{record.minBudget.toLocaleString()}</span>}
              {record.maxBudget && <span>Max: ₹{record.maxBudget.toLocaleString()}</span>}
            </>
          ) : (
            <Text type="secondary">Not specified</Text>
          )}
        </div>
      ),
    },
    {
      title: "Accepted Seller",
      key: "acceptedSeller",
      render: (_, record) => {
        if (record.acceptedBy) {
          return (
            <div className="flex flex-col">
              <Tag color="green" icon={<CheckCircle size={10} />} className="m-0 flex items-center justify-center">
                {record.acceptedBy.name}
              </Tag>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                <Phone size={10} /> {record.acceptedBy.phone}
              </div>
            </div>
          );
        }
        if (record.isShared) {
          return <Tag color="orange" icon={<Clock size={10} />} className="flex items-center justify-center">Shared (Pending)</Tag>;
        }
        return <Tag className="border-none bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Not Shared</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        let color = "gold";
        if (status === "Contacted") color = "blue";
        if (status === "Closed") color = "green";
        
        return (
          <Select
            value={status}
            onChange={(value) => handleStatusChange(record._id, value)}
            size="small"
            style={{ width: 110 }}
            className={`status-select-${status.toLowerCase()}`}
          >
            <Option value="Pending">Pending</Option>
            <Option value="Contacted">Contacted</Option>
            <Option value="Closed">Closed</Option>
          </Select>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<Eye size={18} className="text-blue-500" />} 
              onClick={() => showDetails(record)}
            />
          </Tooltip>
          <Tooltip title={record.acceptedBy ? "Deal Closed" : record.isShared ? "Reshare Lead" : "Share Lead"}>
            <Button 
              type="text" 
              icon={<Share2 size={18} className={record.acceptedBy ? "text-slate-300" : "text-indigo-500"} />} 
              onClick={() => showShareModal(record)}
              disabled={!!record.acceptedBy}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              icon={<Trash2 size={18} className="text-red-500" />} 
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="m-0! flex items-center gap-2">
            <ClipboardList size={28} className="text-indigo-600" />
            Property Requirements
          </Title>
          <p className="text-slate-500 mt-1">Manage and track user property requirements and leads.</p>
        </div>
        <div className="w-72">
          <Input
            placeholder="Search requirements..."
            prefix={<Search size={16} className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-lg"
          />
        </div>
      </div>

      <Card className="shadow-sm border-none overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold m-0">Requirement Details</h3>
              <Text type="secondary" className="text-xs">Submitted on {selectedRequirement && new Date(selectedRequirement.createdAt).toLocaleString()}</Text>
            </div>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
          <Button 
            key="contacted" 
            type="primary" 
            className="bg-blue-600"
            onClick={() => {
              handleStatusChange(selectedRequirement._id, "Contacted");
              setIsDetailModalOpen(false);
            }}
          >
            Mark as Contacted
          </Button>
        ]}
        width={650}
        destroyOnClose
      >
        {selectedRequirement && (
          <div className="py-2">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <div className="mb-4">
                  <Text type="secondary" className="text-xs uppercase font-semibold">User Information</Text>
                  <p className="m-0 font-bold text-base">{selectedRequirement.fullName}</p>
                  <p className="m-0 text-slate-600 flex items-center gap-2 mt-1">
                    <Mail size={14} /> {selectedRequirement.email}
                  </p>
                  <p className="m-0 text-slate-600 flex items-center gap-2">
                    <Phone size={14} /> {selectedRequirement.phoneNumber}
                  </p>
                </div>
                
                <div className="mb-4">
                  <Text type="secondary" className="text-xs uppercase font-semibold">Location Preference</Text>
                  <p className="m-0 text-slate-700 font-medium">
                    {selectedRequirement.preferredLocation || "Not specified"}
                  </p>
                </div>
              </Col>
              
              <Col span={12}>
                <div className="mb-4">
                  <Text type="secondary" className="text-xs uppercase font-semibold">Property Type</Text>
                  <div className="mt-1">
                    <Tag color="blue" className="mb-1">{selectedRequirement.category}</Tag>
                    <Tag color="cyan">{selectedRequirement.usageType}</Tag>
                  </div>
                  <p className="m-0 mt-1 font-bold">{selectedRequirement.propertyType}</p>
                </div>
                
                <div className="mb-4">
                  <Text type="secondary" className="text-xs uppercase font-semibold">Budget Range</Text>
                  <p className="m-0 text-slate-700 font-bold">
                    {selectedRequirement.minBudget ? `₹${selectedRequirement.minBudget.toLocaleString()}` : "Any"} 
                    {" - "} 
                    {selectedRequirement.maxBudget ? `₹${selectedRequirement.maxBudget.toLocaleString()}` : "Any"}
                  </p>
                </div>
              </Col>
              
              <Col span={24}>
                <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <Text type="secondary" className="text-xs uppercase font-semibold">Property Preferences</Text>
                  <p className="m-0 mt-2 text-slate-700 italic">
                    {selectedRequirement.propertyPreferences || "No specific preferences mentioned."}
                  </p>
                </div>
                
                <div className="mb-4">
                  <Text type="secondary" className="text-xs uppercase font-semibold">Message / Additional Info</Text>
                  <p className="m-0 mt-1 text-slate-700">
                    {selectedRequirement.message || "No additional message."}
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Share Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold m-0">Share Lead with Sellers</h3>
              <Text type="secondary" className="text-xs">Distribute this requirement to sellers based on their plan.</Text>
            </div>
          </div>
        }
        open={isShareModalOpen}
        onCancel={() => setIsShareModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsShareModalOpen(false)}>
            Cancel
          </Button>
        ]}
        width={500}
        destroyOnClose
      >
        <div className="py-2">
          {fetchingStats ? (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-500">Loading subscription plans...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptionStats.map((plan) => (
                <div 
                  key={plan.planId} 
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors bg-white shadow-sm"
                >
                  <div className="flex flex-col">
                    <Text strong className="text-base text-slate-800">{plan.planName} Plan</Text>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag color={plan.sellerCount > 0 ? "green" : "default"}>
                        {plan.sellerCount} Sellers Active
                      </Tag>
                      {plan.sellerCount > 0 && (
                        <Tooltip 
                          title={
                            <div>
                                <p className="font-bold border-b border-white/20 pb-1 mb-1">Active Sellers:</p>
                                {plan.sellers.map(s => <div key={s.id} className="text-xs"> {s.name} ({s.phone})</div>)}
                            </div>
                          } 
                          trigger={["hover", "click"]}
                        >
                          <Info size={14} className="text-slate-400 cursor-pointer" />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <Button 
                    type="primary" 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={plan.sellerCount === 0 || sharingLoading}
                    loading={sharingLoading}
                    onClick={() => handleShare(plan.planId)}
                  >
                    Send Lead
                  </Button>
                </div>
              ))}
              {subscriptionStats.length === 0 && !fetchingStats && (
                <div className="text-center py-6 bg-slate-50 rounded-xl">
                  <Text type="secondary">No active subscription plans found.</Text>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default RequirementList;
