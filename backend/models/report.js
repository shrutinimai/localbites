const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    stall: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stall',
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    reportedAt: {
        type: Date,
        default: Date.now
    },
  
});

module.exports = mongoose.model('Report', reportSchema);
