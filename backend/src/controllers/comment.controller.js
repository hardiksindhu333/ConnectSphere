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

    if (!videoId) {
        throw new ApiError(400, "videoId is missing");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    // Fetch all comments for the video and populate owner
    const allComments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })
        .populate("owner", "username avatar")
        .lean();

    // Build a map of comments and nest replies under their parents
    const map = new Map();
    allComments.forEach((c) => {
        map.set(String(c._id), { ...c, replies: [] });
    });

    const roots = [];
    for (const c of allComments) {
        if (c.parentComment) {
            const parent = map.get(String(c.parentComment));
            if (parent) parent.replies.push(map.get(String(c._id)));
            else roots.push(map.get(String(c._id))); // fallback
        } else {
            roots.push(map.get(String(c._id)));
        }
    }

    return res.status(200).json(
        new ApiResponse(200, roots, "Comments fetched successfully")
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