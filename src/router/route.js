const express = require("express");
const router = express.Router();
const { createUser,userLogin,getUserById,userUpdate,} = require("../controller/userController");
const { validUser, validUpdate } = require("../validation/validator");
const {createProduct} = require("../controller/productController")

const {authentication,authorization} = require("../middleware/auth");

router.post("/register", validUser, createUser);
router.post("/login", userLogin);
router.get("/user/:userId/profile", authentication, getUserById);
router.put("/user/:userId/profile",authentication,authorization,validUpdate,userUpdate);
router.post ("/products", createProduct)

module.exports = router;

// middl.authentication,middl.authorization,