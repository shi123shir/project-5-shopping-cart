const cartModel=require("../models/cartModel")

const createCart= async function(req,res){
    try{
        let data = req.body
        let userId= req.body.userId
        let productId= req.body.productId
         
        let cart= await cartModel.findOne({_id:productId})
        if(cart==null){
            let savedData = await userModel.create(data)
            res.status(201).send({status:true,msg:"cart has been created", data:savedData})

        }

    }
    catch(err){
        res.status(500).send({status:false, msg:"something went wrong !"})
    }
}



module.exports={createCart}