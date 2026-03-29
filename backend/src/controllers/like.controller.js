import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";



const toggleVideoLike = asyncHandler(async(req,res) =>{
// Extract videoId from req.params and userId from req.user.
// Validate that videoId exists.
// Check Like collection for { likedBy: userId, video: videoId }.
// If document exists → delete it (unlike video).
// If document does not exist → create a new like document.
// Return success response.

    const {videoId} = req.params
    const userId = req.user?._id

    if(!videoId){
        throw new ApiError(400,"videoId is missing")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const existingVideoLike = await Like.findOne({
        likedBy :userId,
        video :videoId
    })

    if(existingVideoLike){
        await Like.findByIdAndDelete(existingVideoLike._id)
        return res.status(200)
        .json(new ApiResponse(200,{},"Video Unliked successfully"))
    }

    const Videolike = await Like.create({
        likedBy:userId,
        video:videoId
    })

     return res.status(200)
     .json(
        new ApiResponse(200, Videolike, "Video liked successfully")
    )

})


const toggleCommentLike = asyncHandler(async(req,res) =>{
// Extract commentId from req.params and userId from req.user.
// Validate that commentId exists.
// Check Like collection for { likedBy: userId, comment: commentId }.
// If document exists → delete it (unlike comment).
// If document does not exist → create a new like document.
// Return success response.

    const {commentId} = req.params
    const userId = req.user?._id

    if(!commentId){
        throw new ApiError(400,"commentId is missing")
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const existingCommentLike = await Like.findOne({
        likedBy:userId,
        comment:commentId
    })

    if(existingCommentLike){
        await Like.findByIdAndDelete(existingCommentLike._id)

         await Comment.findByIdAndUpdate(commentId, {
            $inc: { likesCount: -1 }
        });

        return res.status(200)
        .json(new ApiResponse(200,{},"comment unliked successfully"))
    }

    const CommentLike = await Like.create({
        likedBy :userId,
        comment :commentId
    })

     await Comment.findByIdAndUpdate(commentId, {
        $inc: { likesCount: 1 }
    }, { new: true });

   return res.status(200)
    .json(new ApiResponse(200,CommentLike,"comment liked successfully"))
})


const toggleTweetLike = asyncHandler(async(req,res) =>{
// Extract tweetId from req.params and userId from req.user.
// Validate that tweetId exists.
// Check Like collection for { likedBy: userId, tweet: tweetId }.
// If document exists → delete it (unlike tweet).
// If document does not exist → create a new like document.
// Return success response.

    const {tweetId} = req.params
    const userId = req.user?._id

    if(!tweetId){
        throw new ApiError(400,"tweetId is missing")
    }

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const existingTweetLike =await Like.findOne({
        likedBy:userId,
        tweet:tweetId
    })

    if(existingTweetLike){
        await Like.findByIdAndDelete(existingTweetLike._id)
        return res.status(200)
        .json(new ApiResponse(200,{},"Tweet unliked successfully"))
    }

    const TweetLike = await Like.create({
        likedBy:userId,
        tweet:tweetId
    })

    return res.status(200)
    .json(new ApiResponse(200,TweetLike,"tweet liked successfully"))
})


const getLikedVideos = asyncHandler(async(req,res) =>{
// Extract userId from req.user.
// Use aggregation to match likes where likedBy = userId and video ≠ null.
// Join videos collection using $lookup.
// Use $unwind to convert video array to object.
// Use $project to return required video fields.
// Return the list of liked videos.

    const userId = req.user?._id

    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy: new mongoose.Types.ObjectId(userId),
                video: {$ne :null}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"likedVideo"
            }
        },
        {
            $unwind:"$likedVideo"
        },
        {
            $project:{
                _id:0,
                videoId:"$likedVideo._id",
                thumbnail:"$likedVideo.thumbnail",
                title:"$likedVideo.title",
                views:"$likedVideo.views"
            }
        }
    ])

     return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )
})

 


export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}