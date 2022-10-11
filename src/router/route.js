
const express = require('express');
const router = express.Router()
const {createUser,userLongin,getUserById} = require("../controller/userController")
const {validUser} = require('../validation/validator')

router.post("/register", validUser,createUser )
router.post ("/login",userLongin)
router.get ("/user/:userId/profile",getUserById)






module.exports = router