const { Category, Dish } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private
 */
const createCategory = asyncHandler(async (req, res) => {
    const { name, description, icon, image, displayOrder } = req.body;

    const restaurant = req.user.restaurant;
    if (!restaurant) {
        return res.status(400).json({
            success: false,
            message: 'You need to create a restaurant first'
        });
    }

    // Check if category with same name exists
    const existingCategory = await Category.findOne({
        restaurant: restaurant._id,
        name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
        return res.status(400).json({
            success: false,
            message: 'Category with this name already exists'
        });
    }

    const category = await Category.create({
        name,
        description,
        icon,
        image,
        displayOrder,
        restaurant: restaurant._id
    });

    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
    });
});

/**
 * @desc    Get all categories for a restaurant
 * @route   GET /api/categories
 * @access  Private
 */
const getCategories = asyncHandler(async (req, res) => {
    const restaurant = req.user.restaurant;
    if (!restaurant) {
        return res.status(400).json({
            success: false,
            message: 'You need to create a restaurant first'
        });
    }

    const categories = await Category.find({ restaurant: restaurant._id })
        .sort('displayOrder');

    // Get dish count for each category
    const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
            const dishCount = await Dish.countDocuments({ category: category._id });
            return {
                ...category.toObject(),
                dishCount
            };
        })
    );

    res.json({
        success: true,
        data: { categories: categoriesWithCount }
    });
});

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Private
 */
const getCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        });
    }

    // Get dishes in category
    const dishes = await Dish.find({ category: category._id })
        .sort('displayOrder');

    res.json({
        success: true,
        data: { category, dishes }
    });
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private
 */
const updateCategory = asyncHandler(async (req, res) => {
    const { name, description, icon, image, displayOrder, isActive } = req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        });
    }

    // Check ownership
    const restaurant = req.user.restaurant;
    if (category.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this category'
        });
    }

    category = await Category.findByIdAndUpdate(
        req.params.id,
        { name, description, icon, image, displayOrder, isActive },
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Category updated successfully',
        data: { category }
    });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        });
    }

    // Check ownership
    const restaurant = req.user.restaurant;
    if (category.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this category'
        });
    }

    // Remove category from dishes (don't delete dishes)
    await Dish.updateMany(
        { category: category._id },
        { $unset: { category: 1 } }
    );

    await category.deleteOne();

    res.json({
        success: true,
        message: 'Category deleted successfully'
    });
});

/**
 * @desc    Reorder categories
 * @route   PUT /api/categories/reorder
 * @access  Private
 */
const reorderCategories = asyncHandler(async (req, res) => {
    const { order } = req.body; // Array of { id, displayOrder }

    if (!Array.isArray(order)) {
        return res.status(400).json({
            success: false,
            message: 'Order must be an array'
        });
    }

    const restaurant = req.user.restaurant;

    // Update each category's display order
    await Promise.all(
        order.map(item =>
            Category.findOneAndUpdate(
                { _id: item.id, restaurant: restaurant._id },
                { displayOrder: item.displayOrder }
            )
        )
    );

    const categories = await Category.find({ restaurant: restaurant._id })
        .sort('displayOrder');

    res.json({
        success: true,
        message: 'Categories reordered successfully',
        data: { categories }
    });
});

module.exports = {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
};
