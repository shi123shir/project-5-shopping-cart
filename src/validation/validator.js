const userModel= require("../models/userModel")



const validUser= async function(req,res,next){
    try{
     
        let data = req.body
       
     let {fname,lname,email,profileImage,phone,password,address}= data

        if(Object.keys(data)==0)
        return res.status(400).send({status:false, msg:"please input some data"})

//=========================== fname ==================================================================================================================================           

       if(!fname)
       return res.status(400).send({status:false, msg:"please input First name"})

        if (!/^[A-Za-z]{3,10}/.test(fname))
        return res.status(400).send({ status: false, message: "Please enter valid fname, and no numbers" });
  
    //   if (typeof fname === "string" && fname.trim().length == 0)
    //     return res.status(400).send({ status: false, message: "input valid fname no extra space is allowed" });
  
//=========================== lname ==================================================================================================================================

        if(!lname)
        return res.status(400).send({status:false, msg:"please input Last name"})

        if (!/^[A-Za-z]{3,10}/.test(lname))
        return res.status(400).send({ status: false, message: "Please enter valid lname, and no numbers" });
  
//=========================== E-mail ==================================================================================================================================

        if(!email)
        return res.status(400).send({status:false, msg:"please input E-mail"})

        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
        return res.status(400).send({ status: false, message: "Invalid Email Id" });
  
      let emailId = req.body.email;
  
      let validEmail = await userModel.findOne({ email: emailId });
      if (validEmail)
        return res.status(400).send({ status: false, message: "E-mail already taken" });

//=========================== profile-Image ==================================================================================================================================

        if(!profileImage)
        return res.status(400).send({status:false, msg:"please input profile_image"})

//=========================== phone ==================================================================================================================================        

      if(!phone)
        return res.status(400).send({status:false, msg:"please input phone Number"})

      let number = req.body.phone;
      
      if (await userModel.findOne({ phone: number }))
        return res.status(400).send({ status: false, message: "phone number is already taken" });
  
      //-------------------------> REGEX <---------------------------------------------------------------------------------------------------------
  
      if (!/^[6-9]\d{9}$/.test(data.phone))
        return res.status(400).send({ status: false, message: "Wrong Mobile Number" });
  
//=========================== password ==================================================================================================================================

        if(!password)
        return res.status(400).send({status:false, msg:"please input password"})

    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,15}$/.test(data.password))
    return res.status(400).send({ status: false, message: "Atleat 1 uppercase, 1 lowercase, 1 numberic value , 1 special character and Length should be between 8 t0 14 for password!!!" });

//=========================== address ==================================================================================================================================


        if(!address)
        return res.status(400).send({status:false, msg:"please input adress"})

         let {shipping,billing}=address
      
         
       // empty object value is truthy so is no key present in adress in taht case also its go into if 
       
        if (shipping) {
            let {street,city,pincode}=shipping
          if (!street) {
            return res.status(400).send({ status: false, message: "shipping Street address cannot be empty" })
          }
   
         
    if (typeof street == "string" && street.trim().length == 0)
    return res.status(400).send({ status: false, message: "input valid street" });

          if (!city) {
            return res.status(400).send({ status: false, message: "shipping City cannot be empty" })
          }
          if (typeof city === "string" && city.trim().length == 0)
             return res.status(400).send({ status: false, message: "input valid shipping's city address and no extra space is allowed" });
        
          if (!pincode) {
            return res.status(400).send({ status: false, message: "shipping Pincode cannot be empty" })
          }
          if (typeof pincode === Number && pincode.trim().length == 0)
          return res.status(400).send({ status: false, message: "input valid shipping's pincode  and no extra space is allowed" });
     
        //  else {return res.status(400).send({ status: false, message: "shipping address cannot be empty" }) }
       }
       
       if(billing){
        if (!billing.street) {
            return res.status(400).send({ status: false, message: "billing Street address cannot be empty" })
          }
          if (!billing.city) {
            return res.status(400).send({ status: false, message: "billing City cannot be empty" })
          }
          if (!billing.pincode) {
            return res.status(400).send({ status: false, message: "billing Pincode cannot be empty" })
          }
         // else {return res.status(400).send({ status: false, message: "address cannot be empty" }) }

       }

     next()
    }
    catch(err){
        return res.status(500).send({status:false, msg:err.message})
    }
}


module.exports={validUser}