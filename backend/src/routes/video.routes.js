import { Router } from "express";
import {
    getAllVideos,
    getVideoFeed,
    getVideoById,
    publishAVideo,
    getMyVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.get("/feed", getVideoFeed);

router.get("/my-videos", verifyJWT, getMyVideos);

router.get("/", getAllVideos);

router.get("/:videoId", getVideoById);

router.post(
    "/publish",
    verifyJWT,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishAVideo
);

router.patch(
    "/:videoId",
    verifyJWT,
    upload.fields([
        { name: "videoFile", maxCount: 1 },   //  NEW
        { name: "thumbnail", maxCount: 1 }    // existing
    ]),
    updateVideo
);

router.delete(
    "/:videoId",
    verifyJWT,
    deleteVideo
);

router.patch(
    "/:videoId/toggle-publish",
    verifyJWT,
    togglePublishStatus
);

export default router;