import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Country, State, City } from "country-state-city";
import { toast } from "react-hot-toast";
import axios from "axios";
import { getImageUrl } from "@/utils/imageUrl";
import { useNav } from "@/context/NavContext";
import {
  X,
  Upload as UploadIcon,
  Plus,
  Trash2,
  MapPin,
  Briefcase,
} from "lucide-react";
import { Upload, Modal as AntModal } from "antd";
import ImgCrop from "antd-img-crop";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// commonAmenities will be fetched from backend starting from this update
const FALLBACK_AMENITIES = [
  "Lift", "Car Parking", "Bike Parking", "Visitor Parking", "Power Backup",
  "24x7 Water Supply", "CCTV Surveillance", "24x7 Security", "Intercom",
  "Fire Safety System", "Gated Community", "Gym", "Swimming Pool", "Club House"
];

function LocationMarker({ position, setPosition, setValue }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setValue("location.coordinates.lat", e.latlng.lat);
      setValue("location.coordinates.lng", e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

const PropertyForm = ({
  initialData = {},
  onSubmit,
  loading = false,
  isEdit = false,
  isSeller = false,
}) => {
  const getFormValues = (data) => ({
    basicInfo: {
      title: data?.basicInfo?.title || data?.title || "",
      description: data?.basicInfo?.description || data?.description || "",
      category: data?.basicInfo?.category || "Sell",
      usageType: data?.basicInfo?.usageType || "Residential",
      propertyType: data?.basicInfo?.propertyType || data?.property_type || "",
      approvalType: data?.basicInfo?.approvalType || data?.approval || "",
    },
    pricing: {
      sell: {
        price: data?.pricing?.sell?.price || data?.price || "",
        pricePerSqft: data?.pricing?.sell?.pricePerSqft || "",
      },
      rent: {
        monthlyRent: data?.pricing?.rent?.monthlyRent || data?.price || "",
        securityDeposit: data?.pricing?.rent?.securityDeposit || "",
        maintenance: data?.pricing?.rent?.maintenance || "",
        availableFrom: data?.pricing?.rent?.availableFrom || "",
        tenantPreference: {
          bachelor: data?.pricing?.rent?.tenantPreference?.bachelor || false,
          family: data?.pricing?.rent?.tenantPreference?.family || false,
          pets: data?.pricing?.rent?.tenantPreference?.pets || false,
        }
      }
    },
    businessType: data?.businessType?._id || data?.businessType || data?.specifications?.commercial?.businessType || "",
    specifications: {
      area: {
        totalArea: data?.specifications?.area?.totalArea || data?.area_size || "",
        builtupArea: data?.specifications?.area?.builtupArea || "",
        carpetArea: data?.specifications?.area?.carpetArea || "",
      },
      floor: {
        totalFloor: data?.specifications?.floor?.totalFloor || "",
        propertyOnFloor: data?.specifications?.floor?.propertyOnFloor || "",
      },
      residential: {
        bedrooms: data?.specifications?.residential?.bedrooms || "",
        bathrooms: data?.specifications?.residential?.bathrooms || "",
        balconies: data?.specifications?.residential?.balconies || "",
        hall: data?.specifications?.residential?.hall || "",
        kitchens: data?.specifications?.residential?.kitchens || "",
        furnishing: data?.specifications?.residential?.furnishing || "",
      },
      facing: data?.specifications?.facing || data?.specifications?.residential?.facing || "",
      plot: {
        plotLength: data?.specifications?.plot?.plotLength || "",
        plotWidth: data?.specifications?.plot?.plotWidth || "",
        roadWidth: data?.specifications?.plot?.roadWidth || "",
        cornerPlot: data?.specifications?.plot?.cornerPlot || false,
        gatedCommunity: data?.specifications?.plot?.gatedCommunity || false,
      },
      commercial: {
        cabins: data?.specifications?.commercial?.cabins || "",
        meetingRooms: data?.specifications?.commercial?.meetingRooms || "",
        washrooms: data?.specifications?.commercial?.washrooms || "",
        pantry: data?.specifications?.commercial?.pantry || false,
        receptionArea: data?.specifications?.commercial?.receptionArea || false,
        workstations: data?.specifications?.commercial?.workstations || "",
        suitableFor: data?.specifications?.commercial?.suitableFor || "",
      },
      utilities: {
        waterSupply: data?.specifications?.utilities?.waterSupply || "",
        powerBackup: data?.specifications?.utilities?.powerBackup || false,
      }
    },
    legal: {
      propertyStatus: data?.legal?.propertyStatus || "Ready to Move",
    },
    location: {
      addressLine1: data?.location?.addressLine1 || data?.location?.address_line_1 || "",
      addressLine2: data?.location?.addressLine2 || data?.location?.address_line_2 || "",
      country: data?.location?.country || "IN",
      state: data?.location?.state || "",
      city: data?.location?.city || "",
      locality: data?.location?.locality || "",
      subArea: data?.location?.subArea || data?.location?.sub_area || "",
      pincode: data?.location?.pincode || "",
      coordinates: {
        lat: data?.location?.coordinates?.lat || data?.location?.latitude || "",
        lng: data?.location?.coordinates?.lng || data?.location?.longitude || ""
      }
    },
    amenities: data?.amenities || []
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: getFormValues(initialData)
  });

  const [category, setCategory] = useState(getFormValues(initialData).basicInfo.category);
  const { propertyTypes } = useNav();
  const [approvalTypes, setApprovalTypes] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState(FALLBACK_AMENITIES); // Use state for amenities

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/properties/amenities`);
        if (response.data) setAmenitiesList(response.data);
      } catch (err) {
        console.error("Failed to fetch amenities:", err);
      }
    };
    fetchAmenities();
  }, []);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(initialData?.media?.images || initialData?.images || []);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const categoryWatch = watch("basicInfo.category");
  const usageTypeWatch = watch("basicInfo.usageType");
  const propertyTypeWatch = watch("basicInfo.propertyType");

  const selectedCountry = watch("location.country");
  const selectedState = watch("location.state");
  const selectedCity = watch("location.city");
  const selectedLocality = watch("location.locality");
  const selectedSubArea = watch("location.subArea");
  const [mapPosition, setMapPosition] = useState(null);

  useEffect(() => {
    if (isEdit && initialData && Object.keys(initialData).length > 0) {
      // Use existing values passed above
      setExistingImages(initialData?.media?.images || initialData?.images || []);
      reset(getFormValues(initialData));
    }
  }, [initialData, isEdit, reset]);

  useEffect(() => {
    const updateMapCenter = async () => {
      let searchQuery = "";
      if (selectedSubArea)
        searchQuery = `${selectedSubArea}, ${selectedLocality || ""}, ${selectedCity || ""}, ${selectedState || ""}, India`;
      else if (selectedLocality)
        searchQuery = `${selectedLocality}, ${selectedCity || ""}, ${selectedState || ""}, India`;
      else if (selectedCity)
        searchQuery = `${selectedCity}, ${selectedState || ""}, India`;

      if (searchQuery) {
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
          );
          if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
            setMapPosition(newPos);
            setValue("location.coordinates.lat", newPos.lat);
            setValue("location.coordinates.lng", newPos.lng);
          }
        } catch (error) {
          console.error("Geocoding error:", error);
        }
      }
    };
    const timer = setTimeout(updateMapCenter, 1000);
    return () => clearTimeout(timer);
  }, [selectedCity, selectedLocality, selectedSubArea, selectedState, selectedCountry, setValue]);

  useEffect(() => {
    if (initialData?.location?.coordinates?.lat && initialData?.location?.coordinates?.lng) {
      setMapPosition({
        lat: initialData.location.coordinates.lat,
        lng: initialData.location.coordinates.lng,
      });
    } else {
      setMapPosition({ lat: 11.9416, lng: 79.8083 });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const queryParam = isSeller ? "?role=seller" : "";
        const [aTypes, bTypes] = await Promise.all([
          // axios.get(`${import.meta.env.VITE_API_URL}/properties/property-types${queryParam}`), // Removed
          axios.get(`${import.meta.env.VITE_API_URL}/properties/approval-types${queryParam}`),
          axios.get(`${import.meta.env.VITE_API_URL}/business-types?status=active`),
        ]);
        // setPropertyTypes(pTypes.data); // Removed
        setApprovalTypes(aTypes.data);
        setBusinessTypes(bTypes.data);
      } catch (error) {
        console.error("Error fetching types", error);
      }
    };
    fetchTypes();
  }, [isSeller]);

  const handleImageChange = ({ fileList: newFileList }) => {
    const validFiles = [];
    const newPreviews = [];
    let oversizedCount = 0;

    if (newFileList.length + existingImages.length > 10) {
      toast.error("Maximum 10 images allowed only");
      return;
    }

    newFileList.forEach((file) => {
      if (file.status === "removed") return;
      const actualFile = file.originFileObj || file;
      const sizeInMB = actualFile.size / (1024 * 1024);
      if (sizeInMB > 5) {
        oversizedCount++;
        return;
      }
      validFiles.push(actualFile);
      if (file.url) {
        newPreviews.push(file.url);
      } else if (file.originFileObj) {
        newPreviews.push(URL.createObjectURL(file.originFileObj));
      } else {
        newPreviews.push("");
      }
    });

    if (oversizedCount > 0) {
      toast.error(`${oversizedCount} image(s) oversize or too big (max 5MB each).`);
    }

    setImages(validFiles);
    setImagePreviews(newPreviews);
  };

  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index];
    const imageId = typeof imageToRemove === 'string' ? imageToRemove : imageToRemove.image_url;
    setImagesToDelete([...imagesToDelete, imageId]);
    const newExisting = [...existingImages];
    newExisting.splice(index, 1);
    setExistingImages(newExisting);
  };

  const handleFormSubmit = (data) => {
    const formData = new FormData();

    // Helper to recursively remove empty strings from objects
    const removeEmptyStrings = (obj) => {
      if (!obj) return obj;
      Object.keys(obj).forEach((key) => {
        if (obj[key] === "") {
          delete obj[key];
        } else if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          removeEmptyStrings(obj[key]);
        }
      });
      return obj;
    };

    const sanitizedBasicInfo = removeEmptyStrings({ ...data.basicInfo });
    const sanitizedPricing = removeEmptyStrings({ ...data.pricing });
    const sanitizedSpecs = removeEmptyStrings({ ...data.specifications });
    const sanitizedLegal = removeEmptyStrings({ ...data.legal });
    const sanitizedLocation = removeEmptyStrings({ ...data.location });

    formData.append("basicInfo", JSON.stringify(sanitizedBasicInfo));
    formData.append("pricing", JSON.stringify(sanitizedPricing));
    formData.append("specifications", JSON.stringify(sanitizedSpecs));
    formData.append("legal", JSON.stringify(sanitizedLegal));
    formData.append("location", JSON.stringify(sanitizedLocation));
    formData.append("amenities", JSON.stringify(data.amenities || []));

    if (data.businessType) {
      formData.append("businessType", data.businessType);
    }

    images.forEach((image) => {
      formData.append("images", image);
    });

    if (isEdit && imagesToDelete.length > 0) {
      formData.append("images_to_delete", JSON.stringify(imagesToDelete));
    }
    onSubmit(formData);
  };

  const selectedType = propertyTypes.find(t => t.name === propertyTypeWatch);
  const activeConfig = selectedType || {};

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          Basic Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register("basicInfo.title", { required: "Title is required" })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              placeholder="e.g. Luxurious 3BHK Villa in White Town"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("basicInfo.description", { required: "Description is required" })}
              rows="4"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category (I want to...)</label>
            <select {...register("basicInfo.category")} className="w-full px-4 py-3 border border-gray-200 rounded-xl">
              <option value="Sell">Sell</option>
              <option value="Rent">Rent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Usage Type</label>
            <select {...register("basicInfo.usageType")} className="w-full px-4 py-3 border border-gray-200 rounded-xl">
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type <span className="text-red-500">*</span></label>
            <select
              {...register("basicInfo.propertyType", { required: "Required" })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
            >
              <option value="">Select Type</option>
              {propertyTypes.map((type) => {
                const isCommercial = type.usageType === "Commercial";
                if ((usageTypeWatch === "Commercial" && isCommercial) || (usageTypeWatch === "Residential" && !isCommercial)) {
                  return <option key={type._id} value={type.name}>{type.name}</option>;
                }
                return null;
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Approval Type</label>
            <select {...register("basicInfo.approvalType")} className="w-full px-4 py-3 border border-gray-200 rounded-xl">
              <option value="">Select Approval</option>
              {approvalTypes.map((type) => (
                <option key={type.name || type} value={type.name || type}>{type.name || type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Type (Optional)</label>
            <select {...register("businessType")} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white">
              <option value="">Select Business Type</option>
              {businessTypes.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Property Status</label>
            <select {...register("legal.propertyStatus")} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white">
              <option value="Ready to Move">Ready to Move</option>
              <option value="Under Construction">Under Construction</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-green-500 rounded-full"></div>
          Pricing Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoryWatch === "Sell" ? (
            <>
              <div>
                <label className="block text-sm font-semibold">Total Price (₹) <span className="text-red-500">*</span></label>
                <input type="number" {...register("pricing.sell.price", { required: categoryWatch === "Sell" })} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Price Per Sqft (₹)</label>
                <input type="number" {...register("pricing.sell.pricePerSqft")} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold">Monthly Rent (₹) <span className="text-red-500">*</span></label>
                <input type="number" {...register("pricing.rent.monthlyRent", { required: categoryWatch === "Rent" })} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Security Deposit (₹)</label>
                <input type="number" {...register("pricing.rent.securityDeposit")} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Maintenance Charges (₹)</label>
                <input type="number" {...register("pricing.rent.maintenance")} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Specifications */}
      {propertyTypeWatch && (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
            Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* General Area */}
            <div>
              <label className="block text-sm font-semibold mb-2">Total Area (sqft) <span className="text-red-500">*</span></label>
              <input type="number" {...register("specifications.area.totalArea", { required: true })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
            </div>
            {!activeConfig.hasPlot && (
              <div>
                <label className="block text-sm font-semibold mb-2">Built-up Area (sqft)</label>
                <input type="number" {...register("specifications.area.builtupArea")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
              </div>
            )}

            {/* Rooms/Residential Details */}
            {activeConfig.hasRooms && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2">Bedrooms</label>
                  <input type="number" {...register("specifications.residential.bedrooms")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Bathrooms</label>
                  <input type="number" {...register("specifications.residential.bathrooms")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Balconies</label>
                  <input type="number" {...register("specifications.residential.balconies")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Hall</label>
                  <input type="number" {...register("specifications.residential.hall")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Kitchens</label>
                  <input type="number" {...register("specifications.residential.kitchens")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Furnishing</label>
                  <select {...register("specifications.residential.furnishing")} className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white">
                    <option value="">Select Furnishing</option>
                    <option value="Fully Furnished">Fully Furnished</option>
                    <option value="Semi Furnished">Semi Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
              </>
            )}

            {/* General Specs - Facing */}
            <div>
              <label className="block text-sm font-semibold mb-2">Facing</label>
              <select {...register("specifications.facing")} className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white">
                <option value="">Select Facing</option>
                <option value="North">North</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="South">South</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
              </select>
            </div>

            {/* Floor Details */}
            {activeConfig.hasFloor && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2">Property on Floor</label>
                  <input type="text" {...register("specifications.floor.propertyOnFloor")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Total Floors</label>
                  <input type="number" {...register("specifications.floor.totalFloor")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
              </>
            )}

            {/* Plot Details */}
            {activeConfig.hasPlot && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2">Plot Length (ft)</label>
                  <input type="number" {...register("specifications.plot.plotLength")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Plot Width (ft)</label>
                  <input type="number" {...register("specifications.plot.plotWidth")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Road Width (ft)</label>
                  <input type="number" {...register("specifications.plot.roadWidth")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" {...register("specifications.plot.cornerPlot")} id="cornerPlot" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <label htmlFor="cornerPlot" className="text-sm font-semibold text-gray-700">Corner Plot</label>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" {...register("specifications.plot.gatedCommunity")} id="gatedCommunity" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <label htmlFor="gatedCommunity" className="text-sm font-semibold text-gray-700">Gated Community</label>
                </div>
              </>
            )}

            {/* Commercial Details */}
            {activeConfig.hasCommercial && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2">Cabins</label>
                  <input type="number" {...register("specifications.commercial.cabins")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Meeting Rooms</label>
                  <input type="number" {...register("specifications.commercial.meetingRooms")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Workstations</label>
                  <input type="number" {...register("specifications.commercial.workstations")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Washrooms</label>
                  <input type="number" {...register("specifications.commercial.washrooms")} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" {...register("specifications.commercial.pantry")} id="pantry" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <label htmlFor="pantry" className="text-sm font-semibold text-gray-700">Pantry Available</label>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" {...register("specifications.commercial.receptionArea")} id="receptionArea" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <label htmlFor="receptionArea" className="text-sm font-semibold text-gray-700">Reception Area</label>
                </div>
                <div className="md:col-span-2 mt-2">
                  <label className="block text-sm font-semibold mb-2">Suitable For</label>
                  <input type="text" {...register("specifications.commercial.suitableFor")} placeholder="e.g. IT Office, Showroom, Clinic" className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
                </div>
              </>
            )}

            {/* Utilities */}
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-semibold mb-2">Water Supply</label>
                <select {...register("specifications.utilities.waterSupply")} className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white">
                  <option value="">Select Water Supply</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Borewell">Borewell</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-8">
                <input type="checkbox" {...register("specifications.utilities.powerBackup")} id="powerBackup" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="powerBackup" className="text-sm font-semibold text-gray-700">Power Backup Available</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amenities Section */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
          Amenities
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...new Set([...amenitiesList, ...(watch("amenities") || [])])].map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                value={amenity}
                {...register("amenities")}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>

        {/* Custom Amenity Input */}
        <div className="mt-6 flex gap-4">
          <input
            type="text"
            id="customAmenity"
            placeholder="Add custom amenity..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val) {
                  const currentAmenities = watch("amenities") || [];
                  if (!currentAmenities.includes(val)) {
                    setValue("amenities", [...currentAmenities, val]);
                  }
                  e.target.value = "";
                }
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('customAmenity');
              const val = input.value.trim();
              if (val) {
                const currentAmenities = watch("amenities") || [];
                if (!currentAmenities.includes(val)) {
                  setValue("amenities", [...currentAmenities, val]);
                }
                input.value = "";
              }
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-red-500 rounded-full"></div>
          Location Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div><label className="block text-sm font-semibold mb-2">Address Line 1 <span className="text-red-500">*</span></label><input {...register("location.addressLine1", { required: true })} className="w-full px-4 py-3 border border-gray-200 rounded-xl" /></div>
          <div><label className="block text-sm font-semibold mb-2">Address Line 2</label><input {...register("location.addressLine2")} className="w-full px-4 py-3 border border-gray-200 rounded-xl" /></div>
          <div>
            <label className="block text-sm font-semibold mb-2">Country</label>
            <Controller control={control} name="location.country" render={({ field }) => (
              <select {...field} className="w-full px-4 py-3 border border-gray-200 rounded-xl" onChange={(e) => { field.onChange(e); setValue("location.state", ""); setValue("location.city", ""); }}>
                <option value="IN">India</option>
                {Country.getAllCountries().map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
              </select>
            )} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">State</label>
            <Controller control={control} name="location.state" render={({ field }) => (
              <select {...field} disabled={!selectedCountry} className="w-full px-4 py-3 border border-gray-200 rounded-xl" onChange={(e) => { field.onChange(e); setValue("location.city", ""); }}>
                <option value="">Select State</option>
                {selectedCountry && State.getStatesOfCountry(selectedCountry).map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
              </select>
            )} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">City</label>
            <Controller control={control} name="location.city" render={({ field }) => (
              <select {...field} disabled={!selectedState} className="w-full px-4 py-3 border border-gray-200 rounded-xl">
                <option value="">Select City</option>
                {selectedState && City.getCitiesOfState(selectedCountry, selectedState).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            )} />
          </div>
          <div><label className="block text-sm font-semibold mb-2">Locality <span className="text-red-500">*</span></label><input {...register("location.locality", { required: true })} className="w-full px-4 py-3 border border-gray-200 rounded-xl" /></div>
          <div><label className="block text-sm font-semibold mb-2">Sub Area</label><input {...register("location.subArea")} className="w-full px-4 py-3 border border-gray-200 rounded-xl" /></div>
          <div><label className="block text-sm font-semibold mb-2">Pincode <span className="text-red-500">*</span></label><input {...register("location.pincode", { required: true })} className="w-full px-4 py-3 border border-gray-200 rounded-xl" /></div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 h-[350px]">
          {mapPosition && (
            <MapContainer center={mapPosition} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker position={mapPosition} setPosition={setMapPosition} setValue={setValue} />
              <RecenterMap lat={mapPosition.lat} lng={mapPosition.lng} />
            </MapContainer>
          )}
        </div>
      </div>

      {/* Media */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
          Property Images
        </h3>
        <ImgCrop rotationSlider aspect={4 / 3}>
          <Upload listType="picture-card" fileList={images.map((f, i) => ({ uid: i, name: f.name, status: "done", url: imagePreviews[i], originFileObj: f }))} onChange={handleImageChange} onPreview={onPreview} multiple accept="image/*" beforeUpload={() => false}>
            {images.length + existingImages.length < 10 && <div><Plus /><div style={{ marginTop: 8 }}>Upload</div></div>}
          </Upload>
        </ImgCrop>
        {existingImages.length > 0 && (
          <div className="grid grid-cols-5 gap-4 mt-4">
            {existingImages.map((img, i) => (
              <div key={i} className="relative group">
                <img src={getImageUrl(img.image_url || img)} className="w-full h-full object-cover rounded aspect-square" alt="Prop" />
                <div onClick={() => removeExistingImage(i)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center text-white"><Trash2 /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => window.history.back()} disabled={loading} className="px-6 py-3 bg-gray-100 rounded">Cancel</button>
        <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">{loading ? "Saving..." : "Publish Property"}</button>
      </div>
    </form>
  );
};
export default PropertyForm;
