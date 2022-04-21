require('dotenv').config()
const express = require('express')
const path = require('path')
const hbs = require('hbs')
const Register = require('./models/register')
require("./models/register")
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser')
const { cookie } = require('express/lib/response')
const auth = require("./middleware/auth")


require("./db/conn")
const app = express()
const port = process.env.POR || 3000;

//this is OKay while using POSTMAN
app.use(express.json())
app.use(cookieParser())

app.use(express.urlencoded({ extended: false }))

//to use static website
// const staticPath = path.join(__dirname , "../public")
// app.use(express.static(staticPath))

app.set("view engine", "hbs")
const template_Path = path.join(__dirname, "../templates/views")
app.set("views", template_Path)


//to register partials
const partial_Path = path.join(__dirname, "../templates/partials")
hbs.registerPartials(partial_Path)

// console.log(process.env.SECRET_KEY)

app.get("", (req, res) => {
  res.render("index")
})


app.get("/secret", auth, (req, res) => {
  console.log(`here i ma in secret pafge ${req.cookies.jwt}`)
  res.render("secret")
})


app.get("/register", (req, res) => {
  res.render("register")
})

app.get("/logout", auth, async(req, res) => {
  try {
    //for single logout
    // req.user.tokens = req.user.tokens.filter((current_token)=>{return current_token.token !== req.token})

    //for all device logitu
    req.user.tokens = []
    res.clearCookie('jwt')
    console.log("Logout")
    await req.user.save();
    res.render("login")
  } catch (err) {

  }
})

app.get("/login", (req, res) => {
  res.render("login")
})

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password
    const cpassword = req.body.cnfpassword
    if (password === cpassword) {
      const registerEmployee = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.phone,
        age: req.body.age,
        password: req.body.password,
        confirmpassword: req.body.cnfpassword
      })
      //concept of middle ware(bcypt)  --- in model
      //another use of middleware concept of middle ware(JWT)
      const token = await registerEmployee.generateAuthToken();

      //res.cookie is used to set the cookie name to value
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 20000),
        httpOnly: true
      })

      const createEmployee = await registerEmployee.save();
      res.status(201).render("index")
      console.log("successfully added ")
    } else {
      res.send("password are not matching")
    }
  }
  catch (err) {
    res.status(400).render(err)
  }
})


//Lofin Post

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email
    const userPassword = req.body.password
    // console.log(`${email} , ${password}`)
    const userEmail = await Register.findOne({ email: email })
    const userDatabasePassword = userEmail.password

    const isMatch = await bcrypt.compare(userPassword, userDatabasePassword)

    const token = await userEmail.generateAuthToken();
    //res.cookie is used to set the cookie name to value
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 50000),
      httpOnly: true
    })

    // console.log(req.cookies.jwt)

    if (isMatch) {
      res.status(201).render("index")
      console.log("welcome to the homepage successfuly login")
    }
    else {
      res.send(`Passwords are nor noting ${userDatabasePassword} , ${userPassword}`)
    }
  }
  catch (err) {
    res.status(400).send("Invalid Login")
  }
})


// //TO learn Bcypt Js

// // const securePassword = async(password)=>{
// //   const passwordHash = await bcrypt.hash(password , 10)
// //   console.log(passwordHash)

// //   const actualpassword = await bcrypt.compare(password , passwordHash)
// //   console.log(actualpassword)
// // }

// // securePassword("kartike@123");

//===============================

//to learn JWT

// const jwt = require('jsonwebtoken');
// const createToken = async()=>{

// const token = await jwt.sign({_id:"625fc2cff9ddf7113a3ce282"},"mynameiskartikeysoni", {
//   expiresIn:"10 seconds"
// })
// console.log(token)

// const userVerify = await jwt.verify(token , "mynameiskartikeysoni")
// console.log(userVerify)

// }

// createToken()



app.listen(port, () => { console.log("connection established to express") })

