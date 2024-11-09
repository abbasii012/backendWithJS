import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { model, Schema } from "mongoose";

const UserSchema = new Schema({
   username:{
    type:String,
    required: true,
    unique:true,
    trim:true,
    lowercase:true,
    index:true,
   },
   email:{
    type:String,
    required: true,
    unique:true,
    trim:true,
    lowercase:true,
   },
   fullName:{
    type:String,
    required: true,
    trim:true,
    index:true,
   },
   avatar:{
    type:String,
    required: true,
   },
   coverImage:{
    type:String,
   },
   watchHistory:[
    {
        type:Schema.Types.ObjectId,
        ref:"Videos"
    }
   ],
   password:{
    type:String,
    required: [true,"password is required"],
   
   },
   refreshToken:{
     type:String
   }
},
{
    timestamps:true
})

UserSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
 this.password = bcrypt.hash(this.password,10)
 next()
})

UserSchema.method.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

UserSchema.methods.generateAccessToken = async function (){
   return jwt.sign({
    _id :this._id,
    email:this.email,
    username:this.username,
    fullName:this.fullName,
   },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}

UserSchema.methods.generateRefreshToken = async function (){
    return jwt.sign({
     _id :this._id,
    },
     process.env.REFRESH_TOKEN_SECRET,
     {
         expiresIn:process.env.REFRESH_TOKEN_EXPIRY
     })
 }


export const User = model("User",UserSchema)