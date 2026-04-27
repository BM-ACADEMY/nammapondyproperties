const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const propertyNotificationTemplate = require("../templates/emails/propertyNotification");
const marketingLeadTemplate = require("../templates/emails/marketingLead");
const enquiryLeadTemplate = require("../templates/emails/enquiryLead");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true", // false for 587
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Sends an email notification
 */
exports.sendPropertyNotification = async (property, seller, type) => {
  try {
    const htmlContent = propertyNotificationTemplate(property, seller, type);
    const subject = type === "new_listing" 
      ? `New Listing: ${property.basicInfo?.title}` 
      : `Edit Pending: ${property.basicInfo?.title}`;

    const mailOptions = {
      from: `"Namma Pondy Properties" <${process.env.USER_EMAIL}>`,
      to: process.env.USER_EMAIL,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Property notification email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending property notification email:", error);
    // Don't throw error to prevent breaking the main flow
    return null;
  }
};

/**
 * Sends an email notification for a new marketing lead
 */
exports.sendMarketingLeadNotification = async (request, seller, property, plan) => {
  try {
    const htmlContent = marketingLeadTemplate(request, seller, property, plan);
    const subject = `New Marketing Lead: ${plan?.serviceName || "Marketing Request"}`;

    const mailOptions = {
      from: `"Namma Pondy Properties" <${process.env.USER_EMAIL}>`,
      to: process.env.USER_EMAIL,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Marketing lead email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending marketing lead email:", error);
    return null;
  }
};

/**
 * Sends an email notification for a new or updated property enquiry
 */
exports.sendEnquiryNotification = async (enquiry, seller, property, updater = null, isUpdate = false) => {
  try {
    const htmlContent = enquiryLeadTemplate(enquiry, seller, property, updater, isUpdate);
    const subject = isUpdate 
      ? `Enquiry Updated: ${enquiry.status.toUpperCase()} - ${property.basicInfo?.title || "Property"}`
      : `New Property Enquiry: ${enquiry.enquirer_name || "Buyer"}`;

    const mailOptions = {
      from: `"Namma Pondy Properties" <${process.env.USER_EMAIL}>`,
      to: process.env.USER_EMAIL,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Enquiry email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending enquiry email:", error);
    return null;
  }
};
