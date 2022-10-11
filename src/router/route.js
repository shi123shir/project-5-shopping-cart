
const express = require('express');
const router = express.Router()
const {createUser,userLongin} = require("../controller/userController")
const {validUser} = require('../validation/validator')

router.post("/register", validUser,createUser )
router.post ("/login",userLongin)






module.exports = router