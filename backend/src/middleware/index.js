const { protect, authorize, checkRestaurantOwnership } = require('./auth');
const { errorHandler, asyncHandler, notFound } = require('./errorHandler');
const {
    handleValidation,
    validateRegister,
    validateLogin,
    validateRestaurant,
    validateDish,
    validateCategory,
    validateTable,
    validateMongoId
} = require('./validation');

module.exports = {
    // Auth
    protect,
    authorize,
    checkRestaurantOwnership,

    // Error handling
    errorHandler,
    asyncHandler,
    notFound,

    // Validation
    handleValidation,
    validateRegister,
    validateLogin,
    validateRestaurant,
    validateDish,
    validateCategory,
    validateTable,
    validateMongoId
};
