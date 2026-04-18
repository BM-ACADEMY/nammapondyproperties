import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Phone,
  MapPin,
  ClipboardList,
  Share2,
  ChevronDown,
  ChevronUp
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
  const [expandedPlans, setExpandedPlans] = useState([]);

  const togglePlan = (planId) => {
    setExpandedPlans((prev) => 
      prev.includes(planId) ? prev.filter(id => id !== planId) : [...prev, planId]
    );
  };

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
    fetchStats(record._id);
  };

  const fetchStats = async (requirementId) => {
    setFetchingStats(true);
    try {
      const response = await getSubscriptionStats(requirementId);
      setSubscriptionStats(response.data.data);
    } catch (error) {
      message.error("Failed to load subscription statistics");
    } finally {
      setFetchingStats(false);
    }
  };

  const handleShare = async (planId, matchType, matchPriority) => {
    setSharingLoading(true);
    try {
      await shareRequirement(selectedRequirement._id, planId, matchType, matchPriority);
      message.success("Lead shared successfully!");
      setIsShareModalOpen(false);
      fetchRequirements(); // Refresh list to show shared status
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
              <Tag color="green" className="m-0 text-[13px] font-semibold flex items-center justify-center w-fit px-2.5 py-1">
                 {record.acceptedBy.name}
              </Tag>
              <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mt-1.5 ml-1">
                <Phone size={12} /> {record.acceptedBy.phone}
              </div>
            </div>
          );
        }
        if (record.isShared) {
          return (
            <Tag color="orange" className="flex items-center justify-center gap-1 w-fit px-2 py-0.5">
              <Clock size={12} /> Shared (Pending)
            </Tag>
          );
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
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Title level={3} className="m-0! flex items-center gap-2 text-xl md:text-2xl">
            <ClipboardList size={28} className="text-indigo-600" />
            Property Requirements
          </Title>
          <p className="text-slate-500 mt-1 text-sm">Manage and track user property requirements and leads.</p>
        </div>
        <div className="w-full md:w-72">
          <Input
            placeholder="Search requirements..."
            prefix={<Search size={16} className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-lg w-full"
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
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-4">
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
              <Col xs={24} md={12}>
                <div className="mb-4">
                  <Text type="secondary" className="text-xs uppercase font-semibold">User Information</Text>
                  <p className="m-0 font-bold text-base">{selectedRequirement.fullName}</p>
                  <p className="m-0 text-slate-600 flex items-center gap-2 mt-1">
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
              
              <Col xs={24} md={12}>
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

      <Modal
        title={
          <div className="flex items-center gap-4 border-b border-gray-200 pb-5 mb-1">
            <div className="w-12 h-12 rounded-[14px] bg-[#f0efff] text-[#6366f1] flex items-center justify-center shrink-0">
              <Share2 size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-[18px] font-bold m-0 text-slate-800">Share Lead with Sellers</h3>
              <Text type="secondary" className="text-[13.5px] text-slate-500">Distribute this requirement based on priority matching.</Text>
            </div>
          </div>
        }
        open={isShareModalOpen}
        onCancel={() => setIsShareModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsShareModalOpen(false)} className="rounded-lg h-9 px-5 border-gray-200 text-slate-700 font-medium">
            Cancel
          </Button>
        ]}
        width={550}
        destroyOnClose
      >
        <div className="py-2">
          {fetchingStats ? (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-500">Matching sellers and plans...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* MATCHED REQUIREMENTS SECTION */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                   <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 m-0">Match Requirements</h4>
                </div>
                
                <div className="space-y-3">
                  {(() => {
                    const hasAnyBuilderMatch = subscriptionStats.some(p => p.hasBuilderMatch);
                    const hasAnyAgentMatch = subscriptionStats.some(p => p.hasAgentMatch);
                    
                    return subscriptionStats.map((plan) => {
                      const isExpanded = expandedPlans.includes(plan.planId);
                      const hasSellers = plan.sellerCount > 0;
                      
                      // Priority Logic
                      let isPriorityPlan = false;
                      let matchPriority = 3;
                      
                      if (hasAnyBuilderMatch) {
                        isPriorityPlan = plan.hasBuilderMatch;
                        matchPriority = 1;
                      } else if (hasAnyAgentMatch) {
                        isPriorityPlan = plan.hasAgentMatch;
                        matchPriority = 2;
                      }

                      return (
                        <div 
                          key={`match-${plan.planId}`} 
                          className={`flex flex-col rounded-2xl border ${isPriorityPlan ? 'border-indigo-200 bg-indigo-50/10' : 'border-gray-100 bg-slate-50/50 grayscale opacity-60 pointer-events-none'} overflow-hidden transition-all`}
                        >
                          <div className="flex items-center justify-between p-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-1">
                                <Text strong className="text-[14px] font-bold text-slate-800">{plan.planName} Plan</Text>
                                {isPriorityPlan && (
                                  <Tag color="indigo" className="m-0 text-[10px] uppercase font-bold border-none px-2 py-0">Recommended Match</Tag>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <Text className="text-[12px] text-slate-500 font-medium">{plan.sellerCount} Sellers</Text>
                                {hasSellers && isPriorityPlan && (
                                  <div 
                                    className="flex items-center gap-1 text-[12px] text-[#4f46e5] cursor-pointer font-bold select-none"
                                    onClick={() => togglePlan(`match-${plan.planId}`)}
                                  >
                                    {expandedPlans.includes(`match-${plan.planId}`) ? "Hide" : "View Match"}
                                    {expandedPlans.includes(`match-${plan.planId}`) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button 
                              type={isPriorityPlan ? "primary" : "default"}
                              className={`h-9 px-4 rounded-lg shadow-none font-bold text-xs ${isPriorityPlan ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-none' : 'bg-slate-200 text-slate-400 border-none'}`}
                              disabled={!isPriorityPlan || sharingLoading}
                              loading={sharingLoading}
                              onClick={() => handleShare(plan.planId, "exact", matchPriority)}
                            >
                              Send Lead
                            </Button>
                          </div>
                          
                          <AnimatePresence>
                            {expandedPlans.includes(`match-${plan.planId}`) && isPriorityPlan && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-white border-t border-indigo-100 p-4"
                              >
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Matching Sellers ({plan.sellers.filter(s => s.isMatch).length})</p>
                                <div className="grid grid-cols-1 gap-2">
                                  {plan.sellers.filter(s => s.isMatch).map(s => (
                                    <div key={s.id} className="bg-slate-50 p-2.5 rounded-xl flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-[11px]">
                                        {s.name.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-bold text-slate-800 text-[13px]">{s.name}</span>
                                        <span className="text-slate-400 text-[11px] font-medium italic">{s.businessType}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* NOT EXACT MATCH SECTION */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-1.5 h-6 bg-slate-400 rounded-full"></div>
                   <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 m-0">Not Exact Match Section (Agents Only)</h4>
                </div>
                
                <div className="space-y-3">
                  {subscriptionStats.map((plan) => {
                    const hasAgents = plan.sellers.some(s => s.isAgent);
                    
                    return (
                      <div 
                        key={`not-match-${plan.planId}`} 
                        className={`flex flex-col rounded-2xl border ${hasAgents ? 'border-gray-200 bg-white' : 'border-gray-100 bg-slate-50/50 grayscale opacity-60 pointer-events-none'} overflow-hidden transition-all`}
                      >
                         <div className="flex items-center justify-between p-4">
                            <div className="flex flex-col">
                              <Text strong className="text-[14px] font-bold text-slate-700">{plan.planName} Plan</Text>
                              <Text className="text-[12px] text-slate-500 font-medium">Available for Agents only</Text>
                            </div>
                            <Button 
                              className={`h-9 px-4 rounded-lg shadow-none font-bold text-xs ${hasAgents ? 'bg-slate-800 text-white hover:bg-slate-900 border-none' : 'bg-slate-200 text-slate-400 border-none'}`}
                              disabled={!hasAgents || sharingLoading}
                              loading={sharingLoading}
                              onClick={() => handleShare(plan.planId, "not-exact", 3)}
                            >
                              Send to Agents
                            </Button>
                          </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default RequirementList;
