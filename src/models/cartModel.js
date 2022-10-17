const mongoose= require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId;
const cartSchema= new mongoose.Schema({
    
        userId:
        {type: objectId,
         required:true,
         unique:true,
         ref:"myUser"
        },
        items: [{
          productId: {
            type:objectId, 
            required:true,
            unique:true,
            ref:"myProduct" 
            },
          quantity: {
            type:Number, 
            required: true, 
            min :1}
        }],
        totalPrice: {
            type:Number,
            required: true, 
        },
        totalItems: {
            type:Number,
            required: true,
        },

},{timestamps:true})

module.exports = mongoose.model("myCart", cartSchema)