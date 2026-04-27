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
  Popover,
  Checkbox,
  Form,
  InputNumber,
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
  ChevronUp,
  CheckSquare,
  Square,
  CheckCircle2,
  Plus
} from "lucide-react";
import { 
  getRequirements, 
  updateRequirementStatus, 
  deleteRequirement,
  getSubscriptionStats,
  shareRequirement,
  postRequirement
} from "@/services/api";
import { useNav } from "@/context/NavContext";
import { useSocket } from "@/context/SocketContext";

const { Title, Text } = Typography;
const { Option } = Select;

const RequirementList = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [showOtherType, setShowOtherType] = useState(false);
  const { propertyTypes } = useNav();
  const [subscriptionStats, setSubscriptionStats] = useState([]);
  const [hasGlobalBuilderMatch, setHasGlobalBuilderMatch] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [fetchingStats, setFetchingStats] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState([]);

  const selectedUsageType = Form.useWatch("usageType", addForm);

  // Filter property types based on usage type
  const filteredPropertyTypes = propertyTypes.filter(
    (type) => type.usageType === selectedUsageType
  );

  // Reset property type when usage type changes
  useEffect(() => {
    if (selectedUsageType) {
      addForm.setFieldsValue({ propertyType: undefined });
      setShowOtherType(false);
    }
  }, [selectedUsageType, addForm]);

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

  const socket = useSocket();

  useEffect(() => {
    fetchRequirements();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("admin-lead-updated", (data) => {
        message.info("Lead status updated internationally");
        fetchRequirements();
      });
      return () => socket.off("admin-lead-updated");
    }
  }, [socket]);

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

  const handleShare = async (planIdOrIds, matchType, matchPriority) => {
    setSharingLoading(true);
    const data = Array.isArray(planIdOrIds)
      ? { planIds: planIdOrIds, matchType, matchPriority }
      : { planId: planIdOrIds, matchType, matchPriority };

    try {
      await shareRequirement(selectedRequirement._id, data);
      message.success("Lead shared successfully!");
      setIsShareModalOpen(false);
      setSelectedPlanIds([]); // Reset selection
      fetchRequirements(); 
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to share lead");
    } finally {
      setSharingLoading(false);
    }
  };

  const togglePlanSelection = (planId) => {
    setSelectedPlanIds(prev => 
      prev.includes(planId) ? prev.filter(id => id !== planId) : [...prev, planId]
    );
  };

  const handleAddLead = async (values) => {
    setLoading(true);
    try {
      const finalPropertyType =
        values.propertyType === "Others"
          ? values.otherPropertyType
          : values.propertyType;

      const submissionData = {
        ...values,
        propertyType: finalPropertyType,
      };

      await postRequirement(submissionData);
      message.success("Lead created successfully!");
      setIsAddModalOpen(false);
      addForm.resetFields();
      fetchRequirements();
    } catch (error) {
      console.error("Error creating lead:", error);
      message.error(error.response?.data?.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  const selectAllMatches = (plans) => {
    const matchedIds = plans
      .filter(plan => hasGlobalBuilderMatch 
        ? plan.sellers.some(s => s.isBuilder && s.isMatch)
        : plan.sellers.some(s => s.isAgent && s.isMatch)
      )
      .map(p => p.planId);
    setSelectedPlanIds(matchedIds);
  };

  const selectAllFallbacks = (plans) => {
    const agentsIds = plans
      .filter(plan => plan.sellers.some(s => s.isAgent))
      .map(p => p.planId);
    setSelectedPlanIds(agentsIds);
  };

  const isInMatchMode = subscriptionStats.some(plan => {
    if (hasGlobalBuilderMatch) {
      return plan.sellers.some(s => s.isBuilder && s.isMatch);
    } else {
      return plan.sellers.some(s => s.isAgent && s.isMatch);
    }
  });

  const filteredData = requirements.filter((item) => {
    const searchLower = searchText.toLowerCase();
    return (
      item.fullName?.toLowerCase().includes(searchLower) ||
      item.phoneNumber?.includes(searchText) ||
      item.propertyType?.toLowerCase().includes(searchLower) ||
      item.preferredLocation?.toLowerCase().includes(searchLower) ||
      item.createdBy?.name?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      title: "User / Manager",
      key: "user",
      render: (_, record) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Text strong className="text-gray-900">{record.fullName}</Text>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
            <Phone size={12} className="text-slate-400" /> {record.phoneNumber}
          </div>
          {record.user?.assignedAdmin && (
             <div className="mt-1 flex items-center gap-1">
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Managed By:</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">{record.user.assignedAdmin.name || "Manager"}</span>
             </div>
          )}
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
      title: "Created By",
      key: "createdBy",
      render: (_, record) => (
        <div className="flex flex-col">
          {record.createdBy ? (
            <Tag color="cyan" className="font-bold text-[11px] uppercase border-none bg-cyan-50 text-cyan-700">
              {record.createdBy.name}
            </Tag>
          ) : (
            <Tag className="font-bold text-[11px] uppercase border-none bg-slate-50 text-slate-400">
              Direct/Public
            </Tag>
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
              <div className="flex flex-wrap gap-1 mb-1">
                <Tag color="green" className="m-0 text-[13px] font-semibold">
                   {record.acceptedBy.name}
                </Tag>
                {record.acceptedBy.businessType && (
                  <Tag color="blue" className="m-0 text-[10px] font-bold uppercase py-0 px-2 leading-5">
                    {record.acceptedBy.businessType.name || record.acceptedBy.businessType}
                  </Tag>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-slate-500 ml-1">
                <Phone size={12} /> {record.acceptedBy.phone}
              </div>
            </div>
          );
        }
        if (record.isShared) {
          let label = "Shared (Pending)";
          let color = "orange";
          
          if (record.matchPriority === 1) {
            label = "Builder Match";
            color = "indigo";
          } else if (record.matchPriority === 2) {
            label = "Agent Match";
            color = "blue";
          }

          return (
            <Tag 
              color={color} 
              className="m-0 font-medium whitespace-nowrap"
            >
              {label}
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
      title: "Updated By",
      dataIndex: "updatedBy",
      key: "updatedBy",
      width: 130,
      render: (updatedBy) => (
        <div className="flex flex-col">
          {updatedBy ? (
            <Tag color="cyan" className="font-bold text-[10px] uppercase border-none bg-cyan-50 text-cyan-700 m-0 w-fit">
              {updatedBy.name}
            </Tag>
          ) : (
            <span className="text-gray-300 text-[10px] italic">No update yet</span>
          )}
        </div>
      ),
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
          <Tooltip title={record.acceptedBy ? "Deal Closed" : record.isShared ? "Lead Already Shared" : "Share Lead"}>
            <Button 
              type="text" 
              disabled={!!record.acceptedBy}
              icon={
                record.acceptedBy ? (
                  <CheckCircle size={18} className="text-slate-300" />
                ) : record.isShared ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <Share2 size={18} className="text-indigo-500" />
                )
              } 
              onClick={() => showShareModal(record)}
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
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Search requirements..."
            prefix={<Search size={16} className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-lg w-full md:w-64"
          />
          <Button 
            type="primary" 
            icon={<Plus size={18} />} 
            className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 rounded-lg font-bold flex items-center gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Lead
          </Button>
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

                <div className="mb-4">
                  <Text type="secondary" className="text-xs uppercase font-semibold">Lead Source (Marketing)</Text>
                  <div className="mt-1">
                    <Tag color="purple" className="font-bold">{selectedRequirement.heardFrom || "Direct"}</Tag>
                  </div>
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
          </Button>,
          selectedPlanIds.length > 0 && (
            <Button 
              key="share-selected" 
              type="primary" 
              className="bg-indigo-600 hover:bg-indigo-700 h-9 px-6 rounded-lg font-bold"
              loading={sharingLoading}
              onClick={() => handleShare(
                selectedPlanIds, 
                isInMatchMode ? "exact" : "not-exact", 
                isInMatchMode ? (hasGlobalBuilderMatch ? 1 : 2) : 3
              )}
            >
              Share with {selectedPlanIds.length} Plan{selectedPlanIds.length > 1 ? 's' : ''}
            </Button>
          )
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
               {subscriptionStats.some(plan => {
                  if (hasGlobalBuilderMatch) {
                    return plan.sellers.some(s => s.isBuilder && s.isMatch);
                  } else {
                    return plan.sellers.some(s => s.isAgent && s.isMatch);
                  }
               }) ? (
                <div>
                  <div className="flex items-center justify-between mb-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-6 bg-indigo-600 rounded-full shadow-sm shadow-indigo-200"></div>
                            <h4 className="text-[15px] font-extrabold uppercase tracking-tight text-indigo-900 m-0">MATCH REQUIREMENT</h4>
                        </div>
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<CheckCircle2 size={14} />}
                          className="text-indigo-600 font-bold text-[11px] hover:bg-indigo-100/50 flex items-center gap-1.5 px-2 bg-indigo-50/50 rounded-lg"
                          onClick={() => selectAllMatches(subscriptionStats)}
                        >
                          Select All Matches
                        </Button>
                    </div>
                    <Tag color="indigo" className="m-0 border-none font-bold uppercase text-[10px] scale-90 origin-right">
                      {hasGlobalBuilderMatch ? "Priority: Builder" : "Priority: Agent"}
                    </Tag>
                  </div>
                  
                  <div className="space-y-4">
                    {subscriptionStats.map((plan) => {
                      let matchedSellers = hasGlobalBuilderMatch 
                        ? plan.sellers.filter(s => s.isBuilder && s.isMatch)
                        : plan.sellers.filter(s => s.isAgent && s.isMatch);
                      
                      const hasMatchesInPlan = matchedSellers.length > 0;
                      if (!hasMatchesInPlan) return null;

                      return (
                        <div 
                          key={`match-${plan.planId}`} 
                          className={`flex flex-col rounded-[20px] border transition-all duration-300 ${selectedPlanIds.includes(plan.planId) ? 'border-indigo-500 bg-indigo-50/30' : 'border-indigo-200 bg-white shadow-sm'}`}
                          onClick={() => togglePlanSelection(plan.planId)}
                        >
                          <div className="flex items-center justify-between p-5 cursor-pointer">
                            <div className="flex items-center gap-4">
                              <div className="shrink-0 pt-0.5">
                                <Checkbox 
                                  checked={selectedPlanIds.includes(plan.planId)} 
                                  className="scale-110 custom-indigo-checkbox"
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={() => togglePlanSelection(plan.planId)}
                                />
                              </div>
                              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-indigo-600 text-white shadow-md shadow-indigo-100">
                                {plan.planName.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <Text strong className="text-[14.5px] font-bold text-slate-800">{plan.planName} Plan</Text>
                                  <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase ring-1 ring-emerald-200">Match Found</span>
                                </div>
                                <div className="flex flex-col mt-0.5">
                                  <Text className="text-[12px] text-slate-500 font-medium">{hasGlobalBuilderMatch ? "Builder / Promoter" : "Agent"}</Text>
                                  <Text className="text-[10px] text-slate-400">{matchedSellers.length} Matching Sellers</Text>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Popover
                                  placement="right"
                                  title={<span className="text-[12px] font-bold text-slate-800 uppercase tracking-wider">Eligible Sellers ({matchedSellers.length})</span>}
                                  content={
                                    <div className="w-[280px] py-1">
                                      <div className="flex flex-col gap-2">
                                        {matchedSellers.map(s => (
                                          <div key={s.id} className="bg-slate-50/50 p-2.5 rounded-[12px] border border-slate-100 flex items-center gap-3 hover:bg-indigo-50 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                                              {s.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                              <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-700 text-[12px] truncate">{s.name}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.leadsLimit !== -1 && s.leadsUsed >= s.leadsLimit ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                                  {s.leadsUsed}/{s.leadsLimit === -1 ? '∞' : s.leadsLimit}
                                                </span>
                                              </div>
                                              <span className="text-slate-400 text-[9px] font-medium mb-1">{s.businessType}</span>
                                              {s.leadsLimit !== -1 && s.leadsUsed >= s.leadsLimit && (
                                                <span className="text-[9px] text-red-500 font-bold mb-1 italic">Limit Reached</span>
                                              )}
                                              {s.matchingProperties && s.matchingProperties.length > 0 && (
                                                <div className="flex flex-col gap-1 mt-0.5 pt-1 border-t border-slate-100">
                                                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight">Matching Properties:</span>
                                                  {s.matchingProperties.slice(0, 3).map((title, idx) => (
                                                    <span key={idx} className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-100 truncate shadow-sm">
                                                      • {title}
                                                    </span>
                                                  ))}
                                                  {s.matchingProperties.length > 3 && (
                                                    <span className="text-[9px] text-slate-400 ml-1 italic">+{s.matchingProperties.length - 3} more...</span>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  }
                                  trigger="click"
                                  overlayClassName="seller-popover"
                                  getPopupContainer={() => document.body}
                                >
                                  <Button 
                                    type="text" 
                                    size="small"
                                    className="text-indigo-600 font-bold text-[11px] hover:bg-indigo-50"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Review
                                  </Button>
                                </Popover>
                                <Button 
                                  type="primary"
                                  className="h-9 px-4 rounded-xl shadow-none font-bold text-xs bg-indigo-600 hover:bg-indigo-700 border-none"
                                  disabled={sharingLoading}
                                  loading={sharingLoading}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(plan.planId, "exact", hasGlobalBuilderMatch ? 1 : 2);
                                  }}
                                >
                                  Share Now
                                </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
               ) : (
                <div>
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <div>
                      <p className="text-amber-900 font-bold text-sm m-0">No Direct Matches Found</p>
                      <p className="text-amber-700 text-xs m-0">No sellers in your plans match this requirement's specific criteria.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 bg-slate-100/50 p-3 rounded-xl border border-slate-200">
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-6 bg-slate-500 rounded-full shadow-sm shadow-slate-200"></div>
                           <h4 className="text-[15px] font-extrabold uppercase tracking-tight text-slate-700 m-0">NOT MATCH REQUIREMENT</h4>
                        </div>
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<CheckCircle2 size={14} />}
                          className="text-slate-600 font-bold text-[11px] hover:bg-slate-200/50 flex items-center gap-1.5 px-2 bg-slate-200/50 rounded-lg"
                          onClick={() => selectAllFallbacks(subscriptionStats)}
                        >
                          Select All Agents
                        </Button>
                     </div>
                     <Tag className="m-0 border-none bg-slate-600 text-white font-bold uppercase text-[9px] rounded-md py-0.5">Agents Only</Tag>
                  </div>
                  
                  <div className="space-y-4">
                    {subscriptionStats.map((plan) => {
                      const agents = plan.sellers.filter(s => s.isAgent);
                      const hasAgents = agents.length > 0;
                      
                      return (
                        <div 
                          key={`not-match-${plan.planId}`} 
                          className={`flex flex-col rounded-[20px] border transition-all duration-300 ${hasAgents ? (selectedPlanIds.includes(plan.planId) ? 'border-slate-500 bg-slate-50' : 'border-slate-200 bg-white shadow-sm') : 'border-slate-100 bg-slate-50 opacity-40 grayscale pointer-events-none'}`}
                          onClick={() => hasAgents && togglePlanSelection(plan.planId)}
                        >
                           <div className="flex items-center justify-between p-5 cursor-pointer">
                              <div className="flex items-center gap-4">
                                {hasAgents && (
                                  <div className="shrink-0 pt-0.5">
                                    <Checkbox 
                                      checked={selectedPlanIds.includes(plan.planId)} 
                                      className="scale-110 custom-slate-checkbox"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={() => togglePlanSelection(plan.planId)}
                                    />
                                  </div>
                                )}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${hasAgents ? (selectedPlanIds.includes(plan.planId) ? 'bg-slate-800' : 'bg-slate-700') + ' text-white shadow-md shadow-slate-100' : 'bg-slate-200 text-slate-400'}`}>
                                   {plan.planName.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <Text strong className={`text-[14.5px] font-bold ${hasAgents ? 'text-slate-700' : 'text-slate-400'}`}>{plan.planName} Plan</Text>
                                  <Text className="text-[12px] text-slate-400 font-medium">Shared as fallback (masked)</Text>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                 {hasAgents && (
                                   <Popover
                                     placement="right"
                                     title={<span className="text-[12px] font-bold text-slate-800 uppercase tracking-wider">Plan Sellers ({agents.length})</span>}
                                     content={
                                       <div className="w-[280px] py-1">
                                          <div className="flex flex-col gap-2">
                                            {agents.map(s => (
                                              <div key={s.id} className="bg-slate-50/50 p-2.5 rounded-[12px] border border-slate-100 flex items-center gap-3 hover:bg-slate-100 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                                                  {s.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                  <div className="flex items-center justify-between">
                                                    <span className="font-bold text-slate-700 text-[12px] truncate">{s.name}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.leadsLimit !== -1 && s.leadsUsed >= s.leadsLimit ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                                      {s.leadsUsed}/{s.leadsLimit === -1 ? '∞' : s.leadsLimit}
                                                    </span>
                                                  </div>
                                                  <span className="text-slate-400 text-[9px] font-medium mb-1">{s.businessType}</span>
                                                  {s.leadsLimit !== -1 && s.leadsUsed >= s.leadsLimit && (
                                                    <span className="text-[9px] text-red-500 font-bold mb-1 italic">Limit Reached</span>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                       </div>
                                     }
                                     trigger="click"
                                     overlayClassName="seller-popover"
                                     getPopupContainer={() => document.body}
                                   >
                                     <Button 
                                       type="text" 
                                       size="small"
                                       className="text-slate-500 font-bold text-[11px] hover:bg-slate-100"
                                     >
                                       View
                                     </Button>
                                   </Popover>
                                 )}
                                 <Button 
                                  className={`h-9 px-4 rounded-xl shadow-none font-bold text-xs transition-all ${hasAgents ? 'bg-slate-800 text-white hover:bg-slate-900 border-none' : 'bg-slate-200 text-slate-400 border-none'}`}
                                  disabled={!hasAgents || sharingLoading}
                                  loading={sharingLoading}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(plan.planId, "not-exact", 3);
                                  }}
                                >
                                  Send Fallback
                                </Button>
                              </div>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
               )}
            </div>
          )}
        </div>
      </Modal>

      {/* Add Lead Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold m-0">Create New Lead</h3>
              <Text type="secondary" className="text-xs">Add a property requirement manually</Text>
            </div>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <Form
            form={addForm}
            layout="vertical"
            onFinish={handleAddLead}
            requiredMark="optional"
            className="admin-add-lead-form"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item
                name="fullName"
                label={<span className="font-semibold text-slate-700">Full Name</span>}
                rules={[{ required: true, message: "Name is required" }]}
              >
                <Input placeholder="Lead's full name" className="rounded-lg h-10" />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label={<span className="font-semibold text-slate-700">Mobile Number</span>}
                rules={[{ required: true, message: "Phone number is required" }]}
              >
                <InputNumber 
                  style={{ width: "100%" }}
                  placeholder="10-digit mobile number" 
                  controls={false}
                  className="rounded-lg h-10 flex items-center"
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                name="category"
                label={<span className="font-semibold text-slate-700">Category</span>}
                rules={[{ required: true, message: "Selection required" }]}
              >
                <Select placeholder="Rent or Buy?" className="rounded-lg h-10" size="large">
                  <Option value="Rent">Rent</Option>
                  <Option value="Sell/Buy">Sell/Buy</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="usageType"
                label={<span className="font-semibold text-slate-700">Usage Type</span>}
                rules={[{ required: true, message: "Selection required" }]}
              >
                <Select placeholder="Purpose of use" className="rounded-lg h-10" size="large">
                  <Option value="Residential">Residential</Option>
                  <Option value="Commercial">Commercial</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="propertyType"
                label={<span className="font-semibold text-slate-700">Property Type</span>}
                rules={[{ required: true, message: "Selection required" }]}
              >
                <Select
                  placeholder="Select type"
                  className="rounded-lg h-10"
                  size="large"
                  disabled={!selectedUsageType}
                  onChange={(val) => setShowOtherType(val === "Others")}
                >
                  {filteredPropertyTypes.map((type) => (
                    <Option key={type._id} value={type.name}>
                      {type.name}
                    </Option>
                  ))}
                  <Option value="Others">Others</Option>
                </Select>
              </Form.Item>

              {showOtherType && (
                <Form.Item
                  name="otherPropertyType"
                  label={<span className="font-semibold text-slate-700">Specify Type</span>}
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter property type" className="rounded-lg h-10" />
                </Form.Item>
              )}

              <Form.Item
                name="preferredLocation"
                label={<span className="font-semibold text-slate-700">Preferred Location</span>}
                rules={[{ required: true, message: "Location is required" }]}
              >
                <Input placeholder="e.g. White Town, Pondy" className="rounded-lg h-10" />
              </Form.Item>

              <Col span={24} className="p-0">
                 <div className="flex gap-4 w-full">
                    <Form.Item
                      name="minBudget"
                      label={<span className="font-semibold text-slate-700">Min Budget</span>}
                      className="flex-1"
                    >
                      <InputNumber 
                        style={{ width: "100%" }}
                        placeholder="Min" 
                        controls={false}
                        className="rounded-lg h-10 flex items-center"
                      />
                    </Form.Item>
                    <Form.Item
                      name="maxBudget"
                      label={<span className="font-semibold text-slate-700">Max Budget</span>}
                      className="flex-1"
                    >
                      <InputNumber 
                        style={{ width: "100%" }}
                        placeholder="Max" 
                        controls={false}
                        className="rounded-lg h-10 flex items-center"
                      />
                    </Form.Item>
                 </div>
              </Col>

              <Form.Item
                name="propertyPreferences"
                label={<span className="font-semibold text-slate-700">Property Preferences</span>}
                className="md:col-span-2"
              >
                <Input.TextArea 
                  rows={2} 
                  placeholder="e.g. 2BHK, Gated community, South facing..." 
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="heardFrom"
                label={<span className="font-semibold text-slate-700">Lead Source (Marketing)</span>}
                className="md:col-span-2"
              >
                <Select placeholder="General source of the lead" className="rounded-lg h-10">
                  <Option value="Social Media">Social Media</Option>
                  <Option value="Facebook">Facebook</Option>
                  <Option value="Instagram">Instagram</Option>
                  <Option value="YouTube">YouTube</Option>
                  <Option value="LinkedIn">LinkedIn</Option>
                  <Option value="WhatsApp">WhatsApp</Option>
                  <Option value="Google Search">Google Search</Option>
                  <Option value="Reference">Reference</Option>
                  <Option value="Newspaper/Ad">Newspaper/Ad</Option>
                  <Option value="Others">Others</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="message"
                label={<span className="font-semibold text-slate-700">Additional Message</span>}
                className="md:col-span-2"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Any other specific notes for the sellers..." 
                  className="rounded-lg"
                />
              </Form.Item>


            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <Button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  addForm.resetFields();
                }}
                className="rounded-lg h-10 px-6"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-lg h-10 px-8 font-bold"
              >
                Create Lead
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default RequirementList;
