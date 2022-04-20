const mongooose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express')



const employeeSchema = new mongooose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

//genrating JWT 

employeeSchema.methods.generateAuthToken = async function () {
    try {
        const token = await jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY)
        console.log("inside tryy function", token)

        this.tokens = this.tokens.concat({ token: token })
        console.log(` i am herw ${token}`)
        await this.save()
        return token
    } catch (error) {
        res.send(error)
        console.log(error)
    }
}

// to check pre condition for bcytppt  ,, this is middleware using bcrypt
employeeSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        // const passwordHash = await bcrypt.hash(password , 10)
        this.password = await bcrypt.hash(this.password, 10)
        this.confirmpassword = await bcrypt.hash(this.password, 10)

    }
    next();
})

const Register = mongooose.model('Register', employeeSchema);

module.exports = Register;
