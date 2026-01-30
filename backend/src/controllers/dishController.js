const path = require('path');
const fs = require('fs').promises;
const { Dish, Category, Restaurant } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Create a new dish
 * @route   POST /api/dishes
 * @access  Private
 */
const createDish = asyncHandler(async (req, res) => {
    const {
        name, description, price, currency, category, categoryName,
        isVeg, isVegan, isGlutenFree, spiceLevel, allergens,
        calories, preparationTime, servingSize, isFeatured, displayOrder
    } = req.body;

    // Verify restaurant exists and user has access
    const restaurant = req.user.restaurant;
    if (!restaurant) {
        return res.status(400).json({
            success: false,
            message: 'You need to create a restaurant first'
        });
    }

    // Create dish
    const dish = await Dish.create({
        name,
        description,
        price,
        currency,
        category,
        categoryName,
        restaurant: restaurant._id,
        isVeg,
        isVegan,
        isGlutenFree,
        spiceLevel,
        allergens,
        calories,
        preparationTime,
        servingSize,
        isFeatured,
        displayOrder,
        processingStatus: 'pending'
    });

    res.status(201).json({
        success: true,
        message: 'Dish created successfully',
        data: { dish }
    });
});

/**
 * @desc    Get all dishes for a restaurant
 * @route   GET /api/dishes
 * @access  Private
 */
const getDishes = asyncHandler(async (req, res) => {
    const { category, search, page = 1, limit = 20 } = req.query;

    const restaurant = req.user.restaurant;
    if (!restaurant) {
        return res.status(400).json({
            success: false,
            message: 'You need to create a restaurant first'
        });
    }

    // Build query
    const query = { restaurant: restaurant._id };

    if (category) {
        query.category = category;
    }

    if (search) {
        query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const dishes = await Dish.find(query)
        .populate('category', 'name')
        .sort('displayOrder')
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Dish.countDocuments(query);

    res.json({
        success: true,
        data: {
            dishes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

/**
 * @desc    Get single dish
 * @route   GET /api/dishes/:id
 * @access  Public
 */
const getDish = asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id)
        .populate('category', 'name')
        .populate('restaurant', 'name settings');

    if (!dish) {
        return res.status(404).json({
            success: false,
            message: 'Dish not found'
        });
    }

    // Increment view count
    dish.viewCount += 1;
    await dish.save();

    res.json({
        success: true,
        data: { dish }
    });
});

/**
 * @desc    Update dish
 * @route   PUT /api/dishes/:id
 * @access  Private
 */
const updateDish = asyncHandler(async (req, res) => {
    const {
        name, description, price, currency, category, categoryName,
        isVeg, isVegan, isGlutenFree, spiceLevel, allergens,
        calories, preparationTime, servingSize, isAvailable,
        isFeatured, isPopular, displayOrder
    } = req.body;

    let dish = await Dish.findById(req.params.id);

    if (!dish) {
        return res.status(404).json({
            success: false,
            message: 'Dish not found'
        });
    }

    // Check ownership
    const restaurant = req.user.restaurant;
    if (dish.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this dish'
        });
    }

    dish = await Dish.findByIdAndUpdate(
        req.params.id,
        {
            name, description, price, currency, category, categoryName,
            isVeg, isVegan, isGlutenFree, spiceLevel, allergens,
            calories, preparationTime, servingSize, isAvailable,
            isFeatured, isPopular, displayOrder
        },
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Dish updated successfully',
        data: { dish }
    });
});

/**
 * @desc    Delete dish
 * @route   DELETE /api/dishes/:id
 * @access  Private
 */
const deleteDish = asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
        return res.status(404).json({
            success: false,
            message: 'Dish not found'
        });
    }

    // Check ownership
    const restaurant = req.user.restaurant;
    if (dish.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this dish'
        });
    }

    // Delete associated files
    if (dish.modelUrl) {
        try {
            await fs.unlink(dish.modelUrl.replace(/^\/uploads\//, './uploads/'));
        } catch (err) {
            console.log('Model file not found or already deleted');
        }
    }

    if (dish.thumbnailUrl) {
        try {
            await fs.unlink(dish.thumbnailUrl.replace(/^\/uploads\//, './uploads/'));
        } catch (err) {
            console.log('Thumbnail file not found or already deleted');
        }
    }

    await dish.deleteOne();

    res.json({
        success: true,
        message: 'Dish deleted successfully'
    });
});

/**
 * @desc    Upload images for dish (for 3D processing)
 * @route   POST /api/dishes/:id/images
 * @access  Private
 */
const uploadDishImages = asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
        return res.status(404).json({
            success: false,
            message: 'Dish not found'
        });
    }

    // Check ownership
    const restaurant = req.user.restaurant;
    if (dish.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to upload images for this dish'
        });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please upload at least one image'
        });
    }

    // Save image URLs
    const images = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        order: index
    }));

    dish.images = [...(dish.images || []), ...images];
    dish.processingStatus = 'pending';

    // Set first image as thumbnail if not set
    if (!dish.thumbnailUrl && images.length > 0) {
        dish.thumbnailUrl = images[0].url;
    }

    await dish.save();

    res.json({
        success: true,
        message: `${req.files.length} images uploaded successfully`,
        data: {
            dish,
            uploadedImages: images
        }
    });
});

/**
 * @desc    Upload 3D model for dish
 * @route   POST /api/dishes/:id/model
 * @access  Private
 */
const uploadDishModel = asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
        return res.status(404).json({
            success: false,
            message: 'Dish not found'
        });
    }

    // Check ownership
    const restaurant = req.user.restaurant;
    if (dish.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to upload model for this dish'
        });
    }

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please upload a 3D model file'
        });
    }

    // Delete old model if exists
    if (dish.modelUrl) {
        try {
            await fs.unlink(dish.modelUrl.replace(/^\/uploads\//, './uploads/'));
        } catch (err) {
            console.log('Old model file not found');
        }
    }

    dish.modelUrl = `/uploads/${req.file.filename}`;
    dish.processingStatus = 'completed';

    await dish.save();

    res.json({
        success: true,
        message: '3D model uploaded successfully',
        data: { dish }
    });
});

/**
 * @desc    Track AR view for dish
 * @route   POST /api/dishes/:id/ar-view
 * @access  Public
 */
const trackARView = asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
        return res.status(404).json({
            success: false,
            message: 'Dish not found'
        });
    }

    dish.arViewCount += 1;
    await dish.save();

    res.json({
        success: true,
        message: 'AR view tracked'
    });
});

module.exports = {
    createDish,
    getDishes,
    getDish,
    updateDish,
    deleteDish,
    uploadDishImages,
    uploadDishModel,
    trackARView
};
