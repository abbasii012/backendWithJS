import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";

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
    const {username,email,password,} = req.body

    if(!username || !email){
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


export { loginUser, registerUser };
