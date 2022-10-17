const express = require("express");
const router = express.Router();
const {
  createUser,
  userLogin,
  getUserById,
  userUpdate,
} = require("../controller/userController");
const {
  validUser,
  validUpdate,
  deleteCart,
} = require("../validation/validator");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProductById,
  updateProducts,
} = require("../controller/productController");
const { cartDeleted } = require("../controller/cartController");
const { authentication, authorization } = require("../middleware/auth");

//===================================================================================================================================================

//User API
router.post("/register", validUser, createUser);
router.post("/login", userLogin);
router.get("/user/:userId/profile", authentication, getUserById);
router.put(
  "/user/:userId/profile",
  authentication,
  authorization,
  validUpdate,
  userUpdate
);
//===================================================================================================================================================

//Product API
router.post("/products", createProduct); //Create Product
router.get("/products", getProducts); //Get by filters
router.get("/products/:productId", getProductById); //Get by Id
router.put("/products/:productId", updateProduct); //update by Id

router.delete("/products/:productId", deleteProductById); //Delete by Id

// Cart API

//router.post("/users/:userId/cart", authentication, authorization, createCart);
router.delete(
  "/users/:userId/cart",
  authentication,
  authorization,
  deleteCart,
  cartDeleted
);

module.exports = router;

// middl.authentication,middl.authorization,
