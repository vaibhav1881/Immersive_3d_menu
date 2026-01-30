const { validationResult, body, param, query } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages
        });
    }

    next();
};

// Auth validations
const validateRegister = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    handleValidation
];

const validateLogin = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidation
];

// Restaurant validations
const validateRestaurant = [
    body('name').trim().notEmpty().withMessage('Restaurant name is required'),
    handleValidation
];

// Dish validations
const validateDish = [
    body('name').trim().notEmpty().withMessage('Dish name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    handleValidation
];

// Category validations
const validateCategory = [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    handleValidation
];

// Table validations
const validateTable = [
    body('number').trim().notEmpty().withMessage('Table number is required'),
    handleValidation
];

// MongoDB ID validation
const validateMongoId = (paramName) => [
    param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
    handleValidation
];

module.exports = {
    handleValidation,
    validateRegister,
    validateLogin,
    validateRestaurant,
    validateDish,
    validateCategory,
    validateTable,
    validateMongoId
};
