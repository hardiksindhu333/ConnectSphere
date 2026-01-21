// This file configures HOW requests enter your backend before they reach routes.
// CORS → who can talk to you

// Body parsers → what data you accept

// Static → what files you serve

// Cookies → how auth works

import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended:"true",limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


export default app