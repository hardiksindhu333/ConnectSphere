import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.post("/", verifyJWT, createPlaylist);


router.get("/user/:userId", getUserPlaylist);


router.get("/:playlistId", getPlaylistById);


router.post("/:playlistId/add/:videoId", verifyJWT, addVideoToPlaylist);


router.delete("/:playlistId/remove/:videoId", verifyJWT, removeVideoFromPlaylist);


router.patch("/:playlistId", verifyJWT, updatePlaylist);


router.delete("/:playlistId", verifyJWT, deletePlaylist);


export default router;