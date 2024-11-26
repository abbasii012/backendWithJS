import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

const generateAccessTokenAndRefreseToken = async (userId)=>{
        try {
               const user = await  User.findById(userId)
              const accessToken = user.generateAccessToken()
              const refreshToken = user.generateRefreshToken()
              user.refreshToken = refreshToken
               await  user.save({validateBeforeSave:false})

               return {accessToken,refreshToken}
              
        } catch (error) {
                throw new ApiError(500,"something went wrong while access and Refresh Token")
 
        }
}
const registerUser = asyncHandler(async (req,res)=>{
        //get user from frontend
        //validation -- not empty
        // check if user is already exits: username , email 
        // check for images,check for avatar
        // upload them to cloudinary,avatar
        // create user object - create entry in db
        // remove password and refresh token field from response
        // check for user creation
        // return res

       const {username,email,fullName,password} = req.body

       if([
        username,email,fullName,password
       ].some((field)=>(field?.trim() === "") 
       )
)
{
        throw new ApiError(400,"All field is required");
        
}

        const existingUser =  await User.findOne({
        $or:[{email,username}]
})
if(existingUser){
        throw new ApiError(409,"user with username or email alreday exits")
}

const avatarLocalPath = req.files?.avatar[0]?.path
// const CoverImageLocalPath = req.files?.coverImage[0]?.path
let coverImageLocalPath;
 
if(req.files && Array.isArray(req.files.coverImage)
         && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
}

if (!avatarLocalPath) {
        throw new ApiError(400,"avatar is required")
}
   
const avatar = await uploadonCloudinary(avatarLocalPath);
const coverImage = await uploadonCloudinary(coverImageLocalPath)
if (!avatar) {
        throw new ApiError(400,"avatar is required")
}

const user =  await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
})
const createduser =  await User.findById(user._id).select(
        "-password -refreshToken"
)
if (!createduser) {
        throw new ApiError(500,"error in createduser or something went wrong during registedr user")
   
}

 return res.status(201).json(
        new ApiResponce(200,createduser,"user registed scucessfully")
 )
})

const loginUser = asyncHandler(async (req,res)=>{
    //res -> body 
    // username or email 
    // find the user 
    // checking passwords 
    // access and refresh token 
    // send cookies
    const {username,email,password} = req.body

    if(!(username || email)){
       throw new ApiError(400,"username or Email is not valid ")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"user does not exit")
    }

    const ispasswordValid = await user.isPasswordCorrect(password)
    
    
   
   
   

    if(!ispasswordValid){
        throw new ApiError(404,"invalid user crenditails")
    }

    const {accessToken,refreshToken} =
    await generateAccessTokenAndRefreseToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password","-refreshToken")

   const options ={
        httpOnly:true,
        secure : true,
   }

   return res
   .status(200)
   .cookie("acessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
        new ApiResponce(
                200,
                {
                        user: loggedInUser,accessToken,refreshToken
                },
                "user logged in scucessfully"

        )
   )
})

const logoutUser = asyncHandler(async (req,res)=>{
  User.findByIdAndUpdate(req.user._id ,
        {
                $unset:{
                        refreshToken:1
                }
        },
        {
                new:true,
        }
)

const options ={
        httpOnly:true,
        secure : true,
   }
  return res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
        new ApiResponce(200,null,"user logged out successfully")
  )
} )

const refreshAcessToken = asyncHandler(async (req,res)=>{

       const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken


       if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized user refresh token is missing")
       }
     try {
          const decodedToken = jwt.verify(
           incomingRefreshToken,
           process.env.REFRESH_TOKEN_SECRET)
   
           const user = await User.findById(decodedToken?._id)
   
           if(!user){
               throw new ApiError(401,"invalid refresh token")
           }
   
           if(user?.refreshToken !== incomingRefreshToken){
               throw new ApiError(401,"invalid refresh token or Expired refresh token")
           }
           const options ={
                   httpOnly:true,
                   secure : true,
              }
           const {accessToken,newRefreshToken} = await generateAccessTokenAndRefreseToken(user._id)
   
           return res
      .status(200)
      .cookie("acessToken",accessToken,options)
      .cookie("refreshToken",newRefreshToken,options)
      .json(
           new ApiResponce(
           200,
           {
               accessToken,refreshToken:newRefreshToken
           },
           "access token generated successfully"
           )
      )
     } catch (error) {
        throw new ApiError(500,"something went wrong while generating access token")
     }




})
const changeCurrentPassword = asyncHandler(async (req,res)=>{
     const {oldPassword,newPassword} = req.body

     const user = await User.findById(req.user._id)
    
    const passwordCorrect = await user.isPasswordCorrect(oldPassword)
     if(!passwordCorrect){
        throw new ApiError(400,"old password is incorrect")
     } 
     user.password = newPassword
     await user.save({validateBeforeSave:false})
     return res.status(200).json(
        new ApiResponce(200,{},"password updated successfully")
     )
})

const getCurrentUser = asyncHandler(async (req,res)=>{
     return res.status(200).json(
       new ApiResponce(new ApiResponce(200,req.user,"user details fetched successfully")) )
})

const updateUserInfo = asyncHandler(async (req,res)=>{
     const {fullName,email} = req.body
     if(!fullName && !email){
        throw new ApiError(
                new ApiResponce(400,"fullName and email are required")
        )
}
const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
                $set:{
                        fullName,
                        email:email
                }
        },
        {new:true})

return res.status(200).json(
        new ApiResponce(200,updatedUser,"user details updated successfully")
)
})

const updateUserAvatar = asyncHandler(async (req,res)=>{
  const avatarLocalPath = req.files?.path
  if(!avatarLocalPath){
    throw new ApiError(400,"avatar is required")
  }
  // todo : delete the old avatar from cloudinary
  const avatar = await uploadonCloudinary(avatarLocalPath)
  if(!avatar.url){
    throw new ApiError(500,"failed to upload avatar on cloudinary")
  }
  const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
    {
        $set:
        {avatar:avatar.url}
    },
    {new:true}).select("-password") 
  return res.status(200).json(
        new ApiResponce(200,updatedUser,"avatar updated successfully")
  )
})

const updateCoverImage = asyncHandler(async (req,res)=>{
        const coverImageLocalPath = req.files?.path
        if(!coverImageLocalPath){
          throw new ApiError(400,"avatar is required")
        }
        const coverImage = await uploadonCloudinary(coverImageLocalPath)
        if(!coverImage.url){
          throw new ApiError(500,"failed to upload avatar on cloudinary")
        }
       const updatedUser = await User.findByIdAndUpdate(
              req.user._id,
          {
              $set:
              {coverImage:coverImage.url}
          },
          {new:true}).select("-password")
      return res.status(200).json(
        new ApiResponce(200,updatedUser,"cover image updated successfully")
      )
      })
      

      const getUserChannelProfile = asyncHandler(async (req,res)=>{
         const {username} = req.params
         if(!username?.trim()){
                 throw new ApiError(404,"user not found")
                }
       const channel = await User.aggregate([
        {
                $match:{
                        username:username.toLowerCase()
                }       
        },
        {
                $lookup:{
                        from:"subscriptions",
                        localField:"_id",
                        foreignField:"channel",
                        as:"subscriber"
                }
        },
        {
                $lookup:{
                        from:"subscriptions",
                        localField:"_id",
                        foreignField:"subscribe",
                        as:"subscriberTo"
                }   
        },{
                $addFields:{
                        subscriberCount:{
                                $size:"$subscriber"
                        },
                        subscriberToCount:{
                                $size:"$subscriberTo"
                        },
                        isSubscribed:{
                                $cond:{
                                        if:{$in:[req.user._id,"$subscriber?.subscribe"]},
                                        then:true,
                                        else:false
                                }
                        }
                }
        },{
                $project:{
                      fullName:1,
                      username:1,
                      avatar:1,
                      coverImage:1,
                      subscriberCount:1,
                      subscriberToCount:1,
                      isSubscribed:1
                }
        }
       ])
       if(!channel?.length){
        throw new ApiError(404,"channel not found")
       }
       return res.status(200).json(
        new ApiResponce(200,channel[0],"channel details fetched successfully")
       )
        })
        const getWatchHistory = asyncHandler(async (req,res)=>{
                const user = await User.aggregate([
                        {
                                $match:{_id:new mongoose.Types.ObjectId(req.user._id)

                                }
                        },{

                                $lookup:{
                                        from:"videos",
                                        localField:"watchHistory",
                                        foreignField:"_Id",
                                        as:"watchHistory",
                                        pipeline:[
                                                {
                                                      $lookup:{
                                                        from:"user",
                                                        localField:"owner",
                                                        foreignField:"_id",
                                                        as:"ownwer",
                                                        pipeline:[
                                                                {
                                                                      $project:{
                                                                            fullName:1,
                                                                            username:1,
                                                                            avatar:1
                                                                      }
                                                                }
                                                        ]

                                                      }
                                                },{
                                                        $addFields:{
                                                               owner:{$first:"$owner"}
                                                        }
                                                }
                                        ]
                                }
                        },
                ])
                return res.status(200).json(
                        new ApiResponce(200,user[0].watchHistory,"watch history fetched successfully")
                )
        })
export {
         loginUser,
         logoutUser, 
         registerUser,
         refreshAcessToken,
         changeCurrentPassword,
         getCurrentUser,
         updateUserInfo,
         updateUserAvatar,
         updateCoverImage,
         getWatchHistory,
         getUserChannelProfile,
         };

