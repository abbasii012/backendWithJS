import mongoose ,{Mongoose, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({
   videFile:{
    type:String,
    required: true,
   },
   thumnail:{
    type:String,
    required: true,
   },
   title:{
    type:String,
    required: true,
   },
   description:{
    type:String,
    required: true,
   },
   
   duration:{
    type:Number,
    required:true
   },
   views:{
    type:Number,
    default:0
   },
  
   isPublished:{
    type:Boolean,   
   },
   owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
   }
},
{
    timestamps:true
})

videoSchema.plugin(mongooseAggregatePaginate)
export const Videos = Mongoose.model("Videos",videoSchema)