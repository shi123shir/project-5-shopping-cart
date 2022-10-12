const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../controller/aws");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const createUser = async function (req, res) {
  try {
    let comingData = req.body;
    let password = comingData.password;
    let profileImage = req.files
    const uploadedImage = await uploadFile(profileImage[0]);
    comingData.profileImage = uploadedImage;

    comingData.password = await bcrypt.hash(password, 10);

    let savedData = await userModel.create(comingData);
    return res.status(201).send({ status: true, data: savedData });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const userLogin = async function (req, res) {
  const emailregex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
  const passwordregex = /^(?!.\s)[A-Za-z\d@$#!%?&]{8,15}$/;
  try {
    let data = req.body;
    let { email, password } = data;

    if (Object.keys(data).length === 0)
      return res
        .status(400)
        .send({ status: false, message: "Data is required to login" });

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "email is required" });

    if (!emailregex.test(email))
      return res
        .status(400)
        .send({ status: false, message: "email must be in valid format" });

    let user = await userModel.findOne({ email: email });
    if (!user) {
      return res
        .status(401)
        .send({ status: false, message: "Invalid Email Id" });
    }
    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "user password is required" });

    if (!passwordregex.test(password))
      return res
        .status(400)
        .send({ status: false, message: "Password should be in valid format" });

    let actualPassword = await bcrypt.compare(password, user.password);
    if (!actualPassword)
      return res
        .status(401)
        .send({ status: false, message: "Incorrect password" });

    let token = jwt.sign(
      {
        userId: user._id,
        iat: new Date().getTime(),
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
      },
      "project-5"
    );

    return res.status(200).send({
      status: true,
      message: "user login successfully",
      data: { userId: user._id, token: token },
    });
  } catch (err) {
    res
      .status(500)
      .send({ status: false, message: "server error", error: err });
  }
};
//========================================================================================================================================================================
const getUserById = async function (req, res) {
  try {
    let userId = req.params.userId;

    const isValidUserId = function (title) {
      return mongoose.isValidObjectId(title);
    };

    // userId validation.
    if (!isValidUserId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: `userId ${userId} is invalid` });
    }

    //
    if (req.params.userId != req.decode.toString()) {
      return res.status(403).send({ status: false, data: "not authorized" });
    }

    // checking if user exists.
    let getSpecificUser = await userModel.findOne({
      _id: userId,
    });

    if (!getSpecificUser) {
      return res.status(404).send({ status: false, data: "No user  found" });
    }
    return res
      .status(200)
      .send({ status: true, message: "success", data: getSpecificUser });
  } catch (error) {
    res.status(500).send({ status: false, err: error.message });
  }
};

//PUT API

//Put API(Update User)

const userUpdate = async function (req, res) {
  try {
    let data = req.body;
    let password = req.body.password;
    let profileImage = req.files;

    //bcrypt
    //if user select password
    if (req.body.password) {
      data.password = await bcrypt.hash(req.body.password, 10);
    }
    if (profileImage) {
      profileImage = await uploadFile(profileImage[0]);
      data.profileImage = profileImage;
    }

    //if that Field is present in Our User Body It will update
    let updatedData = await userModel.findOneAndUpdate(
      { _id: req.params.userId },
      data,
      { new: true }
    );
    return res.status(200).send({ status: true, data: updatedData });
  } catch (err) {
    return res.status(500).send({
      status: false,
      msg: "Server Error !!!",
      ErrMessage: err.message,
    });
  }
};

module.exports = { createUser, userLogin, getUserById, userUpdate };
