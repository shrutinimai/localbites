# LocalBites 🍲

A community-driven, full-stack food stall discovery platform that connects food enthusiasts with authentic local street food stalls. Built with Node.js, Express.js, MongoDB, and React — deployed with a live backend on Render and frontend on Netlify.

---

## Live Project Links

- **Frontend Demo:** https://687b91f44115fb827ea6fffd--localbitez.netlify.app/
- **Backend API Base URL:** https://localbites-2.onrender.com
- **Demo Video:** https://drive.google.com/file/d/1XWTqePfx42JGEb9KcShtjt7s1r29UT5T/view?usp=drive_link

> **Note:** The backend is hosted on Render's free tier. If it hasn't received traffic recently, the first request may take 30–60 seconds to wake up. Subsequent requests will be fast.

---

## Problem Statement

In many cities, finding authentic, hygienic, and budget-friendly local food stalls is difficult. People miss out on hidden gems and rely entirely on word-of-mouth. There is no centralized platform where the community can discover, verify, and review street food stalls — especially lesser-known ones that don't have a social media presence.

---

## Solution

LocalBites gives local food stalls a digital presence and lets the community vouch for them. Users can discover stalls by city or food category, view detailed profiles with images and menus, leave ratings and reviews, and report inaccurate or misleading listings. Stall owners can register and manage their own stall profiles.

---

## Features

- **User Authentication** — Secure registration and login with role-based access (Foodie vs. Stall Owner) using JWT and Bcrypt
- **Stall Profiles** — Each stall displays name, location (city, area), food categories, menu, timings, price range, and GPay acceptance
- **Image Upload** — Cloudinary integration for cloud-based image storage and CDN delivery; Multer handles multipart uploads
- **Ratings & Reviews** — Emoji reactions, text reviews, hygiene and taste ratings, and first-time vs. repeat visit tracking
- **Aggregated Ratings** — MongoDB aggregation pipeline computes dynamic stall-level rating scores from all user submissions in real time
- **Reporting System** — Users can report stalls for misinformation; report count is visible and triggers admin alerts at a set threshold
- **Search & Filter** — Find stalls by name, city, or food category
- **Pagination** — Efficient browsing across large stall listings

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Web framework and API routing |
| MongoDB Atlas | Primary database (document store) |
| Mongoose | ODM for schema definition and queries |
| JWT | Stateless user authentication |
| Bcrypt.js | Password hashing |
| Multer | Multipart file upload handling |
| Cloudinary | Cloud image storage and CDN delivery |
| Dotenv | Environment variable management |

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 / CSS3 | Structure and styling |
| JavaScript (ES6+) | Dynamic UI and API communication |

### Deployment
| Service | Purpose |
|---|---|
| Render | Backend API hosting |
| Netlify | Frontend hosting |
| GitHub | Version control |

---

## Project Structure

```
localbites/
├── backend/
│   ├── controllers/     # Route handler logic
│   ├── models/          # Mongoose schemas (User, Stall, Review, etc.)
│   ├── routes/          # Express API routes
│   ├── middleware/       # JWT auth and input validation
│   ├── config/          # Database and Cloudinary configuration
│   └── server.js        # App entry point
├── frontend/
│   ├── index.html       # Landing page
│   ├── css/             # Stylesheets
│   └── js/              # Frontend JavaScript modules
└── README.md
```

---

## How to Run Locally

### Prerequisites

- Node.js (v16+)
- npm
- MongoDB Atlas account (or local MongoDB instance)
- Cloudinary account

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/shrutinimai/localbites.git
cd localbites
```

#### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

```bash
npm start
# Backend runs at http://localhost:5000
```

#### Frontend Setup

```bash
cd ../frontend
```

Open `index.html` directly in your browser, or use a local server:

```bash
# Using VS Code Live Server, or:
npx serve .
```

Make sure the API base URL in your frontend JS points to `http://localhost:5000/api` when running locally, and to `https://localbites-2.onrender.com/api` when deployed.

---

## Key Implementation Highlights

- **Stateless JWT authentication** — tokens are verified on every protected route via middleware; no server-side sessions
- **MongoDB Aggregation Pipeline** — used to compute real-time average hygiene and taste scores per stall from all user reviews
- **Cloudinary CDN pipeline** — binary image data never touches the application server; Multer streams it directly to Cloudinary
- **Role-based middleware** — Stall Owner routes are protected separately from general user routes
- **Report threshold system** — stalls that exceed a defined report count trigger an admin alert, keeping community data quality high

---

## Acknowledgements

Built as a capstone project at Sharpener.tech.
