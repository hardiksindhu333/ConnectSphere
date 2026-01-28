import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"

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
});

return res.status(201).json(
   new ApiResponse(200, createdUser, "User registered Successfully") 
);



export {registerUser}