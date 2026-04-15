import React, { useState, useEffect } from "react";
import { Modal, Radio, Button, message } from "antd";
import axios from "axios";

const BusinessTypeModal = ({ isOpen, user, onSelected }) => {
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        setFetching(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/business-types?status=active`);
        setBusinessTypes(response.data);
      } catch (error) {
        console.error("Error fetching business types:", error);
        message.error("Failed to load business types");
      } finally {
        setFetching(false);
      }
    };

    if (isOpen) {
      fetchBusinessTypes();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!selectedType) {
      message.warning("Please select a business type");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/update-user-by-id/${user._id}`,
        { businessType: selectedType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        message.success("Business type saved successfully!");
        onSelected(response.data);
      }
    } catch (error) {
      console.error("Error saving business type:", error);
      message.error(error.response?.data?.error || "Failed to save business type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      onOk={handleSave}
      closable={false}
      maskClosable={false}
      footer={[
        <div key="footer" className="px-6 pb-8">
          <Button 
            type="primary" 
            loading={loading} 
            onClick={handleSave} 
            className="w-full h-14 rounded-2xl bg-blue-600 hover:!bg-blue-700 font-bold text-lg shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            Confirm & Continue
          </Button>
        </div>,
      ]}
      className="business-type-modal"
      width={500}
      centered
      styles={{ body: { padding: 0 } }}
    >
      {/* Header Section */}
      <div className="bg-blue-600 p-8 text-white rounded-t-3xl">
        <h2 className="text-2xl font-black mb-2 tracking-tight">Setup Your Account</h2>
        <p className="text-blue-100 opacity-90 leading-relaxed font-medium">
          Choose how you want to represent yourself on Namma Pondy Properties. 
          This will customize your profile and property listings.
        </p> 
      </div>

      <div className="p-8">
        <Radio.Group 
          onChange={(e) => setSelectedType(e.target.value)} 
          value={selectedType}
          className="w-full flex flex-col gap-4"
        >
          {businessTypes.map((type) => {
            const getDescription = (name) => {
              if (name?.match(/Owner/i)) return "I am selling or renting out my own property.";
              if (name?.match(/Agent/i)) return "I am a real estate agent helping others sell/rent.";
              if (name?.match(/Builder|Promoter/i)) return "I am a builder or developer with multiple projects.";
              return "Listing properties under this category.";
            };

            const isSelected = selectedType === type._id;

            return (
              <Radio.Button 
                key={type._id} 
                value={type._id}
                className={`h-auto !flex items-center p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
                  isSelected 
                    ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-50" 
                    : "border-slate-100 hover:border-blue-200 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className={`text-lg font-bold mb-1 transition-colors ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                    {type.name}
                  </span>
                  <span className={`text-sm font-medium leading-relaxed transition-colors ${isSelected ? "text-blue-600/80" : "text-slate-500"}`}>
                    {getDescription(type.name)}
                  </span>
                </div>
                
                {/* Visual indicator for selection */}
                {isSelected && (
                  <div className="absolute top-0 right-0 h-full w-1.5 bg-blue-600" />
                )}
              </Radio.Button>
            );
          })}
        </Radio.Group>
        
        {fetching && (
          <div className="text-center py-6 flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
             <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading options...</span>
          </div>
        )}

        <p className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
          <span className="text-amber-500 mr-1">⚠️</span> This selection is permanent once verified
        </p>
      </div>

      <style>{`
        .business-type-modal .ant-modal-content {
          padding: 0 !important;
          border-radius: 24px !important;
          overflow: hidden !important;
        }
        .business-type-modal .ant-radio-button-wrapper {
          height: auto !important;
          line-height: 1.5 !important;
        }
        .business-type-modal .ant-radio-button-wrapper::before {
          display: none !important;
        }
        .business-type-modal .ant-radio-button-wrapper-checked {
          background: #f0f7ff !important;
        }
      `}</style>
    </Modal>
  );
};

export default BusinessTypeModal;
