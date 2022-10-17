const cartModel = require("../models/cartModel");

const cartDeleted = async function (req, res) {
  //Empty items
  try {
    let emptyArray = [];
    let cart = await cartModel.findOne({
      userId: req.params.userId,
      "items.productId": req.body.productId,
    });

    if (cart == null || cart.items.length == 0) {
      return res.status(404).send({ status: false, msg: "Cart Not Found!!" });
    }
    let deleteItems = await cartModel.findOneAndUpdate(
      { userId: req.params.userId },
      { items: emptyArray, totalPrice: 0, totalItems: 0 },
      { new: true }
    );

    return res.status(204).send({
      status: true,
      data: deleteItems,
      msg: "Cart deleted Succesfully!!",
    });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, msg: "Server Error !!!", err: err.message });
  }
};

module.exports = { cartDeleted };
