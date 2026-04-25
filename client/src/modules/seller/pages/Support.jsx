import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Card,
  List,
  Tag,
  Input,
  Button,
  Avatar,
  Typography,
  Empty,
  Modal,
  Form,
  message,
  Badge,
  Tooltip,
  Divider,
} from "antd";
import {
  SendOutlined,
  PlusOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ReloadOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  MoreOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSocket } from "../../../context/SocketContext";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import moment from "moment";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [form] = Form.useForm();
  
  const { user } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeTicket?.messages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      const { ticketId, message: newMessage } = data;
      
      setTickets((prev) => {
        const updated = prev.map((t) =>
          t._id === ticketId
            ? { ...t, lastMessageAt: newMessage.createdAt }
            : t
        );
        return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });

      setActiveTicket((prev) => {
        if (prev && prev._id === ticketId) {
          const exists = prev.messages.some(m => 
            (m._id && m._id === newMessage._id) || 
            (m.content === newMessage.content && Math.abs(new Date(m.createdAt) - new Date(newMessage.createdAt)) < 5000)
          );
          if (exists) return prev;
          
          return {
            ...prev,
            messages: [...prev.messages, newMessage],
          };
        }
        return prev;
      });
    };

    const handleMessagesRead = (data) => {
      if (data.ticketId === activeTicket?._id) {
        setActiveTicket(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map(m => !m.isAdmin ? { ...m, read: true } : m)
          };
        });
      }
    };

    const handleStatusUpdated = (data) => {
      const updatedTicket = data.ticket;
      setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
      if (activeTicket?._id === updatedTicket._id) {
        setActiveTicket(updatedTicket);
      }
    };

    socket.on("new-support-message", handleNewMessage);
    socket.on("messages-read", handleMessagesRead);
    socket.on("ticket-status-updated", handleStatusUpdated);

    return () => {
      socket.off("new-support-message", handleNewMessage);
      socket.off("messages-read", handleMessagesRead);
      socket.off("ticket-status-updated", handleStatusUpdated);
    };
  }, [socket, activeTicket?._id]);

  useEffect(() => {
    let result = tickets;
    if (searchTerm) {
      result = result.filter(t => 
        t.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredTickets(result);
  }, [tickets, searchTerm]);

  // Auto-remove expired tickets from UI in real-time
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setTickets(prev => {
        const now = moment();
        const filtered = prev.filter(t => {
          if (!t.resolvedAt) return true;
          // Use 30 days for production
          const expiryTime = moment(t.resolvedAt).add(30, 'days');
          return now.isBefore(expiryTime);
        });
        
        if (filtered.length !== prev.length) {
          // If the active ticket was removed, clear it
          if (activeTicket && !filtered.find(t => t._id === activeTicket._id)) {
            setActiveTicket(null);
          }
          return filtered;
        }
        return prev;
      });
    }, 60000); // Check every minute in production

    return () => clearInterval(cleanupInterval);
  }, [activeTicket]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/support-tickets/my-tickets");
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      message.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (id) => {
    try {
      const response = await api.get(`/support-tickets/${id}`);
      if (response.data.success) {
        setActiveTicket(response.data.ticket);
      }
    } catch (error) {}
  };

  const handleCreateTicket = async (values) => {
    setSending(true);
    try {
      const response = await api.post("/support-tickets", values);
      if (response.data.success) {
        message.success("Ticket created!");
        setIsModalOpen(false);
        form.resetFields();
        fetchTickets();
        setActiveTicket(response.data.ticket);
      }
    } catch (error) {
      message.error("Failed to create ticket");
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeTicket || sending) return;
    setSending(true);

    try {
      const response = await api.post(
        `/support-tickets/message/${activeTicket._id}`,
        { content: messageText, isAdmin: false }
      );
      if (response.data.success) {
        setActiveTicket(response.data.ticket);
        setMessageText("");
        setTickets(prev => prev.map(t => t._id === activeTicket._id ? { ...t, lastMessageAt: new Date() } : t));
      }
    } catch (error) {
      message.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "processing";
      case "closed": return "default";
      case "resolved": return "success";
      default: return "default";
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] overflow-hidden ${isMobile ? "-m-4" : "-m-6"} bg-gray-100`}>
      <Layout className="flex-1 bg-transparent">
        {/* Sidebar */}
        {(!isMobile || !activeTicket) && (
          <Sider 
            width={isMobile ? "100%" : 380} 
            className="bg-white border-r border-gray-200 flex flex-col h-full shadow-lg z-20" 
            theme="light"
          >
            <div className="p-6 bg-gray-200 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="m-0 font-bold tracking-tight text-gray-800">Support Desk</Title>
                <div className="flex items-center gap-2">
                  <Tooltip title="New Ticket">
                    <Button 
                      type="primary" 
                      shape="circle" 
                      icon={<PlusOutlined />} 
                      onClick={() => setIsModalOpen(true)}
                    />
                  </Tooltip>
                  <Button 
                    type="text" 
                    shape="circle" 
                    icon={<ReloadOutlined className="text-gray-500" />} 
                    onClick={fetchTickets} 
                    loading={loading}
                  />
                </div>
              </div>
              <Input 
                placeholder="Search tickets..." 
                prefix={<SearchOutlined className="text-gray-500" />}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="rounded-xl bg-white border-gray-200 h-10 px-4 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            <div className="overflow-y-auto flex-1 bg-white">
              <List
                loading={loading}
                dataSource={filteredTickets}
                renderItem={(item) => (
                  <div
                    className={`relative cursor-pointer transition-all border-b border-gray-100 hover:bg-blue-50/50 ${
                      activeTicket?._id === item._id ? "bg-blue-50 shadow-[inset_4px_0_0_0_#2563eb]" : ""
                    }`}
                    onClick={() => fetchTicketDetails(item._id)}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <Tag color={getStatusColor(item.status)} className="m-0 rounded-full text-[10px] px-2 py-0 border-none font-bold uppercase tracking-wider shadow-sm">
                          {item.status}
                        </Tag>
                        <div className="flex flex-col items-end">
                          <Text className="text-[11px] text-gray-400 font-bold uppercase">
                            {moment(item.lastMessageAt).fromNow()}
                          </Text>
                          {item.resolvedAt && (
                            <Text className="text-[9px] text-red-500 font-bold uppercase mt-0.5">
                              Deletes in {Math.max(0, 30 - moment().diff(moment(item.resolvedAt), 'days'))} days
                            </Text>
                          )}
                        </div>
                      </div>
                      <Text strong className={`text-sm block truncate ${activeTicket?._id === item._id ? "text-blue-700" : "text-gray-800"}`}>
                        {item.subject}
                      </Text>
                      <Text className="text-[11px] text-gray-400 truncate block mt-1">
                        ID: {item._id.slice(-8).toUpperCase()}
                      </Text>
                    </div>
                  </div>
                )}
                locale={{
                  emptyText: <Empty description="No tickets yet" className="my-10" />,
                }}
              />
            </div>
          </Sider>
        )}

        {/* Chat Area */}
        {(!isMobile || activeTicket) && (
          <Content className="bg-[#f0f2f5] flex flex-col h-full relative overflow-hidden">
            {activeTicket ? (
              <>
                {/* Chat Header */}
                <div className={`px-4 lg:px-8 py-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10`}>
                  <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
                    {isMobile && (
                      <Button 
                        type="text" 
                        icon={<ArrowLeftOutlined className="text-gray-700" />} 
                        onClick={() => setActiveTicket(null)} 
                        className="mr-1"
                      />
                    )}
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-100">
                      <MessageOutlined className="text-lg lg:text-xl text-white" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Title level={isMobile ? 5 : 4} className="m-0 font-bold truncate text-gray-800">{activeTicket.subject}</Title>
                        <Tag color={getStatusColor(activeTicket.status)} className="m-0 rounded-full text-[9px] px-2 py-0 border-none font-bold uppercase tracking-widest hidden sm:inline-block">
                          {activeTicket.status}
                        </Tag>
                      </div>
                      <Text className="text-[10px] lg:text-xs truncate block text-gray-500 font-medium">
                        Ref ID: <span className="font-mono bg-gray-100 px-1 rounded">{activeTicket._id.slice(-12).toUpperCase()}</span>
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isMobile && (
                      <>
                        <Divider type="vertical" className="h-8 border-gray-200" />
                        <Button icon={<MoreOutlined className="text-gray-500" />} type="text" shape="circle" />
                      </>
                    )}
                  </div>
                </div>

                {/* Messages Container with WhatsApp Background */}
                <div 
                  className={`flex-1 overflow-y-auto ${isMobile ? "p-3" : "p-8"} space-y-3 bg-[#efeae2] relative`}
                  style={{
                    backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
                    backgroundBlendMode: 'overlay',
                    backgroundColor: '#efeae2'
                  }}
                >
                  <div className="flex flex-col items-center gap-2 mb-6">
                    <div className="bg-[#fff9c2] px-3 py-1.5 rounded-lg border border-gray-200/50 shadow-sm flex items-center gap-2">
                      <ClockCircleOutlined className="text-gray-500 text-[10px]" />
                      <Text className="text-[11px] font-medium text-gray-700 uppercase tracking-wide">
                        Ticket Created {moment(activeTicket.createdAt).format("MMM DD, YYYY")}
                      </Text>
                    </div>
                    {activeTicket.resolvedAt && (
                      <div className="bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 shadow-sm flex items-center gap-2">
                        <DeleteOutlined className="text-red-500 text-[10px]" />
                        <Text className="text-[11px] font-bold text-red-600 uppercase tracking-wide">
                          Auto-deletion in {Math.max(0, 30 - moment().diff(moment(activeTicket.resolvedAt), 'days'))} days
                        </Text>
                      </div>
                    )}
                  </div>

                  {activeTicket.messages.map((msg, idx) => {
                    const isMe = !msg.isAdmin; // In seller panel, seller is "me"
                    return (
                      <div
                        key={idx}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1 animate-in fade-in slide-in-from-bottom-1 duration-200`}
                      >
                        <div className={`relative max-w-[85%] lg:max-w-[65%] min-w-[80px] px-3 py-1.5 rounded-lg shadow-sm ${
                          isMe 
                            ? "bg-[#d9fdd3] rounded-tr-none ml-10" 
                            : "bg-white rounded-tl-none mr-10"
                        }`}>
                          {/* WhatsApp Bubble Tail */}
                          <div 
                            className={`absolute top-0 w-3 h-3 ${isMe ? "-right-2" : "-left-2"}`}
                            style={{
                              background: isMe ? '#d9fdd3' : '#ffffff',
                              clipPath: isMe ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)'
                            }}
                          />
                          
                          <div className="text-[14px] lg:text-[15px] text-[#111b21] leading-relaxed whitespace-pre-wrap pb-2 pr-14">
                            {msg.content}
                          </div>
                          
                          <div className="absolute bottom-1 right-2 flex items-center gap-1">
                            <span className="text-[10px] text-[#667781] leading-none">
                              {moment(msg.createdAt).format("HH:mm")}
                            </span>
                            {isMe && (
                              <div className="flex items-center -mb-0.5">
                                {msg.read ? (
                                  <svg viewBox="0 0 16 11" width="16" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.5 5.5L5.5 9.5L14.5 0.5" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M5.5 5.5L9.5 9.5L18.5 0.5" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(-4, 0)"/>
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 16 11" width="16" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.5 5.5L5.5 9.5L14.5 0.5" stroke="#667781" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Input Area */}
                <div className={`${isMobile ? "p-3" : "p-6"} bg-white border-t border-gray-200 shadow-lg`}>
                  {activeTicket.status === "open" ? (
                    <div className="flex items-end gap-3 bg-gray-50 p-2 lg:p-3 rounded-[24px] lg:rounded-[32px] border border-gray-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-xl transition-all duration-300">
                      <Input.TextArea
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onPressEnter={(e) => {
                          if (!e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 border-none bg-transparent shadow-none focus:ring-0 text-sm lg:text-base p-2 lg:px-4 resize-none min-h-[40px] flex items-center"
                        style={{ boxShadow: 'none' }}
                      />
                      <div className="pb-1 pr-1">
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={handleSendMessage}
                          loading={sending}
                          disabled={!messageText.trim()}
                          className="bg-blue-600 hover:bg-blue-700 border-none h-10 lg:h-12 w-10 lg:w-12 flex items-center justify-center rounded-2xl lg:rounded-3xl shadow-lg shadow-blue-200 transition-all active:scale-90"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 bg-gray-100 rounded-2xl border border-dashed border-gray-300 text-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mb-1">
                        <CheckCircleOutlined className="text-gray-600 text-xs" />
                      </div>
                      <Text className="font-bold text-[10px] uppercase tracking-widest text-gray-500">
                        THIS TICKET IS {activeTicket.status.toUpperCase()}
                      </Text>
                      <Text className="text-[11px] text-gray-400 mt-1">Please create a new ticket if you need further help.</Text>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 lg:p-20">
                <div className="w-24 h-24 lg:w-32 lg:h-32 flex items-center justify-center mb-6 lg:mb-8">
                  <MessageOutlined style={{ fontSize: isMobile ? 40 : 60 }} className="text-blue-500" />
                </div>
                <Title level={isMobile ? 4 : 3} className="text-gray-900 font-black mb-3 text-center uppercase tracking-tight">SUPPORT HUB</Title>
                <Text className="max-w-xs lg:max-w-md text-gray-500 text-xs lg:text-sm font-medium leading-relaxed uppercase tracking-tight">
                  Our team is ready to help. Select a ticket or create a new one.
                </Text>
                <Button 
                  type="primary" 
                  size="large" 
                  className="mt-8 rounded-full px-10 h-14 shadow-xl shadow-blue-100 font-bold"
                  onClick={() => setIsModalOpen(true)}
                >
                  NEW SUPPORT REQUEST
                </Button>
              </div>
            )}
          </Content>
        )}
      </Layout>

      <Modal
        title={
          <div className="pb-2 border-b border-gray-100">
            <Text strong className="text-lg">Create Support Ticket</Text>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        className="rounded-3xl overflow-hidden"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTicket} className="mt-6">
          <Form.Item
            name="subject"
            label={<Text className="font-bold text-gray-600 uppercase text-[11px] tracking-wider">Subject</Text>}
            rules={[{ required: true, message: "Please enter a subject" }]}
          >
            <Input placeholder="Describe your issue briefly..." size="large" className="rounded-xl border-gray-200 h-12 focus:border-blue-500" />
          </Form.Item>
          <Form.Item
            name="message"
            label={<Text className="font-bold text-gray-600 uppercase text-[11px] tracking-wider">Detailed Description</Text>}
            rules={[{ required: true, message: "Please describe your issue" }]}
          >
            <Input.TextArea
              rows={5}
              placeholder="Provide as much detail as possible so our team can help you faster..."
              className="rounded-xl border-gray-200 focus:border-blue-500 p-4"
            />
          </Form.Item>
          <div className="flex justify-end pt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={sending}
              size="large"
              className="rounded-2xl px-12 h-14 font-bold shadow-lg shadow-blue-100"
            >
              SUBMIT TICKET
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Support;
