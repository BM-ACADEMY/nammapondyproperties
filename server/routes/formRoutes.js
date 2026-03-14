const express = require("express");
const router = express.Router();
const formController = require("../controllers/formController");

// Authentication middleware if needed
// const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// Public routes for submitting forms
router.post("/contact", formController.createContact);
router.post("/request-call", formController.createRequestCall);

// Admin routes for fetching data (could add authMiddleware and isAdmin here)
router.get("/contact", formController.getContacts);
router.get("/request-call", formController.getRequestCalls);
router.delete("/contact/:id", formController.deleteContact);
router.delete("/request-call/:id", formController.deleteRequestCall);

module.exports = router;
