import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // CONFIG HERE (ensures env is loaded)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log("Using API KEY:", process.env.CLOUDINARY_API_KEY);

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;

  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    return null;
  }
};

const deleteFromCloudinary = async (publicID, resourceType = "image") => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!publicID) return null;

    return await cloudinary.uploader.destroy(publicID, {
      resource_type: resourceType,
    });

  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };