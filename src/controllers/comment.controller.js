import mongoose from "mongoose";
import { Comment } from "../models/comment.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

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
// Extract videoId.
// Match comments where video = videoId.
// Lookup owner (user details).
// Unwind owner.
// Project required fields.
// Return comments list.
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400,"videoId is missing")
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $unwind:"$owner"
        },
        {
            $project:{
                _id:1,
                content:1,
                createdAt:1,
                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    avatar: "$owner.avatar"
                }
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(200,comments,"fetched comments successfully"))
})




const updateComment = asyncHandler(async(req,res) =>{
// Extract commentId and content.
// Validate inputs.
// Find comment by ID.
// Check if logged-in user is owner.
// Update content.
// Return updated comment.

    const {commentId} = req.params
    const {content} = req.body

    const userId = req.user?._id

    if(!commentId || !content?.trim()){
        throw new ApiError(400,"invalid data")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404,"comment not found")
    }

    if(comment.owner.toString() !== userId.toString()){
        throw new ApiError(403,"unauthorized")
    }

    comment.content = content
    await comment.save()

    return res.status(200)
    .json(new ApiResponse(200,comment,"updated comment successfully"))
})




const deleteComment = asyncHandler(async(req,res) =>{
// Extract commentId.
// Validate input.
// Find comment.
// Check ownership.
// Delete comment.
// Return success response.

    const {commentId} = req.params

    const userId = req.user?._id

    if(!commentId){
        throw new ApiError(404,"comment not found")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404,"comment not found")
    }

    if(comment.owner.toString() !== userId.toString()){
        throw new ApiError(403,"unauthorized")
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(new ApiResponse(200,{},"comment deleted successfully"))
})





export {addComment,
    getVideoComments,
    updateComment,
    deleteComment
}