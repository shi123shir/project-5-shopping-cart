const userModel = require("../models/userModel");
// const mongoose = require("mongoose");

const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
const mobileRegex = /^[6-9]\d{9}$/;
const passRegex =
  /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,15}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;
const ImgRegex = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/;
const mongoose = require("mongoose");

function isValidPhoneNumber(data) {
  return mobileRegex.test(data);
}

function isValidEmail(data) {
  return emailRegex.test(data);
}

//  to complete 2 purpose
function isValid(data) {
  if (typeof data == undefined || data == null) return false;
  if (typeof data == "string" && data.trim().length == 0) return false;
  return true;
}

function isValidPassword(data) {
  if (passRegex.test(data) && data.length >= 8 && data.length <= 15)
    return true;
  return false;
}

function isValidImageUrl(data) {
  return ImgRegex.test(data);
}

function isValidObject(data) {
  if (
    Object.prototype.toString.call(data) == "[object Object]" &&
    Object.keys(data).length != 0
  )
    return true;
  return false;
}

function isLetters(data) {
  if (
    typeof data == "string" &&
    data.trim().length !== 0 &&
    /^[a-z A-Z]+$/.test(data)
  )
    return true;
  return false;
}

function isValidPincode(data) {
  if (typeof data == "number" && pincodeRegex.test(data)) return true;
  return false;
}

function isValidObjectId(data) {
  return mongoose.Types.ObjectId.isValid(data);
}

function isValidSize(data) {
  let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];
  return arr.includes(data);
}

function makingArray(data) {
  arr = data
    .trim()
    .split(",")
    .join(" ")
    .split(" ")
    .filter((x) => x.trim().length > 0);
  return arr;
}

//Global Function
function isvalidObjectId(ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
}

const validUser = async function (req, res, next) {
  try {
    let data = req.body;
    let profileImage = req.files;
    let { fname, lname, email, phone, password, address } = data;

    if (Object.keys(data) == 0)
      return res
        .status(400)
        .send({ status: false, message: "please input some data" });

    //=========================== fname ==================================================================================================================================

    if (!fname)
      return res
        .status(400)
        .send({ status: false, message: "please input First name" });

    if (!/^[A-Za-z]{3,10}/.test(fname))
      return res.status(400).send({
        status: false,
        message: "Please enter valid fname, and no numbers",
      });

    //   if (typeof fname === "string" && fname.trim().length == 0)
    //     return res.status(400).send({ status: false, message: "input valid fname no extra space is allowed" });

    //=========================== lname ==================================================================================================================================

    if (!lname)
      return res
        .status(400)
        .send({ status: false, message: "please input Last name" });

    if (!/^[A-Za-z]{3,10}/.test(lname))
      return res.status(400).send({
        status: false,
        message: "Please enter valid lname, and no numbers",
      });

    //=========================== E-mail ==================================================================================================================================

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "please input E-mail" });

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      return res
        .status(400)
        .send({ status: false, message: "Invalid Email Id" });

    let emailId = req.body.email;

    let validEmail = await userModel.findOne({ email: emailId });
    if (validEmail)
      return res
        .status(400)
        .send({ status: false, message: "E-mail already taken" });

    //=========================== profile-Image ==================================================================================================================================

    if (profileImage.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please input profile_image" });

    if (
      !/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(profileImage[0].originalname)
    )
      return res
        .status(400)
        .send({ status: false, message: "invalid image format" });

    //=========================== phone ==================================================================================================================================

    if (!phone)
      return res
        .status(400)
        .send({ status: false, message: "please input phone Number" });

    let number = req.body.phone;

    if (await userModel.findOne({ phone: number }))
      return res
        .status(400)
        .send({ status: false, message: "phone number is already taken" });

    //-------------------------> REGEX <---------------------------------------------------------------------------------------------------------

    if (!/^[6-9]\d{9}$/.test(data.phone))
      return res
        .status(400)
        .send({ status: false, message: "Wrong Mobile Number" });

    //=========================== password ==================================================================================================================================

    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "please input password" });

    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,15}$/.test(password))
      return res.status(400).send({
        status: false,
        message:
          "Atleast 1 uppercase, 1 lowercase, 1 numeric value , 1 special character and Length should be between 8 t0 14 for password!!!",
      });

    //=========================== address ==================================================================================================================================

    if (!address)
      return res
        .status(400)
        .send({ status: false, message: "please input address" });

    let { shipping, billing } = address;

    // empty object value is truthy so is no key present in address in that case also its go into if

    if (shipping) {
      let { street, city, pincode } = shipping;

      if (!street) {
        return res.status(400).send({
          status: false,
          message: "shipping Street address cannot be empty",
        });
      }
      if (!/^[A-Za-z0-9]{3,10}/.test(street))
        return res
          .status(400)
          .send({ status: false, message: " street address not valid LOL 😵" });

      if (!city)
        return res
          .status(400)
          .send({ status: false, message: "shipping City cannot be empty" });

      if (!/^[A-Za-z]{3,10}/.test(city))
        return res
          .status(400)
          .send({ status: false, message: "enter valid city 🙂!!" });

      if (!pincode) {
        return res
          .status(400)
          .send({ status: false, message: "shipping Pincode cannot be empty" });
      }

      if (!/^[1-9][0-9]{5}$/.test(pincode))
        return res
          .status(400)
          .send({ status: false, message: "wrong pincode" });
    }

    if (billing) {
      let { street, city, pincode } = billing;

      if (!street) {
        return res.status(400).send({
          status: false,
          message: "billing Street address cannot be empty",
        });
      }

      if (!/^[A-Za-z0-9]{3,10}/.test(street))
        return res.status(400).send({
          status: false,
          message: " street address not valid Broh 😌",
        });

      if (!city) {
        return res
          .status(400)
          .send({ status: false, message: "billing City cannot be empty" });
      }

      if (!/^[A-Za-z]{3,10}/.test(city))
        return res
          .status(400)
          .send({ status: false, message: "enter valid city Broh  😐!!" });

      if (!pincode) {
        return res
          .status(400)
          .send({ status: false, message: "billing Pincode cannot be empty" });
      }

      if (!/^[1-9][0-9]{5}$/.test(pincode))
        return res
          .status(400)
          .send({ status: false, message: "wrong pincode" });
    }

    next();
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const validUpdate = async function (req, res, next) {
  let data = req.body;

  let { address, email, phone, password } = data;

  if (Object.keys(req.body).length == 0) {
    return res
      .status(400)
      .send({ status: false, message: "Cant not Update empty Request" });
  }
  //valid email or not
  if (email) {
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      return res
        .status(400)
        .send({ status: false, message: "Invalid Email Id" });
  }

  //valid number or not
  if (phone) {
    if (!/^[6-9]\d{9}$/.test(data.phone))
      return res
        .status(400)
        .send({ status: false, message: "Wrong Mobile Number" });
  }

  //valid password or not
  if (password) {
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,15}$/.test(password))
      return res.status(400).send({
        status: false,
        message:
          "Atleat 1 uppercase, 1 lowercase, 1 numeric value , 1 special character and Length should be between 8 t0 14 for password!!!",
      });
  }
  //if Address get selected
  if (address) {
    let { shipping, billing } = address;
    if (shipping) {
      let { street, city, pincode } = shipping;

      if (!street) {
        return res.status(400).send({
          status: false,
          message: "To change address Select shipping street",
        });
      }
      if (!city) {
        return res.status(400).send({
          status: false,
          message: "To change address Select shipping city",
        });
      }
      if (!pincode) {
        return res.status(400).send({
          status: false,
          message: "To change address Select shipping pincode",
        });
      }
      //Regex for Pincode
      if (!/^[1-9][0-9]{5}$/.test(pincode)) {
        return res
          .status(400)
          .send({ status: false, message: "wrong pincode" });
      }
    } else {
      return res.status(400).send({
        status: false,
        message: "To change address Select shipping street",
      });
    }
    //billing
    if (billing) {
      let { street, city, pincode } = billing;

      if (!street) {
        return res.status(400).send({
          status: false,
          message: "To change address Select billing street",
        });
      }
      if (!city) {
        return res.status(400).send({
          status: false,
          message: "To change address Select billing city",
        });
      }
      if (!pincode) {
        return res.status(400).send({
          status: false,
          message: "To change address Select billing pincode",
        });
      }
      //Regex for Pincode
      if (!/^[1-9][0-9]{5}$/.test(pincode)) {
        return res
          .status(400)
          .send({ status: false, message: "wrong pincode" });
      }
    } else {
      return res.status(400).send({
        status: false,
        message: "To change address Select billing street",
      });
    }
  }

  next();
};
//validation(for Get Cart)

//Validation(For deleting Cart)
const deleteCart = function (req, res, next) {
  if (!req.body.productId) {
    return res
      .status(400)
      .send({ status: false, message: "productId is require " });
  }
  if (!isvalidObjectId(req.body.productId)) {
    return res
      .status(400)
      .send({ status: false, message: "productId is Incorrect " });
  }
  next();
};

//Validator(For UpdateOrder)
const upOrder = function (req, res, next) {
  if (!req.body.orderId) {
    return res
      .status(400)
      .send({ status: false, message: "orderId is require " });
  }
  if (!isvalidObjectId(req.body.orderId)) {
    return res
      .status(400)
      .send({ status: false, message: "orderId is Incorrect " });
  }
  //
  let status = ["pending", "completed", "cancelled"].indexOf(req.body.status);
  if (status == -1) {
    return res.status(400).send({
      status: false,
      message: "status should be  completed / cancelled ",
    });
  }
  next();
};

module.exports = {
  validUser,
  validUpdate,
  deleteCart,
  isValid,
  isValidPhoneNumber,
  isValidEmail,
  isValidPassword,
  isValidImageUrl,
  isValidObject,
  isValidPincode,
  isLetters,
  isValidObjectId,
  isValidSize,
  makingArray,
  upOrder,
};
