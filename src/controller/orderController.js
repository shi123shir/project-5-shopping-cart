const cartModel = require ("../models/cartModel")
const orderModel = require ("../models/orderModel")
const mongoose   = require ("mongoose")


    const isValidStatus = (status) => {
    return ['pending', 'completed', 'cancelled'].includes(status);
  }

const createOrder =  async function(req, res){
  try {

    const userId = req.params.userId

    if(!mongoose.isValidObjectId(userId))return res.status(400).send({status:false, message:"userId is not valid id"})

    let data = req.body


    if(Object.keys(data).length === 0)return res.status(400).send({status:false, message:"data is required"})

    let {cartId, status, cancellable} = data

    if(!cartId) return res.status(400).send({status: false,message:"cart Id is required"})

    if(!mongoose.isValidObjectId(cartId))return res.status(400).send({status:false,message:"please provide valid cart Id"})

       let  findCart = await cartModel.findOne({userId: userId})

    if(!findCart) return res.status(404).send({status:false,message:"No cart exist with this user"})

    if(findCart.items.length === 0 ) return res.status(400).send({status:false,message:"No Item in Cart"})

    

    // type of status

    if(!isValidStatus) return res.status(400).send({status:false,message:"status should be on of 'pending','completed','cancelled' "})

    //  cancellable validation 


    let totalQuantity = 0;

    for(let i = 0 ; i<findCart.items.length; i++){
        totalQuantity += findCart.items[i].quantity
    }

    data.userId = userId
    data.items = findCart.items
    data.totalPrice = findCart.totalPrice
    data.totalItems = findCart.totalItems
    data.totalQuantity = totalQuantity

    let orderCreation = await orderModel.create(data)
    await cartModel.updateOne({_id: findCart._id},
       {items:[],totalPrice:0,totalItems:0} 
        )
        return res.status(201).send({status:true, message:"Success",data:orderCreation})
    }catch(err){
      return res.status(500).send({status:false,message:"server error",error:err.message})
    }

}

module.exports = {createOrder}