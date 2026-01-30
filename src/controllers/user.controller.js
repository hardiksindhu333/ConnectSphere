import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

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
        const accessToken = user.accessToken()
        const refreshToken = user.refreshToken()
    
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
       [fullName,username,password,email].some((field) => field?.trim() ==="")
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
        avatar: avatar.secure_url,
        coverImage:coverImage?.secure_url ||""
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
   const [username,email,password] = req.body()

   if(!username || !email){
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

   const loggedInUser = await User.findById(user._id).select("-password -refrehToken")

   const options = {
    httpOnly :true,
    secure: true
   }

   return res.status(200)
   .cookie("accesToken",accessToken,options)
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
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})




export {registerUser}