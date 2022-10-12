const express = require("express");
const router = express.Router();
const {
  createUser,
  userLongin,
  getUserById,
  userUpdate,
} = require("../controller/userController");
const { validUser, validUpdate } = require("../validation/validator");

const middl = require("../middleware/auth");

router.post("/register", createUser);
router.post("/login", userLongin);
router.get("/user/:userId/profile", getUserById);
router.put(
  "/user/:userId/profile",
  middl.authentication,
  middl.autherization,
  validUpdate,
  userUpdate
);

module.exports = router;
