// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";

// In ES Modules, dotenv must be executed before other imports
dotenv.config({
    path:'./.env'
})
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