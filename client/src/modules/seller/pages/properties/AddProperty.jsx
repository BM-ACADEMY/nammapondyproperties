import React, { useState } from "react";
import PropertyForm from "../../../../components/Property/PropertyForm";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddProperty = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      // Seller specific defaults if any, currently status 'available' is set by backend default or overridden here
      // Sellers might need verification, so is_verified false by default in backend
      // formData.append("status", "available");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/properties/create-property`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success("Property added successfully!");
      navigate("/seller/properties"); // Adjust to correct seller properties route
    } catch (error) {
      console.error("Error adding property:", error);
      const errorMessage = error.response?.data?.error;
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to add property",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Add New Property
      </h1>
      <PropertyForm onSubmit={onSubmit} loading={loading} />
    </div>
  );
};

export default AddProperty;
