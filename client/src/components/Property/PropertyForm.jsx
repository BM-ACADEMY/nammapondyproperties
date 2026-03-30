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
  user = {},
}) => {
  const getFormValues = (data) => ({
    basicInfo: {
      title: data?.basicInfo?.title || data?.title || "",
      description: data?.basicInfo?.description || data?.description || "",
      category: data?.basicInfo?.category || "Sell/Buy",
      usageType: data?.basicInfo?.usageType || "Residential",
      propertyType: data?.basicInfo?.propertyType || data?.property_type || "",
      approvalType: data?.basicInfo?.approvalType || data?.approval || "",
    },
    pricing: {
      sell: {
        price: data?.pricing?.sell?.price || data?.price || "",
        minPrice: data?.pricing?.sell?.minPrice || "",
        maxPrice: data?.pricing?.sell?.maxPrice || "",
        pricePerSqft: data?.pricing?.sell?.pricePerSqft || "",
      },
      rent: {
        monthlyRent: data?.pricing?.rent?.monthlyRent || data?.price || "",
        minRent: data?.pricing?.rent?.minRent || "",
        maxRent: data?.pricing?.rent?.maxRent || "",
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
        minArea: data?.specifications?.area?.minArea || "",
        maxArea: data?.specifications?.area?.maxArea || "",
        superBuiltupArea: data?.specifications?.area?.superBuiltupArea || "",
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
      ageOfProperty: data?.legal?.ageOfProperty || "",
      expectedCompletionYear: data?.legal?.expectedCompletionYear || "",
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
    media: {
      video: data?.video || data?.media?.video || "",
      floorPlan: data?.floorPlan || data?.media?.floorPlan || "",
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
    trigger,
  } = useForm({
    defaultValues: getFormValues(initialData)
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(initialData?.media?.images || initialData?.images || []);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [floorPlan, setFloorPlan] = useState(null);
  const [floorPlanPreview, setFloorPlanPreview] = useState("");
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [approvalTypes, setApprovalTypes] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState(FALLBACK_AMENITIES);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [mapPosition, setMapPosition] = useState(null);

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

  const steps = [
    { number: 1, title: "Basic Details", sub: "Step 1" },
    { number: 2, title: "Location Details", sub: "Step 2" },
    { number: 3, title: "Property Profile", sub: "Step 3" },
    { number: 4, title: "Photos, Videos & Voice-over", sub: "Step 4" },
    { number: 5, title: "Amenities section", sub: "Step 5" },
  ];

  const calculateScore = (data) => {
    let score = 0;
    if (data.basicInfo.title) score += 10;
    if (data.basicInfo.description) score += 10;
    if (data.location.addressLine1) score += 10;
    if (data.location.city) score += 10;
    if (data.location.locality) score += 10;
    if (data.pricing.sell.minPrice || data.pricing.sell.maxPrice || data.pricing.rent.minRent || data.pricing.rent.maxRent) score += 10;
    if (data.amenities?.length > 0) score += 10;
    if (images.length > 0) score += 15;
    if (data.specifications.area.minArea || data.specifications.area.totalArea) score += 15;
    return score;
  };

  const propertyScore = calculateScore(watch());

  const { propertyTypes } = useNav();

  const categoryWatch = watch("basicInfo.category");
  const usageTypeWatch = watch("basicInfo.usageType");
  const propertyTypeWatch = watch("basicInfo.propertyType");

  const selectedCountry = watch("location.country");
  const selectedState = watch("location.state");
  const selectedCity = watch("location.city");
  const selectedLocality = watch("location.locality");
  const selectedSubArea = watch("location.subArea");

  useEffect(() => {
    if (isEdit && initialData && Object.keys(initialData).length > 0) {
      // Use existing values passed above
      setExistingImages(initialData?.media?.images || initialData?.images || []);
      if (initialData?.media?.floorPlan) {
        setFloorPlanPreview(initialData.media.floorPlan);
      }
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

  const handleFloorPlanChange = ({ fileList }) => {
    const file = fileList[0]?.originFileObj;
    if (file) {
      setFloorPlan(file);
      setFloorPlanPreview(URL.createObjectURL(file));
    } else {
      setFloorPlan(null);
      setFloorPlanPreview("");
    }
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
    
    if (data.media) {
      const sanitizedMedia = removeEmptyStrings({ ...data.media });
      formData.append("media", JSON.stringify(sanitizedMedia));
      if (data.media.video) {
        formData.append("video", data.media.video);
      }
    }

    if (data.businessType) {
      formData.append("businessType", data.businessType);
    }

    images.forEach((image) => {
      formData.append("images", image);
    });

    if (isEdit && imagesToDelete.length > 0) {
      formData.append("images_to_delete", JSON.stringify(imagesToDelete));
    }

    if (floorPlan) {
      formData.append("floorPlan", floorPlan);
    }

    onSubmit(formData);
  };

  const selectedType = propertyTypes.find(t => t.name === propertyTypeWatch);
  const activeConfig = selectedType || {};

  const nextStep = async () => {
    const fieldsToValidate = {
      1: ["basicInfo.title", "basicInfo.description", "businessType"],
      2: ["location.addressLine1", "location.locality", "location.pincode"],
      3: categoryWatch === "Sell/Buy" 
        ? ["pricing.sell.minPrice", "pricing.sell.maxPrice", "specifications.area.minArea"] 
        : ["pricing.rent.minRent", "pricing.rent.maxRent", "specifications.area.minArea"],
      4: []
    };

    const currentFields = fieldsToValidate[currentStep];
    if (currentFields && currentFields.length > 0) {
      const isValid = await trigger(currentFields);
      if (!isValid) {
        toast.error("Please fill all required fields correctly.");
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFormError = (errors) => {
    console.log("Form Errors:", errors);
    const firstError = Object.values(errors).flat()[0];
    if (firstError) {
      const errorMessage = firstError.message || "Please check the form for errors.";
      toast.error(errorMessage);
    } else {
      toast.error("Please fill all required fields correctly.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-gray-50/30 p-2 min-h-[800px]">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/3 flex-col gap-6 sticky top-8 h-fit">
        {/* Stepper Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="space-y-10 relative">
            {/* Connecting Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

            {steps.map((s) => (
              <div key={s.number} className="flex gap-6 relative group">
                <div className={`w-6 h-6 rounded-full border-2 z-10 flex items-center justify-center transition-all ${currentStep >= s.number
                  ? "bg-blue-600 border-blue-600 ring-4 ring-blue-50"
                  : "bg-white border-gray-300"
                  }`}>
                  {currentStep > s.number ? (
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  ) : currentStep === s.number ? (
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  ) : null}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-bold transition-all ${currentStep >= s.number ? "text-gray-800" : "text-gray-400"
                    }`}>
                    {s.title}
                  </span>
                  <span className={`text-xs transition-all ${currentStep >= s.number ? "text-blue-600" : "text-gray-400"
                    }`}>
                    {s.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Property Score Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  strokeWidth="8"
                  stroke="#f3f4f6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  strokeWidth="8"
                  stroke="#2563eb"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - propertyScore / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-lg font-bold text-gray-800">{propertyScore}%</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Property Score</h4>
              <p className="text-xs text-gray-500 leading-tight mt-1">
                Better your property score,<br />greater your visibility
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="flex-1 space-y-8">
        <div className="mb-8 p-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Welcome back {user?.name || "User"},
          </h2>
          <p className="text-gray-500 font-medium">
            {steps.find(s => s.number === currentStep)?.title === "Basic Details"
              ? "Fill out basic details"
              : steps.find(s => s.number === currentStep)?.title
            }
          </p>
        </div>

        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-10">
              <div>
                <p className="text-gray-700 font-bold mb-4 uppercase text-xs tracking-wider">I'm looking to</p>
                <div className="flex flex-wrap gap-4">
                  {["Sell/Buy", "Rent"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue("basicInfo.category", cat)}
                      className={`px-8 py-2.5 rounded-full border-2 transition-all font-bold text-sm ${watch("basicInfo.category") === cat
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100"
                        : "bg-white text-gray-500 border-gray-100 hover:border-blue-200"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-gray-700 font-bold mb-4 uppercase text-xs tracking-wider">What kind of property do you have?</p>
                <div className="flex gap-8 mb-6">
                  {["Residential", "Commercial"].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          {...register("basicInfo.usageType")}
                          value={type}
                          className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-blue-600 transition-all"
                        />
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full opacity-0 peer-checked:opacity-100 transition-all absolute"></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{type}</span>
                    </label>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  {propertyTypes
                    .filter(t => t.usageType === watch("basicInfo.usageType"))
                    .map((type) => (
                      <button
                        key={type._id}
                        type="button"
                        onClick={() => setValue("basicInfo.propertyType", type.name)}
                        className={`px-5 py-2 rounded-full border-2 transition-all text-sm font-semibold ${watch("basicInfo.propertyType") === type.name
                          ? "bg-blue-50 text-blue-600 border-blue-600"
                          : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                          }`}
                      >
                        {type.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">Property Title <span className="text-red-500">*</span></label>
                  <input {...register("basicInfo.title", { required: "Title is required" })} className={`w-full px-4 py-3 border-2 rounded-2xl ${errors.basicInfo?.title ? "border-red-500" : "border-gray-100"}`} placeholder="e.g., Luxury 3BHK Villa in White Town" />
                  {errors.basicInfo?.title && <p className="text-red-500 text-xs mt-1">{errors.basicInfo.title.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">Description <span className="text-red-500">*</span></label>
                  <textarea {...register("basicInfo.description", { required: "Description is required" })} rows="4" className={`w-full px-4 py-3 border-2 rounded-2xl ${errors.basicInfo?.description ? "border-red-500" : "border-gray-100"}`} placeholder="Describe the property's unique features, neighborhood, and amenities..."></textarea>
                  {errors.basicInfo?.description && <p className="text-red-500 text-xs mt-1">{errors.basicInfo.description.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Approval Type</label>
                  <select {...register("basicInfo.approvalType")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl bg-white">
                    <option value="">Select Approval</option>
                    {approvalTypes.map((type) => (
                      <option key={type.name || type} value={type.name || type}>{type.name || type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Business Type <span className="text-red-500">*</span></label>
                  <select {...register("businessType", { required: "Business type is required" })} className={`w-full px-4 py-3 border-2 rounded-2xl bg-white ${errors.businessType ? "border-red-500" : "border-gray-100"}`}>
                    <option value="">Select Business Type</option>
                    {businessTypes.map(type => (
                      <option key={type._id} value={type._id}>{type.name}</option>
                    ))}
                  </select>
                  {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Property Status</label>
                  <div className="flex gap-4">
                    {["Ready to Move", "Under Construction"].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setValue("legal.propertyStatus", status)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all text-sm font-semibold ${watch("legal.propertyStatus") === status
                          ? "bg-blue-50 text-blue-600 border-blue-600"
                          : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Fields based on Property Status */}
                {watch("legal.propertyStatus") === "Ready to Move" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Age of Property</label>
                    <div className="flex flex-wrap gap-2">
                      {["0-1 years", "1-5 years", "5-10 years", "10+ years"].map(age => (
                        <button
                          key={age}
                          type="button"
                          onClick={() => setValue("legal.ageOfProperty", age)}
                          className={`px-4 py-2 rounded-xl border-2 transition-all text-sm font-semibold ${watch("legal.ageOfProperty") === age
                            ? "bg-blue-50 text-blue-600 border-blue-600"
                            : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                            }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {watch("legal.propertyStatus") === "Under Construction" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Expected Completion Year</label>
                    <select
                      {...register("legal.expectedCompletionYear")}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl bg-white"
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Full Address <span className="text-red-500">*</span></label>
                <textarea {...register("location.addressLine1", { required: "Address is required" })} rows="2" className={`w-full px-4 py-3 border-2 rounded-2xl ${errors.location?.addressLine1 ? "border-red-500" : "border-gray-100"}`} placeholder="House No, Street Name, Area..."></textarea>
                {errors.location?.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.location.addressLine1.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 uppercase tracking-tight">Address Line 2</label>
                <input {...register("location.addressLine2")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" placeholder="Apartment, suite, unit, building, floor, etc." />
              </div>
              <div><label className="block text-sm font-bold mb-2 uppercase tracking-tight">Country</label>
                <Controller control={control} name="location.country" render={({ field }) => (
                  <select {...field} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" onChange={(e) => { field.onChange(e); setValue("location.state", ""); setValue("location.city", ""); }}>
                    <option value="IN">India</option>
                    {Country.getAllCountries().map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                  </select>
                )} />
              </div>
              <div><label className="block text-sm font-bold mb-2 uppercase tracking-tight">State</label>
                <Controller control={control} name="location.state" render={({ field }) => (
                  <select {...field} disabled={!selectedCountry} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" onChange={(e) => { field.onChange(e); setValue("location.city", ""); }}>
                    <option value="">Select State</option>
                    {selectedCountry && State.getStatesOfCountry(selectedCountry).map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                  </select>
                )} />
              </div>
              <div><label className="block text-sm font-bold mb-2 uppercase tracking-tight">City</label>
                <Controller control={control} name="location.city" render={({ field }) => (
                  <select {...field} disabled={!selectedState} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl">
                    <option value="">Select City</option>
                    {selectedState && City.getCitiesOfState(selectedCountry, selectedState).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                )} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Locality / Landmark <span className="text-red-500">*</span></label>
                <input {...register("location.locality", { required: "Locality is required" })} className={`w-full px-4 py-3 border-2 rounded-2xl ${errors.location?.locality ? "border-red-500" : "border-gray-100"}`} placeholder="e.g., Near Rock Beach" />
                {errors.location?.locality && <p className="text-red-500 text-xs mt-1">{errors.location.locality.message}</p>}
              </div>
              <div><label className="block text-sm font-bold mb-2 uppercase tracking-tight">Sub Area</label><input {...register("location.subArea")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" /></div>
              <div>
                <label className="block text-sm font-bold mb-2">Pincode <span className="text-red-500">*</span></label>
                <input {...register("location.pincode", { required: "Pincode is required" })} className={`w-full px-4 py-3 border-2 rounded-2xl ${errors.location?.pincode ? "border-red-500" : "border-gray-100"}`} placeholder="e.g., 605001" />
                {errors.location?.pincode && <p className="text-red-500 text-xs mt-1">{errors.location.pincode.message}</p>}
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 h-[400px]">
              {mapPosition && (
                <MapContainer center={mapPosition} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%", borderRadius: "1rem" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={mapPosition} setPosition={setMapPosition} setValue={setValue} />
                  <RecenterMap lat={mapPosition.lat} lng={mapPosition.lng} />
                </MapContainer>
              )}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-700 font-bold mb-6 uppercase text-xs tracking-wider">Pricing Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryWatch === "Sell/Buy" ? (
                  <>
                    <div>
                      <label className="block text-sm font-bold mb-2">Price From (₹) <span className="text-red-500">*</span></label>
                      <input type="number" {...register("pricing.sell.minPrice", { required: "Min price is required" })} className={`w-full px-4 py-3 border-2 rounded-2xl ${errors.pricing?.sell?.minPrice ? "border-red-500" : "border-gray-100"}`} placeholder="e.g. 1500000" />
                      {errors.pricing?.sell?.minPrice && <p className="text-red-500 text-xs mt-1">{errors.pricing.sell.minPrice.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Price To (₹) <span className="text-red-500">*</span></label>
                      <input type="number" {...register("pricing.sell.maxPrice", { required: "Max price is required" })} className={`w-full px-4 py-3 border-2 rounded-2xl ${errors.pricing?.sell?.maxPrice ? "border-red-500" : "border-gray-100"}`} placeholder="e.g. 1600000" />
                      {errors.pricing?.sell?.maxPrice && <p className="text-red-500 text-xs mt-1">{errors.pricing.sell.maxPrice.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Price Per Sqft (₹)</label>
                      <input type="number" {...register("pricing.sell.pricePerSqft")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-bold mb-2">Rent From (₹/mo) <span className="text-red-500">*</span></label>
                      <input type="number" {...register("pricing.rent.minRent", { required: "Min rent is required" })} className={`w-full px-4 py-3 border-2 rounded-2xl ${errors.pricing?.rent?.minRent ? "border-red-500" : "border-gray-100"}`} placeholder="e.g. 15000" />
                      {errors.pricing?.rent?.minRent && <p className="text-red-500 text-xs mt-1">{errors.pricing.rent.minRent.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Rent To (₹/mo) <span className="text-red-500">*</span></label>
                      <input type="number" {...register("pricing.rent.maxRent", { required: "Max rent is required" })} className={`w-full px-4 py-3 border-2 rounded-2xl ${errors.pricing?.rent?.maxRent ? "border-red-500" : "border-gray-100"}`} placeholder="e.g. 20000" />
                      {errors.pricing?.rent?.maxRent && <p className="text-red-500 text-xs mt-1">{errors.pricing.rent.maxRent.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Security Deposit (₹)</label>
                      <input type="number" {...register("pricing.rent.securityDeposit")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Maintenance (₹/mo)</label>
                      <input type="number" {...register("pricing.rent.maintenance")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" placeholder="e.g. 2000" />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-700 font-bold mb-6 uppercase text-xs tracking-wider">Specifications</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Area From (sqft) <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal text-xs ml-1">(enter single value or min of range)</span>
                  </label>
                  <input type="number" {...register("specifications.area.minArea", { required: "Area is required" })} className={`w-full px-4 py-3 border-2 rounded-2xl ${errors.specifications?.area?.minArea ? "border-red-500" : "border-gray-100"}`} placeholder="e.g. 1200" />
                  {errors.specifications?.area?.minArea && <p className="text-red-500 text-xs mt-1">{errors.specifications.area.minArea.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Area To (sqft)
                    <span className="text-gray-400 font-normal text-xs ml-1">(optional — fill for range)</span>
                  </label>
                  <input type="number" {...register("specifications.area.maxArea")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" placeholder="e.g. 1500" />
                </div>
                {!activeConfig.hasPlot && (
                  <>
                    <div>
                      <label className="block text-sm font-bold mb-2">Super Built-up Area (sqft)</label>
                      <input type="number" {...register("specifications.area.superBuiltupArea")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Built-up Area (sqft)</label>
                      <input type="number" {...register("specifications.area.builtupArea")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" />
                    </div>
                  </>
                )}
                {activeConfig.hasRooms && (
                  <>
                    <div>
                      <label className="block text-sm font-bold mb-2">Bedrooms</label>
                      <input type="number" {...register("specifications.residential.bedrooms")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Bathrooms</label>
                      <input type="number" {...register("specifications.residential.bathrooms")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Balconies</label>
                      <input type="number" {...register("specifications.residential.balconies")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Furnishing</label>
                      <select {...register("specifications.residential.furnishing")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl bg-white">
                        <option value="">Select Furnishing</option>
                        <option value="Fully Furnished">Fully Furnished</option>
                        <option value="Semi Furnished">Semi Furnished</option>
                        <option value="Unfurnished">Unfurnished</option>
                      </select>
                    </div>
                  </>
                )}

                {activeConfig.hasPlot && (
                  <>
                    <div>
                      <label className="block text-sm font-bold mb-2">Plot Length (ft)</label>
                      <input type="number" {...register("specifications.plot.plotLength")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Plot Width (ft)</label>
                      <input type="number" {...register("specifications.plot.plotWidth")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <input type="checkbox" {...register("specifications.plot.cornerPlot")} id="cornerPlot" className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                      <label htmlFor="cornerPlot" className="text-sm font-semibold text-gray-700">Corner Plot</label>
                    </div>
                  </>
                )}

                {activeConfig.hasCommercial && (
                  <>
                    <div>
                      <label className="block text-sm font-bold mb-2">Cabins</label>
                      <input type="number" {...register("specifications.commercial.cabins")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Workstations</label>
                      <input type="number" {...register("specifications.commercial.workstations")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-bold mb-2">Facing</label>
                  <select {...register("specifications.facing")} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl bg-white">
                    <option value="">Select Facing</option>
                    {["North", "East", "West", "South", "North-East", "North-West", "South-East", "South-West"].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-700 font-bold mb-6 uppercase text-xs tracking-wider">Property Media</p>
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-gray-700 font-bold uppercase text-xs tracking-wider">Property Photos</p>
                <ImgCrop rotationSlider aspect={4 / 3}>
                  <Upload
                    listType="picture-card"
                    fileList={images.map((f, i) => ({ uid: i, name: f.name, status: "done", url: imagePreviews[i], originFileObj: f }))}
                    onChange={handleImageChange}
                    onPreview={onPreview}
                    multiple accept="image/*"
                    beforeUpload={() => false}
                    className="custom-upload"
                  >
                    {images.length + existingImages.length < 10 && (
                      <div className="flex flex-col items-center gap-1">
                        <Plus size={24} />
                        <div className="text-xs font-bold">Add Photo</div>
                      </div>
                    )}
                  </Upload>
                </ImgCrop>
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {existingImages.map((img, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden aspect-[4/3] border border-gray-100">
                        <img src={getImageUrl(img)} alt={`Property ${i}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                <div className="space-y-4">
                  <p className="text-gray-700 font-bold uppercase text-xs tracking-wider">Video Tour</p>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("media.video")}
                      placeholder="YouTube or Vimeo URL"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none transition-all"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Plus size={18} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Paste a link to your property video (e.g., YouTube, Vimeo)</p>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700 font-bold uppercase text-xs tracking-wider">Floor Plan</p>
                  <div className="flex items-start gap-4">
                    <ImgCrop rotationSlider aspect={4 / 3}>
                      <Upload
                        listType="picture-card"
                        maxCount={1}
                        fileList={floorPlan ? [{ uid: "-1", name: "floor-plan", status: "done", url: floorPlanPreview, originFileObj: floorPlan }] : []}
                        onChange={handleFloorPlanChange}
                        beforeUpload={() => false}
                        className="floor-plan-upload"
                      >
                        {!floorPlan && (
                          <div className="flex flex-col items-center gap-1">
                            <Plus size={24} />
                            <div className="text-xs font-bold">Upload Plan</div>
                          </div>
                        )}
                      </Upload>
                    </ImgCrop>
                    {initialData?.media?.floorPlan && !floorPlan && (
                      <div className="relative group rounded-xl overflow-hidden h-[102px] w-[102px] border border-gray-100">
                        <img src={getImageUrl(initialData.media.floorPlan)} alt="Existing Floor Plan" className="w-full h-full object-cover shadow-sm" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold bg-black/40 px-2 py-1 rounded">Current Plan</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-700 font-bold mb-6 uppercase text-xs tracking-wider">Amenities</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...new Set([...amenitiesList, ...(watch("amenities") || [])])].map((amenity) => (
                <label key={amenity} className="flex items-center gap-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-100 hover:bg-blue-50/10 cursor-pointer transition-all">
                  <input type="checkbox" value={amenity} {...register("amenities")} className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all" />
                  <span className="text-sm font-semibold text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>

            {/* Custom Amenity Input */}
            <div className="mt-8 flex gap-4">
              <input
                type="text"
                id="customAmenity"
                placeholder="Add custom amenity..."
                className="flex-1 px-5 py-3 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.target.value.trim();
                    if (val) {
                      const currentAmenities = watch("amenities") || [];
                      if (!Array.isArray(currentAmenities)) {
                         setValue("amenities", [val]);
                      } else if (!currentAmenities.includes(val)) {
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
                    if (!Array.isArray(currentAmenities)) {
                      setValue("amenities", [val]);
                    } else if (!currentAmenities.includes(val)) {
                      setValue("amenities", [...currentAmenities, val]);
                    }
                    input.value = "";
                  }
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Form Navigation Buttons */}
        <div className="flex justify-between items-center pt-8">
          <button
            key="back-btn"
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all ${currentStep === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            Back
          </button>

          {currentStep < 5 ? (
            <button
              key="next-btn"
              type="button"
              onClick={nextStep}
              className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 transition-all transform hover:scale-[1.02]"
            >
              Continue
            </button>
          ) : (
            <button
              key="done-btn"
              type="button"
              disabled={loading}
              onClick={() => {
                // Use type="button" and manual trigger to prevent auto-submission on step transition
                handleSubmit(handleFormSubmit, handleFormError)();
              }}
              className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-100 transition-all transform hover:scale-[1.02] flex items-center gap-2"
            >
              {loading ? "Saving..." : "Done"}
            </button>
          )}
        </div>
      </form>
    </div >
  );
};
export default PropertyForm;
