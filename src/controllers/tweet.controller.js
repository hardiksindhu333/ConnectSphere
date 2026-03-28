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
})

const deleteTweet = asyncHandler(async (req, res) => {

// Get tweetId
// Find tweet
// Check ownership
// Delete tweet
// Return success response
})






