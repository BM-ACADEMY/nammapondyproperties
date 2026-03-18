import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNav } from "@/context/NavContext";

const PropertySidebarFilter = ({
    filters,
    onFilterChange,
    onClearFilters
}) => {
    const { locations, approvalTypes, priceRanges, propertyCategories, businessTypes } = useNav();
    const [openSections, setOpenSections] = useState({
        budget: true,
        location: true,
        approval: true,
        usageType: true,
        category: true,
        businessType: true,
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleChipClick = (category, value) => {
        const currentValues = filters[category] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange(category, newValues);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-6 space-y-8">
                {/* Budget Section */}
                <div className="space-y-4">
                    <button
                        onClick={() => toggleSection("budget")}
                        className="flex items-center justify-between w-full text-left focus:outline-none"
                    >
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Budget</span>
                        {openSections.budget ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {openSections.budget && (
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <select
                                    value={filters.minPrice || ""}
                                    onChange={(e) => onFilterChange("minPrice", e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 appearance-none"
                                >
                                    <option value="">No min</option>
                                    {priceRanges.map(range => (
                                        <option key={`min-${range.min}`} value={range.min}>{range.label.split('-')[0] || range.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative flex-1">
                                <select
                                    value={filters.maxPrice || ""}
                                    onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 appearance-none"
                                >
                                    <option value="">No max</option>
                                    {priceRanges.map(range => (
                                        <option key={`max-${range.max}`} value={range.max}>{range.label.split('-')[1] || range.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}
                </div>

                <hr className="border-gray-100" />

                {/* Location */}
                <div className="space-y-4">
                    <button
                        onClick={() => toggleSection("location")}
                        className="flex items-center justify-between w-full text-left focus:outline-none"
                    >
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Location</span>
                        {openSections.location ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {openSections.location && (
                        <div className="flex flex-wrap gap-2">
                            {locations.map((loc) => {
                                const name = typeof loc === "string" ? loc : loc?.name || "Unknown";
                                return (
                                    <button
                                        key={name}
                                        onClick={() => handleChipClick("location", name)}
                                        className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${(filters.location || []).includes(name)
                                            ? "bg-blue-50 border-blue-600 text-blue-700"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                                            }`}
                                    >
                                        + {name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <hr className="border-gray-100" />

                {/* Approval */}
                <div className="space-y-4">
                    <button
                        onClick={() => toggleSection("approval")}
                        className="flex items-center justify-between w-full text-left focus:outline-none"
                    >
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Approval</span>
                        {openSections.approval ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {openSections.approval && (
                        <div className="flex flex-wrap gap-2">
                            {approvalTypes.map((app) => {
                                const name = typeof app === "string" ? app : app?.name || "Unknown";
                                return (
                                    <button
                                        key={name}
                                        onClick={() => handleChipClick("approval", name)}
                                        className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${(filters.approval || []).includes(name)
                                            ? "bg-blue-50 border-blue-600 text-blue-700"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                                            }`}
                                    >
                                        + {name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <hr className="border-gray-100" />

                {/* Usage Type: Residential / Commercial */}
                <div className="space-y-4">
                    <button
                        onClick={() => toggleSection("usageType")}
                        className="flex items-center justify-between w-full text-left focus:outline-none"
                    >
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Usage Type</span>
                        {openSections.usageType ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {openSections.usageType && (
                        <div className="flex flex-wrap gap-2">
                            {["Residential", "Commercial"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleChipClick("usageType", type)}
                                    className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
                                        (filters.usageType || []).includes(type)
                                            ? "bg-blue-50 border-blue-600 text-blue-700"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                                    }`}
                                >
                                    + {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <hr className="border-gray-100" />

                {/* Property Category */}
                <div className="space-y-4">
                    <button
                        onClick={() => toggleSection("category")}
                        className="flex items-center justify-between w-full text-left focus:outline-none"
                    >
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Property Category</span>
                        {openSections.category ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {openSections.category && (
                        <div className="flex flex-wrap gap-2">
                            {propertyCategories.map((cat) => {
                                const name = typeof cat === "string" ? cat : cat?.name || "Unknown";
                                return (
                                    <button
                                        key={name}
                                        onClick={() => handleChipClick("category", name)}
                                        className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${(filters.category || []).includes(name)
                                            ? "bg-blue-50 border-blue-600 text-blue-700"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                                            }`}
                                    >
                                        + {name.charAt(0).toUpperCase() + name.slice(1)}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <hr className="border-gray-100" />

                {/* Business Type */}
                <div className="space-y-4">
                    <button
                        onClick={() => toggleSection("businessType")}
                        className="flex items-center justify-between w-full text-left focus:outline-none"
                    >
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Business Type</span>
                        {openSections.businessType ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {openSections.businessType && (
                        <div className="flex flex-wrap gap-2">
                            {businessTypes.map((type) => {
                                const name = typeof type === "string" ? type : type?.name || "Unknown";
                                return (
                                    <button
                                        key={type._id || name}
                                        onClick={() => handleChipClick("businessType", type._id || name)}
                                        className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${(filters.businessType || []).includes(type._id || name)
                                            ? "bg-blue-50 border-blue-600 text-blue-700"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                                            }`}
                                    >
                                        + {name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <button
                        onClick={onClearFilters}
                        className="w-full text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        Clear All Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertySidebarFilter;
