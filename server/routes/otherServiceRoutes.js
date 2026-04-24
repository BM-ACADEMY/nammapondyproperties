const express = require("express");
const router = express.Router();
const {
  createService,
  getAllServices,
  updateService,
  deleteService,
} = require("../controllers/otherServiceController");
const { protect, admin } = require("../middleware/authMiddleware");

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

router.route("/")
  .get(getAllServices)
  .post(createService);

router.route("/:id")
  .put(updateService)
  .delete(deleteService);

module.exports = router;
