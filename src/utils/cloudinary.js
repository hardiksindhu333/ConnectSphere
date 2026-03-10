import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

    
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;




    //  check env loading (temporary)
    // console.log("Cloudinary ENV CHECK:", {
    //   cloud: process.env.CLOUDINARY_CLOUD_NAME,
    //   key: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
    //   secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
    // });

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // avatar/cover are images
    });

    // console.log("✅ Cloudinary upload success:", response);

    // delete local file safely
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;

  } catch (error) {
    console.error("❌ Cloudinary upload failed:");
    console.error(error.message); // THIS is what you were missing

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);// for unlinksync Node.js stops everything Waits until the file is deleted Then continues

    }

    return null;
  }
};


const deleteFromCloudinary = async(publicID,resourceType="image") =>{
  try {
    if(!publicID){
      return null;
    }

    const result = await cloudinary.uploader.destroy(publicID,{
      resource_type:resourceType
    });
    return result;
  } catch (error) {
    // console.log("Cloudinary delete error",error);

    return null;
  }
}

export { uploadOnCloudinary ,deleteFromCloudinary};





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




// cloudinary.v2.uploader
// .upload("dog.mp4", {
//   resource_type: "video", 
//   public_id: "my_dog",
//   overwrite: true, 
//   notification_url: "https://mysite.example.com/notify_endpoint"})
// .then(result=>console.log(result));

