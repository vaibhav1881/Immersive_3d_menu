const { Table, Restaurant } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Create a new table
 * @route   POST /api/tables
 * @access  Private
 */
const createTable = asyncHandler(async (req, res) => {
    const { number, name, capacity, location } = req.body;

    const restaurant = req.user.restaurant;
    if (!restaurant) {
        return res.status(400).json({
            success: false,
            message: 'You need to create a restaurant first'
        });
    }

    // Check if table number already exists
    const existingTable = await Table.findOne({
        restaurant: restaurant._id,
        number
    });

    if (existingTable) {
        return res.status(400).json({
            success: false,
            message: 'Table with this number already exists'
        });
    }

    const table = await Table.create({
        number,
        name,
        capacity,
        location,
        restaurant: restaurant._id
    });

    res.status(201).json({
        success: true,
        message: 'Table created successfully',
        data: { table }
    });
});

/**
 * @desc    Get all tables for a restaurant
 * @route   GET /api/tables
 * @access  Private
 */
const getTables = asyncHandler(async (req, res) => {
    const restaurant = req.user.restaurant;
    if (!restaurant) {
        return res.status(400).json({
            success: false,
            message: 'You need to create a restaurant first'
        });
    }

    const tables = await Table.find({ restaurant: restaurant._id })
        .sort('number');

    res.json({
        success: true,
        data: { tables }
    });
});

/**
 * @desc    Get single table
 * @route   GET /api/tables/:id
 * @access  Private
 */
const getTable = asyncHandler(async (req, res) => {
    const table = await Table.findById(req.params.id).populate('restaurant', 'name');

    if (!table) {
        return res.status(404).json({
            success: false,
            message: 'Table not found'
        });
    }

    res.json({
        success: true,
        data: { table }
    });
});

/**
 * @desc    Update table
 * @route   PUT /api/tables/:id
 * @access  Private
 */
const updateTable = asyncHandler(async (req, res) => {
    const { number, name, capacity, location, isActive } = req.body;

    let table = await Table.findById(req.params.id);

    if (!table) {
        return res.status(404).json({
            success: false,
            message: 'Table not found'
        });
    }

    // Check ownership
    const restaurant = req.user.restaurant;
    if (table.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this table'
        });
    }

    table = await Table.findByIdAndUpdate(
        req.params.id,
        { number, name, capacity, location, isActive },
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Table updated successfully',
        data: { table }
    });
});

/**
 * @desc    Delete table
 * @route   DELETE /api/tables/:id
 * @access  Private
 */
const deleteTable = asyncHandler(async (req, res) => {
    const table = await Table.findById(req.params.id);

    if (!table) {
        return res.status(404).json({
            success: false,
            message: 'Table not found'
        });
    }

    // Check ownership
    const restaurant = req.user.restaurant;
    if (table.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this table'
        });
    }

    await table.deleteOne();

    res.json({
        success: true,
        message: 'Table deleted successfully'
    });
});

/**
 * @desc    Regenerate QR code for table
 * @route   POST /api/tables/:id/regenerate-qr
 * @access  Private
 */
const regenerateQR = asyncHandler(async (req, res) => {
    const table = await Table.findById(req.params.id);

    if (!table) {
        return res.status(404).json({
            success: false,
            message: 'Table not found'
        });
    }

    // Check ownership
    const restaurant = req.user.restaurant;
    if (table.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to regenerate QR for this table'
        });
    }

    await table.regenerateQR();

    res.json({
        success: true,
        message: 'QR code regenerated successfully',
        data: { table }
    });
});

/**
 * @desc    Bulk create tables
 * @route   POST /api/tables/bulk
 * @access  Private
 */
const bulkCreateTables = asyncHandler(async (req, res) => {
    const { count, startNumber = 1, location = 'indoor' } = req.body;

    if (!count || count < 1 || count > 100) {
        return res.status(400).json({
            success: false,
            message: 'Count must be between 1 and 100'
        });
    }

    const restaurant = req.user.restaurant;
    if (!restaurant) {
        return res.status(400).json({
            success: false,
            message: 'You need to create a restaurant first'
        });
    }

    const tables = [];

    for (let i = 0; i < count; i++) {
        const tableNumber = (parseInt(startNumber) + i).toString();

        // Check if table doesn't already exist
        const existingTable = await Table.findOne({
            restaurant: restaurant._id,
            number: tableNumber
        });

        if (!existingTable) {
            const table = await Table.create({
                number: tableNumber,
                location,
                restaurant: restaurant._id
            });
            tables.push(table);
        }
    }

    res.status(201).json({
        success: true,
        message: `${tables.length} tables created successfully`,
        data: { tables }
    });
});

module.exports = {
    createTable,
    getTables,
    getTable,
    updateTable,
    deleteTable,
    regenerateQR,
    bulkCreateTables
};
