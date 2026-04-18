// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Ensure we load the backend/.env explicitly only when it exists.
const envPath = new URL('../.env', import.meta.url).pathname
// Normalize Windows path (remove leading slash before drive letter)
const normalizedEnvPath = envPath.replace(/^\/([A-Za-z]:)/, '$1').replace(/^\/(?=[A-Za-z]:)/, '')

if (fs.existsSync(normalizedEnvPath)) {
    console.log('Loading env from:', normalizedEnvPath)
    const envContents = fs.readFileSync(normalizedEnvPath, 'utf8')
    const parsed = dotenv.parse(envContents)
    Object.keys(parsed).forEach((k) => {
        if (!process.env[k]) process.env[k] = parsed[k]
    })
} else {
    console.log('.env file not found, using environment variables')
}
import app from "./app.js";


import connectDB from "./db/index.js";


connectDB()
.then(()=>{
    app.on("error",(error)=>{
            console.log("error :",error)
            throw error
        })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("Mongodb connection failed :",error);
})



/*
const app = express();

(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("error :",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log("app is listening on port ",`${process.env.PORT}`)
        })
    } catch (error) {
        console.log("Error :",error)
        throw error
    }
})()
    */