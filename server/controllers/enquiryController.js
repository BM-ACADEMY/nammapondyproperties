const Enquiry = require("../models/Enquiry");
const Property = require("../models/Property");

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
    // If admin, fetch all. If seller, fetch only theirs.
    const filter = {};

    // Check if user is admin. Ensure role_id exists and check role_name.
    const isAdmin =
      req.user.role_id && req.user.role_id.role_name.toLowerCase() === "admin";

    console.log("Debug getEnquiries:", {
      userId: req.user._id,
      role: req.user.role_id?.role_name,
      isAdmin,
      viewQuery: req.query.view,
      userRoleObj: req.user.role_id,
    });

    // If NOT admin OR (is admin AND specific view requested as 'my')
    // then filter by their own seller_id
    if (!isAdmin || (isAdmin && req.query.view === "my")) {
      filter.seller_id = req.user._id;
    }

    // However, if the user asking is the ADMIN, they might want to see ALL enquiries.
    // I need to check the Role model or how roles are handled.
    // Usually req.user.role is populated.

    // For now, let's allow fetching by query param if admin, or default to self.
    // actually safer:
    // const enquiries = await Enquiry.find({ seller: req.user._id })...

    // But for the "Admin Panel" requirement, the Admin needs to see leads.
    // I'll fetch all if admin, else filtered.
    // I need to verify role handling.

    const WhatsappLead = require("../models/WhatsappLead");

    // 1. Fetch Enquiries
    const enquiries = await Enquiry.find(filter)
      .populate("property_id", "basicInfo location media")
      .populate("user_id", "name phone")
      .populate("seller_id", "name phone")
      .lean();

    // 2. Fetch WhatsappLeads (Legacy)
    const whatsappLeads = await WhatsappLead.find(
        filter.seller_id ? { seller_id: filter.seller_id } : {}
      )
      .populate("property_id", "title location images")
      .populate("user_id", "name phone")
      .populate("seller_id", "name")
      .lean();

    // 3. Normalize WhatsappLeads to match Enquiry structure
    const normalizedLeads = whatsappLeads.map((lead) => ({
      ...lead,
      enquirer_name: lead.user_id?.name || "WhatsApp User",
      enquirer_phone: lead.user_id?.phone || "",
      message: lead.message || "WhatsApp Inquiry",
      status: lead.status || "new", // Assuming status exists or default
      type: "whatsapp_lead", // Marker for debugging
    }));

    // 4. Merge and Sort
    const allEnquiries = [...enquiries, ...normalizedLeads].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.json(allEnquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllEnquiriesAdmin = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate("property_id", "basicInfo location media")
      .populate("user_id", "name phone")
      .populate("seller_id", "name phone")
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

    // Authorization check: Only admin or the assigned seller can delete
    const isAdmin =
      req.user.role_id && req.user.role_id.role_name.toLowerCase() === "admin";

    // enquiry.seller_id is an ObjectId, so .toString() works correctly
    const isOwner = enquiry.seller_id?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this enquiry" });
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

    // lead.seller_id is an ObjectId, so .toString() works correctly
    const isOwner = lead.seller_id?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this lead" });
    }

    await WhatsappLead.findByIdAndDelete(req.params.id);
    res.json({ message: "WhatsApp lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
