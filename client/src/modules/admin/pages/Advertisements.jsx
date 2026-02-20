import React, { useState, useEffect } from "react";
import { Empty, message, Badge } from "antd";
import Loader from "../../../components/Common/Loader";
import {
  Megaphone,
  Phone,
  Mail,
  User,
  MapPin,
  DollarSign,
  Home,
  Building2,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  IndianRupee,
} from "lucide-react";
import axios from "axios";

const Advertisements = () => {
  const [loading, setLoading] = useState(false);
  const [advertisements, setAdvertisements] = useState([]);

  useEffect(() => {
    fetchAdvertisedProperties();
  }, []);

  const fetchAdvertisedProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/advertisements`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setAdvertisements(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching advertised properties:", error);
      message.error(
        error.response?.data?.message || "Failed to fetch advertisements",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Megaphone className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Property Advertisements
            </h1>
            <p className="text-gray-600 mt-1">
              Properties opted in for social media promotion
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loader />
      ) : advertisements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12">
          <Empty
            description="No advertised properties found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {advertisements.map((property) => {
            const seller = property.seller_id;
            const mainImage =
              property.images && property.images.length > 0
                ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${property.images[0].image_url}`
                : null;

            return (
              <div
                key={property._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='18' fill='%239ca3af' dominant-baseline='middle' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {property.is_verified ? (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </div>
                    )}
                  </div>

                  {/* Image Count */}
                  {property.images && property.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                      +{property.images.length - 1} photos
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {property.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {property.location?.city}, {property.location?.state}
                    </span>
                  </div>

                  {/* Price & Size */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center text-green-600 font-bold">
                      <IndianRupee className="w-4 h-4" />
                      <span>
                        {Number(property.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Building2 className="w-4 h-4 mr-1" />
                      <span>{property.area_size}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                      {property.property_type}
                    </span>
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                      {property.approval}
                    </span>
                  </div>

                  {/* Seller Information */}
                  {seller && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {seller.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {seller.customId}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <a
                          href={`mailto:${seller.email}`}
                          className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors group"
                        >
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400 group-hover:text-blue-600" />
                          <span className="truncate">{seller.email}</span>
                        </a>
                        <a
                          href={`tel:${seller.phone}`}
                          className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors group"
                        >
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400 group-hover:text-blue-600" />
                          <span>{seller.phone}</span>
                        </a>
                        {seller.business_type && (
                          <div className="mt-2">
                            <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-medium">
                              {seller.business_type}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>{property.view_count || 0} views</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(property.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Advertisements;
