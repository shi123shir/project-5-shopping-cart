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
// ==============================================================updateproduct======================================================
    const updateProduct = async function(req,res){
        try{   
        let productId = req.params.productId
        if (!mongoose.isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Please provide valid Product Id" }) }
        let getId = await productModel.findOne({ _id: productId })
        if (!getId) {
            return res.status(404).send({ status: false, message: "Product Not Found for the request id" });
        }
        if (getId.isDeleted == true) {
            return res.status(404).send({ status: false, message: "Product is already deleted " });
        }
        let data = req.body;
        let files = req.files;
        // ===============================file validation=====================================

        if (Object.keys(data).length===0) return res.status(400).send({ status: false, message: "Body cannot be empty " })
        //checking for product image
        if (files && files.length > 0) {
            //uploading the product image
            let productImgUrl =  uploadFile(files[0]);
            data.productImage = productImgUrl;
        }

        // =================================================title validation=============================================================

        if (data.title || data.title == "string") {
            if (!isValidType(data.title)) {
                return res.status(400).send({ status: false, message: "title should not be empty String" })
            }

            //Check the title for duplicate
            var duplicateTitle = await productModel.findOne({ title: data.title })
            if (duplicateTitle) {
                return res.status(400).send({ status: false, message: "title is already present in database" })
            }
        }
        // ==============================================Description validation============================

        if (data.description || data.description == "string") {
            if (!isValidType(data.description)) {
                return res.status(400).send({ status: false, message: "Description should not be empty String" })
            }
            
        }
        // ==================================== currency validation=======================

        if (data.currencyId || typeof data.currencyId == 'string') {
            //checking for currencyId 
            if (!isValidType(data.currencyId)) return res.status(400).send({ status: false, message: "Currency Id of product should not be empty" });

            if (!(/INR/.test(data.currencyId))) return res.status(400).send({ status: false, message: "Currency Id of product should be in uppercase 'INR' format" });
        }
        // ================================================= ========================================

        if (data.currencyFormat || typeof data.currencyFormat == 'string') {
            //checking for currency formate
            if (!isValidType(data.currencyFormat)) return res.status(400).send({ status: false, message: "Currency format of product should not be empty" });

            if (!(/₹/.test(data.currencyFormat))) return res.status(400).send({ status: false, message: "Currency format of product should be in '₹' " });
        }
        // ==================================== free shipping validation========================
        if (data.isFreeShipping || typeof data.isFreeShipping == 'string') {
            if (!isValidType(data.isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping should not contain white spaces" });
            data.isFreeShipping = data.isFreeShipping.toLowerCase().trim();//trim the whitespaces
            if (data.isFreeShipping == 'true' || data.isFreeShipping == 'false') {
                //convert from string to boolean
                data.isFreeShipping = JSON.parse(data.isFreeShipping);
            } else {
                return res.status(400).send({ status: false, message: "Please enter either 'true' or 'false'" })
            }
        }
        // =============================style validation===========================================
        if (data.style || typeof data.style == 'string') {
            if (!isValidType(data.style)) return res.status(400).send({ status: false, message: "Style should be in a string or not be empaty" });
        }
        // =============================availablesizes validation==========================================
        if (data.availableSizes || typeof data.availableSizes == 'string') {
            //checking for available Sizes of the products
            let size = data.availableSizes.toUpperCase().split(",") //creating an array
            data.availableSizes = size


            let findavail = await productModel.findById({_id: productId})

            for (let i = 0; i < data.availableSizes.length; i++) {
              for(let j =0 ; j<findavail.availableSizes.length;j++){
                if(findavail.availableSizes[j] == data.availableSizes[i]){
                  return res.status(400).send({status:false,message:"already exist"})
                }
                if (!isValidSize(data.availableSizes[i])){
                    return res.status(400).send({ status: false, message: "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'" })
                }
            }
          }
        }
        let updatedProduct = await productModel.findByIdAndUpdate(
            { _id: productId },
            {$set:{productImage:data.productImage,title:data.title,description:data.description,price:data.price,style:data.style,isFreeShipping:data.isFreeShipping},
            $push:{availableSizes:data.availableSizes}
          },
            { new: true }
        )
        return res.status(200).send({ status: true, message: "Product updated successfully", data: updatedProduct })
        }
        
catch(err){
            res.status(500).send({status:false, msg:"server error",error:err.message})
        }
    }

    //============================================================updateProduct==================================================//
//     const validName = (value) => {
//         if (typeof value !== "string" || value.trim().length === 0) {
//           return false;
//         }
//         return true;
//       };
    
// const updateProduct = async function (req, res) {
//     try {

//         let productId = req.params.productId
//         let data = req.body
//         let ImageProduct = req.files
//         let { title, description, price, currencyId, currencyFormat,
//             isFreeShipping, style, availableSizes, installments } = data
//         if (ImageProduct && ImageProduct.length > 0) {
//             data.productImage = ImageProduct
//         }


//         if (Object.keys(data).length == 0) {
//             return res.status(400).send({ status: false, message: "please enter something to update" })
//         }


//         if ((productId)==null) {
//             return res.status(400).send({ status: false, message: "please enter valid productId" })
//         }
//         let checktitle = await productModel.findOne({ title: title })
//         if (checktitle) {
//             return res.status(400).send({ status: false, message: "title already exist " })
//         }

//         if (title == "") {
//             return res.status(400).send({ status: false, message: "please enter title as a value" })
//         }

//         if (!validName(title)) {
//             return res.status(400).send({ status: false, message: "please enter title in a valid format" })
//         }

//         if (description == "") {
//             return res.status(400).send({ status: false, message: "please enter description as a value" })
//         }


//         if (!validName(description)) {
//             return res.status(400).send({ status: false, message: "please enter description in a valid format" })
//         }


//         if (price == "") {
//             return res.status(400).send({ status: false, message: "please enter price as a value" })
//         }
//         if (price) {
//             if (!validPrice(price)) {
//                 return res.status(400).send({ status: false, message: " please enter valid price " })
//             }
//         }

//         if (availableSizes) {

//             if (availableSizes) {
//                 let size = availableSizes.toUpperCase().split(",") //creating an array
//                 availableSizes = size;
//             }
//             for (let i = 0; i < availableSizes.length; i++) {
//                 if (!isValidSize(availableSizes[i])) {
//                     return res.status(400).send({ status: false, message: "Size should be one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'" })
//                 }
//             }

//             let updateSize = await productModel.findById(productId)
//             var size = updateSize.availableSizes

//             for (let i = 0; i < size.length; i++) {

//                 for (let j = 0; j < availableSizes.length; j++) {

//                     if (size[i] == availableSizes[j]) {

//                         availableSizes.splice(j, 1)
//                         j = j - 1
//                     }
//                 }
//             }
//             for (let k = 0; k < availableSizes.length; k++) {
//                 size.push(availableSizes[k])
//             }

//         }
//         if (currencyId) {
//             if (currencyId != "INR") {
//                 return res.status(400).send({ status: false, message: "CurrencyId should only be INR " })
//             }
//         }
//         if (currencyFormat) {
//             if (currencyFormat != "₹") {
//                 return res.status(400).send({ status: false, message: "currencyFormat should only be ₹" })
//             }
//         }
//         if (isFreeShipping) {
//             if (!(isFreeShipping == "true" || isFreeShipping == "false")) {
//                 return res.status(400).send({ status: false, message: " isFreeShipping only be true or false" })
//             }
//         }
//         if (!validName(style)) {
//             return res.status(400).send({ status: false, message: " please enter style in correct format" })
//         }
//         if (installments) {
//             if (!/^[0-9]{1,2}$/.test(installments)) {
//                 return res.status(400).send({ status: false, message: "please enter installments in correct format" })
//             }
//         }
//         if (ImageProduct && ImageProduct.length > 0) {

//             var productImage = await uploadFile(ImageProduct[0])
//         }

//         let updatedProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, {
//             $set: {
//                 title: title, description: description, price: price, currencyId: currencyId, currencyFormat: currencyFormat, isFreeShipping: isFreeShipping,
//                 productImage: productImage, style: style, availableSizes: size, installments: installments
//             }
//         }, { new: true })
//         if (!updatedProduct) {
//             return res.status(400).send({ status: false, message: "product not found or deleted" })
//         }

//         return res.status(200).send({ status: true, message: "updated", data: updatedProduct })

//     } catch (error) {
//         return res.status(500).send({ status: false, message: error.message })
//     }
// }

// module.exports = { createProduct, updateProduct }
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
        if (savedData.isDeleted == true)
          return res.status(404).send({
            status: false,
            message: "Product not found",
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



    module.exports = { createProduct, getProducts, getProductById, deleteProductById,updateProduct }
