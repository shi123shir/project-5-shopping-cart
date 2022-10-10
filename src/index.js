const express = require("express")
const route = require("./router/route")
const mongoose = require("mongoose")
const multer = require("multer")
const app = express()


app.use (express.json())
app.use (multer().any())



mongoose.connect("mongodb+srv://Adesh:LnDEhxK0maoDwQD9@cluster0.r3pzigx.mongodb.net/Adesh1947=DB",{
    useNewUrlParser :true
})
.then(()=>console.log("mongoDB is connected"))
.catch((err)=>err)


app.use("/",route)

app.listen(process.env.PORT||3000,function(){
   console.log("express is running on Port " + (process.env.PORT||3000))
})