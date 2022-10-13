const productModel = require("../models/productModel");
const { uploadFile } = require("../controller/aws");
const mongoose = require("mongoose");

const isValidType = (value) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }
  return true;
};
const isValidSize = (sizes) => {
  return ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizes);
};

const createProduct = async function (req, res) {
  try {
    let data = req.body;
    let files = req.files;

    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = data;

    if (Object.keys(data).length === 0)
      return res
        .status(400)
        .send({ status: false, message: "enter some data" });

    if (!title)
      return res
        .status(400)
        .send({ status: false, message: "title is required" });

    if (!isValidType(title))
      return res.status(400).send({
        status: false,
        message: "please enter title in string or title can't be empty",
      });

    const duplicateTitle = await productModel.findOne({ title: title });
    if (duplicateTitle)
      return res
        .status(400)
        .send({ status: false, message: "title already exist " });

    if (!description)
      return res
        .status(400)
        .send({ status: false, message: "description is required" });

    if (!isValidType(description))
      return res.status(400).send({
        status: false,
        message:
          "please enter description in string or description can't be empty",
      });

    if (!price)
      return res.status(400).send({ status: false, message: "price required" });

    if (currencyId || typeof currencyId == "string") {
      if (!isValidType(currencyId))
        return res
          .status(400)
          .send({ status: false, message: "data can not be empty" });

      if (!/INR/.test(currencyId))
        return res.status(400).send({
          status: false,
          message: "currencyId should be in INR format",
        });
    } else {
      data.currencyId = "INR";
    }
    if (currencyFormat || typeof currencyFormat == "string") {
      if (!isValidType(currencyFormat))
        return res
          .status(400)
          .send({ status: false, message: "currency Format can not be empty" });

      if (!/₹/.test(currencyFormat))
        return res
          .status(400)
          .send({ status: false, message: "only rupee is supported" });
    } else {
      data.currencyFormat = "₹";
    }

    if (isFreeShipping) {
      if (typeof Boolean(isFreeShipping) != "boolean")
        return res.status(400).send({
          status: false,
          message:
            "is free shipping should be in boolean format - true or false only",
        });
    }

    if (files.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "productImage is required" });

    let productImage = await uploadFile(files[0]);
    data.productImage = productImage;

    if (style) {
      if (!isValidType(style))
        return res.status(400).send({
          status: false,
          message: "style should be a string or enter some data",
        });
    }

    if (!availableSizes)
      return res
        .status(400)
        .send({ status: false, message: "availableSizes is Required" });

    if (availableSizes) {
      let size = availableSizes.toUpperCase().split(",");
      data.availableSizes = size;

      for (let i = 0; i < data.availableSizes.length; i++) {
        if (!isValidSize(data.availableSizes[i])) {
          return res.status(400).send({
            status: false,
            message:
              "Size should be one of the-'S','XS','M','X','L','XXL','XL' ",
          });
        }
      }
    }
    if (installments) {
      if (!/^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(price))
        return res
          .status(400)
          .send({ status: false, message: "price should be valid format " });
    }

    let productCreate = await productModel.create(data);
    console.log(productCreate);
    return res
      .status(201)
      .send({ status: true, message: "Success", data: productCreate });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

//===============================================================================Get By Filters======================================================================================

//Get API
const getProducts = async function (req, res) {
  try {
    let product = [{ isDeleted: false }];
    if (req.query.size) {
      product.push({ availableSizes: req.query.size });
    }
    if (req.query.name) {
      product.push({ title: req.query.name });
    }
    if (req.query.price) {
      product.push({ price: { $eq: req.query.price } });
    }
    if (req.query.priceGreaterThan) {
      product.push(
        { price: { $gt: req.query.priceGreaterThan } },
        { $sort: { price: 1 } }
      );
    }
    if (req.query.priceLessThan) {
      product.push(
        { price: { $lt: req.query.priceLessThan } },
        { $sort: { price: -1 } }
      );
    }

    console.log(product);

    let findProducts = await productModel.find({ $and: product });

    //if no data Found in DB
    if (findProducts.length == 0) {
      return res.status(200).send({ status: true, msg: "No Match" });
    }
    return res.status(200).send({ status: true, data: findProducts });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, msg: "Server Error!!", err: err.message });
  }
};
//======================================================================Get by Id=============================================================================================


    const getProductById = async function (req, res) {


      try {
        let productId = req.params.productId;

        const isValidproductId = function (productId) {
          return mongoose.isValidObjectId(productId)
        };

        // userId validation.
        if (!isValidproductId(productId)) {
          return res
            .status(400)
            .send({ status: false, message: `productId ${productId} is invalid` });
        };

        // checking if user exists.
        let getSpecificProduct = await productModel.findOne({
          _id: productId,
          isDeleted: false,
        });

        if (!getSpecificProduct) {
          return res.status(404).send({ status: false, data: "No product  found" });
        }
        return res
          .status(200)
          .send({ status: true, message: "success", data: getSpecificProduct });
      } catch (error) {
        res.status(500).send({ status: false, err: error.message });
      }
    };
    //==================================================================Delete By Id ==========================================================================================

    const deleteProductById = async function (req, res) {
      try {
        let productId = req.params.productId;
        const isValidproductId = function (productId) {
          return mongoose.isValidObjectId(productId);
        };


        // productId validation.
        if (!isValidproductId(productId))
          return res.status(400).send({ status: false, message: "Invalid productId" });

        let savedData = await productModel.findById(productId);

        //if it is already deleted
        if (savedData.isDeleted)
          return res.status(404).send({
            status: false,
            message: "Book not found",
          });

        // updating product
        await productModel.findByIdAndUpdate(
          savedData,
          { $set: { isDeleted: true, deletedAt: new Date() } },
          { new: true }
        );

        return res
          .status(200)
          .send({ status: true, message: "deleted successfully" });

      } catch (error) {
        res.status(500).send({ status: false, message: error.message });
      }
    };


    module.exports = { createProduct, getProducts, getProductById, deleteProductById }
