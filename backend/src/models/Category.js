const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String // Icon name or URL
    },
    image: {
        type: String // URL to category image
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual for dishes count
categorySchema.virtual('dishCount', {
    ref: 'Dish',
    localField: '_id',
    foreignField: 'category',
    count: true
});

categorySchema.index({ restaurant: 1, displayOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
