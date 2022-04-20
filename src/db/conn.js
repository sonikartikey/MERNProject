const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/userRegistration").then(()=>{
    console.log("Connection to the DB Success")
})
.catch((err)=>{
    console.log("falied... to DB")
})

