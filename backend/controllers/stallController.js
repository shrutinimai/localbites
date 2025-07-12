const Stall = require("../models/stall");
const Report = require("../models/report");
const mongoose = require("mongoose");
const cloudinary = require('cloudinary').v2; // ADDED: Cloudinary import

// ADDED: Cloudinary Configuration (Ensure these env vars are set on Render.com)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

exports.addStall = async (req, res) => {
    console.log("--- addStall controller started ---"); // ADDED: Logging
    console.log("Request body:", req.body); // ADDED: Logging
    console.log("Request file (from Multer):", req.file); // ADDED: Logging

    try {
        // ADDED: Check for image file from Multer
        if (!req.file) {
            console.error("Error: No image file provided in the request (req.file is undefined)."); // ADDED: Logging
            return res.status(400).json({ error: "Image file is required." });
        }

        // ADDED: Cloudinary Upload Logic
        let uploadedImageUrl = "";
        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "localbites_stalls", // Optional: A folder in your Cloudinary account
                use_filename: true, // Use original filename
                unique_filename: false // Don't append random chars (be careful with duplicates)
            });
            uploadedImageUrl = result.secure_url;
            console.log("Cloudinary upload successful. URL:", uploadedImageUrl); // ADDED: Logging
        } catch (uploadError) {
            console.error("Error uploading image to Cloudinary:", uploadError); // ADDED: Logging
            // If Cloudinary upload fails, send a specific error and don't proceed
            return res.status(500).json({ error: "Failed to upload image. " + uploadError.message });
        }

        // Destructure req.body AFTER checking file upload
        const {
            name,
            ownerName,
            city,
            area,
            foodCategory,
            description,
            foodItem,
            acceptsGpay,
            hygieneRating,
            tasteRating,
            priceRange,
            openingTime,
            closingTime,
            rushHours,
            foodInfo,
        } = req.body;

        // ADDED: Log req.user to ensure it's populated by auth middleware
        console.log("req.user in addStall:", req.user);
        console.log("req.user.userId:", req.user?.userId);
        console.log("req.user.role:", req.user?.role);

        // Ensure req.user is properly populated (e.g., if auth middleware failed to set it)
        if (!req.user || !req.user.userId || !req.user.role) {
            console.error("Error: req.user or its properties (userId, role) are missing after auth middleware.");
            return res.status(401).json({ error: "User authentication data is missing. Please ensure you are logged in." });
        }


        const newStall = new Stall({
            name,
            ownerName,
            city,
            area,
            foodCategory,
            description,
            foodItem,
            acceptsGpay: acceptsGpay === "on" || acceptsGpay === true,
            // Convert ratings to numbers if they come as strings from form data
            hygieneRating: hygieneRating ? parseInt(hygieneRating) : undefined,
            tasteRating: tasteRating ? parseInt(tasteRating) : undefined,
            priceRange,
            openingTime,
            closingTime,
            rushHours,
            foodInfo,
            imageUrl: uploadedImageUrl, // CHANGED: Use the URL from Cloudinary upload
            postedBy: req.user.userId,
            postedRole: req.user.role,
        });

        console.log("New stall object before saving:", newStall); // ADDED: Logging
        await newStall.save();
        console.log("Stall saved successfully with ID:", newStall._id); // ADDED: Logging

        res.status(201).json({ message: "Stall added successfully", stall: newStall });
    } catch (err) {
        console.error("!!! Critical Error in addStall controller:", err); // ADDED: Enhanced Logging for all errors
        // Provide more specific error responses for known Mongoose errors
        if (err.name === 'ValidationError') {
            // Mongoose validation error (e.g., required field missing, type mismatch)
            return res.status(400).json({ error: "Validation failed: " + err.message, details: err.errors });
        }
        if (err.code === 11000) {
            // Duplicate key error (e.g., if a unique field like 'name' in an area already exists)
            return res.status(409).json({ error: "Duplicate entry. This stall might already exist." });
        }
        // Generic 500 for other unexpected errors
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
    console.log("--- addStall controller finished ---"); // ADDED: Logging
};

exports.getAllStalls = async (req, res) => {
    try {
        const stalls = await Stall.find({ status: "active" })
            .sort({ createdAt: -1 })
            .populate("postedBy", "_id name role");
        res.status(200).json(stalls);
    } catch (err) {
        console.error("Error fetching all stalls:", err); // ADDED: Logging
        res.status(500).json({ error: err.message });
    }
};

exports.getStallsPaginated = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 5;
        const allowedLimits = [5, 10, 15, 20];
        if (!allowedLimits.includes(limit)) limit = 5;

        const skip = (page - 1) * limit;

        const filterQuery = { status: "active" };
        if (req.query.name) {
            filterQuery.name = { $regex: req.query.name, $options: 'i' };
        }
        if (req.query.city) {
            filterQuery.city = { $regex: req.query.city, $options: 'i' };
        }
        if (req.query.foodCategory) {
            filterQuery.foodCategory = req.query.foodCategory;
        }

        const total = await Stall.countDocuments(filterQuery);
        const stalls = await Stall.find(filterQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("postedBy", "_id name role");

        res.json({
            stalls,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error("Error fetching paginated stalls:", err); // ADDED: Logging
        res.status(500).json({ error: err.message });
    }
};

exports.getStallById = async (req, res) => {
    try {
        const stall = await Stall.findById(req.params.id)
            .populate("postedBy", "name role")
            .lean();

        if (!stall) return res.status(404).json({ message: "Stall not found" });

        const reportCount = await Report.countDocuments({ stall: req.params.id });
        // Use an object spread to add reportCount without modifying original Mongoose document
        res.status(200).json({ ...stall, reportCount });
    } catch (err) {
        console.error("Error fetching stall by ID:", err); // ADDED: Logging
        res.status(500).json({ error: err.message });
    }
};

exports.reactToStall = async (req, res) => {
    try {
        const { emoji, text, firstTime, userLocation } = req.body;
        const stall = await Stall.findById(req.params.id);
        if (!stall) return res.status(404).json({ message: "Stall not found" });

        stall.emojiReactions[emoji] = (stall.emojiReactions[emoji] || 0) + 1;
        if (firstTime) stall.firstTimeCount++;
        else stall.repeatCount++;

        if (!stall.reviews) {
            stall.reviews = [];
        }
        stall.reviews.push({ emoji, text, firstTime, userLocation });
        await stall.save();

        res.status(200).json({ message: "Reaction submitted", stall });
    } catch (err) {
        console.error("Error reacting to stall:", err); // ADDED: Logging
        res.status(500).json({ error: err.message });
    }
};

exports.reportStall = async (req, res) => {
    try {
        const stallId = req.params.id;
        const userId = req.user.userId;
        const { reason } = req.body;

        if (!isValidObjectId(stallId)) {
            return res.status(400).json({ message: "Invalid stall ID" });
        }
        if (!reason) {
            return res.status(400).json({ message: "Reason is required" });
        }

        const stall = await Stall.findById(stallId);
        if (!stall) {
            return res.status(404).json({ message: "Stall not found" });
        }

        const alreadyReported = await Report.findOne({ stall: stallId, reportedBy: userId });
        if (alreadyReported) {
            return res.status(400).json({ message: "You have already reported this stall" });
        }

        const newReport = new Report({
            stall: stallId,
            reportedBy: userId,
            reason: reason,
        });
        await newReport.save();

        const currentReportCount = await Report.countDocuments({ stall: stallId });

        const REPORT_THRESHOLD = 5;
        if (currentReportCount >= REPORT_THRESHOLD) {
            console.log(`ALERT: Stall "${stall.name}" (ID: ${stall._id}) has reached ${currentReportCount} reports! Admin review advised.`);
        }

        res.status(200).json({
            message: "Report submitted",
            currentReportCount: currentReportCount,
        });
    } catch (err) {
        console.error("Error reporting stall:", err); // ADDED: Logging
        res.status(500).json({ error: err.message });
    }
};
