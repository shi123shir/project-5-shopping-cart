
const express = require('express');
const router = express.Router()
const userController = require("../controller/userController")

const validation = require('../validation/validator')

router.post("/register", validation.validUser,userController.createUser )







module.exports = router