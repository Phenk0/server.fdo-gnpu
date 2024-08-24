const { Router } = require("express");

const {
  getAllStaff,
  addStaffMember,
  getStaffMember,
} = require("../controllers/staffController");

const router = Router();

router.route("/").get(getAllStaff).post(addStaffMember);

router.route("/:id").get(getStaffMember);

module.exports = router;
