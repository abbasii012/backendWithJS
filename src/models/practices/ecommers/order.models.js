import mongoose from "mongoose";

const orderitemSchema = new mongoose.Schema({
    productid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    quantity:{
        type:Number,
        required:true,
    }
})

const orderSchema = new mongoose.Schema({
    orderPrice:{
        type:Number,
        required:true,
    },
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    orderItems:{
        type:[orderitemSchema]
    },
    address:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["pending","delivered","cancel"],
        default:"pending",
    }
},{timestamps:true})


export const Order = mongoose.model("Order",orderSchema)