const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    type: { type: String, enum: ['link', 'iframe'] },
    origin: { type: String },
    content: { type: String }
}, { _id: false });

const trackSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    gate: String,
    flightCode: String,
    title: { type: String, required: true },
    status: String,
    lyrics: String,
    media: [mediaSchema],
    interactions: {
        likes: { type: Number, default: 0 },
        ratings: [Number]
    }
}, { timestamps: true });

module.exports = mongoose.model('Track', trackSchema);
