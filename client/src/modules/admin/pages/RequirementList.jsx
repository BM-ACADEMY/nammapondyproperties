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
  const [hasGlobalBuilderMatch, setHasGlobalBuilderMatch] = useState(false);
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
      setSubscriptionStats(response.data.data.stats);
      setHasGlobalBuilderMatch(response.data.data.hasGlobalBuilderMatch);
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
        width={600}
        destroyOnClose
      >
        <div className="py-2 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
          {fetchingStats ? (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-500">Matching sellers and plans...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* MATCHED REQUIREMENTS SECTION */}
              <div>
                <div className="flex items-center justify-between mb-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-6 bg-indigo-600 rounded-full shadow-sm shadow-indigo-200"></div>
                      <h4 className="text-[15px] font-extrabold uppercase tracking-tight text-indigo-900 m-0">MATCH REQUIREMENT</h4>
                   </div>
                   <Tag color="indigo" className="m-0 border-none font-bold uppercase text-[10px] scale-90 origin-right">
                     {hasGlobalBuilderMatch ? "Priority: Builder" : "Priority: Agent"}
                   </Tag>
                </div>
                
                <div className="space-y-4">
                  {subscriptionStats.map((plan) => {
                    const isExpanded = expandedPlans.includes(`${plan.planId}-match`);
                    
                    // Priority Logic for matching sellers
                    let matchedSellers = [];
                    let matchPriority = 3;
                    let displayType = "";

                    if (hasGlobalBuilderMatch) {
                      matchedSellers = plan.sellers.filter(s => s.isBuilder && s.isMatch);
                      matchPriority = 1;
                      displayType = "Builder / Promoter";
                    } else {
                      matchedSellers = plan.sellers.filter(s => s.isAgent && s.isMatch);
                      matchPriority = 2;
                      displayType = "Agent";
                    }

                    const hasMatchesInPlan = matchedSellers.length > 0;

                    return (
                      <div 
                        key={`match-${plan.planId}`} 
                        className={`flex flex-col rounded-[20px] border transition-all duration-300 ${hasMatchesInPlan ? 'border-indigo-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50/50 opacity-60 grayscale-[0.8] pointer-events-none'}`}
                      >
                        <div className="flex items-center justify-between p-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${hasMatchesInPlan ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-200 text-slate-400'}`}>
                               {plan.planName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Text strong className="text-[14.5px] font-bold text-slate-800">{plan.planName} Plan</Text>
                                {hasMatchesInPlan && (
                                  <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase ring-1 ring-emerald-200">Match Found</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Text className="text-[12px] text-slate-500 font-medium">{displayType}</Text>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <Text className="text-[12px] text-slate-400">{matchedSellers.length} Matching Sellers</Text>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                             {hasMatchesInPlan && (
                               <Button 
                                 type="text" 
                                 size="small"
                                 className="text-indigo-600 font-bold text-[11px] hover:bg-indigo-50"
                                 onClick={() => togglePlan(`${plan.planId}-match`)}
                               >
                                 {isExpanded ? "Hide" : "Review"}
                               </Button>
                             )}
                             <Button 
                                type={hasMatchesInPlan ? "primary" : "default"}
                                className={`h-9 px-4 rounded-xl shadow-none font-bold text-xs transition-all ${hasMatchesInPlan ? 'bg-indigo-600 hover:bg-indigo-700 border-none' : 'bg-slate-200 text-slate-400 border-none'}`}
                                disabled={!hasMatchesInPlan || sharingLoading}
                                loading={sharingLoading}
                                onClick={() => handleShare(plan.planId, "exact", matchPriority)}
                              >
                                Share Now
                              </Button>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {isExpanded && hasMatchesInPlan && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-indigo-50/30 border-t border-indigo-50 p-5 rounded-b-[20px]"
                            >
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Eligible Sellers</p>
                              <div className="grid grid-cols-2 gap-3">
                                {matchedSellers.map(s => (
                                  <div key={s.id} className="bg-white p-3 rounded-[14px] border border-indigo-100/50 flex flex-col items-center text-center shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[12px] mb-2 border border-indigo-100/50">
                                      {s.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-bold text-slate-800 text-[12.5px] line-clamp-1 w-full px-2">{s.name}</span>
                                    <span className="text-slate-400 text-[10px] mt-0.5 font-medium">{s.businessType}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NOT EXACT MATCH SECTION */}
              <div>
                <div className="flex items-center justify-between mb-4 bg-slate-100/50 p-3 rounded-xl border border-slate-200">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-6 bg-slate-500 rounded-full shadow-sm shadow-slate-200"></div>
                      <h4 className="text-[15px] font-extrabold uppercase tracking-tight text-slate-700 m-0">NOT MATCH REQUIREMENT</h4>
                   </div>
                   <Tag className="m-0 border-none bg-slate-600 text-white font-bold uppercase text-[9px] rounded-md py-0.5">Agents Only</Tag>
                </div>
                
                <div className="space-y-4">
                  {subscriptionStats.map((plan) => {
                    const isExpanded = expandedPlans.includes(`${plan.planId}-notmatch`);
                    const agents = plan.sellers.filter(s => s.isAgent);
                    const hasAgents = agents.length > 0;
                    
                    return (
                      <div 
                        key={`not-match-${plan.planId}`} 
                        className={`flex flex-col rounded-[20px] border transition-all duration-300 ${hasAgents ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 grayscale opacity-50 pointer-events-none'}`}
                      >
                         <div className="flex items-center justify-between p-5">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${hasAgents ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                 {plan.planName.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <Text strong className={`text-[14.5px] font-bold ${hasAgents ? 'text-slate-700' : 'text-slate-400'}`}>{plan.planName} Plan</Text>
                                <Text className="text-[12px] text-slate-400 font-medium">Shared as fallback (masked)</Text>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                               {hasAgents && (
                                 <Button 
                                   type="text" 
                                   size="small"
                                   className="text-slate-500 font-bold text-[11px]"
                                   onClick={() => togglePlan(`${plan.planId}-notmatch`)}
                                 >
                                   {isExpanded ? "Hide" : "View"}
                                 </Button>
                               )}
                               <Button 
                                className={`h-9 px-4 rounded-xl shadow-none font-bold text-xs ${hasAgents ? 'bg-slate-800 text-white hover:bg-slate-900 border-none' : 'bg-slate-200 text-slate-400 border-none'}`}
                                disabled={!hasAgents || sharingLoading}
                                loading={sharingLoading}
                                onClick={() => handleShare(plan.planId, "not-exact", 3)}
                              >
                                Send Fallback
                              </Button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && hasAgents && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-slate-50/50 border-t border-slate-100 p-5 rounded-b-[20px]"
                              >
                                <div className="grid grid-cols-2 gap-3">
                                  {agents.map(s => (
                                    <div key={s.id} className="bg-white p-2.5 rounded-[12px] border border-slate-100 flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                                        {s.name.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-slate-700 text-[12px] truncate">{s.name}</span>
                                        <span className="text-slate-400 text-[9px] font-medium">{s.businessType}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
