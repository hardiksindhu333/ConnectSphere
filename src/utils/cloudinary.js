import { v2 as cloudinary } from "cloudinary";
import fs  from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localfilepath) => {
    try {
        if(!localfilepath)return null;
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type : "auto"
        })
        console.log("file is uplaoded",response.url);
        fs.unlinkSync(localfilepath); // for unlinksync Node.js stops everything Waits until the file is deleted Then continues
        return response

// When SHOULD you use each?
// ✅ Use fs.unlink() when:
// Backend API (Express, Fastify, Nest)
// Handling requests
// Performance matters

// ✅ Use fs.unlinkSync() when:
// One-time scripts
// CLI tools
// Server startup / shutdown
// Very small controlled tasks


    } catch (error) {
        fs.unlinkSync(localfilepath);
        return null;
    }
}



// cloudinary.v2.uploader
// .upload("dog.mp4", {
//   resource_type: "video", 
//   public_id: "my_dog",
//   overwrite: true, 
//   notification_url: "https://mysite.example.com/notify_endpoint"})
// .then(result=>console.log(result));

export {uploadOnCloudinary}