const { Router } = require("express");
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require("../controllers/usersController");
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
} = require("../controllers/authController");

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updatePassword", protect, updatePassword);
router.patch("/updateMe", protect, updateMe);
router.delete("/deleteMe", protect, deleteMe);

router
  .route("/")
  .get(getAllUsers)
  .post(protect, restrictTo("admin"), protect, createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
