const userModel= require("../models/userModel")
const jwt= require("jsonwebtoken")





const createUser= async function(req,res){
    try{
       
        let comingData= req.body
        
        let savedData = await userModel.create(comingData)
       return res.status(201).send({status:true,data:savedData})

    }
    catch(err){
       return res.status(500).send({status:false, msg:err.message})
    }
}

module.exports={createUser}