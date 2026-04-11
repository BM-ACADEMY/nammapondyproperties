import React, { useState, useEffect } from "react";
import { 
  Card, 
  Button, 
  Typography, 
  Tag, 
  Space, 
  message, 
  Empty, 
  Row, 
  Col, 
  Tooltip,
  Divider,
  Badge
} from "antd";
import { 
  ClipboardList, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle,
  LayoutDashboard,
  ShieldCheck,
  User,
  Lock,
  ArrowRight
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import api, { getMySharedLeads, acceptSharedLead } from "@/services/api";
import { useSocket } from "@/context/SocketContext";

const { Title, Text, Paragraph } = Typography;

const LeadsOverview = () => {
  const socket = useSocket();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [hasActivePlan, setHasActivePlan] = useState(true); // Default to true to prevent flickering

  const fetchLeads = async () => {
    setLoading(true);
    try {
      // Check subscription first
      const subRes = await api.get("/subscriptions/my-subscription");
      if (!subRes.data) {
        setHasActivePlan(false);
        setLeads([]);
        return;
      }
      setHasActivePlan(true);

      const response = await getMySharedLeads();
      setLeads(response.data.data);
    } catch (error) {
      console.error("Failed to fetch leads", error);
      message.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for newly shared leads
      socket.on("new-lead-shared", (data) => {
        message.info("A new lead has been shared with your plan!");
        fetchLeads(); // Refresh list
      });

      // Listen for leads accepted by others
      socket.on("lead-accepted-by-other", (data) => {
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            // Match by requirement ID if available, otherwise fallback to lead ID
            (lead.requirement?._id === data.requirementId || lead._id === data.leadId)
              ? { ...lead, status: "closed", acceptedBy: data.acceptedBy } 
              : lead
          )
        );
      });

      return () => {
        socket.off("new-lead-shared");
        socket.off("lead-accepted-by-other");
      };
    }
  }, [socket]);

  const handleAcceptLead = async (leadId) => {
    setAcceptingId(leadId);
    try {
      const response = await acceptSharedLead(leadId);
      message.success(response.data.message);
      fetchLeads(); // Refresh to get full contact details
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to accept lead";
      message.error(errorMsg);
      if (error.response?.status === 400) {
        // Refresh if someone else already accepted
        fetchLeads();
      }
    } finally {
      setAcceptingId(null);
    }
  };

  const getStatusTag = (lead) => {
    if (lead.isAcceptedByMe) return <Tag color="success" icon={<CheckCircle2 size={12} className="mr-1" />}>Accepted By You</Tag>;
    if (lead.status === "closed" || lead.status === "accepted") {
      return (
        <Tooltip title={`Accepted by ${lead.acceptedBy || "another seller"}`}>
          <Tag color="error" icon={<XCircle size={12} className="mr-1" />}>Deal Closed</Tag>
        </Tooltip>
      );
    }
    return <Tag color="processing" icon={<Clock size={12} className="mr-1" />}>Pending</Tag>;
  };

  if (!hasActivePlan && !loading) {
    return <Navigate to="/seller/upgrade-plan" replace />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="m-0! flex items-center gap-2">
            <ClipboardList size={28} className="text-indigo-600" />
            Leads Overview
          </Title>
          <p className="text-slate-500 mt-1">View and manage shared property requirements from the admin.</p>
        </div>
        <Button 
          icon={<LayoutDashboard size={16} />} 
          onClick={fetchLeads}
          loading={loading}
        >
          Refresh Leads
        </Button>
      </div>

      {loading && leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-500 font-medium">Checking for new leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-2 py-12">
          <Empty 
            description={
              <div className="max-w-xs mx-auto">
                <p className="text-slate-600 font-semibold text-base">No shared leads yet</p>
                <p className="text-slate-400 text-sm mt-1">Leads shared by the admin for your subscription plan will appear here.</p>
              </div>
            }
          />
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {leads.map((lead) => (
            <Col xs={24} md={12} lg={8} key={lead._id}>
              <Card 
                className={`h-full rounded-2xl border-none shadow-md overflow-hidden transition-all hover:shadow-lg ${lead.isAcceptedByMe ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                bodyStyle={{ padding: 0 }}
              >
                {/* Card Header */}
                <div className={`p-4 border-b flex justify-between items-start ${lead.isAcceptedByMe ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                  <div className="flex flex-col gap-1">
                    <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                      {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <div className="flex gap-2">
                       <Tag color="blue" className="m-0 text-[10px] px-2 rounded-full border-none font-bold uppercase">{lead.requirement.category}</Tag>
                    </div>
                  </div>
                  {getStatusTag(lead)}
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="mb-4">
                    <Title level={5} className="m-0! text-slate-800 line-clamp-1">
                      {lead.requirement.propertyType}
                    </Title>
                    <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                      <MapPin size={14} /> {lead.requirement.preferredLocation || "Any Location"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <Text type="secondary" className="text-[10px] block font-semibold uppercase">Usage</Text>
                      <Text className="text-slate-700 font-medium">{lead.requirement.usageType}</Text>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <Text type="secondary" className="text-[10px] block font-semibold uppercase">Max Budget</Text>
                      <Text className="text-slate-700 font-bold">
                        {lead.requirement.maxBudget ? `₹${lead.requirement.maxBudget.toLocaleString()}` : "Any"}
                      </Text>
                    </div>
                  </div>

                  {lead.isAcceptedByMe ? (
                    <div className="mt-4 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck size={18} className="text-emerald-600" />
                        <Title level={5} className="m-0! text-emerald-800">Contact Details</Title>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <User size={14} className="text-emerald-600" />
                          </div>
                          <Text className="font-bold text-slate-700">{lead.requirement.fullName}</Text>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Phone size={14} className="text-emerald-600" />
                          </div>
                          <Text className="font-semibold text-slate-700">{lead.requirement.phoneNumber}</Text>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Mail size={14} className="text-emerald-600" />
                          </div>
                          <Text className="text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis">{lead.requirement.email}</Text>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 blur-[1px] select-none pointer-events-none opacity-40">
                       <div className="h-20 bg-slate-100 rounded-xl flex flex-col items-center justify-center">
                          <Text type="secondary" className="text-xs">Accept lead to unlock details</Text>
                       </div>
                    </div>
                  )}

                  {!lead.isAcceptedByMe && (
                    <div className="mt-6">
                      <Button 
                        type="primary" 
                        block 
                        size="large"
                        className={`${lead.status === 'pending' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-300'} border-none rounded-xl h-12 font-bold shadow-md shadow-indigo-100`}
                        disabled={lead.status !== 'pending' || acceptingId === lead._id}
                        loading={acceptingId === lead._id}
                        onClick={() => handleAcceptLead(lead._id)}
                      >
                        {lead.status === 'pending' ? 'Accept Lead Now' : 'Deal Closed'}
                      </Button>
                    </div>
                  )}
                  
                  {lead.isAcceptedByMe && (
                    <div className="mt-6">
                       <Button 
                        block 
                        size="large"
                        className="bg-emerald-600 text-white hover:bg-emerald-700 border-none rounded-xl h-12 font-bold flex items-center justify-center gap-2"
                        onClick={() => window.location.href = `tel:${lead.requirement.phoneNumber}`}
                        icon={<Phone size={18} />}
                      >
                        Call Potential Client
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default LeadsOverview;
