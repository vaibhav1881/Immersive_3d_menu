const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Dish name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    currency: {
        type: String,
        default: 'INR'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    categoryName: {
        type: String,
        trim: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    // 3D Model Data
    modelUrl: {
        type: String // URL to .glb file
    },
    thumbnailUrl: {
        type: String // URL to thumbnail image
    },
    images: [{
        url: String,
        order: Number
    }],
    // Processing Status
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'no_model'],
        default: 'pending'
    },
    processingError: String,
    processingProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    // Dish Properties
    isVeg: {
        type: Boolean,
        default: false
    },
    isVegan: {
        type: Boolean,
        default: false
    },
    isGlutenFree: {
        type: Boolean,
        default: false
    },
    spiceLevel: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    allergens: [{
        type: String,
        enum: ['dairy', 'eggs', 'nuts', 'peanuts', 'shellfish', 'fish', 'soy', 'wheat', 'sesame']
    }],
    calories: Number,
    preparationTime: Number, // in minutes
    servingSize: String,
    // Display Options
    isAvailable: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    // Statistics
    viewCount: {
        type: Number,
        default: 0
    },
    arViewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for search
dishSchema.index({ name: 'text', description: 'text' });
dishSchema.index({ restaurant: 1, category: 1 });
dishSchema.index({ restaurant: 1, displayOrder: 1 });

// Increment view count
dishSchema.methods.incrementView = async function (isAR = false) {
    this.viewCount += 1;
    if (isAR) this.arViewCount += 1;
    await this.save();
};

module.exports = mongoose.model('Dish', dishSchema);
