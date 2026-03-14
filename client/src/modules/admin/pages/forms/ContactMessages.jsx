import { useState, useEffect } from "react";
import { Table, Card, Button, Input, Tag, message, Drawer, Descriptions, Popconfirm } from "antd";
import { Download, Search, RefreshCw, Eye, Trash2 } from "lucide-react";
import api from "@/services/api";
import * as XLSX from "xlsx";
import moment from "moment";

const ContactMessages = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/forms/contact");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      message.error("Failed to fetch contact messages");
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
      Name: item.name || "-",
      Phone: item.phone || "-",
      Email: item.email || "-",
      "Wants to Sell": item.sellProperty ? "Yes" : "No",
      Message: item.message || "-",
      Status: item.status || "new",
      "Received On": moment(item.createdAt).format("DD-MM-YYYY hh:mm A"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ContactMessages");
    XLSX.writeFile(workbook, `Contact_Messages_${moment().format("DDMMYY")}.xlsx`);
  };

  const handleView = (record) => {
    setSelectedMessage(record);
    setViewDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/forms/contact/${id}`);
      if (res.data.success) {
        message.success("Message deleted successfully");
        fetchData();
        if (selectedMessage && selectedMessage._id === id) {
          setViewDrawerOpen(false);
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      message.error(error.response?.data?.message || "Failed to delete message");
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone?.includes(searchText) ||
      item.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-blue-600">{record.phone}</span>
          <span className="text-xs text-gray-500">{record.email}</span>
        </div>
      ),
    },
    {
      title: "Type",
      key: "sellProperty",
      width: 140,
      render: (_, record) => (
        record.sellProperty ? (
          <Tag color="purple" className="font-bold border-none">Seller Enquiry</Tag>
        ) : (
          <Tag color="cyan" className="font-bold border-none">General</Tag>
        )
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
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
      width: 130,
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button 
            type="text" 
            icon={<Eye className="w-4 h-4 text-blue-600" />} 
            onClick={() => handleView(record)}
            className="hover:bg-blue-50"
          >
            View
          </Button>
          <Popconfirm
            title="Delete the message"
            description="Are you sure to delete this message?"
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
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-800 whitespace-nowrap">Contact Messages</span>
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
              placeholder="Search name, phone, email..."
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
            showTotal: (total) => `Total ${total} messages`,
          }}
          className="admin-forms-table"
        />
      </Card>

      <Drawer
        title={<span className="text-lg font-bold">Message Details</span>}
        placement="right"
        width={500}
        onClose={() => setViewDrawerOpen(false)}
        open={viewDrawerOpen}
      >
        {selectedMessage && (
          <Descriptions column={1} bordered className="message-details-drawer">
            <Descriptions.Item label={<span className="font-semibold text-gray-500">Name</span>}>
              <span className="font-bold text-gray-900">{selectedMessage.name}</span>
            </Descriptions.Item>
            <Descriptions.Item label={<span className="font-semibold text-gray-500">Phone</span>}>
              {selectedMessage.phone}
            </Descriptions.Item>
            <Descriptions.Item label={<span className="font-semibold text-gray-500">Email</span>}>
              {selectedMessage.email}
            </Descriptions.Item>
            <Descriptions.Item label={<span className="font-semibold text-gray-500">Date</span>}>
              {moment(selectedMessage.createdAt).format("DD MMM YYYY, hh:mm A")}
            </Descriptions.Item>
            <Descriptions.Item label={<span className="font-semibold text-gray-500">Enquiry Type</span>}>
              {selectedMessage.sellProperty ? 'Wants to Sell Property' : 'General Enquiry'}
            </Descriptions.Item>
            <Descriptions.Item label={<span className="font-semibold text-gray-500">Message</span>}>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-700 mt-2 border border-gray-100">
                {selectedMessage.message || <span className="text-gray-400 italic">No message provided</span>}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default ContactMessages;
