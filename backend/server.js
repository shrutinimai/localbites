
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const multer = require('multer'); 

const authRoutes = require("./routes/authRoutes");
const stallRoutes = require("./routes/stallroutes");
const userRoutes = require("./routes/userRoutes");


const app = express();

app.use(cors());

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


app.use("/api/auth", authRoutes);
app.use("/api/stalls", stallRoutes);
app.use("/api/users", userRoutes);


app.get('/', (req, res) => {
    res.send('Stall Finder API is running and ready for requests!');
});

app.use((err, req, res, next) => {
    console.error("--- GLOBAL ERROR HANDLER TRIGGERED ---"); 
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    console.error("Error Stack:", err.stack);

    if (err instanceof multer.MulterError) {
        console.error("Multer Error Code:", err.code);
        // Respond with a 400 Bad Request for Multer specific errors
        return res.status(400).json({ error: `Image upload failed (Multer): ${err.message}`, code: err.code });
    }

    if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: "Unauthorized: Invalid or missing token." });
    }
    if (err.name === 'ValidationError') { // Mongoose validation errors
        return res.status(400).json({ error: "Validation failed: " + err.message, details: err.errors });
    }
    if (err.code === 11000) { 
        return res.status(409).json({ error: "Duplicate entry. A record with similar unique details already exists." });
    }

    res.status(500).json({ error: "An unexpected server error occurred.", details: err.message || "Unknown server error" });
});


mongoose
    .connect(process.env.MONGO_URI || process.env.MONGODB_URI)
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
    })
    .catch((err) => console.error("DB Connection Error:", err)); 
