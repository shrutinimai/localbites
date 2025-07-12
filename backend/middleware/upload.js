require("dotenv").config();

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("Cloudinary Configured in upload.js"); 

    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: "localbites-stalls",
            allowed_formats: ["jpg", "png", "jpeg"],
            // OPTIONAL: Add a public_id function to ensure unique names or control naming
            // public_id: (req, file) => Date.now() + '-' + file.originalname,
        },
    });
    console.log("CloudinaryStorage initialized in upload.js"); // ADD THIS LOG

    // Export multer instance with the configured storage
    module.exports = multer({ storage });
    console.log("Multer instance exported in upload.js"); // ADD THIS LOG

} catch (err) {
    console.error("!!! CRITICAL ERROR DURING UPLOAD.JS INITIALIZATION !!!");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    console.error("Error Stack:", err.stack);
    // You might want to re-throw or exit the process if this happens,
    // as the app cannot function without file upload.
    // process.exit(1);
}
