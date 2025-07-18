
const Stall = require("../models/stall");
const Report = require("../models/report");
const mongoose = require("mongoose");

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

exports.addStall = async (req, res) => {
    console.log("--- addStall controller started ---");
    console.log("Incoming Request - Method:", req.method, "URL:", req.url);

    console.log("Raw req.file (BEFORE try block):", req.file);
    console.log("Raw req.body (BEFORE try block):", req.body);
    console.log("Raw req.user (BEFORE try block):", req.user);

    try {
        console.log("Entered try block in addStall.");

        if (!req.file) {
            console.error("Error: req.file is undefined inside try block. No image was uploaded or Multer failed.");
            return res.status(400).json({ error: "Image file is required for adding a stall." });
        }

        if (!req.file.path) {
            console.error("Error: req.file.path is missing from Multer response! Full req.file object:", req.file);
            return res.status(500).json({ error: "Image upload failed internally. Could not get Cloudinary URL." });
        }

        const uploadedImageUrl = req.file.path;
        console.log("Image URL received from Multer-Cloudinary (inside try):", uploadedImageUrl);

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
            latitude,
            longitude,
        } = req.body;

        if (!req.user || !req.user.userId || !req.user.role) {
            console.error("Error: req.user or its properties (userId, role) are missing after auth middleware.");
            return res.status(401).json({ error: "User authentication data is missing. Please ensure you are logged in and your token is valid." });
        }
        console.log("req.user.userId (inside try):", req.user.userId);
        console.log("req.user.role (inside try):", req.user.role);

        

        const newStall = new Stall({
            name,
            ownerName,
            city,
            area,
            foodCategory,
            description,
            foodItem,
            acceptsGpay: acceptsGpay === "on" || acceptsGpay === true,
            hygieneRating: hygieneRating ? parseInt(hygieneRating) : undefined,
            tasteRating: tasteRating ? parseInt(tasteRating) : undefined,
            priceRange,
            openingTime,
            closingTime,
            rushHours,
            foodInfo,
            imageUrl: uploadedImageUrl,
            postedBy: req.user.userId,
            postedRole: req.user.role,
            location: (latitude && longitude) ? {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)], // Ensure they are parsed as floats
            } : undefined, // Make location optional if not provided
        });

        console.log("New stall object before saving to DB:", newStall);
        await newStall.save();
        console.log("Stall saved successfully with ID:", newStall._id);

        res.status(201).json({ message: "Stall added successfully", stall: newStall });

    } catch (err) {
        console.error("!!! Critical Error in addStall controller - CAUGHT EXCEPTION !!!");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        console.error("Error Stack:", err.stack);

        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: "Validation failed for stall data: " + err.message, details: err.errors });
        }
        if (err.code === 11000) {
            return res.status(409).json({ error: "Duplicate entry. A stall with similar details might already exist." });
        }
        res.status(500).json({ error: "Internal Server Error", details: err.message || "An unexpected error occurred." });
    }
    console.log("--- addStall controller finished ---");
};

exports.getAllStalls = async (req, res) => {
    try {
        const stalls = await Stall.find({ status: "active" })
            .sort({ createdAt: -1 })
            .populate("postedBy", "_id name role");
        res.status(200).json(stalls);
    } catch (err) {
        console.error("Error fetching all stalls:", err);
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

        const { name, city, foodCategory, userLat, userLng } = req.query; // ADDITION: Get user location
        let filterQuery = { status: "active" };

        // Build base match query for filtering
        let matchQuery = { status: "active" };
        if (name) {
            matchQuery.name = { $regex: name, $options: 'i' };
        }
        if (city) {
            matchQuery.city = { $regex: city, $options: 'i' };
        }
        if (foodCategory) {
            matchQuery.foodCategory = foodCategory;
        }

        let aggregationPipeline = [];

        if (userLat && userLng) {
            const userLatitude = parseFloat(userLat);
            const userLongitude = parseFloat(userLng);

            aggregationPipeline.push({
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [userLongitude, userLatitude]
                    },
                    distanceField: "distance",
                    spherical: true, 
                    maxDistance: 500000,
                    query: matchQuery 
                }
            });
            
        } else {
            aggregationPipeline.push({ $match: matchQuery });
        }
        

        const total = await Stall.countDocuments(matchQuery); 

        aggregationPipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $lookup: { 
                from: 'users',
                localField: 'postedBy',
                foreignField: '_id',
                as: 'postedBy'
            }},
            { $unwind: { path: '$postedBy', preserveNullAndEmptyArrays: true } }, 
            { $project: { 
                'postedBy.password': 0, 
                'postedBy.email': 0,    
                'postedBy.__v': 0,      
            }}
        );

        // If user location was provided, sort by distance too
        // Note: $geoNear automatically sorts by distance, so explicitly adding $sort:{distance:1} after $geoNear is often redundant,
        // but it clarifies intent and ensures consistent sorting if $geoNear is not the first stage later.
        if (userLat && userLng) {
             // $geoNear already sorts by distance. If you need other primary sorts, place them first
             // and potentially re-sort by distance if necessary for secondary sort.
             // For simple closest-first, $geoNear's sort is enough.
        }

        console.log("Aggregation Pipeline:", JSON.stringify(aggregationPipeline, null, 2));
        const stalls = await Stall.aggregate(aggregationPipeline);

        res.json({
            stalls: stalls.map(stall => {
                // ADDITION: Format distance to km if present, from meters
                if (stall.distance !== undefined) {
                    stall.distance = (stall.distance / 1000).toFixed(2); // Convert meters to km
                }
                return stall;
            }),
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error("Error fetching paginated stalls:", err);
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
        res.status(200).json({ ...stall, reportCount });
    } catch (err) {
        console.error("Error fetching stall by ID:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.reactToStall = async (req, res) => {
    try {
        const { emoji, text, rating, firstTime, userLocation } = req.body;
        const stall = await Stall.findById(req.params.id);
        if (!stall) return res.status(404).json({ message: "Stall not found" });

        if (emoji) {
            if (!stall.emojiReactions) stall.emojiReactions = {};
            stall.emojiReactions[emoji] = (stall.emojiReactions[emoji] || 0) + 1;
        }

        if (firstTime === true) stall.firstTimeCount++;
        else if (firstTime === false) stall.repeatCount++;

        const newReview = {
            emoji,
            text,
            rating: rating ? parseInt(rating) : undefined,
            firstTime,
            userLocation,
            createdAt: new Date()
        };
        stall.reviews.push(newReview);

        // Optional: Save average tasteRating
        if (rating && !isNaN(rating)) {
            const ratings = stall.reviews
                .map(r => r.rating)
                .filter(r => typeof r === 'number' && !isNaN(r));

            if (ratings.length > 0) {
                const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
                stall.tasteRating = Math.round(avg * 10) / 10; // rounded to 1 decimal
            }
        }

        await stall.save();
        res.status(200).json({ message: "Review submitted", stall });

    } catch (err) {
        console.error("Error in reactToStall:", err);
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
            return res.status(400).json({ message: "You have already reported this stall." });
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
            message: "Report submitted successfully",
            currentReportCount: currentReportCount,
        });
    } catch (err) {
        console.error("Error reporting stall:", err);
        res.status(500).json({ error: err.message });
    }
};
