const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware to protect routes with JWT authentication
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check for token in cookies
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            const user = await User.findById(decoded.id).populate('restaurant');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User account is deactivated'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired'
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to restrict access to specific roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

/**
 * Middleware to check if user owns the restaurant
 */
const checkRestaurantOwnership = async (req, res, next) => {
    try {
        const restaurantId = req.params.restaurantId || req.body.restaurant;

        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant ID is required'
            });
        }

        // Admin can access all restaurants
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user owns this restaurant
        if (req.user.restaurant && req.user.restaurant._id.toString() !== restaurantId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this restaurant'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    protect,
    authorize,
    checkRestaurantOwnership
};
