import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";


//  Add Comment (supports replies + commentsCount)
const addComment = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    const { content, parentComment } = req.body;
    const userId = req.user?._id;

    if (!videoId || !content?.trim()) {
        throw new ApiError(400, "videoId and content are required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId,
        parentComment: parentComment || null
    });

    await Video.findByIdAndUpdate(videoId, {
        $inc: { commentsCount: 1 }
    });

    return res.status(200).json(
        new ApiResponse(200, comment, "comment added successfully")
    );
});


//  Get Video Comments (NO likes aggregation, uses stored likesCount)
const getVideoComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "videoId is missing");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
                parentComment: null
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: (page - 1) * Number(limit)
        },
        {
            $limit: Number(limit)
        },

        //  owner details
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },

        //  replies
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "parentComment",
                as: "replies"
            }
        },

        //  reply owners
        {
            $lookup: {
                from: "users",
                localField: "replies.owner",
                foreignField: "_id",
                as: "replyOwners"
            }
        },

        //  attach owner + likesCount to replies
        {
            $addFields: {
                replies: {
                    $map: {
                        input: "$replies",
                        as: "reply",
                        in: {
                            _id: "$$reply._id",
                            content: "$$reply.content",
                            createdAt: "$$reply.createdAt",
                            likesCount: "$$reply.likesCount",
                            owner: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$replyOwners",
                                            as: "ro",
                                            cond: {
                                                $eq: ["$$ro._id", "$$reply.owner"]
                                            }
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    }
                }
            }
        },

        //  final response
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                likesCount: 1,   //  from DB (no aggregation)
                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    avatar: "$owner.avatar"
                },
                replies: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    );
});


//  Update Comment
const updateComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!commentId || !content?.trim()) {
        throw new ApiError(400, "invalid data");
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "comment not found");
    }

    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "unauthorized");
    }

    comment.content = content;
    await comment.save();

    return res.status(200).json(
        new ApiResponse(200, comment, "updated comment successfully")
    );
});


//  Delete Comment (handles replies count properly)
const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!commentId) {
        throw new ApiError(404, "comment not found");
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "comment not found");
    }

    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "unauthorized");
    }

    //  count replies
    const repliesCount = await Comment.countDocuments({
        parentComment: commentId
    });

    await Comment.deleteMany({
        parentComment: commentId
    });

    await Comment.findByIdAndDelete(commentId);

    //  decrement total (parent + replies)
    await Video.findByIdAndUpdate(comment.video, {
        $inc: { commentsCount: -(1 + repliesCount) }
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "comment deleted successfully")
    );
});


export {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment
};