import mongoose from "mongoose";

const medicalReportScheme = new mongoose.Schema({
    patientId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Patient"
    },
    CheckByDoctor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Doctor"
    },
    Hospital:{
         type:mongoose.Schema.Types.ObjectId,
        ref:"Hospital",
    },
    medicens:[{
        type:String
    }],

},{timestamps:true})


export const MedicalReport = mongoose.model("MedicalReport",medicalReportScheme)

