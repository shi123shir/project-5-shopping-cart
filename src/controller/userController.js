const userModel= require("../models/userModel")
const jwt= require("jsonwebtoken")
const { uploadFile } = require("../controller/aws")





const createUser= async function(req,res){
    try{
       
        let comingData= req.body
         let profileImage=req.files
        const uploadedImage = await uploadFile(profileImage[0])
        comingData.profileImage = uploadedImage



        
        let savedData = await userModel.create(comingData)
       return res.status(201).send({status:true,data:savedData})

    }
    catch(err){
       return res.status(500).send({status:false, msg:err.message})
    }
}

module.exports={createUser}