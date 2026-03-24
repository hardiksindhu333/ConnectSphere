import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";



const toggleSubscription = asyncHandler(async(req,res) =>{
// Extract channelId from req.params and userId from req.user.
// Validate that channelId exists.
// Check in Subscription collection if { subscriber: userId, channel: channelId } exists.
// If it exists → delete the subscription (unsubscribe).
// If it does not exist → create a new subscription document (subscribe).
// Return success response.

    const {channelId} = req.params
    const userId = req.user?._id

    if(!channelId){
        throw new ApiError(400,"channelId is missing")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber:userId,
        channel:channelId
    })

    if(existingSubscription){
        await Subscription.findByIdAndDelete(existingSubscription._id)
        return res.status(200).json(
            new ApiResponse(200, {}, "Unsubscribed successfully")
    )
    }

    const subscription = await Subscription.create({
        subscriber:userId,
        channel:channelId
    })

    return res.status(200).json(
        new ApiResponse(200,{},"subscribed successfully")
    )

    

})



const getUserChannelSubscribers = asyncHandler(async(req,res) =>{
// Extract channelId from req.params.
// Validate that channelId exists.
// Query Subscription collection where channel = channelId.
// Populate subscriber details from User collection.
// Return the list of subscribers.

    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400,"channelId is missing")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber"
            }
        },
        {
            $unwind:"$subscriber"
        },
        {
            $project:{
                _id:0,
                subscriberId:"$subscriber._id",
                username:"$subscriber.username",
                avatar:"$subscriber.avatar"
            }
        }
    ])

    const subscriberCount = subscribers.length

    return res.status(200).json(
        new ApiResponse(200, {
            subscriberCount,
            subscribers
        }, "Subscribers fetched successfully")
    )
})


const getSubscribedChannels = asyncHandler(async(req,res) =>{
// Extract subscriberId from req.params.
// Validate that subscriberId exists.
// Query Subscription collection where subscriber = subscriberId.
// Populate channel details from User collection.
// Return the list of subscribed channels.

    const {subscriberId} = req.params

    if(!subscriberId){
        throw new ApiError(400,"invalid or no subscriberId")
    }

    const subscribedChannel = await Subscription.aggregate([
        {
            $match:{
                subscriber :new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"subscribedChannel"
            }
        },
        {
            $unwind:"$subscribedChannel"
        },
        {
            $project:{
                channelId: "$subscribedChannel._id",
                username: "$subscribedChannel.username",
                avatar: "$subscribedChannel.avatar"
            }
        }
    ])

       return res.status(200).json(
        new ApiResponse(200, subscribedChannel, "Subscribed channels fetched successfully")
    )

})


export {toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}