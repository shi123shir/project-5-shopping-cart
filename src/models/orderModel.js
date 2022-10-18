const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId


const orderSchema = new mongoose.Schema({
    userId:{
        type:ObjectId,
        ref:"myUser",
        required:true,
        trim:true
    },

    items:[{
        productId:{
            type:ObjectId,
            ref:"myProduct",
            required:true, 
            tirm:true
        },
        quantity:{
            type:Number,
            required:true, 
            tirm:true,
            min :1
        },
        _id:false
    }],

    totalPrice :{
        type:Number,
        required:true,
        trim:true,
    },
    totalItems:{
        type:Number,
        required:true,
        trim:true,
    },
    totalQuantity:{
        type:Number,
        required:true,
        trim:true,
    },

    cancellable:{
        type:Boolean,
        default:true
    },
    status:{
        type:String,
        default:"pending",
        enum:["pending","completed","cancelled"]
    },
    deletedAt:{
        type: Date
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
},{timestamps:true})



module.exports = mongoose.model("myOrder",orderSchema)