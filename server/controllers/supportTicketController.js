const SupportTicket = require("../models/SupportTicket");
const { sendSupportTicketNotificationToAdmin } = require("../utils/emailService");

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
      isAdminRead: false,
    });


    await newTicket.save();

    // Send email notification to admin
    try {
      await sendSupportTicketNotificationToAdmin(newTicket, req.user, message);
    } catch (emailErr) {
      console.error("Failed to send support ticket email:", emailErr);
    }

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
      .populate({
        path: "seller",
        select: "name email profile_image phone businessType",
        populate: { path: "businessType", select: "name" }
      })
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
      .populate({
        path: "seller",
        select: "name email profile_image phone businessType",
        populate: { path: "businessType", select: "name" }
      })
      .populate("messages.sender", "name email profile_image");
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const isUserAdmin = req.user.isSuperAdmin || (req.user.role_id && req.user.role_id.role_name.toLowerCase() === "admin");
    if (!isUserAdmin && ticket.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to access this ticket" });
    }

    // Mark messages as read if viewing party is the recipient
    let hasChanged = false;
    ticket.messages.forEach(msg => {
      if (!msg.read) {
        if (isUserAdmin && !msg.isAdmin) {
          msg.read = true;
          hasChanged = true;
        } else if (!isUserAdmin && msg.isAdmin) {
          msg.read = true;
          hasChanged = true;
        }
      }
    });

    if (hasChanged) {
      await ticket.save();
      // Notify the other party that messages were read
      const io = req.app.get("socketio");
      if (io) {
        if (isUserAdmin) {
          // Admin read seller's messages, notify seller
          io.to(`seller-${ticket.seller._id}`).emit("messages-read", { ticketId: ticket._id });
        } else {
          // Seller read admin's messages, notify admins
          io.to("admin-room").emit("messages-read", { ticketId: ticket._id });
        }
      }
    }

    // Mark as read for the viewing party
    if (isUserAdmin && !ticket.isAdminRead) {
      ticket.isAdminRead = true;
      await ticket.save();
    } else if (!isUserAdmin && !ticket.isSellerRead) {
      ticket.isSellerRead = true;
      await ticket.save();
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
      .populate("seller", "name email profile_image")
      .populate("messages.sender", "name email profile_image");
    
    const latestPopulatedMessage = populatedTicket.messages[populatedTicket.messages.length - 1];

    // Real-time notification
    const io = req.app.get("socketio");
    if (io) {
      if (finalIsAdmin) {
        // Admin sent message, mark seller as unread
        ticket.isSellerRead = false;
        // Notify seller
        io.to(`seller-${ticket.seller}`).emit("new-support-message", {
          ticketId,
          message: latestPopulatedMessage,
        });
      } else {
        // Seller sent message, mark admin as unread
        ticket.isAdminRead = false;
        // Notify admins
        io.to("admin-room").emit("new-support-message", {
          ticketId,
          message: latestPopulatedMessage,
          isAdminRead: false
        });
      }
      await ticket.save();
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
    const ticketId = req.params.id;

    // Determine if we should set or unset the resolvedAt field for TTL
    let update = { status };
    if (status === "resolved" || status === "closed") {
      update.resolvedAt = new Date();
    } else {
      // If status is "open", we unset resolvedAt to stop the deletion timer
      update.$unset = { resolvedAt: 1 };
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      update,
      { new: true }
    ).populate("seller", "name email profile_image");

    // Real-time notification for status change
    const io = req.app.get("socketio");
    if (io) {
      // Notify seller
      io.to(`seller-${ticket.seller._id}`).emit("ticket-status-updated", { ticket });
      // Notify admins
      io.to("admin-room").emit("ticket-status-updated", { ticket });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
