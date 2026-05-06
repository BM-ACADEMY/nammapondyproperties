import React, { useState, useEffect } from "react";
import { Form, Input, Select, InputNumber, Button, message, Checkbox, AutoComplete } from "antd";
import { postRequirement } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useNav } from "@/context/NavContext";
import { MapPin, Phone, User, MessageCircle, FileText, Search } from "lucide-react";
import axios from "axios";


const { Option } = Select;
const { TextArea } = Input;

// Converts a raw number to an Indian-scale label: ₹25 Lakhs, ₹1.5 Crores, etc.
const formatBudgetLabel = (value) => {
  if (!value && value !== 0) return null;
  const num = Number(value);
  if (isNaN(num) || num === 0) return null;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 1)} Crore${num >= 20000000 ? "s" : ""}`;
  if (num >= 100000)  return `₹${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 1)} Lakh${num >= 200000 ? "s" : ""}`;
  if (num >= 1000)    return `₹${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
  return `₹${num.toLocaleString("en-IN")}`;
};

const BUDGET_PRESETS = [
  { label: "10 L",  value: 1000000 },
  { label: "25 L",  value: 2500000 },
  { label: "50 L",  value: 5000000 },
  { label: "75 L",  value: 7500000 },
  { label: "1 Cr",  value: 10000000 },
  { label: "2 Cr",  value: 20000000 },
  { label: "5 Cr",  value: 50000000 },
];

const PostRequirementForm = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showOtherType, setShowOtherType] = useState(false);
  const [minBudgetVal, setMinBudgetVal] = useState(null);
  const [maxBudgetVal, setMaxBudgetVal] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const { propertyTypes } = useNav();
  const [locationOptions, setLocationOptions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searching, setSearching] = useState(false);


  const usageType = Form.useWatch("usageType", form);

  // Filter property types based on usage type
  const filteredPropertyTypes = propertyTypes.filter(type => type.usageType === usageType);

  // Reset property type when usage type changes
  useEffect(() => {
    if (usageType) {
      form.setFieldsValue({ propertyType: undefined });
      setShowOtherType(false);
    }
  }, [usageType, form]);

  useEffect(() => {
    if (isAuthenticated && user) {
      form.setFieldsValue({
        fullName: user.name || "",
        phoneNumber: user.phone || ""
      });
    }
  }, [user, isAuthenticated, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Handle "Others" property type
      const finalPropertyType = values.propertyType === "Others" ? values.otherPropertyType : values.propertyType;
      
      const submissionData = {
        ...values,
        propertyType: finalPropertyType
      };

      await postRequirement(submissionData);
      message.success("Requirement posted successfully! Our team will contact you soon.");
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error posting requirement:", error);
      message.error(error.response?.data?.message || "Failed to post requirement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyTypeChange = (value) => {
    setShowOtherType(value === "Others");
  };

  const fetchLocationSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setLocationOptions([]);
      return;
    }
    setSearching(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/properties/suggestions`, {
        params: { query }
      });
      
      const internalSuggestions = response.data
        .filter(s => s.type === "City" || s.type === "Locality" || s.type === "Property")
        .map(s => ({
          value: s.mainText,
          label: (
            <div className="flex justify-between items-center py-1">
              <div className="flex flex-col text-left">
                <span className="font-semibold text-slate-800">{s.mainText}</span>
                <span className="text-xs text-slate-400">{s.subText}</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {s.type}
              </span>
            </div>
          ),
          data: s
        }));

      setLocationOptions(internalSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleLocationSelect = async (value, option) => {
    const { data } = option;
    setSearching(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          data.mainText + " " + (data.subText || "")
        )}&limit=1&addressdetails=1`
      );
      
      if (response.data && response.data.length > 0) {
        const { lat, lon, display_name, address } = response.data[0];
        const locality = address.suburb || address.town || address.village || address.hamlet || address.city_district || data.mainText;
        
        form.setFieldsValue({
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          locationText: display_name,
          locality: locality,
        });
        setSearchValue(data.mainText);
      } else {
        form.setFieldsValue({
          locationText: data.mainText + (data.subText ? `, ${data.subText}` : ""),
          locality: data.mainText,
        });
        setSearchValue(data.mainText);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      form.setFieldsValue({
        locationText: data.mainText + (data.subText ? `, ${data.subText}` : ""),
        locality: data.mainText,
      });
      setSearchValue(data.mainText);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="requirement-form py-2"
      requiredMark="optional"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {/* Full Name */}
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input prefix={<User size={16} className="text-gray-400" />} placeholder="John Doe" />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label="Phone Number"
          rules={[
            {
              validator: (_, value) => {
                if (!value || String(value).trim() === "") return Promise.reject(new Error("Enter a valid 10-digit phone number"));
                const digits = String(value).replace(/\D/g, "");
                if (digits.length !== 10) return Promise.reject(new Error("Enter a valid 10-digit phone number"));
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            prefix={<Phone size={16} className="text-gray-400" />}
            placeholder="9876543210"
            maxLength={10}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) e.preventDefault();
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (!/^\d+$/.test(pasted)) e.preventDefault();
            }}
          />
        </Form.Item>

        {/* How did you hear about us? */}
        <Form.Item
          name="heardFrom"
          label="How did you hear about us?"
          rules={[{ required: true, message: "Please select an option" }]}
        >
          <Select placeholder="Select source">
            <Option value="Social Media">Social Media</Option>
            <Option value="Facebook">Facebook</Option>
            <Option value="Instagram">Instagram</Option>
            <Option value="YouTube">YouTube</Option>
            <Option value="LinkedIn">LinkedIn</Option>
            <Option value="WhatsApp">WhatsApp</Option>
            <Option value="Google Search">Google Search</Option>
            <Option value="Reference">Reference from Known Person</Option>
            <Option value="Newspaper/Ad">Newspaper/Ad</Option>
            <Option value="Others">Others</Option>
          </Select>
        </Form.Item>



        {/* Category */}
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select placeholder="Looking to Rent or Sell/Buy?">
            <Option value="Rent">Rent</Option>
            <Option value="Sell/Buy">Sell/Buy</Option>
          </Select>
        </Form.Item>

        {/* Usage Type */}
        <Form.Item
          name="usageType"
          label="Usage Type"
          rules={[{ required: true, message: "Please select usage type" }]}
        >
          <Select 
            placeholder="Residential or Commercial?"
          >
            <Option value="Residential">Residential</Option>
            <Option value="Commercial">Commercial</Option>
          </Select>
        </Form.Item>

        {/* Property Type */}
        <Form.Item
          name="propertyType"
          label="Property Type"
          rules={[{ required: true, message: "Please select property type" }]}
        >
          <Select 
            placeholder="Select type" 
            onChange={handlePropertyTypeChange}
            disabled={!usageType}
          >
            {filteredPropertyTypes.map((type) => (
              <Option key={type._id} value={type.name}>{type.name}</Option>
            ))}
            <Option value="Others">Others</Option>
          </Select>
        </Form.Item>

        {/* Other Property Type Input */}
        {showOtherType && (
          <Form.Item
            name="otherPropertyType"
            label="Specify Other Property Type"
            rules={[{ required: true, message: "Please specify the property type" }]}
            className="md:col-span-2"
          >
            <Input prefix={<FileText size={16} className="text-gray-400" />} placeholder="Enter property type" />
          </Form.Item>
        )}

        {/* Preferred Location */}
        <div className="md:col-span-2">
          <Form.Item
            label={<span className="font-semibold text-slate-700">Preferred Location</span>}
            required
          >
            <div className="flex flex-col md:flex-row gap-3">
              <AutoComplete
                options={locationOptions}
                onSelect={handleLocationSelect}
                onSearch={fetchLocationSuggestions}
                value={searchValue}
                onChange={(val) => {
                  setSearchValue(val);
                  if (form.getFieldValue("locationText")) {
                    form.setFieldsValue({ locationText: undefined });
                  }
                }}
                className="w-full"
              >
                <Input
                  placeholder="Type to search location (e.g. Kottakuppam)"
                  prefix={searching ? <div className="inline-block w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mr-2" /> : <Search size={18} className="text-slate-400" />}
                  className="h-10"
                />
              </AutoComplete>
              <Form.Item
                name="locationText"
                noStyle
                rules={[{ required: true, message: "Please search and select a location" }]}
              >
                <Input 
                  placeholder="Verified location will appear here..." 
                  prefix={<MapPin size={18} className="text-blue-500" />}
                  readOnly
                  className="bg-blue-50/50 border-blue-100 font-medium h-10"
                />
              </Form.Item>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 italic">
              Note: You must search and select a location from the suggestions to ensure accurate matching.
            </p>
          </Form.Item>

          {/* Hidden inputs for coordinates */}
          <Form.Item name="lat" hidden><Input /></Form.Item>
          <Form.Item name="lng" hidden><Input /></Form.Item>
        </div>

        {/* Budget Range */}
        <Form.Item
          label={
            <span className="font-medium">
              Budget Range
              <span className="ml-2 text-[11px] font-normal text-slate-400 normal-case">
                (Enter in ₹ — e.g. 2500000 = ₹25 Lakhs)
              </span>
            </span>
          }
          className="mb-0 md:col-span-2"
        >
          {/* Quick-pick presets */}
          <div className="flex flex-wrap gap-2 mb-3">
            {BUDGET_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  form.setFieldsValue({ maxBudget: p.value });
                  setMaxBudgetVal(p.value);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  maxBudgetVal === p.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {p.label}
              </button>
            ))}
            <span className="text-[10px] text-slate-400 self-center ml-1">← Quick-set Max Budget</span>
          </div>

          <div className="flex gap-4">
            {/* Min Budget */}
            <div className="flex-1">
              <Form.Item name="minBudget" className="!mb-0">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Min Budget (e.g. 1000000)"
                  controls={false}
                  min={0}
                  formatter={(value) => value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                  parser={(value) => value.replace(/[^0-9]/g, "")}
                  onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                  onChange={(val) => setMinBudgetVal(val)}
                />
              </Form.Item>
              {formatBudgetLabel(minBudgetVal) && (
                <div className="mt-1 text-xs font-semibold text-blue-600 pl-1">
                  = {formatBudgetLabel(minBudgetVal)}
                </div>
              )}
            </div>

            {/* Max Budget */}
            <div className="flex-1">
              <Form.Item name="maxBudget" className="!mb-0">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Max Budget (e.g. 5000000)"
                  controls={false}
                  min={0}
                  formatter={(value) => value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                  parser={(value) => value.replace(/[^0-9]/g, "")}
                  onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                  onChange={(val) => setMaxBudgetVal(val)}
                />
              </Form.Item>
              {formatBudgetLabel(maxBudgetVal) && (
                <div className="mt-1 text-xs font-semibold text-blue-600 pl-1">
                  = {formatBudgetLabel(maxBudgetVal)}
                </div>
              )}
            </div>
          </div>
        </Form.Item>

        {/* Property Preferences */}
        <Form.Item
          name="propertyPreferences"
          label="Property Preferences"
          className="md:col-span-2"
        >
          <TextArea rows={2} placeholder="e.g. 3 BHK, Semi-furnished, Gated Community, Near Metro station..." />
        </Form.Item>

        {/* Message Box */}
        <Form.Item
          name="message"
          label="Message Box"
          className="md:col-span-2"
        >
          <TextArea rows={3} placeholder="Any additional details or specific requirements..." />
        </Form.Item>
      </div>

      <div className="flex justify-end gap-3 mt-4 border-t pt-6">
        {onCancel && (
          <Button onClick={onCancel} className="h-11 px-6 px-[20px] rounded-lg">
            Cancel
          </Button>
        )}
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="h-11 px-8 px-[30px] rounded-lg bg-[#166aa8] hover:bg-[#0078d7] border-none shadow-md font-semibold"
        >
          Submit Requirement
        </Button>
      </div>
    </Form>
  );
};

export default PostRequirementForm;
