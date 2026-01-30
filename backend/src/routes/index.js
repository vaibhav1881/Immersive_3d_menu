const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const dishRoutes = require('./dishRoutes');
const categoryRoutes = require('./categoryRoutes');
const tableRoutes = require('./tableRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/dishes', dishRoutes);
router.use('/categories', categoryRoutes);
router.use('/tables', tableRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
