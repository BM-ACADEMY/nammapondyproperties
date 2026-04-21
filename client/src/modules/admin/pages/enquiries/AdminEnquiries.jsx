import React, { useEffect, useState } from "react";
import { Table, Tag, Button, message, Input, Popconfirm, Card, Row, Col, Typography, Tooltip, Space } from "antd";
import { Search, Download, Trash2, MessageSquare, Phone, User, Inbox, MoreVertical, ExternalLink } from "lucide-react";
import api from "@/services/api";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/imageUrl";

const { Title, Text } = Typography;

const AdminEnquiries = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewMode] = useState("all"); // Default and only view: 'all' to show platform-wide leads

  useEffect(() => {
    fetchEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/enquiries/fetch-all?view=${viewMode}`);
      setEnquiries(res.data);
    } catch (error) {
      console.error("Error fetching enquiries", error);
      message.error("Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      const endpoint =
        record.type === "whatsapp_lead"
          ? `/enquiries/whatsapp/delete/${record._id}`
          : `/enquiries/delete/${record._id}`;

      await api.delete(endpoint);
      message.success("Enquiry deleted successfully");
      fetchEnquiries();
    } catch (error) {
      console.error("Error deleting enquiry", error);
      message.error("Failed to delete enquiry");
    }
  };

  const stats = {
    total: enquiries.length,
    new: enquiries.filter((e) => e.status === "new").length,
    whatsapp: enquiries.filter((e) => e.type === "whatsapp_lead").length,
    responded: enquiries.filter((e) => e.status !== "new").length,
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">
            {moment(date).format("DD MMM YYYY")}
          </span>
          <span className="text-xs text-gray-500">
            {moment(date).format("hh:mm A")}
          </span>
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
    },
    {
      title: "Property",
      dataIndex: "property_id",
      key: "property",
      render: (property) =>
        property ? (
          <div 
            className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-all duration-300"
            onClick={() => navigate(`/properties/${property.slug || property._id}`)}
          >
            <img
              src={getImageUrl(
                property.media?.featuredImage || 
                property.media?.images?.[0] || 
                property.images?.[0]?.image_url || 
                property.images?.[0]
              )}
              alt="prop"
              className="w-10 h-10 rounded-lg object-cover shadow-sm border border-gray-100 group-hover:border-indigo-300 group-hover:shadow-md transition-all"
            />
            <div className="flex flex-col max-w-50">
              <span className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {property.basicInfo?.title || property.title || "Untitled Property"}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {typeof property.location === "string" 
                  ? property.location 
                  : (property.location?.locality || property.location?.addressLine1 || "Pondicherry")}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 italic">Deleted Property</span>
        ),
    },
    {
      title: "Seller / Managed By",
      dataIndex: "seller_id",
      key: "seller",
      render: (seller) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <User size={12} className="text-indigo-400" />
            <span className="font-semibold text-gray-800">{seller?.name || "Unknown"}</span>
          </div>
          {seller?.assignedAdmin && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-gray-400">Handled by:</span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
                {seller.assignedAdmin.name || "Manager"}
              </span>
            </div>
          )}
          <span className="text-[11px] text-gray-500 font-mono mt-1">{seller?.phone || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Enquirer",
      key: "enquirer",
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            {(record.enquirer_name || "G").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {record.enquirer_name || "Guest"}
            </span>
            <span className="text-xs text-blue-600 font-medium">
              {record.enquirer_phone}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      width: 250,
      render: (msg) => (
        <Tooltip title={msg} placement="topLeft" overlayStyle={{ maxWidth: "300px" }}>
          <div className="max-w-60 truncate text-gray-600 text-sm italic">
            "{msg || "No message provided"}"
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Lead Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag
          color={type === "whatsapp_lead" ? "green" : "blue"}
          className="rounded-full px-3 border-none flex items-center gap-1 w-fit uppercase text-[10px] font-bold"
        >
          {type === "whatsapp_lead" ? (
            <Phone size={10} />
          ) : (
            <MessageSquare size={10} />
          )}
          {type === "whatsapp_lead" ? "WhatsApp" : "Portal"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "new" ? "cyan" : "success"}
          className="rounded-full px-3 uppercase text-[10px] font-bold"
        >
          {status || "NEW"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Delete Enquiry"
            description="Are you sure you want to delete this enquiry?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              className="hover:bg-red-50 flex items-center justify-center p-2 rounded-lg"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Filter data based on search
  const filteredEnquiries = enquiries.filter(
    (item) =>
      item.property_id?.title
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      item.seller_id?.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const downloadCSV = () => {
    if (!filteredEnquiries.length) {
      message.warning("No data to export");
      return;
    }

    const headers = [
      "Date",
      "Property Title",
      "Seller Name",
      "Enquirer Name",
      "Enquirer Phone",
      "Message",
      "Status",
    ];

    const rows = filteredEnquiries.map((item) => [
      moment(item.createdAt).format("DD/MM/YYYY hh:mm A"),
      item.property_id?.title || "Deleted Property",
      item.seller_id?.name || "Unknown",
      item.enquirer_name || "Guest",
      item.enquirer_phone || "N/A",
      `"${(item.message || "").replace(/"/g, '""')}"`, // Escape quotes
      item.status?.toUpperCase() || "NEW",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `enquiries_export_${moment().format("YYYYMMDD_HHmm")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Title level={2} className="mb-0 text-gray-800">Property Enquiry Leads</Title>
          <Text type="secondary">Monitor and manage all incoming property inquiries and direct WhatsApp leads platform-wide</Text>
        </div>
        <Button
          type="primary"
          icon={<Download size={18} />}
          onClick={downloadCSV}
          className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 rounded-lg flex items-center gap-2 border-none transition-all shadow-sm"
        >
          Export Leads
        </Button>
      </div>

      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow duration-300 border-none shadow-sm bg-white overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center">
                <Inbox size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider leading-none mb-1.5">Total Leads</span>
                <span className="text-2xl font-bold text-gray-900 leading-none">{loading ? "..." : stats.total}</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow duration-300 border-none shadow-sm bg-white overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600 flex items-center justify-center">
                <User size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider leading-none mb-1.5">New Leads</span>
                <span className="text-2xl font-bold text-gray-900 leading-none">{loading ? "..." : stats.new}</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow duration-300 border-none shadow-sm bg-white overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center">
                <Phone size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider leading-none mb-1.5">WhatsApp</span>
                <span className="text-2xl font-bold text-gray-900 leading-none">{loading ? "..." : stats.whatsapp}</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow duration-300 border-none shadow-sm bg-white overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider leading-none mb-1.5">Portal Leads</span>
                <span className="text-2xl font-bold text-gray-900 leading-none">{loading ? "..." : stats.responded}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-none overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col lg:flex-row  lg:items-center lg:justify-between gap-4">
          
          {/* Title and results tag: Top on mobile, Left on desktop */}
          <div className="flex items-center gap-3">
            <Title level={4} className="mb-0 text-gray-800 font-semibold tracking-tight">
              All Platform Inquiries
            </Title>
            <Tag color="indigo" className="rounded-full border-none px-3 font-semibold text-xs whitespace-nowrap">
              {filteredEnquiries.length} TOTAL LEADS
            </Tag>
          </div>

          {/* Search bar: Below title on mobile, Right on desktop */}
          <div className="w-full lg:w-auto">
            <Input
              prefix={<Search size={18} className="text-gray-400" />}
              placeholder="Search leads..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full lg:w-60 rounded-lg bg-gray-50 border-gray-100 hover:border-indigo-300 focus:border-indigo-500 transition-all"
              size="large"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={filteredEnquiries}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 8,
              placement: "bottomRight",
              showTotal: (total) => `Total ${total} enquiries`,
              size: "default",
              className: "px-4 py-4 pt-6 border-t border-gray-50",
              responsive: true
            }}
            scroll={{ x: 1200 }}
            className="enquiries-table"
          />
        </div>
      </Card>
    </div>
  );
};

export default AdminEnquiries;
