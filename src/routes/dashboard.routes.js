import { Router } from "express";
import { getChannelStats,
    getChannelVideos
 } from "../controllers/dashboard.controller.ks";

const router = Router()

router.get("/stats", verifyJWT, getChannelStats);
router.get("/videos", verifyJWT, getChannelVideos);

export default router