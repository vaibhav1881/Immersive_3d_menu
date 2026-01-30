const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Restaurant name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    logo: {
        type: String // URL to logo image
    },
    coverImage: {
        type: String // URL to cover image
    },
    cuisine: [{
        type: String,
        trim: true
    }],
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    contact: {
        phone: String,
        email: String,
        website: String
    },
    operatingHours: {
        monday: { open: String, close: String, isClosed: Boolean },
        tuesday: { open: String, close: String, isClosed: Boolean },
        wednesday: { open: String, close: String, isClosed: Boolean },
        thursday: { open: String, close: String, isClosed: Boolean },
        friday: { open: String, close: String, isClosed: Boolean },
        saturday: { open: String, close: String, isClosed: Boolean },
        sunday: { open: String, close: String, isClosed: Boolean }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    settings: {
        primaryColor: { type: String, default: '#FF6B6B' },
        secondaryColor: { type: String, default: '#4ECDC4' },
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        showAR: { type: Boolean, default: true },
        showVR: { type: Boolean, default: true },
        show360: { type: Boolean, default: true }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPremium: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Virtual for tables
restaurantSchema.virtual('tables', {
    ref: 'Table',
    localField: '_id',
    foreignField: 'restaurant'
});

// Virtual for dishes
restaurantSchema.virtual('dishes', {
    ref: 'Dish',
    localField: '_id',
    foreignField: 'restaurant'
});

// Enable virtuals
restaurantSchema.set('toJSON', { virtuals: true });
restaurantSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
