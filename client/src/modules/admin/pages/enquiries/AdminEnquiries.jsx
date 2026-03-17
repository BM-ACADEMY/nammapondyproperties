import React, { useEffect, useState } from "react";
import { Table, Tag, Button, message, Input, Popconfirm } from "antd";
import { Search, Download, Trash2 } from "lucide-react";
import api from "@/services/api";
import moment from "moment";
import { getImageUrl } from "@/utils/imageUrl";

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewMode] = useState("my"); // Default and only view: 'my'

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

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD MMM YYYY, hh:mm A"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
    },
    {
      title: "Property",
      dataIndex: "property_id",
      key: "property",
      render: (property) =>
        property ? (
          <div className="flex items-center gap-2">
            <img
              src={getImageUrl(property.images?.[0]?.image_url)}
              alt="prop"
              className="w-8 h-8 rounded object-cover"
            />
            <span className="font-medium">{property.title}</span>
          </div>
        ) : (
          <span className="text-gray-400">Deleted Property</span>
        ),
    },
    {
      title: "Seller/Developer",
      dataIndex: "seller_id",
      key: "seller",
      render: (seller) => seller?.name || "Unknown",
    },
    {
      title: "Enquirer",
      key: "enquirer",
      render: (record) => (
        <div className="flex flex-col text-sm">
          <span className="font-semibold">
            {record.enquirer_name || "Guest"}
          </span>
          <span className="text-gray-500">{record.enquirer_phone}</span>
        </div>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "new" ? "blue" : "green"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
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
            className="flex items-center justify-center"
          />
        </Popconfirm>
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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Property Enquiries (Leads)
      </h1>

      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full md:w-auto">
          {/* View toggle removed per user request - Defaulting to My Enquiries */}
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Input
            prefix={<Search size={18} className="text-gray-400" />}
            placeholder="Search by property or seller..."
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md w-full"
            size="large"
          />
          <Button
            type="primary"
            icon={<Download size={18} />}
            onClick={downloadCSV}
            className="bg-green-600 hover:bg-green-700 w-full md:w-auto flex items-center justify-center gap-2"
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredEnquiries}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </div>
    </div>
  );
};

export default AdminEnquiries;
