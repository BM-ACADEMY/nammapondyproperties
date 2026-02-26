import React, { useEffect, useState } from "react";
import { Table, Tag, Input, message, Button, Popconfirm, Tooltip } from "antd";
import {
  Search,
  Download,
  Trash2,
  Mail,
  Phone,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import moment from "moment";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";

const SellerEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/enquiries/fetch-all");
      setEnquiries(res.data);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      message.error("Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      const endpoint =
        type === "whatsapp_lead"
          ? `/enquiries/whatsapp/delete/${id}`
          : `/enquiries/delete/${id}`;

      await api.delete(endpoint);
      message.success("Enquiry deleted successfully");
      fetchEnquiries();
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      message.error(error.response?.data?.error || "Failed to delete enquiry");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
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
          <div className="flex items-center gap-3">
            <img
              src={getImageUrl(property.images?.[0]?.image_url)}
              alt="prop"
              className="w-10 h-10 rounded-lg object-cover border border-gray-100"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 text-sm line-clamp-1">
                {property.title}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {property.location?.address}
              </span>
            </div>
          </div>
        ) : (
          <Tag color="default">Deleted Property</Tag>
        ),
    },
    {
      title: "Enquirer",
      key: "enquirer",
      render: (record) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-900">
            {record.enquirer_name || "Guest"}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Phone size={12} className="text-blue-500" />
            <span>{record.enquirer_phone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail size={12} className="text-orange-500" />
            <span>{record.enquirer_email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Source",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag
          icon={
            type === "whatsapp_lead" ? (
              <MessageCircle size={12} className="inline mr-1" />
            ) : (
              <Mail size={12} className="inline mr-1" />
            )
          }
          color={type === "whatsapp_lead" ? "green" : "blue"}
          className="rounded-full px-3"
        >
          {type === "whatsapp_lead" ? "WhatsApp" : "Direct"}
        </Tag>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      render: (msg) => (
        <Tooltip title={msg}>
          <span className="text-gray-600 italic">"{msg}"</span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const isNew = !status || status.toLowerCase() === "new";
        return (
          <Tag
            color={isNew ? "processing" : "success"}
            className="uppercase font-medium text-xs rounded"
          >
            {isNew ? "NEW" : status}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (record) => (
        <div className="flex items-center gap-2">
          <Popconfirm
            title="Delete Enquiry"
            description="Are you sure you want to delete this enquiry?"
            onConfirm={() => handleDelete(record._id, record.type)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<Trash2 size={18} />}
              className="hover:bg-red-50 flex items-center justify-center"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Filter data based on search
  const filteredEnquiries = enquiries.filter(
    (item) =>
      item.property_id?.title
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      item.enquirer_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.enquirer_phone?.includes(searchText),
  );

  const downloadCSV = () => {
    if (!filteredEnquiries.length) {
      message.warning("No data to export");
      return;
    }

    const headers = [
      "Date",
      "Property Title",
      "Enquirer Name",
      "Enquirer Phone",
      "Enquirer Email",
      "Source",
      "Message",
      "Status",
    ];

    const rows = filteredEnquiries.map((item) => [
      moment(item.createdAt).format("DD/MM/YYYY hh:mm A"),
      item.property_id?.title || "Deleted Property",
      item.enquirer_name || "Guest",
      item.enquirer_phone || "N/A",
      item.enquirer_email || "N/A",
      item.type === "whatsapp_lead" ? "WhatsApp" : "Direct",
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
      `my_enquiries_export_${moment().format("YYYYMMDD_HHmm")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Property Enquiries
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and respond to your property leads
            </p>
          </div>
          <Button
            type="primary"
            icon={<Download size={18} />}
            onClick={downloadCSV}
            className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 rounded-xl flex items-center gap-2 shadow-sm border-none transition-all"
          >
            Export Records
          </Button>
        </div>

        <div className="mb-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <Input
            prefix={<Search size={20} className="text-gray-400 ml-2" />}
            placeholder="Search by property, enquirer name, or phone..."
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full border-none h-12 text-base focus:ring-0"
            size="large"
            allowClear
          />
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <Table
            columns={columns}
            dataSource={filteredEnquiries}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} enquiries`,
              className: "px-6 py-4",
            }}
            locale={{
              emptyText: (
                <div className="py-20 flex flex-col items-center">
                  <Search size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-400">No enquiries found</p>
                </div>
              ),
            }}
          />
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-5 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                </div>
              </div>
            ))
          ) : filteredEnquiries.length > 0 ? (
            filteredEnquiries.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      {item.property_id ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${item.property_id.images?.[0]?.image_url}`}
                          alt="prop"
                          className="w-16 h-16 rounded-xl object-cover border border-gray-50 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 border border-dashed border-gray-200">
                          DELETED
                        </div>
                      )}
                      <div className="flex flex-col justify-center">
                        <h3 className="font-bold text-gray-900 line-clamp-1 text-base leading-tight">
                          {item.property_id?.title || "Property Unavailable"}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          {moment(item.createdAt).format(
                            "DD MMM YYYY, hh:mm A",
                          )}
                        </p>
                      </div>
                    </div>
                    <Popconfirm
                      title="Delete Enquiry"
                      onConfirm={() => handleDelete(item._id, item.type)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<Trash2 size={20} />}
                        className="bg-red-50 hover:bg-red-100 rounded-xl h-10 w-10 flex items-center justify-center p-0"
                      />
                    </Popconfirm>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Tag
                      color={
                        !item.status || item.status === "new" ? "blue" : "green"
                      }
                      className="rounded-full px-3 m-0 border-none font-medium"
                    >
                      {!item.status || item.status === "new"
                        ? "NEW"
                        : item.status.toUpperCase()}
                    </Tag>
                    <Tag
                      color={item.type === "whatsapp_lead" ? "green" : "blue"}
                      className="rounded-full px-3 m-0 border-none font-medium"
                      icon={
                        item.type === "whatsapp_lead" ? (
                          <MessageCircle size={10} className="inline mr-1" />
                        ) : (
                          <Mail size={10} className="inline mr-1" />
                        )
                      }
                    >
                      {item.type === "whatsapp_lead" ? "WhatsApp" : "Direct"}
                    </Tag>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-50">
                    <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-gray-200/60">
                      <span className="font-bold text-gray-800">
                        {item.enquirer_name || "Guest"}
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone size={14} className="text-indigo-500" />
                          <span>{item.enquirer_phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail size={14} className="text-indigo-500" />
                          <span className="truncate">
                            {item.enquirer_email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed italic">
                      "{item.message}"
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">
                No enquiries matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerEnquiries;
