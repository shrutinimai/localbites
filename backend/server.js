require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const stallRoutes = require("./routes/stallroutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/views", express.static(path.join(__dirname, "views")));

app.use("/api/auth", authRoutes);
app.use("/api/stalls", stallRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "views", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "views", "login.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "views", "signup.html")));
app.get("/add-stall", (req, res) => res.sendFile(path.join(__dirname, "views", "add-stall.html")));
app.get("/stall-details", (req, res) => res.sendFile(path.join(__dirname, "views", "stall-details.html")));
app.get("/stalls", (req, res) => res.sendFile(path.join(__dirname, "views", "stalls.html")));


mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => app.listen(process.env.PORT || 5000, () => console.log(" Server running.")))
    .catch((err) => console.error(" DB Error:", err));