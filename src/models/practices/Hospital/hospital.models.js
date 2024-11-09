import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    adddress1:{
        type:String,
        required:true,
    },
    adddress2:{
        type:String,
    },
    pinCode:{
        type:String,
    },
    Specialization:[{
        type:String
    }]
},{timestamps:true})


export const Hospital = mongoose.model("Hospital",hospitalSchema)

