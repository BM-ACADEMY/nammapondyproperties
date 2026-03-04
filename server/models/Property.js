const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    // =====================================================
    // 1️⃣ OWNER INFO
    // =====================================================
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // 2️⃣ BASIC INFO
    // =====================================================
    basicInfo: {
      title: { type: String, required: true },
      description: String,

      category: {
        type: String,
        enum: ["Rent", "Sell"],
        required: true
      },

      usageType: {
        type: String,
        enum: ["Residential", "Commercial"],
        required: true
      },

      propertyType: {
        type: String,
        required: true
      },

      approvalType: String
    },

    // =====================================================
    // 2.5️⃣ BUSINESS
    // =====================================================
    businessType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessType"
    },

    // =====================================================
    // 3️⃣ LOCATION
    // =====================================================
    location: {
      addressLine1: String,
      addressLine2: String,
      country: String,
      state: String,
      city: String,
      locality: String,
      subArea: String,
      pincode: String,

      coordinates: {
        lat: Number,
        lng: Number
      },
      locationPoint: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
      }
    },

    // =====================================================
    // 4️⃣ PRICING
    // =====================================================
    pricing: {
      sell: {
        price: Number,
        pricePerSqft: Number
      },

      rent: {
        monthlyRent: Number,
        securityDeposit: Number,
        maintenance: Number,
        availableFrom: Date,

        tenantPreference: {
          bachelor: Boolean,
          family: Boolean,
          pets: Boolean
        }
      }
    },

    // =====================================================
    // 5️⃣ SPECIFICATIONS
    // =====================================================
    specifications: {
      facing: {
        type: String,
        enum: [
          "North",
          "East",
          "West",
          "South",
          "North-East",
          "North-West",
          "South-East",
          "South-West",
        ],
      },

      area: {
        totalArea: Number,
        builtupArea: Number,
        superBuiltupArea: Number,
        carpetArea: Number
      },

      floor: {
        totalFloor: Number,
        propertyOnFloor: String
      },

      residential: {
        bedrooms: Number,
        bathrooms: Number,
        balconies: Number,
        hall: Number,
        kitchens: Number,

        furnishing: {
          type: String,
          enum: ["Fully Furnished", "Semi Furnished", "Unfurnished"]
        },
      },

      plot: {
        plotLength: Number,
        plotWidth: Number,
        cornerPlot: Boolean,
        gatedCommunity: Boolean,
        roadWidth: Number
      },

      commercial: {
        cabins: Number,
        meetingRooms: Number,
        washrooms: Number,
        pantry: Boolean,
        receptionArea: Boolean,
        workstations: Number,

        suitableFor: String
      },

      utilities: {
        waterSupply: {
          type: String,
          enum: ["Corporation", "Borewell", "Both"]
        },
        powerBackup: Boolean
      }
    },

    // =====================================================
    // 6️⃣ AMENITIES
    // =====================================================
    amenities: [String],

    // =====================================================
    // 7️⃣ MEDIA
    // =====================================================
    media: {
      featuredImage: String,
      images: [String],
      video: String,
      floorPlan: String
    },

    // =====================================================
    // 8️⃣ LEGAL
    // =====================================================
    legal: {
      propertyStatus: {
        type: String,
        enum: ["Ready to Move", "Under Construction"]
      }
    },

    // =====================================================
    // 9️⃣ SYSTEM / TRACKING
    // =====================================================
    status: {
      type: String,
      enum: ["Active", "Sold", "Rented", "Pending"],
      default: "Active"
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    viewCount: {
      type: Number,
      default: 0
    },

    isSold: {
      type: Boolean,
      default: false
    },

    soldPrice: Number

  },
  {
    timestamps: true
  }
);

// Index for geo-spatial queries
propertySchema.index({ "location.locationPoint": "2dsphere" });

// Pre-save hook to keep locationPoint in sync with coordinates
propertySchema.pre("save", async function () {
  if (this.location && this.location.coordinates &&
    this.location.coordinates.lat && this.location.coordinates.lng) {
    this.location.locationPoint = {
      type: "Point",
      coordinates: [this.location.coordinates.lng, this.location.coordinates.lat]
    };
  }
});

module.exports = mongoose.model("Property", propertySchema);
