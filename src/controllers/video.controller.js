import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model";
import { Video } from "../models/video.model";
import {Like} from "../models/like.model.js"
import {Comment} from "../models/comment.model.js"
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";

//we will use dynamic pipeline beacuse some filters may not exist , ex -GET /videos,GET /videos?query=node, GET /videos?userId=123, GET /videos?query=node&userId=123

const getAllVideos = asyncHandler(async(req,res) =>{
// Get query params
// Create aggregation pipeline.
// If query exists → search title using $regex.
// If userId exists → filter by owner.
// $lookup owner info from users.
// Convert owner array → object.
// Apply $sort.
// Use aggregatePaginate.
// Return paginated videos.
    const {page = 1,limit =10,query,sortBy = "views",sortType="desc",userId} = req.query

    const pipeline = []

   const matchStage = {}

    // show only published videos for public users
    if (!userId || userId !== req.user?._id?.toString()) {
        matchStage.isPublished = true
    }
    if (query) {
        matchStage.title = { $regex: query, $options: "i" }
    }

    // filter by owner
    if (userId) {

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid userId")
        }

        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    // add match stage
    pipeline.push({ $match: matchStage })

    //join owner info
    pipeline.push({
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner",
            pipeline:[{
                $project:{
                    username:1,
                    fullName:1,
                    avatar:1
                }
            }]
        }
    },
    {
        $addFields:{
            owner:{$first:"$owner"}
        }
    })

    const allowedSortFields = ["views","createdAt","duration"]

const sortField = allowedSortFields.includes(sortBy)
    ? sortBy
    : "views"

    const sortOrder = sortType === "asc" ? 1 : -1


    pipeline.push({
        $sort:{
            [sortField]:sortOrder
        }
    })

    const options ={
        page : parseInt(page),
        limit :parseInt(limit)
    }

    const videos = await Video.aggregatePaginate(
        Video.aggregate(pipeline),
        options
    )


    return res
    .status(200)
    .json(new ApiResponse(200,videos,"all videos fetched successfully"))


})

const getVideoFeed = asyncHandler(async (req, res) => {

    const userId = req.user?._id

    const pipeline = [

        {
            $match: {
                isPublished: true
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },

        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },

        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },

        {
            $addFields: {
                commentsCount: { $size: "$comments" }
            }
        }

    ]


    // personalized stages
    if (userId) {

        pipeline.push({
            $lookup: {
                from: "subscriptions",
                localField: "owner._id",
                foreignField: "channel",
                as: "subscribers"
            }
        })

        pipeline.push({
            $addFields: {
                channelSubscriberCount: { $size: "$subscribers" },
                isSubscribed: {
                    $in: [
                        new mongoose.Types.ObjectId(userId),
                        "$subscribers.subscriber"
                    ]
                }
            }
        })

    }


    // always remove heavy arrays
    pipeline.push({
        $project: {
            comments: 0,
            subscribers: 0
        }
    })


    pipeline.push(
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $limit: 20
        }
    )



    const videos = await Video.aggregate(pipeline)

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Video feed fetched successfully"
        )
    )

})

const publishAVideo = asyncHandler(async(req,res) =>{
// Get title, description from req.body.
// Validate required fields.
// Get videoFile and thumbnail paths from req.files.
// Upload both to Cloudinary.
// Validate uploads succeeded.
// Create video document in DB:
// owner (req.user._id)

    const {title,description} = req.body

    if(!title || !description){
        throw new ApiError(400,"title and description are required")
    }

   

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if(!videoFileLocalPath){
        throw new ApiError(400,"video file is required")
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail file is required")
    }

    const videoUpload = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoUpload) {
        throw new ApiError(500, "Error while uploading video")
    }

    if (!thumbnailUpload) {
        throw new ApiError(500, "Error while uploading thumbnail")
    }



    const video = await Video.create({
        videoFile: {
            url: videoUpload.secure_url,
            public_id: videoUpload.public_id
        },
        thumbnail: {
            url: thumbnailUpload.secure_url,
            public_id: thumbnailUpload.public_id
        },
        title,
        description,
        duration:videoUpload?.duration||0,
        owner:req.user._id
    })

      return res.status(201).json(
        new ApiResponse(
            201,
            video,
            "Video published successfully"
        )
    )
})



const getVideoById = asyncHandler(async(req,res)=>{
// Get videoId from req.params.
// Validate ObjectId.
// Use aggregation to:
// match video
// lookup owner info.
// Check if video exists.
// Increase views using $inc.
// Add video to user watchHistory using $addToSet.
// Return video.
    const {videoId} = req.params

    if(!videoId ||!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"invalid video id")
    }

    const videoObjectId = new mongoose.Types.ObjectId(videoId)

    const video = await Video.aggregate([
        {
            $match:{
                _id :videoObjectId
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[{
                    $project:{
                        username:1,
                        fullName:1,
                        avatar:1
                    }
                }]
            }
        },
        {
            $addFields:{
                owner :{$first:"$owner"}
            }
        }
    ])

    let isLikedByUser = false

    if (req.user?._id) {
        const like = await Like.findOne({
            video: videoId,
            likedBy: req.user._id
        })

        if (like) {
            isLikedByUser = true
        }
    }

    if(!video.length){
        throw new ApiError(404,"video not found")
    }

    if(!video[0].isPublished && video[0].owner?._id?.toString() !== req.user?._id?.toString()){
    throw new ApiError(403,"Video is not published")
}

    await Video.findByIdAndUpdate(
        videoId,{
            $inc:{views:1}
        }
    )

   if (req.user?._id) {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull:{watchHistory:videoId}
        }
    )

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $push:{
                watchHistory:{
                    $each:[videoId],
                    $position:0,
                    $slice:50
                }
            }
        }
    )

}

       return res.status(200).json(
        new ApiResponse(
            200,
            {...video[0],isLikedByUser},
            "Video fetched successfully"
        )
    )

})


const updateVideo = asyncHandler(async(req,res)=>{
// Algorithm
// Get videoId from params.
// Validate ObjectId.
// Find video in DB.
// Check if video exists.
// Check if current user is owner.
// Get updated title, description.
// If new thumbnail uploaded:
// upload to Cloudinary
// delete old thumbnail.
// Update video fields.
// Save video.
// Return updated video.

    const {videoId} = req.params
    const {title,description} = req.body

    if( !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"video id invalid while updating details")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video not found while updating details")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"you are not allowed to update this video")
    }

    if(!title && !description && !req.file){
        throw new ApiError(400,"at least one field must be updated")
    }

    if(title){
        video.title = title
    }

    if(description){
        video.description = description
    }

    const thumbnailLocalPath = req.file?.path
    
    if(thumbnailLocalPath){
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if(!uploadedThumbnail){
            throw new ApiError(500,"thumbnail uplaod failed")
        }

        if(video.thumbnail?.public_id){
            await deleteFromCloudinary(video.thumbnail.public_id)
        }

        video.thumbnail = {
            url: uploadedThumbnail.secure_url,
            public_id: uploadedThumbnail.public_id
        }
    }

    await video.save()

     return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video updated successfully"
        )
    )


})


const deleteVideo = asyncHandler(async(req,res) =>{
// Algorithm
// Get videoId.
// Validate ObjectId.
// Find video.
// Check if video exists.
// Verify owner.
// Delete video file from Cloudinary.
// Delete thumbnail from Cloudinary.
// Delete video document from DB.
// Return success response.

    const {videoId} = req.params

    if( !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"invalid video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video not found while deleting")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"you are not allowed to delete this video")
    }

    if(video.videoFile?.public_id){
        await deleteFromCloudinary(video.videoFile.public_id,"video")
    }

    if(video.thumbnail?.public_id){
        await deleteFromCloudinary(video.thumbnail.public_id,"image")
    }

    await Promise.all([
    Comment.deleteMany({video:videoId}),
    Like.deleteMany({video:videoId}),
    Playlist.updateMany({videos:videoId},{$pull:{videos:videoId}}),
    User.updateMany({watchHistory:videoId},{$pull:{watchHistory:videoId}})
])

    await Video.findByIdAndDelete(videoId)

       return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Video deleted successfully"
        )
    )

})


const togglePublishStatus = asyncHandler(async(req,res) =>{
// Algorithm
// Get videoId.
// Validate ObjectId.
// Find video.
// Check if video exists.
// Verify owner.
// Toggle status:
// isPublished = !isPublished
// Save video.
// Return updated status.

     const {videoId} = req.params

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"invalid video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video not found ")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"you are not allowed to modify this video")
    }

    video.isPublished = !video.isPublished

    await video.save()

    return res.status(200)
    .json(new ApiResponse(200,video,`Video ${video.isPublished ?"published":"unpublished"} successfully`))

})




export {getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getVideoFeed
};