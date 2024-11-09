import mongoose from "mongoose";

const DoctorScheme = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    salary:{
        type:Number,
        required:true,
    },
    designation:
        {
            type:String,
            required:true,
        },
    Qualification:
        {
            type:String,
            required:true,
        },
    experienceInYears:
        {
            type:Numbber,
           default:0
        },
    workingInHospital:[{
          type:mongoose.Schema.Types.ObjectId,
          ref:"Hospital"
    }]

  
},{timestamps:true})


export const Doctor = mongoose.model("Doctor",DoctorScheme)

