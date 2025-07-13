
require("dotenv").config(); 

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
    console.log("Cloudinary Configured in upload.js");

    const storage = new CloudinaryStorage({
        cloudinary, 
        params: {
            folder: "localbites-stalls", 
            allowed_formats: ["jpg", "png", "jpeg"], 

        },
    });
    console.log("CloudinaryStorage initialized in upload.js");

    module.exports = multer({
        storage: storage,

    });
    console.log("Multer instance exported in upload.js");

} catch (err) {
    console.error("!!! CRITICAL ERROR DURING UPLOAD.JS INITIALIZATION !!!");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    console.error("Error Stack:", err.stack);
    process.exit(1); 
}
