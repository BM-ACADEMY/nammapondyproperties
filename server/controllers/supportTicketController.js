const SupportTicket = require("../models/SupportTicket");

// Create a new support ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const sellerId = req.user._id;

    const newTicket = new SupportTicket({
      seller: sellerId,
      subject,
      messages: [
        {
          sender: sellerId,
          content: message,
          isAdmin: false,
        },
      ],
    });

    await newTicket.save();

    // Notify admins via socket
    const io = req.app.get("socketio");
    if (io) {
      io.to("admin-room").emit("new-support-ticket", {
        ticketId: newTicket._id,
        sellerName: req.user.name,
        subject: newTicket.subject,
      });
    }

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      ticket: newTicket,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tickets for a seller
exports.getSellerTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ seller: req.user._id }).sort({
      lastMessageAt: -1,
    });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tickets for admin
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate("seller", "name email profile_image")
      .sort({ lastMessageAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get ticket details
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate("seller", "name email profile_image")
      .populate("messages.sender", "name email profile_image");
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const isUserAdmin = req.user.isSuperAdmin || (req.user.role_id && req.user.role_id.role_name.toLowerCase() === "admin");
    if (!isUserAdmin && ticket.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to access this ticket" });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add message to ticket
exports.addMessage = async (req, res) => {
  try {
    const { content, isAdmin } = req.body;
    const ticketId = req.params.id;
    const senderId = req.user._id;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const isUserAdmin = req.user.isSuperAdmin || (req.user.role_id && req.user.role_id.role_name.toLowerCase() === "admin");

    // Security check: if not admin, must be the ticket owner
    if (!isUserAdmin && ticket.seller.toString() !== senderId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to access this ticket" });
    }

    // Only actual admins can set the isAdmin flag
    const finalIsAdmin = isUserAdmin ? !!isAdmin : false;

    const newMessage = {
      sender: senderId,
      content,
      isAdmin: finalIsAdmin,
      createdAt: new Date(),
    };

    ticket.messages.push(newMessage);
    ticket.lastMessageAt = new Date();
    await ticket.save();

    // Populate sender for frontend
    const populatedTicket = await SupportTicket.findById(ticketId)
      .populate("messages.sender", "name email profile_image");
    
    const latestPopulatedMessage = populatedTicket.messages[populatedTicket.messages.length - 1];

    // Real-time notification
    const io = req.app.get("socketio");
    if (io) {
      if (isAdmin) {
        // Notify seller
        io.to(`seller-${ticket.seller}`).emit("new-support-message", {
          ticketId,
          message: latestPopulatedMessage,
        });
      } else {
        // Notify admins
        io.to("admin-room").emit("new-support-message", {
          ticketId,
          message: latestPopulatedMessage,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Message added",
      ticket: populatedTicket,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update ticket status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
