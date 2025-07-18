
const mongoose = require('mongoose');

const stallSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    foodCategory: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    foodItem: { type: String, required: true, trim: true },
    acceptsGpay: { type: Boolean, default: false },
    hygieneRating: { type: Number, min: 1, max: 5 },
    tasteRating: { type: Number, min: 1, max: 5 },
    priceRange: { type: String, trim: true },
    openingTime: { type: String, trim: true },
    closingTime: { type: String, trim: true },
    rushHours: { type: String, trim: true },
    foodInfo: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postedRole: { type: String, enum: ['foodie', 'owner', 'admin'], default: 'foodie' },
     // Ensure 'admin' is a possible role if you have it
     location: {
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
    }
},

    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'], 
        default: 'active'
    },
    emojiReactions: {
        love: { type: Number, default: 0 },
        fire: { type: Number, default: 0 },
        meh: { type: Number, default: 0 },
        thumbsUp: { type: Number, default: 0 },
    },
    firstTimeCount: { type: Number, default: 0 },
    repeatCount: { type: Number, default: 0 },
    reviews: [ 
        {
            emoji: { type: String },
            text: { type: String },
            firstTime: { type: Boolean },
            userLocation: { type: String },
            createdAt: { type: Date, default: Date.now }
        }
    ],
}, { timestamps: true }); 

module.exports = mongoose.model('Stall', stallSchema);
