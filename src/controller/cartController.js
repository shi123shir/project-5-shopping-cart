const cartModel = require("../models/cartModel");
const productModel= require("../models/productModel")
const validator= require("../validation/validator")
const mongoose= require("mongoose")
const userModel= require("../models/userModel")

const createCart = async function(req,res){
  try{

      const userId = req.params.userId

      if(!validator.isValidObjectId(userId)){
          return res.status(400).send({status:false, message:"Invalid userId"})
      }
      // if(req.userId!=userId){
      //     return res.status(403).send({status:false, message:"unauthorization"})
      // }
      const user = await userModel.findById(userId)
      if(!user){
          return res.status(400).send({status:false, message:"no user found"})
      }

      if(!validator.isValidObject(req.body)){
          return res.status(400).send({status:false, message:"pls provide data to create cart"}) 
      }
      let {cartId,productId}=req.body

      
      if(!productId){
          return res.status(400).send({status:false, message:"productId is mandatory"})
      }
      if(!validator.isValidObjectId(productId)){
          return res.status(400).send({status:false, message:"Invalid productId"})
      }

      const product = await productModel.findOne({_id:productId,isDeleted:false}).lean()
      if(!product){
          return res.status(400).send({status:false, message:"No product found"})
      }
      const cart = await cartModel.findOne({userId}).lean()
      if(cart){
          if(!cartId){
              return res.status(400).send({status:false, message:"cartId is mandatory"})
          }
          if(!validator.isValidObjectId(cartId)){
              return res.status(400).send({status:false, message:"Invalid cartId"})
          }
          if(cartId!=cart._id){
              return res.status(400).send({status:false, message:"different cartId is present"})
          }

          let {items,totalItems,totalPrice}=cart
          let flag = true
          console.log(cart)
          for(let i=0;i<items.length;i++){
              if(items[i].productId==productId){
                  flag=false
                  items[i].quantity++
              }
          }
          if(flag){
              let obj={
                  productId:mongoose.Types.ObjectId(productId),
                  quantity:1
              }
              items.push(obj)
          }
          totalPrice=totalPrice+product.price
          totalItems=items.length
          
          const updatedCart = await cartModel.findByIdAndUpdate(cartId,{items,totalPrice,totalItems},{new:true})
          return res.status(201).send({status:true, message:"Success", data:updatedCart})
      }
      else{
          let obj={}
          obj.userId = mongoose.Types.ObjectId(userId)
          obj.items= [{
              productId:mongoose.Types.ObjectId(productId),
              quantity:1
          }]
          obj.totalItems=1
          obj.totalPrice=product.price

          const newCart = await cartModel.create(obj)
          return res.status(201).send({status:true, message:"Success", data:newCart})
      }
  }
  catch(err){
      return res.status(500).send({status:false, message:err.message})
  }
}

const updateCart = async function (req,res){
  try{

  let userId = req.params.userId

  let data = req.body

  if(!mongoose.isValidObjectId(userId))return res.status(400).send({status:false,message:"userid is not a valid id"})

  if(Object.keys(data).length === 0)return res.status (400).send ({status:false,message:"please enter some data for updtation"})

  // checking if cart is present or not
  let cart = await cartModel.findOne({ userId: userId });
  if (!cart) {
      return res.status(400).send({ status: false, message: `No cart found with this ${userId} userId` });
  }
   if (data.totalPrice || data.totalItems || typeof data.totalPrice == "string" || typeof data.totalItems == "string") {
          return res.status(400).send({ status: false, message: "Cannot change or update total price or total Items" })
      }

  //    if card it 

      if(!mongoose.isValidObjectId(data.cartId))return res.status(400).send({status:false,message:"cartId is not valid"})

      if(cart._id.toString()!= data.cartId)return res.status(400).send({status:false,message:"cart not exist"})
     
      // productId

      if(!data.productId) return res.status(400).send({status:false,message:"productId is required"})

      if(!mongoose.isValidObjectId(data.productId))return res.status(400).send({status:false, message:"please enter vaild productId"})

      let findProduct = await productModel.findById({_id:data.productId})
      if(!findProduct){
          return res.status(404).send({status:false, message:"no product find with this product Id"})
      }

      if(!(/0|1/.test(data.removeProduct)))return res.status(400).send({status:false,message:"removePrduct should be either 0 or 1"})

      let proArr = cart.items.filter(x =>
         x.productId.toString() == data.productId )

         if(proArr.length == 0) {
          return res.status(400).send({status:false,message:"Product is not present in cart"})
         }

         let index = cart.items.indexOf(proArr[0])

         if(data.removeProduct == 0 ){
          cart.totalPrice = (cart.totalPrice - (findProduct.price * cart.items[index].quantity))
          cart.items.splice(index, 1)
          cart.totalItems = cart.items.length
          cart.save()
         }

         if(data.removeProduct == 1){
          cart.items[index].quantity -= 1;
          cart.totalPrice= (cart.totalPrice - findProduct.price)
          if(cart.items[index].quantity == 0 ){
              cart.items.splice(index , 1)
          }

          cart.totalItems = cart.items.length
          cart.save()
         }

         return res.status(200).send({status:true,message:"Success",data: cart})

      }
      catch(err) {
          return  res.status(500).send({status:false, message:"server error",error:err.message})
      }
}


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

module.exports = { cartDeleted, createCart,updateCart };
