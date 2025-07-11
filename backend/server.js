if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

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

mongoose
    .connect(process.env.MONGO_URI || process.env.MONGODB_URI)
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
    })
    .catch((err) => console.error("DB Connection Error:", err));
