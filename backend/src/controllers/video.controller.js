import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import {Like} from "../models/like.model.js"
import {Comment} from "../models/comment.model.js"
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

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
    if (!req.user || userId !== req.user._id.toString()) {
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

    const userId = req.user?._id;

    let subscribedChannels = [];

    //  Step 1: Get subscribed channels (FAST, no aggregation)
    if (userId) {
        const subs = await Subscription.find({
            subscriber: userId
        }).select("channel");

        subscribedChannels = subs.map(sub => sub.channel);
    }

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

        //  COMMENTS COUNT
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
    ];

    //  PERSONALIZATION (CLEAN + FAST)
    if (userId) {
        pipeline.push({
            $addFields: {
                isSubscribed: {
                    $in: ["$owner._id", subscribedChannels]
                }
            }
        });
    }

    //  REMOVE HEAVY FIELDS
    pipeline.push({
        $project: {
            comments: 0
        }
    });

    //  SORT (IMPORTANT CHANGE)
    pipeline.push({
        $sort: {
            isSubscribed: -1,   //  SUBSCRIBED FIRST
            createdAt: -1
        }
    });

    pipeline.push({
        $limit: 20
    });

    const videos = await Video.aggregate(pipeline);

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Personalized video feed fetched"
        )
    );
});

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
        owner:req.user._id,
        isPublished: true
    })

      return res.status(201).json(
        new ApiResponse(
            201,
            video,
            "Video published successfully"
        )
    )
})

const getMyVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({
        owner: req.user._id
    }).populate("owner", "fullName");

    return res.status(200).json(
        new ApiResponse(200, videos, "User videos fetched")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    const video = await Video.aggregate([
        {
            $match: { _id: videoObjectId }
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
        }
    ]);

    if (!video.length) {
        throw new ApiError(404, "Video not found");
    }

    const videoData = video[0];

    //  SAFETY CHECK (IMPORTANT)
    if (!videoData.owner || !videoData.owner._id) {
        throw new ApiError(500, "Owner data missing");
    }

    //  LIKE
    let isLikedByUser = false;

    if (req.user?._id) {
        const like = await Like.findOne({
            video: videoId,
            likedBy: req.user._id
        });
        isLikedByUser = !!like;
    }

    //  SUBSCRIBE
    let isSubscribed = false;

    if (req.user?._id) {
        const sub = await Subscription.findOne({
            subscriber: req.user._id,
            channel: videoData.owner._id
        });
        isSubscribed = !!sub;
    }

    const subscriberCount = await Subscription.countDocuments({
        channel: videoData.owner._id
    });

    //  VIEWS
    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    });

    // WATCH HISTORY (YouTube-like: most recent first, de-duped, capped)
    if (req.user?._id) {
        await User.updateOne(
            { _id: req.user._id },
            {
                $pull: { watchHistory: videoObjectId },
            }
        );
        await User.updateOne(
            { _id: req.user._id },
            {
                $push: {
                    watchHistory: {
                        $each: [videoObjectId],
                        $position: 0,
                        $slice: 200
                    }
                }
            }
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...videoData,
                isLikedByUser,
                isSubscribed,
                subscriberCount
            },
            "Video fetched successfully"
        )
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, removeThumbnail } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not allowed");
    }


    if (title) video.title = title;
    if (description) video.description = description;


    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;

    if (videoFileLocalPath) {
        const uploadedVideo = await uploadOnCloudinary(videoFileLocalPath);

        if (!uploadedVideo) {
            throw new ApiError(500, "Video upload failed");
        }

        // delete old video
        if (video.videoFile?.public_id) {
            await deleteFromCloudinary(video.videoFile.public_id, "video");
        }

        video.videoFile = {
            url: uploadedVideo.secure_url,
            public_id: uploadedVideo.public_id,
        };

        video.duration = uploadedVideo?.duration || video.duration;
    }


    if (removeThumbnail === "true") {
        if (video.thumbnail?.public_id) {
            await deleteFromCloudinary(video.thumbnail.public_id, "image");
        }
        video.thumbnail = null;
    }


    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (thumbnailLocalPath) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!uploadedThumbnail) {
            throw new ApiError(500, "Thumbnail upload failed");
        }

        // delete old if exists
        if (video.thumbnail?.public_id) {
            await deleteFromCloudinary(video.thumbnail.public_id, "image");
        }

        video.thumbnail = {
            url: uploadedThumbnail.secure_url,
            public_id: uploadedThumbnail.public_id,
        };
    }

    if (
        !title &&
        !description &&
        !videoFileLocalPath &&
        !thumbnailLocalPath &&
        removeThumbnail !== "true"
    ) {
        throw new ApiError(400, "No fields provided to update");
    }

    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    );
});


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
    getMyVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getVideoFeed
};