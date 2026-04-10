import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { Like } from "../models/like.model.js";

// const connectDB = async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         console.log("Mongodb connected , db host :",`${connectionInstance.connection.host}`)
//     } catch (error) {
//         console.log("mongodb connection error :",error)
//         process.exit(1)
//     }
// }

// export default connectDB


const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`,
      {
        serverSelectionTimeoutMS: 5000, // fail fast if MongoDB isn't reachable
      }
    );
    // console.log("connectionInstance :",connectionInstance)
    console.log("DB Name:", connectionInstance.connection.name);
    console.log("Host:", connectionInstance.connection.host);
    console.log("Port:", connectionInstance.connection.port);

    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);

    // Keep indexes in sync (prevents legacy unique index conflicts like tweet:null)
    try {
      await Like.syncIndexes();
      console.log("MongoDB indexes synced: Like");
    } catch (e) {
      console.log("Could not sync Like indexes:", e?.message || e);
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); 
  }
};

export default connectDB;
