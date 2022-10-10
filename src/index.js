const express = require("express")
const route = require("./router/route")
const mongoose = require("mongoose")
const multer = require("multer")
const app = express()


app.use (express.json())
app.use (multer().any())



mongoose.connect("mongodb+srv://shishir1912-DB:F85ml8mUXi1MrEKV@cluster0.2ta5zuw.mongodb.net/group54Database",{
    useNewUrlParser :true
})
.then(()=>console.log("mongoose is connected"))
.catch((err)=>err)


app.use("/",route)

app.listen(process.env.PORT||3000,function(){
   console.log("express is running on Port " + (process.env.PORT||3000))
})