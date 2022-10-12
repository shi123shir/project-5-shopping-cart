const express = require("express");
const router = express.Router();
const { createUser,userLogin,getUserById,userUpdate,} = require("../controller/userController");
const { validUser, validUpdate } = require("../validation/validator");

const middl = require("../middleware/auth");

router.post("/register",validUser, createUser);
router.post("/login", userLogin);
router.get("/user/:userId/profile", getUserById);
router.put("/user/:userId/profile",validUpdate, userUpdate);

module.exports = router;

// middl.authentication,middl.authorization,