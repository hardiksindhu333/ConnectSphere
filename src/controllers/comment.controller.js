import { User } from "../models/user.model";
import mongoose from "mongoose";
import { Comment } from "../models/comment.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Video } from "../models/video.model";
import { use } from "react";

const addComment = asyncHandler(async(req,res) =>{
// Extract videoId and content, validate both.
// Create comment with { content, video, owner }.
// Return created comment.

    const {videoId} = req.params
    const {content} = req.body

    const userId = req.user?._id

    if(!videoId || !content?.trim()){
        throw new ApiError(400,"videoId and content are required")
    }

    const comment = await Comment.create({
        content,
        video:videoId,
        owner:userId
    })

    return res.status(200)
    .json(new ApiResponse(200,comment,"comment added successfully"))

})


const getVideoComments = asyncHandler(async(req,res) =>{

})

// getVideoComments
// Extract videoId.
// Match comments where video = videoId.
// Lookup owner (user details).
// Unwind owner.
// Project required fields.
// Return comments list.


const updateComment = asyncHandler(async(req,res) =>{
    
})

// 🔹 updateComment
// Extract commentId and content.
// Validate inputs.
// Find comment by ID.
// Check if logged-in user is owner.
// Update content.
// Return updated comment.


const deleteComment = asyncHandler(async(req,res) =>{
    
})

// deleteComment
// Extract commentId.
// Validate input.
// Find comment.
// Check ownership.
// Delete comment.
// Return success response.



export {addComment}