# localbites
=============
## Live Project Links
======================


* **Live Frontend Demo:** https://687b91f44115fb827ea6fffd--localbitez.netlify.app/

* **Live Backend API:** https://localbites-2.onrender.com
(Note: This is the API base URL, not necessarily a browsable page)

## Demo Video
==============

* **Watch the Demo Video:** :https://drive.google.com/file/d/1XWTqePfx42JGEb9KcShtjt7s1r29UT5T/view?usp=drive_link


## Project Overview
=====================

### Problem Solved
==========================

In bustling cities like even new cities or some places, finding authentic, hygienic, and lesser-known local food stalls can be a challenge. Tourists and even locals often rely on word-of-mouth or miss out on hidden gems. There's a lack of a centralized platform that provides detailed information, including real-time updates on hygiene and taste, directly from the community.

### ✨ Solution
===================

**LocalBites** is a community-driven platform designed to connect food enthusiasts with the best local street food stalls even some stalls are famous for its traditions they dont have fancy or promotive names. It allows users to discover, rate, and review stalls based on crucial factors like hygiene and taste, ensuring a transparent and reliable experience. Stall owners or foodies can easily add new stalls, fostering a dynamic and comprehensive guide to the local food scene.Even a person is missing their traditional food can get easily ..its not easy to know what food is famous on the residing area ...we can also have some idea on nearby food stalls or shops available that are budget friendly and may be some cant be popular or they may preserve their popularity...This also could be  the vibe of craze for food lovers and explorers to know their surroundings abt the food and also could be great oppurtunity for local shop owners to promote their shops without need of any fancy influenecers...the images provides the chance of good view of food as there can be name variations from one place to other but food remain same, so images of food  can be very helpful ..and if any kind of malinformation regarding stalls, location or hygienic or anyreasons  can be reported and one can easily view the report count also.
 
###  Key Features
===================

* **User Authentication:** Secure user registration and login (foodie/stall owner roles).
* **Stall Management:**
    * **Add New Stalls:** Users can contribute by adding new food stall listings with essential details and an image.
    * **Detailed Stall Profiles:** Each stall has a dedicated page displaying its name, owner, location (city, area), food categories, menu items, description, timings, price range, and GPay acceptance.
    * **Image Upload:** Seamless integration with Cloudinary for secure image storage.
* **Interactive Ratings & Reviews:**
    * Users can react to stalls with emojis and text reviews.
    * Track first-time vs. repeat visits.
    * Display aggregated hygiene and taste ratings.
* **Reporting System:** Users can report stalls for review, ensuring community standards and quality control. (Includes a threshold for admin alerts).
* **Search & Filter:** Efficiently find stalls by name, city, or food category.
* **Pagination:** Browse through stall listings efficiently with pagination.

## Technologies Used
======================

### Backend
==============
* **Node.js:** JavaScript runtime environment.
* **Express.js:** Web application framework for Node.js.
* **MongoDB:** NoSQL database for flexible data storage.
* **Mongoose:** ODM (Object Data Modeling) library for MongoDB and Node.js.
* **JSON Web Tokens (JWT):** For secure user authentication and authorization.
* **Multer:** Middleware for handling `multipart/form-data` (primarily for file uploads).
* **Multer-Storage-Cloudinary:** Multer storage engine for uploading files directly to Cloudinary.
* **Cloudinary:** Cloud-based image and video management service.
* **Bcrypt.js:** For password hashing and security.
* **Dotenv:** For managing environment variables.

### Frontend
================

* **HTML5 / CSS3:** For structuring and styling the web application.
* **JavaScript (ES6+):** For interactive functionality.
* **CSS Framework :** css for styling the webpage

### Deployment
===============
* **Render:** For deploying the backend API.
* **Vercel:** For deploying the frontend application.
* **GitHub:** Version control.

## How to Run Locally
=========================

To run this project on your local machine, follow these steps:

### Prerequisites
==================

* Node.js
* npm 
* MongoDB Atlas Account (for a free cloud database) or a local MongoDB instance
* Cloudinary Account (for image storage)

### 
1.clone the repository
===========================

git clone : GitHub URL: https://github.com/shrutinimai/localbites

Repository Name: localbites
cd [repo-name]

2. Backend Setup
cd backend
npm install

3.Create a .env file in the backend directory with your actual secret values:

PORT=5000
MONGO_URI=[Your MongoDB Connection String from MongoDB Atlas]
JWT_SECRET=[A strong, random secret string for JWT]
CLOUDINARY_CLOUD_NAME=[Your Cloudinary Cloud Name]
CLOUDINARY_API_KEY=[Your Cloudinary API Key]
CLOUDINARY_API_SECRET=[Your Cloudinary API Secret]

4.Then, start the backend server:
npm start

5.Frontend Setup
Open a new terminal and navigate to the frontend directory:
cd ../frontend
npm install

Navigate to the backend directory:
cd backend
npm install

Create a .env file in the backend directory with your actual secret values:
PORT= [value of port]
MONGO_URI=[Your MongoDB Connection String from MongoDB Atlas]
JWT_SECRET=[A strong, random secret string for JWT]
CLOUDINARY_CLOUD_NAME=[Your Cloudinary Cloud Name]
CLOUDINARY_API_KEY=[Your Cloudinary API Key]
CLOUDINARY_API_SECRET=[Your Cloudinary API Secret]
Then, start the backend server:
npm start
The backend server should start on http://localhost:[PORT]


3.API Base URL Configuration:

Ensure that the JavaScript code in your frontend that makes API calls is pointing to your backend. When running locally, it should point to http://localhost:PORT/api. When deployed on Vercel, it should point to your live Render backend URL (https://localbites-2.onrender.com/api). You might manage this by having a simple JavaScript variable that you change for local vs. deployed environments, or use Vercel's environment variables.

To open the frontend locally:

Simply open your index.html file in your web browser:

# From the 'frontend' directory
open index.html  # For macOS
# or
start index.html # For Windows
# (Alternatively, simply double-click index.html in your file explorer)
The frontend application should open in your browser.


Acknowledgments
My mentor for guidance.

Sharpener.tech for this capstone opportunity.


