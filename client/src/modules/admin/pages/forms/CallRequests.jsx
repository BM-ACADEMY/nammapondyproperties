import { useState, useEffect } from "react";
import { Table, Card, Button, Input, Tag, message, Popconfirm } from "antd";
import { Download, Search, RefreshCw, Trash2 } from "lucide-react";
import api from "@/services/api";
import * as XLSX from "xlsx";
import moment from "moment";

const timeMapping = {
  morning: "9 AM to 12 PM",
  afternoon: "12 PM to 3 PM",
  evening: "3 PM to 7 PM"
};

const CallRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/forms/request-call");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching callback requests:", error);
      message.error("Failed to fetch callback requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    if (data.length === 0) {
      message.warning("No data to export");
      return;
    }

    const exportData = data.map((item, index) => ({
      "S.No": index + 1,
      Name: item.fullName || "-",
      Phone: item.phone || "-",
      Email: item.email || "-",
      Category: item.category || "-",
      "Preferred Time": timeMapping[item.preferredTime] || item.preferredTime || "-",
      Status: item.status || "new",
      "Requested On": moment(item.createdAt).format("DD-MM-YYYY hh:mm A"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CallRequests");
    XLSX.writeFile(workbook, `Callback_Requests_${moment().format("DDMMYY")}.xlsx`);
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/forms/request-call/${id}`);
      if (res.data.success) {
        message.success("Request deleted successfully");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      message.error(error.response?.data?.message || "Failed to delete request");
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone?.includes(searchText) ||
      item.category?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
      render: (text) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-blue-600">{record.phone}</span>
          {record.email && <span className="text-xs text-gray-500">{record.email}</span>}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (text) => (
        <span className="capitalize px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
          {text}
        </span>
      ),
    },
    {
      title: "Preferred Time",
      dataIndex: "preferredTime",
      key: "preferredTime",
      width: 150,
      render: (text) => <span className="capitalize text-gray-700 font-medium">{timeMapping[text] || text}</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => (
        <div className="flex flex-col">
          <span>{moment(date).format("DD MMM, YYYY")}</span>
          <span className="text-xs text-gray-500">{moment(date).format("hh:mm A")}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "blue";
        if (status === "closed") color = "green";
        if (status === "new") color = "volcano";
        return <Tag color={color} className="uppercase font-bold tracking-wider text-[10px]">{status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Delete the request"
          description="Are you sure to delete this request?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            type="text" 
            danger 
            icon={<Trash2 className="w-4 h-4" />} 
            className="hover:bg-red-50"
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-800 whitespace-nowrap">Callback Requests</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              {filteredData.length} Total
            </span>
          </div>
        }
        extra={
          <div className="flex space-x-3 items-center">
            <Button
              icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchData}
              type="text"
              className="text-gray-500 hover:text-blue-600"
            />
            <Input
              placeholder="Search name, phone..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64 rounded-full"
              allowClear
            />
            <Button
              type="primary"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 rounded-lg flex items-center font-semibold tracking-wide border-none shadow-md shadow-green-600/20"
            >
              Export Excel
            </Button>
          </div>
        }
        className="shadow-sm border-gray-100 rounded-2xl overflow-hidden"
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} requests`,
          }}
          className="admin-forms-table"
        />
      </Card>
    </div>
  );
};

export default CallRequests;
