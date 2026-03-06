import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";
import {ObjectId} from "mongodb"

// How to register a user step by step :-

// 1. ask user to fill details in frontend(username,email etc.)
// 2. validate these details (format and all)
// 3. check if user already exists or not(show messgae if exists )
// 4. check for image,avatar
// 5. upload them on clodinary(special check on avatar on cloudinary too with multer)
// 6. create user object in db - db entry
// 7. remove password,refreshtoken from response
// 8. check if user created or not
// 9. return response

console.log("👉 registerUser HIT");

const generateAcessTokenandRefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
    
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    const {username, email, password,fullName} = req.body;
    // console.log("email" ,email);

//     if(!username?.trim() || !email?.trim() || !password?.trim() || !fullName?.trim()){
//         throw new ApiError(400,"all feilds are required");
//     }
if (
       [fullName, username, password, email].some(
        (field) => typeof field !== "string" || field.trim() === ""
)
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{username},{email}]
    });

    if(existingUser){
        throw new ApiError(409,"user already exists");
    }

    const avatarLocalpath = req.files?.avatar?.[0]?.path;
    const coverImageLocalpath = req.files?.coverImage?.[0]?.path;
    if(!avatarLocalpath){
        throw new ApiError(400,"avatar file is required");
    }

    console.log("STEP 5: Starting Cloudinary upload");
    console.log("AVATAR LOCAL PATH:", avatarLocalpath);
    console.log("COVER IMAGE LOCAL PATH:", coverImageLocalpath);

    const avatar = await uploadOnCloudinary(avatarLocalpath);
    console.log("AVATAR CLOUDINARY RESPONSE:", avatar);


    if(!avatar){
        throw new ApiError(400,"avatar file is required");
    }

    let coverImage;
    if(coverImageLocalpath){
        console.log("Uploading cover image...");
        coverImage = await uploadOnCloudinary(coverImageLocalpath);
        console.log("COVER IMAGE CLOUDINARY RESPONSE:", coverImage);
    }

    // url → uses HTTP
    // secure_url → uses HTTPS

    console.log("FINAL AVATAR URL:", avatar?.secure_url);
    console.log("FINAL COVER URL:", coverImage?.secure_url);


    const user = await User.create({
        fullName,
        username:username.toLowerCase(),
        email,
        password,
        avatar:{
            url:avatar.secure_url,
            public_id :avatar.public_id
        } ,
        coverImage: coverImage
            ? {
                url: coverImage.secure_url,
                public_id: coverImage.public_id
            }
            : undefined
    }) ;

    if(!user){
        throw new ApiError(500,"User registration failed");
    }

    const createdUser = await User.findById(user._id).select("-password -refreshToken")


    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    console.log("👉 SENDING RESPONSE");


return res.status(201).json(
   new ApiResponse(200, createdUser, "User registered Successfully") 
);

});



const loginUser = asyncHandler(async (req,res)=>{
// login the user algo:-
//get the user's detail from frontend
//check if user(email or username) exists
//check password correct or not
//generate access and refresh token
//send cookie
   const {username,email,password} = req.body

   if(!username && !email){
       throw new ApiError(400,"username or email is required");
   }

   const user = await User.findOne({
    $or:[{email},{username}]
   });

   if(!user){
    throw new ApiError(404,"User does not exists");
   }

   const isPasswordvalid = await user.isPasswordCorrect(password);

   if(!isPasswordvalid){
    throw new ApiError(401,"invalid credentials");
   }

   const {accessToken , refreshToken} =await generateAcessTokenandRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
    httpOnly :true,
    secure: false,
    sameSite: "lax"
   }

   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(
        200,
        {
            user:loggedInUser,accessToken,refreshToken
        },
        "User logged in successfully"
    )
   )


})



const logoutUser = asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly:true,
        secure:false
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})



// Gets refresh token from cookie (or body)
// Verify refresh token
// Find user from decoded token
// Match refresh token with DB
// Generate new access + refresh token
// Send new tokens

const refreshAccessToken = asyncHandler(async(req,res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorised request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)

        if(!user){
            throw new ApiError(401,"invalid refresh token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used")
        }

        const {accessToken , refreshToken: newRefreshToken} = await generateAcessTokenandRefreshToken(user._id)

        const options = {
            httpOnly : true,
            secure: false,
            sameSite : "lax"
        }

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(new ApiResponse(200,
            {accessToken,refreshToken : newRefreshToken},
            "accessToken refreshed"
        ))


    } catch (error) {
        throw new ApiError(400,error?.message||"invalid refrsh token")
    }
})



// Get oldPassword
// Verify oldPassword
// Set newPassword
// Save user

const changeCurrentPassword = asyncHandler(async(req,res) =>{
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid old password")
    }

    user.password = newPassword

    await user.save()

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password changed successfully"))
})


// What It Should Do
// Return logged-in user info.

const getCurrentUser = asyncHandler(async(req,res) =>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"User fetched successfully"))
})



// What It Should Do
// Update:
// fullName
// email
// etc

// But NOT:
// password
// refreshToken

const updateAccountDetails = asyncHandler(async(req,res) =>{

    const {fullName,email} = req.body
    if(!fullName || !email){
        throw new ApiError(400,"all fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {fullName,email}
        },
        {
            new: true
        })
        .select("-password -refreshToken")

        return res
        .status(200)
        .json(new ApiResponse(200,user,"account updated successfully"))

})



// Get file from multer
// Upload to cloudinary
// Update user avatar field
// Delete old image (optional advanced)

const updateUserAvatar = asyncHandler(async(req,res) =>{
    const avatarLocalpath = req.file?.path

    if(!avatarLocalpath){
        throw new ApiError(400,"avatar file missing while updating")
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath)

    if(!avatar?.secure_url){
        throw new ApiError(400,"error while uploading on avatar")
    }

    const olduser = await User.findById(req.user._id).select("avatar")

    if (!olduser) {
        throw new ApiError(404, "User not found");
    }

    if(olduser?.avatar?.public_id){
        await deleteFromCloudinary(olduser.avatar.public_id)
    }

    const updatedUser = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:{
                    url:avatar.secure_url,
                    public_id:avatar.public_id
                }
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200,updatedUser,"avatar updated succesfully"))

})




const updateUserCoverImage = asyncHandler(async(req,res) =>{
    const coverImageLocalpath = req.file?.path

    if(!coverImageLocalpath){
        throw new ApiError(400,"coverImage file missing while updating")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalpath)

    if(!coverImage?.secure_url){
        throw new ApiError(400,"error while uploading cover image")
    }

    const olduser = await User.findById(req.user._id).select("coverImage")

    if (!olduser) {
        throw new ApiError(404, "User not found");
    }

    if(olduser?.coverImage?.public_id){
        await deleteFromCloudinary(olduser.coverImage.public_id)
    }

    const updatedUser = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage:{
                    url:coverImage.secure_url,
                    public_id:coverImage.public_id
                }
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200,updatedUser,"coverImage updated succesfully"))

})



const getUserChannelProfile = asyncHandler(async(req,res) =>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

     const loggedInUserId = req.user?._id
    ? new ObjectId(req.user._id)
    : null;

    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size: "$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed: loggedInUserId
                ? {
                    $in: [loggedInUserId, "$subscribers.subscriber"]
                    }
                : false
            }
        },
        {
            $project:{
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

      if (!channel.length) {
        throw new ApiError(404, "Channel does not exist");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      channel[0],
      "User channel fetched successfully"
    )
  )
}
)


// Get logged-in user id
// Find that user using $match
// $lookup videos from videos collection
// $lookup owner from users collection
// Clean response using $project

const getWatchHistory = asyncHandler(async(req,res) =>{
    const userID = new ObjectId(req.user._id)

    const user = await User.aggregate([
        {
            $match:{
                _id: userID
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner :{$first :"$owner"}
                        }
                    }

                ]
            }
        }
    ])

    if(!user.length){
        throw new ApiError(404,"User not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully"))
})


export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory}