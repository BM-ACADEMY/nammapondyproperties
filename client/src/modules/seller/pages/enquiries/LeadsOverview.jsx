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
  Badge,
  Tabs
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
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import api, { getMySharedLeads, acceptSharedLead } from "@/services/api";
import { useSocket } from "@/context/SocketContext";

const { Title, Text, Paragraph } = Typography;

const CountdownTimer = ({ startTime, timerInMinutes, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const start = new Date(startTime);
      const diffMs = (start.getTime() + timerInMinutes * 60000) - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft("00:00");
        if (onExpire) {
          // Wait 2 seconds to allow backend cron to process
          setTimeout(onExpire, 2000);
        }
        return;
      }

      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [startTime, timerInMinutes]);

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md border border-orange-100 shadow-sm">
      <Clock size={12} className="animate-pulse" />
      <span className="font-mono font-black text-[11px] tabular-nums tracking-tighter">
        {timeLeft}
      </span>
    </div>
  );
};

// Helper to get status tag (moved outside for reuse)
const getStatusTag = (lead) => {
  if (lead.isAcceptedByMe) return <Tag color="success" icon={<CheckCircle2 size={14} className="mr-1" />} className="px-3 py-0.5 rounded-lg font-bold border-none">Accepted By You</Tag>;
  
  if (lead.status === "closed" || lead.status === "accepted" || lead.status === "Deal Closed (Plan Level)") {
    const isPlanLevel = lead.status === "Deal Closed (Plan Level)";
    return (
      <Tooltip title={isPlanLevel ? "Timer expired for your plan level" : `Accepted by ${lead.acceptedBy || "another seller"}`}>
        <Tag color="error" icon={<XCircle size={14} className="mr-1" />} className="px-3 py-0.5 rounded-lg font-bold border-none">
          {isPlanLevel ? "Deal Closed (Plan Level)" : "Deal Closed"}
        </Tag>
      </Tooltip>
    );
  }
  
  if (lead.matchType === "exact") {
    return <Tag color="gold" icon={<ShieldCheck size={14} className="mr-1" />} className="px-3 py-0.5 rounded-lg font-bold border-none">Exclusive Match</Tag>;
  }
  
  return <Tag color="processing" icon={<Clock size={14} className="mr-1" />} className="px-3 py-0.5 rounded-lg font-bold border-none">Open Lead</Tag>;
};

// Extracted LeadCard for better performance and debugging
const LeadCard = ({ lead, onAccept, acceptingId, onExpire }) => (
  <Card 
    className={`h-full rounded-2xl border-none shadow-md overflow-hidden transition-all hover:shadow-lg ${lead.isAcceptedByMe ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
    bodyStyle={{ padding: 0 }}
  >
    <div className={`p-4 border-b flex justify-between items-start ${lead.isAcceptedByMe ? 'bg-emerald-50' : lead.matchType === 'exact' ? 'bg-amber-50/50' : 'bg-slate-50'}`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Text type="secondary" className="text-[10px] uppercase font-black tracking-widest text-slate-400">
            Shared {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </Text>
          {lead.status === "pending" && lead.requirement?.sharingConfig?.startTime && (
            <CountdownTimer 
              startTime={lead.requirement.sharingConfig.startTime} 
              timerInMinutes={lead.requirement.sharingConfig.timer} 
              onExpire={onExpire}
            />
          )}
        </div>
        <div className="flex gap-2 items-center">
           <Tag color="blue" className="m-0 text-[10px] px-2 rounded-md border-none font-black uppercase tracking-wider">{lead.requirement.category}</Tag>
           {lead.matchType === 'exact' && (
             <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">Exclusive</span>
           )}
        </div>
      </div>
      {getStatusTag(lead)}
    </div>

    <div className="p-5">
      <div className="mb-4">
        <Title level={5} className="m-0! text-slate-800 line-clamp-1">
          {lead.requirement.propertyType}
        </Title>
        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
          <MapPin size={14} /> {lead.requirement.preferredLocation || "Any Location"}
        </div>
      </div>
      
      <div className="mb-4 space-y-3">
        {lead.requirement.propertyPreferences && (
          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList size={14} className="text-indigo-600" />
              <Text type="secondary" className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Preferences</Text>
            </div>
            <Paragraph className="m-0 text-slate-600 text-[13px] leading-relaxed" ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
              &quot;{lead.requirement.propertyPreferences}&quot;
            </Paragraph>
          </div>
        )}

        {lead.requirement.message && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare size={14} className="text-slate-500" />
              <Text type="secondary" className="text-[10px] font-bold uppercase tracking-wider">Customer Message</Text>
            </div>
            <Paragraph className="m-0 text-slate-600 text-[13px] leading-relaxed" ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}>
              {lead.requirement.message}
            </Paragraph>
          </div>
        )}
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

       {lead.showFullDetails ? (
        <div className="mt-4 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl relative overflow-hidden ring-1 ring-emerald-500/10">
          {lead.matchType === 'exact' && (
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] font-black px-2 py-1 rounded-bl-xl uppercase tracking-widest">
              Matched for You
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
               <ShieldCheck size={20} className="text-emerald-600" />
            </div>
            <div>
              <Title level={5} className="m-0! text-emerald-800 leading-none">Customer Contact</Title>
              <Text className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">Verified Lead</Text>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-white/60 p-2.5 rounded-xl border border-emerald-100/50">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <User size={16} className="text-emerald-700" />
              </div>
              <div className="flex flex-col">
                <Text type="secondary" className="text-[9px] font-bold uppercase tracking-widest">Full Name</Text>
                <Text className="font-bold text-slate-800 text-[14px] leading-tight">{lead.requirement.fullName}</Text>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/60 p-2.5 rounded-xl border border-emerald-100/50">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Phone size={16} className="text-emerald-700" />
              </div>
              <div className="flex flex-col">
                <Text type="secondary" className="text-[9px] font-bold uppercase tracking-widest">Phone Number</Text>
                <Text className="font-bold text-slate-800 text-[15px] leading-tight">{lead.requirement.phoneNumber}</Text>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
           <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Lock size={20} className="text-slate-400" />
           </div>
           <Text className="text-slate-600 font-bold block mb-1">Contact Details Masked</Text>
           <Text type="secondary" className="text-[11px] max-w-[200px]">
             {lead.status === 'pending' 
               ? "This is an open lead. Accept it to unlock the customer contact details." 
               : "This lead has been accepted by someone else."}
           </Text>
        </div>
      )}

      {lead.status === 'pending' && !lead.showFullDetails && (
        <div className="mt-6">
          <Button 
            type="primary" 
            block 
            size="large"
            className="bg-indigo-600 hover:bg-indigo-700 border-none rounded-xl h-12 font-bold shadow-md shadow-indigo-100"
            disabled={acceptingId === lead._id}
            loading={acceptingId === lead._id}
            onClick={() => onAccept(lead._id)}
          >
            Accept Lead Now
          </Button>
        </div>
      )}

      {(lead.status === 'accepted' || lead.status === 'closed' || lead.status === 'Deal Closed (Plan Level)') && !lead.isAcceptedByMe && (
        <div className="mt-6">
          <Button 
            block 
            size="large"
            className="bg-slate-200 border-none rounded-xl h-12 font-bold text-slate-500 cursor-not-allowed"
            disabled
          >
            {lead.status === 'Deal Closed (Plan Level)' ? 'Deal Closed (Plan Level)' : 'Deal Closed'}
          </Button>
        </div>
      )}
      
      {lead.showFullDetails && (
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
);

const LeadsOverview = () => {
  const socket = useSocket();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [hasActivePlan, setHasActivePlan] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const subRes = await api.get("/subscriptions/my-subscription");
      if (!subRes.data) {
        setHasActivePlan(false);
        setLeads([]);
        return;
      }
      setSubscription(subRes.data);
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
      socket.on("new-lead-shared", (data) => {
        message.info("A new lead has been shared with your plan!");
        fetchLeads();
      });

      socket.on("lead-accepted-by-other", (data) => {
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            (lead.requirement?._id === data.requirementId || lead._id === data.leadId)
              ? { ...lead, status: "closed", acceptedBy: data.acceptedBy } 
              : lead
          )
        );
      });

      socket.on("lead-expired-for-plan", (data) => {
        // Refresh leads to get the "Deal Closed (Plan Level)" status
        fetchLeads();
      });

      return () => {
        socket.off("new-lead-shared");
        socket.off("lead-accepted-by-other");
        socket.off("lead-expired-for-plan");
      };
    }
  }, [socket]);

  const handleAcceptLead = async (leadId) => {
    setAcceptingId(leadId);
    try {
      const response = await acceptSharedLead(leadId);
      message.success(response.data.message);
      fetchLeads();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to accept lead";
      message.error(errorMsg);
      if (error.response?.status === 400) {
        fetchLeads();
      }
    } finally {
      setAcceptingId(null);
    }
  };

  if (!hasActivePlan && !loading) {
    return <Navigate to="/seller/upgrade-plan" replace />;
  }

  const availableLeads = leads.filter(l => l.status === "pending");
  const myLeads = leads.filter(l => l.isAcceptedByMe);
  const closedLeads = leads.filter(l => l.status !== "pending" && !l.isAcceptedByMe);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Title level={3} className="m-0! flex items-center gap-2">
            <ClipboardList size={28} className="text-indigo-600" />
            Leads Overview
          </Title>
          <p className="text-slate-500 mt-1">View and manage shared property requirements from the admin.</p>
        </div>
        <div className="flex items-center gap-4">
          {subscription && (
            <div className="hidden md:flex items-center bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex flex-col items-end mr-3 border-r pr-3 border-slate-100">
                <Text type="secondary" className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Lead Balance</Text>
                <Title level={5} className="m-0! text-indigo-600 font-black">
                  {subscription.plan?.leadsLimit === -1 ? '∞' : (subscription.plan?.leadsLimit || 0) - (subscription.leadsUsed || 0)} / {subscription.plan?.leadsLimit === -1 ? '∞' : subscription.plan?.leadsLimit || 0}
                </Title>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                {subscription.plan?.leadsLimit === -1 ? '∞' : Math.round((((subscription.plan?.leadsLimit || 0) - (subscription.leadsUsed || 0)) / (subscription.plan?.leadsLimit || 1)) * 100)}%
              </div>
            </div>
          )}
          <Button 
            icon={<LayoutDashboard size={16} />} 
            onClick={fetchLeads}
            loading={loading}
            className="rounded-xl h-10 font-semibold"
          >
            Refresh Leads
          </Button>
        </div>
      </div>

      <Tabs
        defaultActiveKey="available"
        className="custom-leads-tabs"
        items={[
          {
            key: "available",
            label: (
              <span className="flex items-center gap-2 px-2 py-1">
                Available Leads
                <Badge count={availableLeads.length} overflowCount={99} className="scale-75 translate-x-1" style={{ backgroundColor: '#6366f1' }} />
              </span>
            ),
            children: (
              <div className="mt-4">
                {loading && leads.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                   <p className="mt-4 text-slate-500 font-medium">Checking for new leads...</p>
                 </div>
                ) : availableLeads.length === 0 ? (
                  <Card className="rounded-2xl border-dashed border-2 py-12">
                    <Empty description={<Text type="secondary">No open leads right now. We'll notify you when new ones arrive!</Text>} />
                  </Card>
                ) : (
                  <Row gutter={[24, 24]}>
                    {availableLeads.map((lead) => (
                      <Col xs={24} md={12} lg={8} key={lead._id}>
                        <LeadCard 
                          lead={lead} 
                          onAccept={handleAcceptLead} 
                          acceptingId={acceptingId} 
                          onExpire={fetchLeads}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            )
          },
          {
            key: "myLeads",
            label: (
              <span className="flex items-center gap-2 px-2 py-1">
                My Accepted Leads
                <Badge count={myLeads.length} overflowCount={99} className="scale-75 translate-x-1" style={{ backgroundColor: '#10b981' }} />
              </span>
            ),
            children: (
              <div className="mt-4">
                {myLeads.length === 0 ? (
                  <Card className="rounded-2xl border-dashed border-2 py-12">
                    <Empty description={<Text type="secondary">You haven't accepted any leads yet.</Text>} />
                  </Card>
                ) : (
                  <Row gutter={[24, 24]}>
                    {myLeads.map((lead) => (
                      <Col xs={24} md={12} lg={8} key={lead._id}>
                        <LeadCard 
                          lead={lead} 
                          onAccept={handleAcceptLead} 
                          acceptingId={acceptingId} 
                          onExpire={fetchLeads}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            )
          },
          {
            key: "closed",
            label: (
              <span className="flex items-center gap-2 px-2 py-1">
                History / Closed
                <Badge count={closedLeads.length} overflowCount={99} className="scale-75 translate-x-1" style={{ backgroundColor: '#ef4444' }} />
              </span>
            ),
            children: (
              <div className="mt-4">
                {closedLeads.length === 0 ? (
                  <Card className="rounded-2xl border-dashed border-2 py-12">
                    <Empty description={<Text type="secondary">No closed deals to show.</Text>} />
                  </Card>
                ) : (
                  <Row gutter={[24, 24]}>
                    {closedLeads.map((lead) => (
                      <Col xs={24} md={12} lg={8} key={lead._id}>
                        <LeadCard 
                          lead={lead} 
                          onAccept={handleAcceptLead} 
                          acceptingId={acceptingId} 
                          onExpire={fetchLeads}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            )
          }
        ]}
      />

      <style>{`
        .custom-leads-tabs .ant-tabs-nav::before {
          border-bottom: 2px solid #f1f5f9;
        }
        .custom-leads-tabs .ant-tabs-tab {
          font-weight: 700 !important;
          font-size: 15px;
          color: #475569;
          transition: all 0.3s ease;
        }
        .custom-leads-tabs .ant-tabs-tab-active {
          transform: translateY(-1px);
        }
        .custom-leads-tabs .ant-tabs-ink-bar {
          height: 3px !important;
          background: #6366f1 !important;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default LeadsOverview;
