const { Restaurant, Dish, Category, Table } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Create a new restaurant
 * @route   POST /api/restaurants
 * @access  Private
 */
const createRestaurant = asyncHandler(async (req, res) => {
    const { name, description, cuisine, address, contact, operatingHours, settings } = req.body;

    // Check if user already has a restaurant
    if (req.user.restaurant) {
        return res.status(400).json({
            success: false,
            message: 'You already have a restaurant. Upgrade to premium for multiple restaurants.'
        });
    }

    const restaurant = await Restaurant.create({
        name,
        description,
        cuisine,
        address,
        contact,
        operatingHours,
        settings,
        owner: req.user.id
    });

    // Update user with restaurant reference
    req.user.restaurant = restaurant._id;
    await req.user.save();

    res.status(201).json({
        success: true,
        message: 'Restaurant created successfully',
        data: { restaurant }
    });
});

/**
 * @desc    Get all restaurants (Public)
 * @route   GET /api/restaurants
 * @access  Public
 */
const getAllRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({ isActive: true })
        .select('name description cuisine address contact logo coverImage')
        .sort('-createdAt');

    res.json({
        success: true,
        data: restaurants
    });
});

/**
 * @desc    Get restaurant by ID (Public)
 * @route   GET /api/restaurants/:id
 * @access  Public
 */
const getRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return res.status(404).json({
            success: false,
            message: 'Restaurant not found'
        });
    }

    res.json({
        success: true,
        data: { restaurant }
    });
});

/**
 * @desc    Get my restaurant
 * @route   GET /api/restaurants/me
 * @access  Private
 */
const getMyRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
        return res.status(404).json({
            success: false,
            message: 'You do not have a restaurant yet'
        });
    }

    // Get additional stats
    const dishCount = await Dish.countDocuments({ restaurant: restaurant._id });
    const categoryCount = await Category.countDocuments({ restaurant: restaurant._id });
    const tableCount = await Table.countDocuments({ restaurant: restaurant._id });

    res.json({
        success: true,
        data: {
            restaurant,
            stats: {
                dishCount,
                categoryCount,
                tableCount
            }
        }
    });
});

/**
 * @desc    Update restaurant
 * @route   PUT /api/restaurants/:id
 * @access  Private
 */
const updateRestaurant = asyncHandler(async (req, res) => {
    const { name, description, cuisine, address, contact, operatingHours, settings, logo, coverImage } = req.body;

    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return res.status(404).json({
            success: false,
            message: 'Restaurant not found'
        });
    }

    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this restaurant'
        });
    }

    restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        { name, description, cuisine, address, contact, operatingHours, settings, logo, coverImage },
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Restaurant updated successfully',
        data: { restaurant }
    });
});

/**
 * @desc    Delete restaurant
 * @route   DELETE /api/restaurants/:id
 * @access  Private
 */
const deleteRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return res.status(404).json({
            success: false,
            message: 'Restaurant not found'
        });
    }

    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this restaurant'
        });
    }

    // Delete all related data
    await Dish.deleteMany({ restaurant: restaurant._id });
    await Category.deleteMany({ restaurant: restaurant._id });
    await Table.deleteMany({ restaurant: restaurant._id });

    await restaurant.deleteOne();

    // Remove restaurant from user
    req.user.restaurant = undefined;
    await req.user.save();

    res.json({
        success: true,
        message: 'Restaurant deleted successfully'
    });
});

/**
 * @desc    Get restaurant menu (Public)
 * @route   GET /api/restaurants/:id/menu
 * @access  Public
 */
const getRestaurantMenu = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant || !restaurant.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Restaurant not found'
        });
    }

    // Get categories with dishes
    const categories = await Category.find({
        restaurant: restaurant._id,
        isActive: true
    }).sort('displayOrder');

    const dishes = await Dish.find({
        restaurant: restaurant._id,
        isAvailable: true
    }).sort('displayOrder');

    // Group dishes by category
    const menu = categories.map(category => ({
        category: {
            id: category._id,
            name: category.name,
            description: category.description,
            icon: category.icon,
            image: category.image
        },
        dishes: dishes.filter(dish =>
            dish.category && dish.category.toString() === category._id.toString()
        ).map(dish => ({
            id: dish._id,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            currency: dish.currency,
            modelUrl: dish.modelUrl,
            thumbnailUrl: dish.thumbnailUrl,
            isVeg: dish.isVeg,
            isVegan: dish.isVegan,
            spiceLevel: dish.spiceLevel,
            isFeatured: dish.isFeatured,
            isPopular: dish.isPopular,
            processingStatus: dish.processingStatus
        }))
    }));

    // Add uncategorized dishes
    const uncategorizedDishes = dishes.filter(dish => !dish.category);
    if (uncategorizedDishes.length > 0) {
        menu.push({
            category: {
                id: 'uncategorized',
                name: 'Other Items',
                description: ''
            },
            dishes: uncategorizedDishes.map(dish => ({
                id: dish._id,
                name: dish.name,
                description: dish.description,
                price: dish.price,
                currency: dish.currency,
                modelUrl: dish.modelUrl,
                thumbnailUrl: dish.thumbnailUrl,
                isVeg: dish.isVeg,
                isVegan: dish.isVegan,
                spiceLevel: dish.spiceLevel,
                isFeatured: dish.isFeatured,
                isPopular: dish.isPopular,
                processingStatus: dish.processingStatus
            }))
        });
    }

    res.json({
        success: true,
        data: {
            restaurant: {
                id: restaurant._id,
                name: restaurant.name,
                description: restaurant.description,
                logo: restaurant.logo,
                coverImage: restaurant.coverImage,
                settings: restaurant.settings
            },
            menu
        }
    });
});

module.exports = {
    createRestaurant,
    getAllRestaurants,
    getRestaurant,
    getMyRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantMenu
};
