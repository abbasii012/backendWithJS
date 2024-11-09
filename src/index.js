// require('dotenv').config({path:"./env"})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from "./app.js"

dotenv.config({path:'./.env'})
connectDB()
.then(()=>{
   app.listen(process.env.PORT || 8000,()=>{
    console.log(`app is listen on PORT ${process.env.PORT}`);
   })
})
.catch((error)=>{
    console.log("error",error)
})







/*
// this also use for connect the database using IFFE method
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app = express()
;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}
            `)

        app.on("Error",()=>console.error("error",error));

        app.listen(process.env.PORT,()=>{
            console.log(`app is listen on PORT ${process.env.PORT}`);

        })

    } catch (error) {
        console.error("error",error)
        throw error
    }
})()

*/