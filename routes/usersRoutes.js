const { Router } = require("express");
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");
const { signUp, login } = require("../controllers/authController");

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
