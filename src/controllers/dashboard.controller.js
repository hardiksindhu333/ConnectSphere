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
// 1. Get userId

// 2. Read query params:
//    → page (default = 1)
//    → limit (default = 10)

// 3. Calculate:
//    → skip = (page - 1) * limit

// 4. Aggregate:
//    → match user's videos
//    → sort latest first
//    → skip
//    → limit

// 5. Add:
//    → likesCount
//    → commentsCount

// 6. Also get total count of videos

// 7. Return:
//    → videos
//    → pagination info

    const userId = new mongoose.Types.ObjectId(req.user?._id)
    if(!userId){
        throw new ApiError(404,"user not found")
    }

    const page = parseInt(req.query.page) ||1
    const limit = parseInt(req.query.limit) ||10

    const skip = (page-1)*10

    const videos = await Video.aggregate([
        {
            $match:{owner:userId}
        },
        { $sort: { createdAt: -1 } },

        { $skip: skip },
        { $limit: limit },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"video",
                as:"comments"
            }
        },
        {
            $addFields:{
                likesCount:{$size:"$likes"},
                commentsCount:{$size:"$comments"}
            }
        },
        {
            $project:{
                title:1,
                description:1,
                views:1,
                createdAt:1,
                likesCount:1,
                commentsCount:1,
                thumbnail:1
            }
        },
        
    ])

    const totalVideos = await Video.countDocuments({ owner: userId });


    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            pagination: {
                totalVideos,
                currentPage: page,
                totalPages: Math.ceil(totalVideos / limit),
                limit
            }
        }, "Channel videos fetched successfully")
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }