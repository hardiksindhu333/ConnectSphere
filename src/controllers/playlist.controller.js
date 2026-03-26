import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async(req,res) =>{
// 1. Take name, description from request body

// 2. Validate:
//    → name should not be empty

// 3. Create new playlist:
//    → name
//    → description
//    → owner = logged-in user (req.user._id)
//    → videos = empty array

// 4. Save to DB

// 5. Return created playlist

    const {name,description} = req.body

    if(!name?.trim()){
        throw new ApiError(400,"playlist name is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner : req.user._id,
        videos :[]
    })

    return res.status(201)
    .json(new ApiResponse(201,playlist,"playlist created successfully"))
})




const getUserPlaylist = asyncHandler(async(req,res) =>{

// 1. Get userId from params

// 2. Read query params:
//    → page (default = 1)
//    → limit (default = 10)
//    → search (optional)

// 3. Create filter:
//    → owner = userId
//    → if search exists:
//         filter.name = regex(search, case-insensitive)

// 4. Calculate:
//    → skip = (page - 1) * limit

// 5. Fetch playlists:
//    → apply filter
//    → sort by createdAt (latest first)
//    → skip
//    → limit

// 6. Count total playlists

// 7. Return:
//    → playlists list
//    → pagination info

    const {userId} = req.params

    if(!userId){
        throw new ApiError(404,"User not found")
    }

    const page = parseInt(req.query.page) ||1
    const limit = parseInt(req.query.limit) ||10
    const search = req.query.search ||""

    const skip = (page-1)*limit

    const filter = {owner:userId}

    if(search){
        filter.name = {$regex:search,$options:"i"}
    }

    const playlists = await Playlist.find(filter)
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)

    const totalPlaylists = await Playlist.countDocuments(filter)

    return res.status(200)
    .json(new ApiResponse(200,
        {playlists,
            pagination: {
                totalPlaylists,
                currentPage:page,
                totalPages:Math.ceil(totalPlaylists/limit) ||1}},
                "Users playlist fetched successfully"
            ))
})


const getPlaylistById = asyncHandler(async(req,res) =>{
//    1. Get playlistId from params

// 2. Convert to ObjectId

// 3. Aggregate:

//    → Match playlist by _id

//    → Lookup videos:
//         from videos collection
//         match playlist.videos → video._id

//    → Lookup owner:
//         from users collection
//         match playlist.owner → user._id

//    → Project only required user fields

//    → Convert owner array → object

// 4. If no playlist found → throw error

// 5. Return playlist with videos + owner

    const {playlistId} = req.params

    if(!playlistId){
        throw new ApiError(400,"playlist not found")
    }

    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos"
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                 owner: { $first: "$owner" }
            }
        }
    ])


    if (!playlist.length) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist[0], "Playlist fetched successfully")
    );
})



const addVideoToPlaylist = asyncHandler(async (req, res) => {
// 1. Get playlistId and videoId from params

// 2. Find playlist by ID

// 3. If playlist not found → error

// 4. Check ownership:
//    → playlist.owner === req.user._id

// 5. If not owner → unauthorized error

// 6. Update playlist:
//    → add videoId using $addToSet
//    (prevents duplicates)

// 7. Return updated playlist


    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized action");
    }

    const updated = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { videos: videoId }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updated, "Video added to playlist")
    );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
// 1. Get playlistId and videoId

// 2. Find playlist

// 3. If not found → error

// 4. Check owner

// 5. Remove video using $pull

// 6. Return updated playlist

    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized action");
    }

    const updated = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updated, "Video removed from playlist")
    );
});


const deletePlaylist = asyncHandler(async (req, res) => {

// 1. Get playlistId

// 2. Find playlist

// 3. If not found → error

// 4. Check owner

// 5. Delete playlist

// 6. Return success response

    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized action");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    );
});


const updatePlaylist = asyncHandler(async (req, res) => {

// 1. Get playlistId

// 2. Get name, description from body

// 3. Find playlist

// 4. If not found → error

// 5. Check owner

// 6. Update fields:
//    → name (if provided)
//    → description (if provided)

// 7. Save updated playlist

// 8. Return updated playlist
    const { playlistId } = req.params;
    const { name, description } = req.body;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized action");
    }

    const updated = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name || playlist.name,
                description: description || playlist.description
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updated, "Playlist updated successfully")
    );
});


export {
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};