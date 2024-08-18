const { Router } = require("express");

const {
  getAllStaff,
  addStaffMember,
} = require("../controllers/staffController");

const router = Router();

router.route("/").get(getAllStaff).post(addStaffMember);

module.exports = router;
