const app = require('./app.js')
const mongoose = require('mongoose')

require('dotenv').config();

const { PORT, MONGODB_URL } = process.env


const startServer = async()=>{
    try {
        mongoose.set('strictQuery', true)
        await mongoose.connect(MONGODB_URL,{
            useNewUrlParser : true,
            useUnifiedTopology : true
        })
        console.log("Database Connected")
        app.listen(PORT,()=>{
            console.log(`Server Started At Port ${PORT}`)
        })
    } catch (error) {
        console.log(error)
    }
}
startServer()


// const app = require("./app")
// const mongoose = require("mongoose")

// require("dotenv").config

// const {PORT, MONGODB_URL}= process.env

// function serverCOnnection(){
//     mongoose.connect(MONGODB_URL).then(()=>console.log("Mongoose is connected")).catch((e)=>console.log("Mongoose is not connected"))

// }
// serverCOnnection()


// app.listen(PORT,()=>{
//     console.log("server is running at ",PORT);
// })