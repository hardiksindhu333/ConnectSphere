// This file configures HOW requests enter your backend before they reach routes.
// CORS → who can talk to you

// Body parsers → what data you accept

// Static → what files you serve

// Cookies → how auth works

import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import { errorHandler } from "./middlewares/error.middleware.js";


const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended:"true",limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import commentRouter from "./routes/comment.routes.js";



app.use("/api/v1/users",userRouter)

app.use("/api/v1/videos", videoRouter);

app.use("/api/v1/subscriptions", subscriptionRouter);

app.use("/api/v1/comments", commentRouter);


app.use(errorHandler);


export default app