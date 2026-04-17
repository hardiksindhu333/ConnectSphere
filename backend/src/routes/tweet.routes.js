import { Router } from "express";
import {
    createTweet,
    getAllTweets,
    getUserTweets,
    updateTweet,
    deleteTweet,
    toggleTweetLike
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post(
    "/",
    verifyJWT,
    upload.single("image"),
    createTweet
);

router.get(
    "/",
    getAllTweets
);

router.get(
    "/user/:userId",
    getUserTweets
);

router.patch(
    "/:tweetId",
    verifyJWT,
    updateTweet
);

router.delete(
    "/:tweetId",
    verifyJWT,
    deleteTweet
);

router.put(
    "/:tweetId/like",
    verifyJWT,
    toggleTweetLike
);

export default router;