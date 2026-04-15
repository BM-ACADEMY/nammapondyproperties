// models/BuilderProfile.js
const mongoose = require("mongoose");

const builderProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    builderName: { type: String },
    phonePrimary: { type: String },
    email: { type: String },
    companyName: { type: String },
    companyLogo: { type: String },
    gstNumber: { type: String },
    officeAddress: { type: String },
    experienceYears: { type: Number },
    aboutCompany: { type: String },
    reraNumber: { type: String },
    nationality: { type: String },
    languagesKnown: [{ type: String }],
    socialLinks: {
      website: { type: String },
      instagram: { type: String },
      facebook: { type: String },
      linkedin: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BuilderProfile", builderProfileSchema);
