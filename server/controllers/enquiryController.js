const Enquiry = require("../models/Enquiry");
const Property = require("../models/Property");
const Subscription = require("../models/Subscription");

exports.createEnquiry = async (req, res) => {
  try {
    console.log("Create Enquiry Body:", req.body);
    const { property_id, seller_id, message, name, phone } = req.body;

    // Basic validation — only require property_id and seller_id
    if (!property_id || !seller_id) {
      return res
        .status(400)
        .json({ error: "Property ID and Seller ID are required" });
    }

    const enquiryData = {
      property_id,
      seller_id,
      message: message || "I'm interested in this property",
      enquirer_name: name,
      enquirer_phone: phone,
      visitor_info: {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    };

    // If logged-in user, attach their info and fill any missing fields
    if (req.user) {
      enquiryData.user_id = req.user._id;
      if (!enquiryData.enquirer_name) enquiryData.enquirer_name = req.user.name;
      if (!enquiryData.enquirer_phone) enquiryData.enquirer_phone = req.user.phone;
    }

    const enquiry = new Enquiry(enquiryData);
    await enquiry.save();

    // Emit socket event for real-time notification
    const io = req.app.get("socketio");
    if (io) {
      io.to("admin-room").emit("new-enquiry", {
        enquiryId: enquiry._id,
        name: enquiryData.enquirer_name,
        message: `New enquiry received from ${enquiryData.enquirer_name || "a user"}`,
      });
    }

    res.status(201).json({ message: "Enquiry recorded successfully", enquiry });
  } catch (error) {
    console.error("Error creating enquiry:", error);
    res.status(500).json({ error: "Failed to record enquiry" });
  }
};

exports.getEnquiries = async (req, res) => {
  try {
    const User = require("../models/User");
    const filter = {};

    // Fetch user doc to check role and superAdmin status
    const userDoc = await User.findById(req.user._id).populate("role_id");
    const isAdmin = userDoc?.role_id?.role_name?.toLowerCase() === "admin";
    const isSuperAdmin = userDoc?.isSuperAdmin;

    // Filter Logic
    if (isAdmin) {
      if (req.query.view === "my") {
        // Admin viewing leads for their own properties
        filter.seller_id = req.user._id;
      } else if (!isSuperAdmin) {
        // Sub-admin: Only see leads for sellers assigned to them
        const assignedSellerIds = await User.find({ assignedAdmin: req.user._id }).distinct("_id");
        filter.seller_id = { $in: assignedSellerIds };
      }
      // Super Admin: Sees all (filter stays empty)
    } else {
      // Seller: Only see their own leads
      filter.seller_id = req.user._id;
    }

    const WhatsappLead = require("../models/WhatsappLead");

    // 1. Fetch Enquiries
    const enquiries = await Enquiry.find(filter)
      .populate("property_id", "basicInfo location media")
      .populate("user_id", "name phone")
      .populate("seller_id", "name phone")
      .lean();

    // 2. Fetch WhatsappLeads
    const whatsappLeads = await WhatsappLead.find(filter)
      .populate("property_id", "title location images")
      .populate("user_id", "name phone")
      .populate("seller_id", "name")
      .lean();

    // 3. Normalize & Sort
    const normalizedLeads = whatsappLeads.map((lead) => ({
      ...lead,
      enquirer_name: lead.user_id?.name || "WhatsApp User",
      enquirer_phone: lead.user_id?.phone || "",
      message: lead.message || "WhatsApp Inquiry",
      status: lead.status || "new",
      type: "whatsapp_lead",
    }));

    const allEnquiries = [...enquiries, ...normalizedLeads].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    // 4. Restricted Visibility Logic for Sellers
    if (!isAdmin) {
      const activeSubscription = await Subscription.findOne({
        user: req.user._id,
        status: "active",
        endDate: { $gt: new Date() },
      });

      if (!activeSubscription) {
        // Mask sensitive data for unsubscribed sellers
        const maskedEnquiries = allEnquiries.map((lead) => ({
          ...lead,
          enquirer_phone: "XXXXXXXXXX",
          message: "Content Locked (Upgrade to View)",
        }));
        return res.json(maskedEnquiries);
      }
    }

    res.json(allEnquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllEnquiriesAdmin = async (req, res) => {
  try {
    const User = require("../models/User");
    const userDoc = await User.findById(req.user._id).populate("role_id");
    const isSuperAdmin = userDoc?.isSuperAdmin;
    const filter = {};

    if (!isSuperAdmin) {
      const assignedSellerIds = await User.find({ assignedAdmin: req.user._id }).distinct("_id");
      filter.seller_id = { $in: assignedSellerIds };
    }

    const enquiries = await Enquiry.find(filter)
      .populate("property_id", "basicInfo location media")
      .populate("user_id", "name phone")
      .populate("seller_id", "name phone")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    // Authorization check: Only admin can delete
    const isAdmin =
      req.user.role_id && req.user.role_id.role_name.toLowerCase() === "admin";

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this enquiry. Contact Admin." });
    }

    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ message: "Enquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteWhatsappLead = async (req, res) => {
  try {
    const WhatsappLead = require("../models/WhatsappLead");
    const lead = await WhatsappLead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "WhatsApp lead not found" });
    }

    // Authorization check
    const isAdmin =
      req.user.role_id && req.user.role_id.role_name.toLowerCase() === "admin";

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this lead. Contact Admin." });
    }

    await WhatsappLead.findByIdAndDelete(req.params.id);
    res.json({ message: "WhatsApp lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
