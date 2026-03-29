import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createTweet = asyncHandler(async(req,res) =>{
// Get content from request body
// Validate content (not empty)
// Get user ID from req.user
// Create tweet in DB:
// owner = userId
// content
// Return created tweet

    const {content} = req.body

    if(!content || content.trim() ===""){
        throw new ApiError(400,"content required for tweet")
    }

    const userId = req.user._id

    const tweet = await Tweet.create({
        content :content.trim(),
        owner :userId
    })

     return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    );
})





const getUserTweets = asyncHandler(async (req, res) => {
// Get userId from params
// Get page and limit from query
// Create aggregation:
// Match tweets of that user
// Sort by latest
// Lookup user details
// Apply pagination using aggregate paginate
// Return tweets

    const {userId} = req.params
    const {page =1,limit =10} = req.query

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"invalid user id")
    }

    const aggregate = Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort:{createdAt :-1}
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
                content: 1,
                likesCount: 1,
                createdAt: 1,
                owner: {
                    _id: 1,
                    username: 1,
                    avatar: 1
            }
        }
    }

    ])

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const tweets = await Tweet.aggregatePaginate(aggregate,options)

     return res.status(200).json(
        new ApiResponse(200, tweets, "User tweets fetched successfully")
    );

})

const updateTweet = asyncHandler(async (req, res) => {
// Get tweetId from params
// Get content from body
// Validate content
// Find tweet
// Check:
// Tweet exists
// Logged-in user is owner
// Update content
// Save
// Return updated tweet

    const {tweetId} = req.params
    const {content} = req.body

    if(!content || content.trim ===""){
        throw new ApiError(400,"content is required")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"tweet not found")
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"unauthorised access")
    }

    tweet.content = content.trim();
    await tweet.save();

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    );
})

const deleteTweet = asyncHandler(async (req, res) => {
// Get tweetId
// Find tweet
// Check ownership
// Delete tweet
// Return success response

    const {tweetId} = req.params

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"tweet not found")
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"unauthorised access")
    }

     await tweet.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
})



export{
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}


