const Stall = require("../models/stall");
const Report = require("../models/report"); 
const mongoose = require("mongoose");

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

exports.addStall = async (req, res) => {
    try {
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

        const newStall = new Stall({
            name,
            ownerName,
            city,
            area,
            foodCategory,
            description,
            foodItem,
            acceptsGpay: acceptsGpay === "on" || acceptsGpay === true,
            hygieneRating,
            tasteRating,
            priceRange,
            openingTime,
            closingTime,
            rushHours,
            foodInfo,
            imageUrl: req.file?.path || "",
            postedBy: req.user.userId,
            postedRole: req.user.role,
        });

        await newStall.save();
        res.status(201).json({ message: "Stall added successfully", stall: newStall });
    } catch (err) {
        console.error("Error adding stall:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllStalls = async (req, res) => {
    try {
        const stalls = await Stall.find({ status: "active" })
            .sort({ createdAt: -1 })
            .populate("postedBy", "_id name role");
        res.status(200).json(stalls);
    } catch (err) {
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
        stall.reportCount = reportCount;

        res.status(200).json(stall);
    } catch (err) {
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
        console.error("Error reporting stall:", err);
        res.status(500).json({ error: err.message });
    }
};

