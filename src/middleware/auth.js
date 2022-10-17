const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//Global Function
function isvalidObjectId(ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
}

//Authentication
exports.authentication = function (req, res, next) {
  try {
    let tokenCheck = req.rawHeaders[1].replace("Bearer ", "");

    if (!tokenCheck) {
      return res
        .status(400)
        .send({ status: false, msg: "Token is required in bearer" });
    }
    //Verifying

    jwt.verify(tokenCheck, "project-5", (err, decode) => {
      if (err) {
        let msg =
          err.message == "jwt expired"
            ? "Token is Expired !!! "
            : "Token is Invalid !!!";

        return res.status(401).send({ status: false, msg: msg });
      }

      req["decode"] = decode.userId;

      next();
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      msg: "Server Error  authentication!!!",
      ErrMsg: err.message,
    });
  }
};

//Authorization

exports.authorization = function (req, res, next) {
  try {
    if (req.params) {
      if (!isvalidObjectId(req.params.userId)) {
        return res
          .status(400)
          .send({ status: false, msg: "Not a valid UserId" });
      }
      if (req.params.userId == req.decode.toString()) {
        next();
      } else {
        return res
          .status(403)
          .send({ status: false, msg: "not Authorized User!!!" });
      }
    } else {
      return res
        .status(400)
        .send({ status: false, msg: "userId is require in params" });
    }
  } catch (err) {
    return res.status(500).send({
      status: false,
      msg: "Server Error authorization !!!",
      err: err.message,
    });
  }
};
