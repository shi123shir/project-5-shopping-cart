const jwt = require("jsonwebtoken");

//Authentication
exports.authentication = async function (req, res, next) {
  try {
    let tokenCheck = req.rawHeaders[1].replace("Bearer ", "");

    if (!tokenCheck) {
      return res
        .status(400)
        .send({ status: false, msg: "Token is required in bearer" });
    }
    //Verifying
    let token = jwt.verify(tokenCheck, "project-5", (err, decode) => {
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

//Autherization

exports.autherization = async function (req, res, next) {
  try {
    if (req.params) {
      if (req.params.userId == req.decode.toString()) {
        next();
      } else {
        return res
          .status(403)
          .send({ status: false, msg: "not Autherized User!!!" });
      }
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, msg: "Server Error autherization !!!" });
  }
};
