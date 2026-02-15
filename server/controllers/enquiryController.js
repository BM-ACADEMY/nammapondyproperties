const Enquiry = require('../models/Enquiry');
const Property = require('../models/Property');

exports.createEnquiry = async (req, res) => {
    try {
        console.log("Create Enquiry Body:", req.body);
        const { property_id, seller_id, message, name, email, phone } = req.body;

        // Basic validation
        if (!property_id || !seller_id) {
            return res.status(400).json({ error: "Property ID and Seller ID are required" });
        }

        const enquiryData = {
            property_id,
            seller_id,
            message,
            enquirer_name: name,
            enquirer_email: email,
            enquirer_phone: phone,
            visitor_info: {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }
        };

        if (req.user) {
            enquiryData.user_id = req.user._id;
            // If no manual entry, fallback to user profile (if not provided in body)
            if (!enquiryData.enquirer_name) enquiryData.enquirer_name = req.user.name;
            if (!enquiryData.enquirer_email) enquiryData.enquirer_email = req.user.email;
            if (!enquiryData.enquirer_phone) enquiryData.enquirer_phone = req.user.phone;
        } else {
            // If not logged in, these are required
            if (!name || !phone || !email) {
                return res.status(400).json({ error: "Name, Email and Phone are required for guest enquiries" });
            }
        }

        const enquiry = new Enquiry(enquiryData);
        await enquiry.save();

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
        if (req.user.role !== 'admin') { // Assuming 'admin' role check, adjust based on Role model if needed
            // strict check might depend on how roles are stored (name vs id).
            // For now, let's assume if not admin, filter by seller_id = req.user._id
            // Check if user has 'admin' privilege or just checks ID
            // Let's implement basic filtering:
            filter.seller_id = req.user._id;
        }

        // However, if the user asking is the ADMIN, they might want to see ALL enquiries.
        // I need to check the Role model or how roles are handled.
        // Usually req.user.role is populated.

        // For now, let's allow fetching by query param if admin, or default to self.
        // actually safer:
        // const enquiries = await Enquiry.find({ seller_id: req.user._id })...

        // But for the "Admin Panel" requirement, the Admin needs to see leads.
        // I'll fetch all if admin, else filtered.
        // I need to verify role handling.

        const enquiries = await Enquiry.find(filter)
            .populate('property_id', 'title location images')
            .populate('user_id', 'name email phone')
            .populate('seller_id', 'name email') // To know who is the seller
            .sort({ createdAt: -1 });

        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllEnquiriesAdmin = async (req, res) => {
    try {
        const enquiries = await Enquiry.find()
            .populate('property_id', 'title location images')
            .populate('user_id', 'name email phone')
            .populate('seller_id', 'name email')
            .sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
