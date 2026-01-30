import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

//algo:-

// Read accessToken from cookies

// Verify JWT using secret

// Decode user data from token

// Fetch user from DB

// Attach user to req.user

// Allow request to continue

export const verifyJWT = asyncHandler(async (req,res,next) =>{
    try {
         const token = req.cookies?.accessToken || req.header("Authorisation")?.replace("Bearer","")

        if(!token){
            throw new ApiError(401,"Unauthorised request")
        }

        const decodedtoken = jwt.verify(token,process.env.ACESS_TOKEN_SECRET);

        const user = await User.findById(decodedtoken._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(401,"Invalid access token")
        }

        req.user = user

        next();


    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})

