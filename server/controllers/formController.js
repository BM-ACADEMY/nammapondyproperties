const Contact = require("../models/Contact");
const RequestCall = require("../models/RequestCall");

// --- Contact Form ---

// Create a new contact message
exports.createContact = async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    const savedContact = await newContact.save();

    // Emit socket event for real-time notification
    const io = req.app.get("socketio");
    if (io) {
      io.to("admin-room").emit("new-contact-message", {
        contactId: savedContact._id,
        name: savedContact.name,
        message: `New contact message from ${savedContact.name}`,
      });
    }

    res.status(201).json({
      success: true,
      data: savedContact,
      message: "Contact message submitted successfully",
    });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit contact message",
      error: error.message,
    });
  }
};

// Get all contact messages (Admin)
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages",
      error: error.message,
    });
  }
};

// Delete a contact message
exports.deleteContact = async (req, res) => {
  try {
    const result = await Contact.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: "Contact not found" });
    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete contact message",
      error: error.message,
    });
  }
};

// --- Request Call Form ---

// Create a new request call
exports.createRequestCall = async (req, res) => {
  try {
    const newRequest = new RequestCall(req.body);
    const savedRequest = await newRequest.save();

    // Emit socket event for real-time notification
    const io = req.app.get("socketio");
    if (io) {
      io.to("admin-room").emit("new-call-request", {
        requestId: savedRequest._id,
        fullName: savedRequest.fullName,
        message: `New callback request from ${savedRequest.fullName}`,
      });
    }

    res.status(201).json({
      success: true,
      data: savedRequest,
      message: "Callback request submitted successfully",
    });
  } catch (error) {
    console.error("Error saving callback request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit callback request",
      error: error.message,
    });
  }
};

// Get all callback requests (Admin)
exports.getRequestCalls = async (req, res) => {
  try {
    const requests = await RequestCall.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch callback requests",
      error: error.message,
    });
  }
};

// Delete a callback request
exports.deleteRequestCall = async (req, res) => {
  try {
    const result = await RequestCall.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: "Callback request not found" });
    res.status(200).json({
      success: true,
      message: "Callback request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete callback request",
      error: error.message,
    });
  }
};
