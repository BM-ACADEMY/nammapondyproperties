import React, { useEffect, useState } from "react";
import { Table, Tag, Input, message, Button } from "antd";
import { Search, Download } from "lucide-react";
import moment from "moment";
import api from "@/services/api";

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
              src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${
                property.images?.[0]?.image_url
              }`}
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
      title: "Enquirer",
      key: "enquirer",
      render: (record) => (
        <div className="flex flex-col text-sm">
          <span className="font-semibold">
            {record.enquirer_name || "Guest"}
          </span>
          <span className="text-gray-500">{record.enquirer_phone}</span>
          <span className="text-xs text-gray-400">{record.enquirer_email}</span>
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
          {status ? status.toUpperCase() : "NEW"}
        </Tag>
      ),
    },
  ];

  // Filter data based on search
  const filteredEnquiries = enquiries.filter(
    (item) =>
      item.property_id?.title
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      item.enquirer_name?.toLowerCase().includes(searchText.toLowerCase()),
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
      "Message",
      "Status",
    ];

    const rows = filteredEnquiries.map((item) => [
      moment(item.createdAt).format("DD/MM/YYYY hh:mm A"),
      item.property_id?.title || "Deleted Property",
      item.enquirer_name || "Guest",
      item.enquirer_phone || "N/A",
      item.enquirer_email || "N/A",
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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Property Enquiries
      </h1>

      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <Input
          prefix={<Search size={18} className="text-gray-400" />}
          placeholder="Search by property or enquirer..."
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-md w-full"
          size="large"
        />
        <Button
          type="primary"
          icon={<Download size={18} />}
          onClick={downloadCSV}
          className="bg-green-600 hover:bg-green-700 w-full md:w-auto flex items-center justify-center gap-2 text-white h-10 px-4 rounded-lg transition-colors"
        >
          Export CSV
        </Button>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <Table
          columns={columns}
          dataSource={filteredEnquiries}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "No enquiries found" }}
        />
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          // Loading skeleton for mobile
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="flex gap-4 mb-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : filteredEnquiries.length > 0 ? (
          filteredEnquiries.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  {item.property_id ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${item.property_id.images?.[0]?.image_url}`}
                      alt="prop"
                      className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                      Deleted
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 line-clamp-1">
                      {item.property_id?.title || "Property Unavailable"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {moment(item.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </p>
                    <Tag
                      color={item.status === "new" ? "blue" : "green"}
                      className="mt-2 text-xs"
                    >
                      {item.status ? item.status.toUpperCase() : "NEW"}
                    </Tag>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                <div className="flex flex-col gap-1 mb-2 pb-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">
                    {item.enquirer_name || "Guest"}
                  </span>
                  <div className="text-gray-500 text-xs flex gap-3">
                    <span>{item.enquirer_phone}</span>
                    <span>{item.enquirer_email}</span>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{item.message}"</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No enquiries found
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerEnquiries;
