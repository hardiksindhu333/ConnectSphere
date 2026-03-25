import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Video} from "../models/video.model.js"
import {Subscription, subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"

const getChannelStats = asyncHandler(async(req,res) =>{
// 1. Get logged-in userId

// 2. From Video collection:
//    → filter videos where owner = userId
//    → count totalVideos
//    → sum totalViews

// 3. From Subscription collection:
//    → count where channel = userId

// 4. From Like collection:
//    → join with videos
//    → filter videos owned by user
//    → count likes

// 5. Return all stats

    const userId = new mongoose.Types.ObjectId(req.user?._id)

    if(!userId){
        throw new ApiError(404,"user not found")
    }

    const videoStats = await Video.aggregate([
        {
            $match:{owner:userId}
        },
        {
            $group:{
                _id:null,
                totalVideos:{$sum:1},
                totalviews:{$sum:"$views"}
            }
        }
    ])

    const totalSubscribers = await Subscription.countDocuments({
        channel:userId
    })

    const totalLikes = await Like.aggregate([
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video"
            }
        },
        {
            $unwind:"$video"
        },
        {
            $match:{"$Video.owner":userId}
        },
        {
            $count:"totalLikes"
        }
    ])

      return res.status(200).json(
        new ApiResponse(200, {
            totalVideos: videoStats[0]?.totalVideos || 0,
            totalViews: videoStats[0]?.totalViews || 0,
            totalSubscribers,
            totalLikes: totalLikes[0]?.totalLikes || 0
        }, "Channel stats fetched successfully")
    );


})


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }